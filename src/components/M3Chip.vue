<script setup lang="ts">
import { IconCheck, IconClose, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import { vRipple } from '../directives/ripple'

const props = withDefaults(
  defineProps<{
    /** Chip text. */
    label: string
    /** MD3 chip type. */
    variant?: 'assist' | 'filter' | 'input'
    /** Filter chips toggle; selected chips get the checkmark and a tonal container. */
    selected?: boolean
    icon?: IconComponent | null
    disabled?: boolean
    /** Render as a pressed toggle button (filter/input chips). */
    toggle?: boolean
  }>(),
  {
    variant: 'assist',
    selected: false,
    icon: null,
    disabled: false,
    toggle: false,
  },
)

const emit = defineEmits<{ (e: 'remove'): void }>()

const isToggle = props.variant === 'filter' || props.toggle
</script>

<template>
  <button
    v-ripple
    type="button"
    class="md-chip"
    :class="['md-chip--' + variant, { 'is-selected': selected, 'is-disabled': disabled }]"
    :disabled="disabled"
    :aria-pressed="isToggle ? selected : undefined"
  >
    <M3Icon
      v-if="selected && isToggle"
      :icon="IconCheck"
      :size="18"
      class="md-chip__icon md-chip__icon--check"
    />
    <M3Icon v-else-if="icon" :icon="icon" :size="18" class="md-chip__icon" />
    <span class="md-chip__label">{{ label }}</span>
    <span
      v-if="variant === 'input'"
      class="md-chip__trailing"
      role="button"
      tabindex="0"
      aria-label="移除"
      @click.stop="emit('remove')"
      @keydown.enter.stop.prevent="emit('remove')"
      @keydown.space.stop.prevent="emit('remove')"
    >
      <M3Icon :icon="IconClose" :size="18" />
    </span>
  </button>
</template>

<style scoped>
.md-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding-inline: 12px;
  border: none;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  line-height: var(--md-sys-typescale-label-large-line-height);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

/* 与按钮同一套按压反馈；chip 更薄，缩放取 0.95 才看得出来 */
.md-chip:active:not(.is-disabled) {
  scale: 0.95;
}

.md-chip::after {
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
  .md-chip:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-chip:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.md-chip:active::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-chip__label,
.md-chip__icon,
.md-chip__trailing {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
}

.md-chip.is-selected {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  box-shadow: none;
}

/*
 * 勾选时对勾「弹」出来：只做静态切换的话，选中态和未选中态之间
 * 只差一个容器的明暗，扫一眼容易漏看。scale + opacity 的短促动画把注意力拉过去。
 */
.md-chip__icon--check {
  margin-inline-start: -4px;
  animation: md-pop-in var(--md-sys-motion-duration-medium1)
    var(--md-sys-motion-easing-emphasized-decelerate) both;
}

@media (prefers-reduced-motion: reduce) {
  /* 削减：不缩放，只保留淡入 */
  .md-chip__icon--check {
    animation: md-fade-in var(--md-sys-motion-duration-short4) linear both;
  }

  .md-chip:active:not(.is-disabled) {
    scale: 0.99;
  }
}

.md-chip__trailing {
  margin-inline-end: -4px;
  cursor: pointer;
}

.md-chip.is-disabled {
  pointer-events: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
.md-chip.is-disabled.is-selected {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>