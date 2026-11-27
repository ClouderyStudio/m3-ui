import { computed, readonly, ref } from 'vue'

/**
 * 全局提示条（MD3 Snackbar）。
 *
 * 可堆叠：最多同时显示 3 条，超出的先把最旧的一条收走。
 * 为什么不是「后来的顶掉前一条」：一连串操作（保存、同步、上传）各自的结果
 * 都值得看一眼，互相顶掉等于只让用户记住最后发生的那件事。
 * 同时也要封顶 —— 铺满半屏的提示条会把页面本身挤成背景。
 *
 * 用法：
 *   const snackbar = useSnackbar()
 *   snackbar.error('连接超时，请稍后重试')
 *   snackbar.success('已保存')
 *   snackbar.show('提示文本', {
 *     tone: 'warning',
 *     title: '注意',
 *     timeout: 6000,
 *     action: { label: '撤销', onSelect: () => undo() },
 *   })
 */
export type SnackbarTone = 'neutral' | 'success' | 'error' | 'warning'

export interface SnackbarAction {
  label: string
  /** Runs before the snackbar closes. */
  onSelect?: () => void
}

export interface SnackbarOptions {
  tone?: SnackbarTone
  /** 可选的粗体标题。 */
  title?: string
  /** 毫秒；0 表示不自动消失。 */
  timeout?: number
  /** 右侧的一个文字操作（MD3 snackbar action）。 */
  action?: SnackbarAction
}

export interface SnackbarMessage {
  id: number
  text: string
  tone: SnackbarTone
  title?: string
  action?: SnackbarAction
}

interface TimerState {
  timer: number
  duration: number
  remaining: number
  startedAt: number
  paused: boolean
}

/** 同时可见的上限。再多就会盖住页面底部的操作栏。 */
const MAX_VISIBLE = 3

const messages = ref<SnackbarMessage[]>([])
const timers = new Map<number, TimerState>()
let nextId = 1

/** 兼容旧写法：current 指向最新的一条。 */
const current = computed<SnackbarMessage | null>(() => messages.value[messages.value.length - 1] ?? null)

function clearTimer(id: number): void {
  const state = timers.get(id)
  if (!state) return
  window.clearTimeout(state.timer)
  timers.delete(id)
}

function arm(id: number, ms: number): void {
  clearTimer(id)
  const state: TimerState = {
    timer: 0,
    duration: ms,
    remaining: ms,
    startedAt: Date.now(),
    paused: false,
  }
  timers.set(id, state)
  if (ms > 0) state.timer = window.setTimeout(() => dismiss(id), ms)
}

/** 收起指定的一条（id 不存在时什么都不做）。 */
function dismiss(id: number): void {
  clearTimer(id)
  messages.value = messages.value.filter((message) => message.id !== id)
}

function show(text: string, options: SnackbarOptions = {}): number {
  if (!text) return 0
  const tone = options.tone ?? 'neutral'
  // 错误默认停留更久：用户往往需要读完再决定下一步
  const timeout = options.timeout ?? (tone === 'error' ? 6000 : 4000)

  // 同一条文案重复触发（连点保存）时重启倒计时，而不是叠出两条一模一样的
  const duplicate = messages.value.find((message) => message.text === text && message.tone === tone)
  if (duplicate) {
    arm(duplicate.id, timeout)
    return duplicate.id
  }

  const message: SnackbarMessage = {
    id: nextId++,
    text,
    tone,
    ...(options.title ? { title: options.title } : {}),
    ...(options.action ? { action: options.action } : {}),
  }

  // 先腾位再入队：保持「最新的在最下面（离手指最近）」
  while (messages.value.length >= MAX_VISIBLE) {
    const oldest = messages.value[0]
    if (!oldest) break
    dismiss(oldest.id)
  }

  messages.value = [...messages.value, message]
  arm(message.id, timeout)
  return message.id
}

/**
 * 鼠标停在某条提示上、或键盘焦点进入其中时暂停它的倒计时。
 *
 * 带「撤销」的提示尤其需要这个：4 秒内没读完就消失，用户根本没机会点。
 */
function pause(id: number): void {
  const state = timers.get(id)
  if (!state || state.duration <= 0 || state.paused) return
  state.paused = true
  state.remaining = Math.max(0, state.remaining - (Date.now() - state.startedAt))
  window.clearTimeout(state.timer)
}

function resume(id: number): void {
  const state = timers.get(id)
  if (!state || state.duration <= 0 || !state.paused) return
  state.paused = false
  if (state.remaining <= 0) {
    dismiss(id)
    return
  }
  state.startedAt = Date.now()
  state.timer = window.setTimeout(() => dismiss(id), state.remaining)
}

/** 不传 id 时收起最早的一条。 */
function hide(id?: number): void {
  const target = id ?? messages.value[0]?.id
  if (target === undefined) return
  dismiss(target)
}

function hideAll(): void {
  for (const message of [...messages.value]) dismiss(message.id)
}

export function useSnackbar() {
  return {
    /** 当前可见的提示（按入队顺序，最新的在最后）。 */
    messages: readonly(messages),
    current,
    show,
    hide,
    hideAll,
    dismiss,
    pause,
    resume,
    success: (text: string, title?: string, action?: SnackbarAction) =>
      show(text, { tone: 'success', ...(title ? { title } : {}), ...(action ? { action } : {}) }),
    error: (text: string, title?: string, action?: SnackbarAction) =>
      show(text, { tone: 'error', ...(title ? { title } : {}), ...(action ? { action } : {}) }),
    warning: (text: string, title?: string, action?: SnackbarAction) =>
      show(text, { tone: 'warning', ...(title ? { title } : {}), ...(action ? { action } : {}) }),
    info: (text: string, title?: string, action?: SnackbarAction) =>
      show(text, { tone: 'neutral', ...(title ? { title } : {}), ...(action ? { action } : {}) }),
  }
}
