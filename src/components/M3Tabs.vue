<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { IconComponent } from '../icons'
import M3Badge from './M3Badge.vue'
import M3Icon from './M3Icon.vue'
import { prefersReducedMotion } from '../utils/motion'

export interface TabItem {
  value: string
  label: string
  icon?: IconComponent | null
  disabled?: boolean
  /** Small count/text after the label; a number renders as a pill. */
  badge?: string | number
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    tabs: TabItem[]
    /** Primary: short sliding underline. Secondary: full-width underline, text first. */
    variant?: 'primary' | 'secondary'
    /** Many tabs: keep natural widths and scroll horizontally. */
    scrollable?: boolean
    ariaLabel?: string
  }>(),
  { variant: 'primary', scrollable: false, ariaLabel: '标签页' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const rowRef = ref<HTMLElement | null>(null)
const tabEls = ref<(HTMLElement | null)[]>([])
const indicatorLeft = ref(0)
const indicatorWidth = ref(0)

const selectedIndex = computed(() => props.tabs.findIndex((tab) => tab.value === props.modelValue))

/* ---------- 指示条：两条独立的弹簧（位移 / 宽度） ---------- */
const DAMPING = 0.9
const STIFFNESS = 700
const DAMPING_COEF = 2 * DAMPING * Math.sqrt(STIFFNESS)

let raf = 0
let lastTime = 0
let leftPos = 0
let leftVel = 0
let leftTarget = 0
let widthPos = 0
let widthVel = 0
let widthTarget = 0

function spring(pos: number, vel: number, target: number, dt: number): [number, number] {
  const acceleration = -STIFFNESS * (pos - target) - DAMPING_COEF * vel
  const nextVel = vel + acceleration * dt
  return [pos + nextVel * dt, nextVel]
}

function tick(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30)
  lastTime = now
  ;[leftPos, leftVel] = spring(leftPos, leftVel, leftTarget, dt)
  ;[widthPos, widthVel] = spring(widthPos, widthVel, widthTarget, dt)
  indicatorLeft.value = leftPos
  indicatorWidth.value = widthPos

  const settled =
    Math.abs(leftPos - leftTarget) < 0.5 &&
    Math.abs(leftVel) < 0.5 &&
    Math.abs(widthPos - widthTarget) < 0.5 &&
    Math.abs(widthVel) < 0.5

  if (settled) {
    leftPos = leftTarget
    widthPos = widthTarget
    indicatorLeft.value = leftPos
    indicatorWidth.value = widthPos
    raf = 0
    return
  }
  raf = requestAnimationFrame(tick)
}

function ensureAnimation(): void {
  if (raf) return
  lastTime = performance.now()
  raf = requestAnimationFrame(tick)
}

function measure(animate = true): void {
  nextTick(() => {
    const row = rowRef.value
    const el = tabEls.value[selectedIndex.value]
    if (!row || !el) return

    const primary = props.variant === 'primary'
    const inset = primary ? Math.min(el.offsetWidth * 0.2, 16) : 0
    leftTarget = el.offsetLeft + inset
    widthTarget = el.offsetWidth - inset * 2

    if (animate && !prefersReducedMotion()) {
      ensureAnimation()
    } else {
      leftPos = leftTarget
      leftVel = 0
      widthPos = widthTarget
      widthVel = 0
      indicatorLeft.value = leftPos
      indicatorWidth.value = widthPos
    }
  })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure(false)
  if (typeof ResizeObserver !== 'undefined' && rowRef.value) {
    resizeObserver = new ResizeObserver(() => measure(false))
    resizeObserver.observe(rowRef.value)
  }
  // 字体加载完成后宽度会变一次，指示条要跟上
  document.fonts?.ready.then(() => measure(false)).catch(() => undefined)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
})

watch(
  () => props.modelValue,
  () => measure(true),
)

watch(
  () => props.tabs,
  () => measure(true),
  { deep: true },
)

watch(
  () => [props.variant, props.scrollable],
  () => measure(false),
)

function select(tab: TabItem): void {
  if (!tab.disabled) emit('update:modelValue', tab.value)
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const total = props.tabs.length
  let next = -1

  switch (event.key) {
    case 'ArrowRight':
      next = (index + 1) % total
      break
    case 'ArrowLeft':
      next = (index - 1 + total) % total
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = total - 1
      break
    default:
      return
  }

  event.preventDefault()
  // 自动激活：跳过一个禁用标签，移动到位后就选中（MD3 的 automatic activation）
  for (let step = 0; step < total; step++) {
    const candidate = props.tabs[(next + step) % total]
    if (candidate && !candidate.disabled) {
      emit('update:modelValue', candidate.value)
      nextTick(() => tabEls.value[(next + step) % total]?.focus())
      return
    }
  }
}
</script>

<template>
  <div class="md-tabs" :class="['md-tabs--' + variant, { 'md-tabs--scrollable': scrollable }]">
    <div ref="rowRef" class="md-tabs__row" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :ref="(el) => { tabEls[index] = el as HTMLElement | null }"
        type="button"
        role="tab"
        class="md-tabs__tab"
        :class="{ 'is-selected': tab.value === modelValue, 'is-disabled': tab.disabled, 'has-icon': !!tab.icon }"
        :aria-selected="tab.value === modelValue"
        :tabindex="tab.value === modelValue ? 0 : -1"
        :disabled="tab.disabled"
        @click="select(tab)"
        @keydown="onKeydown($event, index)"
      >
        <M3Badge
          v-if="tab.icon && tab.badge !== undefined && tab.badge !== null"
          :value="tab.badge"
          class="md-tabs__badge"
        >
          <M3Icon :icon="tab.icon" :size="24" class="md-tabs__icon" />
        </M3Badge>
        <M3Icon v-else-if="tab.icon" :icon="tab.icon" :size="24" class="md-tabs__icon" />

        <span class="md-tabs__label">{{ tab.label }}</span>

        <M3Badge
          v-if="!tab.icon && tab.badge !== undefined && tab.badge !== null"
          :value="tab.badge"
          class="md-tabs__badge-text"
        />
      </button>

      <span
        class="md-tabs__indicator"
        aria-hidden="true"
        :style="{ left: indicatorLeft + 'px', width: indicatorWidth + 'px' }"
      />
    </div>
  </div>
</template>

<style scoped>
.md-tabs {
  min-width: 0;
}

.md-tabs__row {
  position: relative;
  display: flex;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-tabs__row::-webkit-scrollbar {
  display: none;
}

.md-tabs--scrollable .md-tabs__row {
  overflow-x: auto;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.md-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  height: 48px;
  padding-inline: 16px;
  border: none;
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  font-family: inherit;
  font-size: var(--md-sys-typescale-title-small-size);
  font-weight: var(--md-sys-typescale-title-small-weight);
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
  line-height: var(--md-sys-typescale-title-small-line-height);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-tabs--scrollable .md-tabs__tab {
  flex-shrink: 0;
}

.md-tabs:not(.md-tabs--scrollable) .md-tabs__tab {
  flex: 1 1 0;
}

/* primary 有图标时是 64dp，图标在上、文字在下（Compose 的 Tab） */
.md-tabs--primary .md-tabs__tab.has-icon {
  flex-direction: column;
  gap: 2px;
  height: 64px;
  padding-block: 8px;
}

.md-tabs--primary .md-tabs__tab.is-selected {
  color: var(--md-sys-color-primary);
}

.md-tabs--secondary .md-tabs__tab.is-selected {
  color: var(--md-sys-color-on-surface);
}

@media (hover: hover) {
  .md-tabs__tab:hover:not(.is-disabled) {
    color: var(--md-sys-color-on-surface);
  }

  .md-tabs--primary .md-tabs__tab.is-selected:hover {
    color: var(--md-sys-color-primary);
  }
}

.md-tabs__tab:focus-visible {
  outline-offset: -3px;
}

.md-tabs__tab.is-disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-tabs__icon {
  flex-shrink: 0;
}

.md-tabs__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 徽标挂在图标上：M3Badge 自己负责尺寸、叠放与描边 */
.md-tabs__badge {
  position: relative;
  display: inline-flex;
  overflow: visible;
}

.md-tabs__badge-text {
  flex-shrink: 0;
}

.md-tabs__indicator {
  position: absolute;
  inset-block-end: 0;
  height: 3px;
  border-start-start-radius: var(--md-sys-shape-corner-full);
  border-start-end-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  pointer-events: none;
}

.md-tabs--secondary .md-tabs__indicator {
  height: 2px;
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  /* 指示条仍然跟随，但由测量直接落位（见脚本里的 prefersReducedMotion） */
  .md-tabs__indicator {
    transition: none;
  }
}
</style>
