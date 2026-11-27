import { getCurrentScope, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * ResizeObserver 包装：元素尺寸变化时回调。
 *
 * 只在内容尺寸真的变化时才回调，并且不在回调里写会引发尺寸变化的样式 ——
 * 那会触发 "ResizeObserver loop completed with undelivered notifications" 警告。
 */
export function useResizeObserver(
  target: MaybeRefOrGetter<Element | null | undefined>,
  callback: (entry: ResizeObserverEntry) => void,
): { stop: () => void } {
  let observer: ResizeObserver | null = null

  function disconnect(): void {
    observer?.disconnect()
    observer = null
  }

  function observe(): void {
    disconnect()
    if (typeof ResizeObserver === 'undefined') return
    const element = toValue(target)
    if (!element) return
    observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) callback(entry)
    })
    observer.observe(element)
  }

  watch(() => toValue(target), observe, { immediate: true })

  const stop = disconnect
  if (getCurrentScope()) onScopeDispose(stop)
  return { stop }
}
