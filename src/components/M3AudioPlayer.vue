<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { IconPause, IconPlay } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 音频播放器：原生 <audio> 负责解码与播放，界面只画「播放 / 进度 / 时间」。
 *
 * 不用 AudioContext 自己解码：那要处理缓冲、跨域、格式兼容一堆事，
 * 而 <audio> 已经把「能播的都能播」这一条做到了。控件是自绘的，
 * 因为原生 controls 的外观完全跟随操作系统，和深色主题冲突。
 */
const props = withDefaults(
  defineProps<{
    src: string
    title?: string
    subtitle?: string
    loop?: boolean
    autoplay?: boolean
    /** 播完回到开头而不是停在末尾。 */
    resetOnEnd?: boolean
  }>(),
  { title: undefined, subtitle: undefined, loop: false, autoplay: false, resetOnEnd: true },
)

const emit = defineEmits<{ play: []; pause: []; ended: [] }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const failed = ref(false)

const progress = computed(() => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0))

function format(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0')
}

function toggle(): void {
  const audio = audioRef.value
  if (!audio || !props.src) return
  if (audio.paused) void audio.play().catch(() => { failed.value = true })
  else audio.pause()
}

function onPlay(): void {
  playing.value = true
  emit('play')
}

function onPause(): void {
  playing.value = false
  emit('pause')
}

function onTimeUpdate(): void {
  currentTime.value = audioRef.value?.currentTime ?? 0
}

function onLoaded(): void {
  duration.value = audioRef.value?.duration ?? 0
  failed.value = false
}

function onEnded(): void {
  emit('ended')
  if (props.resetOnEnd && audioRef.value) {
    audioRef.value.currentTime = 0
    currentTime.value = 0
  }
}

function seek(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (audioRef.value) audioRef.value.currentTime = value
  currentTime.value = value
}

watch(
  () => props.src,
  () => {
    playing.value = false
    currentTime.value = 0
    duration.value = 0
  },
)

onBeforeUnmount(() => {
  audioRef.value?.pause()
})
</script>

<template>
  <div class="md-audio">
    <audio
      v-if="src"
      ref="audioRef"
      :src="src"
      :loop="loop"
      :autoplay="autoplay"
      preload="metadata"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @ended="onEnded"
      @error="failed = true"
    />

    <M3IconButton
      :icon="playing ? IconPause : IconPlay"
      :label="playing ? '暂停' : '播放'"
      variant="filled"
      @click="toggle"
    />

    <div class="md-audio__body">
      <p v-if="title" class="md-audio__title">{{ title }}</p>
      <p v-if="!src" class="md-audio__subtitle">未设置音频地址</p>
      <p v-else-if="subtitle || failed" class="md-audio__subtitle">
        {{ failed ? '音频加载失败' : subtitle }}
      </p>

      <div class="md-audio__seek">
        <span class="md-audio__time">{{ format(currentTime) }}</span>
        <input
          class="md-audio__range"
          type="range"
          min="0"
          :max="Math.max(0, duration)"
          step="0.1"
          :value="currentTime"
          aria-label="播放进度"
          :style="{ '--md-audio-progress': progress + '%' }"
          @input="seek"
        />
        <span class="md-audio__time">{{ format(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.md-audio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
}

.md-audio__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.md-audio__title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-ref-typeface-weight-medium);
}

.md-audio__subtitle {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-audio__seek {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 4px;
}

.md-audio__time {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
}

.md-audio__range {
  flex: 1;
  height: 4px;
  appearance: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: linear-gradient(
    to right,
    var(--md-sys-color-primary) var(--md-audio-progress, 0%),
    var(--md-sys-color-surface-container-highest) var(--md-audio-progress, 0%)
  );
  outline: none;
  cursor: pointer;
}

.md-audio__range::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
}

.md-audio__range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
}
</style>
