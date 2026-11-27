<script setup lang="ts">
import { IconCheckCircle, IconClose, IconError, IconInfo, IconWarning, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import { useNotifications, type NotificationTone } from '../composables/useNotifications'

/**
 * 通知浮层的宿主（右上角堆叠）。挂在应用根部一次即可。
 *
 * 为什么固定在右上：Snackbar 占底部（离拇指近，适合「刚做完的事」），
 * 通知占顶部（不挡操作栏，也更像系统通知的位置感）。
 */
const { items, dismiss, pause, resume } = useNotifications()

const ICONS: Record<NotificationTone, IconComponent> = {
  info: IconInfo,
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
    <div class="md-notify-host" aria-live="polite" aria-relevant="additions">
      <TransitionGroup name="md-notify">
        <article
          v-for="item in items"
          :key="item.id"
          class="md-notify"
          :class="'md-notify--' + item.tone"
          :role="item.tone === 'error' ? 'alert' : 'status'"
          @pointerenter="pause(item.id)"
          @pointerleave="resume(item.id)"
          @focusin="pause(item.id)"
          @focusout="resume(item.id)"
        >
          <M3Icon :icon="ICONS[item.tone]" :size="22" class="md-notify__icon" />

          <div class="md-notify__body">
            <p class="md-notify__title">{{ item.title }}</p>
            <p v-if="item.body" class="md-notify__text">{{ item.body }}</p>
            <button
              v-if="item.action"
              type="button"
              class="md-notify__action"
              @click="runAction(item.id, item.action.onSelect)"
            >
              {{ item.action.label }}
            </button>
          </div>

          <M3IconButton :icon="IconClose" label="关闭通知" size="sm" variant="standard" @click="dismiss(item.id)" />
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.md-notify-host {
  position: fixed;
  z-index: 1250;
  inset-block-start: 16px;
  inset-inline-end: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
  font-family: var(--md-ref-typeface-plain);
}

.md-notify {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 8px 12px 14px;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level2);
  pointer-events: auto;
  border-inline-start: 4px solid var(--md-sys-color-primary);
}

.md-notify--success {
  border-inline-start-color: var(--md-sys-color-primary);
}

.md-notify--warning {
  border-inline-start-color: var(--md-sys-color-tertiary);
}

.md-notify--error {
  border-inline-start-color: var(--md-sys-color-error);
}

.md-notify__icon {
  flex-shrink: 0;
  margin-block-start: 2px;
  color: var(--md-sys-color-primary);
}

.md-notify--warning .md-notify__icon {
  color: var(--md-sys-color-tertiary);
}

.md-notify--error .md-notify__icon {
  color: var(--md-sys-color-error);
}

.md-notify__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.md-notify__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-small-size);
  line-height: var(--md-sys-typescale-title-small-line-height);
  font-weight: var(--md-sys-typescale-title-small-weight);
}

.md-notify__text {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-notify__action {
  align-self: flex-start;
  margin-block-start: 4px;
  padding: 2px 8px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-primary);
  font: inherit;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
}

.md-notify__action:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
}

.md-notify-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-notify-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-notify-enter-from,
.md-notify-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.md-notify-move {
  transition: transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}
</style>
