<script setup lang="ts">
import { computed } from 'vue'
import { IconArrowDownward, IconArrowUpward } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Progress from './M3Progress.vue'

export type TableAlign = 'start' | 'center' | 'end'

export interface TableColumn {
  key: string
  label: string
  align?: TableAlign
  /** CSS width for the column, e.g. "120px" or "20%". */
  width?: string
  sortable?: boolean
}

export interface TableSort {
  key: string
  direction: 'asc' | 'desc'
}

type Row = Record<string, unknown>

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: Row[]
    /** Field name (or getter) that uniquely identifies a row. */
    rowKey?: string | ((row: Row, index: number) => string | number)
    /** Compact row height (36dp vs 52dp). */
    dense?: boolean
    /** Zebra striping for long, dense tables. */
    striped?: boolean
    /** Keep the header visible while the body scrolls. */
    stickyHeader?: boolean
    /** Shows a linear progress bar and marks the table busy. */
    loading?: boolean
    emptyText?: string
    caption?: string
    /** Controlled sort state. Sorting itself is the consumer's job. */
    sort?: TableSort | null
  }>(),
  {
    rowKey: undefined,
    dense: false,
    striped: false,
    stickyHeader: false,
    loading: false,
    emptyText: '暂无数据',
    caption: undefined,
    sort: null,
  },
)

const emit = defineEmits<{
  'update:sort': [sort: TableSort | null]
  'row-click': [payload: { row: Row; index: number }]
}>()

function rowKey(row: Row, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  if (typeof props.rowKey === 'string') {
    const value = row[props.rowKey]
    if (value !== undefined && value !== null) return String(value)
  }
  return index
}

function alignStyle(column: TableColumn): Record<string, string> {
  return {
    textAlign: column.align ?? 'start',
    ...(column.width ? { width: column.width } : {}),
  }
}

function format(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function ariaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (props.sort?.key !== column.key) return 'none'
  return props.sort.direction === 'asc' ? 'ascending' : 'descending'
}

function toggleSort(column: TableColumn): void {
  if (!column.sortable) return
  const current = props.sort
  if (current?.key !== column.key) {
    emit('update:sort', { key: column.key, direction: 'asc' })
    return
  }
  emit('update:sort', { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' })
}

const sortedKey = computed(() => props.sort?.key)
const sortedDirection = computed(() => props.sort?.direction)
</script>

<template>
  <div class="md-table-wrap" :class="{ 'is-loading': loading }">
    <div v-if="loading" class="md-table__loading">
      <M3Progress variant="linear" label="正在加载表格" />
    </div>

    <div class="md-table__scroll" :class="{ 'md-table__scroll--sticky': stickyHeader }">
      <table
        class="md-table"
        :class="{ 'md-table--dense': dense, 'md-table--striped': striped }"
        :aria-busy="loading ? 'true' : undefined"
      >
        <caption v-if="caption" class="md-table__caption">
          {{ caption }}
        </caption>

        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="md-table__th"
              :style="alignStyle(column)"
              :aria-sort="ariaSort(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="md-table__sort"
                @click="toggleSort(column)"
              >
                <span>{{ column.label }}</span>
                <M3Icon
                  v-if="sortedKey === column.key"
                  :icon="sortedDirection === 'asc' ? IconArrowUpward : IconArrowDownward"
                  :size="16"
                  class="md-table__sort-icon"
                />
              </button>
              <template v-else>{{ column.label }}</template>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="rowKey(row, index)"
            class="md-table__row"
            @click="emit('row-click', { row, index })"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="md-table__td"
              :style="{ textAlign: column.align ?? 'start' }"
            >
              <slot
                :name="'cell-' + column.key"
                :row="row"
                :value="row[column.key]"
                :index="index"
              >
                {{ format(row[column.key]) }}
              </slot>
            </td>
          </tr>

          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="md-table__empty">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.md-table-wrap {
  position: relative;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface);
  overflow: hidden;
}

.md-table__loading {
  position: absolute;
  z-index: 5;
  inset-block-start: 0;
  inset-inline: 0;
}

.md-table__scroll {
  overflow: auto;
  /*
   * 只对横向做 overscroll 收敛。
   * 早先写的是 overscroll-behavior: contain —— 它会在**没有纵向溢出**的容器上
   * 也拦住滚动链，于是鼠标停在表格上时整页滚不动（表格本身没什么可滚的）。
   */
  overscroll-behavior-x: contain;
}

.md-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-table__caption {
  padding: 12px 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  text-align: start;
}

.md-table__th {
  padding: 12px 16px;
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  text-align: start;
  white-space: nowrap;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-table__scroll--sticky .md-table__th {
  position: sticky;
  inset-block-start: 0;
  z-index: 2;
}

.md-table__sort {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: -4px -6px;
  padding: 4px 6px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-table__sort:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
    color: var(--md-sys-color-on-surface);
  }
}

.md-table__sort-icon {
  color: var(--md-sys-color-primary);
}

.md-table__td {
  padding: 14px 16px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  vertical-align: middle;
}

.md-table__row:last-child .md-table__td {
  border-block-end: none;
}

@media (hover: hover) {
  .md-table__row:hover .md-table__td {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  }
}

.md-table--striped .md-table__row:nth-child(even) .md-table__td {
  background-color: var(--md-sys-color-surface-container-low);
}

.md-table--striped .md-table__row:hover .md-table__td {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-on-surface) 6%,
    var(--md-sys-color-surface-container-low)
  );
}

.md-table--dense .md-table__th {
  padding-block: 8px;
}

.md-table--dense .md-table__td {
  padding-block: 8px;
}

.md-table__empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}

.md-table-wrap.is-loading .md-table__scroll {
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .md-table__sort {
    transition-duration: 1ms;
  }
}
</style>
