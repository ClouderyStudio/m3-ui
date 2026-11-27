import { readonly, ref, type Ref } from 'vue'
import type { IconComponent } from '../icons'

/**
 * 应用内通知（右上角浮层）。
 *
 * 与 Snackbar 的分工：Snackbar 是「操作结果」，一次一条、几秒就走；
 * 通知是「需要知道的异步事件」，可以带标题、正文和一个跳转动作，
 * 也允许同时堆几条。两者共用滚动锁之外的同一套动效语言。
 */
export type NotificationTone = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: number
  title: string
  body?: string
  tone: NotificationTone
  /** 毫秒；0 表示不自动消失。 */
  timeout: number
  icon?: IconComponent | null
  action?: { label: string; onSelect?: () => void }
}

export interface NotifyOptions {
  title: string
  body?: string
  tone?: NotificationTone
  timeout?: number
  icon?: IconComponent | null
  action?: { label: string; onSelect?: () => void }
}

const MAX_VISIBLE = 4
const items = ref<AppNotification[]>([])
const timers = new Map<number, number>()
let nextId = 1

function clearTimer(id: number): void {
  const timer = timers.get(id)
  if (timer) window.clearTimeout(timer)
  timers.delete(id)
}

function dismiss(id: number): void {
  clearTimer(id)
  items.value = items.value.filter((item) => item.id !== id)
}

function pause(id: number): void {
  clearTimer(id)
}

function resume(id: number): void {
  const item = items.value.find((entry) => entry.id === id)
  if (!item || item.timeout <= 0) return
  clearTimer(id)
  timers.set(
    id,
    window.setTimeout(() => dismiss(id), 1200),
  )
}

function notify(options: NotifyOptions | string): number {
  const value: NotifyOptions = typeof options === 'string' ? { title: options } : options
  const tone = value.tone ?? 'info'
  const item: AppNotification = {
    id: nextId++,
    title: value.title,
    body: value.body,
    tone,
    timeout: value.timeout ?? (tone === 'error' ? 8000 : 5000),
    icon: value.icon ?? null,
    action: value.action,
  }

  while (items.value.length >= MAX_VISIBLE) {
    const oldest = items.value[0]
    if (!oldest) break
    dismiss(oldest.id)
  }

  items.value = [...items.value, item]
  if (item.timeout > 0) {
    timers.set(
      item.id,
      window.setTimeout(() => dismiss(item.id), item.timeout),
    )
  }
  return item.id
}

function clear(): void {
  for (const item of [...items.value]) dismiss(item.id)
}

export interface NotificationsApi {
  items: Readonly<Ref<readonly AppNotification[]>>
  notify: (options: NotifyOptions | string) => number
  dismiss: (id: number) => void
  pause: (id: number) => void
  resume: (id: number) => void
  clear: () => void
  success: (title: string, body?: string) => number
  error: (title: string, body?: string) => number
  warning: (title: string, body?: string) => number
}

export function useNotifications(): NotificationsApi {
  return {
    // DeepReadonly 会把组件类型展开成 LooseRequired，导致 .d.ts 无法内联；这里收窄回声明的形状
    items: readonly(items) as unknown as Readonly<Ref<readonly AppNotification[]>>,
    notify,
    dismiss,
    pause,
    resume,
    clear,
    success: (title: string, body?: string) => notify({ title, body, tone: 'success' }),
    error: (title: string, body?: string) => notify({ title, body, tone: 'error' }),
    warning: (title: string, body?: string) => notify({ title, body, tone: 'warning' }),
  }
}
