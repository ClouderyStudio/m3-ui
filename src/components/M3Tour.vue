<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import M3Button from './M3Button.vue'
import M3IconButton from './M3IconButton.vue'
import { IconClose } from '../icons'
import { lockScroll, unlockScroll } from '../composables/useScrollLock'

/**
 * 新手引导：按步骤高亮页面元素 + 气泡说明。
 *
 * 高亮不用「挖洞」，而是给一个覆盖目标元素的小方块加巨大的 box-shadow ——
 * 一层阴影同时完成了「照亮目标」和「压暗其余部分」，省掉一层 scrim，
 * 也不会在圆角相接处露出缝隙。
 *
 * interactive 模式不压暗、不拦截点击，目标元素还能继续操作（例如「拖一下看看」）；
 * 两者都用 rAF 跟随目标位置，因为引导常常发生在正在动画的面板上。
 */
export interface TourStep {
  /** CSS 选择器或返回元素的函数；没有则只显示居中的气泡。 */
  target?: string | (() => Element | null | undefined)
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    steps: TourStep[]
    /** 当前步骤（受控）；不传则自己管理。 */
    step?: number
    interactive?: boolean
    prevLabel?: string
    nextLabel?: string
    finishLabel?: string
    closeLabel?: string
  }>(),
  {
    step: undefined,
    interactive: false,
    prevLabel: '上一步',
    nextLabel: '下一步',
    finishLabel: '完成',
    closeLabel: '关闭引导',
  },
)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'update:step': [index: number]
  finish: []
}>()

const inner = ref(0)
const tooltipRef = ref<HTMLElement | null>(null)
const rect = ref<DOMRect | null>(null)
const tooltipStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })
const locked = ref(false)

const current = computed(() => (props.step ?? inner.value))
const currentStep = computed<TourStep | null>(() => props.steps[current.value] ?? null)
const isFirst = computed(() => current.value <= 0)
const isLast = computed(() => current.value >= props.steps.length - 1)

function resolveTarget(): Element | null {
  const step = currentStep.value
  if (!step?.target) return null
  if (typeof step.target === 'function') return step.target() ?? null
  try {
    return document.querySelector(step.target)
  } catch {
    return null
  }
}

let frame = 0

function measure(): void {
  const element = resolveTarget()
  rect.value = element ? element.getBoundingClientRect() : null
  placeTooltip()
}

function placeTooltip(): void {
  const tooltip = tooltipRef.value
  if (!tooltip) return
  const gap = 14
  const pad = 12
  const width = tooltip.offsetWidth
  const height = tooltip.offsetHeight
  const target = rect.value
  const placement = currentStep.value?.placement ?? 'bottom'

  if (!target) {
    tooltipStyle.value = {
      top: Math.max(pad, window.innerHeight / 2 - height / 2) + 'px',
      left: Math.max(pad, window.innerWidth / 2 - width / 2) + 'px',
      maxWidth: Math.min(400, window.innerWidth - 2 * pad) + 'px',
    }
    return
  }

  let top = target.bottom + gap
  let left = target.left + target.width / 2 - width / 2

  if (placement === 'top') top = target.top - gap - height
  else if (placement === 'left') {
    top = target.top + target.height / 2 - height / 2
    left = target.left - gap - width
  } else if (placement === 'right') {
    top = target.top + target.height / 2 - height / 2
    left = target.right + gap
  }

  // 放不下就翻到另一侧，再夹进视口
  if (top + height > window.innerHeight - pad && placement !== 'top') top = Math.max(pad, target.top - gap - height)
  if (top < pad) top = Math.min(window.innerHeight - height - pad, target.bottom + gap)
  left = Math.min(Math.max(left, pad), Math.max(pad, window.innerWidth - width - pad))

  tooltipStyle.value = {
    top: top + 'px',
    left: left + 'px',
    maxWidth: Math.min(400, window.innerWidth - 2 * pad) + 'px',
  }
}

function tick(): void {
  measure()
  frame = requestAnimationFrame(tick)
}

function start(): void {
  if (typeof window === 'undefined') return
  stop()
  if (!props.interactive) {
    lockScroll()
    locked.value = true
  }
  nextTick(() => {
    measure()
    frame = requestAnimationFrame(tick)
    const element = resolveTarget()
    element?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    document.addEventListener('keydown', onKeydown)
  })
}

function stop(): void {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  if (locked.value) {
    unlockScroll()
    locked.value = false
  }
  document.removeEventListener('keydown', onKeydown)
}

function close(): void {
  emit('update:modelValue', false)
}

function go(delta: number): void {
  const next = Math.max(0, Math.min(props.steps.length - 1, current.value + delta))
  if (next === current.value) return
  inner.value = next
  emit('update:step', next)
  nextTick(measure)
}

function next(): void {
  if (isLast.value) {
    emit('finish')
    close()
    return
  }
  go(1)
}

function prev(): void {
  go(-1)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      inner.value = props.step ?? 0
      start()
    } else {
      stop()
    }
  },
  { immediate: true },
)

watch(
  () => props.step,
  (value) => {
    if (value === undefined) return
    inner.value = value
    nextTick(measure)
  },
)

watch(current, () => nextTick(measure))

onBeforeUnmount(stop)

defineExpose({ next, prev, close })
</script>

<template>
  <Teleport to="body">
    <Transition name="md-tour-fade">
      <div v-if="modelValue" class="md-tour" :class="{ 'is-interactive': interactive }">
        <!-- 非交互模式：整层吃掉点击，避免用户在引导里误操作页面 -->
        <button
          v-if="!interactive"
          type="button"
          class="md-tour__catcher"
          :aria-label="closeLabel"
          @click="close"
        />

        <div
          v-if="rect"
          class="md-tour__ring"
          :class="{ 'is-interactive': interactive }"
          :style="{
            top: rect.top - 6 + 'px',
            left: rect.left - 6 + 'px',
            width: rect.width + 12 + 'px',
            height: rect.height + 12 + 'px',
          }"
          aria-hidden="true"
        />

        <div
          v-if="currentStep"
          ref="tooltipRef"
          class="md-tour__tooltip"
          role="dialog"
          aria-modal="false"
          :aria-label="currentStep.title"
          :style="tooltipStyle"
        >
          <header class="md-tour__header">
            <span class="md-tour__counter">{{ current + 1 }} / {{ steps.length }}</span>
            <M3IconButton :icon="IconClose" :label="closeLabel" size="sm" variant="standard" @click="close" />
          </header>

          <h3 class="md-tour__title">{{ currentStep.title }}</h3>
          <p class="md-tour__content">{{ currentStep.content }}</p>

          <footer class="md-tour__actions">
            <M3Button v-if="!isFirst" variant="text" size="sm" @click="prev">{{ prevLabel }}</M3Button>
            <M3Button size="sm" @click="next">{{ isLast ? finishLabel : nextLabel }}</M3Button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-tour {
  position: fixed;
  inset: 0;
  z-index: 1300;
  font-family: var(--md-ref-typeface-plain);
}

.md-tour__catcher {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  background-color: color-mix(in srgb, var(--md-sys-color-scrim) 48%, transparent);
  cursor: default;
}

.md-tour__ring {
  position: fixed;
  z-index: 1;
  border-radius: var(--md-sys-shape-corner-medium);
  /* 一块阴影同时完成「照亮目标」和「压暗其余」 */
  box-shadow: 0 0 0 100vmax color-mix(in srgb, var(--md-sys-color-scrim) 48%, transparent);
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 0;
  pointer-events: none;
  transition:
    top var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    left var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    width var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-tour.is-interactive .md-tour__ring {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
  outline-width: 2px;
}

.md-tour__tooltip {
  position: fixed;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: max-content;
  max-width: 400px;
  padding: 12px 16px 12px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
}

.md-tour__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.md-tour__counter {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
}

.md-tour__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.md-tour__content {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  white-space: pre-line;
}

.md-tour__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-block-start: 4px;
}

.md-tour-fade-enter-active,
.md-tour-fade-leave-active {
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-tour-fade-enter-from,
.md-tour-fade-leave-to {
  opacity: 0;
}
</style>
