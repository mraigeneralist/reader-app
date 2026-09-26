// DOCX -> HTML with mammoth (keeps headings, emphasis, lists, tables, images),
// plus title/author from the document's core properties.

import mammoth from 'mammoth/mammoth.browser.js'
import JSZip from 'jszip'

const coreProperty = (xml, tag) => {
    const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml)
    return m ? new DOMParser().parseFromString(m[1], 'text/html').body.textContent.trim() : ''
}

export const docxToHTML = async arrayBuffer => {
    const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer }, {
        // Keep Word's "Title" style as a top heading rather than a paragraph.
        styleMap: ['p[style-name=\'Title\'] => h1:fresh', 'p[style-name=\'Subtitle\'] => h2:fresh'],
    })
    for (const m of messages) if (m.type === 'error') console.warn(`mammoth: ${m.message}`)
    let title = ''
    let author = ''
    try {
        const zip = await JSZip.loadAsync(arrayBuffer)
        const core = await zip.file('docProps/core.xml')?.async('string')
        if (core) {
            title = coreProperty(core, 'dc:title')
            author = coreProperty(core, 'dc:creator')
        }
    } catch {}
    return { html, title, author }
}
