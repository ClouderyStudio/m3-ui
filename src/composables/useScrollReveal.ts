import { getCurrentInstance, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * 滚动进场：元素进入视口时淡入（并可位移/缩放）。
 *
 * 与 `v-reveal` 是**同一套** CSS（.md-reveal / .is-revealed，见 base.css）：
 * 模板里给单个元素用指令，列表用这个组合式函数（可以一次观察一组 ref）。
 * 因此动效时长、缓动、减少动效的处理都只有一份。
 *
 * 与指令的差别：这里支持 stagger（同批进入的元素依次错开）和 slide 方向。
 */
export type RevealEffect = 'fade-up' | 'fade' | 'scale' | 'slide-left' | 'slide-right'

export interface ScrollRevealOptions {
  effect?: RevealEffect
  /** 位移距离（px，默认 24）。 */
  distance?: number
  /** 整体延迟（ms，默认 0）。 */
  delay?: number
  /** 同批进入时每个元素额外的延迟（ms，默认 60）。 */
  stagger?: number
  /** 只播一次（默认 true）；false 时离开视口会重新隐藏。 */
  once?: boolean
  /** 可见比例阈值（0–1，默认 0）。 */
  threshold?: number
  /** 底部留白，避免元素刚露一条边就播完（默认 '0px 0px -64px 0px'）。 */
  rootMargin?: string
}

const OFFSET: Record<RevealEffect, (distance: number) => { x: number; y: number; scale: number }> = {
  'fade-up': (distance) => ({ x: 0, y: distance, scale: 1 }),
  fade: () => ({ x: 0, y: 0, scale: 1 }),
  scale: () => ({ x: 0, y: 0, scale: 0.92 }),
  'slide-left': (distance) => ({ x: distance, y: 0, scale: 1 }),
  'slide-right': (distance) => ({ x: -distance, y: 0, scale: 1 }),
}

type Target = Element | null | undefined | Iterable<Element | null | undefined>

function toList(target: Target): Element[] {
  if (!target) return []
  if (target instanceof Element) return [target]
  return [...target].filter((item): item is Element => Boolean(item))
}

export function useScrollReveal(
  target: MaybeRefOrGetter<Target>,
  options: ScrollRevealOptions = {},
): { stop: () => void } {
  const effect = options.effect ?? 'fade-up'
  const distance = options.distance ?? 24
  const delay = options.delay ?? 0
  const stagger = options.stagger ?? 60
  const once = options.once ?? true
  const offset = OFFSET[effect](distance)

  let observer: IntersectionObserver | null = null
  let current: Element[] = []

  function prepare(element: HTMLElement): void {
    element.classList.add('md-reveal')
    element.style.setProperty('--md-reveal-x', offset.x + 'px')
    element.style.setProperty('--md-reveal-y', offset.y + 'px')
    element.style.setProperty('--md-reveal-scale', String(offset.scale))
    element.style.transitionDelay = delay + 'ms'
  }

  function reveal(element: HTMLElement, index: number): void {
    // 错开：同批进入的元素按文档顺序依次延迟
    element.style.transitionDelay = delay + index * stagger + 'ms'
    element.classList.add('is-revealed')
  }

  function hide(element: HTMLElement): void {
    element.style.transitionDelay = '0ms'
    element.classList.remove('is-revealed')
  }

  function attach(elements: Element[]): void {
    observer?.disconnect()
    observer = null
    if (typeof IntersectionObserver === 'undefined' || elements.length === 0) {
      elements.forEach((element) => element.classList.add('is-revealed'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          )

        entering.forEach((element, index) => {
          reveal(element, index)
          if (once) observer?.unobserve(element)
        })

        if (!once) {
          for (const entry of entries) {
            if (!entry.isIntersecting) hide(entry.target as HTMLElement)
          }
        }
      },
      { threshold: options.threshold ?? 0, rootMargin: options.rootMargin ?? '0px 0px -64px 0px' },
    )

    for (const element of elements) observer.observe(element)
  }

  watch(
    () => toList(toValue(target)),
    (next) => {
      for (const element of current) {
        if (!next.includes(element)) observer?.unobserve(element)
      }
      for (const element of next) {
        if (!current.includes(element)) prepare(element as HTMLElement)
      }
      current = next
      attach(next)
    },
    { immediate: true, flush: 'post' },
  )

  const stop = (): void => {
    observer?.disconnect()
    observer = null
  }

  if (getCurrentInstance()) onBeforeUnmount(stop)
  return { stop }
}
