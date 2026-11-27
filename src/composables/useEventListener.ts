import { getCurrentScope, onScopeDispose, unref, watch, type MaybeRefOrGetter, type Ref } from 'vue'

/**
 * 给任意 EventTarget 挂监听，并在作用域销毁时自动摘掉。
 *
 * 目标可以是 window/document/元素，也可以是 ref 或 getter —— 元素在打开浮层、
 * v-if 之后才存在时，getter 形式才能在它出现后补挂监听，否则第一帧的监听永远挂不上。
 *
 * 立即挂载（不等 onMounted）：这样在 watch 回调、事件处理里调用它也成立，
 * 清理交给 onScopeDispose；不在组件作用域里时返回的手动 stop 仍然有效。
 */
type TargetLike = EventTarget | null | undefined

function resolve(target: MaybeRefOrGetter<TargetLike>): TargetLike {
  return typeof target === 'function' ? (target as () => TargetLike)() : unref(target as Ref<TargetLike>)
}

export function useEventListener<E extends Event = Event>(
  target: MaybeRefOrGetter<TargetLike>,
  type: string,
  handler: (event: E) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  let current: TargetLike = null

  function detach(): void {
    current?.removeEventListener(type, handler as EventListener, options)
    current = null
  }

  function attach(): void {
    const next = resolve(target)
    if (next === current) return
    detach()
    if (!next) return
    next.addEventListener(type, handler as EventListener, options)
    current = next
  }

  watch(() => resolve(target), attach, { immediate: true })
  if (getCurrentScope()) onScopeDispose(detach)

  return detach
}
