// Text selection and highlights inside the book.
//
// - Selection: reports the selected text, whether it's a single word, its CFI
//   and its on-screen rectangle to React Native, which draws the menu.
// - Highlights: reflowable books use foliate's SVG overlayer; PDFs (fixed
//   layout) have no overlayer, so their text-layer spans are wrapped instead.

import { Overlayer } from '../foliate-js/overlayer.js'
import { post } from './bridge.js'

/** cfi -> colour of every highlight in the open book */
let highlights = new Map()
/** Loaded documents by section index (PDF pages need them for painting). */
const docs = new Map()
let view = null
let lastTap = 0

const WORD = /^[\p{L}\p{M}\p{N}'’-]+$/u

/** Rectangle of a range in the top-level page's coordinates (iframes may be offset and scaled). */
export const rectInPage = range => {
    const r = range.getBoundingClientRect()
    const frame = range.startContainer.ownerDocument.defaultView?.frameElement
    if (!frame) return { x: r.left, y: r.top, width: r.width, height: r.height }
    const f = frame.getBoundingClientRect()
    const sx = f.width / (frame.clientWidth || f.width || 1)
    const sy = f.height / (frame.clientHeight || f.height || 1)
    return { x: f.left + r.left * sx, y: f.top + r.top * sy, width: r.width * sx, height: r.height * sy }
}

// --- selection --------------------------------------------------------------

let selectionTimer = null
let hasSelection = false

const reportSelection = (doc, index) => {
    const sel = doc.getSelection()
    const text = sel && !sel.isCollapsed && sel.rangeCount ? sel.toString().trim() : ''
    if (!text) {
        if (hasSelection) post('selection', null)
        hasSelection = false
        return
    }
    const range = sel.getRangeAt(0)
    hasSelection = true
    post('selection', {
        text: text.slice(0, 5000),
        word: WORD.test(text) && text.length <= 40,
        cfi: view.getCFI(index, range),
        rect: rectInPage(range),
    })
}

export const clearSelection = () => {
    for (const doc of docs.values()) doc.getSelection?.()?.removeAllRanges()
    hasSelection = false
}

/** True for ~half a second after a highlight was tapped, so the tap doesn't also turn the page. */
export const tappedHighlightRecently = () => Date.now() - lastTap < 500

// --- PDF painting -----------------------------------------------------------

const PDF_CLASS = 'folio-hl'

const unpaint = (doc, cfi) => {
    for (const el of doc.querySelectorAll(`span.${PDF_CLASS}[data-cfi="${CSS.escape(cfi)}"]`))
        el.replaceWith(...el.childNodes)
    doc.body?.normalize()
}

/** Wraps each text node the range covers in a coloured span (the text layer itself is transparent). */
const paint = (doc, cfi, range, color) => {
    unpaint(doc, cfi)
    const walker = doc.createTreeWalker(range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode, NodeFilter.SHOW_TEXT)
    const nodes = []
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (range.intersectsNode(n)) nodes.push(n)
    for (const node of nodes) {
        const start = node === range.startContainer ? range.startOffset : 0
        const end = node === range.endContainer ? range.endOffset : node.length
        if (end <= start) continue
        const part = doc.createRange()
        part.setStart(node, start)
        part.setEnd(node, end)
        const span = doc.createElement('span')
        span.className = PDF_CLASS
        span.dataset.cfi = cfi
        span.style.cssText = `background:${color};opacity:.45;border-radius:2px;`
        part.surroundContents(span)
    }
}

const paintPdfPage = (index, doc) => {
    // Text layer not rendered yet: the observer paints once it is.
    if (!doc.querySelector('.textLayer span')) return
    for (const [cfi, color] of highlights) {
        try {
            const { index: i, anchor } = view.resolveCFI(cfi)
            if (i !== index) continue
            paint(doc, cfi, anchor(doc), color)
        } catch (e) {
            console.warn(`Could not draw highlight: ${e.message}`)
        }
    }
}

// --- wiring -----------------------------------------------------------------

const drawAll = () => {
    if (view.isFixedLayout) {
        for (const [index, doc] of docs) {
            for (const el of doc.querySelectorAll(`span.${PDF_CLASS}`)) el.replaceWith(...el.childNodes)
            paintPdfPage(index, doc)
        }
    } else {
        for (const [value, color] of highlights) view.addAnnotation({ value, color }).catch?.(() => {})
    }
}

/** Replace the set of highlights (called whenever the list in the database changes). */
export const setHighlights = items => {
    const next = new Map(items.map(i => [i.cfi, i.color]))
    if (view && !view.isFixedLayout)
        for (const value of highlights.keys())
            if (!next.has(value)) view.deleteAnnotation({ value }).catch?.(() => {})
    highlights = next
    if (view) drawAll()
}

/** Attach to a freshly opened <foliate-view>. */
export const attach = (v, items = []) => {
    view = v
    docs.clear()
    highlights = new Map(items.map(i => [i.cfi, i.color]))
    // Solid highlighter yellow behind the text, as in the design.
    view.style.setProperty('--overlayer-highlight-opacity', '1')
    view.style.setProperty('--overlayer-highlight-blend-mode', 'multiply')

    view.addEventListener('load', ({ detail: { doc, index } }) => {
        docs.set(index, doc)
        doc.addEventListener('selectionchange', () => {
            clearTimeout(selectionTimer)
            selectionTimer = setTimeout(() => reportSelection(doc, index), 250)
        })
        if (view.isFixedLayout) {
            // pdf.js fills the text layer after the page loads (and again on
            // zoom), so paint whenever it changes, not just now.
            const layer = doc.querySelector('.textLayer')
            let timer = null
            if (layer) new MutationObserver(records => {
                // Ignore changes made by painting itself.
                if (records.every(r => [...r.addedNodes, ...r.removedNodes]
                    .every(n => n.classList?.contains(PDF_CLASS)))) return
                clearTimeout(timer)
                timer = setTimeout(() => paintPdfPage(index, doc), 150)
            }).observe(layer, { childList: true })
            paintPdfPage(index, doc)
            doc.addEventListener('click', e => {
                const hl = e.target.closest?.(`span.${PDF_CLASS}`)
                if (!hl) return
                lastTap = Date.now()
                const range = doc.createRange()
                range.selectNodeContents(hl)
                post('highlight-tap', { cfi: hl.dataset.cfi, rect: rectInPage(range) })
            })
        }
    })
    view.addEventListener('draw-annotation', ({ detail: { draw, annotation } }) =>
        draw(Overlayer.highlight, { color: annotation.color }))
    // A section's overlay was (re)created: redraw highlights. foliate only
    // draws those that resolve to a section with an overlay, so others are skipped.
    view.addEventListener('create-overlay', () => {
        for (const [value, color] of highlights) view.addAnnotation({ value, color }).catch?.(() => {})
    })
    view.addEventListener('show-annotation', ({ detail: { value, range } }) => {
        lastTap = Date.now()
        post('highlight-tap', { cfi: value, rect: rectInPage(range) })
    })
}
