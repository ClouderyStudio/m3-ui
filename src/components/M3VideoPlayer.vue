<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { IconFullscreen, IconFullscreenExit, IconPause, IconPlay } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 视频播放器：原生 <video> + 自绘控件。
 *
 * 原生 controls 在深色主题里会突然出现一条系统配色的工具栏，
 * 而且各浏览器样式完全不同 —— 所以自己画，但所有播放行为仍然交给 <video>。
 * 全屏请求落在容器上而不是 video 上，这样控件也会跟着进全屏。
 */
const props = withDefaults(
  defineProps<{
    src: string
    poster?: string
    title?: string
    /** 宽高比。 */
    aspect?: string
    loop?: boolean
    muted?: boolean
    autoplay?: boolean
    /** 显示控件层。 */
    controls?: boolean
  }>(),
  {
    poster: undefined,
    title: undefined,
    aspect: '16 / 9',
    loop: false,
    muted: false,
    autoplay: false,
    controls: true,
  },
)

const emit = defineEmits<{ play: []; pause: []; ended: []; timeupdate: [currentTime: number] }>()

const wrapperRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const failed = ref(false)
const fullscreen = ref(false)

const progress = computed(() => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0))

function format(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0')
}

function toggle(): void {
  const video = videoRef.value
  if (!video || !props.src) return
  if (video.paused) void video.play().catch(() => { failed.value = true })
  else video.pause()
}

function onPlay(): void {
  playing.value = true
  emit('play')
}

function onPause(): void {
  playing.value = false
  emit('pause')
}

function onTime(): void {
  currentTime.value = videoRef.value?.currentTime ?? 0
  emit('timeupdate', currentTime.value)
}

function onLoaded(): void {
  duration.value = videoRef.value?.duration ?? 0
  failed.value = false
}

function seek(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (videoRef.value) videoRef.value.currentTime = value
  currentTime.value = value
}

async function toggleFullscreen(): Promise<void> {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await wrapper.requestFullscreen()
  } catch {
    // 用户拒绝或浏览器不支持：保持窗口内播放即可
  }
}

function onFullscreenChange(): void {
  fullscreen.value = Boolean(document.fullscreenElement)
}

watch(
  () => props.src,
  () => {
    playing.value = false
    currentTime.value = 0
    duration.value = 0
  },
)

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', onFullscreenChange)
}

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  videoRef.value?.pause()
})
</script>

<template>
  <div ref="wrapperRef" class="md-video" :style="{ aspectRatio: aspect }">
    <video
      v-if="src"
      ref="videoRef"
      class="md-video__el"
      :src="src"
      :poster="poster"
      :loop="loop"
      :muted="muted"
      :autoplay="autoplay"
      playsinline
      preload="metadata"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTime"
      @loadedmetadata="onLoaded"
      @ended="emit('ended')"
      @error="failed = true"
      @click="controls && toggle()"
    />

    <button
      v-if="controls && !playing"
      type="button"
      class="md-video__center"
      :aria-label="'播放' + (title ? '：' + title : '')"
      @click="toggle"
    >
      <span class="md-video__center-icon"><IconPlay /></span>
    </button>

    <div v-if="controls" class="md-video__bar">
      <M3IconButton
        :icon="playing ? IconPause : IconPlay"
        :label="playing ? '暂停' : '播放'"
        size="sm"
        @click="toggle"
      />

      <span class="md-video__time">{{ format(currentTime) }}</span>
      <input
        class="md-video__range"
        type="range"
        min="0"
        :max="Math.max(0, duration)"
        step="0.1"
        :value="currentTime"
        aria-label="播放进度"
        :style="{ '--md-video-progress': progress + '%' }"
        @input="seek"
      />
      <span class="md-video__time">{{ format(duration) }}</span>

      <M3IconButton
        :icon="fullscreen ? IconFullscreenExit : IconFullscreen"
        :label="fullscreen ? '退出全屏' : '全屏'"
        size="sm"
        @click="toggleFullscreen"
      />
    </div>

    <p v-if="!src" class="md-video__placeholder">未设置视频地址</p>
    <p v-else-if="failed" class="md-video__error" role="alert">视频加载失败</p>
  </div>
</template>

<style scoped>
.md-video {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: #000;
  font-family: var(--md-ref-typeface-plain);
}

.md-video:fullscreen {
  border-radius: 0;
}

.md-video__el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  cursor: pointer;
}

.md-video__center {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: rgb(0 0 0 / 0.5);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(2px);
}

.md-video__center-icon :deep(svg) {
  width: 32px;
  height: 32px;
}

.md-video__bar {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  color: #fff;
  background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent);
}

.md-video__bar :deep(.md-icon-btn) {
  color: #fff;
}

.md-video__time {
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

.md-video__range {
  flex: 1;
  height: 4px;
  appearance: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: linear-gradient(
    to right,
    #fff var(--md-video-progress, 0%),
    rgb(255 255 255 / 0.3) var(--md-video-progress, 0%)
  );
  outline: none;
  cursor: pointer;
}

.md-video__range::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: #fff;
}

.md-video__placeholder {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  margin: 0;
  color: rgb(255 255 255 / 0.7);
  font-size: var(--md-sys-typescale-body-medium-size);
}

.md-video__error {
  position: absolute;
  inset-block-start: 12px;
  inset-inline-start: 12px;
  margin: 0;
  padding: 4px 10px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  font-size: var(--md-sys-typescale-label-small-size);
}
</style>
