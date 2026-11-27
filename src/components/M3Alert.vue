<script setup lang="ts">
import { computed } from 'vue'
import {
  IconCheckCircle,
  IconClose,
  IconError,
  IconInfo,
  IconWarning,
  type IconComponent,
} from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 行内提示：error / success / info / warning / neutral。
 *
 * MD3 没有「告警条」这个组件，官方给的做法是容器 + 语义色；
 * 这里用容器角色上色（error-container / primary-container …），正文用对应的 on-* 角色，
 * 明暗两套主题下的对比度由令牌自己保证。
 *
 * role 按级别区分：错误用 alert（立即播报），其余用 status（礼貌播报）。
 */
const props = withDefaults(
  defineProps<{
    variant?: 'error' | 'success' | 'info' | 'warning' | 'neutral'
    /** 标题；不传时只有正文。 */
    title?: string
    /** 允许用户手动关闭。 */
    dismissible?: boolean
    /** 桌面端更紧凑的内边距，用于表单顶部等位置。 */
    compact?: boolean
  }>(),
  { variant: 'info', title: '', dismissible: false, compact: false },
)

const emit = defineEmits<{ dismiss: [] }>()

const glyph = computed<IconComponent>(() => {
  switch (props.variant) {
    case 'error':
      return IconError
    case 'success':
      return IconCheckCircle
    case 'warning':
      return IconWarning
    default:
      return IconInfo
  }
})
</script>

<template>
  <div
    class="alert"
    :class="['alert--' + props.variant, { 'alert--compact': compact }]"
    :role="props.variant === 'error' ? 'alert' : 'status'"
    :aria-live="props.variant === 'error' ? 'assertive' : 'polite'"
  >
    <M3Icon :icon="glyph" :size="20" class="alert__icon" />
    <div class="alert__content">
      <p v-if="props.title" class="alert__title md-typescale-title-small">{{ props.title }}</p>
      <div class="alert__body md-typescale-body-medium"><slot /></div>
      <div v-if="$slots.actions" class="alert__actions"><slot name="actions" /></div>
    </div>
    <M3IconButton
      v-if="props.dismissible"
      :icon="IconClose"
      label="关闭提示"
      size="sm"
      class="alert__close"
      @click="emit('dismiss')"
    />
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-medium);
  animation: md-fade-up var(--md-sys-motion-duration-medium2)
    var(--md-sys-motion-easing-emphasized-decelerate) both;
}

.alert--compact {
  padding-block: 8px;
}

.alert__icon {
  margin-block-start: 2px;
}

.alert__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert__title {
  margin: 0;
}

.alert__body {
  line-height: 1.6;
}

.alert__body :deep(p) {
  margin: 0;
}

.alert__body :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.alert__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 6px;
  margin-inline-start: -8px;
}

.alert__close {
  margin: -4px -8px -4px 0;
}

/* ---------- 语义配色 ---------- */
.alert--error {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.alert--success {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.alert--warning {
  background-color: color-mix(in srgb, var(--md-sys-color-tertiary-container) 88%, transparent);
  color: var(--md-sys-color-on-tertiary-container);
}

.alert--info {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.alert--neutral {
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface-variant);
}

.alert--success .alert__icon {
  color: var(--md-sys-color-primary);
}

.alert--warning .alert__icon {
  color: var(--md-sys-color-tertiary);
}
</style>
