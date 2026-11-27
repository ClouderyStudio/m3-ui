<script setup lang="ts">
/**
 * 列表小标题：给 M3List 里连续的一组项起名。
 *
 * 它渲染成 role="presentation" 的 li ——
 * 视觉上是一行文字，但语义上不是列表项，读屏不会把它数进「共 N 项」里。
 */
withDefaults(
  defineProps<{
    label?: string
    /** 与带前置图标的列表项对齐。 */
    inset?: boolean
  }>(),
  { label: undefined, inset: false },
)
</script>

<template>
  <li class="md-list-subheader" :class="{ 'is-inset': inset }" role="presentation">
    <slot>{{ label }}</slot>
  </li>
</template>

<style scoped>
.md-list-subheader {
  padding: 16px 16px 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  font-weight: var(--md-ref-typeface-weight-medium);
  list-style: none;
}

.md-list-subheader.is-inset {
  padding-inline-start: 56px;
}
</style>
