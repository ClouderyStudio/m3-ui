<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconStar, IconStarFilled, IconStarHalf } from '../icons'
import M3Icon from './M3Icon.vue'

type RatingSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    modelValue: number
    max?: number
    readonly?: boolean
    disabled?: boolean
    /** Select half stars (click on the left half of a star). */
    allowHalf?: boolean
    /** Clicking the current value again clears it. */
    allowClear?: boolean
    size?: RatingSize
    showValue?: boolean
    ariaLabel?: string
    /** Per-star accessible labels; defaults to "1 星"… */
    labels?: string[]
  }>(),
  {
    max: 5,
    readonly: false,
    disabled: false,
    allowHalf: false,
    allowClear: false,
    size: 'md',
    showValue: false,
    ariaLabel: '评分',
    labels: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const hover = ref<number | null>(null)
const iconSize = computed(() => (props.size === 'lg' ? 32 : props.size === 'sm' ? 20 : 24))
const step = computed(() => (props.allowHalf ? 0.5 : 1))
const displayValue = computed(() => hover.value ?? props.modelValue)
const visibleValue = computed(() => props.modelValue.toFixed(props.allowHalf ? 1 : 0))
const tabbableIndex = computed(() => {
  if (props.readonly || props.disabled) return -1
  const index = Math.ceil(props.modelValue) - 1
  return Math.min(Math.max(index, 0), props.max - 1)
})

function stateFor(index: number): 'full' | 'half' | 'empty' {
  const value = displayValue.value
  if (value >= index + 1) return 'full'
  if (props.allowHalf && value >= index + 0.5) return 'half'
  return 'empty'
}

function iconFor(index: number) {
  const state = stateFor(index)
  if (state === 'full') return IconStarFilled
  if (state === 'half') return IconStarHalf
  return IconStar
}

function valueAt(index: number, event: MouseEvent | KeyboardEvent): number {
  if (!(event instanceof MouseEvent) || !props.allowHalf) return index + 1
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const half = event.clientX - rect.left < rect.width / 2
  return index + (half ? 0.5 : 1)
}

function preview(index: number, event: MouseEvent): void {
  if (props.readonly || props.disabled) return
  hover.value = valueAt(index, event)
}

function clearPreview(): void {
  hover.value = null
}

function commit(index: number, event: MouseEvent): void {
  if (props.readonly || props.disabled) return
  const next = valueAt(index, event)
  hover.value = null
  if (props.allowClear && next === props.modelValue) {
    emit('update:modelValue', 0)
    return
  }
  emit('update:modelValue', next)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.readonly || props.disabled) return
  let next = props.modelValue
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = Math.min(props.max, props.modelValue + step.value)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = Math.max(0, props.modelValue - step.value)
      break
    case 'Home':
      next = step.value
      break
    case 'End':
      next = props.max
      break
    case 'Delete':
    case 'Backspace':
      next = 0
      break
    default:
      return
  }
  event.preventDefault()
  emit('update:modelValue', next)
}
</script>

<template>
  <div
    v-if="readonly"
    class="md-rating md-rating--readonly"
    :class="'md-rating--' + size"
    role="img"
    :aria-label="ariaLabel + '：' + modelValue + ' / ' + max"
  >
    <span v-for="index in max" :key="index" class="md-rating__static" :class="'is-' + stateFor(index - 1)">
      <M3Icon :icon="iconFor(index - 1)" :size="iconSize" />
    </span>
    <span v-if="showValue" class="md-rating__value md-typescale-label-large">{{ visibleValue }}</span>
  </div>

  <div
    v-else
    class="md-rating"
    :class="[
      'md-rating--' + size,
      { 'is-disabled': disabled },
    ]"
    role="radiogroup"
    :aria-label="ariaLabel"
    @mouseleave="clearPreview"
  >
    <button
      v-for="index in max"
      :key="index"
      type="button"
      role="radio"
      class="md-rating__star"
      :class="'is-' + stateFor(index - 1)"
      :aria-checked="modelValue === index"
      :aria-label="labels?.[index - 1] ?? index + ' 星'"
      :tabindex="tabbableIndex === index - 1 ? 0 : -1"
      :disabled="disabled"
      @click="commit(index - 1, $event)"
      @mousemove="preview(index - 1, $event)"
      @keydown="onKeydown"
    >
      <M3Icon :icon="iconFor(index - 1)" :size="iconSize" class="md-rating__icon" />
    </button>

    <span v-if="showValue" class="md-rating__value md-typescale-label-large">{{ visibleValue }}</span>
  </div>
</template>

<style scoped>
.md-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.md-rating__star {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-rating--sm .md-rating__star {
  width: 32px;
  height: 32px;
}

.md-rating--lg .md-rating__star {
  width: 48px;
  height: 48px;
}

.md-rating__star::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-rating__star:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-rating__star:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}

.md-rating__icon {
  position: relative;
  z-index: 3;
  transition: scale var(--md-sys-motion-duration-short3)
    var(--md-sys-motion-easing-emphasized-decelerate);
}

@media (hover: hover) {
  .md-rating__star:hover .md-rating__icon {
    scale: 1.12;
  }
}

.md-rating__star.is-full,
.md-rating__star.is-half {
  color: var(--md-sys-color-primary);
}

.md-rating__static {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--md-sys-color-on-surface-variant);
}

/* 只读态和交互态用同一套状态色：满星/半星主色，空星描边色 */
.md-rating__static.is-full,
.md-rating__static.is-half {
  color: var(--md-sys-color-primary);
}

.md-rating__value {
  margin-inline-start: 6px;
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

.md-rating.is-disabled {
  opacity: var(--md-sys-state-disabled-content-opacity);
}

.md-rating.is-disabled .md-rating__star {
  cursor: not-allowed;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .md-rating__icon {
    transition: none;
  }

  .md-rating__star:hover .md-rating__icon {
    scale: 1;
  }
}
</style>
