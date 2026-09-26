// Cover images: foliate's book.getCover() gives the embedded cover (EPUB,
// MOBI/AZW3, FB2) or a render of page 1 (PDF). It's shrunk to a small JPEG
// so lists stay fast and storage stays small.

import { blobToBase64 } from './files.js'

const MAX_W = 320
const MAX_H = 480

/** @returns {Promise<string|null>} base64 JPEG, or null when the book has no cover */
export const coverOf = async book => {
    let blob
    try {
        blob = await book.getCover?.()
    } catch (e) {
        console.warn(`No cover: ${e.message}`)
        return null
    }
    if (!blob || !blob.size) return null
    try {
        const bitmap = await createImageBitmap(blob)
        const scale = Math.min(1, MAX_W / bitmap.width, MAX_H / bitmap.height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(bitmap.width * scale))
        canvas.height = Math.max(1, Math.round(bitmap.height * scale))
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF' // transparent PNG covers get a paper background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close?.()
        const jpeg = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
        return jpeg ? blobToBase64(jpeg) : null
    } catch (e) {
        // e.g. SVG covers that can't be decoded to a bitmap
        console.warn(`Cover could not be converted: ${e.message}`)
        return null
    }
}
