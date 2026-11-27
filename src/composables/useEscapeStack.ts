import { getCurrentInstance, onBeforeUnmount, watch, type WatchSource } from 'vue'

/**
 * Esc 的栈式分发。
 *
 * 叠了两层浮层时（对话框里开日期面板），如果各自监听 document，
 * 一次 Esc 会把两层一起关掉 —— 用户只想关最上面那层。
 * 这里用一个栈：后打开的在上，只有栈顶能收到 Esc。
 */
const stack: (() => void)[] = []

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || stack.length === 0) return
  // 标记已处理：浏览器就不会再把它交给 close watcher 之类的东西
  event.preventDefault()
  stack[stack.length - 1]?.()
}

/** active 为真期间接收 Esc；被更晚打开的表层覆盖时不响应。 */
export function useEscapeStack(active: WatchSource<boolean>, onEscape: () => void): void {
  const entry = () => onEscape()

  function set(on: boolean): void {
    if (typeof document === 'undefined') return
    const index = stack.indexOf(entry)
    if (on && index < 0) {
      stack.push(entry)
      if (stack.length === 1) document.addEventListener('keydown', onKeydown)
    } else if (!on && index >= 0) {
      stack.splice(index, 1)
      if (stack.length === 0) document.removeEventListener('keydown', onKeydown)
    }
  }

  watch(active, (value) => set(Boolean(value)), { immediate: true })
  if (getCurrentInstance()) onBeforeUnmount(() => set(false))
}

/** 栈深度（调试/测试用）。 */
export function escapeStackSize(): number {
  return stack.length
}
