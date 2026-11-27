<script setup lang="ts">
import { computed } from 'vue'
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import { vRipple } from '../directives/ripple'

type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'
type IconButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    icon: IconComponent
    /** Variant to use when the button is toggled on. Defaults to a filled emphasis. */
    selectedIcon?: IconComponent | null
    variant?: IconButtonVariant
    size?: IconButtonSize
    /** Accessible name — required, since the button has no visible label. */
    label: string
    selected?: boolean
    /**
     * Marks the button as a two-state control even without a selectedIcon.
     * Without it, selected is only a visual emphasis and no aria-pressed is emitted —
     * a toggle that never announces its state is the most common icon-button a11y bug.
     */
    toggleable?: boolean
    disabled?: boolean
    /** Busy state: keeps the button's colours, swaps the glyph for a spinner. */
    loading?: boolean
    href?: string
    target?: string
    rel?: string
    type?: 'button' | 'submit' | 'reset'
    /** Circular hit area is the default; 'square' is used for dense app bars. */
    shape?: 'full' | 'small' | 'medium'
  }>(),
  {
    selectedIcon: null,
    variant: 'standard',
    size: 'md',
    selected: false,
    toggleable: false,
    disabled: false,
    loading: false,
    href: undefined,
    target: undefined,
    rel: undefined,
    type: 'button',
    shape: 'full',
  },
)

const tag = computed(() => (props.href ? 'a' : 'button'))
const isLink = computed(() => Boolean(props.href))
const glyph = computed(() => {
  if (props.selected && props.selectedIcon) return props.selectedIcon
  return props.icon
})
const glyphSize = computed(() => (props.size === 'lg' ? 24 : props.size === 'sm' ? 18 : 24))
const effectiveVariant = computed(() => (props.selected && props.variant === 'standard' ? 'tonal' : props.variant))
const inert = computed(() => props.disabled || props.loading)
const pressed = computed(() => (props.toggleable || props.selectedIcon ? props.selected : undefined))
</script>

<template>
  <component
    :is="tag"
    v-ripple
    class="md-icon-btn"
    :class="[
      'md-icon-btn--' + effectiveVariant,
      'md-icon-btn--' + size,
      'md-icon-btn--shape-' + shape,
      { 'is-selected': selected, 'is-disabled': disabled, 'is-loading': loading },
    ]"
    :href="href"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :type="isLink ? undefined : type"
    :disabled="!isLink && inert ? true : undefined"
    :aria-label="label"
    :aria-pressed="pressed"
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled && isLink ? -1 : undefined"
    :title="label"
  >
    <span v-if="loading" class="md-icon-btn__spinner" aria-hidden="true" />
    <M3Icon v-else :icon="glyph" :size="glyphSize" />
  </component>
</template>

<style scoped>
.md-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  border: none;
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    height var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized),
    width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* 与 M3Button 同一套按压反馈，图标按钮略小一号（0.92），因为它本身只有 40dp */
.md-icon-btn:active:not(.is-disabled) {
  scale: 0.92;
}

.md-icon-btn--shape-full {
  border-radius: var(--md-sys-shape-corner-full);
}
.md-icon-btn--shape-small {
  border-radius: var(--md-sys-shape-corner-small);
}
.md-icon-btn--shape-medium {
  border-radius: var(--md-sys-shape-corner-medium);
}

.md-icon-btn::after {
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
  .md-icon-btn:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-icon-btn:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.md-icon-btn:active::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

/*
 * 让图标浮在状态层与涟漪之上。
 *
 * 不能用通配的 :deep(*)：那会把 ripple 指令运行时插入的 .md-ripple 一起选中，
 * 把它的 position:absolute 覆盖成 relative —— 那个 16px 的方块就变成了 flex 里的
 * 实际子项，把图标挤到一边。表现是「点一下图标就左移 8px」，而且只在点击后才出现。
 * 这里只点名自己渲染的元素（M3Icon 的根节点就是 .md-icon）。
 */
.md-icon-btn > :deep(.md-icon) {
  position: relative;
  z-index: 3;
}

.md-icon-btn__spinner {
  position: relative;
  z-index: 3;
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--md-sys-shape-corner-full);
  animation: md-icon-btn-spin 640ms linear infinite;
}

@keyframes md-icon-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Variants ---------- */
.md-icon-btn--standard {
  color: var(--md-sys-color-on-surface-variant);
}
.md-icon-btn--standard.is-selected {
  color: var(--md-sys-color-primary);
}
.md-icon-btn--filled {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.md-icon-btn--tonal {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.md-icon-btn--outlined {
  color: var(--md-sys-color-on-surface-variant);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
}
.md-icon-btn--outlined.is-selected {
  background-color: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  box-shadow: none;
}

/* ---------- Sizes ---------- */
.md-icon-btn--sm {
  height: 32px;
  width: 32px;
}
.md-icon-btn--lg {
  height: 48px;
  width: 48px;
}

.is-disabled {
  pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
.md-icon-btn--filled.is-disabled,
.md-icon-btn--tonal.is-disabled {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

/* Busy keeps its emphasis; only input is blocked. */
.is-loading {
  pointer-events: none;
}
.md-icon-btn--filled.is-loading {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.md-icon-btn--tonal.is-loading {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.md-icon-btn--outlined.is-loading {
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
}

@media (prefers-reduced-motion: reduce) {
  /* 削减按压反馈而非删除：1% 的缩放仍能让人确认点到了 */
  .md-icon-btn:active:not(.is-disabled) {
    scale: 0.99;
  }

  .md-icon-btn__spinner {
    animation-duration: 1500ms;
  }
}
</style>
