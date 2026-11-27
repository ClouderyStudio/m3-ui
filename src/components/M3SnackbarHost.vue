<script setup lang="ts">
/**
 * 全局提示条宿主（MD3 Snackbar）。
 *
 * 挂在应用根部一次即可：<M3SnackbarHost />，配合 useSnackbar() 使用。
 * 为什么做成宿主而不是直接调用：MD3 里 snackbar 是浮在页面之上的浮层，
 * 每个页面各自渲染会同时冒出好几条，也会挡住底部的操作栏。
 *
 * 现在支持堆叠（useSnackbar 的 messages 队列，最多 3 条）：
 * 最新的贴近屏幕底边，更早的往上排；同一时刻的操作结果不会被互相顶掉。
 */
import { IconCheckCircle, IconClose, IconError, IconInfo, IconWarning, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import { useSnackbar, type SnackbarTone } from '../composables/useSnackbar'

const { messages, dismiss, pause, resume } = useSnackbar()

const ICONS: Record<SnackbarTone, IconComponent> = {
  neutral: IconInfo,
  success: IconCheckCircle,
  warning: IconWarning,
  error: IconError,
}

function runAction(id: number, onSelect?: () => void): void {
  onSelect?.()
  dismiss(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="md-snackbar-stack">
      <TransitionGroup name="md-snackbar">
        <div
          v-for="message in messages"
          :key="message.id"
          class="md-snackbar"
          :class="'md-snackbar--' + message.tone"
          :role="message.tone === 'error' ? 'alert' : 'status'"
          :aria-live="message.tone === 'error' ? 'assertive' : 'polite'"
          @pointerenter="pause(message.id)"
          @pointerleave="resume(message.id)"
          @focusin="pause(message.id)"
          @focusout="resume(message.id)"
        >
          <M3Icon :icon="ICONS[message.tone]" :size="20" class="md-snackbar__icon" />

          <div class="md-snackbar__body">
            <p v-if="message.title" class="md-snackbar__title md-typescale-title-small">
              {{ message.title }}
            </p>
            <p class="md-snackbar__text md-typescale-body-medium">{{ message.text }}</p>
          </div>

          <button
            v-if="message.action"
            type="button"
            class="md-snackbar__action"
            @click="runAction(message.id, message.action.onSelect)"
          >
            {{ message.action.label }}
          </button>

          <M3IconButton
            :icon="IconClose"
            label="关闭提示"
            size="sm"
            variant="standard"
            @click="dismiss(message.id)"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/*
 * 栈：固定在底部居中，column-reverse 让「最新的一条」贴在底边。
 * 容器只负责排版，不吃指针事件 —— 否则空白处会挡住下方页面。
 */
.md-snackbar-stack {
  position: fixed;
  z-index: 500;
  inset-block-end: 24px;
  inset-inline-start: 50%;
  translate: -50% 0;
  display: flex;
  /*
   * 正序排队：容器贴着视口底部、高度由内容撑开，
   * 所以「新入队的那条」自然落在最下面、离手指最近。
   * （用 column-reverse 会把顺序反过来，最后一条浮到顶部。）
   */
  flex-direction: column;
  gap: 8px;
  width: min(560px, calc(100vw - 32px));
  pointer-events: none;
}

.md-snackbar {
  position: relative;
  width: 100%;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
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
  padding-block: 2px;
}

.md-snackbar__title,
.md-snackbar__text {
  margin: 0;
}

.md-snackbar__text {
  word-break: break-word;
}

/* 操作按钮与关闭按钮共用同一行，文字色跟随 inverse-primary */
.md-snackbar__action {
  flex-shrink: 0;
  align-self: center;
  height: 32px;
  padding-inline: 12px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-inverse-primary);
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-snackbar__action:hover {
    background-color: color-mix(in srgb, currentColor 10%, transparent);
  }
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
    transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-snackbar-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-snackbar-move {
  transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

.md-snackbar-enter-from {
  opacity: 0;
  transform: translateY(28px);
  scale: 0.96;
}

.md-snackbar-leave-to {
  opacity: 0;
  transform: translateY(16px);
  scale: 0.98;
}

@media (max-width: 480px) {
  .md-snackbar-stack {
    inset-block-end: 12px;
    width: calc(100vw - 24px);
  }

  .md-snackbar {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .md-snackbar-enter-from,
  .md-snackbar-leave-to {
    transform: none;
    scale: 1;
  }
}
</style>
