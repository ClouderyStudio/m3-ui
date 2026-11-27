<script setup lang="ts">
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Badge from './M3Badge.vue'

export interface NavBarItem {
  value: string
  label: string
  icon: IconComponent
  /** Filled variant of the icon, used while the destination is active. */
  activeIcon?: IconComponent | null
  /** Count/text badge in the corner of the icon. */
  badge?: string | number | null
  /** Render a dot instead of the badge value. */
  badgeDot?: boolean
  disabled?: boolean
}

withDefaults(
  defineProps<{
    modelValue: string
    items: NavBarItem[]
    /** Hide labels for an icon-only bar (the accessible name is still spoken). */
    showLabels?: boolean
    ariaLabel?: string
  }>(),
  { showLabels: true, ariaLabel: '主导航' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function select(item: NavBarItem): void {
  if (item.disabled) return
  emit('update:modelValue', item.value)
}
</script>

<template>
  <nav class="md-nav-bar" :aria-label="ariaLabel">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="md-nav-bar__item"
      :class="{ 'is-active': item.value === modelValue, 'is-disabled': item.disabled }"
      :aria-current="item.value === modelValue ? 'page' : undefined"
      :aria-label="showLabels ? undefined : item.label"
      :disabled="item.disabled"
      @click="select(item)"
    >
      <span class="md-nav-bar__indicator" aria-hidden="true" />

      <span class="md-nav-bar__icon-wrap">
        <M3Badge
          :value="item.badge ?? null"
          :dot="item.badgeDot"
          class="md-nav-bar__badge"
          :aria-label="item.badgeDot ? item.label + ' 有新内容' : undefined"
        >
          <M3Icon
            :icon="(item.value === modelValue && item.activeIcon) || item.icon"
            :size="24"
            class="md-nav-bar__icon"
          />
        </M3Badge>
      </span>

      <span v-if="showLabels" class="md-nav-bar__label md-typescale-label-medium">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.md-nav-bar {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 4px;
  min-height: 80px;
  padding: 12px 8px;
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
}

.md-nav-bar__item {
  position: relative;
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-width: 72px;
  max-width: 168px;
  padding: 6px 12px 8px;
  border: none;
  border-radius: var(--md-sys-shape-corner-large);
  background: none;
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-bar__item::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-nav-bar__item:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-nav-bar__item:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}

.md-nav-bar__icon-wrap {
  position: relative;
  z-index: 3;
  display: grid;
  place-items: center;
  height: 32px;
  padding-inline: 8px;
}

/*
 * 指示条覆盖「图标 + 文字」整块，而不是只垫在图标下面。
 * 这样选中态是一枚完整的胶囊，标签和图标在同一个视觉块里，
 * 不会出现「图标被高亮、文字浮在外面」的割裂感。
 */
.md-nav-bar__indicator {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background-color: transparent;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-bar__item.is-active .md-nav-bar__indicator {
  background-color: var(--md-sys-color-secondary-container);
}

.md-nav-bar__item.is-active {
  /* 文字与图标都坐在 secondary-container 胶囊上，要换成 on- 色才够对比 */
  color: var(--md-sys-color-on-secondary-container);
}

.md-nav-bar__badge {
  position: relative;
  z-index: 4;
}

.md-nav-bar__icon {
  position: relative;
  z-index: 3;
  color: var(--md-sys-color-on-surface-variant);
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-nav-bar__item.is-active .md-nav-bar__icon {
  color: var(--md-sys-color-on-secondary-container);
}

.md-nav-bar__label {
  position: relative;
  z-index: 3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-nav-bar__item.is-active .md-nav-bar__label {
  font-weight: var(--md-sys-typescale-label-medium-weight);
}

.md-nav-bar__item.is-disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-nav-bar__item.is-disabled .md-nav-bar__icon {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
