<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Tooltip text (plain tooltip, MD3). */
    text: string
    /** Which side of the trigger the bubble sits on. */
    placement?: 'top' | 'bottom' | 'left' | 'right'
    /** Delay before showing, in ms. 0 shows immediately (e.g. keyboard help). */
    delay?: number
    /** Keep the bubble hidden while still rendering the wrapper. */
    disabled?: boolean
    /** Maximum bubble width; long text wraps instead of pushing the layout. */
    maxWidth?: string
  }>(),
  { placement: 'top', delay: 300, disabled: false, maxWidth: '18rem' },
)
</script>

<template>
  <span
    class="md-tooltip"
    :class="'md-tooltip--' + placement"
    :style="{ '--md-tooltip-delay': delay + 'ms', '--md-tooltip-max-width': maxWidth }"
  >
    <slot />
    <span v-if="!disabled" class="md-tooltip__bubble" role="tooltip">
      <slot name="content">{{ text }}</slot>
    </span>
  </span>
</template>

<style scoped>
.md-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

/*
 * 隐藏时用 display:none 把气泡彻底移出布局。
 *
 * 只写 opacity/visibility 是不够的：绝对定位的气泡即使不可见，仍然会占位并被算进
 * 文档的可滚动溢出区域。触发按钮靠近右边缘时（后台列表的操作列就是这样），整页
 * 因此获得横向滚动能力——手机上表现为页面可以左右拖、内容被切掉半边。
 *
 * display 的切换交给 allow-discrete + @starting-style：出现仍然延迟 delay 毫秒并淡入，
 * 消失仍带淡出，与 MD3 plain tooltip 的行为一致。
 */
.md-tooltip__bubble {
  position: absolute;
  z-index: 120;
  display: none;
  inset-inline-start: 50%;
  translate: -50% 0;
  width: max-content;
  max-width: min(var(--md-tooltip-max-width), calc(100vw - 24px));
  padding: 4px 8px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
  text-align: center;
  text-wrap: balance;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    display var(--md-sys-motion-duration-short4) allow-discrete;
}

.md-tooltip--top .md-tooltip__bubble {
  inset-block-end: calc(100% + 8px);
}

.md-tooltip--bottom .md-tooltip__bubble {
  inset-block-start: calc(100% + 8px);
}

.md-tooltip--left .md-tooltip__bubble {
  inset-inline-start: auto;
  inset-inline-end: calc(100% + 8px);
  inset-block-start: 50%;
  translate: 0 -50%;
}

.md-tooltip--right .md-tooltip__bubble {
  inset-inline-start: calc(100% + 8px);
  inset-block-start: 50%;
  translate: 0 -50%;
}

.md-tooltip:hover .md-tooltip__bubble,
.md-tooltip:focus-within .md-tooltip__bubble {
  display: inline-block;
  opacity: 1;
  transition-delay: var(--md-tooltip-delay), var(--md-tooltip-delay);
}

@starting-style {
  .md-tooltip:hover .md-tooltip__bubble,
  .md-tooltip:focus-within .md-tooltip__bubble {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* 只去掉淡入时长，仍然保留延迟 —— 延迟是「避免扫过时到处冒泡」的功能，不是装饰 */
  .md-tooltip__bubble {
    transition-duration: 1ms;
  }

  .md-tooltip:hover .md-tooltip__bubble,
  .md-tooltip:focus-within .md-tooltip__bubble {
    transition-delay: var(--md-tooltip-delay);
  }
}
</style>
