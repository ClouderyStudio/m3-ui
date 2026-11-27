import { getCurrentScope, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useEventListener } from './useEventListener'

/**
 * 点击/触摸到目标之外时回调（下拉面板、浮层）。
 *
 * 用 pointerdown 而不是 click：click 要等指针抬起，期间目标可能已经被卸载，
 * 事件就永远到不了 document。捕获阶段执行，元素自己 stopPropagation 也拦不住关闭。
 */
type TargetArg = MaybeRefOrGetter<Element | null | undefined>

export function useClickOutside(
  targets: TargetArg | TargetArg[],
  handler: (event: PointerEvent) => void,
): () => void {
  const list = Array.isArray(targets) ? targets : [targets]

  function onPointerDown(event: PointerEvent): void {
    const node = event.target as Node | null
    if (!node) return
    for (const target of list) {
      if (toValue(target)?.contains(node)) return
    }
    handler(event)
  }

  const stop = useEventListener(window, 'pointerdown', onPointerDown, true)
  if (getCurrentScope()) onScopeDispose(stop)
  return stop
}

/**
 * 只在 active 为真期间生效的版本 —— 浮层打开时才监听，
 * 关闭状态下不占一个 document 级监听（页面上可能同时有几十个浮层组件）。
 */
export function useClickOutsideWhen(
  active: MaybeRefOrGetter<boolean>,
  targets: TargetArg | TargetArg[],
  handler: (event: PointerEvent) => void,
): void {
  const list = Array.isArray(targets) ? targets : [targets]
  let stop: (() => void) | null = null

  const detach = () => {
    stop?.()
    stop = null
  }

  watch(
    () => toValue(active),
    (on) => {
      detach()
      if (on) stop = useClickOutside(list, handler)
    },
    { immediate: true },
  )

  if (getCurrentScope()) onScopeDispose(detach)
}
