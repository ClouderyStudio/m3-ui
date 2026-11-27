<script setup lang="ts">
import { computed, useId } from 'vue'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: RadioOption[]
    /** 组标题（fieldset 的 legend）。 */
    label?: string
    hint?: string
    error?: string
    disabled?: boolean
    direction?: 'vertical' | 'horizontal'
    /** 覆盖原生 name；默认每个组自动生成，保证单选用同一组名。 */
    name?: string
  }>(),
  {
    label: undefined,
    hint: '',
    error: '',
    disabled: false,
    direction: 'vertical',
    name: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const uid = useId()
const groupName = computed(() => props.name ?? 'md-radio-' + uid)
const describedBy = computed(() => {
  if (props.error) return uid + '-error'
  if (props.hint) return uid + '-hint'
  return undefined
})

function select(option: RadioOption): void {
  if (props.disabled || option.disabled) return
  emit('update:modelValue', option.value)
}
</script>

<template>
  <fieldset
    class="md-radio-group"
    :class="['md-radio-group--' + direction, { 'is-invalid': !!error, 'is-disabled': disabled }]"
    :disabled="disabled"
    :aria-describedby="describedBy"
  >
    <legend v-if="label" class="md-radio-group__legend md-typescale-body-small">{{ label }}</legend>

    <div class="md-radio-group__items">
      <label
        v-for="option in options"
        :key="option.value"
        class="md-radio"
        :class="{ 'is-checked': option.value === modelValue, 'is-disabled': disabled || option.disabled }"
      >
        <span class="md-radio__control">
          <input
            class="md-radio__input"
            type="radio"
            :name="groupName"
            :value="option.value"
            :checked="option.value === modelValue"
            :disabled="disabled || option.disabled"
            @change="select(option)"
          />

          <span class="md-radio__layer" aria-hidden="true" />
          <span class="md-radio__ring" aria-hidden="true" />
          <span class="md-radio__box" aria-hidden="true">
            <span class="md-radio__dot" />
          </span>
        </span>

        <span class="md-radio__text">
          <span class="md-radio__label md-typescale-body-large">{{ option.label }}</span>
          <span v-if="option.description" class="md-radio__description md-typescale-body-small">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>

    <p v-if="error" :id="uid + '-error'" class="md-radio-group__support md-radio-group__support--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="uid + '-hint'" class="md-radio-group__support">{{ hint }}</p>
  </fieldset>
</template>

<style scoped>
.md-radio-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.md-radio-group__legend {
  padding: 0;
  margin-block-end: 4px;
  color: var(--md-sys-color-on-surface-variant);
}

.md-radio-group__items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.md-radio-group--horizontal .md-radio-group__items {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.md-radio {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 40px;
  padding-block: 8px;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  user-select: none;
}

.md-radio__control {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-block-start: 1px;
  flex-shrink: 0;
}

.md-radio__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 4;
}

.md-radio__layer,
.md-radio__ring {
  position: absolute;
  inset: -10px;
  border-radius: var(--md-sys-shape-corner-full);
  pointer-events: none;
}

.md-radio__layer {
  background-color: var(--md-sys-color-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-radio:hover .md-radio__layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-radio:active .md-radio__layer {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-radio__ring {
  border: 2px solid var(--md-sys-color-secondary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-radio__input:focus-visible ~ .md-radio__ring {
  opacity: 1;
}

.md-radio__box {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--md-sys-color-on-surface-variant);
  border-radius: var(--md-sys-shape-corner-full);
  transition: border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-radio:hover .md-radio__box {
  border-color: var(--md-sys-color-on-surface);
}

.md-radio.is-checked .md-radio__box {
  border-color: var(--md-sys-color-primary);
}

.md-radio__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  scale: 0;
  opacity: 0;
  transition:
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-radio.is-checked .md-radio__dot {
  scale: 1;
  opacity: 1;
}

.md-radio__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.md-radio__description {
  color: var(--md-sys-color-on-surface-variant);
}

.md-radio.is-disabled {
  pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-radio.is-disabled .md-radio__box {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-radio.is-disabled .md-radio__dot {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-radio-group__support {
  margin: 0;
  padding: 4px 0 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-radio-group__support--error {
  color: var(--md-sys-color-error);
}

@media (prefers-reduced-motion: reduce) {
  .md-radio__dot {
    transition-duration: 1ms;
  }
}
</style>
