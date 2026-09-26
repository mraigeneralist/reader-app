// Messaging between this WebView page and React Native.
//
// RN -> web: RN calls `window.folio.receive({ id, type, payload })` via injectJavaScript.
//            Requests with an `id` get exactly one reply (`reply`/`error` below).
// web -> RN: `post(type, payload)` sends an event; replies carry the request id.

const send = (msg) => window.ReactNativeWebView?.postMessage(JSON.stringify(msg))

export const post = (type, payload = {}) => send({ type, payload })

const handlers = new Map()

/** Register a handler for a request type. May return a value or a Promise. */
export const handle = (type, fn) => handlers.set(type, fn)

const receive = async ({ id, type, payload }) => {
    const fn = handlers.get(type)
    try {
        if (!fn) throw new Error(`No handler for "${type}"`)
        const result = await fn(payload ?? {})
        if (id != null) send({ id, ok: true, result: result ?? null })
    } catch (e) {
        console.error(e)
        if (id != null) send({ id, ok: false, error: { name: e?.name ?? 'Error', message: String(e?.message ?? e) } })
    }
}

// Forward console output to Metro's log so WebView problems are visible.
for (const level of ['log', 'warn', 'error']) {
    const original = console[level].bind(console)
    console[level] = (...args) => {
        original(...args)
        try {
            post('console', {
                level,
                message: args.map(a => a instanceof Error ? `${a.name}: ${a.message}` :
                    typeof a === 'string' ? a : JSON.stringify(a)).join(' ').slice(0, 2000),
            })
        } catch {}
    }
}
window.addEventListener('error', e => console.error(`Uncaught: ${e.message}`))
window.addEventListener('unhandledrejection', e => console.error(`Unhandled rejection: ${e.reason?.message ?? e.reason}`))

window.folio = { receive }
