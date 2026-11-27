<script setup lang="ts">
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'

export type TimelineStatus = 'default' | 'active' | 'success' | 'warning' | 'error'

export interface TimelineItem {
  title: string
  description?: string
  /** Pre-formatted date/time string; the component does not format dates. */
  time?: string
  icon?: IconComponent | null
  status?: TimelineStatus
}

withDefaults(
  defineProps<{
    items: TimelineItem[]
    /** Tighter vertical rhythm for activity feeds. */
    dense?: boolean
    ariaLabel?: string
  }>(),
  { dense: false, ariaLabel: '时间线' },
)
</script>

<template>
  <ol class="md-timeline" :class="{ 'md-timeline--dense': dense }" :aria-label="ariaLabel">
    <li
      v-for="(item, index) in items"
      :key="index"
      class="md-timeline__item"
      :class="'is-' + (item.status ?? 'default')"
    >
      <span class="md-timeline__marker" aria-hidden="true">
        <M3Icon v-if="item.icon" :icon="item.icon" :size="14" />
        <span v-else class="md-timeline__dot" />
      </span>

      <div class="md-timeline__content">
        <div class="md-timeline__head">
          <span class="md-timeline__title md-typescale-title-small">{{ item.title }}</span>
          <time v-if="item.time" class="md-timeline__time md-typescale-label-small">{{ item.time }}</time>
        </div>
        <p v-if="item.description" class="md-timeline__description md-typescale-body-small">
          {{ item.description }}
        </p>
        <slot name="item" :item="item" :index="index" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.md-timeline {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-timeline__item {
  position: relative;
  display: flex;
  gap: 16px;
  padding-block-end: 24px;
}

.md-timeline__item:last-child {
  padding-block-end: 0;
}

/* 连接线画在 marker 中轴上；最后一个 item 不画 */
.md-timeline__item:not(:last-child)::before {
  content: '';
  position: absolute;
  inset-inline-start: 9px;
  inset-block-start: 22px;
  width: 2px;
  height: calc(100% - 24px);
  background-color: var(--md-sys-color-outline-variant);
}

.md-timeline__marker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-block-start: 2px;
  flex-shrink: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
}

.md-timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-outline);
}

.md-timeline__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  padding-block-start: 1px;
}

.md-timeline__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.md-timeline__title {
  color: var(--md-sys-color-on-surface);
}

.md-timeline__time {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

.md-timeline__description {
  color: var(--md-sys-color-on-surface-variant);
}

/* ---------- 状态 ---------- */
.md-timeline__item.is-active .md-timeline__marker {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}
.md-timeline__item.is-active .md-timeline__dot {
  background-color: var(--md-sys-color-primary);
}

.md-timeline__item.is-success .md-timeline__marker {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.md-timeline__item.is-success .md-timeline__dot {
  background-color: var(--md-sys-color-primary);
}

.md-timeline__item.is-warning .md-timeline__marker {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}
.md-timeline__item.is-warning .md-timeline__dot {
  background-color: var(--md-sys-color-tertiary);
}

.md-timeline__item.is-error .md-timeline__marker {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}
.md-timeline__item.is-error .md-timeline__dot {
  background-color: var(--md-sys-color-error);
}

/* ---------- Dense ---------- */
.md-timeline--dense .md-timeline__item {
  gap: 12px;
  padding-block-end: 16px;
}

.md-timeline--dense .md-timeline__item:not(:last-child)::before {
  inset-block-start: 18px;
  height: calc(100% - 20px);
}
</style>
