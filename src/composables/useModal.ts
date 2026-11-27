import { onBeforeUnmount, watch, type Ref } from 'vue'
import { lockScroll, unlockScroll } from './useScrollLock'
import { useEscapeStack } from './useEscapeStack'

/** Elements that can take focus inside a modal panel. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export interface UseModalOptions {
  /** Called when the user presses Escape or clicks the scrim. */
  onClose: () => void
  /** Keep the panel mounted; skip restoring focus to the trigger. */
  restoreFocus?: boolean
}

export interface ModalControls {
  /** Move focus to the first focusable element inside the panel. */
  focusFirst: () => void
}

/**
 * Shared behaviour for M3 dialogs and sheets: scroll lock, a focus trap that keeps Tab
 * inside the panel, Escape-to-close, and focus restoration to the invoking element.
 */
export function useModal(
  isOpen: Ref<boolean>,
  panelRef: Ref<HTMLElement | null>,
  options: UseModalOptions,
): ModalControls {
  let restoreTarget: HTMLElement | null = null

  function focusableItems(): HTMLElement[] {
    const root = panelRef.value
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
    )
  }

  function focusFirst(): void {
    const items = focusableItems()
    const target = items[0] ?? panelRef.value
    target?.focus({ preventScroll: true })
  }

  /*
   * Tab 只在面板内循环；Esc 交给共享的栈（useEscapeStack）：
   * 对话框里再开一个日期面板时，一次 Esc 只该关最上面那层。
   */
  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return
    const items = focusableItems()
    if (items.length === 0) {
      event.preventDefault()
      panelRef.value?.focus({ preventScroll: true })
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement as HTMLElement | null
    const inside = active !== null && panelRef.value?.contains(active) === true
    if (event.shiftKey && (!inside || active === first)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && inside && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  useEscapeStack(isOpen, () => options.onClose())

  watch(
    isOpen,
    (open) => {
      // 服务端渲染时没有 document：只跳过副作用，不改变组件的渲染结果。
      if (typeof document === 'undefined') return

      if (open) {
        restoreTarget = (document.activeElement as HTMLElement | null) ?? null
        lockScroll()
        document.addEventListener('keydown', onKeydown, true)
        requestAnimationFrame(() => requestAnimationFrame(focusFirst))
      } else {
        unlockScroll()
        document.removeEventListener('keydown', onKeydown, true)
        if (options.restoreFocus !== false && restoreTarget?.isConnected) {
          restoreTarget.focus({ preventScroll: true })
        }
        restoreTarget = null
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (isOpen.value) {
      unlockScroll()
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', onKeydown, true)
      }
    }
  })

  return { focusFirst }
}
