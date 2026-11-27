<script setup lang="ts">
withDefaults(
  defineProps<{
    /** MD3 card emphasis: elevated, filled or outlined. */
    variant?: 'elevated' | 'filled' | 'outlined'
    /** Adds hover/press elevation and pointer affordance. */
    interactive?: boolean
    /** Corner radius override; 'large' matches the M3 card default of 12dp. */
    shape?: 'medium' | 'large' | 'extra-large'
    /** Media beside the content instead of above it (list-detail / gallery cards). */
    orientation?: 'vertical' | 'horizontal'
    /** Disables an interactive card without removing it from the layout. */
    disabled?: boolean
    href?: string
    target?: string
    rel?: string
  }>(),
  {
    variant: 'elevated',
    interactive: false,
    shape: 'medium',
    orientation: 'vertical',
    disabled: false,
    href: undefined,
    target: undefined,
    rel: undefined,
  },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    class="md-card"
    :class="[
      'md-card--' + variant,
      'md-card--shape-' + shape,
      'md-card--' + orientation,
      { 'md-card--interactive': interactive, 'is-disabled': disabled },
    ]"
    :href="href"
    :target="href ? target : undefined"
    :rel="href ? rel : undefined"
    :role="interactive && !href ? 'button' : undefined"
    :tabindex="interactive && !href && !disabled ? 0 : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <div v-if="$slots.media" class="md-card__media"><slot name="media" /></div>
    <div class="md-card__content"><slot /></div>
    <div v-if="$slots.actions" class="md-card__actions"><slot name="actions" /></div>
  </component>
</template>

<style scoped>
.md-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  transition:
    box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
    background-color var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
    transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-card--shape-medium {
  border-radius: var(--md-sys-shape-corner-medium);
}
.md-card--shape-large {
  border-radius: var(--md-sys-shape-corner-large);
}
.md-card--shape-extra-large {
  border-radius: var(--md-sys-shape-corner-extra-large);
}

.md-card--elevated {
  background-color: var(--md-sys-color-surface-container-low);
  box-shadow: var(--md-sys-elevation-level1);
}
.md-card--filled {
  background-color: var(--md-sys-color-surface-container-highest);
  box-shadow: none;
}
.md-card--outlined {
  background-color: var(--md-sys-color-surface);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline-variant);
}

.md-card--interactive {
  cursor: pointer;
}

@media (hover: hover) {
  .md-card--interactive.md-card--elevated:hover {
    box-shadow: var(--md-sys-elevation-level2);
  }
  .md-card--interactive.md-card--filled:hover,
  .md-card--interactive.md-card--outlined:hover {
    box-shadow: var(--md-sys-elevation-level1);
  }
  .md-card--interactive:hover {
    transform: translateY(-4px);
  }
}

/* 可点卡片按下时回落：抬起的 4px 收回去，给「按进去了」的触感 */
.md-card--interactive:active {
  transform: translateY(-1px);
  scale: 0.99;
}

@media (prefers-reduced-motion: reduce) {
  /* 削减悬浮位移：不让整张卡片跳起来，只保留阴影变化 */
  @media (hover: hover) {
    .md-card--interactive:hover {
      transform: none;
    }
  }

  .md-card--interactive:active {
    transform: none;
    scale: 1;
  }
}

.md-card__media {
  display: block;
  flex-shrink: 0;
}

.md-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  flex: 1;
}

.md-card:not(:has(.md-card__media)) .md-card__content {
  padding-block-start: 16px;
}

.md-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 16px;
}

/* ---------- Horizontal ---------- */
/*
 * 用 grid 而不是「flex-wrap + 操作区占满整行」。
 * 旧写法把操作区设成 100% 宽，于是「查看」这类文字按钮会掉到媒体图**下面**，
 * 横跨整张卡片的底部，看起来像一条无主的横条（表头都没有了）。
 * 现在媒体在左跨两行，正文与操作区依次排在右列。
 */
.md-card--horizontal {
  display: grid;
  grid-template-columns: minmax(0, 38%) minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  align-items: stretch;
}

.md-card--horizontal .md-card__media {
  grid-column: 1;
  grid-row: 1 / -1;
  min-inline-size: 0;
  block-size: 100%;
}

.md-card--horizontal .md-card__media :deep(img) {
  block-size: 100%;
  object-fit: cover;
}

.md-card--horizontal .md-card__content {
  grid-column: 2;
  grid-row: 1;
  min-inline-size: 0;
}

.md-card--horizontal .md-card__actions {
  grid-column: 2;
  grid-row: 2;
  padding: 0 16px 16px;
}

.md-card.is-disabled {
  pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  box-shadow: none;
}

@media (max-width: 560px) {
  .md-card--horizontal {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
  }

  .md-card--horizontal .md-card__media {
    grid-column: 1;
    grid-row: auto;
    block-size: 180px;
  }

  .md-card--horizontal .md-card__content,
  .md-card--horizontal .md-card__actions {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
