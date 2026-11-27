<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * 仪表盘网格：固定列、可跨列跨行、拖拽排序。
 *
 * 排序只改「显示顺序」，不改每个卡片的 span —— 后者由数据决定。
 * 拖拽用原生 HTML5 DnD：它自带拖影和放置反馈，比自绘一套 pointer 拖拽省得多，
 * 键盘排序则通过「上移/下移」按钮补齐（拖拽对键盘用户不可用）。
 */
export interface DashboardItem {
  id: string
  title?: string
  /** 跨几列。 */
  cols?: number
  /** 跨几行。 */
  rows?: number
}

const props = withDefaults(
  defineProps<{
    items: DashboardItem[]
    /** 受控顺序（id 数组）。 */
    modelValue?: string[]
    columns?: number
    gap?: number
    rowHeight?: number
    editable?: boolean
  }>(),
  { modelValue: undefined, columns: 4, gap: 12, rowHeight: 140, editable: true },
)

const emit = defineEmits<{
  'update:modelValue': [order: string[]]
  'item-click': [item: DashboardItem]
}>()

const draggingId = ref<string | null>(null)
const overId = ref<string | null>(null)

const order = computed<string[]>(() => {
  const ids = props.modelValue ?? props.items.map((item) => item.id)
  // 数据里新增/删除了卡片时，按 items 的顺序补齐，避免旧顺序把新卡片漏掉
  const known = new Set(props.items.map((item) => item.id))
  const kept = ids.filter((id) => known.has(id))
  const missing = props.items.filter((item) => !kept.includes(item.id)).map((item) => item.id)
  return [...kept, ...missing]
})

const orderedItems = computed(() =>
  order.value
    .map((id) => props.items.find((item) => item.id === id))
    .filter((item): item is DashboardItem => Boolean(item)),
)

function move(fromId: string, toId: string): void {
  if (fromId === toId) return
  const next = [...order.value]
  const from = next.indexOf(fromId)
  const to = next.indexOf(toId)
  if (from < 0 || to < 0) return
  next.splice(from, 1)
  next.splice(to, 0, fromId)
  emit('update:modelValue', next)
}

function shift(id: string, delta: number): void {
  const next = [...order.value]
  const index = next.indexOf(id)
  const target = index + delta
  if (index < 0 || target < 0 || target >= next.length) return
  next.splice(index, 1)
  next.splice(target, 0, id)
  emit('update:modelValue', next)
}

function onDragStart(event: DragEvent, id: string): void {
  if (!props.editable) return
  draggingId.value = id
  event.dataTransfer?.setData('text/plain', id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(event: DragEvent, id: string): void {
  if (!props.editable) return
  event.preventDefault()
  overId.value = id
}

function onDrop(event: DragEvent, id: string): void {
  if (!props.editable) return
  event.preventDefault()
  const from = draggingId.value ?? event.dataTransfer?.getData('text/plain')
  if (from) move(from, id)
  draggingId.value = null
  overId.value = null
}
</script>

<template>
  <div
    class="md-dashboard"
    :style="{ gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))', gap: gap + 'px', gridAutoRows: rowHeight + 'px' }"
  >
    <section
      v-for="(item, index) in orderedItems"
      :key="item.id"
      class="md-dashboard__item"
      :class="{ 'is-dragging': draggingId === item.id, 'is-over': overId === item.id }"
      :style="{ gridColumn: 'span ' + (item.cols ?? 1), gridRow: 'span ' + (item.rows ?? 1) }"
      :draggable="editable"
      @dragstart="onDragStart($event, item.id)"
      @dragover="onDragOver($event, item.id)"
      @drop="onDrop($event, item.id)"
      @dragend="draggingId = null; overId = null"
    >
      <header class="md-dashboard__header">
        <span class="md-dashboard__title">{{ item.title }}</span>
        <span v-if="editable" class="md-dashboard__tools">
          <button type="button" class="md-dashboard__move" :disabled="index === 0" aria-label="前移" @click.stop="shift(item.id, -1)">←</button>
          <button type="button" class="md-dashboard__move" :disabled="index === orderedItems.length - 1" aria-label="后移" @click.stop="shift(item.id, 1)">→</button>
        </span>
      </header>

      <div class="md-dashboard__body" @click="emit('item-click', item)">
        <slot name="item" :item="item" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.md-dashboard {
  display: grid;
  width: 100%;
}

.md-dashboard__item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-medium);
  border: 1px solid var(--md-sys-color-outline-variant);
  background-color: var(--md-sys-color-surface-container-low);
  font-family: var(--md-ref-typeface-plain);
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-dashboard__item.is-dragging {
  opacity: 0.5;
}

.md-dashboard__item.is-over {
  box-shadow: 0 0 0 2px var(--md-sys-color-primary);
}

.md-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  cursor: grab;
}

.md-dashboard__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
}

.md-dashboard__tools {
  display: inline-flex;
  gap: 2px;
}

.md-dashboard__move {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  cursor: pointer;
}

.md-dashboard__move:disabled {
  opacity: 0.32;
  cursor: default;
}

.md-dashboard__move:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.md-dashboard__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}
</style>
