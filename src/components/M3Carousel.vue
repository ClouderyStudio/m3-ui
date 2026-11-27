<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 轮播（滚动吸附版）：一屏可放多张，左右按页滚动。
 *
 * 用原生横向滚动 + scroll-snap，而不是自己算 transform：
 * 触摸屏上的惯性与回弹是浏览器给的，自己实现永远差一点；
 * 代价是要监听 scroll 反推当前页，这部分很便宜。
 */
const props = withDefaults(
  defineProps<{
    /** 一屏显示几张。 */
    perView?: number
    gap?: number
    showArrows?: boolean
    showDots?: boolean
    /** 卡片最小宽度，窄屏下自动减少每屏张数。 */
    minSlideWidth?: number
    ariaLabel?: string
  }>(),
  { perView: 1, gap: 12, showArrows: true, showDots: true, minSlideWidth: 240, ariaLabel: '轮播' },
)

const trackRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const pageCount = ref(1)

function slides(): HTMLElement[] {
  const track = trackRef.value
  if (!track) return []
  return Array.from(track.querySelectorAll<HTMLElement>('[data-carousel-slide]'))
}

function updateState(): void {
  const track = trackRef.value
  if (!track) return
  const items = slides()
  if (items.length === 0) return
  const first = items[0]?.offsetLeft ?? 0
  const width = track.clientWidth || 1
  pageCount.value = Math.max(1, Math.ceil(track.scrollWidth / width))
  const current = items.findIndex((item) => item.offsetLeft - first >= track.scrollLeft - 4)
  activeIndex.value = Math.max(0, current)
}

function scrollToIndex(index: number): void {
  const track = trackRef.value
  const items = slides()
  if (!track || items.length === 0) return
  const target = items[Math.max(0, Math.min(items.length - 1, index))]
  if (!target) return
  const first = items[0]?.offsetLeft ?? 0
  track.scrollTo({ left: target.offsetLeft - first, behavior: 'smooth' })
}

function next(): void {
  const track = trackRef.value
  if (!track) return
  track.scrollBy({ left: track.clientWidth, behavior: 'smooth' })
}

function prev(): void {
  const track = trackRef.value
  if (!track) return
  track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateState()
  if (typeof ResizeObserver !== 'undefined' && trackRef.value) {
    resizeObserver = new ResizeObserver(updateState)
    resizeObserver.observe(trackRef.value)
  }
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const slideStyle = computed(() => ({
  flexBasis: 'calc((100% - ' + props.gap * (props.perView - 1) + 'px) / ' + props.perView + ')',
  minWidth: props.minSlideWidth + 'px',
}))
</script>

<template>
  <section class="md-carousel" :aria-label="ariaLabel">
    <div
      ref="trackRef"
      class="md-carousel__track"
      :style="{ gap: gap + 'px', scrollSnapType: 'x mandatory' }"
      @scroll.passive="updateState"
    >
      <slot :slide-style="slideStyle" />
    </div>

    <div v-if="showArrows" class="md-carousel__controls">
      <M3IconButton :icon="IconChevronLeft" label="上一页" size="sm" variant="tonal" @click="prev" />
      <M3IconButton :icon="IconChevronRight" label="下一页" size="sm" variant="tonal" @click="next" />
    </div>

    <div v-if="showDots && pageCount > 1" class="md-carousel__dots">
      <button
        v-for="index in pageCount"
        :key="index"
        type="button"
        class="md-carousel__dot"
        :class="{ 'is-active': Math.floor(activeIndex) === index - 1 }"
        :aria-label="'第 ' + index + ' 页'"
        :aria-current="Math.floor(activeIndex) === index - 1 ? 'true' : undefined"
        @click="scrollToIndex(0)"
      />
    </div>
  </section>
</template>

<style scoped>
.md-carousel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--md-ref-typeface-plain);
}

.md-carousel__track {
  display: flex;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  padding-block-end: 4px;
}

.md-carousel__track::-webkit-scrollbar {
  display: none;
}

.md-carousel__track :deep(> *) {
  scroll-snap-align: start;
  flex-shrink: 0;
}

.md-carousel__controls {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.md-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.md-carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-outline-variant);
  cursor: pointer;
}

.md-carousel__dot.is-active {
  width: 20px;
  background-color: var(--md-sys-color-primary);
}
</style>
