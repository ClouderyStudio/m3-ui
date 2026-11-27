<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    /** Visible label above the track; also used as the accessible name. */
    label?: string
    /** Show the current value on the right. */
    showValue?: boolean
    /** Override the rendered value (e.g. "1.2 GB"). */
    valueText?: string
    /** Material 3 value indicators along the track. */
    ticks?: boolean
    /** Thumb/track scale. */
    size?: 'sm' | 'md'
    ariaLabel?: string
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    label: undefined,
    showValue: false,
    valueText: undefined,
    ticks: false,
    size: 'md',
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const safeMax = computed(() => (props.max > props.min ? props.max : props.min + 1))
const clamped = computed(() => Math.min(Math.max(props.modelValue, props.min), safeMax.value))
const percent = computed(() => ((clamped.value - props.min) / (safeMax.value - props.min)) * 100)
const display = computed(() => props.valueText ?? String(clamped.value))

const marks = computed(() => {
  if (!props.ticks) return []
  const step = props.step > 0 ? props.step : 1
  const count = Math.floor((safeMax.value - props.min) / step)
  // 太多刻度会变成噪点；超过 20 个就不画了
  if (count < 1 || count > 20) return []
  return Array.from({ length: count + 1 }, (_, index) => ((index * step) / (safeMax.value - props.min)) * 100)
})

function onInput(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="md-slider"
    :class="['md-slider--' + size, { 'is-disabled': disabled }]"
    :style="{ '--md-slider-percent': percent + '%' }"
  >
    <div v-if="label || showValue" class="md-slider__header">
      <span v-if="label" class="md-slider__label md-typescale-body-small">{{ label }}</span>
      <span v-if="showValue" class="md-slider__value md-typescale-label-large">{{ display }}</span>
    </div>

    <div class="md-slider__control">
      <input
        class="md-slider__input"
        type="range"
        :min="min"
        :max="safeMax"
        :step="step"
        :value="clamped"
        :disabled="disabled"
        :aria-label="ariaLabel ?? label ?? '滑块'"
        :aria-valuetext="valueText"
        @input="onInput"
      />

      <span class="md-slider__track" aria-hidden="true">
        <span class="md-slider__track-active" />
        <span v-for="(mark, index) in marks" :key="index" class="md-slider__tick" :style="{ left: mark + '%' }" />
      </span>

      <span class="md-slider__thumb" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.md-slider {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
}

.md-slider__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.md-slider__label {
  color: var(--md-sys-color-on-surface-variant);
}

.md-slider__value {
  margin-inline-start: auto;
  color: var(--md-sys-color-primary);
  font-variant-numeric: tabular-nums;
}

.md-slider__control {
  position: relative;
  display: flex;
  align-items: center;
  height: 44px;
}

/*
 * 原生 range 负责全部交互（键盘、拖拽、读屏），只是完全透明。
 * 自绘的轨道和滑块放在它下面 —— 这样拖动、Home/End、PageUp 都不用重写。
 */
.md-slider__input {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  appearance: none;
}

.md-slider__input:disabled {
  cursor: not-allowed;
}

.md-slider__track {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 50%;
  height: 4px;
  translate: 0 -50%;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-highest);
  overflow: hidden;
}

.md-slider--sm .md-slider__track {
  height: 3px;
}

.md-slider__track-active {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: var(--md-slider-percent);
  border-radius: inherit;
  background-color: var(--md-sys-color-primary);
}

.md-slider__tick {
  position: absolute;
  inset-block-start: 50%;
  width: 4px;
  height: 4px;
  translate: -50% -50%;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-outline);
}

.md-slider__thumb {
  position: absolute;
  z-index: 2;
  inset-block-start: 50%;
  inset-inline-start: var(--md-slider-percent);
  width: 20px;
  height: 20px;
  translate: -50% -50%;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  pointer-events: none;
  transition: width var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-slider--sm .md-slider__thumb {
  width: 16px;
  height: 16px;
}

/* 40dp 的圆形状态层，跟随滑块移动 */
.md-slider__thumb::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-slider__control:hover .md-slider__thumb::before {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}

.md-slider__input:active ~ .md-slider__thumb::before {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-slider__input:focus-visible ~ .md-slider__thumb {
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: 6px;
}

.md-slider.is-disabled .md-slider__track {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.md-slider.is-disabled .md-slider__track-active,
.md-slider.is-disabled .md-slider__thumb {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-slider.is-disabled .md-slider__tick {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .md-slider__thumb,
  .md-slider__thumb::before {
    transition-duration: 1ms;
  }
}
</style>
