<script setup lang="ts">
import { computed } from 'vue'

/**
 * 加载骨架屏：比转圈更能保住布局，列表/卡片加载时用它。
 *
 * 只在首屏用，刷新（已有内容）请用局部 loading 态 —— 骨架屏整体替换会让页面闪。
 * 图形块走 surface-container-high 的明暗差，不写死颜色。
 */
const props = withDefaults(
  defineProps<{
    /** 骨架的版式：列表行 / 卡片 / 纯文本 / 头像行。 */
    variant?: 'list' | 'card' | 'text' | 'avatar'
    /** 行数（list / text / avatar）或段落数（card）。 */
    rows?: number
    label?: string
    /** 关闭扫光；网络慢到必须靠动画证明「还活着」时再开，否则静态占位更安静。 */
    animated?: boolean
  }>(),
  { variant: 'list', rows: 3, label: '正在加载…', animated: true },
)

const rowList = computed(() => Array.from({ length: Math.max(1, props.rows) }, (_, index) => index))
const lineWidths = ['100%', '92%', '76%', '84%', '68%']
</script>

<template>
  <div
    class="md-skeleton"
    :class="['md-skeleton--' + variant, { 'md-skeleton--animated': animated }]"
    role="status"
    aria-busy="true"
    :aria-label="label"
  >
    <template v-if="variant === 'card'">
      <div v-for="row in rowList" :key="row" class="md-skeleton__card" :style="{ animationDelay: row * 80 + 'ms' }">
        <span class="md-skeleton__media" />
        <span class="md-skeleton__lines">
          <span class="md-skeleton__line md-skeleton__line--title" />
          <span class="md-skeleton__line" />
          <span class="md-skeleton__line md-skeleton__line--short" />
        </span>
      </div>
    </template>

    <template v-else-if="variant === 'text'">
      <span v-for="row in rowList" :key="row" class="md-skeleton__line" :style="{ width: lineWidths[(row - 1) % lineWidths.length] }" />
    </template>

    <template v-else>
      <div
        v-for="row in rowList"
        :key="row"
        class="md-skeleton__row"
        :style="{ animationDelay: row * 80 + 'ms' }"
      >
        <span class="md-skeleton__thumb" :class="{ 'md-skeleton__thumb--round': variant === 'avatar' }" />
        <span class="md-skeleton__lines">
          <span class="md-skeleton__line md-skeleton__line--title" />
          <span class="md-skeleton__line md-skeleton__line--short" />
        </span>
      </div>
    </template>

    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.md-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.md-skeleton--text {
  gap: 8px;
  padding: 4px 0;
}

.md-skeleton__row,
.md-skeleton__card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-low);
}

.md-skeleton__card {
  flex-direction: column;
}

.md-skeleton__thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: var(--md-sys-shape-corner-medium);
}

.md-skeleton__thumb--round {
  border-radius: var(--md-sys-shape-corner-full);
}

.md-skeleton__media {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: var(--md-sys-shape-corner-medium);
}

.md-skeleton__lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.md-skeleton__line {
  display: block;
  height: 12px;
  border-radius: var(--md-sys-shape-corner-full);
}

.md-skeleton__line--title {
  width: 38%;
  height: 16px;
}

.md-skeleton__line--short {
  width: 62%;
}

.md-skeleton__thumb,
.md-skeleton__media,
.md-skeleton__line {
  background-color: var(--md-sys-color-surface-container-high);
}

/* 扫光比明暗脉冲更像「正在取数据」：一道高光从左扫到右 */
.md-skeleton--animated .md-skeleton__thumb,
.md-skeleton--animated .md-skeleton__media,
.md-skeleton--animated .md-skeleton__line {
  background-image: linear-gradient(
    100deg,
    transparent 20%,
    color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent) 50%,
    transparent 80%
  );
  background-size: 220% 100%;
  background-repeat: no-repeat;
  animation: md-shimmer 1.6s var(--md-sys-motion-easing-linear) infinite;
}

/*
 * 错开每一行的动画起始，扫光才不会像一块板整体闪。
 * 行间隔 80ms 由模板的 animationDelay 设，这里只负责循环本身。
 */
@media (prefers-reduced-motion: reduce) {
  /* 削减：不扫光，改为静态色块（骨架屏的价值在占位，不在动） */
  .md-skeleton--animated .md-skeleton__thumb,
  .md-skeleton--animated .md-skeleton__media,
  .md-skeleton--animated .md-skeleton__line {
    background-image: none;
    animation: none;
  }
}
</style>
