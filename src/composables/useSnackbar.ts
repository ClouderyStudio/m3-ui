import { readonly, ref } from 'vue'

/**
 * 全局提示条（MD3 Snackbar）。
 *
 * 单实例队列：任意组件调用 `useSnackbar().error('...')`，由挂在 App 根部的
 * `<M3SnackbarHost />` 统一渲染并自动消失。取代 `window.alert`：
 * alert 会阻塞页面、样式不可控，在移动端和无障碍上都不可接受。
 *
 * 用法：
 *   const snackbar = useSnackbar()
 *   snackbar.error('连接超时，请稍后重试')
 *   snackbar.success('已保存')
 *   snackbar.show('提示文本', { tone: 'warning', title: '注意', timeout: 6000 })
 */
export type SnackbarTone = 'neutral' | 'success' | 'error' | 'warning'

export interface SnackbarOptions {
  tone?: SnackbarTone
  /** 可选的粗体标题。 */
  title?: string
  /** 毫秒；0 表示不自动消失。 */
  timeout?: number
}

export interface SnackbarMessage {
  id: number
  text: string
  tone: SnackbarTone
  title?: string
}

const current = ref<SnackbarMessage | null>(null)
let nextId = 1
let timer = 0

function hide(): void {
  window.clearTimeout(timer)
  current.value = null
}

function show(text: string, options: SnackbarOptions = {}): void {
  if (!text) return
  const tone = options.tone ?? 'neutral'
  // 错误默认停留更久：用户往往需要读完再决定下一步
  const timeout = options.timeout ?? (tone === 'error' ? 6000 : 4000)

  window.clearTimeout(timer)
  current.value = { id: nextId++, text, tone, ...(options.title ? { title: options.title } : {}) }
  if (timeout > 0) timer = window.setTimeout(hide, timeout)
}

export function useSnackbar() {
  return {
    current: readonly(current),
    show,
    hide,
    success: (text: string, title?: string) => show(text, { tone: 'success', ...(title ? { title } : {}) }),
    error: (text: string, title?: string) => show(text, { tone: 'error', ...(title ? { title } : {}) }),
    warning: (text: string, title?: string) => show(text, { tone: 'warning', ...(title ? { title } : {}) }),
    info: (text: string, title?: string) => show(text, { tone: 'neutral', ...(title ? { title } : {}) }),
  }
}
