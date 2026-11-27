<script setup lang="ts">
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'

/**
 * 字段外壳（filled / outlined + 浮动标签 + 底边指示线 + 支持文案）。
 *
 * 本批新增的输入类组件（自动完成、多选、标签、掩码、电话、日期、时间）都要这层皮，
 * 各自的差异只在「控件本身」。把外壳抽出来，标签缺口、指示线 2dp 的动画、
 * 错误色优先级这些细节就只维护一份 —— 之前 TextField / NumberField / Select / PinInput
 * 各抄了一遍，改一次要改四处。
 *
 * 它只负责画，不持有状态：floating / focused / invalid 都由调用方根据真实焦点计算，
 * 这样「聚焦但没值」和「有值但失焦」这类边界不会被外壳猜错。
 */
withDefaults(
  defineProps<{
    label?: string
    variant?: 'filled' | 'outlined'
    /** 标签是否上浮（聚焦、有值或有占位符）。 */
    floating?: boolean
    focused?: boolean
    invalid?: boolean
    disabled?: boolean
    required?: boolean
    /** 前置图标，通常是语义提示（邮箱、电话、日历）。 */
    leadingIcon?: IconComponent | null
    /** 关联的 input id。 */
    labelFor?: string
    /** 前置区域的宽度（px）：放国家选择这类较宽的控件时用它撑开左边距。 */
    leadingWidth?: number
    /** 错误文案；非空即进入错误态。 */
    error?: string
    hint?: string
    /** 尾部有按钮时给标签让位。 */
    hasTrailing?: boolean
    /** 多行控件：容器改为顶部对齐。 */
    multiline?: boolean
    /** 计数器等右侧支持内容。 */
    counter?: string
  }>(),
  {
    label: undefined,
    leadingWidth: 48,
    variant: 'filled',
    floating: false,
    focused: false,
    invalid: false,
    disabled: false,
    required: false,
    leadingIcon: null,
    labelFor: undefined,
    error: '',
    hint: '',
    hasTrailing: false,
    multiline: false,
    counter: undefined,
  },
)
</script>

<template>
  <div
    class="md-field"
    :class="[
      'md-field--' + variant,
      {
        'is-floating': floating,
        'is-focused': focused,
        'is-invalid': !!error || invalid,
        'is-disabled': disabled,
        'has-icon': !!leadingIcon,
        'has-leading': !!$slots.leading,
        'has-trailing': hasTrailing,
        'is-multiline': multiline,
      },
    ]"
    :style="{ '--md-field-leading-width': leadingWidth + 'px' }"
  >
    <div class="md-field__container">
      <span v-if="leadingIcon || $slots.leading" class="md-field__leading">
        <slot name="leading"><M3Icon v-if="leadingIcon" :icon="leadingIcon" :size="20" /></slot>
      </span>

      <label v-if="label" class="md-field__label" :for="labelFor">
        {{ label }}<span v-if="required" class="md-field__required" aria-hidden="true">*</span>
        <span v-if="required" class="sr-only">（必填）</span>
      </label>

      <div class="md-field__control"><slot /></div>

      <div v-if="$slots.trailing" class="md-field__trailing"><slot name="trailing" /></div>
    </div>

    <div v-if="variant === 'filled'" class="md-field__indicator" />

    <div v-if="error || hint || counter" class="md-field__support-row">
      <p v-if="error" class="md-field__support md-field__support--error" role="alert">{{ error }}</p>
      <p v-else-if="hint" class="md-field__support">{{ hint }}</p>
      <span v-else />
      <span v-if="counter" class="md-field__counter">{{ counter }}</span>
    </div>
  </div>
</template>

<style scoped>
.md-field {
  display: flex;
  flex-direction: column;
  font-family: var(--md-ref-typeface-plain);
}

.md-field__container {
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
.md-field--filled .md-field__container {
  background-color: var(--md-sys-color-surface-container-highest);
}

@media (hover: hover) {
  .md-field--filled:not(.is-disabled) .md-field__container:hover {
    background-color: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 6%,
      var(--md-sys-color-surface-container-highest)
    );
  }
}

.md-field.has-icon .md-field__container,
.md-field.has-leading .md-field__container {
  padding-inline-start: var(--md-field-leading-width, 48px);
}

.md-field__leading {
  position: absolute;
  inset-inline-start: 12px;
  inset-block-start: 50%;
  translate: 0 -50%;
  display: inline-flex;
  align-items: center;
  color: var(--md-sys-color-on-surface-variant);
}

.md-field.is-focused .md-field__leading {
  color: var(--md-sys-color-primary);
}

.md-field__label {
  position: absolute;
  z-index: 1;
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

.md-field.has-icon .md-field__label,
.md-field.has-leading .md-field__label {
  inset-inline-start: var(--md-field-leading-width, 48px);
}

.md-field.is-floating .md-field__label {
  translate: 0 -22px;
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-field.is-focused .md-field__label {
  color: var(--md-sys-color-primary);
}

/* 错误态优先于聚焦态：聚焦时标签不能还是主色 */
.md-field.is-invalid .md-field__label {
  color: var(--md-sys-color-error);
}

.md-field.has-trailing .md-field__label {
  max-width: calc(100% - 120px);
}

.md-field__control {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding-block-start: 16px;
}

.md-field.is-floating .md-field__control {
  padding-block-start: 20px;
}

.md-field.is-multiline .md-field__container,
.md-field.is-multiline .md-field__control {
  align-items: flex-start;
}

.md-field__trailing {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-inline-end: -8px;
  flex-shrink: 0;
}

/* ---------- 指示线 ---------- */
.md-field__indicator {
  height: 1px;
  margin-inline: 16px;
  background-color: var(--md-sys-color-on-surface-variant);
  transition:
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    margin-inline var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-field.is-focused .md-field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-primary);
}

.md-field.is-invalid .md-field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-error);
}

/* ---------- Outlined ---------- */
.md-field--outlined .md-field__container {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: transparent;
}

.md-field--outlined .md-field__label {
  inset-inline-start: 12px;
  padding-inline: 4px;
  background-color: transparent;
}

.md-field--outlined.has-icon .md-field__label {
  inset-inline-start: 44px;
}

/* 缺口只在使用点 fallback：见 M3TextField 里同一条注释 */
.md-field--outlined.is-floating .md-field__label {
  translate: 0 calc(-50% - 28px);
  background-color: var(--md-field-label-surface, var(--md-sys-color-surface));
}

.md-field--outlined .md-field__control {
  padding-block: 0;
}

.md-field--outlined.is-focused .md-field__container {
  border-color: var(--md-sys-color-primary);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
}

.md-field--outlined.is-invalid .md-field__container {
  border-color: var(--md-sys-color-error);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-error);
}

.md-field--outlined .md-field__indicator {
  display: none;
}

/* ---------- 支持文案 ---------- */
.md-field__support-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 16px 0;
}

.md-field__support {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-field__support--error {
  color: var(--md-sys-color-error);
}

.md-field__counter {
  margin-inline-start: auto;
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  font-variant-numeric: tabular-nums;
}

.md-field__required {
  margin-inline-start: 2px;
  color: var(--md-sys-color-error);
}

/* ---------- 禁用 ---------- */
.md-field.is-disabled .md-field__container {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  cursor: not-allowed;
}

.md-field--outlined.is-disabled .md-field__container {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  background-color: transparent;
}

.md-field.is-disabled .md-field__indicator {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-field.is-disabled .md-field__label,
.md-field.is-disabled .md-field__counter,
.md-field.is-disabled .md-field__support,
.md-field.is-disabled .md-field__leading {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
