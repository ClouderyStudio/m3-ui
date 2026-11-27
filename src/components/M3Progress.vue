<script setup lang="ts">
import { computed } from 'vue'

type ProgressVariant = 'linear' | 'circular'
type ProgressTone = 'primary' | 'secondary' | 'tertiary' | 'error'

const props = withDefaults(
  defineProps<{
    /** Linear bar or circular indicator. */
    variant?: ProgressVariant
    /** Current value; omit (or pass null) for the indeterminate loop. */
    value?: number | null
    max?: number
    /** Accessible name — a progress bar with no label is announced as "progress bar". */
    label?: string
    /** Show the percentage next to the linear bar / inside the circle. */
    showValue?: boolean
    /** Circular diameter in px. */
    size?: number
    tone?: ProgressTone
  }>(),
  {
    variant: 'linear',
    value: undefined,
    max: 100,
    label: '正在加载',
    showValue: false,
    size: 48,
    tone: 'primary',
  },
)

const safeMax = computed(() => (props.max > 0 ? props.max : 100))
const determinate = computed(
  () => typeof props.value === 'number' && Number.isFinite(props.value),
)
const clamped = computed(() =>
  determinate.value ? Math.min(Math.max(props.value as number, 0), safeMax.value) : 0,
)
const percent = computed(() => (clamped.value / safeMax.value) * 100)
const percentText = computed(() => Math.round(percent.value) + '%')

/* 2πr，r=20，viewBox 48 —— 圆周长用于 stroke-dasharray */
const CIRCUMFERENCE = 2 * Math.PI * 20
const dashOffset = computed(() => CIRCUMFERENCE * (1 - percent.value / 100))
</script>

<template>
  <div
    v-if="variant === 'linear'"
    class="md-progress md-progress--linear"
    :class="['md-progress--' + tone, { 'is-indeterminate': !determinate }]"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="safeMax"
    :aria-valuenow="determinate ? clamped : undefined"
    :aria-valuetext="determinate ? percentText : undefined"
  >
    <span class="md-progress__track">
      <span v-if="determinate" class="md-progress__bar" :style="{ width: percent + '%' }" />
      <template v-else>
        <span class="md-progress__bar md-progress__bar--indeterminate md-progress__bar--one" />
        <span class="md-progress__bar md-progress__bar--indeterminate md-progress__bar--two" />
      </template>
    </span>
    <span v-if="showValue" class="md-progress__value md-typescale-label-medium">{{ percentText }}</span>
  </div>

  <div
    v-else
    class="md-progress md-progress--circular"
    :class="['md-progress--' + tone, { 'is-indeterminate': !determinate }]"
    :style="{ width: size + 'px', height: size + 'px' }"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="safeMax"
    :aria-valuenow="determinate ? clamped : undefined"
    :aria-valuetext="determinate ? percentText : undefined"
  >
    <svg class="md-progress__circle" viewBox="0 0 48 48" aria-hidden="true">
      <circle class="md-progress__circle-track" cx="24" cy="24" r="20" />
      <circle
        v-if="determinate"
        class="md-progress__circle-value"
        cx="24"
        cy="24"
        r="20"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
      />
      <circle v-else class="md-progress__circle-value md-progress__circle-value--indeterminate" cx="24" cy="24" r="20" />
    </svg>
    <span v-if="showValue && determinate" class="md-progress__circle-label md-typescale-label-medium">
      {{ percentText }}
    </span>
  </div>
</template>

<style scoped>
.md-progress {
  --md-progress-tint: var(--md-sys-color-primary);
}

.md-progress--secondary {
  --md-progress-tint: var(--md-sys-color-secondary);
}
.md-progress--tertiary {
  --md-progress-tint: var(--md-sys-color-tertiary);
}
.md-progress--error {
  --md-progress-tint: var(--md-sys-color-error);
}

/* ---------- Linear ---------- */
.md-progress--linear {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.md-progress__track {
  position: relative;
  display: block;
  flex: 1;
  height: 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-highest, var(--md-sys-color-surface-variant));
  overflow: hidden;
}

.md-progress__bar {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: inherit;
  background-color: var(--md-progress-tint);
  transition: width var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

/*
 * 不确定进度：两条 40% 宽的bar，一前一后循环。
 * 比「整条来回扫」更像 MD3 的线性 indeterminate，也不会让人误读成 50%。
 */
.md-progress__bar--indeterminate {
  width: 40%;
  transition: none;
  animation: md-progress-slide 1.8s var(--md-sys-motion-easing-standard) infinite;
}

.md-progress__bar--two {
  animation-delay: -0.9s;
  opacity: 0.55;
}

@keyframes md-progress-slide {
  0% {
    transform: translateX(-120%);
  }
  60% {
    transform: translateX(160%);
  }
  100% {
    transform: translateX(320%);
  }
}

.md-progress__value {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

/* ---------- Circular ---------- */
.md-progress--circular {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.md-progress__circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.md-progress--circular.is-indeterminate .md-progress__circle {
  animation: md-progress-rotate 1.4s linear infinite;
}

.md-progress__circle-track,
.md-progress__circle-value {
  fill: none;
  stroke-width: 4;
}

.md-progress__circle-track {
  stroke: var(--md-sys-color-surface-container-highest, var(--md-sys-color-surface-variant));
}

.md-progress__circle-value {
  stroke: var(--md-progress-tint);
  stroke-linecap: round;
  transition: stroke-dashoffset var(--md-sys-motion-duration-medium1)
    var(--md-sys-motion-easing-standard);
}

.md-progress__circle-value--indeterminate {
  stroke-dasharray: 30 200;
  animation: md-progress-dash 1.4s var(--md-sys-motion-easing-standard) infinite;
}

.md-progress__circle-label {
  position: absolute;
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

@keyframes md-progress-rotate {
  to {
    transform: rotate(270deg);
  }
}

@keyframes md-progress-dash {
  0% {
    stroke-dasharray: 1 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90 200;
    stroke-dashoffset: -124;
  }
}

@media (prefers-reduced-motion: reduce) {
  /*
   * 不确定进度是「还在动 = 还没完成」的唯一信号，不能停，
   * 但可以放慢，减少视觉噪声。
   */
  .md-progress__bar--indeterminate,
  .md-progress--circular.is-indeterminate .md-progress__circle,
  .md-progress__circle-value--indeterminate {
    animation-duration: 3s;
  }
}
</style>
