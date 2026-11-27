<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type TimeValue = string | number | Date

const props = withDefaults(
  defineProps<{
    /** A Date, ISO string, or epoch milliseconds. */
    value: TimeValue
    /** BCP 47 locale; defaults to the document language. */
    locale?: string
    /** Re-render as time passes (every updateInterval ms). */
    live?: boolean
    /** Refresh cadence in ms; 60s is enough for "3 分钟前". */
    updateInterval?: number
  }>(),
  { locale: undefined, live: true, updateInterval: 60000 },
)

const now = ref(Date.now())

const date = computed(() => new Date(props.value))
const valid = computed(() => !Number.isNaN(date.value.getTime()))

function defaultLocale(): string {
  if (typeof document !== 'undefined' && document.documentElement.lang) return document.documentElement.lang
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
  return 'zh-CN'
}

const locale = computed(() => props.locale ?? defaultLocale())

const relative = computed(() => {
  if (!valid.value) return String(props.value)
  const diff = date.value.getTime() - now.value
  const abs = Math.abs(diff)

  const units = [
    { unit: 'year' as const, ms: 31_536_000_000 },
    { unit: 'month' as const, ms: 2_592_000_000 },
    { unit: 'day' as const, ms: 86_400_000 },
    { unit: 'hour' as const, ms: 3_600_000 },
    { unit: 'minute' as const, ms: 60_000 },
    { unit: 'second' as const, ms: 1_000 },
  ]

  const row = units.find((entry) => abs >= entry.ms) ?? units[units.length - 1]!
  const amount = Math.round(diff / row.ms)
  try {
    return new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }).format(amount, row.unit)
  } catch {
    return String(props.value)
  }
})

const absolute = computed(() => {
  if (!valid.value) return undefined
  try {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(
      date.value,
    )
  } catch {
    return date.value.toISOString()
  }
})

const iso = computed(() => (valid.value ? date.value.toISOString() : undefined))

let timer = 0

function start(): void {
  stop()
  if (!props.live || typeof window === 'undefined') return
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, Math.max(1000, props.updateInterval))
}

function stop(): void {
  if (timer) window.clearInterval(timer)
  timer = 0
}

onMounted(start)
onBeforeUnmount(stop)

watch(() => [props.live, props.updateInterval], start)
watch(
  () => props.value,
  () => {
    now.value = Date.now()
  },
)
</script>

<template>
  <time class="md-relative-time" :datetime="iso" :title="absolute">{{ relative }}</time>
</template>

<style scoped>
.md-relative-time {
  color: inherit;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: help;
  text-decoration: underline dotted;
  text-underline-offset: 2px;
}
</style>
