<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

/**
 * 容器转场（展开态与收起态之间的共享元素动画）。
 *
 * 做法是 FLIP：切换前量一次目标位置，切换后再量一次，
 * 然后用 transform 把新元素「倒推」回旧位置，下一帧再放回原位。
 * 期间不碰 width/height/animation，所以不会触发逐帧重排。
 */
const props = withDefaults(
  defineProps<{
    /** 是否展开（v-model）。 */
    modelValue: boolean
    /** 动画时长（ms）。 */
    duration?: number
    /** 展开方向。 */
    origin?: 'top-left' | 'center'
  }>(),
  { duration: 320, origin: 'top-left' },
)

const wrapperRef = ref<HTMLElement | null>(null)
const animating = ref(false)

function measure(): DOMRect | null {
  return wrapperRef.value?.getBoundingClientRect() ?? null
}

function animateFrom(from: DOMRect, to: DOMRect): void {
  const element = wrapperRef.value
  if (!element || from.width === 0 || from.height === 0) return

  const scaleX = from.width / to.width
  const scaleY = from.height / to.height
  const origin = props.origin === 'center' ? 'center center' : 'top left'
  const deltaX = props.origin === 'center' ? from.left + from.width / 2 - (to.left + to.width / 2) : from.left - to.left
  const deltaY = props.origin === 'center' ? from.top + from.height / 2 - (to.top + to.height / 2) : from.top - to.top

  animating.value = true
  element.style.transformOrigin = origin
  element.style.transition = 'none'
  element.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px) scale(' + scaleX + ', ' + scaleY + ')'

  requestAnimationFrame(() => {
    element.style.transition = 'transform ' + props.duration + 'ms cubic-bezier(0.2, 0, 0, 1)'
    element.style.transform = 'none'
    window.setTimeout(() => {
      element.style.transition = ''
      element.style.transform = ''
      element.style.transformOrigin = ''
      animating.value = false
    }, props.duration + 20)
  })
}

/*
 * 父组件改 v-model 之后、DOM 打补丁之前会先跑这里：
 * 此刻量到的是「旧尺寸」，nextTick 之后量到的是「新尺寸」，正好是一次 FLIP。
 */
watch(
  () => props.modelValue,
  async () => {
    const before = measure()
    await nextTick()
    const after = measure()
    if (!before || !after) return
    animateFrom(before, after)
  },
)

defineExpose({ animating })
</script>

<template>
  <div ref="wrapperRef" class="md-container-transform">
    <slot :expanded="modelValue" />
  </div>
</template>

<style scoped>
.md-container-transform {
  will-change: transform;
}
</style>
