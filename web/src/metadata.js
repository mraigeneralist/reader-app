// foliate-js metadata follows Readium's webpub manifest: titles may be a
// string or a { lang: string } map, contributors a string, object or array.

const pickLang = value => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') return value.en ?? Object.values(value)[0] ?? ''
    return String(value)
}

const contributorName = c => typeof c === 'string' ? c : pickLang(c?.name)

export const titleOf = metadata => pickLang(metadata?.title).trim()

export const authorOf = metadata => {
    const author = metadata?.author
    const list = Array.isArray(author) ? author : author ? [author] : []
    return list.map(contributorName).filter(Boolean).join(', ').trim()
}

/** "the-cartographers-daughter.epub" -> "The Cartographers Daughter" */
export const titleFromFileName = name => {
    const base = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
    return base.replace(/\b\w/g, c => c.toUpperCase()) || 'Untitled'
}
