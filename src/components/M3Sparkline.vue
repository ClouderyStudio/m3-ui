<script setup lang="ts">
import { computed } from 'vue'

type SparklineTone = 'primary' | 'secondary' | 'tertiary' | 'error' | 'on-surface'

const props = withDefaults(
  defineProps<{
    /** Numeric series, oldest first. */
    values: number[]
    width?: number
    height?: number
    strokeWidth?: number
    /** Fill the area under the line. */
    filled?: boolean
    /** Catmull-Rom smoothing; disable for raw step data. */
    smooth?: boolean
    /** Show a dot on the last point. */
    showDot?: boolean
    tone?: SparklineTone
    ariaLabel?: string
  }>(),
  {
    width: 120,
    height: 36,
    strokeWidth: 2,
    filled: true,
    smooth: true,
    showDot: true,
    tone: 'primary',
    ariaLabel: '趋势图',
  },
)

interface Point {
  x: number
  y: number
}

const points = computed<Point[]>(() => {
  const values = props.values
  if (values.length === 0) return []

  const pad = props.strokeWidth
  const innerWidth = Math.max(1, props.width - pad * 2)
  const innerHeight = Math.max(1, props.height - pad * 2)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  return values.map((value, index) => ({
    x: pad + (values.length === 1 ? innerWidth / 2 : (index / (values.length - 1)) * innerWidth),
    y: pad + (1 - (value - min) / span) * innerHeight,
  }))
})

const linePath = computed(() => {
  const list = points.value
  if (list.length === 0) return ''
  if (list.length === 1) return 'M ' + list[0]!.x + ' ' + list[0]!.y

  if (!props.smooth || list.length < 3) {
    return list
      .map((point, index) => (index === 0 ? 'M ' : 'L ') + point.x + ' ' + point.y)
      .join(' ')
  }

  let d = 'M ' + list[0]!.x + ' ' + list[0]!.y
  for (let index = 0; index < list.length - 1; index++) {
    const p0 = list[index - 1] ?? list[index]!
    const p1 = list[index]!
    const p2 = list[index + 1]!
    const p3 = list[index + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p2.x + ' ' + p2.y
  }
  return d
})

const areaPath = computed(() => {
  const list = points.value
  if (list.length === 0) return ''
  const last = list[list.length - 1]!
  const first = list[0]!
  return linePath.value + ' L ' + last.x + ' ' + props.height + ' L ' + first.x + ' ' + props.height + ' Z'
})

const lastPoint = computed(() => points.value[points.value.length - 1] ?? null)
</script>

<template>
  <div
    class="md-sparkline"
    :class="'md-sparkline--' + tone"
    role="img"
    :aria-label="ariaLabel"
    :style="{ width: width + 'px', maxWidth: '100%' }"
  >
    <svg
      v-if="points.length > 0"
      :viewBox="'0 0 ' + width + ' ' + height"
      :width="width"
      :height="height"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path v-if="filled" class="md-sparkline__area" :d="areaPath" />
      <path class="md-sparkline__line" :d="linePath" :stroke-width="strokeWidth" />
      <circle
        v-if="showDot && lastPoint"
        class="md-sparkline__dot"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        :r="strokeWidth + 1"
      />
    </svg>
  </div>
</template>

<style scoped>
.md-sparkline {
  --md-sparkline-tint: var(--md-sys-color-primary);

  display: inline-block;
  color: var(--md-sparkline-tint);
  line-height: 0;
}

.md-sparkline--secondary {
  --md-sparkline-tint: var(--md-sys-color-secondary);
}
.md-sparkline--tertiary {
  --md-sparkline-tint: var(--md-sys-color-tertiary);
}
.md-sparkline--error {
  --md-sparkline-tint: var(--md-sys-color-error);
}
.md-sparkline--on-surface {
  --md-sparkline-tint: var(--md-sys-color-on-surface-variant);
}

.md-sparkline__line {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.md-sparkline__area {
  fill: currentColor;
  opacity: 0.12;
  stroke: none;
}

.md-sparkline__dot {
  fill: currentColor;
  stroke: var(--md-sys-color-surface);
  stroke-width: 2;
}
</style>
