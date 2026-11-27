<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * 可滑走的列表项（Compose 的 SwipeToDismissBox）。
 *
 * 松手时不直接删除，而是停在「已滑走」的状态等使用方决定：
 * 真的移除，还是弹一个撤销。手势组件自己删数据是最难改的一类设计。
 *
 * 判定用「位移超过阈值」而不是速度：鼠标拖拽没有可靠的甩动速度，
 * 触屏有但两种输入要一致的行为。
 */
export type SwipeToDismissValue = 'settled' | 'start-to-end' | 'end-to-start'

const props = withDefaults(
  defineProps<{
    /** 状态（v-model）：settled 或滑向某一侧。 */
    modelValue?: SwipeToDismissValue
    /** 允许向阅读方向滑（LTR 下向右）。 */
    startToEnd?: boolean
    /** 允许反向滑。 */
    endToStart?: boolean
    disabled?: boolean
    /** 触发距离（px）。 */
    threshold?: number
  }>(),
  {
    modelValue: 'settled',
    startToEnd: true,
    endToStart: true,
    disabled: false,
    threshold: 56,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SwipeToDismissValue]
  dismiss: [direction: Exclude<SwipeToDismissValue, 'settled'>]
}>()

const rootEl = ref<HTMLElement | null>(null)
const offset = ref(0)
const dragging = ref(false)
const width = ref(0)
const settled = ref<SwipeToDismissValue>(props.modelValue)

let startX = 0
let startOffset = 0

const direction = computed<SwipeToDismissValue>(() =>
  offset.value > 0 ? 'start-to-end' : offset.value < 0 ? 'end-to-start' : 'settled',
)

/** 松手后会落到哪一侧（背景插槽用它决定露出「归档」还是「删除」）。 */
const target = computed<SwipeToDismissValue>(() => {
  if (offset.value >= props.threshold && props.startToEnd) return 'start-to-end'
  if (offset.value <= -props.threshold && props.endToStart) return 'end-to-start'
  return props.modelValue
})

const progress = computed(() =>
  width.value > 0 ? Math.min(1, Math.abs(offset.value) / width.value) : 0,
)

function anchorOf(value: SwipeToDismissValue): number {
  if (value === 'start-to-end') return width.value
  if (value === 'end-to-start') return -width.value
  return 0
}

/** 把内容挪到某一侧的锚点；动画由 CSS transition 负责。 */
function apply(value: SwipeToDismissValue): void {
  settled.value = value
  offset.value = anchorOf(value)
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled || event.button !== 0) return
  const root = rootEl.value
  if (!root) return
  width.value = root.offsetWidth
  startX = event.clientX
  startOffset = offset.value
  dragging.value = true
  root.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  let delta = event.clientX - startX
  const raw = startOffset + delta
  // 不允许的方向给 0.25 的阻尼：还能拖动，但明显「拉不动」
  if ((raw > 0 && !props.startToEnd) || (raw < 0 && !props.endToStart)) delta *= 0.25
  offset.value = Math.max(-width.value, Math.min(width.value, startOffset + delta))
}

function finish(): void {
  if (!dragging.value) return
  dragging.value = false

  const towards = offset.value > 0 ? 'start-to-end' : offset.value < 0 ? 'end-to-start' : 'settled'
  const passed =
    (towards === 'start-to-end' && offset.value >= props.threshold && props.startToEnd) ||
    (towards === 'end-to-start' && offset.value <= -props.threshold && props.endToStart)

  if (passed) {
    offset.value = anchorOf(towards)
    settled.value = towards
    if (props.modelValue !== towards) {
      emit('update:modelValue', towards)
      emit('dismiss', towards)
    }
    return
  }

  // 没越过阈值：回到「已经提交的那个状态」，而不是一律回中
  offset.value = anchorOf(props.modelValue)
  settled.value = props.modelValue
}

function onPointerUp(): void {
  finish()
}

watch(
  () => props.modelValue,
  (value) => {
    width.value = rootEl.value?.offsetWidth ?? width.value
    apply(value)
  },
  { immediate: true },
)

function reset(): void {
  emit('update:modelValue', 'settled')
  apply('settled')
}

onBeforeUnmount(() => {
  dragging.value = false
})

defineExpose({ reset, settle: reset })
</script>

<template>
  <div
    ref="rootEl"
    class="md-swipe"
    :class="{ 'is-dragging': dragging, 'is-disabled': disabled }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="md-swipe__background" aria-hidden="true">
      <slot name="background" :direction="direction" :target="target" :progress="progress" />
    </div>

    <div class="md-swipe__content" :style="{ transform: 'translate3d(' + offset + 'px, 0, 0)' }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.md-swipe {
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  /* 纵向滚动仍然交给页面，横向留给手势 */
  touch-action: pan-y;
}

.md-swipe__background {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 20px;
  background-color: var(--md-sys-color-surface-container-high);
}

.md-swipe__content {
  position: relative;
  z-index: 1;
  /* 内容必须不透明才能盖住背景；放在卡片里时用 --md-swipe-bg 覆盖成卡片色 */
  background-color: var(--md-swipe-bg, var(--md-sys-color-surface));
  transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
  will-change: transform;
}

.md-swipe.is-dragging .md-swipe__content {
  transition: none;
}

.md-swipe.is-disabled {
  touch-action: auto;
}

@media (prefers-reduced-motion: reduce) {
  .md-swipe__content {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
}
</style>
