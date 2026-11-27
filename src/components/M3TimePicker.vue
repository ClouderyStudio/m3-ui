<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconClose, IconSchedule } from '../icons'
import M3IconButton from './M3IconButton.vue'
import M3FieldShell from './_M3Field.vue'
import M3PickerModal from './_M3PickerModal.vue'
import M3TimeColumns from './_M3TimeColumns.vue'
import { useAnchoredPanel } from '../composables/usePopupPosition'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'
import { formatTime, parseTime, type TimeParts } from '../utils/date'

/**
 * 时间选择：时/分（可含秒）滚动列。
 *
 * 对外的值永远是 24 小时制 HH:mm[:ss]。12 小时制只影响显示与选择器里的分组，
 * 不改变存储 —— 否则同一个时刻会出现两种写法，比较和提交都得再判断一次。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string | null
    label: string
    variant?: 'filled' | 'outlined'
    /** 选择器按 12 或 24 小时分组；存储始终是 24 小时制。 */
    format?: '12h' | '24h'
    /** 精确到秒。 */
    seconds?: boolean
    minuteStep?: number
    disabled?: boolean
    error?: string
    hint?: string
    placeholder?: string
    mode?: 'docked' | 'modal'
    clearable?: boolean
  }>(),
  {
    variant: 'filled',
    format: '24h',
    seconds: false,
    minuteStep: 1,
    disabled: false,
    error: '',
    hint: '',
    placeholder: '',
    mode: 'docked',
    clearable: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const wrapper = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const open = ref(false)
const focused = ref(false)
const pending = ref<TimeParts>(parseTime(props.modelValue))

const { style: panelStyle } = useAnchoredPanel(wrapper, panelRef, open, { gap: 6 })

watch(
  () => props.modelValue,
  (value) => {
    pending.value = parseTime(value)
  },
)

const display = computed(() =>
  props.modelValue ? formatTime(parseTime(props.modelValue), props.format, props.seconds) : '',
)

const floating = computed(() => focused.value || open.value || Boolean(props.modelValue))

function commit(): void {
  emit('update:modelValue', formatTime(pending.value, '24h', props.seconds))
}

function setHours(value: number): void {
  pending.value = { ...pending.value, hours: value }
  if (props.mode === 'docked') commit()
}

function setMinutes(value: number): void {
  pending.value = { ...pending.value, minutes: value }
  if (props.mode === 'docked') commit()
}

function setSeconds(value: number): void {
  pending.value = { ...pending.value, seconds: value }
  if (props.mode === 'docked') commit()
}

function openPicker(): void {
  if (props.disabled) return
  pending.value = parseTime(props.modelValue)
  open.value = true
}

function close(): void {
  if (!open.value) return
  open.value = false
}

/* Esc 走共享的栈：对话框里再开时间面板时，一次 Esc 只关最上面那层 */
useEscapeStack(open, () => close())
useClickOutsideWhen(open, [wrapper, panelRef], () => close())

function confirm(): void {
  commit()
  close()
}

function clear(): void {
  emit('update:modelValue', null)
  pending.value = { hours: 0, minutes: 0, seconds: 0 }
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
  <div ref="wrapper" class="md-time-picker" @click="openPicker">
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
        class="md-time-picker__input"
        type="text"
        readonly
        :value="display"
        :placeholder="placeholder || (format === '12h' ? 'hh:mm AM' : 'HH:mm')"
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
          v-if="clearable && modelValue"
          :icon="IconClose"
          label="清除时间"
          size="sm"
          variant="standard"
          @click.stop="clear"
        />
        <M3IconButton
          :icon="IconSchedule"
          :label="open ? '收起时间选择' : '选择时间'"
          size="sm"
          variant="standard"
          :disabled="disabled"
          :aria-expanded="open"
          @click.stop="open ? close() : openPicker()"
        />
      </template>
    </M3FieldShell>

    <Teleport to="body">
      <Transition name="md-pop">
        <div
          v-if="open && mode === 'docked'"
          ref="panelRef"
          class="md-panel md-panel--flush md-time-picker__panel"
          :style="panelStyle"
        >
          <M3TimeColumns
            :hours="pending.hours"
            :minutes="pending.minutes"
            :seconds="pending.seconds"
            :format="format"
            :seconds-enabled="seconds"
            :minute-step="minuteStep"
            :disabled="disabled"
            @update:hours="setHours"
            @update:minutes="setMinutes"
            @update:seconds="setSeconds"
          />
        </div>
      </Transition>
    </Teleport>

    <M3PickerModal v-if="mode === 'modal'" v-model="open" :title="label" @confirm="confirm">
      <M3TimeColumns
        :hours="pending.hours"
        :minutes="pending.minutes"
        :seconds="pending.seconds"
        :format="format"
        :seconds-enabled="seconds"
        :minute-step="minuteStep"
        :disabled="disabled"
        @update:hours="setHours"
        @update:minutes="setMinutes"
        @update:seconds="setSeconds"
      />
    </M3PickerModal>
  </div>
</template>

<style scoped>
.md-time-picker {
  display: block;
  min-width: 0;
}

.md-time-picker__input {
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
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.md-time-picker__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-time-picker__input:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-time-picker__panel {
  padding: 8px;
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
