<script setup lang="ts">
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Badge from './M3Badge.vue'

export interface NavRailItem {
  value: string
  label: string
  icon: IconComponent
  activeIcon?: IconComponent | null
  badge?: string | number | null
  badgeDot?: boolean
  disabled?: boolean
}

withDefaults(
  defineProps<{
    modelValue: string
    items: NavRailItem[]
    /** Wide rail: icons and labels sit in a row, width 256dp. */
    expanded?: boolean
    /** Show labels under the icons in the compact rail. */
    showLabels?: boolean
    ariaLabel?: string
  }>(),
  { expanded: false, showLabels: true, ariaLabel: '主导航' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function select(item: NavRailItem): void {
  if (item.disabled) return
  emit('update:modelValue', item.value)
}
</script>

<template>
  <nav
    class="md-nav-rail"
    :class="{ 'md-nav-rail--expanded': expanded, 'md-nav-rail--labels': showLabels || expanded }"
    :aria-label="ariaLabel"
  >
    <div v-if="$slots.fab" class="md-nav-rail__fab"><slot name="fab" /></div>

    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="md-nav-rail__item"
      :class="{ 'is-active': item.value === modelValue, 'is-disabled': item.disabled }"
      :aria-current="item.value === modelValue ? 'page' : undefined"
      :aria-label="showLabels || expanded ? undefined : item.label"
      :disabled="item.disabled"
      @click="select(item)"
    >
      <span class="md-nav-rail__indicator" aria-hidden="true" />

      <span class="md-nav-rail__icon-wrap">
        <M3Badge
          :value="item.badge ?? null"
          :dot="item.badgeDot"
          class="md-nav-rail__badge"
          :aria-label="item.badgeDot ? item.label + ' 有新内容' : undefined"
        >
          <M3Icon
            :icon="(item.value === modelValue && item.activeIcon) || item.icon"
            :size="24"
            class="md-nav-rail__icon"
          />
        </M3Badge>
      </span>

      <span v-if="showLabels || expanded" class="md-nav-rail__label md-typescale-label-medium">
        {{ item.label }}
      </span>
    </button>

    <div v-if="$slots.default" class="md-nav-rail__footer"><slot /></div>
  </nav>
</template>

<style scoped>
.md-nav-rail {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  min-height: 100%;
  padding: 12px 0;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
}

.md-nav-rail--expanded {
  align-items: stretch;
  width: 256px;
  padding-inline: 12px;
}

.md-nav-rail__fab {
  display: flex;
  justify-content: center;
  margin-block-end: 16px;
}

.md-nav-rail--expanded .md-nav-rail__fab {
  justify-content: flex-start;
  padding-inline: 8px;
}

.md-nav-rail__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 6px 4px 8px;
  border-radius: var(--md-sys-shape-corner-large);
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-rail--expanded .md-nav-rail__item {
  flex-direction: row;
  gap: 12px;
  padding-inline: 12px;
  min-height: 56px;
  border-radius: var(--md-sys-shape-corner-full);
}

.md-nav-rail__item::after {
  content: '';
  position: absolute;
  inset: -2px 4px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-nav-rail__item:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-nav-rail__item:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}

.md-nav-rail__icon-wrap {
  position: relative;
  z-index: 3;
  display: grid;
  place-items: center;
  min-width: 56px;
  height: 32px;
  flex-shrink: 0;
}

/* 与底部导航一致：胶囊覆盖图标 + 文字整块 */
.md-nav-rail__indicator {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background-color: transparent;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-rail__item.is-active .md-nav-rail__indicator {
  background-color: var(--md-sys-color-secondary-container);
}

.md-nav-rail__item.is-active {
  color: var(--md-sys-color-on-secondary-container);
}

.md-nav-rail__badge {
  position: relative;
  z-index: 4;
}

.md-nav-rail__icon {
  position: relative;
  z-index: 3;
  color: var(--md-sys-color-on-surface-variant);
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-rail__item.is-active .md-nav-rail__icon {
  color: var(--md-sys-color-on-secondary-container);
}

.md-nav-rail__label {
  position: relative;
  z-index: 3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-nav-rail--expanded .md-nav-rail__label {
  flex: 1;
  text-align: start;
}

.md-nav-rail__footer {
  margin-block-start: auto;
  display: flex;
  justify-content: center;
  padding-block-start: 12px;
}

.md-nav-rail__item.is-disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-nav-rail__item.is-disabled .md-nav-rail__icon {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
