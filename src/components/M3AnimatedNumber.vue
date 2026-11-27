<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { emphasizedEase, prefersReducedMotion } from '../utils/motion'

const props = withDefaults(
  defineProps<{
    value: number
    /** Animation duration in ms. */
    duration?: number
    decimals?: number
    /** BCP 47 locale; defaults to the document language. */
    locale?: string
    prefix?: string
    suffix?: string
    /** Announce the final value to screen readers (for live dashboards). */
    live?: boolean
    /** 最小整数位数（不足补零）；倒计时用它把 4 显示成 04。 */
    pad?: number
  }>(),
  {
    duration: 900,
    decimals: 0,
    locale: undefined,
    prefix: '',
    suffix: '',
    live: false,
    pad: 1,
  },
)

const shown = ref(props.value)
let raf = 0

const formatter = computed(() => {
  try {
    return new Intl.NumberFormat(props.locale, {
      minimumIntegerDigits: Math.min(Math.max(props.pad, 1), 21),
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    })
  } catch {
    return new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: Math.min(Math.max(props.pad, 1), 21),
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    })
  }
})

const text = computed(() => formatter.value.format(shown.value))
const finalText = computed(() => formatter.value.format(props.value))

function stop(): void {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function animate(from: number, to: number): void {
  stop()

  if (prefersReducedMotion() || props.duration <= 0 || from === to) {
    shown.value = to
    return
  }

  const startedAt = performance.now()
  const frame = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / props.duration)
    shown.value = from + (to - from) * emphasizedEase(progress)
    if (progress < 1) {
      raf = requestAnimationFrame(frame)
      return
    }
    shown.value = to
    raf = 0
  }
  raf = requestAnimationFrame(frame)
}

watch(
  () => props.value,
  (next, previous) => animate(previous ?? shown.value, next),
)

onBeforeUnmount(stop)
</script>

<template>
  <span class="md-animated-number">
    <span :aria-hidden="live ? 'true' : undefined">{{ prefix }}{{ text }}{{ suffix }}</span>
    <span v-if="live" class="sr-only">{{ prefix }}{{ finalText }}{{ suffix }}</span>
  </span>
</template>

<style scoped>
.md-animated-number {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
