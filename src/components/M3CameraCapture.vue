<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import M3Button from './M3Button.vue'

/**
 * 摄像头拍照（getUserMedia + canvas 抓帧）。
 *
 * 默认**不自动开摄像头**：打开页面就申请权限既唐突、又会让浏览器立刻弹权限框，
 * 很多用户会顺手点「拒绝」并永久记住。这里由调用方点按钮或调用 start()。
 * 关闭时一定要 stop 掉所有 track，否则摄像头指示灯会一直亮着。
 */
const props = withDefaults(
  defineProps<{
    /** 抓拍结果（v-model）：dataURL。 */
    modelValue?: string
    facing?: 'user' | 'environment'
    /** 挂载后立刻申请摄像头。 */
    autoStart?: boolean
    width?: number
    height?: number
    /** 输出 jpeg 质量（0–1）。 */
    quality?: number
  }>(),
  {
    modelValue: undefined,
    facing: 'user',
    autoStart: false,
    width: 1280,
    height: 720,
    quality: 0.9,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  capture: [value: string]
  error: [message: string]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const active = ref(false)
const starting = ref(false)
const error = ref('')

let stream: MediaStream | null = null

const facingNow = computed(() => props.facing)

async function start(): Promise<void> {
  if (active.value || starting.value) return
  starting.value = true
  error.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: props.facing, width: { ideal: props.width }, height: { ideal: props.height } },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play().catch(() => {})
    }
    active.value = true
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : '无法访问摄像头'
    error.value = message
    emit('error', message)
  } finally {
    starting.value = false
  }
}

function stop(): void {
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  if (videoRef.value) videoRef.value.srcObject = null
  active.value = false
}

async function switchFacing(): Promise<void> {
  stop()
  emit('update:modelValue', props.modelValue ?? '')
  await start()
}

function capture(): void {
  const video = videoRef.value
  if (!video || !active.value) return
  const width = video.videoWidth || props.width
  const height = video.videoHeight || props.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    emit('error', '当前浏览器不支持 canvas')
    return
  }
  // 前置摄像头是镜像预览，抓出来的帧也要镜像，否则左右颠倒
  if (props.facing === 'user') {
    context.translate(width, 0)
    context.scale(-1, 1)
  }
  context.drawImage(video, 0, 0, width, height)
  const value = canvas.toDataURL('image/jpeg', props.quality)
  emit('update:modelValue', value)
  emit('capture', value)
}

if (props.autoStart && typeof navigator !== 'undefined') {
  void start()
}

onBeforeUnmount(stop)

defineExpose({ start, stop, capture, switchFacing, active })
</script>

<template>
  <div class="md-camera">
    <div class="md-camera__stage">
      <video
        ref="videoRef"
        class="md-camera__video"
        :class="{ 'is-mirrored': facingNow === 'user' }"
        :style="{ aspectRatio: width + ' / ' + height }"
        muted
        playsinline
        autoplay
      />

      <p v-if="!active" class="md-camera__placeholder">
        {{ starting ? '正在打开摄像头…' : '摄像头未开启' }}
      </p>
    </div>

    <div class="md-camera__actions">
      <M3Button v-if="!active" variant="tonal" :loading="starting" @click="start">开启摄像头</M3Button>
      <template v-else>
        <M3Button variant="tonal" @click="switchFacing">切换镜头</M3Button>
        <M3Button @click="capture">拍照</M3Button>
        <M3Button variant="text" @click="stop">关闭</M3Button>
      </template>
    </div>

    <p v-if="error" class="md-camera__error" role="alert">{{ error }}</p>

    <img v-if="modelValue" class="md-camera__result" :src="modelValue" alt="抓拍结果" />
  </div>
</template>

<style scoped>
.md-camera {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--md-ref-typeface-plain);
}

.md-camera__stage {
  position: relative;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: #000;
}

.md-camera__video {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.md-camera__video.is-mirrored {
  transform: scaleX(-1);
}

.md-camera__placeholder {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  margin: 0;
  color: rgb(255 255 255 / 0.7);
  font-size: var(--md-sys-typescale-body-medium-size);
}

.md-camera__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.md-camera__error {
  margin: 0;
  color: var(--md-sys-color-error);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-camera__result {
  max-width: 200px;
  border-radius: var(--md-sys-shape-corner-medium);
}
</style>
