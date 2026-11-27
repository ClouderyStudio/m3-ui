<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconClose } from '../icons'
import M3Calendar from './M3Calendar.vue'
import M3IconButton from './M3IconButton.vue'
import M3FieldShell from './_M3Field.vue'
import M3PickerModal from './_M3PickerModal.vue'
import { useAnchoredPanel } from '../composables/usePopupPosition'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'
import { formatDate, parseIsoDate, pad2, todayIso } from '../utils/date'

/**
 * 日期区间：两个日历并排，点第一下定起点、第二下定终点。
 *
 * 已完成一段区间后再点，会从新的起点重新开始 —— 这比「必须先点清除」少一步，
 * 也符合用户改主意的顺序（先想新的开始，再想新的结束）。
 * 悬停时用预览色把「将要选中」的一段连起来，否则点完起点完全看不到范围。
 */
export interface DateRange {
  start: string | null
  end: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue: DateRange
    label: string
    variant?: 'filled' | 'outlined'
    min?: string
    max?: string
    disabled?: boolean
    error?: string
    hint?: string
    mode?: 'docked' | 'modal'
    weekStartsOn?: 0 | 1
    /** 并排显示几个月（窄屏自动只显示一个）。 */
    months?: 1 | 2
    clearable?: boolean
    locale?: string
  }>(),
  {
    variant: 'filled',
    min: undefined,
    max: undefined,
    disabled: false,
    error: '',
    hint: '',
    mode: 'docked',
    weekStartsOn: 1,
    months: 2,
    clearable: true,
    locale: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [range: DateRange] }>()

const wrapper = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const open = ref(false)
const focused = ref(false)

const start = ref<string | null>(props.modelValue.start)
const end = ref<string | null>(props.modelValue.end)

function monthOf(date: string | null): string {
  return (date ?? todayIso()).slice(0, 7)
}

function shiftMonth(month: string, delta: number): string {
  const parsed = parseIsoDate(month + '-01')
  if (!parsed) return month
  const next = new Date(parsed.getFullYear(), parsed.getMonth() + delta, 1)
  return next.getFullYear() + '-' + pad2(next.getMonth() + 1)
}

const leftMonth = ref(monthOf(start.value))
const rightMonth = ref(shiftMonth(leftMonth.value, 1))
const hover = ref<string | null>(null)

/* 左栏翻月时右栏跟着走；右栏自己翻月时只改自己，否则点右箭头会没反应 */
watch(leftMonth, (value) => {
  rightMonth.value = shiftMonth(value, 1)
})

const { style: panelStyle } = useAnchoredPanel(wrapper, panelRef, open, { gap: 6 })

watch(
  () => props.modelValue,
  (value) => {
    start.value = value.start
    end.value = value.end
    if (value.start) leftMonth.value = monthOf(value.start)
  },
)

const display = computed(() => {
  if (!start.value && !end.value) return ''
  const first = start.value ? formatDate(start.value, props.locale, 'medium') : '…'
  const second = end.value ? formatDate(end.value, props.locale, 'medium') : '…'
  return first + ' – ' + second
})

const floating = computed(() => focused.value || open.value || Boolean(start.value || end.value))

function commit(): void {
  emit('update:modelValue', { start: start.value, end: end.value })
}

function pick(value: string | null): void {
  if (props.disabled || !value) return
  const date = value

  if (!start.value || (start.value && end.value)) {
    start.value = date
    end.value = null
    commit()
    return
  }

  if (date < start.value) {
    // 先点的终点比起点早：把更早的那天当新的起点
    end.value = start.value
    start.value = date
  } else {
    end.value = date
  }

  commit()
  hover.value = null
  if (props.mode === 'docked') close()
}

function openPicker(): void {
  if (props.disabled) return
  leftMonth.value = monthOf(start.value)
  open.value = true
}

function close(): void {
  if (!open.value) return
  open.value = false
}

/* Esc 走共享的栈：对话框里再开区间面板时，一次 Esc 只关最上面那层 */
useEscapeStack(open, () => close())
useClickOutsideWhen(open, [wrapper, panelRef], () => close())

function clear(): void {
  start.value = null
  end.value = null
  commit()
  close()
}

function onFieldKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    openPicker()
  }
}

</script>

<template>
  <div ref="wrapper" class="md-range" @click="openPicker">
    <M3FieldShell
      :label="label"
      :variant="variant"
      :floating="floating"
      :focused="focused || open"
      :error="error"
      :hint="hint"
      :disabled="disabled"
      :has-trailing="true"
    >
      <input
        class="md-range__input"
        type="text"
        readonly
        :value="display"
        placeholder="开始 – 结束"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @focus="focused = true"
        @blur="focused = false"
        @keydown="onFieldKeydown"
      />

      <template #trailing>
        <M3IconButton
          v-if="clearable && (start || end)"
          :icon="IconClose"
          label="清除区间"
          size="sm"
          variant="standard"
          @click.stop="clear"
        />
      </template>
    </M3FieldShell>

    <Teleport to="body">
      <Transition name="md-pop">
        <div v-if="open && mode === 'docked'" ref="panelRef" class="md-panel md-panel--flush" :style="panelStyle">
          <div class="md-range__calendars">
            <M3Calendar
              :model-value="null"
              :month="leftMonth"
              :min="min"
              :max="max"
              :week-starts-on="weekStartsOn"
              :locale="locale"
              :range-start="start"
              :range-end="end"
              :range-preview="hover"
              aria-label="开始日期"
              @update:month="leftMonth = $event"
              @update:model-value="pick"
              @hover="hover = $event"
            />
            <M3Calendar
              v-if="months === 2"
              :model-value="null"
              :month="rightMonth"
              :min="min"
              :max="max"
              :week-starts-on="weekStartsOn"
              :locale="locale"
              :range-start="start"
              :range-end="end"
              :range-preview="hover"
              aria-label="结束日期"
              @update:month="rightMonth = $event"
              @update:model-value="pick"
              @hover="hover = $event"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <M3PickerModal v-if="mode === 'modal'" v-model="open" :title="label" @confirm="close">
      <div class="md-range__calendars">
        <M3Calendar
          :model-value="null"
          :month="leftMonth"
          :min="min"
          :max="max"
          :week-starts-on="weekStartsOn"
          :locale="locale"
          :range-start="start"
          :range-end="end"
          :range-preview="hover"
          aria-label="开始日期"
          @update:month="leftMonth = $event"
          @update:model-value="pick"
          @hover="hover = $event"
        />
        <M3Calendar
          v-if="months === 2"
          :model-value="null"
          :month="rightMonth"
          :min="min"
          :max="max"
          :week-starts-on="weekStartsOn"
          :locale="locale"
          :range-start="start"
          :range-end="end"
          :range-preview="hover"
          aria-label="结束日期"
          @update:month="rightMonth = $event"
          @update:model-value="pick"
          @hover="hover = $event"
        />
      </div>
    </M3PickerModal>
  </div>
</template>

<style scoped>
.md-range {
  display: block;
  min-width: 0;
}

.md-range__input {
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  cursor: pointer;
}

.md-range__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-range__input:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-range__calendars {
  display: flex;
  gap: 4px;
}

@media (max-width: 760px) {
  .md-range__calendars > .md-calendar:last-child {
    display: none;
  }
}

.md-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
  transform-origin: top center;
}

.md-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  transform-origin: top center;
}

.md-pop-enter-from,
.md-pop-leave-to {
  opacity: 0;
  scale: 0.97;
}
</style>
