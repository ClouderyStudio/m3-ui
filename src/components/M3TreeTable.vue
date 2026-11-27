<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconChevronRight } from '../icons'
import M3Icon from './M3Icon.vue'

/**
 * 树形表格：在表格里展开子行。
 *
 * 展开状态默认由组件自己管（受控时用 expanded + update:expanded）。
 * 子行不是嵌套表格，而是扁平化后加缩进 —— 只有这样列宽才能对齐，
 * 语义上也仍然是一条一条的 <tr>，读屏不会读成「表中有表」。
 */
export interface TreeTableColumn {
  key: string
  label: string
  width?: string
  align?: 'start' | 'center' | 'end'
}

export interface TreeTableRow {
  id: string | number
  children?: TreeTableRow[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    columns: TreeTableColumn[]
    rows: TreeTableRow[]
    /** 受控展开项；不传则自己管。 */
    expanded?: (string | number)[]
    /** 初始展开层数。 */
    defaultExpandDepth?: number
    dense?: boolean
    caption?: string
    emptyText?: string
  }>(),
  { expanded: undefined, defaultExpandDepth: 1, dense: false, caption: undefined, emptyText: '暂无数据' },
)

const emit = defineEmits<{
  'update:expanded': [ids: (string | number)[]]
  'row-click': [payload: { row: TreeTableRow; depth: number }]
}>()

const inner = ref<Set<string | number>>(initialExpanded())

function initialExpanded(): Set<string | number> {
  const ids = new Set<string | number>()
  if (props.expanded) return new Set(props.expanded)
  const walk = (rows: TreeTableRow[], depth: number) => {
    for (const row of rows) {
      if (row.children?.length && depth < props.defaultExpandDepth) ids.add(row.id)
      if (row.children) walk(row.children, depth + 1)
    }
  }
  walk(props.rows, 0)
  return ids
}

const expandedSet = computed(() => (props.expanded ? new Set(props.expanded) : inner.value))

interface FlatRow {
  row: TreeTableRow
  depth: number
  hasChildren: boolean
}

const flatRows = computed<FlatRow[]>(() => {
  const list: FlatRow[] = []
  const walk = (rows: TreeTableRow[], depth: number): void => {
    for (const row of rows) {
      const hasChildren = Boolean(row.children?.length)
      list.push({ row, depth, hasChildren })
      if (hasChildren && expandedSet.value.has(row.id)) walk(row.children!, depth + 1)
    }
  }
  walk(props.rows, 0)
  return list
})

function toggle(row: TreeTableRow): void {
  const next = new Set(expandedSet.value)
  if (next.has(row.id)) next.delete(row.id)
  else next.add(row.id)
  if (props.expanded === undefined) inner.value = next
  emit('update:expanded', [...next])
}

watch(
  () => props.expanded,
  (value) => {
    if (value === undefined) return
    inner.value = new Set(value)
  },
)

function alignOf(column: TreeTableColumn): 'start' | 'center' | 'end' {
  return column.align ?? 'start'
}
</script>

<template>
  <div class="md-tree-table" :class="{ 'is-dense': dense }">
    <table class="md-tree-table__table">
      <caption v-if="caption" class="md-tree-table__caption">
        {{ caption }}
      </caption>
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

      <tbody>
        <tr
          v-for="item in flatRows"
          :key="item.row.id"
          class="md-tree-table__row"
          @click="emit('row-click', { row: item.row, depth: item.depth })"
        >
          <td
            v-for="(column, columnIndex) in columns"
            :key="column.key"
            :style="{ textAlign: alignOf(column) }"
          >
            <span
              v-if="columnIndex === 0"
              class="md-tree-table__first"
              :style="{ paddingInlineStart: item.depth * 20 + 'px' }"
            >
              <button
                v-if="item.hasChildren"
                type="button"
                class="md-tree-table__toggle"
                :class="{ 'is-open': expandedSet.has(item.row.id) }"
                :aria-expanded="expandedSet.has(item.row.id)"
                :aria-label="expandedSet.has(item.row.id) ? '收起' : '展开'"
                @click.stop="toggle(item.row)"
              >
                <M3Icon :icon="IconChevronRight" :size="16" />
              </button>
              <span v-else class="md-tree-table__toggle-spacer" aria-hidden="true" />

              <slot :name="'cell-' + column.key" :row="item.row" :value="item.row[column.key]" :depth="item.depth">
                {{ item.row[column.key] ?? '—' }}
              </slot>
            </span>

            <slot
              v-else
              :name="'cell-' + column.key"
              :row="item.row"
              :value="item.row[column.key]"
              :depth="item.depth"
            >
              {{ item.row[column.key] ?? '—' }}
            </slot>
          </td>
        </tr>

        <tr v-if="flatRows.length === 0">
          <td :colspan="columns.length" class="md-tree-table__empty">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.md-tree-table {
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface);
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-tree-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-tree-table__caption {
  padding: 12px 16px;
  text-align: start;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-tree-table th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  padding: 12px 16px;
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  text-align: start;
  white-space: nowrap;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-tree-table td {
  padding: 12px 16px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-tree-table__row:last-child td {
  border-block-end: none;
}

@media (hover: hover) {
  .md-tree-table__row:hover td {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  }
}

.md-tree-table__first {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.md-tree-table__toggle,
.md-tree-table__toggle-spacer {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.md-tree-table__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: rotate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

.md-tree-table__toggle.is-open {
  rotate: 90deg;
}

@media (hover: hover) {
  .md-tree-table__toggle:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent);
  }
}

.md-tree-table.is-dense th,
.md-tree-table.is-dense td {
  padding-block: 6px;
}

.md-tree-table__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
