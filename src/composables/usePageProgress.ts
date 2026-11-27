import { computed, readonly, ref } from 'vue'

/**
 * 页面级进度条的状态（模块级单例）。
 *
 * 一条进度条是全站共享的一个东西：路由守卫里调 start()，页面挂载后调 done()，
 * 两个调用点通常不在同一个组件里。所以状态放在模块作用域，
 * 组件只负责把它画出来 —— 这也是为什么 usePageProgress() 可以被任意多点调用。
 *
 * 两段计时器：
 *   - trickle：加载中每 200ms 往前蹭一点，上限 90%。真实的「还有多久」没人知道，
 *     但没有进展的进度条等于在说「卡住了」；
 *   - settle：走到 100% 之后停 250ms 再淡出，太快消失反而看不出「完成了」。
 */
const progress = ref(0)
const active = ref(false)

let trickleTimer: ReturnType<typeof setInterval> | undefined
let settleTimer: ReturnType<typeof setTimeout> | undefined

function clearTimers(): void {
  if (trickleTimer) clearInterval(trickleTimer)
  if (settleTimer) clearTimeout(settleTimer)
  trickleTimer = undefined
  settleTimer = undefined
}

/** 开始一次加载：重置到 10% 并进入爬升。重复调用不会把进度打回去。 */
function start(): void {
  clearTimers()
  if (!active.value) progress.value = 10
  active.value = true
  trickleTimer = setInterval(() => {
    // 越接近 90% 越慢：线性爬升会让人以为下一秒就结束
    const remaining = 90 - progress.value
    if (remaining <= 0) return
    progress.value += Math.max(0.5, remaining * 0.08)
  }, 200)
}

/** 手动设置进度（0-100），用于确实知道百分比的场景。 */
function set(value: number): void {
  progress.value = Math.min(100, Math.max(0, value))
}

/** 完成：走到 100%，稍作停留后淡出。 */
function done(): void {
  clearTimers()
  if (!active.value) return
  progress.value = 100
  settleTimer = setTimeout(() => {
    active.value = false
    progress.value = 0
  }, 250)
}

/** 失败：立刻收起，由页面自己显示错误。 */
function fail(): void {
  clearTimers()
  active.value = false
  progress.value = 0
}

export function usePageProgress() {
  return {
    progress: readonly(progress),
    active: readonly(active),
    /** 进度是否已经到 100%（用于给进度条自己套完成态的样式）。 */
    complete: computed(() => progress.value >= 100),
    start,
    set,
    done,
    fail,
  }
}
