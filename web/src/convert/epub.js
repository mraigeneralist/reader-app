// Builds a minimal EPUB 3 from HTML chapters, so formats without a native
// reader (DOCX, DOC, TXT, RTF, Markdown, HTML) render through the same EPUB
// engine and get CFI-based positions, highlights and selection for free.

import JSZip from 'jszip'

const escapeXML = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const serializer = new XMLSerializer()

/** Turn an HTML fragment string into well-formed XHTML body markup. */
export const toXHTML = html => {
    const doc = new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html')
    for (const el of doc.querySelectorAll('script, style, iframe, object, embed, form, input, button'))
        el.remove()
    for (const el of doc.querySelectorAll('*'))
        for (const attr of [...el.attributes])
            if (attr.name.startsWith('on')) el.removeAttribute(attr.name)
    return [...doc.body.childNodes].map(n => serializer.serializeToString(n)).join('')
        // XMLSerializer adds the XHTML namespace on each top-level element; the document declares it once.
        .replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '')
}

const chapterDoc = (title, body, lang) => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}" xml:lang="${lang}">
<head><meta charset="utf-8"/><title>${escapeXML(title)}</title></head>
<body>${body}</body>
</html>`

/**
 * Split HTML into chapters at headings. Uses the highest heading level that
 * appears more than once; falls back to size-based splitting for long text.
 */
export const splitChapters = (html, fallbackTitle) => {
    const doc = new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html')
    const nodes = [...doc.body.childNodes]
    const level = ['h1', 'h2', 'h3'].find(tag => doc.body.querySelectorAll(`:scope > ${tag}`).length > 1)
    const chapters = []
    let current = { title: '', nodes: [] }
    const flush = () => {
        if (current.nodes.some(n => n.textContent.trim() || n.nodeName === 'IMG' || n.querySelector?.('img')))
            chapters.push(current)
    }
    let size = 0
    for (const node of nodes) {
        const isHeading = level && node.nodeName.toLowerCase() === level
        // Very long sections without headings are split so pages stay fast to lay out.
        const tooLong = !level && size > 40000 && node.nodeName === 'P'
        if (isHeading || tooLong) {
            flush()
            current = { title: isHeading ? node.textContent.trim() : '', nodes: [] }
            size = 0
        }
        current.nodes.push(node)
        size += node.textContent.length
    }
    flush()
    if (!chapters.length) chapters.push({ title: fallbackTitle, nodes })
    return chapters.map((c, i) => ({
        title: c.title || (chapters.length === 1 ? fallbackTitle : `Part ${i + 1}`),
        html: c.nodes.map(n => serializer.serializeToString(n)).join('')
            .replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, ''),
    }))
}

/**
 * @param {{ title: string, author?: string, lang?: string, chapters: { title: string, html: string }[] }} book
 * @returns {Promise<string>} base64 EPUB
 */
export const buildEPUB = async ({ title, author = '', lang = 'en', chapters }) => {
    const zip = new JSZip()
    // mimetype must be the first entry and stored uncompressed.
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`)

    const items = chapters.map((c, i) => ({ ...c, id: `ch${String(i + 1).padStart(3, '0')}` }))
    for (const c of items)
        zip.file(`OEBPS/${c.id}.xhtml`, chapterDoc(c.title, toXHTML(c.html), lang))

    zip.file('OEBPS/nav.xhtml', chapterDoc(title, `<nav epub:type="toc"><ol>${
        items.map(c => `<li><a href="${c.id}.xhtml">${escapeXML(c.title)}</a></li>`).join('')
    }</ol></nav>`, lang))

    const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="uid">urn:folio:${Date.now()}</dc:identifier>
<dc:title>${escapeXML(title)}</dc:title>
${author ? `<dc:creator>${escapeXML(author)}</dc:creator>` : ''}
<dc:language>${lang}</dc:language>
<meta property="dcterms:modified">${modified}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${items.map(c => `<item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('\n')}
</manifest>
<spine>
${items.map(c => `<itemref idref="${c.id}"/>`).join('\n')}
</spine>
</package>`)

    return zip.generateAsync({ type: 'base64', mimeType: 'application/epub+zip', compression: 'DEFLATE' })
}
