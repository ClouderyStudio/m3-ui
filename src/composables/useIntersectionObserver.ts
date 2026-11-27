import { getCurrentScope, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * IntersectionObserver 包装：元素进出视口时回调。
 *
 * 与滚动事件相比：观察器只在真的跨界时回调一次，不会每帧读布局。
 * 元素在 v-if 之后才出现时，用 getter 形式传入即可在出现后重新观察。
 */
export interface IntersectionOptions {
  root?: Element | Document | null
  /** 提前多少像素触发（如 '0px 0px 200px 0px'）。 */
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useIntersectionObserver(
  target: MaybeRefOrGetter<Element | null | undefined>,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionOptions = {},
): { stop: () => void } {
  let observer: IntersectionObserver | null = null
  let stopped = false

  function disconnect(): void {
    observer?.disconnect()
    observer = null
  }

  function observe(): void {
    disconnect()
    if (stopped || typeof IntersectionObserver === 'undefined') return
    const element = toValue(target)
    if (!element) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callback(entry)
          if (options.once && entry.isIntersecting) {
            stopped = true
            disconnect()
            return
          }
        }
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
        threshold: options.threshold ?? 0,
      },
    )
    observer.observe(element)
  }

  watch(() => toValue(target), observe, { immediate: true })

  const stop = () => {
    stopped = true
    disconnect()
  }

  if (getCurrentScope()) onScopeDispose(stop)
  return { stop }
}
