import { getCurrentInstance, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type WatchSource } from 'vue'

/**
 * 让 textarea 随内容长高，在 minRows / maxRows 之间，超过就内部滚动。
 *
 * 行高从计算样式里读，不假设 24px —— 用户可能改了字号或字体。
 * 宽度变化会重新折行，所以也观察宽度；但只对宽度变化重建，否则自己写高度
 * 会触发观察器，再写高度，形成死循环。
 */
export interface AutoGrowOptions {
  minRows?: MaybeRefOrGetter<number | undefined>
  maxRows?: MaybeRefOrGetter<number | undefined>
  /** 文本可能在「打字之外」变化时传进来（清空、插入内容）。 */
  value?: WatchSource<unknown>
}

export function useAutoGrow(
  target: MaybeRefOrGetter<HTMLTextAreaElement | null | undefined>,
  options: AutoGrowOptions = {},
): { resize: () => void } {
  let element: HTMLTextAreaElement | null = null
  let observer: ResizeObserver | null = null
  let lastWidth = 0

  function resize(): void {
    if (!element) return
    const style = getComputedStyle(element)
    const px = (value: string) => Number.parseFloat(value) || 0
    const lineHeight = px(style.lineHeight) || px(style.fontSize) * 1.5 || 24
    const padding = px(style.paddingTop) + px(style.paddingBottom)
    const borderBox = style.boxSizing === 'border-box'

    const min = (toValue(options.minRows) ?? 1) * lineHeight + (borderBox ? padding : 0)
    const maxRows = toValue(options.maxRows)
    const max = maxRows ? maxRows * lineHeight + (borderBox ? padding : 0) : Number.POSITIVE_INFINITY

    // 先归零再量：否则 scrollHeight 量到的是当前高度而不是内容高度
    element.style.height = 'auto'
    const content = element.scrollHeight + (borderBox ? 0 : padding)
    const height = Math.min(max, Math.max(min, content))
    element.style.height = height + 'px'
    element.style.overflowY = content > max ? 'auto' : 'hidden'
  }

  function attach(next: HTMLTextAreaElement | null | undefined): void {
    if (element) {
      element.removeEventListener('input', resize)
      observer?.disconnect()
      element.style.height = ''
      element.style.overflowY = ''
    }
    element = next ?? null
    if (!element) return

    element.addEventListener('input', resize)
    if (typeof ResizeObserver !== 'undefined') {
      observer ??= new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0
        if (width === lastWidth) return
        lastWidth = width
        resize()
      })
      observer.observe(element)
    }
    resize()
  }

  watch(() => toValue(target), attach, { immediate: true, flush: 'post' })
  watch([() => toValue(options.minRows), () => toValue(options.maxRows)], () => resize(), { flush: 'post' })
  if (options.value) watch(options.value, () => resize(), { flush: 'post' })
  if (getCurrentInstance()) onBeforeUnmount(() => attach(null))

  return { resize }
}
