<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TreeTableColumn } from './M3TreeTable.vue'

/**
 * 虚拟滚动表格：只渲染可视区附近的行。
 *
 * 一万行 × 十列如果全量渲染，首次挂载要几百毫秒、滚动也会发涩；
 * 这里只按 scrollTop 算出可见区间，上下用两个占位行撑出滚动高度。
 * 要求行高固定 —— 变高行需要测量缓存，那是另一套东西（也慢得多）。
 */
const props = withDefaults(
  defineProps<{
    columns: TreeTableColumn[]
    rows: Record<string, unknown>[]
    /** 固定行高（px）。 */
    rowHeight?: number
    /** 滚动区高度。 */
    height?: number
    /** 可视区上下各多渲染几行。 */
    overscan?: number
    dense?: boolean
    emptyText?: string
  }>(),
  { rowHeight: 44, height: 360, overscan: 6, dense: false, emptyText: '暂无数据' },
)

const scrollTop = ref(0)
const viewportRef = ref<HTMLElement | null>(null)

const total = computed(() => props.rows.length)
const visibleCount = computed(() => Math.ceil(props.height / props.rowHeight) + props.overscan * 2)
const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - props.overscan),
)
const endIndex = computed(() => Math.min(total.value, startIndex.value + visibleCount.value))

const visibleRows = computed(() =>
  props.rows.slice(startIndex.value, endIndex.value).map((row, offset) => ({
    row,
    index: startIndex.value + offset,
  })),
)

const topSpacer = computed(() => startIndex.value * props.rowHeight)
const bottomSpacer = computed(() => Math.max(0, (total.value - endIndex.value) * props.rowHeight))

function onScroll(): void {
  scrollTop.value = viewportRef.value?.scrollTop ?? 0
}

function alignOf(column: TreeTableColumn): 'start' | 'center' | 'end' {
  return column.align ?? 'start'
}
</script>

<template>
  <div class="md-virtual-table">
    <div class="md-virtual-table__header">
      <table class="md-virtual-table__table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :style="{ width: column.width, textAlign: alignOf(column) }"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <div
      ref="viewportRef"
      class="md-virtual-table__body"
      :style="{ height: height + 'px' }"
      @scroll.passive="onScroll"
    >
      <table class="md-virtual-table__table">
        <tbody>
          <tr aria-hidden="true" :style="{ height: topSpacer + 'px' }">
            <td :colspan="columns.length" class="md-virtual-table__spacer" />
          </tr>

          <tr
            v-for="entry in visibleRows"
            :key="entry.index"
            class="md-virtual-table__row"
            :class="{ 'is-dense': dense }"
            :style="{ height: rowHeight + 'px' }"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :style="{ textAlign: alignOf(column) }"
            >
              <slot
                :name="'cell-' + column.key"
                :row="entry.row"
                :value="entry.row[column.key]"
                :index="entry.index"
              >
                {{ entry.row[column.key] ?? '—' }}
              </slot>
            </td>
          </tr>

          <tr aria-hidden="true" :style="{ height: bottomSpacer + 'px' }">
            <td :colspan="columns.length" class="md-virtual-table__spacer" />
          </tr>

          <tr v-if="total === 0">
            <td :colspan="columns.length" class="md-virtual-table__empty">{{ emptyText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="md-virtual-table__meta">
      共 {{ total }} 行，当前渲染 {{ startIndex }}–{{ Math.max(startIndex, endIndex - 1) }} 行
    </p>
  </div>
</template>

<style scoped>
.md-virtual-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
  background-color: var(--md-sys-color-surface);
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-virtual-table__table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: var(--md-sys-typescale-body-medium-size);
}

.md-virtual-table__header {
  background-color: var(--md-sys-color-surface-container-low);
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-virtual-table__header th {
  padding: 10px 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  text-align: start;
  white-space: nowrap;
}

.md-virtual-table__body {
  overflow: auto;
}

.md-virtual-table__row td {
  padding: 0 16px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-virtual-table__row.is-dense td {
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-virtual-table__spacer {
  padding: 0;
  border: none;
}

.md-virtual-table__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}

.md-virtual-table__meta {
  margin: 0;
  padding: 6px 12px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
}
</style>
