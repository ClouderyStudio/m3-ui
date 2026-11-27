<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { IconAdd, IconChevronLeft, IconChevronRight, IconClose, IconFullscreenExit, IconRemove } from '../icons'
import M3IconButton from './M3IconButton.vue'
import { useModal } from '../composables/useModal'

/**
 * 灯箱：整屏看图，可缩放、拖动、切换、看缩略图。
 *
 * 缩放用 transform 而不是改图片尺寸：拖动和缩放都在合成层完成，
 * 大图上也不会掉帧。放大后拖动才有意义，所以只有 scale > 1 时才接管指针。
 */
export interface LightboxImage {
  src: string
  alt?: string
  caption?: string
}

const props = withDefaults(
  defineProps<{
    /** 是否展开（v-model）。 */
    modelValue: boolean
    images: LightboxImage[]
    /** 当前张（v-model:index）。 */
    index?: number
    loop?: boolean
    zoomable?: boolean
  }>(),
  { index: 0, loop: true, zoomable: true },
)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'update:index': [index: number]
}>()

const panelRef = ref<HTMLElement | null>(null)
const inner = ref(props.index)
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const dragging = ref(false)

const isOpen = computed(() => props.modelValue)
const current = computed(() => Math.min(Math.max(props.index ?? inner.value, 0), Math.max(0, props.images.length - 1)))
const image = computed<LightboxImage | undefined>(() => props.images[current.value])
const canZoom = computed(() => props.zoomable)

useModal(isOpen, panelRef, { onClose: () => emit('update:modelValue', false) })

let start = { x: 0, y: 0 }
let origin = { x: 0, y: 0 }

function go(delta: number): void {
  if (props.images.length === 0) return
  let next = current.value + delta
  if (props.loop) next = (next + props.images.length) % props.images.length
  else next = Math.max(0, Math.min(props.images.length - 1, next))
  inner.value = next
  offset.value = { x: 0, y: 0 }
  scale.value = 1
  emit('update:index', next)
}

function zoom(factor: number): void {
  if (!canZoom.value) return
  scale.value = Math.min(4, Math.max(1, Number((scale.value * factor).toFixed(2))))
  if (scale.value === 1) offset.value = { x: 0, y: 0 }
}

function onPointerDown(event: PointerEvent): void {
  if (scale.value <= 1) return
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

function onKeydown(event: KeyboardEvent): void {
  if (!props.modelValue) return
  if (event.key === 'ArrowLeft') go(-1)
  else if (event.key === 'ArrowRight') go(1)
  else if (event.key === '+' || event.key === '=') zoom(1.25)
  else if (event.key === '-') zoom(0.8)
  else if (event.key === '0') {
    scale.value = 1
    offset.value = { x: 0, y: 0 }
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    scale.value = 1
    offset.value = { x: 0, y: 0 }
    document.addEventListener('keydown', onKeydown)
  },
)

watch(
  () => props.index,
  (value) => {
    inner.value = value
  },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="md-lightbox">
      <div
        v-if="modelValue"
        ref="panelRef"
        class="md-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="图片查看器"
        tabindex="-1"
      >
        <header class="md-lightbox__bar">
          <span class="md-lightbox__counter">{{ current + 1 }} / {{ images.length }}</span>
          <div class="md-lightbox__tools">
            <M3IconButton
              v-if="canZoom"
              :icon="IconRemove"
              label="缩小"
              :disabled="scale <= 1"
              @click="zoom(0.8)"
            />
            <M3IconButton
              v-if="canZoom"
              :icon="IconAdd"
              label="放大"
              :disabled="scale >= 4"
              @click="zoom(1.25)"
            />
            <M3IconButton
              v-if="canZoom && scale > 1"
              :icon="IconFullscreenExit"
              label="还原大小"
              @click="zoom(1 / scale)"
            />
            <M3IconButton :icon="IconClose" label="关闭" @click="emit('update:modelValue', false)" />
          </div>
        </header>

        <div
          class="md-lightbox__stage"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @click.self="emit('update:modelValue', false)"
        >
          <M3IconButton
            v-if="images.length > 1"
            :icon="IconChevronLeft"
            label="上一张"
            class="md-lightbox__nav md-lightbox__nav--prev"
            @click="go(-1)"
          />

          <img
            v-if="image"
            class="md-lightbox__image"
            :class="{ 'is-zoomed': scale > 1, 'is-dragging': dragging }"
            :src="image.src"
            :alt="image.alt ?? ''"
            :style="{ transform: 'translate3d(' + offset.x + 'px, ' + offset.y + 'px, 0) scale(' + scale + ')' }"
            draggable="false"
          />

          <M3IconButton
            v-if="images.length > 1"
            :icon="IconChevronRight"
            label="下一张"
            class="md-lightbox__nav md-lightbox__nav--next"
            @click="go(1)"
          />
        </div>

        <footer v-if="image?.caption || images.length > 1" class="md-lightbox__footer">
          <p v-if="image?.caption" class="md-lightbox__caption">{{ image.caption }}</p>
          <div v-if="images.length > 1" class="md-lightbox__thumbs">
            <button
              v-for="(thumb, thumbIndex) in images"
              :key="thumb.src + thumbIndex"
              type="button"
              class="md-lightbox__thumb"
              :class="{ 'is-active': thumbIndex === current }"
              :aria-label="'查看第 ' + (thumbIndex + 1) + ' 张'"
              @click="emit('update:index', thumbIndex)"
            >
              <img :src="thumb.src" :alt="thumb.alt ?? ''" />
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  flex-direction: column;
  background-color: rgb(0 0 0 / 0.92);
  color: #fff;
  font-family: var(--md-ref-typeface-plain);
}

.md-lightbox:focus {
  outline: none;
}

.md-lightbox__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
}

.md-lightbox__counter {
  font-size: var(--md-sys-typescale-label-large-size);
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}

.md-lightbox__tools {
  display: flex;
  gap: 4px;
}

.md-lightbox__tools :deep(.md-icon-btn) {
  color: #fff;
}

.md-lightbox__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
}

.md-lightbox__image {
  max-width: 92%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-lightbox__image.is-zoomed {
  cursor: grab;
}

.md-lightbox__image.is-dragging {
  cursor: grabbing;
  transition: none;
}

.md-lightbox__nav {
  position: absolute;
  inset-block-start: 50%;
  translate: 0 -50%;
  color: #fff;
  background-color: rgb(255 255 255 / 0.12);
}

.md-lightbox__nav--prev {
  inset-inline-start: 12px;
}

.md-lightbox__nav--next {
  inset-inline-end: 12px;
}

.md-lightbox__footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px 16px;
}

.md-lightbox__caption {
  margin: 0;
  text-align: center;
  font-size: var(--md-sys-typescale-body-medium-size);
  opacity: 0.85;
}

.md-lightbox__thumbs {
  display: flex;
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
  padding-block: 4px;
}

.md-lightbox__thumb {
  flex-shrink: 0;
  width: 64px;
  height: 44px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--md-sys-shape-corner-small);
  background: none;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
}

.md-lightbox__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.md-lightbox__thumb.is-active {
  border-color: var(--md-sys-color-primary);
  opacity: 1;
}

.md-lightbox-enter-active,
.md-lightbox-leave-active {
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-lightbox-enter-from,
.md-lightbox-leave-to {
  opacity: 0;
}
</style>
