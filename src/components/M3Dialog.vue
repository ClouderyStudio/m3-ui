<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { IconComponent } from '../icons'
import { useModal } from '../composables/useModal'
import M3Icon from './M3Icon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    /** Optional hero icon above the headline (MD3 "icon" dialog). */
    icon?: IconComponent | null
    /** Allow dismissal by scrim click or Escape. */
    dismissible?: boolean
    ariaLabel?: string
    /** Dialog width: 360dp / 560dp / 800dp. */
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { title: undefined, icon: null, dismissible: true, ariaLabel: undefined, size: 'md' },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const panelRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.modelValue)
const titleId = useId()

useModal(isOpen, panelRef, {
  onClose: () => {
    if (props.dismissible) emit('update:modelValue', false)
  },
})
</script>

<template>
  <Teleport to="body">
    <Transition name="md-scrim">
      <div
        v-if="modelValue"
        class="md-scrim"
        @click="dismissible && emit('update:modelValue', false)"
      />
    </Transition>

    <Transition name="md-dialog-pop">
      <div
        v-if="modelValue"
        ref="panelRef"
        class="md-dialog"
        :class="'md-dialog--' + size"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="title ? undefined : (ariaLabel ?? '对话框')"
        tabindex="-1"
      >
        <div v-if="icon" class="md-dialog__icon">
          <M3Icon :icon="icon" :size="24" />
        </div>

        <h2 v-if="title" :id="titleId" class="md-dialog__headline md-typescale-headline-small">{{ title }}</h2>

        <div class="md-dialog__body md-typescale-body-medium"><slot /></div>

        <div v-if="$slots.actions" class="md-dialog__actions"><slot name="actions" /></div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-dialog {
  position: fixed;
  z-index: 240;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: -50% -50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(560px, calc(100vw - 48px));
  min-width: min(280px, calc(100vw - 48px));
  max-height: calc(100dvh - 48px);
  padding: 24px;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
  overflow: hidden;
}

.md-dialog:focus {
  outline: none;
}

.md-dialog--sm {
  width: min(360px, calc(100vw - 48px));
}
.md-dialog--lg {
  width: min(800px, calc(100vw - 48px));
}

.md-dialog__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-secondary);
}

.md-dialog__headline {
  margin: 0;
  text-align: center;
}

.md-dialog__icon + .md-dialog__headline {
  margin-block-start: -8px;
}

.md-dialog__body {
  color: var(--md-sys-color-on-surface-variant);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.md-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin: 8px -8px -8px 0;
}

@media (max-width: 480px) {
  .md-dialog__actions {
    flex-wrap: wrap;
  }
}

/*
 * 对话框：入场从下方 16px 升上来 + 从 0.92 放大到 1，
 * 出场反向且更快（short3），符合「进来要稳、出去要干脆」的一般观感。
 * 缩放中心保持在面板中心，所以用 translate 与 scale 组合而非 top 变化。
 */
.md-dialog-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    translate var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-dialog-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    translate var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-dialog-pop-enter-from {
  opacity: 0;
  translate: -50% calc(-50% + 16px);
  scale: 0.92;
}

.md-dialog-pop-leave-to {
  opacity: 0;
  translate: -50% calc(-50% + 8px);
  scale: 0.96;
}

@media (prefers-reduced-motion: reduce) {
  /* 削减：不缩放、不位移，只淡入淡出 */
  .md-dialog-pop-enter-from,
  .md-dialog-pop-leave-to {
    translate: -50% -50%;
    scale: 1;
  }
}
</style>
