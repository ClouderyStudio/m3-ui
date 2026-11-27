<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { IconComponent } from '../icons'
import { IconChevronLeft, IconClose, IconSearch } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * 顶栏里的搜索：默认显示标题 + 放大镜，点开后在原位展开成输入框。
 *
 * 用「原位展开」而不是跳转到新页面：用户对标题栏的注意力是连续的，
 * 展开/收起两个状态都在同一块区域，才不会有页面被替换掉的错觉。
 * Esc 收起并保留输入内容（很多人是先搜一半再回去看）。
 */
const props = withDefaults(
  defineProps<{
    title: string
    /** 搜索词（v-model）。 */
    modelValue: string
    placeholder?: string
    subtitle?: string
    icon?: IconComponent | null
    /** 外部控制展开状态（v-model:open）；不传则自己管。 */
    open?: boolean
    disableSubmit?: boolean
  }>(),
  { placeholder: '搜索', subtitle: undefined, icon: null, open: undefined, disableSubmit: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [open: boolean]
  search: [value: string]
  close: []
}>()

const innerOpen = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const expanded = computed(() => props.open ?? innerOpen.value)

async function expand(): Promise<void> {
  if (props.open === undefined) innerOpen.value = true
  emit('update:open', true)
  await nextTick()
  inputEl.value?.focus()
}

function collapse(): void {
  if (props.open === undefined) innerOpen.value = false
  emit('update:open', false)
  emit('close')
}

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    collapse()
    return
  }
  if (event.key !== 'Enter' || props.disableSubmit) return
  event.preventDefault()
  emit('search', props.modelValue)
}

function clear(): void {
  emit('update:modelValue', '')
  nextTick(() => inputEl.value?.focus())
}
</script>

<template>
  <header class="md-app-bar" :class="{ 'is-searching': expanded }">
    <div class="md-app-bar__bar">
      <template v-if="!expanded">
        <M3IconButton :icon="IconSearch" label="搜索" @click="expand" />
        <div class="md-app-bar__titles">
          <h1 class="md-app-bar__title">{{ title }}</h1>
          <p v-if="subtitle" class="md-app-bar__subtitle">{{ subtitle }}</p>
        </div>
        <div class="md-app-bar__actions"><slot name="actions" /></div>
      </template>

      <template v-else>
        <M3IconButton :icon="IconChevronLeft" label="收起搜索" @click="collapse" />

        <div class="md-app-bar__field">
          <M3Icon :icon="icon ?? IconSearch" :size="20" class="md-app-bar__field-icon" />
          <input
            ref="inputEl"
            class="md-app-bar__input"
            type="search"
            :value="modelValue"
            :placeholder="placeholder"
            :aria-label="placeholder"
            @input="onInput"
            @keydown="onKeydown"
          />
          <M3IconButton
            v-if="modelValue"
            :icon="IconClose"
            label="清除"
            size="sm"
            @click="clear"
          />
        </div>
      </template>
    </div>
  </header>
</template>

<style scoped>
.md-app-bar {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-block-end: 1px solid transparent;
  font-family: var(--md-ref-typeface-plain);
}

.md-app-bar__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 64px;
  padding-inline: 4px 8px;
}

.md-app-bar__titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.md-app-bar__title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  font-weight: var(--md-sys-typescale-title-large-weight);
}

.md-app-bar__subtitle {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-app-bar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* 展开态：输入框是一枚 48dp 的胶囊，占满标题的位置 */
.md-app-bar__field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 48px;
  padding-inline: 12px 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
}

.md-app-bar__field-icon {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-app-bar__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  caret-color: var(--md-sys-color-primary);
}

.md-app-bar__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

/* 原生 search 的清除按钮由我们自己画，隐藏浏览器那只 */
.md-app-bar__input::-webkit-search-cancel-button {
  display: none;
}
</style>
