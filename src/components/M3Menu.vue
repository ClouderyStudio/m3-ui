<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'
import { useEventListener } from '../composables/useEventListener'

type MenuPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'top-start'
  | 'top-end'
  | 'top'

const props = withDefaults(
  defineProps<{
    /** Which edge of the trigger the panel aligns to. */
    placement?: MenuPlacement
    /** Distance between trigger and panel. */
    gap?: number
    minWidth?: number
    maxWidth?: number
    /** Stretch the panel to the trigger width (used by navigation panels). */
    matchTriggerWidth?: boolean
    /** MD3 menus carry 8dp vertical padding; large navigation panels turn it off. */
    padded?: boolean
    /** Close after activating an item inside the panel. */
    closeOnSelect?: boolean
    /** Close on page scroll instead of tracking the trigger. */
    closeOnScroll?: boolean
  }>(),
  {
    placement: 'bottom-start',
    gap: 4,
    minWidth: 112,
    maxWidth: 720,
    matchTriggerWidth: false,
    padded: true,
    closeOnSelect: true,
    closeOnScroll: false,
  },
)

const open = ref(false)
const anchorRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({ top: '0px', left: '0px', minWidth: '112px' })

const isTop = () => props.placement.startsWith('top')

function updatePosition(): void {
  const anchor = anchorRef.value
  if (!anchor) return
  const rect = anchor.getBoundingClientRect()
  const panel = panelRef.value
  const panelWidth = panel ? panel.offsetWidth : props.minWidth
  const panelHeight = panel ? panel.offsetHeight : 0
  const pad = 8
  const align = props.placement.endsWith('-end') ? 'end' : props.placement.endsWith('-start') ? 'start' : 'center'

  let left = rect.left
  if (align === 'end') left = rect.right - panelWidth
  else if (align === 'center') left = rect.left + rect.width / 2 - panelWidth / 2
  left = Math.min(Math.max(left, pad), Math.max(pad, window.innerWidth - panelWidth - pad))

  let top = isTop() ? rect.top - props.gap - panelHeight : rect.bottom + props.gap
  if (panelHeight > 0) {
    const overflowsBottom = top + panelHeight > window.innerHeight - pad
    const overflowsTop = top < pad
    if (!isTop() && overflowsBottom && rect.top - props.gap - panelHeight > pad) {
      top = rect.top - props.gap - panelHeight
    } else if (isTop() && overflowsTop && rect.bottom + props.gap + panelHeight < window.innerHeight - pad) {
      top = rect.bottom + props.gap
    }
  }

  panelStyle.value = {
    top: top + 'px',
    left: left + 'px',
    minWidth: (props.matchTriggerWidth ? rect.width : props.minWidth) + 'px',
  }
}

function triggerElement(): HTMLElement | null {
  const anchor = anchorRef.value
  if (!anchor) return null
  return anchor.querySelector<HTMLElement>('button, a, [tabindex]') ?? anchor
}

function menuItems(): HTMLElement[] {
  const panel = panelRef.value
  if (!panel) return []
  return Array.from(panel.querySelectorAll<HTMLElement>('[role^="menuitem"]')).filter(
    (item) => item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled'),
  )
}

function focusItem(index: number): void {
  const items = menuItems()
  if (items.length === 0) return
  const next = (index + items.length) % items.length
  items[next]?.focus({ preventScroll: true })
}

function focusFirst(): void {
  focusItem(0)
}

function close(): void {
  open.value = false
}

function toggle(): void {
  open.value = !open.value
}

function restoreFocus(): void {
  triggerElement()?.focus({ preventScroll: true })
}

function onPanelKeydown(event: KeyboardEvent): void {
  const items = menuItems()
  if (items.length === 0) return
  const current = items.indexOf(document.activeElement as HTMLElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItem(current + 1)
      return
    case 'ArrowUp':
      event.preventDefault()
      focusItem(current <= 0 ? items.length - 1 : current - 1)
      return
    case 'Home':
      event.preventDefault()
      focusItem(0)
      return
    case 'End':
      event.preventDefault()
      focusItem(items.length - 1)
      return
    case 'Tab':
      // 菜单不是模态：Tab 允许离开，但先把面板收起，避免它留在屏幕上
      close()
      return
  }
}

function onScroll(): void {
  if (props.closeOnScroll) close()
  else updatePosition()
}

function onPanelClick(event: MouseEvent): void {
  if (!props.closeOnSelect) return
  const target = event.target as HTMLElement | null
  if (target?.closest('[role^="menuitem"], a, button')) {
    close()
    restoreFocus()
  }
}

watch(open, async (value) => {
  if (value) {
    await nextTick()
    updatePosition()
    // MD3: opening a menu moves focus into it, so the first item answers arrow keys immediately
    focusFirst()
  }
})

/* Esc 走共享的栈：菜单里再开日期面板时，一次 Esc 只关最上面那层 */
useEscapeStack(open, () => {
  close()
  restoreFocus()
})
useClickOutsideWhen(open, [anchorRef, panelRef], () => close())
useEventListener(window, 'resize', () => {
  if (open.value) updatePosition()
})
useEventListener(
  window,
  'scroll',
  () => {
    if (open.value) onScroll()
  },
  true,
)

defineExpose({ open, close, toggle, updatePosition })
</script>

<template>
  <span ref="anchorRef" class="md-menu-anchor" @click="toggle">
    <slot name="trigger" :open="open" :toggle="toggle" :close="close" />
  </span>

  <Teleport to="body">
    <Transition name="md-menu-pop">
      <div
        v-if="open"
        ref="panelRef"
        class="md-menu"
        :class="{ 'md-menu--padded': padded, 'md-menu--top': isTop() }"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
        :style="{ ...panelStyle, maxWidth: 'min(calc(100vw - 16px), ' + maxWidth + 'px)' }"
        @click="onPanelClick"
        @keydown="onPanelKeydown"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-menu-anchor {
  display: inline-flex;
  align-items: center;
}

.md-menu {
  position: fixed;
  z-index: 300;
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-extra-small);
  box-shadow: var(--md-sys-elevation-level2);
  max-height: calc(100vh - 96px);
  overflow: hidden auto;
  overscroll-behavior: contain;
}

.md-menu:focus {
  outline: none;
}

.md-menu--padded {
  padding-block: 8px;
}

/*
 * 菜单展开：从锚点方向「长出来」，而不是整块淡入。
 * 入场用 emphasized-decelerate（快起慢收），出场用 accelerate（慢起快收），
 * 一进一出方向感一致，收起来时不会像卡了一下。
 */
.md-menu-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
  transform-origin: top center;
}

.md-menu-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  transform-origin: top center;
}

.md-menu-pop-enter-from {
  opacity: 0;
  transform: scaleY(0.85) translateY(-4px);
}

.md-menu-pop-leave-to {
  opacity: 0;
  transform: scaleY(0.92) translateY(-2px);
}

/* 向上展开时方向反过来：从锚点往上长 */
.md-menu--top {
  transform-origin: bottom center;
}

@media (prefers-reduced-motion: reduce) {
  /* 削减：不缩放，只淡入淡出 */
  .md-menu-pop-enter-from,
  .md-menu-pop-leave-to {
    transform: none;
  }
}
</style>
