<script setup lang="ts">
import { computed, ref } from 'vue'
import M3Button from './M3Button.vue'
import { useModal } from '../composables/useModal'

/**
 * 选择器的模态外壳（日期 / 时间 / 区间在移动端用）。
 *
 * 桌面用贴附在输入框下方的 docked 面板；窄屏弹模态 —— 手机上贴着输入框的浮层
 * 会被软键盘顶到屏幕外。这里复用 useModal：滚动锁、焦点陷阱、Esc 都是同一份。
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  { title: '', confirmLabel: '确定', cancelLabel: '取消' },
)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = computed(() => props.modelValue)
const panelRef = ref<HTMLElement | null>(null)

function cancel(): void {
  emit('update:modelValue', false)
  emit('cancel')
}

useModal(isOpen, panelRef, { onClose: cancel })
</script>

<template>
  <Teleport to="body">
    <Transition name="md-picker-fade">
      <div v-if="modelValue" class="md-scrim md-picker__scrim" @click.self="cancel" />
    </Transition>

    <Transition name="md-picker-pop">
      <div
        v-if="modelValue"
        ref="panelRef"
        class="md-picker"
        role="dialog"
        aria-modal="true"
        :aria-label="title || '选择'"
        tabindex="-1"
      >
        <h2 v-if="title" class="md-picker__title">{{ title }}</h2>
        <div class="md-picker__body"><slot /></div>
        <footer class="md-picker__actions">
          <M3Button variant="text" @click="cancel">{{ cancelLabel }}</M3Button>
          <M3Button @click="emit('confirm')">{{ confirmLabel }}</M3Button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-picker__scrim {
  z-index: 410;
}

.md-picker {
  position: fixed;
  z-index: 420;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: min(680px, calc(100vw - 32px));
  max-height: calc(100dvh - 48px);
  overflow: auto;
  padding: 20px 20px 12px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
  font-family: var(--md-ref-typeface-plain);
}

.md-picker:focus {
  outline: none;
}

.md-picker__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  font-weight: var(--md-sys-typescale-title-large-weight);
}

.md-picker__body {
  display: flex;
  justify-content: center;
  min-height: 0;
}

.md-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.md-picker-fade-enter-active,
.md-picker-fade-leave-active {
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-picker-fade-enter-from,
.md-picker-fade-leave-to {
  opacity: 0;
}

.md-picker-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-picker-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-picker-pop-enter-from,
.md-picker-pop-leave-to {
  opacity: 0;
  scale: 0.96;
}

@media (max-width: 560px) {
  .md-picker {
    inset-block-start: auto;
    inset-block-end: 0;
    inset-inline: 0;
    translate: none;
    max-width: none;
    border-start-start-radius: var(--md-sys-shape-corner-extra-large);
    border-start-end-radius: var(--md-sys-shape-corner-extra-large);
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
}
</style>
