// Reading local book files. The page is loaded from file://, and Android's
// WebView doesn't let fetch() read file:// URLs, but XHR can when universal
// file access is on (set on the RN side).

export const loadFile = (url, name) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'arraybuffer'
    xhr.onload = () => {
        // file:// requests report status 0 on success
        if ((xhr.status === 0 || xhr.status === 200) && xhr.response?.byteLength)
            resolve(new File([xhr.response], name))
        else reject(new Error(`Could not read ${name} (status ${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error(`Could not read ${name}`))
    xhr.send()
})

export const blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',', 2)[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
})

/** Decode text as UTF-8, falling back to Windows-1252 for legacy files. */
export const decodeText = buffer => {
    const bytes = new Uint8Array(buffer)
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes)
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes)
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
        return new TextDecoder('windows-1252').decode(bytes)
    }
}
