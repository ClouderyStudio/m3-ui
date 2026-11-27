<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * 可拖拽的分栏。
 *
 * 分隔条是 role="separator" + 方向键调节（每次 2%），因为纯鼠标拖动
 * 对键盘用户等于不存在。双击分隔条回到 50%。
 */
const props = withDefaults(
  defineProps<{
    /** 第一栏占比（0–100，v-model）。 */
    modelValue?: number
    min?: number
    max?: number
    direction?: 'horizontal' | 'vertical'
    /** 仅用于读写 localStorage 的记忆键。 */
    storageKey?: string
    disabled?: boolean
  }>(),
  { modelValue: 50, min: 10, max: 90, direction: 'horizontal', storageKey: undefined, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const rootRef = ref<HTMLElement | null>(null)
const inner = ref(loadInitial())
const dragging = ref(false)

function loadInitial(): number {
  if (props.storageKey && typeof localStorage !== 'undefined') {
    const stored = Number(localStorage.getItem('m3-splitter:' + props.storageKey))
    if (Number.isFinite(stored) && stored >= props.min && stored <= props.max) return stored
  }
  return props.modelValue
}

const size = computed(() => Math.min(props.max, Math.max(props.min, props.modelValue ?? inner.value)))

function commit(value: number): void {
  const next = Math.min(props.max, Math.max(props.min, value))
  inner.value = next
  emit('update:modelValue', next)
  if (props.storageKey && typeof localStorage !== 'undefined') {
    localStorage.setItem('m3-splitter:' + props.storageKey, String(next))
  }
}

function percentFromEvent(event: PointerEvent): number {
  const root = rootRef.value
  if (!root) return size.value
  const rect = root.getBoundingClientRect()
  if (props.direction === 'horizontal') {
    return ((event.clientX - rect.left) / rect.width) * 100
  }
  return ((event.clientY - rect.top) / rect.height) * 100
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  commit(percentFromEvent(event))
}

function onPointerUp(): void {
  dragging.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  const step = event.shiftKey ? 10 : 2
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    commit(size.value - step)
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    commit(size.value + step)
  } else if (event.key === 'Home') {
    event.preventDefault()
    commit(props.min)
  } else if (event.key === 'End') {
    event.preventDefault()
    commit(props.max)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    commit(50)
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) inner.value = value
  },
)

onBeforeUnmount(() => {
  dragging.value = false
})

defineExpose({ reset: () => commit(50) })
</script>

<template>
  <div
    ref="rootRef"
    class="md-splitter"
    :class="['md-splitter--' + direction, { 'is-dragging': dragging, 'is-disabled': disabled }]"
    :style="
      direction === 'horizontal'
        ? { gridTemplateColumns: size + '% 8px minmax(0, 1fr)' }
        : { gridTemplateRows: size + '% 8px minmax(0, 1fr)' }
    "
  >
    <div class="md-splitter__pane"><slot name="start" /></div>

    <div
      class="md-splitter__handle"
      role="separator"
      :aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(size)"
      :aria-valuemin="min"
      :aria-valuemax="max"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dblclick="commit(50)"
      @keydown="onKeydown"
    >
      <span class="md-splitter__grip" aria-hidden="true" />
    </div>

    <div class="md-splitter__pane"><slot name="end" /></div>
  </div>
</template>

<style scoped>
.md-splitter {
  display: grid;
  min-height: 0;
  min-width: 0;
  height: 100%;
}

.md-splitter__pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.md-splitter__handle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: col-resize;
  touch-action: none;
}

.md-splitter--vertical .md-splitter__handle {
  cursor: row-resize;
}

.md-splitter__grip {
  width: 2px;
  height: 100%;
  background-color: var(--md-sys-color-outline-variant);
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-splitter--vertical .md-splitter__grip {
  width: 100%;
  height: 2px;
}

.md-splitter__handle:hover .md-splitter__grip,
.md-splitter__handle:focus-visible .md-splitter__grip,
.md-splitter.is-dragging .md-splitter__grip {
  background-color: var(--md-sys-color-primary);
}

.md-splitter__handle:focus-visible {
  outline: 2px solid var(--md-sys-color-secondary);
  outline-offset: -2px;
}

.md-splitter.is-disabled .md-splitter__handle {
  cursor: default;
}
</style>
