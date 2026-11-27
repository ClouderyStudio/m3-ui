<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { IconExpandMore } from '../icons'
import M3Icon from './M3Icon.vue'

/**
 * MD3 展开面板。
 *
 * 高度动画用 grid-template-rows 0fr → 1fr：它能在不知道内容高度的前提下
 * 平滑展开（max-height 需要猜一个上限，内容一变就会露馅）。
 */
const props = withDefaults(
  defineProps<{
    /** Controlled open state; omit to let the panel manage itself. */
    modelValue?: boolean
    title: string
    supporting?: string
    disabled?: boolean
    /** Hide the chevron when the whole header is a custom affordance. */
    hideToggle?: boolean
  }>(),
  { modelValue: undefined, supporting: undefined, disabled: false, hideToggle: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  toggle: [value: boolean]
}>()

const inner = ref(false)
const uid = useId()
const headerId = uid + '-header'
const contentId = uid + '-content'

const isControlled = computed(() => props.modelValue !== undefined)
const open = computed(() => (isControlled.value ? Boolean(props.modelValue) : inner.value))

function toggle(): void {
  if (props.disabled) return
  const next = !open.value
  if (isControlled.value) emit('update:modelValue', next)
  else inner.value = next
  emit('toggle', next)
}
</script>

<template>
  <section class="md-expansion" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <button
      :id="headerId"
      type="button"
      class="md-expansion__header"
      :aria-expanded="open"
      :aria-controls="contentId"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="md-expansion__text">
        <span class="md-expansion__title md-typescale-title-medium"><slot name="title">{{ title }}</slot></span>
        <span v-if="supporting" class="md-expansion__supporting md-typescale-body-medium">{{ supporting }}</span>
      </span>

      <span v-if="$slots.trailing" class="md-expansion__trailing"><slot name="trailing" /></span>

      <M3Icon
        v-if="!hideToggle"
        :icon="IconExpandMore"
        :size="24"
        class="md-expansion__toggle"
        aria-hidden="true"
      />
    </button>

    <div
      :id="contentId"
      class="md-expansion__content"
      role="region"
      :aria-labelledby="headerId"
      :aria-hidden="!open"
      :inert="!open"
    >
      <div class="md-expansion__clip">
        <div class="md-expansion__body md-typescale-body-medium">
          <slot />
          <div v-if="$slots.actions" class="md-expansion__actions"><slot name="actions" /></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.md-expansion {
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  overflow: hidden;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-expansion__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: inherit;
  text-align: start;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
}

.md-expansion__header::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-expansion__header:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-expansion__header:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}

.md-expansion__text,
.md-expansion__trailing,
.md-expansion__toggle {
  position: relative;
  z-index: 3;
}

.md-expansion__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.md-expansion__supporting {
  color: var(--md-sys-color-on-surface-variant);
}

.md-expansion__trailing {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.md-expansion__toggle {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  transition: rotate var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

.md-expansion.is-open .md-expansion__toggle {
  rotate: 180deg;
}

.md-expansion__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--md-sys-motion-duration-medium2)
    var(--md-sys-motion-easing-emphasized);
}

.md-expansion.is-open .md-expansion__content {
  grid-template-rows: 1fr;
}

.md-expansion__clip {
  min-height: 0;
  overflow: hidden;
}

.md-expansion__body {
  /* 头部悬停时状态层会压出可见的边界，正文紧贴着它读起来像「还没换行」 */
  padding: 12px 16px 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.md-expansion__body :deep(p) {
  margin: 0 0 8px;
}

.md-expansion__body :deep(p:last-child) {
  margin-block-end: 0;
}

.md-expansion__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 12px;
  margin-inline-start: -8px;
}

.md-expansion.is-disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-expansion.is-disabled .md-expansion__header {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .md-expansion__content {
    transition-duration: var(--md-sys-motion-duration-short4);
  }

  .md-expansion__toggle {
    transition-duration: var(--md-sys-motion-duration-short4);
  }
}
</style>
