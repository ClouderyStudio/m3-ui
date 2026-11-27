<script setup lang="ts">
import { computed } from 'vue'
import { parseIsoDate, toIsoDate } from '../utils/date'

/**
 * 日历热力图（贡献图）。
 *
 * 颜色用 primary 的四档透明度，而不是四支写死的色值 ——
 * 换主题时整张图会跟着变，不需要另外维护一套色板。
 * 空值与「值很小」必须能区分：前者是容器底色，后者是最浅的一档。
 */
const props = withDefaults(
  defineProps<{
    /** 日期（YYYY-MM-DD）→ 数值。 */
    values: Record<string, number>
    /** 显示多少周。 */
    weeks?: number
    /** 结束日期；默认今天。 */
    endDate?: string
    cellSize?: number
    gap?: number
    locale?: string
    showLegend?: boolean
    showMonthLabels?: boolean
    unit?: string
  }>(),
  {
    weeks: 26,
    endDate: undefined,
    cellSize: 12,
    gap: 3,
    locale: undefined,
    showLegend: true,
    showMonthLabels: true,
    unit: '次',
  },
)

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const end = computed(() => parseIsoDate(props.endDate) ?? new Date())

const start = computed(() => {
  const value = new Date(end.value)
  // 对齐到周末（周六），这样最后一列总是完整的
  value.setDate(value.getDate() + (6 - value.getDay()))
  value.setDate(value.getDate() - (props.weeks * 7 - 1))
  return value
})

interface Cell {
  date: string
  value: number
  level: number
  label: string
}

const max = computed(() => Math.max(0, ...Object.values(props.values)))

function levelOf(value: number): number {
  if (value <= 0) return 0
  if (max.value <= 0) return 0
  const ratio = value / max.value
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

const columns = computed<Cell[][]>(() => {
  const list: Cell[][] = []
  const cursor = new Date(start.value)
  const weekdayFormat = (() => {
    try {
      return new Intl.DateTimeFormat(props.locale, { weekday: 'narrow' })
    } catch {
      return null
    }
  })()

  for (let week = 0; week < props.weeks; week += 1) {
    const column: Cell[] = []
    for (let day = 0; day < 7; day += 1) {
      const date = toIsoDate(cursor)
      const value = props.values[date] ?? 0
      column.push({
        date,
        value,
        level: levelOf(value),
        label: date + ' · ' + value + ' ' + props.unit + (weekdayFormat ? ' ' + weekdayFormat.format(cursor) : ''),
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    list.push(column)
  }
  return list
})

const monthLabels = computed(() => {
  const labels: { text: string; index: number }[] = []
  let lastMonth = -1
  columns.value.forEach((column, index) => {
    const first = column[0]
    if (!first) return
    const month = Number(first.date.slice(5, 7))
    if (month === lastMonth) return
    lastMonth = month
    labels.push({ text: month + ' 月', index })
  })
  return labels
})

const weekdayLabels = computed(() => [1, 3, 5].map((index) => WEEKDAYS[index]?.slice(1) ?? ''))

const total = computed(() => Object.values(props.values).reduce((sum, value) => sum + value, 0))
</script>

<template>
  <section class="md-heatmap" :aria-label="'活动热力图，共 ' + total + ' ' + unit">
    <div class="md-heatmap__scroll">
      <div class="md-heatmap__grid" :style="{ gap: gap + 'px' }">
        <div class="md-heatmap__weekdays" aria-hidden="true">
          <span v-for="(label, index) in weekdayLabels" :key="index">{{ label }}</span>
        </div>

        <div class="md-heatmap__body">
          <div v-if="showMonthLabels" class="md-heatmap__months" aria-hidden="true">
            <span
              v-for="label in monthLabels"
              :key="label.text + label.index"
              class="md-heatmap__month"
              :style="{ insetInlineStart: 'calc(' + label.index + ' * (' + cellSize + 'px + ' + gap + 'px))' }"
            >
              {{ label.text }}
            </span>
          </div>

          <div class="md-heatmap__columns">
            <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="md-heatmap__column">
              <span
                v-for="cell in column"
                :key="cell.date"
                class="md-heatmap__cell"
                :class="'is-level-' + cell.level"
                :style="{ width: cellSize + 'px', height: cellSize + 'px' }"
                :title="cell.label"
                :aria-label="cell.label"
                role="img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer v-if="showLegend" class="md-heatmap__legend">
      <span>少</span>
      <span v-for="level in [0, 1, 2, 3, 4]" :key="level" class="md-heatmap__cell" :class="'is-level-' + level" :style="{ width: cellSize + 'px', height: cellSize + 'px' }" />
      <span>多</span>
      <span class="md-heatmap__total">共 {{ total }} {{ unit }}</span>
    </footer>
  </section>
</template>

<style scoped>
.md-heatmap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface-variant);
}

.md-heatmap__scroll {
  overflow-x: auto;
  padding-block-end: 4px;
}

.md-heatmap__grid {
  display: flex;
  gap: 6px;
  min-width: max-content;
}

.md-heatmap__weekdays {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 18px 0;
  font-size: 10px;
}

.md-heatmap__body {
  position: relative;
  padding-block-start: 18px;
}

.md-heatmap__months {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: 14px;
  font-size: 10px;
}

.md-heatmap__month {
  position: absolute;
  white-space: nowrap;
}

.md-heatmap__columns {
  display: flex;
  gap: inherit;
}

.md-heatmap__column {
  display: flex;
  flex-direction: column;
  gap: inherit;
}

.md-heatmap__cell {
  border-radius: 3px;
  background-color: var(--md-sys-color-surface-container-high);
  display: inline-block;
}

.md-heatmap__cell.is-level-1 {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 22%, transparent);
}

.md-heatmap__cell.is-level-2 {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 42%, transparent);
}

.md-heatmap__cell.is-level-3 {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 64%, transparent);
}

.md-heatmap__cell.is-level-4 {
  background-color: var(--md-sys-color-primary);
}

.md-heatmap__legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.md-heatmap__total {
  margin-inline-start: auto;
  font-variant-numeric: tabular-nums;
}
</style>
