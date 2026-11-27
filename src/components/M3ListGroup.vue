<script setup lang="ts">
import { useId } from 'vue'

/**
 * 列表分组：把 M3ListItem 按语义收成一组，可带标题。
 *
 * 分组本身是 <li role="none">，里面的 <ul role="list"> 才是列表 ——
 * 这样读屏会念「已分组、组名 XXX、共 N 项」，而不是把标题当普通列表项念出来。
 */
withDefaults(
  defineProps<{
    /** 组标题。也可以用 #title 插槽放更复杂的内容。 */
    title?: string
    /** 标题与带前置图标的列表项对齐（多缩进 56dp）。 */
    inset?: boolean
    /** 组与组之间加一档间距，用于设置页那种「卡片式」分组。 */
    spaced?: boolean
  }>(),
  { title: undefined, inset: false, spaced: false },
)

const titleId = 'm3-list-group-' + useId()
</script>

<template>
  <li class="md-list-group" :class="{ 'md-list-group--spaced': spaced }" role="none">
    <div v-if="title || $slots.title" :id="titleId" class="md-list-group__title" :class="{ 'is-inset': inset }">
      <slot name="title">{{ title }}</slot>
    </div>

    <ul class="md-list-group__items" role="list" :aria-labelledby="title || $slots.title ? titleId : undefined">
      <slot />
    </ul>
  </li>
</template>

<style scoped>
.md-list-group {
  display: flex;
  flex-direction: column;
  margin: 0;
}

/* 组间留白不是靠 margin 撑的：列表自己已经有 8dp 内边距，再加一档就是 16dp 的呼吸感 */
.md-list-group--spaced + .md-list-group--spaced {
  margin-block-start: 8px;
  padding-block-start: 8px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}

.md-list-group__title {
  padding: 16px 16px 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  font-weight: var(--md-ref-typeface-weight-medium);
}

.md-list-group__title.is-inset {
  padding-inline-start: 56px;
}

.md-list-group__items {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
