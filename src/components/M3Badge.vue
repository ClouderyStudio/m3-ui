<script setup lang="ts">
import { computed, useSlots } from 'vue'

type BadgePosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'
type BadgeTone = 'error' | 'primary' | 'secondary' | 'tertiary'

const props = withDefaults(
  defineProps<{
    /** Count or short text. Omit for a bare dot (or set dot). */
    value?: string | number | null
    /** Show a 6dp dot instead of the value. */
    dot?: boolean
    /** Above this number the badge shows "99+". */
    max?: number
    position?: BadgePosition
    tone?: BadgeTone
    /** Show the badge even when the value is 0. */
    showZero?: boolean
    /** Accessible description, e.g. "3 条未读消息". */
    ariaLabel?: string
  }>(),
  {
    value: undefined,
    dot: false,
    max: 99,
    position: 'top-end',
    tone: 'error',
    showZero: false,
    ariaLabel: undefined,
  },
)

const slots = useSlots()
const hasAnchor = computed(() => Boolean(slots.default))

const visible = computed(() => {
  if (props.dot) return true
  if (props.value === undefined || props.value === null || props.value === '') return false
  if (!props.showZero && Number(props.value) === 0) return false
  return true
})

const display = computed(() => {
  if (props.dot) return ''
  if (typeof props.value === 'number' && props.value > props.max) return props.max + '+'
  return String(props.value ?? '')
})
</script>

<template>
  <span class="md-badge-anchor" :class="{ 'is-inline': !hasAnchor }">
    <slot />

    <span
      v-if="visible"
      class="md-badge"
      :class="[
        'md-badge--' + tone,
        'md-badge--' + position,
        { 'md-badge--dot': dot, 'md-badge--inline': !hasAnchor },
      ]"
      :aria-label="ariaLabel"
      :role="ariaLabel ? 'status' : undefined"
    >
      <template v-if="!dot">{{ display }}</template>
    </span>
  </span>
</template>

<style scoped>
.md-badge-anchor {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.md-badge-anchor.is-inline {
  vertical-align: middle;
}

.md-badge {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding-inline: 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  font-family: var(--md-ref-typeface-plain);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 0 0 2px var(--md-sys-color-surface);
}

.md-badge--dot {
  width: 6px;
  min-width: 6px;
  height: 6px;
  padding: 0;
  box-shadow: none;
}

.md-badge--top-end {
  inset-block-start: 0;
  inset-inline-end: 0;
  translate: 50% -50%;
}
.md-badge--top-start {
  inset-block-start: 0;
  inset-inline-start: 0;
  translate: -50% -50%;
}
.md-badge--bottom-end {
  inset-block-end: 0;
  inset-inline-end: 0;
  translate: 50% 50%;
}
.md-badge--bottom-start {
  inset-block-end: 0;
  inset-inline-start: 0;
  translate: -50% 50%;
}

.md-badge--primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.md-badge--secondary {
  background-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
}
.md-badge--tertiary {
  background-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary);
}

/* 没有子元素时不再悬浮，直接作为一个独立的小标签 */
.md-badge--inline {
  position: static;
  translate: none;
  box-shadow: none;
}

.md-badge-anchor.is-inline:has(.md-badge--inline) {
  min-width: 16px;
  min-height: 16px;
}
</style>
