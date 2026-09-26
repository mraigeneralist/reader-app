// Legacy Word 97-2003 (.doc) -> paragraphs.
//
// A .doc is a Compound File (a small FAT filesystem). The text lives in the
// "WordDocument" stream; the piece table in the "0Table"/"1Table" stream maps
// character positions to byte ranges (8-bit cp1252 or UTF-16). Only the main
// document text is extracted; formatting, footnotes and headers are dropped.

const SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
const END_OF_CHAIN = 0xfffffffe

const readCompoundFile = buffer => {
    const view = new DataView(buffer)
    const bytes = new Uint8Array(buffer)
    if (!SIGNATURE.every((b, i) => bytes[i] === b)) throw new Error('Not a Word 97-2003 document')

    const sectorSize = 1 << view.getUint16(0x1e, true)
    const miniSectorSize = 1 << view.getUint16(0x20, true)
    const firstDirSector = view.getUint32(0x30, true)
    const miniCutoff = view.getUint32(0x38, true)
    const firstMiniFatSector = view.getUint32(0x3c, true)
    let difatSector = view.getUint32(0x44, true)
    const offsetOf = sector => (sector + 1) * sectorSize
    const u32PerSector = sectorSize / 4

    // Locate every FAT sector through the DIFAT.
    const fatSectors = []
    for (let i = 0; i < 109; i++) {
        const s = view.getUint32(0x4c + i * 4, true)
        if (s < END_OF_CHAIN) fatSectors.push(s)
    }
    for (let guard = 0; difatSector < END_OF_CHAIN && guard < 10000; guard++) {
        const base = offsetOf(difatSector)
        for (let i = 0; i < u32PerSector - 1; i++) {
            const s = view.getUint32(base + i * 4, true)
            if (s < END_OF_CHAIN) fatSectors.push(s)
        }
        difatSector = view.getUint32(base + (u32PerSector - 1) * 4, true)
    }
    const fat = new Uint32Array(fatSectors.length * u32PerSector)
    fatSectors.forEach((s, i) => {
        for (let j = 0; j < u32PerSector; j++) fat[i * u32PerSector + j] = view.getUint32(offsetOf(s) + j * 4, true)
    })

    const chain = (start, table) => {
        const out = []
        for (let s = start; s < END_OF_CHAIN && out.length < table.length; s = table[s]) out.push(s)
        return out
    }
    const readChain = (start, size) => {
        const out = new Uint8Array(size)
        let pos = 0
        for (const s of chain(start, fat)) {
            const n = Math.min(sectorSize, size - pos)
            if (n <= 0) break
            out.set(bytes.subarray(offsetOf(s), offsetOf(s) + n), pos)
            pos += n
        }
        return out
    }

    // Directory entries (128 bytes each).
    const dirBytes = readChain(firstDirSector, chain(firstDirSector, fat).length * sectorSize)
    const dirView = new DataView(dirBytes.buffer)
    const entries = []
    for (let off = 0; off + 128 <= dirBytes.length; off += 128) {
        const nameLen = dirView.getUint16(off + 0x40, true)
        const type = dirBytes[off + 0x42]
        if (!type || nameLen < 2) continue
        const name = new TextDecoder('utf-16le').decode(dirBytes.subarray(off, off + nameLen - 2))
        entries.push({ name, type, start: dirView.getUint32(off + 0x74, true), size: dirView.getUint32(off + 0x78, true) })
    }
    const root = entries.find(e => e.type === 5)

    let miniStream, miniFat
    const readStream = name => {
        const entry = entries.find(e => e.name === name)
        if (!entry) return null
        if (entry.size >= miniCutoff) return readChain(entry.start, entry.size)
        miniStream ??= readChain(root.start, root.size)
        if (!miniFat) {
            const sectors = chain(firstMiniFatSector, fat)
            const raw = readChain(firstMiniFatSector, sectors.length * sectorSize)
            miniFat = new Uint32Array(raw.buffer, 0, raw.length / 4)
        }
        const out = new Uint8Array(entry.size)
        let pos = 0
        for (const s of chain(entry.start, miniFat)) {
            const n = Math.min(miniSectorSize, entry.size - pos)
            if (n <= 0) break
            out.set(miniStream.subarray(s * miniSectorSize, s * miniSectorSize + n), pos)
            pos += n
        }
        return out
    }
    return { readStream }
}

const cleanWordText = text => {
    let out = ''
    let fieldDepth = 0
    let inFieldCode = []
    for (const ch of text) {
        const c = ch.charCodeAt(0)
        if (c === 0x13) { fieldDepth++; inFieldCode.push(true); continue }       // field begin
        if (c === 0x14) { inFieldCode[inFieldCode.length - 1] = false; continue } // field separator: result follows
        if (c === 0x15) { fieldDepth = Math.max(0, fieldDepth - 1); inFieldCode.pop(); continue }
        if (inFieldCode.some(Boolean)) continue
        if (c === 0x0d || c === 0x0c || c === 0x07) out += '\n'
        else if (c === 0x0b) out += '\n'
        else if (c === 0x09) out += '\t'
        else if (c === 0x1e) out += '-'
        else if (c === 0x1f || c === 0x01 || c === 0x08 || c < 0x09) continue
        else out += ch
    }
    return out
}

/** @returns {string} plain text, one paragraph per line */
export const docToText = buffer => {
    const { readStream } = readCompoundFile(buffer)
    const word = readStream('WordDocument')
    if (!word) throw new Error('No WordDocument stream')
    const fib = new DataView(word.buffer, word.byteOffset, word.byteLength)
    if (fib.getUint16(0, true) !== 0xa5ec) throw new Error('Unrecognised Word file')
    const flags = fib.getUint16(0x0a, true)
    if (flags & 0x0100) throw new Error('This document is password-protected')
    const table = readStream(flags & 0x0200 ? '1Table' : '0Table')
    if (!table) throw new Error('No table stream')

    const ccpText = fib.getUint32(0x4c, true)
    const fcClx = fib.getUint32(0x1a2, true)
    const lcbClx = fib.getUint32(0x1a6, true)
    const clx = new DataView(table.buffer, table.byteOffset + fcClx, lcbClx)

    // Skip Prc blocks (0x01) to reach the piece table (0x02).
    let pos = 0
    while (pos < lcbClx && clx.getUint8(pos) === 0x01) pos += 3 + clx.getInt16(pos + 1, true)
    if (clx.getUint8(pos) !== 0x02) throw new Error('Piece table not found')
    const lcb = clx.getUint32(pos + 1, true)
    const plc = pos + 5
    const n = (lcb - 4) / 12

    let text = ''
    const cp1252 = new TextDecoder('windows-1252')
    const utf16 = new TextDecoder('utf-16le')
    for (let i = 0; i < n && text.length < ccpText; i++) {
        const cpStart = clx.getUint32(plc + i * 4, true)
        const cpEnd = clx.getUint32(plc + (i + 1) * 4, true)
        const pcd = plc + (n + 1) * 4 + i * 8
        const fcRaw = clx.getUint32(pcd + 2, true)
        const count = Math.min(cpEnd, ccpText) - cpStart
        if (count <= 0) continue
        if (fcRaw & 0x40000000) {
            const fc = (fcRaw & ~0x40000000) / 2
            text += cp1252.decode(word.subarray(fc, fc + count))
        } else {
            text += utf16.decode(word.subarray(fcRaw, fcRaw + count * 2))
        }
    }
    return cleanWordText(text)
}
