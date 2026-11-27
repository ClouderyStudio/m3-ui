<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 简单轮播：定时自动播放 + 左右箭头 + 圆点。
 *
 * 自动播放必须能被「悬停 / 键盘聚焦 / 页面不可见」暂停 —— 用户正在读这一页时
 * 它自己划走，是轮播最招人烦的地方。页面隐藏时暂停还顺带省电。
 */
export interface SimpleCarouselSlide {
  src: string
  alt?: string
  caption?: string
}

const props = withDefaults(
  defineProps<{
    /** 当前页（v-model）。 */
    modelValue?: number
    slides?: SimpleCarouselSlide[]
    /** 自动播放间隔（毫秒）；0 关闭。 */
    interval?: number
    loop?: boolean
    showDots?: boolean
    showArrows?: boolean
    /** 图片宽高比。 */
    ratio?: string
    ariaLabel?: string
  }>(),
  {
    modelValue: 0,
    slides: () => [],
    interval: 5000,
    loop: true,
    showDots: true,
    showArrows: true,
    ratio: '16 / 9',
    ariaLabel: '图片轮播',
  },
)

const emit = defineEmits<{ 'update:modelValue': [index: number] }>()

const inner = ref(props.modelValue)
const total = computed(() => props.slides.length)
const active = computed(() => (props.modelValue ?? inner.value) ?? 0)
const paused = ref(false)
let timer = 0

function go(index: number): void {
  if (total.value === 0) return
  let next = index
  if (props.loop) next = (index + total.value) % total.value
  else next = Math.max(0, Math.min(total.value - 1, index))
  inner.value = next
  emit('update:modelValue', next)
}

function next(): void {
  if (!props.loop && active.value >= total.value - 1) return
  go(active.value + 1)
}

function prev(): void {
  if (!props.loop && active.value <= 0) return
  go(active.value - 1)
}

function start(): void {
  stop()
  if (props.interval <= 0 || total.value <= 1) return
  timer = window.setInterval(() => {
    if (!paused.value && document.visibilityState === 'visible') next()
  }, props.interval)
}

function stop(): void {
  if (timer) window.clearInterval(timer)
  timer = 0
}

function onVisibility(): void {
  if (document.visibilityState === 'visible') start()
}

watch(() => [props.interval, total.value], start)

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  stop()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <section
    class="md-simple-carousel"
    :aria-label="ariaLabel"
    :aria-roledescription="'carousel'"
    @pointerenter="paused = true"
    @pointerleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div class="md-simple-carousel__viewport" :style="{ aspectRatio: ratio }">
      <Transition name="md-carousel-fade">
        <div v-if="slides.length > 0" :key="active" class="md-simple-carousel__slide">
          <img :src="slides[active]?.src" :alt="slides[active]?.alt ?? ''" loading="lazy" />
          <p v-if="slides[active]?.caption" class="md-simple-carousel__caption">
            {{ slides[active]?.caption }}
          </p>
        </div>
        <div v-else :key="'slot'" class="md-simple-carousel__slide">
          <slot :index="active" />
        </div>
      </Transition>

      <div v-if="showArrows && total > 1" class="md-simple-carousel__arrows">
        <M3IconButton :icon="IconChevronLeft" label="上一张" variant="tonal" size="sm" @click="prev" />
        <M3IconButton :icon="IconChevronRight" label="下一张" variant="tonal" size="sm" @click="next" />
      </div>
    </div>

    <div v-if="showDots && total > 1" class="md-simple-carousel__dots" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(slide, index) in slides"
        :key="slide.src + index"
        type="button"
        class="md-simple-carousel__dot"
        :class="{ 'is-active': index === active }"
        role="tab"
        :aria-selected="index === active"
        :aria-label="'第 ' + (index + 1) + ' 张'"
        @click="go(index)"
      />
    </div>
  </section>
</template>

<style scoped>
.md-simple-carousel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--md-ref-typeface-plain);
}

.md-simple-carousel__viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container);
}

.md-simple-carousel__slide {
  position: absolute;
  inset: 0;
}

.md-simple-carousel__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.md-simple-carousel__caption {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  margin: 0;
  padding: 24px 16px 12px;
  color: #fff;
  font-size: var(--md-sys-typescale-body-medium-size);
  background: linear-gradient(to top, rgb(0 0 0 / 0.6), transparent);
}

.md-simple-carousel__arrows {
  position: absolute;
  inset-inline: 8px;
  inset-block-start: 50%;
  translate: 0 -50%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.md-simple-carousel__arrows > * {
  pointer-events: auto;
}

.md-simple-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.md-simple-carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-outline-variant);
  cursor: pointer;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    width var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

.md-simple-carousel__dot.is-active {
  width: 24px;
  background-color: var(--md-sys-color-primary);
}

.md-carousel-fade-enter-active,
.md-carousel-fade-leave-active {
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-carousel-fade-enter-from,
.md-carousel-fade-leave-to {
  opacity: 0;
}
</style>
