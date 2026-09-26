// Import-time work that needs a browser: reading book metadata, counting
// pages, and converting non-EPUB text formats into EPUB.

import { makeBook } from '../foliate-js/view.js'
import { SectionProgress } from '../foliate-js/progress.js'
import { post, handle } from './bridge.js'
import { loadFile, decodeText } from './files.js'
import { titleOf, authorOf, titleFromFileName } from './metadata.js'
import { buildEPUB, splitChapters } from './convert/epub.js'
import { docxToHTML } from './convert/docx.js'
import { docToText } from './convert/doc.js'
import { textToHTML, parseRTF } from './convert/text.js'
import { coverOf } from './cover.js'

export const NATIVE = new Set(['epub', 'pdf', 'mobi', 'azw3', 'azw', 'prc', 'fb2', 'fbz', 'cbz'])
export const CONVERTED = new Set(['docx', 'doc', 'txt', 'md', 'markdown', 'rtf', 'html', 'htm'])

const base64ToBlob = (b64, type) => {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type })
}

/** Page count as the reader will show it: PDF pages, or 1500-character "pages" for reflowable books. */
const countPages = book => {
    if (book.rendition?.layout === 'pre-paginated') return book.sections.length
    const progress = new SectionProgress(book.sections, 1500, 1600)
    return Math.max(1, Math.ceil(progress.sizeTotal / 1500))
}

const describe = (book, name) => ({
    title: titleOf(book.metadata) || titleFromFileName(name),
    author: authorOf(book.metadata),
    language: typeof book.metadata?.language === 'string' ? book.metadata.language : '',
    pages: countPages(book),
})

const toHTML = async (ext, file) => {
    const buffer = await file.arrayBuffer()
    switch (ext) {
        case 'docx': return docxToHTML(buffer)
        case 'doc': return { html: textToHTML(docToText(buffer)) }
        case 'rtf': return parseRTF(decodeText(buffer))
        case 'html': case 'htm': {
            const doc = new DOMParser().parseFromString(decodeText(buffer), 'text/html')
            return { html: doc.body?.innerHTML ?? '', title: doc.title?.trim() }
        }
        default: return { html: textToHTML(decodeText(buffer)) }
    }
}

handle('import', async ({ url, name, ext }) => {
    post('import-progress', { stage: 'reading', fraction: 0.35 })
    const file = await loadFile(url, name)

    if (NATIVE.has(ext)) {
        const book = await makeBook(file)
        post('import-progress', { stage: 'chapters', fraction: 0.7 })
        const result = describe(book, name)
        post('import-progress', { stage: 'chapters', fraction: 0.8 })
        const cover = await coverOf(book)
        book.destroy?.()
        return { ...result, cover, converted: null }
    }

    if (!CONVERTED.has(ext)) throw new Error('Unsupported format')

    post('import-progress', { stage: 'converting', fraction: 0.5 })
    const { html, title: docTitle, author: docAuthor } = await toHTML(ext, file)
    if (!html.replace(/<[^>]+>/g, '').trim()) throw new Error('This file has no readable text')
    const title = docTitle || titleFromFileName(name)
    const chapters = splitChapters(html, title)
    post('import-progress', { stage: 'chapters', fraction: 0.75 })
    const epub = await buildEPUB({ title, author: docAuthor ?? '', chapters })
    const book = await makeBook(new File([base64ToBlob(epub, 'application/epub+zip')], 'converted.epub'))
    return { ...describe(book, name), title, author: docAuthor ?? '', cover: await coverOf(book), converted: epub }
})

// Cover for a book imported before covers existed (run in the background).
handle('cover', async ({ url, name }) => {
    const book = await makeBook(await loadFile(url, name))
    const cover = await coverOf(book)
    book.destroy?.()
    return { cover }
})
