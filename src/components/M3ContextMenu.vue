<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'
import { useEventListener } from '../composables/useEventListener'

/**
 * 右键菜单：把 M3Menu 的菜单面板挪到鼠标落点。
 *
 * 与 M3Menu 的差别只有定位来源（光标 vs 锚点），所以面板长什么样、键盘怎么走
 * 都直接交给同一套约定：焦点进入第一项、↑↓/Home/End 移动、Esc 关闭并归还焦点。
 * 菜单项请用 M3MenuItem（它自带 role="menuitem" 与状态层）。
 *
 * 触摸设备没有右键：长按由使用方自己决定要不要调用 openAt()（暴露在实例上）。
 */
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    /** standard 4dp 圆角；expressive 用 16dp，配合分组更松散。 */
    variant?: 'standard' | 'expressive'
    minWidth?: number
  }>(),
  { disabled: false, variant: 'standard', minWidth: 180 },
)

const open = ref(false)
const x = ref(0)
const y = ref(0)
const panelRef = ref<HTMLElement | null>(null)
const returnFocus = ref<HTMLElement | null>(null)

function items(): HTMLElement[] {
  const panel = panelRef.value
  if (!panel) return []
  return Array.from(panel.querySelectorAll<HTMLElement>('[role^="menuitem"]')).filter(
    (item) => item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled'),
  )
}

function focusItem(index: number): void {
  const list = items()
  if (list.length === 0) return
  list[(index + list.length) % list.length]?.focus({ preventScroll: true })
}

async function place(): Promise<void> {
  const panel = panelRef.value
  if (!panel) return
  const pad = 8
  const width = panel.offsetWidth
  const height = panel.offsetHeight
  const left = Math.min(Math.max(x.value, pad), Math.max(pad, window.innerWidth - width - pad))
  const top = Math.min(Math.max(y.value, pad), Math.max(pad, window.innerHeight - height - pad))
  panel.style.left = left + 'px'
  panel.style.top = top + 'px'
}

async function openAt(clientX: number, clientY: number): Promise<void> {
  if (props.disabled) return
  returnFocus.value = document.activeElement as HTMLElement | null
  x.value = clientX
  y.value = clientY
  open.value = true
  await nextTick()
  panelRef.value!.style.left = clientX + 'px'
  panelRef.value!.style.top = clientY + 'px'
  await place()
  focusItem(0)
}

function onContextMenu(event: MouseEvent): void {
  if (props.disabled) return
  event.preventDefault()
  void openAt(event.clientX, event.clientY)
}

function close(restoreFocus = true): void {
  if (!open.value) return
  open.value = false
  if (restoreFocus) returnFocus.value?.focus({ preventScroll: true })
}

/* 菜单跟着光标，页面一滚位置就失效了；直接收起比飘在错的地方好 */
useEventListener(
  window,
  'scroll',
  () => {
    if (open.value) close(false)
  },
  true,
)
useEventListener(window, 'resize', () => {
  if (open.value) void place()
})
/* Esc 走共享的栈：对话框里再开右键菜单时，一次 Esc 只关最上面那层 */
useEscapeStack(open, () => close())
useClickOutsideWhen(open, panelRef, () => close(false))

function onPanelKeydown(event: KeyboardEvent): void {
  const list = items()
  if (list.length === 0) return
  const index = list.indexOf(document.activeElement as HTMLElement)
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItem(index + 1)
      return
    case 'ArrowUp':
      event.preventDefault()
      focusItem(index <= 0 ? list.length - 1 : index - 1)
      return
    case 'Home':
      event.preventDefault()
      focusItem(0)
      return
    case 'End':
      event.preventDefault()
      focusItem(list.length - 1)
      return
    case 'Tab':
      close(false)
      return
  }
}

function onPanelClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  if (target?.closest('[role^="menuitem"], a, button')) close()
}

defineExpose({ openAt, close })
</script>

<template>
  <span class="md-context-menu__trigger" @contextmenu="onContextMenu">
    <slot name="trigger" />
  </span>

  <Teleport to="body">
    <Transition name="md-menu-pop">
      <div
        v-if="open"
        ref="panelRef"
        class="md-panel md-context-menu"
        :class="'md-context-menu--' + variant"
        :style="{ minWidth: minWidth + 'px' }"
        role="menu"
        tabindex="-1"
        @keydown="onPanelKeydown"
        @click="onPanelClick"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-context-menu__trigger {
  display: contents;
}

.md-context-menu {
  padding-block: 8px;
}

.md-context-menu--expressive {
  border-radius: var(--md-sys-shape-corner-large);
}

.md-context-menu :deep(.md-menu-item) {
  padding-inline: 12px;
}

.md-context-menu:focus {
  outline: none;
}

/* 与 M3Menu 同一套出入场：从落点长出来 */
.md-menu-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
  transform-origin: top left;
}

.md-menu-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  transform-origin: top left;
}

.md-menu-pop-enter-from,
.md-menu-pop-leave-to {
  opacity: 0;
  scale: 0.94;
}

@media (prefers-reduced-motion: reduce) {
  .md-menu-pop-enter-from,
  .md-menu-pop-leave-to {
    scale: 1;
  }
}
</style>
