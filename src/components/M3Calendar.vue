<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3Icon from './M3Icon.vue'

/**
 * 月历网格（日期 / 日期区间 / 可用性日历共用的底座）。
 *
 * 三个不那么显眼但必须做对的点：
 *   1. 日期一律用本地日期字符串（YYYY-MM-DD）而不是 Date 对象跨时区传递，
 *      否则「选了 11 月 1 日」在东八区会变成 10 月 31 日。
 *   2. 固定渲染 6 行 42 格：月份切换时高度不跳，翻月不会把下面的内容顶来顶去。
 *   3. 相邻月份的日子默认淡化但仍可点（很多人习惯点边缘那几天）。
 *
 * #day 插槽可以把格子换成价格、可用性、热力值等内容，网格与键盘行为不变。
 */
const props = withDefaults(
  defineProps<{
    /** 选中日期（YYYY-MM-DD）。 */
    modelValue?: string | null
    /** 受控显示月份（YYYY-MM）；不传则跟随选中值/今天。 */
    month?: string
    /** 最小 / 最大可选日期。 */
    min?: string
    max?: string
    /** 区间起点（区间选择器用；与 modelValue 互不影响）。 */
    rangeStart?: string | null
    /** 区间终点。 */
    rangeEnd?: string | null
    /** 尚未确定的另一端（悬停预览）。 */
    rangePreview?: string | null
    /** 额外禁用规则。 */
    disabledDate?: (date: string) => boolean
    /** 一周从周几开始：0 周日、1 周一。 */
    weekStartsOn?: 0 | 1
    /** 显示相邻月份的日期。 */
    showAdjacent?: boolean
    /** 星期与月份标题的语言。 */
    locale?: string
    ariaLabel?: string
  }>(),
  {
    modelValue: null,
    month: undefined,
    min: undefined,
    max: undefined,
    rangeStart: null,
    rangeEnd: null,
    rangePreview: null,
    disabledDate: undefined,
    weekStartsOn: 1,
    showAdjacent: true,
    locale: undefined,
    ariaLabel: '日期',
  },
)

const emit = defineEmits<{
  'update:modelValue': [date: string | null]
  'update:month': [month: string]
  /** 悬停到某一天（区间选择用它做预览）。 */
  hover: [date: string | null]
}>()

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function isoOf(year: number, month: number, day: number): string {
  return year + '-' + pad(month + 1) + '-' + pad(day)
}

function parseIso(value: string | null | undefined): { year: number; month: number; day: number } | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) }
}

function todayIso(): string {
  const now = new Date()
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate())
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

const initial = parseIso(props.month ? props.month + '-01' : props.modelValue) ?? parseIso(todayIso())!
const view = ref({ year: initial.year, month: initial.month })
const mode = ref<'days' | 'months'>('days')
const focusedDate = ref<string | null>(props.modelValue ?? null)

watch(
  () => props.month,
  (value) => {
    const parsed = value ? parseIso(value + '-01') : null
    if (parsed) view.value = { year: parsed.year, month: parsed.month }
  },
)

watch(
  () => props.modelValue,
  (value) => {
    focusedDate.value = value ?? null
    const parsed = parseIso(value)
    if (parsed) view.value = { year: parsed.year, month: parsed.month }
  },
)

const locale = computed(() => {
  if (props.locale) return props.locale
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : ''
  return lang || undefined
})

const monthLabel = computed(() => {
  try {
    return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long' }).format(
      new Date(view.value.year, view.value.month, 1),
    )
  } catch {
    return view.value.year + ' 年 ' + (view.value.month + 1) + ' 月'
  }
})

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekdays = computed(() => {
  const order = [0, 1, 2, 3, 4, 5, 6].map((index) => (index + props.weekStartsOn) % 7)
  return order.map((weekday) => {
    try {
      return new Intl.DateTimeFormat(locale.value, { weekday: 'narrow' }).format(new Date(2023, 0, 1 + weekday))
    } catch {
      return WEEKDAYS[weekday]
    }
  })
})

interface Cell {
  date: string
  day: number
  outside: boolean
  disabled: boolean
  today: boolean
}

function isDisabled(date: string): boolean {
  if (props.min && date < props.min) return true
  if (props.max && date > props.max) return true
  return props.disabledDate?.(date) ?? false
}

const cells = computed<Cell[]>(() => {
  const year = view.value.year
  const month = view.value.month
  const first = new Date(year, month, 1)
  const offset = (first.getDay() - props.weekStartsOn + 7) % 7
  const today = todayIso()
  const total = 42
  const list: Cell[] = []

  for (let index = 0; index < total; index += 1) {
    const dayOffset = index - offset + 1
    const date = new Date(year, month, dayOffset)
    const dateString = isoOf(date.getFullYear(), date.getMonth(), date.getDate())
    list.push({
      date: dateString,
      day: date.getDate(),
      outside: date.getMonth() !== month,
      disabled: isDisabled(dateString),
      today: dateString === today,
    })
  }
  return list
})

function goMonth(delta: number): void {
  const next = new Date(view.value.year, view.value.month + delta, 1)
  view.value = { year: next.getFullYear(), month: next.getMonth() }
  emit('update:month', next.getFullYear() + '-' + pad(next.getMonth() + 1))
}

function goYear(delta: number): void {
  view.value = { year: view.value.year + delta, month: view.value.month }
  emit('update:month', view.value.year + '-' + pad(view.value.month + 1))
}

function pickMonth(month: number): void {
  view.value = { year: view.value.year, month }
  mode.value = 'days'
}

/** 区间内的日子：端点之间（含预览的另一端）涂一层浅色底。 */
function inRange(date: string): boolean {
  const start = props.rangeStart
  if (!start) return false
  const end = props.rangeEnd ?? props.rangePreview ?? start
  const low = start <= end ? start : end
  const high = start <= end ? end : start
  return date > low && date < high
}

function select(cell: Cell): void {
  if (cell.disabled) return
  emit('update:modelValue', cell.date)
  focusedDate.value = cell.date
}

function onGridKeydown(event: KeyboardEvent): void {
  const current = focusedDate.value ?? props.modelValue ?? todayIso()
  const date = parseIso(current)
  if (!date) return
  const step = (days: number) => {
    const next = new Date(date.year, date.month, date.day + days)
    const iso = isoOf(next.getFullYear(), next.getMonth(), next.getDate())
    if (props.min && iso < props.min) return null
    if (props.max && iso > props.max) return null
    return iso
  }

  let next: string | null = null
  switch (event.key) {
    case 'ArrowLeft':
      next = step(-1)
      break
    case 'ArrowRight':
      next = step(1)
      break
    case 'ArrowUp':
      next = step(-7)
      break
    case 'ArrowDown':
      next = step(7)
      break
    case 'Home':
      next = isoOf(date.year, date.month, 1)
      break
    case 'End':
      next = isoOf(date.year, date.month, daysInMonth(date.year, date.month))
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      emit('update:modelValue', current)
      return
    default:
      return
  }

  if (!next) return
  event.preventDefault()
  focusedDate.value = next
  const parsed = parseIso(next)!
  if (parsed.month !== view.value.month || parsed.year !== view.value.year) {
    view.value = { year: parsed.year, month: parsed.month }
    emit('update:month', parsed.year + '-' + pad(parsed.month + 1))
  }
  nextTick(() => {
    const button = gridRef.value?.querySelector<HTMLElement>('[data-date="' + next + '"]')
    button?.focus({ preventScroll: true })
  })
}

const gridRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!props.modelValue) focusedDate.value = null
})

defineExpose({ goMonth, goYear, view })
</script>

<template>
  <div class="md-calendar" :aria-label="ariaLabel" role="group">
    <header class="md-calendar__header">
      <button
        v-if="mode === 'days'"
        type="button"
        class="md-calendar__nav"
        aria-label="上个月"
        @click="goMonth(-1)"
      >
        <M3Icon :icon="IconChevronLeft" :size="20" />
      </button>
      <button v-else type="button" class="md-calendar__nav" aria-label="上一年" @click="goYear(-1)">
        <M3Icon :icon="IconChevronLeft" :size="20" />
      </button>

      <button
        type="button"
        class="md-calendar__label"
        :aria-expanded="mode === 'months'"
        @click="mode = mode === 'days' ? 'months' : 'days'"
      >
        {{ mode === 'days' ? monthLabel : view.year + ' 年' }}
      </button>

      <button
        v-if="mode === 'days'"
        type="button"
        class="md-calendar__nav"
        aria-label="下个月"
        @click="goMonth(1)"
      >
        <M3Icon :icon="IconChevronRight" :size="20" />
      </button>
      <button v-else type="button" class="md-calendar__nav" aria-label="下一年" @click="goYear(1)">
        <M3Icon :icon="IconChevronRight" :size="20" />
      </button>
    </header>

    <template v-if="mode === 'days'">
      <div class="md-calendar__weekdays" aria-hidden="true">
        <span v-for="(weekday, index) in weekdays" :key="index">{{ weekday }}</span>
      </div>

      <div ref="gridRef" class="md-calendar__grid" role="grid" @keydown="onGridKeydown">
        <button
          v-for="cell in cells"
          :key="cell.date"
          type="button"
          class="md-calendar__day"
          :class="{
            'is-outside': cell.outside,
            'is-today': cell.today,
            'is-selected': cell.date === modelValue,
            'is-disabled': cell.disabled,
            'is-range-start': cell.date === rangeStart,
            'is-range-end': cell.date === rangeEnd,
            'in-range': inRange(cell.date),
          }"
          role="gridcell"
          :data-date="cell.date"
          :aria-selected="cell.date === modelValue"
          :aria-disabled="cell.disabled ? 'true' : undefined"
          :aria-label="cell.date"
          :tabindex="cell.date === (modelValue ?? focusedDate) ? 0 : -1"
          :disabled="cell.disabled || (cell.outside && !showAdjacent)"
          @click="select(cell)"
          @pointerenter="emit('hover', cell.date)"
        >
          <slot name="day" :date="cell.date" :day="cell.day" :selected="cell.date === modelValue" :today="cell.today" :disabled="cell.disabled">
            {{ cell.day }}
          </slot>
        </button>
      </div>
    </template>

    <div v-else class="md-calendar__months">
      <button
        v-for="(month, index) in ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月']"
        :key="month"
        type="button"
        class="md-calendar__month"
        :class="{ 'is-current': index === view.month }"
        @click="pickMonth(index)"
      >
        {{ month }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.md-calendar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 320px;
  max-width: 100%;
  padding: 12px;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.md-calendar__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
}

@media (hover: hover) {
  .md-calendar__nav:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-calendar__label {
  flex: 1;
  min-width: 0;
  height: 40px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: var(--md-sys-typescale-title-small-size);
  font-weight: var(--md-sys-typescale-title-small-weight);
  cursor: pointer;
}

@media (hover: hover) {
  .md-calendar__label:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 6%, transparent);
  }
}

.md-calendar__weekdays,
.md-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.md-calendar__weekdays span {
  padding-block: 4px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
}

.md-calendar__day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: var(--md-sys-typescale-body-medium-size);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-calendar__day:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-calendar__day.is-outside {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-calendar__day.is-today {
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}

.md-calendar__day.is-selected {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: none;
}

/* 区间底色：两端用主色，中间一段用 secondary-container 连起来 */
.md-calendar__day.in-range {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-radius: 0;
}

.md-calendar__day.is-range-start,
.md-calendar__day.is-range-end {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: none;
}

.md-calendar__day.is-disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  background: none;
  cursor: not-allowed;
  text-decoration: line-through;
}

.md-calendar__day:focus-visible {
  outline: 2px solid var(--md-sys-color-secondary);
  outline-offset: -2px;
}

.md-calendar__months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding-block: 4px;
}

.md-calendar__month {
  height: 56px;
  border: none;
  border-radius: var(--md-sys-shape-corner-medium);
  background: none;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: var(--md-sys-typescale-body-medium-size);
  cursor: pointer;
}

@media (hover: hover) {
  .md-calendar__month:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-calendar__month.is-current {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
</style>
