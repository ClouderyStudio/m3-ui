<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { pad2 } from '../utils/date'

/**
 * 时/分/秒滚动列（时间选择器的核心）。
 *
 * 用可滚动的列表而不是「时钟表盘」：表盘在触摸屏上很好看，但键盘和读屏几乎没法用，
 * 列表天然是 listbox，上下键、Home/End、读屏朗读都能直接借用浏览器行为。
 */
const props = withDefaults(
  defineProps<{
    hours: number
    minutes: number
    seconds: number
    format?: '12h' | '24h'
    secondsEnabled?: boolean
    minuteStep?: number
    disabled?: boolean
  }>(),
  { format: '24h', secondsEnabled: false, minuteStep: 1, disabled: false },
)

const emit = defineEmits<{
  'update:hours': [value: number]
  'update:minutes': [value: number]
  'update:seconds': [value: number]
}>()

const rootRef = ref<HTMLElement | null>(null)

const displayHour = computed(() => (props.hours % 12 === 0 ? 12 : props.hours % 12))
const meridiem = computed(() => (props.hours < 12 ? 'AM' : 'PM'))

const hourOptions = computed(() =>
  props.format === '12h'
    ? Array.from({ length: 12 }, (_, index) => index + 1)
    : Array.from({ length: 24 }, (_, index) => index),
)

const minuteOptions = computed(() => {
  const step = Math.max(1, props.minuteStep)
  const list: number[] = []
  for (let value = 0; value < 60; value += step) list.push(value)
  return list
})

const secondOptions = computed(() => Array.from({ length: 60 }, (_, index) => index))

function setHour(value: number): void {
  if (props.disabled) return
  if (props.format === '12h') {
    emit('update:hours', (value % 12) + (meridiem.value === 'PM' ? 12 : 0))
    return
  }
  emit('update:hours', value)
}

function setMeridiem(next: 'AM' | 'PM'): void {
  if (props.disabled) return
  emit('update:hours', (displayHour.value % 12) + (next === 'PM' ? 12 : 0))
}

function scrollSelectedIntoView(): void {
  nextTick(() => {
    const root = rootRef.value
    if (!root) return
    for (const cell of root.querySelectorAll<HTMLElement>('.md-time__cell.is-selected')) {
      cell.scrollIntoView({ block: 'center' })
    }
  })
}

watch(
  () => [props.hours, props.minutes, props.seconds, props.format],
  scrollSelectedIntoView,
  { immediate: true },
)

defineExpose({ scrollSelectedIntoView })
</script>

<template>
  <div ref="rootRef" class="md-time">
    <ul class="md-time__col" role="listbox" aria-label="小时">
      <li v-for="option in hourOptions" :key="'h' + option">
        <button
          type="button"
          class="md-time__cell"
          :class="{ 'is-selected': option === (format === '12h' ? displayHour : hours) }"
          role="option"
          :aria-selected="option === (format === '12h' ? displayHour : hours)"
          :disabled="disabled"
          @click="setHour(option)"
        >
          {{ pad2(option) }}
        </button>
      </li>
    </ul>

    <ul class="md-time__col" role="listbox" aria-label="分钟">
      <li v-for="option in minuteOptions" :key="'m' + option">
        <button
          type="button"
          class="md-time__cell"
          :class="{ 'is-selected': option === minutes }"
          role="option"
          :aria-selected="option === minutes"
          :disabled="disabled"
          @click="emit('update:minutes', option)"
        >
          {{ pad2(option) }}
        </button>
      </li>
    </ul>

    <ul v-if="secondsEnabled" class="md-time__col" role="listbox" aria-label="秒">
      <li v-for="option in secondOptions" :key="'s' + option">
        <button
          type="button"
          class="md-time__cell"
          :class="{ 'is-selected': option === seconds }"
          role="option"
          :aria-selected="option === seconds"
          :disabled="disabled"
          @click="emit('update:seconds', option)"
        >
          {{ pad2(option) }}
        </button>
      </li>
    </ul>

    <ul v-if="format === '12h'" class="md-time__col md-time__col--meridiem" role="listbox" aria-label="上午/下午">
      <li v-for="option in ['AM', 'PM']" :key="option">
        <button
          type="button"
          class="md-time__cell"
          :class="{ 'is-selected': option === meridiem }"
          role="option"
          :aria-selected="option === meridiem"
          :disabled="disabled"
          @click="setMeridiem(option as 'AM' | 'PM')"
        >
          {{ option }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.md-time {
  display: flex;
  gap: 4px;
  max-height: 260px;
  font-family: var(--md-ref-typeface-plain);
}

.md-time__col {
  flex: 1;
  min-width: 56px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  scrollbar-width: thin;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface-container-low);
}

.md-time__col--meridiem {
  min-width: 64px;
}

.md-time__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  scroll-margin-block: 100px;
}

@media (hover: hover) {
  .md-time__cell:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-time__cell.is-selected {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md-time__cell:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
