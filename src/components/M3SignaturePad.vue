<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import M3Button from './M3Button.vue'

/**
 * 手写签名板。
 *
 * 画布按 devicePixelRatio 放大绘制缓冲，否则高分屏上线条是糊的；
 * CSS 尺寸保持逻辑像素，坐标换算时再乘回比例。
 * 每一笔都存成点数组，撤销就是丢掉最后一笔后整块重绘 —— 比尝试擦除更可靠。
 */
const props = withDefaults(
  defineProps<{
    /** 输出的 dataURL（v-model）。 */
    modelValue?: string
    width?: number
    height?: number
    /** 线条颜色。 */
    color?: string
    lineWidth?: number
    disabled?: boolean
    /** 显示内置的清空/撤销工具条。 */
    showToolbar?: boolean
    clearLabel?: string
    undoLabel?: string
  }>(),
  {
    modelValue: undefined,
    width: 600,
    height: 200,
    color: '#1c1c1c',
    lineWidth: 2,
    disabled: false,
    showToolbar: true,
    clearLabel: '清空',
    undoLabel: '撤销',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; end: [value: string] }>()

const wrapper = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const strokes = ref<{ x: number; y: number }[][]>([])
const drawing = ref(false)
const empty = ref(true)
let context: CanvasRenderingContext2D | null = null
let ratio = 1

function resize(): void {
  const canvas = canvasRef.value
  const wrapperEl = wrapper.value
  if (!canvas || !wrapperEl) return
  ratio = Math.min(3, Math.max(1, window.devicePixelRatio || 1))
  const cssWidth = wrapperEl.clientWidth || props.width
  canvas.width = Math.round(cssWidth * ratio)
  canvas.height = Math.round(props.height * ratio)
  canvas.style.width = cssWidth + 'px'
  canvas.style.height = props.height + 'px'
  context = canvas.getContext('2d')
  redraw()
}

function redraw(): void {
  const canvas = canvasRef.value
  if (!canvas || !context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = props.lineWidth * ratio
  context.strokeStyle = props.color

  for (const stroke of strokes.value) {
    context.beginPath()
    stroke.forEach((point, index) => {
      const x = point.x * ratio
      const y = point.y * ratio
      if (index === 0) context!.moveTo(x, y)
      else context!.lineTo(x, y)
    })
    context.stroke()
  }
  empty.value = strokes.value.length === 0
}

function positionOf(event: PointerEvent): { x: number; y: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  drawing.value = true
  strokes.value = [...strokes.value, [positionOf(event)]]
  redraw()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!drawing.value) return
  const current = strokes.value[strokes.value.length - 1]
  if (!current) return
  current.push(positionOf(event))
  redraw()
}

function onPointerUp(): void {
  if (!drawing.value) return
  drawing.value = false
  emitValue()
}

function emitValue(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const value = strokes.value.length === 0 ? '' : canvas.toDataURL('image/png')
  emit('update:modelValue', value)
  emit('end', value)
}

function clear(): void {
  strokes.value = []
  redraw()
  emitValue()
}

function undo(): void {
  strokes.value = strokes.value.slice(0, -1)
  redraw()
  emitValue()
}

function toDataURL(): string {
  return canvasRef.value?.toDataURL('image/png') ?? ''
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) return
    if (strokes.value.length === 0) return
    strokes.value = []
    redraw()
  },
)

let observer: ResizeObserver | null = null

onMounted(() => {
  resize()
  if (typeof ResizeObserver !== 'undefined' && wrapper.value) {
    observer = new ResizeObserver(() => {
      // 尺寸变化会清空画布，按已存笔画重绘
      resize()
    })
    observer.observe(wrapper.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

defineExpose({ clear, undo, toDataURL, isEmpty: () => empty.value })
</script>

<template>
  <div class="md-signature">
    <div ref="wrapper" class="md-signature__canvas-wrap" :class="{ 'is-empty': empty }">
      <canvas
        ref="canvasRef"
        class="md-signature__canvas"
        :style="{ height: height + 'px', cursor: disabled ? 'not-allowed' : 'crosshair' }"
        role="img"
        aria-label="签名板"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      />
      <span v-if="empty" class="md-signature__hint">在此签名</span>
    </div>

    <div v-if="showToolbar" class="md-signature__toolbar">
      <M3Button variant="text" size="sm" :disabled="disabled || empty" @click="undo">{{ undoLabel }}</M3Button>
      <M3Button variant="text" size="sm" :disabled="disabled || empty" @click="clear">{{ clearLabel }}</M3Button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.md-signature {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--md-ref-typeface-plain);
}

.md-signature__canvas-wrap {
  position: relative;
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-lowest);
  overflow: hidden;
}

.md-signature__canvas {
  display: block;
  width: 100%;
  touch-action: none;
}

.md-signature__hint {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  pointer-events: none;
}

.md-signature__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
</style>
