import { getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * 防抖与节流。
 *
 * 防抖：最后一次调用之后 ms 才执行（搜索框）。
 * 节流：这段时间内最多执行一次（滚动、拖拽），并保留尾部调用 ——
 * 只在「开头」节流会丢掉最后一次输入，滚动到底时最后 100px 收不到回调。
 */
export interface Cancelable {
  cancel: () => void
}

export function useDebounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): ((...args: Args) => void) & Cancelable {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  if (getCurrentScope()) onScopeDispose(debounced.cancel)
  return debounced
}

export function useThrottle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  interval = 100,
): ((...args: Args) => void) & Cancelable {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: Args | null = null

  const throttled = (...args: Args) => {
    const remaining = interval - (Date.now() - last)
    pending = args
    if (remaining <= 0) {
      last = Date.now()
      const args2 = pending
      pending = null
      fn(...args2)
      return
    }
    if (timer) return
    timer = setTimeout(() => {
      timer = null
      last = Date.now()
      if (pending) fn(...pending)
      pending = null
    }, remaining)
  }

  throttled.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    pending = null
  }

  if (getCurrentScope()) onScopeDispose(throttled.cancel)
  return throttled
}

/** 值本身防抖：输入框 → 停止输入 300ms 后才更新的查询词。 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const value = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  const stop = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  const stopWatch = watch(source, (next) => {
    stop()
    timer = setTimeout(() => {
      timer = null
      value.value = next
    }, delay)
  })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stop()
      stopWatch()
    })
  }

  return value
}
