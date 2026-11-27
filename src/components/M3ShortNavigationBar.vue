<script setup lang="ts">
import type { IconComponent } from '../icons'
import M3Badge from './M3Badge.vue'
import M3Icon from './M3Icon.vue'

/**
 * 短导航栏：底部导航的紧凑版（64dp），图标与文字都更小。
 *
 * 与 M3NavigationBar 共用同一份数据结构与选中语义，只是把高度和内边距收紧 ——
 * 在已经有底部操作栏或内容很密的页面上，80dp 的导航会吃掉一屏。
 */
export interface ShortNavItem {
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
    items: ShortNavItem[]
    showLabels?: boolean
    ariaLabel?: string
  }>(),
  { showLabels: true, ariaLabel: '导航' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <nav class="md-short-nav" :aria-label="ariaLabel">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="md-short-nav__item"
      :class="{ 'is-active': item.value === modelValue, 'is-disabled': item.disabled }"
      :aria-current="item.value === modelValue ? 'page' : undefined"
      :aria-label="showLabels ? undefined : item.label"
      :disabled="item.disabled"
      @click="!item.disabled && emit('update:modelValue', item.value)"
    >
      <span class="md-short-nav__indicator" aria-hidden="true" />

      <M3Badge
        :value="item.badge ?? null"
        :dot="item.badgeDot"
        class="md-short-nav__badge"
      >
        <M3Icon
          :icon="(item.value === modelValue && item.activeIcon) || item.icon"
          :size="20"
          class="md-short-nav__icon"
        />
      </M3Badge>

      <span v-if="showLabels" class="md-short-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.md-short-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 4px;
  min-height: 64px;
  padding: 6px 8px;
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
}

.md-short-nav__item {
  position: relative;
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 60px;
  max-width: 140px;
  padding: 4px 10px;
  border: none;
  border-radius: var(--md-sys-shape-corner-large);
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  user-select: none;
}

.md-short-nav__indicator {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background-color: transparent;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-short-nav__item.is-active .md-short-nav__indicator {
  background-color: var(--md-sys-color-secondary-container);
}

.md-short-nav__item.is-active {
  color: var(--md-sys-color-on-secondary-container);
}

.md-short-nav__icon,
.md-short-nav__badge,
.md-short-nav__label {
  position: relative;
  z-index: 2;
}

.md-short-nav__icon {
  color: var(--md-sys-color-on-surface-variant);
}

.md-short-nav__item.is-active .md-short-nav__icon {
  color: var(--md-sys-color-on-secondary-container);
}

.md-short-nav__label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-label-small-size);
  line-height: var(--md-sys-typescale-label-small-line-height);
}

.md-short-nav__item.is-disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>
