<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

const props = withDefaults(
  defineProps<{
    src?: string
    /** Accessible name; also used to derive fallback initials. */
    name?: string
    alt?: string
    /** Diameter in px or any CSS length. */
    size?: number | string
    /** Adds an outline ring, used for emphasis in member grids. */
    ring?: boolean
    /** Circular is the default; square uses a 12dp corner for app-style rosters. */
    shape?: 'circle' | 'square'
    /** Presence dot in the bottom-end corner. */
    status?: AvatarStatus | null
    /** Spoken label for the presence dot; defaults to a Chinese label per status. */
    statusLabel?: string
    loading?: 'lazy' | 'eager'
  }>(),
  {
    src: undefined,
    name: '',
    alt: undefined,
    size: 40,
    ring: false,
    shape: 'circle',
    status: null,
    statusLabel: undefined,
    loading: 'lazy',
  },
)

const failed = ref(false)
const loaded = ref(false)
const imageEl = ref<HTMLImageElement | null>(null)

const cssSize = computed(() => (typeof props.size === 'number' ? props.size + 'px' : props.size))

const initials = computed(() => {
  const source = (props.name ?? '').trim()
  if (!source) return '?'
  const words = source.split(/\s+/).filter(Boolean)

  // 拉丁文姓名取两个词的首字母；中日韩姓名取前两个字
  // （「云术 工作室」按词取会得到「云工」，读起来像另一个名字）。
  const hasCjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(source)
  if (words.length > 1 && !hasCjk) {
    return (words[0]![0]! + words[1]![0]!).toUpperCase()
  }
  return source.replace(/\s+/g, '').slice(0, 2).toUpperCase()
})

const showImage = computed(() => Boolean(props.src) && !failed.value)

const statusText = computed(() => {
  if (!props.status) return ''
  if (props.statusLabel) return props.statusLabel
  switch (props.status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'busy':
      return '忙碌'
    default:
      return '离开'
  }
})

const avatarLabel = computed(() => {
  const name = props.alt ?? props.name ?? '头像'
  return props.status ? name + '，' + statusText.value : name
})

onMounted(() => {
  // Cached images can fire load before the listener is attached.
  if (imageEl.value?.complete) loaded.value = true
})
</script>

<template>
  <span
    class="md-avatar"
    :class="['md-avatar--' + shape, { 'md-avatar--ring': ring }]"
    :style="{
      width: cssSize,
      height: cssSize,
      fontSize: 'calc(' + cssSize + ' * 0.36)',
      '--md-avatar-size': cssSize,
    }"
    :role="showImage ? undefined : 'img'"
    :aria-label="showImage ? undefined : avatarLabel"
  >
    <img
      v-if="showImage"
      ref="imageEl"
      class="md-avatar__img"
      :class="{ 'is-loaded': loaded }"
      :src="src"
      :alt="alt ?? name ?? ''"
      :loading="loading"
      decoding="async"
      @load="loaded = true"
      @error="failed = true"
    />
    <span v-else class="md-avatar__initials" aria-hidden="true">{{ initials }}</span>

    <span
      v-if="status"
      class="md-avatar__status"
      :class="'md-avatar__status--' + status"
      :title="statusText"
    >
      <span class="sr-only">{{ statusText }}</span>
    </span>
  </span>
</template>

<style scoped>
.md-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--md-sys-shape-corner-full);
  overflow: visible;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  line-height: 1;
  user-select: none;
}

.md-avatar--square {
  border-radius: var(--md-sys-shape-corner-medium);
}

.md-avatar__img,
.md-avatar__initials {
  border-radius: inherit;
}

.md-avatar__initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.md-avatar__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /*
   * 头像加载完成后淡入 + 极轻微放大（1.04 → 1）：
   * 只淡入的话，图与首字母之间的切换像一次闪烁；带上缩放就读成「图来了」。
   */
  opacity: 0;
  scale: 1.04;
  transition:
    opacity var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-standard),
    scale var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-avatar__img.is-loaded {
  opacity: 1;
  scale: 1;
}

@media (prefers-reduced-motion: reduce) {
  /* 削减：只淡入，不缩放 */
  .md-avatar__img,
  .md-avatar__img.is-loaded {
    scale: 1;
  }
}

.md-avatar--ring {
  box-shadow:
    0 0 0 2px var(--md-sys-color-surface),
    0 0 0 4px var(--md-sys-color-primary-container);
}

.md-avatar__status {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
  width: clamp(8px, calc(var(--md-avatar-size) * 0.28), 14px);
  height: clamp(8px, calc(var(--md-avatar-size) * 0.28), 14px);
  border-radius: var(--md-sys-shape-corner-full);
  border: 2px solid var(--md-sys-color-surface);
  background-color: var(--md-sys-color-outline);
}

.md-avatar__status--online {
  background-color: var(--md-sys-color-primary);
}

.md-avatar__status--away {
  background-color: var(--md-sys-color-tertiary);
}

.md-avatar__status--busy {
  background-color: var(--md-sys-color-error);
}

.md-avatar__status--offline {
  background-color: var(--md-sys-color-outline);
}
</style>
