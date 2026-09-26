// The book view: wraps foliate-js's <foliate-view> and reports position,
// table of contents and taps back to React Native.

import '../foliate-js/view.js'
import { post, handle } from './bridge.js'
import { loadFile } from './files.js'
import { titleOf, authorOf } from './metadata.js'
import { FONT_FACES } from './fonts.js'
import { attach, clearSelection, setHighlights, tappedHighlightRecently } from './annotations.js'

let view = null
let prefs = null

const THEMES = {
    light: { bg: '#FFFFFF', ink: '#0A0A0A' },
    sepia: { bg: '#F8DCA4', ink: '#0A0A0A' },
    dark: { bg: '#0A0A0A', ink: '#FFFFFF' },
}
const LINE_HEIGHTS = { tight: 1.35, normal: 1.55, relaxed: 1.8 }
const FONT_STACKS = {
    archivo: `'Archivo', 'Helvetica Neue', Arial, sans-serif`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
}

/** CSS injected into every section of a reflowable book. */
const bookCSS = p => {
    const t = THEMES[p.theme] ?? THEMES.light
    const font = FONT_STACKS[p.font] ?? FONT_STACKS.archivo
    const lh = LINE_HEIGHTS[p.lineSpacing] ?? LINE_HEIGHTS.normal
    // In sepia/dark, book colours are overridden so text stays readable.
    const recolor = p.theme === 'light' ? '' : `
        *:not(img):not(svg):not(image) { color: ${t.ink} !important; background-color: transparent !important; border-color: ${t.ink} !important; }`
    return `${FONT_FACES}
    @namespace epub "http://www.idpf.org/2007/ops";
    html { color-scheme: ${p.theme === 'dark' ? 'dark' : 'light'}; }
    html, body { color: ${t.ink}; background: transparent !important; }
    body { font-family: ${font} !important; font-size: ${p.fontSize}px !important; }
    p, li, blockquote, dd, div, span, a, em, i, strong, b, td, th, h1, h2, h3, h4, h5, h6 { font-family: ${font} !important; }
    p, li, blockquote, dd, div { line-height: ${lh} !important; letter-spacing: -0.005em; }
    p, li, blockquote, dd { font-size: 1em !important; font-weight: 500; }
    p { text-align: start; hyphens: auto; -webkit-hyphens: auto; }
    a { color: inherit !important; text-decoration-thickness: 2px; }
    img, svg { max-width: 100%; height: auto; }
    ::selection { background: #A9D92A; color: #0A0A0A; }
    ${recolor}`
}

const applyPrefs = () => {
    if (!view?.renderer || !prefs) return
    const t = THEMES[prefs.theme] ?? THEMES.light
    document.body.style.background = t.bg
    if (view.isFixedLayout) {
        // PDFs keep their own page colours; dark mode inverts the rendered page.
        // The fixed-layout renderer can't scroll, so show the whole page.
        view.renderer.setAttribute('zoom', 'fit-page')
        document.documentElement.style.setProperty('--page-filter',
            prefs.theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : prefs.theme === 'sepia' ? 'sepia(0.35)' : 'none')
        return
    }
    const r = view.renderer
    r.setAttribute('flow', prefs.movement === 'scroll' ? 'scrolled' : 'paginated')
    // foliate puts the full gap on each side of a single column: 7% ≈ the design's 28px margins.
    r.setAttribute('gap', '7%')
    r.setAttribute('margin', '8px')
    r.setAttribute('max-inline-size', '720px')
    r.setAttribute('max-column-count', '1')
    if (prefs.movement === 'scroll') r.removeAttribute('animated')
    else r.setAttribute('animated', '')
    r.setStyles?.(bookCSS(prefs))
}

const flattenTOC = (items, depth = 0, out = []) => {
    for (const item of items ?? []) {
        out.push({ label: (item.label ?? '').trim(), href: item.href, depth })
        if (item.subitems?.length) flattenTOC(item.subitems, depth + 1, out)
    }
    return out
}

const pageCount = () => {
    if (view.isFixedLayout) return view.book.sections.length
    return view.lastLocation?.location?.total ?? 0
}

/** Page number where each TOC entry starts. */
const tocWithPages = async () => {
    const toc = flattenTOC(view.book.toc)
    const fractions = view.getSectionFractions()
    const total = pageCount()
    const results = []
    for (const item of toc) {
        let page = null
        try {
            const resolved = await view.resolveNavigation(item.href)
            if (resolved?.index != null) page = view.isFixedLayout
                ? resolved.index + 1
                : Math.floor((fractions[resolved.index] ?? 0) * total) + 1
        } catch {}
        results.push({ ...item, page })
    }
    return results
}

const onRelocate = ({ detail }) => {
    const { cfi, fraction, location, tocItem, section } = detail
    const index = section?.current ?? 0
    let page, pages
    if (view.isFixedLayout) {
        const current = view.renderer.getContents?.()[0]?.index ?? index
        page = current + 1
        pages = view.book.sections.length
    } else {
        page = (location?.current ?? 0) + 1
        pages = location?.total ?? 0
    }
    const lastSection = view.book.sections.length - 1
    const atEnd = view.isFixedLayout
        ? page >= pages
        : !!view.renderer.atEnd && index >= lastSection - (view.book.sections[lastSection]?.linear === 'no' ? 1 : 0)
    post('relocate', {
        cfi,
        fraction: atEnd ? 1 : fraction ?? 0,
        // Page counts are estimates (1500 characters a page); the last screen is always the last page.
        page: !Number.isFinite(page) ? 1 : atEnd && pages ? pages : Math.min(page, pages || page),
        pages: Number.isFinite(pages) ? pages : 0,
        tocLabel: tocItem?.label?.trim() ?? '',
        tocHref: tocItem?.href ?? null,
        atEnd,
    })
}

// Tap zones: left/right quarter turns the page, the middle toggles controls.
// Swipes are handled here for PDFs; foliate's fixed-layout renderer has no
// touch navigation (the reflowable paginator swipes on its own).
const onDocLoad = ({ detail: { doc } }) => {
    let start = null
    let swiped = false
    doc.addEventListener('touchstart', e => {
        const t = e.touches[0]
        start = e.touches.length === 1 ? { x: t.screenX, y: t.screenY, time: Date.now() } : null
        swiped = false
    }, { passive: true })
    doc.addEventListener('touchend', e => {
        if (!start || !view.isFixedLayout) return
        const t = e.changedTouches[0]
        const dx = t.screenX - start.x
        const dy = t.screenY - start.y
        start = null
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiped = true
            if (dx < 0) view.goRight()
            else view.goLeft()
            post('tap', { zone: 'swipe' })
        }
    })
    doc.addEventListener('click', e => {
        if (swiped) { swiped = false; return }
        if (e.defaultPrevented || e.target.closest?.('a[href]')) return
        const selection = doc.getSelection()
        if (selection && !selection.isCollapsed) return
        const width = window.innerWidth || 1
        const x = (e.screenX ?? e.clientX) / width
        const scrolled = prefs?.movement === 'scroll' && !view.isFixedLayout
        const zone = scrolled || (x > 0.25 && x < 0.75) ? 'center' : x <= 0.25 ? 'left' : 'right'
        // Wait a tick: a tap on a highlight is reported by another listener and wins.
        setTimeout(() => {
            if (tappedHighlightRecently()) return
            if (zone === 'left') view.goLeft()
            else if (zone === 'right') view.goRight()
            post('tap', { zone })
        })
    })
}

handle('open', async ({ url, name, location, prefs: p, highlights = [] }) => {
    prefs = p
    const file = await loadFile(url, name)
    view?.close?.()
    view?.remove()
    view = document.createElement('foliate-view')
    document.body.append(view)
    view.addEventListener('relocate', onRelocate)
    view.addEventListener('load', onDocLoad)
    attach(view, highlights)
    await view.open(file)
    applyPrefs()
    await view.init({ lastLocation: location || null, showTextStart: !location })
    const { book } = view
    return {
        title: titleOf(book.metadata),
        author: authorOf(book.metadata),
        fixedLayout: view.isFixedLayout,
        pages: pageCount(),
    }
})

handle('toc', () => tocWithPages())
handle('highlights', ({ items }) => setHighlights(items))
handle('clearSelection', () => clearSelection())
handle('prefs', p => { prefs = p; applyPrefs() })
handle('next', () => view?.next())
handle('prev', () => view?.prev())
handle('goTo', ({ target }) => view?.goTo(target))
handle('goToFraction', ({ fraction }) => view?.isFixedLayout
    ? view.goTo(Math.min(view.book.sections.length - 1, Math.floor(fraction * view.book.sections.length)))
    : view?.goToFraction(fraction))
