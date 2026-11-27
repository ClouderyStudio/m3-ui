<script setup lang="ts">
import { computed } from 'vue'
import { usePageProgress } from '../composables/usePageProgress'

/**
 * 贴在视口边缘的一条进度条，用于路由/页面级加载。
 *
 * 状态来自 usePageProgress()（模块单例），所以在路由守卫里 start()、
 * 在页面里 done()，两边不需要互相认识。组件本身不发起任何加载。
 */
withDefaults(
  defineProps<{
    tone?: 'primary' | 'secondary' | 'tertiary' | 'error'
    /** 条的高，默认 3dp。 */
    thickness?: number
    /** 贴在视口的哪一条边。 */
    position?: 'top' | 'bottom'
  }>(),
  { tone: 'primary', thickness: 3, position: 'top' },
)

const { progress, active, complete } = usePageProgress()

const percent = computed(() => (Number.isFinite(progress.value) ? progress.value : 0))
</script>

<template>
  <div
    class="md-page-progress"
    :class="[
      'md-page-progress--' + tone,
      'md-page-progress--' + position,
      { 'is-active': active, 'is-complete': complete },
    ]"
    :style="{ '--md-page-progress-thickness': thickness + 'px' }"
    role="progressbar"
    aria-label="页面加载进度"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="active ? Math.round(percent) : undefined"
    :aria-hidden="!active"
  >
    <span class="md-page-progress__bar" :style="{ inlineSize: percent + '%' }" />
  </div>
</template>

<style scoped>
.md-page-progress {
  --md-page-progress-tint: var(--md-sys-color-primary);
  position: fixed;
  inset-inline: 0;
  z-index: 1500;
  height: var(--md-page-progress-thickness, 3px);
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-page-progress--top {
  inset-block-start: 0;
}

.md-page-progress--bottom {
  inset-block-end: 0;
}

.md-page-progress.is-active {
  opacity: 1;
}

.md-page-progress--secondary {
  --md-page-progress-tint: var(--md-sys-color-secondary);
}
.md-page-progress--tertiary {
  --md-page-progress-tint: var(--md-sys-color-tertiary);
}
.md-page-progress--error {
  --md-page-progress-tint: var(--md-sys-color-error);
}

.md-page-progress__bar {
  display: block;
  height: 100%;
  border-start-end-radius: var(--md-sys-shape-corner-full);
  border-end-end-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-page-progress-tint);
  /*
   * 宽度用 decelerate 而不是线性：爬升时先快后慢，
   * 「快到头了」的感觉来自速度本身，而不是那个百分比数字。
   */
  transition:
    inline-size var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate),
    border-radius var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* 完成时把圆角收掉：100% 的条贴着视口两侧，圆角反而会露出两个小缺口 */
.md-page-progress.is-complete .md-page-progress__bar {
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  .md-page-progress {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
  .md-page-progress__bar {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
}
</style>
