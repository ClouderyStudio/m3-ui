<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import type { IconComponent } from '../icons'
import { IconAdd, IconRemove } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 数字输入框（MD3 filled / outlined），带 +/- 步进。
 *
 * 两个刻意的决定：
 *   1. 用 type="text" + inputmode="decimal"，不用 type="number"。
 *      后者的键盘上出现的是浏览器的上/下箭头、非法输入时 value 直接变成空串，
 *      而且无法约束「-」「.」这类中间态；自绘步进按钮之后，原生箭头反而是累赘。
 *   2. 输入过程中保留用户敲的原文（draft），只在能解析成数字时才向外发值。
 *      否则用户敲「-」或「1.」的瞬间会被格式化回去，光标位置跟着乱跳。
 */
const props = withDefaults(
  defineProps<{
    modelValue: number | null
    label: string
    variant?: 'filled' | 'outlined'
    min?: number
    max?: number
    /** 步进值与方向键一次的增减量。 */
    step?: number
    disabled?: boolean
    required?: boolean
    /** 前置图标（通常是数量、计价之类的语义）。 */
    icon?: IconComponent | null
    /** 显示 +/- 步进按钮。 */
    stepper?: boolean
    /** 错误文案；非空即进入错误态。 */
    error?: string
    hint?: string
    /** 小数位；不传则按输入原样显示。 */
    precision?: number
    name?: string
  }>(),
  {
    variant: 'filled',
    min: undefined,
    max: undefined,
    step: 1,
    disabled: false,
    required: false,
    icon: null,
    stepper: true,
    error: '',
    hint: '',
    precision: undefined,
    name: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const fieldId = useId()
const focused = ref(false)

/** 输入框里真实显示的文本；与 modelValue 单向同步。 */
const draft = ref(formatValue(props.modelValue))
/** 仅在「浮起标签」这件事上需要知道有没有值。 */
const hasValue = computed(() => draft.value !== '' || props.modelValue !== null)

function formatValue(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  if (props.precision === undefined) return String(value)
  return value.toFixed(props.precision)
}

function clamp(value: number): number {
  if (props.min !== undefined && value < props.min) return props.min
  if (props.max !== undefined && value > props.max) return props.max
  return value
}

/** 把外部值同步回输入框，但不打断正在输入的用户。 */
watch(
  () => props.modelValue,
  (next) => {
    if (focused.value && parseDraft(draft.value) === next) return
    if (focused.value) return
    draft.value = formatValue(next)
  },
)

watch(
  () => props.precision,
  () => {
    if (!focused.value) draft.value = formatValue(props.modelValue)
  },
)

function parseDraft(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement
  // 只允许数字、一个小数点、开头的负号 —— 其余字符直接吞掉，光标不动
  const cleaned = input.value.replace(/[^\d.-]/g, '')
  draft.value = cleaned
  if (input.value !== cleaned) input.value = cleaned

  const parsed = parseDraft(cleaned)
  if (parsed === null) {
    if (cleaned.trim() === '') emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', clamp(parsed))
}

function onFocus(): void {
  focused.value = true
}

function onBlur(): void {
  focused.value = false
  // 失焦时把草稿收敛成合法值：超界的夹回去，半截的「-」「1.」归一
  const parsed = parseDraft(draft.value)
  if (parsed === null) {
    if (draft.value.trim() !== '') draft.value = formatValue(props.modelValue)
    else draft.value = ''
    return
  }
  const next = clamp(parsed)
  draft.value = formatValue(next)
  if (next !== props.modelValue) emit('update:modelValue', next)
}

const atMin = computed(() => props.min !== undefined && (props.modelValue ?? 0) <= props.min)
const atMax = computed(() => props.max !== undefined && (props.modelValue ?? 0) >= props.max)

function commit(value: number): void {
  const next = clamp(value)
  draft.value = formatValue(next)
  emit('update:modelValue', next)
}

function increment(): void {
  if (props.disabled || atMax.value) return
  commit((props.modelValue ?? 0) + props.step)
}

function decrement(): void {
  if (props.disabled || atMin.value) return
  commit((props.modelValue ?? 0) - props.step)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    increment()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrement()
  }
}
</script>

<template>
  <div
    class="md-number"
    :class="[
      'md-number--' + variant,
      {
        'is-focused': focused,
        'is-invalid': !!error,
        'is-disabled': disabled,
        'has-icon': !!icon,
        'has-stepper': stepper,
        'is-empty': !hasValue,
      },
    ]"
  >
    <div class="md-number__container">
      <M3Icon v-if="icon" :icon="icon" :size="20" class="md-number__leading" />

      <label class="md-number__label" :for="fieldId">
        {{ label }}<span v-if="required" class="md-number__required" aria-hidden="true">*</span>
      </label>

      <input
        :id="fieldId"
        class="md-number__input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :name="name"
        :value="draft"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? fieldId + '-error' : hint ? fieldId + '-hint' : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <div v-if="stepper" class="md-number__steppers">
        <M3IconButton
          :icon="IconRemove"
          label="减少"
          size="sm"
          :disabled="disabled || atMin"
          @click="decrement"
        />
        <M3IconButton
          :icon="IconAdd"
          label="增加"
          size="sm"
          :disabled="disabled || atMax"
          @click="increment"
        />
      </div>
    </div>

    <div v-if="variant === 'filled'" class="md-number__indicator" />

    <p v-if="error" :id="fieldId + '-error'" class="md-number__support md-number__support--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="fieldId + '-hint'" class="md-number__support">{{ hint }}</p>
  </div>
</template>

<style scoped>
.md-number {
  display: flex;
  flex-direction: column;
  font-family: var(--md-ref-typeface-plain);
}

.md-number__container {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  padding-inline: 16px;
  border-start-start-radius: var(--md-sys-shape-corner-extra-small);
  border-start-end-radius: var(--md-sys-shape-corner-extra-small);
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* ---------- Filled ---------- */
.md-number--filled .md-number__container {
  background-color: var(--md-sys-color-surface-container-highest);
}

@media (hover: hover) {
  .md-number--filled:not(.is-disabled) .md-number__container:hover {
    background-color: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 6%,
      var(--md-sys-color-surface-container-highest)
    );
  }
}

.md-number.has-icon .md-number__container {
  padding-inline-start: 48px;
}

.md-number__leading {
  position: absolute;
  inset-inline-start: 12px;
  inset-block-start: 50%;
  translate: 0 -50%;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
}

.md-number.is-focused .md-number__leading {
  color: var(--md-sys-color-primary);
}

.md-number__label {
  position: absolute;
  inset-inline-start: 16px;
  inset-block-start: 50%;
  translate: 0 -50%;
  max-width: calc(100% - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  pointer-events: none;
  transition:
    translate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
    font-size var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-number.has-icon .md-number__label {
  inset-inline-start: 48px;
}

.md-number__required {
  margin-inline-start: 2px;
  color: var(--md-sys-color-error);
}

.md-number:not(.is-empty) .md-number__label,
.md-number.is-focused .md-number__label {
  translate: 0 -22px;
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-number.is-focused .md-number__label {
  color: var(--md-sys-color-primary);
}

.md-number.is-invalid .md-number__label {
  color: var(--md-sys-color-error);
}

.md-number__input {
  width: 100%;
  min-width: 0;
  padding: 0;
  padding-block-start: 16px;
  padding-inline-end: 12px;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  font-variant-numeric: tabular-nums;
  caret-color: var(--md-sys-color-primary);
}

/* 有步进按钮时占住右侧，输入文本不钻到它们底下 */
.md-number.has-stepper .md-number__input {
  padding-inline-end: 76px;
}

.md-number__steppers {
  position: absolute;
  inset-inline-end: 4px;
  inset-block-start: 50%;
  translate: 0 -50%;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ---------- 指示线 ---------- */
.md-number__indicator {
  height: 1px;
  margin-inline: 16px;
  background-color: var(--md-sys-color-on-surface-variant);
  transition:
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    margin-inline var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-number.is-focused .md-number__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-primary);
}

.md-number.is-invalid .md-number__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-error);
}

/* ---------- Outlined ---------- */
.md-number--outlined .md-number__container {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: transparent;
}

.md-number--outlined .md-number__label {
  inset-inline-start: 12px;
  padding-inline: 4px;
  background-color: transparent;
}

.md-number--outlined.has-icon .md-number__label {
  inset-inline-start: 44px;
}

/* 浮动标签在描边上切出缺口；变量只在使用点 fallback，见 M3TextField 里的同一条注释 */
.md-number--outlined:not(.is-empty) .md-number__label,
.md-number--outlined.is-focused .md-number__label {
  translate: 0 calc(-50% - 28px);
  background-color: var(--md-field-label-surface, var(--md-sys-color-surface));
}

.md-number--outlined .md-number__input {
  padding-block: 0;
}

.md-number--outlined.is-focused .md-number__container {
  border-color: var(--md-sys-color-primary);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
}

.md-number--outlined.is-invalid .md-number__container {
  border-color: var(--md-sys-color-error);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-error);
}

.md-number--outlined .md-number__indicator {
  display: none;
}

/* ---------- 支持文案 ---------- */
.md-number__support {
  margin: 0;
  padding: 4px 16px 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-number__support--error {
  color: var(--md-sys-color-error);
}

/* ---------- 禁用 ---------- */
.md-number.is-disabled .md-number__container {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  cursor: not-allowed;
}

.md-number--outlined.is-disabled .md-number__container {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  background-color: transparent;
}

.md-number.is-disabled .md-number__input,
.md-number.is-disabled .md-number__label,
.md-number.is-disabled .md-number__leading {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-number.is-disabled .md-number__indicator {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
