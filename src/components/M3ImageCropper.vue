<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { IconRemove } from '../icons'
import M3Button from './M3Button.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 图片裁剪（方形 / 宽高比固定，缩放 + 拖动 + 输出 dataURL）。
 *
 * 预览用 CSS transform，导出时才把「可见区域」换算回原图坐标再 drawImage ——
 * 一次只做一次真正的像素运算，拖动过程零成本。
 * 换算的关键是 cover 基准缩放 s0 = max(框宽/图宽, 框高/图高)：
 * 实际缩放 s = s0 × zoom，可见的源区域 = 框尺寸 / s。
 */
const props = withDefaults(
  defineProps<{
    /** 输出（v-model）：裁剪结果的 dataURL。 */
    modelValue?: string
    src: string
    /** 宽高比。 */
    aspect?: number
    /** 输出边长（px）。 */
    outputSize?: number
    /** 最小 / 最大缩放。 */
    minZoom?: number
    maxZoom?: number
    disabled?: boolean
  }>(),
  {
    modelValue: undefined,
    aspect: 1,
    outputSize: 512,
    minZoom: 1,
    maxZoom: 4,
    disabled: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()

const stageRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const zoom = ref(1)
const offset = ref({ x: 0, y: 0 })
const dragging = ref(false)
const error = ref('')

let start = { x: 0, y: 0 }
let origin = { x: 0, y: 0 }

function onPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  dragging.value = true
  start = { x: event.clientX, y: event.clientY }
  origin = { ...offset.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  offset.value = { x: origin.x + (event.clientX - start.x), y: origin.y + (event.clientY - start.y) }
}

function onPointerUp(): void {
  dragging.value = false
}

function onWheel(event: WheelEvent): void {
  if (props.disabled) return
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.08 : 0.08
  zoom.value = Math.min(props.maxZoom, Math.max(props.minZoom, Number((zoom.value + delta).toFixed(2))))
}

function reset(): void {
  zoom.value = 1
  offset.value = { x: 0, y: 0 }
}

function onImageLoad(): void {
  reset()
  error.value = ''
}

function crop(): void {
  const stage = stageRef.value
  const image = imageRef.value
  if (!stage || !image || !image.naturalWidth) {
    error.value = '图片还没加载完'
    return
  }

  const boxWidth = stage.clientWidth
  const boxHeight = stage.clientHeight
  if (!boxWidth || !boxHeight) return

  const cover = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight)
  const scale = cover * zoom.value
  const sourceWidth = Math.min(image.naturalWidth, boxWidth / scale)
  const sourceHeight = Math.min(image.naturalHeight, boxHeight / scale)

  // 拖动是屏幕像素：往右拖，取样窗口就往左走，所以要取负
  const centerX = image.naturalWidth / 2 - offset.value.x / scale
  const centerY = image.naturalHeight / 2 - offset.value.y / scale
  const sourceX = Math.min(Math.max(0, centerX - sourceWidth / 2), image.naturalWidth - sourceWidth)
  const sourceY = Math.min(Math.max(0, centerY - sourceHeight / 2), image.naturalHeight - sourceHeight)

  const canvas = document.createElement('canvas')
  canvas.width = props.outputSize
  canvas.height = props.outputSize
  const context = canvas.getContext('2d')
  if (!context) {
    error.value = '当前浏览器不支持 canvas'
    return
  }
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    props.outputSize,
    props.outputSize,
  )

  const value = canvas.toDataURL('image/png')
  emit('update:modelValue', value)
  emit('change', value)
}

watch(
  () => props.src,
  () => {
    reset()
  },
)

onBeforeUnmount(() => {
  dragging.value = false
})

defineExpose({ crop, reset })
</script>

<template>
  <div class="md-cropper" :class="{ 'is-disabled': disabled }">
    <div
      ref="stageRef"
      class="md-cropper__stage"
      :style="{ aspectRatio: String(aspect) }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    >
      <img
        ref="imageRef"
        class="md-cropper__image"
        :class="{ 'is-dragging': dragging }"
        :src="src"
        alt="待裁剪的图片"
        draggable="false"
        :style="{ transform: 'translate3d(' + offset.x + 'px, ' + offset.y + 'px, 0) scale(' + zoom + ')' }"
        @load="onImageLoad"
        @error="error = '图片加载失败'"
      />
      <div class="md-cropper__frame" aria-hidden="true" />
    </div>

    <div class="md-cropper__controls">
      <M3IconButton :icon="IconRemove" label="缩小" size="sm" :disabled="disabled || zoom <= minZoom" @click="zoom = Math.max(minZoom, Number((zoom - 0.1).toFixed(2)))" />
      <input
        class="md-cropper__range"
        type="range"
        :min="minZoom"
        :max="maxZoom"
        step="0.01"
        :value="zoom"
        :disabled="disabled"
        aria-label="缩放"
        @input="zoom = Number(($event.target as HTMLInputElement).value)"
      />
      <span class="md-cropper__zoom">{{ Math.round(zoom * 100) }}%</span>
      <M3Button variant="text" size="sm" :disabled="disabled" @click="reset">重置</M3Button>
      <M3Button size="sm" :disabled="disabled" @click="crop">应用裁剪</M3Button>
    </div>

    <p v-if="error" class="md-cropper__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.md-cropper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--md-ref-typeface-plain);
}

.md-cropper__stage {
  position: relative;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-high);
  cursor: grab;
  touch-action: none;
}

.md-cropper__stage:active {
  cursor: grabbing;
}

.md-cropper__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-cropper__image.is-dragging {
  transition: none;
}

/* 取景框：只是一个提示层，点击穿透给 stage */
.md-cropper__frame {
  position: absolute;
  inset: 8%;
  border: 1px dashed rgb(255 255 255 / 0.7);
  border-radius: var(--md-sys-shape-corner-small);
  pointer-events: none;
}

.md-cropper__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.md-cropper__range {
  flex: 1;
  min-width: 120px;
  accent-color: var(--md-sys-color-primary);
}

.md-cropper__zoom {
  min-width: 44px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-variant-numeric: tabular-nums;
}

.md-cropper__error {
  margin: 0;
  color: var(--md-sys-color-error);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-cropper.is-disabled {
  opacity: 0.6;
}
</style>
