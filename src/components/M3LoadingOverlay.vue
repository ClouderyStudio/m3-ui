<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { lockScroll, unlockScroll } from '../composables/useScrollLock'
import M3Progress from './M3Progress.vue'

/**
 * 加载遮罩：盖住一块内容（默认），或用 fullscreen 盖住整个视口。
 *
 * 半透明 + 背景模糊而不是纯色不透明：用户能看见底下「确实是刚刚那一块内容」，
 * 页面没有闪成另一个界面，也就不会怀疑自己点错了页面。
 * 只有需要彻底遮住敏感内容时才用 opaque。
 */
const props = withDefaults(
  defineProps<{
    visible: boolean
    /** 加载文案。 */
    text?: string
    /** 覆盖整个视口（Teleport 到 body）。 */
    fullscreen?: boolean
    /** 不透明底色。 */
    opaque?: boolean
    /** 环形指示器直径（px）。 */
    size?: number
  }>(),
  { text: '', fullscreen: false, opaque: false, size: 40 },
)

defineOptions({ inheritAttrs: false })

/*
 * 全屏遮罩必须把页面滚动也锁住：遮罩只是「盖住」，
 * 手机上一划背景还是会动，用户会以为遮罩是张图。
 */
const locked = ref(false)

function syncScrollLock(): void {
  const shouldLock = props.visible && props.fullscreen
  if (shouldLock && !locked.value) {
    lockScroll()
    locked.value = true
  } else if (!shouldLock && locked.value) {
    unlockScroll()
    locked.value = false
  }
}

watch(() => [props.visible, props.fullscreen], syncScrollLock, { immediate: true })

onBeforeUnmount(() => {
  if (!locked.value) return
  unlockScroll()
  locked.value = false
})
</script>

<template>
  <Teleport v-if="fullscreen" to="body">
    <Transition name="md-overlay-fade">
      <div
        v-if="visible"
        class="md-overlay md-overlay--fullscreen"
        :class="{ 'is-opaque': opaque }"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <M3Progress variant="circular" :size="size" :label="text || '正在加载'" />
        <p v-if="text" class="md-overlay__text">{{ text }}</p>
        <slot />
      </div>
    </Transition>
  </Teleport>

  <div v-else class="md-overlay-host">
    <slot name="content" />

    <Transition name="md-overlay-fade">
      <div
        v-if="visible"
        class="md-overlay md-overlay--inline"
        :class="{ 'is-opaque': opaque }"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <M3Progress variant="circular" :size="size" :label="text || '正在加载'" />
        <p v-if="text" class="md-overlay__text md-overlay__text--inline">{{ text }}</p>
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.md-overlay-host {
  position: relative;
}

.md-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background-color: color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent);
  backdrop-filter: blur(4px);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
}

.md-overlay.is-opaque {
  background-color: var(--md-sys-color-surface);
  backdrop-filter: none;
}

.md-overlay--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

/* 内联遮罩继承宿主元素的圆角，不会被画到卡片外面去 */
.md-overlay--inline {
  position: absolute;
  inset: 0;
  z-index: 10;
  border-radius: inherit;
}

.md-overlay__text {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}

.md-overlay__text--inline {
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-overlay-fade-enter-active {
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-overlay-fade-leave-active {
  transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-overlay-fade-enter-from,
.md-overlay-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .md-overlay {
    backdrop-filter: none;
    background-color: color-mix(in srgb, var(--md-sys-color-surface) 92%, transparent);
  }
}
</style>
