<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IconComponent } from '../icons'
import { IconCalendar, IconClose } from '../icons'
import M3Calendar from './M3Calendar.vue'
import M3IconButton from './M3IconButton.vue'
import M3FieldShell from './_M3Field.vue'
import M3PickerModal from './_M3PickerModal.vue'
import { useAnchoredPanel } from '../composables/usePopupPosition'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'
import { formatDate } from '../utils/date'

/**
 * 日期选择：输入框 + 日历。
 *
 * 桌面用贴附面板（docked），移动端用 mode="modal" 走模态 ——
 * 手机上贴近输入框的浮层会被软键盘顶出屏幕，这是两种布局必须分开的原因。
 * 值始终是本地日期串 YYYY-MM-DD，不传 Date 对象。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string | null
    label: string
    variant?: 'filled' | 'outlined'
    min?: string
    max?: string
    disabled?: boolean
    error?: string
    hint?: string
    placeholder?: string
    /** docked：贴附面板；modal：居中对话框（窄屏推荐）。 */
    mode?: 'docked' | 'modal'
    weekStartsOn?: 0 | 1
    clearable?: boolean
    icon?: IconComponent | null
    locale?: string
    /** 显示格式（Intl dateStyle）。 */
    displayStyle?: 'long' | 'medium' | 'short'
  }>(),
  {
    variant: 'filled',
    min: undefined,
    max: undefined,
    disabled: false,
    error: '',
    hint: '',
    placeholder: '',
    mode: 'docked',
    weekStartsOn: 1,
    clearable: true,
    icon: null,
    locale: undefined,
    displayStyle: 'medium',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const wrapper = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const open = ref(false)
const focused = ref(false)
const pending = ref<string | null>(props.modelValue)

const { style: panelStyle } = useAnchoredPanel(wrapper, panelRef, open, { gap: 6 })

const display = computed(() =>
  props.modelValue ? formatDate(props.modelValue, props.locale, props.displayStyle) : '',
)

const floating = computed(() => focused.value || open.value || Boolean(props.modelValue))

function openPicker(): void {
  if (props.disabled) return
  pending.value = props.modelValue
  open.value = true
}

function close(): void {
  if (!open.value) return
  open.value = false
}

/* Esc 走共享的栈：对话框里再开日期面板时，一次 Esc 只关最上面那层 */
useEscapeStack(open, () => close())
useClickOutsideWhen(open, [wrapper, panelRef], () => close())

function choose(value: string | null): void {
  if (!value) return
  emit('update:modelValue', value)
  pending.value = value
  if (props.mode === 'docked') close()
}

function confirm(): void {
  if (pending.value) emit('update:modelValue', pending.value)
  close()
}

function clear(): void {
  emit('update:modelValue', null)
  pending.value = null
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
  <div ref="wrapper" class="md-date-picker" @click="openPicker">
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
        class="md-date-picker__input"
        type="text"
        readonly
        :value="display"
        :placeholder="placeholder || 'YYYY-MM-DD'"
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
          label="清除日期"
          size="sm"
          variant="standard"
          @click.stop="clear"
        />
        <M3IconButton
          :icon="icon ?? IconCalendar"
          :label="open ? '收起日历' : '选择日期'"
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
          class="md-panel md-panel--flush"
          :style="panelStyle"
        >
          <M3Calendar
            :model-value="modelValue"
            :min="min"
            :max="max"
            :week-starts-on="weekStartsOn"
            :locale="locale"
            :aria-label="label"
            @update:model-value="choose"
          />
        </div>
      </Transition>
    </Teleport>

    <M3PickerModal
      v-if="mode === 'modal'"
      v-model="open"
      :title="label"
      @confirm="confirm"
    >
      <M3Calendar
        :model-value="pending"
        :min="min"
        :max="max"
        :week-starts-on="weekStartsOn"
        :locale="locale"
        :aria-label="label"
        @update:model-value="pending = $event"
      />
    </M3PickerModal>
  </div>
</template>

<style scoped>
.md-date-picker {
  display: block;
  min-width: 0;
}

.md-date-picker__input {
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

.md-date-picker__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-date-picker__input:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
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
