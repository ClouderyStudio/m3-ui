import { getCurrentScope, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

/**
 * 响应式的媒体查询。
 *
 * 用 matchMedia 而不是 resize + innerWidth：前者只在跨过断点时触发一次，
 * 后者拖动窗口会连续触发几十次（每个使用者各一次，很快就卡）。
 * 服务端渲染时返回 false，直到客户端首次求值。
 */
export function useMediaQuery(query: MaybeRefOrGetter<string>, fallback = false): Ref<boolean> {
  const matches = ref(fallback)
  let media: MediaQueryList | null = null

  function stop(): void {
    media?.removeEventListener('change', onChange)
    media = null
  }

  function onChange(event: MediaQueryListEvent): void {
    matches.value = event.matches
  }

  function start(): void {
    stop()
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    media = window.matchMedia(toValue(query))
    matches.value = media.matches
    media.addEventListener('change', onChange)
  }

  watch(() => toValue(query), start, { immediate: true })

  if (getCurrentScope()) onScopeDispose(stop)

  return matches
}
