<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import M3Progress from './M3Progress.vue'

/**
 * 下拉刷新。
 *
 * 只在页面（或容器）已经滚到顶部时才接管纵向手势，否则会跟正常滚动打架。
 * 位移做阻尼（0.5），拖到底也不会无限拉长：手势要「有尽头」才像实体。
 * 刷新完成后由 loading 变 false 收回，所以组件不假设请求多久返回。
 */
const props = withDefaults(
  defineProps<{
    /** 是否正在刷新（通常 v-model 或父级状态）。 */
    loading?: boolean
    /** 触发距离（px）。 */
    threshold?: number
    disabled?: boolean
    loadingText?: string
    releaseText?: string
    pullText?: string
    /** 设了高度就自己当滚动容器（演示/局部列表用）。 */
    height?: string
  }>(),
  {
    loading: false,
    threshold: 64,
    disabled: false,
    loadingText: '正在刷新…',
    releaseText: '松开刷新',
    pullText: '下拉刷新',
    height: undefined,
  },
)

const emit = defineEmits<{ refresh: [] }>()

const offset = ref(0)
const dragging = ref(false)
const rootRef = ref<HTMLElement | null>(null)

let startY = 0
let startOffset = 0

const armed = computed(() => offset.value >= props.threshold)

function atTop(): boolean {
  const root = rootRef.value
  if (!root) return true
  if (root.scrollTop > 0) return false
  return window.scrollY <= 0
}

function onTouchStart(event: TouchEvent): void {
  if (props.disabled || props.loading || !atTop()) return
  const touch = event.touches[0]
  if (!touch) return
  startY = touch.clientY
  startOffset = offset.value
  dragging.value = true
}

function onTouchMove(event: TouchEvent): void {
  if (!dragging.value) return
  const touch = event.touches[0]
  if (!touch) return
  const delta = touch.clientY - startY
  if (delta <= 0) {
    offset.value = 0
    return
  }
  // 阻尼：越拉越费劲，最长到 2.5 倍阈值
  offset.value = Math.min(props.threshold * 2.5, (startOffset + delta) * 0.5)
}

function onTouchEnd(): void {
  if (!dragging.value) return
  dragging.value = false
  if (armed.value) emit('refresh')
  if (!armed.value) offset.value = 0
}

watch(
  () => props.loading,
  (loading) => {
    if (loading) offset.value = props.threshold
    else offset.value = 0
  },
)

const label = computed(() => {
  if (props.loading) return props.loadingText
  return armed.value ? props.releaseText : props.pullText
})
</script>

<template>
  <div
    ref="rootRef"
    class="md-pull"
    :class="{ 'is-scroller': Boolean(height) }"
    :style="height ? { height, overflowY: 'auto' } : undefined"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div class="md-pull__indicator" :style="{ height: offset + 'px' }" aria-live="polite">
      <div class="md-pull__indicator-inner" :style="{ opacity: Math.min(1, offset / 40) }">
        <M3Progress v-if="loading" variant="circular" :size="20" :label="loadingText" />
        <span class="md-pull__label">{{ label }}</span>
      </div>
    </div>

    <div
      class="md-pull__content"
      :style="{ transform: 'translate3d(0, ' + offset + 'px, 0)' }"
      :class="{ 'is-dragging': dragging }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.md-pull {
  position: relative;
  overflow: hidden;
}

/* 自己当滚动容器时不能再 hidden，否则滚不动 */
.md-pull.is-scroller {
  overflow-y: auto;
}

.md-pull__indicator {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  transition: height var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

.md-pull__indicator-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-block-end: 10px;
}

.md-pull__label {
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-medium-size);
}

.md-pull__content {
  transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

.md-pull__content.is-dragging {
  transition: none;
}
</style>
