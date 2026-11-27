<script setup lang="ts">
import { computed } from 'vue'
import { IconCheck, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'

export interface StepItem {
  label: string
  description?: string
  icon?: IconComponent | null
  /** Marks the step as optional in the label row. */
  optional?: boolean
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    /** Zero-based index of the active step. */
    modelValue: number
    steps: StepItem[]
    orientation?: 'horizontal' | 'vertical'
    /** In linear mode only completed/current steps can be clicked. */
    linear?: boolean
    clickable?: boolean
    /** Index (or indexes) shown in the error state. */
    error?: number | number[] | null
    ariaLabel?: string
  }>(),
  {
    orientation: 'horizontal',
    linear: true,
    clickable: true,
    error: null,
    ariaLabel: '步骤',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const errorSet = computed(() => {
  if (props.error === null || props.error === undefined) return new Set<number>()
  return new Set(Array.isArray(props.error) ? props.error : [props.error])
})

function status(index: number): 'completed' | 'active' | 'error' | 'upcoming' {
  if (errorSet.value.has(index)) return 'error'
  if (index < props.modelValue) return 'completed'
  if (index === props.modelValue) return 'active'
  return 'upcoming'
}

function canGo(index: number): boolean {
  if (!props.clickable || props.steps[index]?.disabled) return false
  if (index === props.modelValue) return false
  return !props.linear || index < props.modelValue
}

function go(index: number): void {
  if (!canGo(index)) return
  emit('update:modelValue', index)
}
</script>

<template>
  <ol class="md-stepper" :class="'md-stepper--' + orientation" :aria-label="ariaLabel">
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="md-stepper__step"
      :class="['is-' + status(index), { 'is-last': index === steps.length - 1 }]"
      :aria-current="status(index) === 'active' ? 'step' : undefined"
    >
      <button
        type="button"
        class="md-stepper__header"
        :disabled="!canGo(index)"
        @click="go(index)"
      >
        <span class="md-stepper__indicator">
          <M3Icon v-if="status(index) === 'completed'" :icon="IconCheck" :size="18" />
          <M3Icon v-else-if="step.icon" :icon="step.icon" :size="18" />
          <span v-else class="md-stepper__number">{{ index + 1 }}</span>
        </span>

        <span class="md-stepper__text">
          <span class="md-stepper__label md-typescale-title-small">
            {{ step.label }}
            <span v-if="step.optional" class="md-stepper__optional md-typescale-label-small">可选</span>
          </span>
          <span v-if="step.description" class="md-stepper__description md-typescale-body-small">
            {{ step.description }}
          </span>
        </span>
      </button>

      <span v-if="index !== steps.length - 1" class="md-stepper__connector" aria-hidden="true" />
    </li>
  </ol>
</template>

<style scoped>
.md-stepper {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-stepper__step {
  position: relative;
  display: flex;
}

.md-stepper__header {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-medium);
}

.md-stepper__header:disabled {
  cursor: default;
}

.md-stepper__header:not(:disabled):focus-visible {
  outline-offset: 2px;
}

.md-stepper__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: var(--md-sys-shape-corner-full);
  border: 2px solid var(--md-sys-color-outline);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: 500;
  line-height: 1;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-stepper__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.md-stepper__label {
  color: var(--md-sys-color-on-surface);
}

.md-stepper__optional {
  margin-inline-start: 4px;
  color: var(--md-sys-color-on-surface-variant);
}

.md-stepper__description {
  color: var(--md-sys-color-on-surface-variant);
}

.md-stepper__connector {
  background-color: var(--md-sys-color-outline-variant);
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* ---------- States ---------- */
.md-stepper__step.is-active .md-stepper__indicator {
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}

.md-stepper__step.is-completed .md-stepper__indicator {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md-stepper__step.is-completed .md-stepper__connector {
  background-color: var(--md-sys-color-primary);
}

.md-stepper__step.is-error .md-stepper__indicator {
  border-color: var(--md-sys-color-error);
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.md-stepper__step.is-error .md-stepper__label {
  color: var(--md-sys-color-error);
}

.md-stepper__step.is-upcoming .md-stepper__label {
  color: var(--md-sys-color-on-surface-variant);
}

.md-stepper__header:disabled .md-stepper__indicator {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

/* ---------- Horizontal ---------- */
.md-stepper--horizontal .md-stepper__step {
  flex: 1 1 0;
  min-width: 0;
}

.md-stepper--horizontal .md-stepper__header {
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px;
  text-align: center;
}

.md-stepper--horizontal .md-stepper__text {
  align-items: center;
}

.md-stepper--horizontal .md-stepper__connector {
  position: absolute;
  inset-block-start: 15px;
  inset-inline-start: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 2px;
}

/* ---------- Vertical ---------- */
.md-stepper--vertical {
  flex-direction: column;
}

.md-stepper--vertical .md-stepper__step {
  flex-direction: column;
  padding-block-end: 24px;
}

.md-stepper--vertical .md-stepper__step.is-last {
  padding-block-end: 0;
}

.md-stepper--vertical .md-stepper__header {
  align-items: flex-start;
  padding: 2px 4px;
}

.md-stepper--vertical .md-stepper__connector {
  position: absolute;
  inset-inline-start: 11px;
  inset-block-start: 28px;
  width: 2px;
  height: calc(100% - 32px);
}

@media (prefers-reduced-motion: reduce) {
  .md-stepper__indicator,
  .md-stepper__connector {
    transition-duration: 1ms;
  }
}
</style>
