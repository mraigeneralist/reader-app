// Plain text, Markdown-ish text and RTF -> HTML paragraphs.

const escapeHTML = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// A short line that reads like a chapter heading.
const HEADING = /^(chapter|part|book|prologue|epilogue|introduction|preface|afterword|appendix)\b[\s\S]{0,80}$/i

/**
 * Paragraphs are separated by blank lines. If a file has no blank lines at
 * all, each line is its own paragraph.
 */
export const textToHTML = text => {
    const normalized = text.replace(/\r\n?/g, '\n').replace(/ /g, ' ')
    const hasBlankLines = /\n[ \t]*\n/.test(normalized)
    const blocks = hasBlankLines ? normalized.split(/\n[ \t]*\n+/) : normalized.split('\n')
    return blocks
        .map(b => b.trim())
        .filter(Boolean)
        .map(b => {
            const md = b.match(/^(#{1,3})\s+(.+)$/)
            if (md) return `<h${md[1].length}>${escapeHTML(md[2])}</h${md[1].length}>`
            if (!b.includes('\n') && HEADING.test(b)) return `<h2>${escapeHTML(b)}</h2>`
            return `<p>${escapeHTML(b).replace(/\n/g, '<br/>')}</p>`
        })
        .join('\n')
}

// --- RTF -------------------------------------------------------------------

// Destination groups whose text is not document content.
const SKIP_DESTINATIONS = new Set([
    'fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'object', 'header', 'footer',
    'headerl', 'headerr', 'footerl', 'footerr', 'footnote', 'field', 'fldinst', 'themedata',
    'colorschememapping', 'latentstyles', 'datastore', 'xmlnstbl', 'listtable', 'listoverridetable',
    'rsidtbl', 'generator', 'pgdsctbl', 'revtbl', 'filetbl',
])

/**
 * Minimal RTF reader: extracts paragraphs and the \info title/author.
 * Formatting (fonts, bold, tables) is not kept.
 */
export const parseRTF = rtf => {
    const out = []
    let para = ''
    const info = { title: '', author: '' }
    const stack = [{ skip: false, uc: 1, dest: '' }]
    let i = 0
    let skipChars = 0
    const top = () => stack[stack.length - 1]
    const emit = ch => {
        const t = top()
        if (t.skip) return
        if (skipChars > 0) { skipChars--; return }
        if (t.dest === 'title') info.title += ch
        else if (t.dest === 'author') info.author += ch
        else para += ch
    }
    const endPara = () => { out.push(para); para = '' }
    while (i < rtf.length) {
        const c = rtf[i]
        if (c === '{') { stack.push({ ...top(), dest: top().dest }); i++; continue }
        if (c === '}') { if (stack.length > 1) stack.pop(); i++; continue }
        if (c === '\\') {
            const next = rtf[i + 1]
            if (next === '\\' || next === '{' || next === '}') { emit(next); i += 2; continue }
            if (next === '\'') {
                emit(new TextDecoder('windows-1252').decode(new Uint8Array([parseInt(rtf.substr(i + 2, 2), 16)])))
                i += 4
                continue
            }
            if (next === '*') { top().skip = true; i += 2; continue }
            if (next === '~') { emit(' '); i += 2; continue }
            if (next === '\n' || next === '\r') { endPara(); i += 2; continue }
            const m = /^\\([a-zA-Z]+)(-?\d+)? ?/.exec(rtf.slice(i, i + 40))
            if (!m) { i += 2; continue }
            const [whole, word, arg] = m
            i += whole.length
            if (SKIP_DESTINATIONS.has(word)) {
                if (word === 'info') top().dest = 'info'
                else top().skip = true
                continue
            }
            if (top().dest === 'info' && (word === 'title' || word === 'author')) { top().dest = word; continue }
            switch (word) {
                case 'par': case 'line': case 'sect': case 'page': endPara(); break
                case 'tab': emit('\t'); break
                case 'emdash': emit('—'); break
                case 'endash': emit('–'); break
                case 'lquote': emit('‘'); break
                case 'rquote': emit('’'); break
                case 'ldblquote': emit('“'); break
                case 'rdblquote': emit('”'); break
                case 'bullet': emit('•'); break
                case 'uc': top().uc = Number(arg ?? 1); break
                case 'u': {
                    let code = Number(arg)
                    if (code < 0) code += 65536
                    emit(String.fromCharCode(code))
                    skipChars = top().uc
                    break
                }
            }
            continue
        }
        if (c === '\n' || c === '\r') { i++; continue }
        emit(c)
        i++
    }
    endPara()
    const html = out.map(p => p.trim()).filter(Boolean)
        .map(p => HEADING.test(p) && p.length < 80 ? `<h2>${escapeHTML(p)}</h2>` : `<p>${escapeHTML(p)}</p>`)
        .join('\n')
    return { html, title: info.title.trim(), author: info.author.trim() }
}
