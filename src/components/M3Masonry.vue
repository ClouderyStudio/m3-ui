<script setup lang="ts">
/**
 * 瀑布流：CSS 多列布局。
 *
 * 用 column-count 而不是 JS 计算绝对定位：内容变成异步加载、字体变化、
 * 图片加载完成时，浏览器会自己重排；JS 方案要么监听一堆 ResizeObserver，
 * 要么就错位。代价是顺序是「先填满第一列」，不适合时间线这类必须按行的场景。
 */
withDefaults(
  defineProps<{
    /** 列数；0 表示按 minColumnWidth 自动。 */
    columns?: number
    gap?: number
    minColumnWidth?: number
  }>(),
  { columns: 0, gap: 16, minColumnWidth: 240 },
)
</script>

<template>
  <div
    class="md-masonry"
    :style="{
      columnCount: columns > 0 ? String(columns) : 'auto',
      columnWidth: columns > 0 ? undefined : minColumnWidth + 'px',
      columnGap: gap + 'px',
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.md-masonry {
  width: 100%;
}

.md-masonry :deep(> *) {
  break-inside: avoid;
  margin-block-end: var(--md-masonry-gap, 16px);
}

.md-masonry :deep(img) {
  max-width: 100%;
}
</style>
