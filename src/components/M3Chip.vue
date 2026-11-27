<script setup lang="ts">
import { computed } from 'vue'
import { IconCheck, IconClose, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import { vRipple } from '../directives/ripple'

const props = withDefaults(
  defineProps<{
    /** Chip text. */
    label: string
    /** MD3 chip type. */
    variant?: 'assist' | 'filter' | 'input' | 'suggestion'
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

/*
 * 用 computed 而不是在 setup 里算一次常量：
 * variant 是 prop，父组件切换类型时旧写法不会重新计算。
 */
const isToggle = computed(() => props.variant === 'filter' || props.toggle)
const hasRemove = computed(() => props.variant === 'input' && !props.disabled)
</script>

<template>
  <!--
    输入 chip 的根节点不能是一个 <button>：里面还要放「移除」按钮，
    而 HTML 不允许 button 嵌套 button（读屏与键盘都会出问题）。
    统一改成「根 span 负责外观 + 内部两个真按钮」，click 仍然冒泡到根，
    所以外部的 @click 用法完全不变。
  -->
  <span
    class="md-chip"
    :class="[
      'md-chip--' + variant,
      { 'is-selected': selected, 'is-disabled': disabled, 'has-remove': hasRemove },
    ]"
  >
    <button
      v-ripple
      type="button"
      class="md-chip__main"
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
      <span class="md-chip__label"><slot>{{ label }}</slot></span>
    </button>

    <button
      v-if="hasRemove"
      type="button"
      class="md-chip__remove"
      :aria-label="'移除 ' + label"
      @click.stop="emit('remove')"
    >
      <M3Icon :icon="IconClose" :size="18" />
    </button>
  </span>
</template>

<style scoped>
.md-chip {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  height: 32px;
  max-width: 100%;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
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

.md-chip__main {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 100%;
  padding-inline: 12px;
  border: none;
  border-radius: inherit;
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  line-height: var(--md-sys-typescale-label-large-line-height);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.md-chip.has-remove .md-chip__main {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  padding-inline-end: 8px;
}

.md-chip__remove {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 100%;
  border: none;
  border-radius: 0 var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small) 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

/* 状态层统一由 ::after 画，鼠标与键盘走同一套视觉 */
.md-chip__main::after,
.md-chip__remove::after {
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
  .md-chip__main:hover::after,
  .md-chip__remove:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-chip__main:focus-visible::after,
.md-chip__remove:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.md-chip__main:active::after,
.md-chip__remove:active::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

/* 焦点环贴着 chip 内缘，避免在工具条里把相邻 chip 推开 */
.md-chip__main:focus-visible,
.md-chip__remove:focus-visible {
  outline-offset: -1px;
}

.md-chip__label,
.md-chip__icon {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
}

.md-chip__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.md-chip.is-selected {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  box-shadow: none;
}

.md-chip--suggestion {
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline-variant);
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
