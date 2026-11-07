<script setup lang="ts">
withDefaults(defineProps<{ label?: string; rows?: number }>(), { label: '正在加载…', rows: 3 })

/**
 * 加载骨架屏：比转圈更能保住布局，列表/卡片加载时用它。
 *
 * 只在首屏用，刷新（已有内容）请用局部 loading 态 —— 骨架屏整体替换会让页面闪。
 * 图形块走 secondary-container 的明暗差，不写死颜色。
 */
</script>

<template>
  <div class="skeleton" role="status" :aria-label="label">
    <div v-for="row in rows" :key="row" class="skeleton__row" :style="{ animationDelay: row * 80 + 'ms' }">
      <span class="skeleton__thumb" />
      <span class="skeleton__lines">
        <span class="skeleton__line skeleton__line--title" />
        <span class="skeleton__line" />
        <span class="skeleton__line skeleton__line--short" />
      </span>
    </div>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton__row {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-low);
}

.skeleton__thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-high);
  animation: md-skeleton-pulse 1.4s var(--md-sys-motion-easing-standard) infinite;
}

.skeleton__lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.skeleton__line {
  height: 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  animation: md-skeleton-pulse 1.4s var(--md-sys-motion-easing-standard) infinite;
}

.skeleton__line--title {
  width: 38%;
  height: 16px;
}

.skeleton__line--short {
  width: 62%;
}

@keyframes md-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
