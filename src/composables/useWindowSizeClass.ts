import { computed, onBeforeUnmount, onMounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { ref } from 'vue'

/**
 * M3 的窗口尺寸类（WindowSizeClass），响应式。
 *
 * 断点直接取 androidx window-core 的值：宽 600 / 840 / 1200 / 1600，
 * 高 480 / 900。CSS px 在这里代替 dp —— Web 上两者是同一个数。
 *
 * 不传目标就是浏览器窗口；传元素（ref 或 getter）则按元素自身尺寸分级，
 * 自适应布局组件应该用后者：它该适配的是「自己拿到的空间」，而不是整个窗口。
 */
export type WidthSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large'
export type HeightSizeClass = 'compact' | 'medium' | 'expanded'

export function widthSizeClass(width: number): WidthSizeClass {
  if (width < 600) return 'compact'
  if (width < 840) return 'medium'
  if (width < 1200) return 'expanded'
  if (width < 1600) return 'large'
  return 'extra-large'
}

export function heightSizeClass(height: number): HeightSizeClass {
  if (height < 480) return 'compact'
  if (height < 900) return 'medium'
  return 'expanded'
}

export interface WindowSizeClassInfo {
  width: Ref<number>
  height: Ref<number>
  widthClass: Ref<WidthSizeClass>
  heightClass: Ref<HeightSizeClass>
}

/** 窗口尺寸全库共享一份，避免每个调用方各挂一个 resize。 */
const windowWidth = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
const windowHeight = ref(typeof window === 'undefined' ? 0 : window.innerHeight)
let subscribers = 0

function updateWindow(): void {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

export function useWindowSizeClass(target?: MaybeRefOrGetter<HTMLElement | null | undefined>): WindowSizeClassInfo {
  if (target === undefined) {
    onMounted(() => {
      if (subscribers === 0) {
        updateWindow()
        window.addEventListener('resize', updateWindow)
      }
      subscribers += 1
    })
    onBeforeUnmount(() => {
      subscribers -= 1
      if (subscribers === 0) window.removeEventListener('resize', updateWindow)
    })

    return {
      width: windowWidth,
      height: windowHeight,
      widthClass: computed(() => widthSizeClass(windowWidth.value)),
      heightClass: computed(() => heightSizeClass(windowHeight.value)),
    }
  }

  const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
  const height = ref(typeof window === 'undefined' ? 0 : window.innerHeight)
  let observer: ResizeObserver | null = null

  function observe(element: HTMLElement | null | undefined): void {
    observer?.disconnect()
    observer = null
    if (!element || typeof ResizeObserver === 'undefined') return
    width.value = element.offsetWidth
    height.value = element.offsetHeight
    observer = new ResizeObserver(() => {
      width.value = element.offsetWidth
      height.value = element.offsetHeight
    })
    observer.observe(element)
  }

  onMounted(() => {
    watch(() => toValue(target), observe, { immediate: true })
  })
  onBeforeUnmount(() => observer?.disconnect())

  return {
    width,
    height,
    widthClass: computed(() => widthSizeClass(width.value)),
    heightClass: computed(() => heightSizeClass(height.value)),
  }
}
