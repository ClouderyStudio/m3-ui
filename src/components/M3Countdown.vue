<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import M3AnimatedNumber from './M3AnimatedNumber.vue'

/**
 * 倒计时。
 *
 * 计时不是「每秒 setTimeout」——那是会漂的：定时器晚 30ms 的话，
 * 显示的数字就会在整秒之后半拍才翻，连续看半分钟就很明显。
 * 这里每次只睡到「下一个整秒边界」，即 remaining % 1000，
 * 于是数字永远在真正跨秒的那一刻翻面，晚到的定时器也只是重新按剩余时间排下一次。
 */
export type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds'

/** 默认插槽拿到的拆分结果。 */
export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** 剩余毫秒，结束后为 0。 */
  total: number
  finished: boolean
}

const props = withDefaults(
  defineProps<{
    /** 目标时刻：Date、毫秒时间戳或可解析的日期字符串。 */
    to: Date | number | string
    /** 显示的粒度，从大到小；省略某个单位时它会折算进上一个显示的单位（不显示天则显示小时）。 */
    units?: CountdownUnit[]
    /** boxes：每位一个容器、下方单位名；inline：一行文字。 */
    variant?: 'boxes' | 'inline'
    size?: 'sm' | 'md' | 'lg'
    /** 显示单位名。 */
    labels?: boolean
    /** 前导零值单位不显示（「还有 3 小时」时不显示 0 天）。 */
    hideEmpty?: boolean
    /** 数字翻动；false 或系统开启减少动态效果时直接切换。 */
    animate?: boolean
    /** 单位名使用的语言，默认取文档语言。 */
    locale?: string
  }>(),
  {
    units: () => ['days', 'hours', 'minutes', 'seconds'],
    variant: 'boxes',
    size: 'md',
    labels: true,
    hideEmpty: false,
    animate: true,
    locale: undefined,
  },
)

const emit = defineEmits<{ finished: []; tick: [parts: CountdownParts] }>()

const ORDER: CountdownUnit[] = ['days', 'hours', 'minutes', 'seconds']
const UNIT_MS: Record<CountdownUnit, number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1000,
}

const lang = computed(
  () => props.locale ?? (typeof document !== 'undefined' ? document.documentElement.lang : '') ?? '',
)

const target = computed(() => {
  const value = props.to
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return new Date(value).getTime()
})

const now = ref(Date.now())
const total = computed(() =>
  Number.isNaN(target.value) ? 0 : Math.max(0, target.value - now.value),
)

const shown = computed(() => ORDER.filter((unit) => props.units.includes(unit)))

const parts = computed<CountdownParts>(() => {
  // 按「显示的最小单位」向上取整：还剩 0.4 秒时显示 1 秒，只有真的到点才是 0
  const step = UNIT_MS[shown.value[shown.value.length - 1] ?? 'seconds']
  let rest = Math.ceil(total.value / step) * step
  const out: CountdownParts = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: total.value,
    finished: total.value <= 0,
  }
  for (const unit of shown.value) {
    out[unit] = Math.floor(rest / UNIT_MS[unit])
    rest -= out[unit] * UNIT_MS[unit]
  }
  return out
})

/** hideEmpty 时从第一个非零单位开始显示，但永远保留最后一个单位，好让归零读作 00。 */
const visible = computed(() => {
  if (!props.hideEmpty) return shown.value
  const first = shown.value.findIndex((unit) => parts.value[unit] > 0)
  if (first === -1) return shown.value.slice(shown.value.length - 1)
  return shown.value.slice(first)
})

const INTL_UNIT: Record<CountdownUnit, string> = {
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
}

function unitLabel(unit: CountdownUnit, value: number, display: 'long' | 'narrow'): string {
  try {
    const formatter = new Intl.NumberFormat(lang.value || undefined, {
      style: 'unit',
      unit: INTL_UNIT[unit],
      unitDisplay: display,
    })
    return formatter
      .formatToParts(value)
      .filter((part) => part.type === 'unit' || (display === 'narrow' && part.type === 'literal'))
      .map((part) => part.value)
      .join('')
      .trim()
  } catch {
    return unit
  }
}

const accessibleText = computed(() =>
  shown.value
    .map((unit) => {
      try {
        return new Intl.NumberFormat(lang.value || undefined, {
          style: 'unit',
          unit: INTL_UNIT[unit],
          unitDisplay: 'long',
        }).format(parts.value[unit])
      } catch {
        return parts.value[unit] + ' ' + unit
      }
    })
    .join('，'),
)

const sizeClass = computed(() => 'md-countdown--' + props.size)

let timer: ReturnType<typeof setTimeout> | undefined
let done = false

function schedule(): void {
  clearTimeout(timer)
  if (total.value <= 0) return
  const delay = total.value % 1000 || 1000
  timer = setTimeout(step, delay)
}

function step(): void {
  now.value = Date.now()
  emit('tick', parts.value)
  if (total.value <= 0 && !done) {
    done = true
    emit('finished')
  }
  schedule()
}

watch(target, () => {
  now.value = Date.now()
  done = total.value <= 0
  schedule()
})

onMounted(() => {
  now.value = Date.now()
  done = total.value <= 0
  schedule()
})

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ parts })
</script>

<template>
  <div
    class="md-countdown"
    :class="[sizeClass, 'md-countdown--' + variant]"
    role="timer"
    :aria-label="accessibleText"
  >
    <slot v-if="parts.finished && $slots.finished" name="finished" />
    <slot v-else-if="$slots.default" v-bind="parts" />

    <div v-else-if="variant === 'boxes'" class="md-countdown__boxes" aria-hidden="true">
      <div
        v-for="(unit, index) in visible"
        :key="unit"
        class="md-countdown__unit"
        :class="{ 'is-last': index === visible.length - 1 }"
      >
        <span class="md-countdown__box">
          <M3AnimatedNumber
            :value="parts[unit]"
            :pad="index === 0 ? 1 : 2"
            :duration="animate ? 600 : 0"
            :locale="locale"
          />
        </span>
        <span v-if="labels" class="md-countdown__label">{{ unitLabel(unit, parts[unit], 'long') }}</span>
      </div>
    </div>

    <span v-else class="md-countdown__inline" aria-hidden="true">
      <span v-for="(unit, index) in visible" :key="unit" class="md-countdown__inline-part">
        <M3AnimatedNumber
          :value="parts[unit]"
          :pad="index === 0 ? 1 : 2"
          :duration="animate ? 600 : 0"
          :locale="locale"
        />
        <span v-if="labels" class="md-countdown__inline-label">{{ unitLabel(unit, parts[unit], 'narrow') }}</span>
        <span v-else-if="index < visible.length - 1" class="md-countdown__colon">:</span>
      </span>
    </span>
  </div>
</template>

<style scoped>
.md-countdown {
  display: inline-block;
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
}

.md-countdown__boxes {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.md-countdown__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/*
 * 单个数字盒：两位宽的下限（min-inline-size: 2ch）让「9 秒 → 10 秒」时盒子不会突然变宽，
 * 否则整行会跳一下，倒计时看起来像在抽搐。
 */
.md-countdown__box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 2ch;
  padding: 8px 12px;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.md-countdown > .md-countdown__boxes .md-countdown__unit:first-child .md-countdown__box {
  padding-inline: 14px;
}

.md-countdown__label {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
}

.md-countdown__inline {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}

.md-countdown__inline-part {
  display: inline-flex;
  align-items: baseline;
}

.md-countdown__inline-label,
.md-countdown__colon {
  color: var(--md-sys-color-on-surface-variant);
  margin-inline-start: 2px;
}

/* ---------- 尺寸 ---------- */
.md-countdown--sm .md-countdown__box,
.md-countdown--sm .md-countdown__inline {
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
}

.md-countdown--md .md-countdown__box,
.md-countdown--md .md-countdown__inline {
  font-size: var(--md-sys-typescale-display-small-size);
  line-height: var(--md-sys-typescale-display-small-line-height);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
}

.md-countdown--lg .md-countdown__box,
.md-countdown--lg .md-countdown__inline {
  font-size: var(--md-sys-typescale-display-medium-size);
  line-height: var(--md-sys-typescale-display-medium-line-height);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking);
}

.md-countdown--lg .md-countdown__box {
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-large);
}
</style>
