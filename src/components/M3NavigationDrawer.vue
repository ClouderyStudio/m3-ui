<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IconComponent } from '../icons'
import { IconClose } from '../icons'
import M3Badge from './M3Badge.vue'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import { useModal } from '../composables/useModal'

/**
 * 导航抽屉：整页的目的地列表，可作常驻侧栏，也可作模态抽屉。
 *
 * 模态版本复用 useModal（滚动锁 / 焦点陷阱 / Esc / 焦点归还），
 * 常驻版本不挂任何浮层行为 —— 同一个组件两种用法，样式只写一份。
 * 分组信息用 group 字段表达，而不是要求调用方自己拼标题。
 */
export interface DrawerItem {
  value: string
  label: string
  icon?: IconComponent | null
  badge?: string | number | null
  disabled?: boolean
  /** 分组标题；相邻同组项会排在一起。 */
  group?: string
}

const props = withDefaults(
  defineProps<{
    /** 选中的目的地（v-model）。 */
    modelValue: string
    items: DrawerItem[]
    /** 模态抽屉是否展开（v-model:open）。 */
    open?: boolean
    modal?: boolean
    title?: string
    subtitle?: string
    width?: number
    ariaLabel?: string
  }>(),
  {
    open: undefined,
    modal: true,
    title: undefined,
    subtitle: undefined,
    width: 320,
    ariaLabel: '导航',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [open: boolean]
}>()

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => (props.modal ? Boolean(props.open) : true))

useModal(isOpen, panelRef, {
  onClose: () => emit('update:open', false),
  restoreFocus: props.modal,
})

const groups = computed(() => {
  const map = new Map<string, DrawerItem[]>()
  for (const item of props.items) {
    const key = item.group ?? ''
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return [...map.entries()]
})

function select(item: DrawerItem): void {
  if (item.disabled) return
  emit('update:modelValue', item.value)
  if (props.modal) emit('update:open', false)
}
</script>

<template>
  <Teleport v-if="modal" to="body">
    <Transition name="md-drawer-fade">
      <div v-if="open" class="md-scrim md-drawer__scrim" @click.self="emit('update:open', false)" />
    </Transition>

    <Transition name="md-drawer-slide">
      <aside
        v-if="open"
        ref="panelRef"
        class="md-drawer md-drawer--modal"
        :style="{ width: width + 'px' }"
        role="dialog"
        aria-modal="true"
        :aria-label="title || ariaLabel"
        tabindex="-1"
      >
        <header class="md-drawer__header">
          <div class="md-drawer__titles">
            <h2 v-if="title" class="md-drawer__title">{{ title }}</h2>
            <p v-if="subtitle" class="md-drawer__subtitle">{{ subtitle }}</p>
          </div>
          <M3IconButton :icon="IconClose" label="关闭导航" variant="standard" @click="emit('update:open', false)" />
        </header>

        <nav class="md-drawer__nav" :aria-label="ariaLabel">
          <template v-for="[group, list] in groups" :key="group">
            <p v-if="group" class="md-drawer__group">{{ group }}</p>
            <button
              v-for="item in list"
              :key="item.value"
              type="button"
              class="md-drawer__item"
              :class="{ 'is-active': item.value === modelValue, 'is-disabled': item.disabled }"
              :aria-current="item.value === modelValue ? 'page' : undefined"
              :disabled="item.disabled"
              @click="select(item)"
            >
              <M3Badge :value="item.badge ?? null" class="md-drawer__badge">
                <M3Icon v-if="item.icon" :icon="item.icon" :size="24" class="md-drawer__icon" />
              </M3Badge>
              <span class="md-drawer__label">{{ item.label }}</span>
            </button>
          </template>
        </nav>

        <div v-if="$slots.footer" class="md-drawer__footer"><slot name="footer" /></div>
      </aside>
    </Transition>
  </Teleport>

  <aside
    v-else
    class="md-drawer md-drawer--standard"
    :style="{ width: width + 'px' }"
    :aria-label="title || ariaLabel"
  >
    <header class="md-drawer__header">
      <div class="md-drawer__titles">
        <h2 v-if="title" class="md-drawer__title">{{ title }}</h2>
        <p v-if="subtitle" class="md-drawer__subtitle">{{ subtitle }}</p>
      </div>
    </header>

    <nav class="md-drawer__nav" :aria-label="ariaLabel">
      <template v-for="[group, list] in groups" :key="group">
        <p v-if="group" class="md-drawer__group">{{ group }}</p>
        <button
          v-for="item in list"
          :key="item.value"
          type="button"
          class="md-drawer__item"
          :class="{ 'is-active': item.value === modelValue, 'is-disabled': item.disabled }"
          :aria-current="item.value === modelValue ? 'page' : undefined"
          :disabled="item.disabled"
          @click="select(item)"
        >
          <M3Badge :value="item.badge ?? null" class="md-drawer__badge">
            <M3Icon v-if="item.icon" :icon="item.icon" :size="24" class="md-drawer__icon" />
          </M3Badge>
          <span class="md-drawer__label">{{ item.label }}</span>
        </button>
      </template>
    </nav>

    <div v-if="$slots.footer" class="md-drawer__footer"><slot name="footer" /></div>
  </aside>
</template>

<style scoped>
.md-drawer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: calc(100vw - 56px);
  height: 100%;
  padding: 12px;
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
  overflow-y: auto;
}

.md-drawer--modal {
  position: fixed;
  z-index: 420;
  inset-block: 0;
  inset-inline-start: 0;
  border-start-end-radius: var(--md-sys-shape-corner-large);
  border-end-end-radius: var(--md-sys-shape-corner-large);
  box-shadow: var(--md-sys-elevation-level1);
}

.md-drawer--modal:focus {
  outline: none;
}

.md-drawer__scrim {
  z-index: 410;
}

.md-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px 12px 12px;
}

.md-drawer__titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.md-drawer__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-small-size);
  line-height: var(--md-sys-typescale-title-small-line-height);
  font-weight: var(--md-sys-typescale-title-small-weight);
}

.md-drawer__subtitle {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.md-drawer__group {
  margin: 12px 0 4px;
  padding-inline: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.md-drawer__item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding-inline: 16px 24px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-drawer__item:hover:not(:disabled):not(.is-active) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-drawer__item.is-active {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.md-drawer__icon {
  color: inherit;
}

.md-drawer__label {
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.md-drawer__item.is-disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-drawer__footer {
  margin-block-start: auto;
  padding-block-start: 12px;
}

.md-drawer-fade-enter-active,
.md-drawer-fade-leave-active {
  transition: opacity var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-drawer-fade-enter-from,
.md-drawer-fade-leave-to {
  opacity: 0;
}

.md-drawer-slide-enter-active {
  transition: translate var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-drawer-slide-leave-active {
  transition: translate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-drawer-slide-enter-from,
.md-drawer-slide-leave-to {
  translate: -100% 0;
}

@media (prefers-reduced-motion: reduce) {
  .md-drawer-slide-enter-from,
  .md-drawer-slide-leave-to {
    translate: 0 0;
  }
}
</style>
