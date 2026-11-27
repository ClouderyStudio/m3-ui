<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IconComponent } from '../icons'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3Checkbox from './M3Checkbox.vue'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 穿梭框：左边可选、右边已选，v-model 只记「已选的值」。
 *
 * 之所以不让两侧各自持有数组：两个数组一旦同时可写，就会出现
 * 「左边还显示着、右边已经加过」这种中间态。这里把 items 当全集、
 * 把 modelValue 当子集，两侧都是它的派生结果，怎么移动都不会重复或丢失。
 *
 * 移动方式给了三种，因为不同人习惯不同：勾选后点箭头（精确）、
 * 双击整行（快）、键盘 Space 勾选 / Enter 直送（无障碍）。
 */
export interface TransferItem {
  value: string | number
  label: string
  description?: string
  icon?: IconComponent | null
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 已选中的值（v-model）。 */
    modelValue: (string | number)[]
    /** 全集。 */
    items: TransferItem[]
    sourceTitle?: string
    targetTitle?: string
    /** 两侧都显示搜索框。 */
    filterable?: boolean
    searchPlaceholder?: string
    emptyText?: string
    /** 列表滚动区高度。 */
    listHeight?: string
    disabled?: boolean
  }>(),
  {
    sourceTitle: '可选',
    targetTitle: '已选',
    filterable: false,
    searchPlaceholder: '搜索',
    emptyText: '没有内容',
    listHeight: '280px',
    disabled: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [values: (string | number)[]] }>()

const sourceQuery = ref('')
const targetQuery = ref('')
const sourceChecked = ref<(string | number)[]>([])
const targetChecked = ref<(string | number)[]>([])

const targetSet = computed(() => new Set(props.modelValue))
const itemMap = computed(() => new Map(props.items.map((item) => [item.value, item])))

function matches(item: TransferItem, query: string): boolean {
  if (!query.trim()) return true
  const keyword = query.trim().toLowerCase()
  return (
    item.label.toLowerCase().includes(keyword) ||
    (item.description?.toLowerCase().includes(keyword) ?? false)
  )
}

const sourceItems = computed(() =>
  props.items.filter((item) => !targetSet.value.has(item.value) && matches(item, sourceQuery.value)),
)

const targetItems = computed(() =>
  props.modelValue
    .map((value) => itemMap.value.get(value))
    .filter((item): item is TransferItem => Boolean(item) && matches(item!, targetQuery.value)),
)

type Side = 'source' | 'target'

function toggle(side: Side, value: string | number): void {
  const target = side === 'source' ? sourceChecked : targetChecked
  target.value = target.value.includes(value)
    ? target.value.filter((entry) => entry !== value)
    : [...target.value, value]
}

function move(values: (string | number)[]): void {
  if (props.disabled || values.length === 0) return
  const selectable = values.filter((value) => !itemMap.value.get(value)?.disabled)
  if (selectable.length === 0) return
  emit('update:modelValue', [...new Set([...props.modelValue, ...selectable])])
  sourceChecked.value = sourceChecked.value.filter((value) => !selectable.includes(value))
}

function remove(values: (string | number)[]): void {
  if (props.disabled || values.length === 0) return
  const removing = new Set(values)
  emit('update:modelValue', props.modelValue.filter((value) => !removing.has(value)))
  targetChecked.value = targetChecked.value.filter((value) => !removing.has(value))
}

const sourceValues = computed(() => sourceItems.value.map((item) => item.value))
const targetValues = computed(() => targetItems.value.map((item) => item.value))

function moveRow(value: string | number): void {
  if (targetSet.value.has(value)) remove([value])
  else move([value])
}

function onRowKeydown(event: KeyboardEvent, value: string | number): void {
  if (event.key === ' ') {
    event.preventDefault()
    toggle(targetSet.value.has(value) ? 'target' : 'source', value)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    moveRow(value)
  }
}
</script>

<template>
  <div class="md-transfer" :class="{ 'is-disabled': disabled }">
    <!-- 源 -->
    <section class="md-transfer__pane" aria-labelledby="transfer-source">
      <header class="md-transfer__header">
        <span id="transfer-source" class="md-transfer__title">{{ sourceTitle }}</span>
        <span class="md-transfer__count">{{ sourceItems.length }}</span>
      </header>

      <label v-if="filterable" class="md-transfer__search">
        <input v-model="sourceQuery" type="search" :placeholder="searchPlaceholder" :disabled="disabled" />
      </label>

      <ul
        class="md-transfer__list"
        :style="{ maxBlockSize: listHeight }"
        role="listbox"
        aria-multiselectable="true"
        :aria-label="sourceTitle"
      >
        <li
          v-for="item in sourceItems"
          :key="item.value"
          class="md-transfer__row"
          :class="{ 'is-checked': sourceChecked.includes(item.value), 'is-disabled': item.disabled }"
          role="option"
          :aria-selected="sourceChecked.includes(item.value)"
          :tabindex="item.disabled ? -1 : 0"
          @click="!disabled && !item.disabled && toggle('source', item.value)"
          @dblclick="!disabled && !item.disabled && moveRow(item.value)"
          @keydown="onRowKeydown($event, item.value)"
        >
          <span class="md-transfer__check" @click.stop>
            <M3Checkbox
              :model-value="sourceChecked.includes(item.value)"
              :disabled="disabled || item.disabled"
              :aria-label="item.label"
              @update:model-value="toggle('source', item.value)"
            />
          </span>
          <M3Icon v-if="item.icon" :icon="item.icon" :size="20" class="md-transfer__icon" />
          <span class="md-transfer__text">
            <span class="md-transfer__label">{{ item.label }}</span>
            <span v-if="item.description" class="md-transfer__desc">{{ item.description }}</span>
          </span>
        </li>

        <li v-if="sourceItems.length === 0" class="md-transfer__empty">{{ emptyText }}</li>
      </ul>
    </section>

    <!-- 中间操作 -->
    <div class="md-transfer__actions">
      <M3IconButton
        :icon="IconChevronRight"
        label="全部移到已选"
        size="sm"
        variant="tonal"
        :disabled="disabled || sourceValues.length === 0"
        @click="move(sourceValues)"
      />
      <M3IconButton
        :icon="IconChevronRight"
        :label="'移入 ' + sourceChecked.length + ' 项'"
        size="sm"
        variant="filled"
        :disabled="disabled || sourceChecked.length === 0"
        @click="move(sourceChecked)"
      />
      <M3IconButton
        :icon="IconChevronLeft"
        :label="'移出 ' + targetChecked.length + ' 项'"
        size="sm"
        variant="filled"
        :disabled="disabled || targetChecked.length === 0"
        @click="remove(targetChecked)"
      />
      <M3IconButton
        :icon="IconChevronLeft"
        label="全部移出"
        size="sm"
        variant="tonal"
        :disabled="disabled || targetValues.length === 0"
        @click="remove(targetValues)"
      />
    </div>

    <!-- 目标 -->
    <section class="md-transfer__pane" aria-labelledby="transfer-target">
      <header class="md-transfer__header">
        <span id="transfer-target" class="md-transfer__title">{{ targetTitle }}</span>
        <span class="md-transfer__count">{{ targetItems.length }}</span>
      </header>

      <label v-if="filterable" class="md-transfer__search">
        <input v-model="targetQuery" type="search" :placeholder="searchPlaceholder" :disabled="disabled" />
      </label>

      <ul
        class="md-transfer__list"
        :style="{ maxBlockSize: listHeight }"
        role="listbox"
        aria-multiselectable="true"
        :aria-label="targetTitle"
      >
        <li
          v-for="item in targetItems"
          :key="item.value"
          class="md-transfer__row"
          :class="{ 'is-checked': targetChecked.includes(item.value), 'is-disabled': item.disabled }"
          role="option"
          :aria-selected="targetChecked.includes(item.value)"
          :tabindex="item.disabled ? -1 : 0"
          @click="!disabled && !item.disabled && toggle('target', item.value)"
          @dblclick="!disabled && !item.disabled && moveRow(item.value)"
          @keydown="onRowKeydown($event, item.value)"
        >
          <span class="md-transfer__check" @click.stop>
            <M3Checkbox
              :model-value="targetChecked.includes(item.value)"
              :disabled="disabled || item.disabled"
              :aria-label="item.label"
              @update:model-value="toggle('target', item.value)"
            />
          </span>
          <M3Icon v-if="item.icon" :icon="item.icon" :size="20" class="md-transfer__icon" />
          <span class="md-transfer__text">
            <span class="md-transfer__label">{{ item.label }}</span>
            <span v-if="item.description" class="md-transfer__desc">{{ item.description }}</span>
          </span>
        </li>

        <li v-if="targetItems.length === 0" class="md-transfer__empty">{{ emptyText }}</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.md-transfer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-transfer__pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
  background-color: var(--md-sys-color-surface);
}

.md-transfer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--md-sys-color-surface-container-low);
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-transfer__title {
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
}

.md-transfer__count {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
}

.md-transfer__search {
  display: block;
  padding: 8px 12px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-transfer__search input {
  width: 100%;
  height: 32px;
  padding-inline: 10px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full);
  background-color: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--md-sys-typescale-body-small-size);
  outline: none;
}

.md-transfer__search input:focus {
  border-color: var(--md-sys-color-primary);
}

.md-transfer__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding-block: 4px;
  overflow-y: auto;
  list-style: none;
  min-block-size: 160px;
}

.md-transfer__row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding-inline: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-transfer__row:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  }
}

.md-transfer__row:focus-visible {
  outline: 2px solid var(--md-sys-color-secondary);
  outline-offset: -2px;
}

.md-transfer__row.is-checked {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 10%, transparent);
}

.md-transfer__check {
  display: inline-flex;
  flex-shrink: 0;
}

.md-transfer__icon {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-transfer__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.md-transfer__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-transfer__desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-transfer__empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-transfer__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.md-transfer.is-disabled {
  opacity: 0.6;
}

/* 窄屏：两栏改上下，箭头转 90° */
@media (max-width: 720px) {
  .md-transfer {
    grid-template-columns: minmax(0, 1fr);
  }

  .md-transfer__actions {
    flex-direction: row;
    justify-content: center;
  }

  .md-transfer__actions :deep(.md-icon) {
    rotate: 90deg;
  }
}
</style>
