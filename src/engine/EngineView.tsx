import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from 'react';
import { Linking, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { prepareEngine } from './prepare';

export type EngineHandle = {
  /** Calls a handler registered with `handle()` in web/src and resolves with its return value. */
  request<T = unknown>(type: string, payload?: object, timeoutMs?: number): Promise<T>;
};

type Props = {
  ref?: Ref<EngineHandle>;
  /** Events the page posts on its own (relocate, tap, import-progress…). */
  onEvent?: (type: string, payload: any) => void;
  /** Called once the page's script has loaded and can take requests. */
  onReady?: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  /**
   * Hide Android's own Copy/Share/Select-all toolbar on text selection, so the
   * app can show its own menu. Selection handles stay native.
   */
  suppressSelectionMenu?: boolean;
};

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> };

/** Hosts the reader engine page (web/) in a WebView and exposes a request/response API. */
export function EngineView({
  ref,
  onEvent,
  onReady,
  style,
  backgroundColor = 'transparent',
  suppressSelectionMenu,
}: Props) {
  const webview = useRef<WebView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const ready = useRef(false);
  const queue = useRef<string[]>([]);
  const pending = useRef(new Map<number, Pending>());
  const nextId = useRef(1);
  const handlers = useRef({ onEvent, onReady });
  useLayoutEffect(() => {
    handlers.current = { onEvent, onReady };
  });

  useEffect(() => {
    let alive = true;
    const inFlight = pending.current;
    prepareEngine()
      .then((u) => alive && setUri(u))
      .catch((e) => console.error('Reader engine failed to load', e));
    return () => {
      alive = false;
      for (const p of inFlight.values()) {
        clearTimeout(p.timer);
        p.reject(new Error('Engine closed'));
      }
      inFlight.clear();
    };
  }, []);

  const inject = (script: string) => {
    if (ready.current) webview.current?.injectJavaScript(script);
    else queue.current.push(script);
  };

  useImperativeHandle(ref, () => ({
    request(type, payload = {}, timeoutMs = 60_000) {
      const id = nextId.current++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.current.delete(id);
          reject(new Error(`Engine request "${type}" timed out`));
        }, timeoutMs);
        pending.current.set(id, { resolve, reject, timer });
        inject(`window.folio && window.folio.receive(${JSON.stringify({ id, type, payload })}); true;`);
      });
    },
  }));

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: any;
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.id != null) {
      const p = pending.current.get(msg.id);
      if (!p) return;
      pending.current.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.ok) p.resolve(msg.result);
      else {
        const err = new Error(msg.error?.message ?? 'Engine error');
        err.name = msg.error?.name ?? 'Error';
        p.reject(err);
      }
      return;
    }
    if (msg.type === 'console') {
      const log = msg.payload.level === 'error' ? console.warn : console.log;
      log(`[reader] ${msg.payload.message}`);
      return;
    }
    if (msg.type === 'page-ready') {
      ready.current = true;
      for (const script of queue.current.splice(0)) webview.current?.injectJavaScript(script);
      handlers.current.onReady?.();
      return;
    }
    handlers.current.onEvent?.(msg.type, msg.payload);
  };

  if (!uri) return <View style={[styles.fill, { backgroundColor }, style]} />;

  return (
    <WebView
      ref={webview}
      source={{ uri }}
      originWhitelist={['*']}
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      textZoom={100}
      // An empty custom menu replaces the native one with nothing.
      menuItems={suppressSelectionMenu ? [] : undefined}
      overScrollMode="never"
      webviewDebuggingEnabled={__DEV__}
      onMessage={onMessage}
      onLoadStart={() => {
        ready.current = false;
      }}
      onShouldStartLoadWithRequest={(req) => {
        if (req.url.startsWith('file://') || req.url.startsWith('blob:') || req.url.startsWith('about:')) return true;
        // Links to websites inside a book open in the browser.
        if (/^https?:/.test(req.url)) Linking.openURL(req.url);
        return false;
      }}
      style={[styles.fill, { backgroundColor }, style]}
      containerStyle={{ backgroundColor }}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
