<script setup lang="ts">
/**
 * 全局提示条宿主（MD3 Snackbar）。
 *
 * 挂在应用根部一次即可：`<M3SnackbarHost />`，配合 `useSnackbar()` 使用。
 * 为什么做成宿主而不是直接调用：MD3 里 snackbar 是浮在页面之上的单实例，
 * 每个页面各自渲染会同时冒出好几条，也会挡住底部的操作栏。
 */
import { IconCheckCircle, IconClose, IconError, IconInfo, IconWarning } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import { useSnackbar } from '../composables/useSnackbar'

const { current, hide } = useSnackbar()
</script>

<template>
  <Teleport to="body">
    <Transition name="md-snackbar">
      <div
        v-if="current"
        class="md-snackbar"
        :class="'md-snackbar--' + current.tone"
        :role="current.tone === 'error' ? 'alert' : 'status'"
        :aria-live="current.tone === 'error' ? 'assertive' : 'polite'"
      >
        <M3Icon
          :icon="
            current.tone === 'error'
              ? IconError
              : current.tone === 'success'
                ? IconCheckCircle
                : current.tone === 'warning'
                  ? IconWarning
                  : IconInfo
          "
          :size="20"
          class="md-snackbar__icon"
        />
        <div class="md-snackbar__body">
          <p v-if="current.title" class="md-snackbar__title md-typescale-title-small">{{ current.title }}</p>
          <p class="md-snackbar__text md-typescale-body-medium">{{ current.text }}</p>
        </div>
        <M3IconButton :icon="IconClose" label="关闭提示" size="sm" variant="standard" @click="hide" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-snackbar {
  position: fixed;
  z-index: 500;
  inset-block-end: 24px;
  inset-inline-start: 50%;
  translate: -50% 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: min(560px, calc(100vw - 32px));
  padding: 12px 8px 12px 16px;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
}

.md-snackbar__icon {
  margin-block-start: 2px;
  flex-shrink: 0;
  color: var(--md-sys-color-inverse-primary);
}

.md-snackbar--error .md-snackbar__icon {
  color: var(--md-sys-color-error);
}

.md-snackbar--warning .md-snackbar__icon {
  color: var(--md-sys-color-tertiary);
}

.md-snackbar__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.md-snackbar__title,
.md-snackbar__text {
  margin: 0;
}

.md-snackbar__text {
  word-break: break-word;
}

.md-snackbar :deep(.md-icon-btn) {
  color: inherit;
  margin-block-start: -4px;
}

/*
 * 提示条：从下方滑入 + 轻微放大，出场更快地缩回去。
 * 它盖在页面底部，位移幅度要比对话框大一些（20px → 28px）才看得出「来了」。
 */
.md-snackbar-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    translate var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-snackbar-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    translate var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-snackbar-enter-from {
  opacity: 0;
  translate: -50% 28px;
  scale: 0.96;
}

.md-snackbar-leave-to {
  opacity: 0;
  translate: -50% 16px;
  scale: 0.98;
}

@media (prefers-reduced-motion: reduce) {
  .md-snackbar-enter-from,
  .md-snackbar-leave-to {
    translate: -50% 0;
    scale: 1;
  }
}
</style>
