<script setup lang="ts">
import { computed, nextTick, ref, useId, useSlots } from 'vue'
import { IconClose, IconSearch } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'

/**
 * MD3 search bar。
 *
 * 与 M3TextField 的区别在「用途」而不是外观：search bar 是 56dp 的整圆胶囊，
 * 默认带搜索图标、聚焦后把建议列表以浮层形式接在下面。
 * 不聚焦时也能承载一条建议（slot），适合放到页面顶部当入口。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    /** Show a spinner in place of the clear button while the query is in flight. */
    loading?: boolean
    autofocus?: boolean
    name?: string
    /** Force the suggestion panel; by default it opens on focus (and only if there is a slot). */
    open?: boolean
    /** Hide the leading search glyph when the bar sits inside another search surface. */
    hideIcon?: boolean
  }>(),
  {
    placeholder: '搜索',
    ariaLabel: '搜索',
    disabled: false,
    loading: false,
    autofocus: false,
    name: undefined,
    open: undefined,
    hideIcon: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
  clear: []
  focus: []
  blur: []
}>()

const slots = useSlots()
const uid = useId()
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)

const hasSuggestions = computed(() => Boolean(slots.suggestions))
const showSuggestions = computed(
  () => hasSuggestions.value && (props.open ?? focused.value) && !props.disabled,
)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('submit', props.modelValue)
    return
  }
  if (event.key === 'Escape') {
    if (showSuggestions.value) {
      event.preventDefault()
      inputRef.value?.blur()
    }
  }
}

function onFocus(): void {
  focused.value = true
  emit('focus')
}

function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  if (next && rootRef.value?.contains(next)) return
  focused.value = false
  emit('blur')
}

function clear(): void {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => inputRef.value?.focus())
}

/*
 * 点击建议项时不要先把焦点从 input 上拿走：
 * mousedown 一 preventDefault，blur 就不会发生，建议列表不会在 click 之前被卸载。
 * 只对可点的建议项生效，滚动条拖拽不受影响。
 */
function onSuggestionsMouseDown(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, a, [role="option"]')) event.preventDefault()
}

const suggestionsId = uid + '-suggestions'
</script>

<template>
  <div
    ref="rootRef"
    class="md-search-bar"
    :class="{ 'is-focused': focused, 'is-disabled': disabled, 'has-suggestions': showSuggestions }"
    @focusout="onFocusOut"
  >
    <span v-if="!hideIcon" class="md-search-bar__leading">
      <slot name="leading"><M3Icon :icon="IconSearch" :size="24" /></slot>
    </span>

    <input
      ref="inputRef"
      class="md-search-bar__input md-typescale-body-large"
      type="search"
      role="combobox"
      aria-autocomplete="list"
      :aria-label="ariaLabel"
      :aria-expanded="showSuggestions"
      :aria-controls="showSuggestions ? suggestionsId : undefined"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autofocus="autofocus"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
    />

    <span v-if="loading" class="md-search-bar__spinner" aria-hidden="true" />

    <M3IconButton
      v-else-if="modelValue && !disabled"
      :icon="IconClose"
      label="清空搜索"
      size="sm"
      variant="standard"
      class="md-search-bar__clear"
      @click="clear"
    />

    <span v-if="$slots.trailing" class="md-search-bar__trailing"><slot name="trailing" /></span>

    <div
      v-if="showSuggestions"
      :id="suggestionsId"
      class="md-search-bar__suggestions"
      role="listbox"
      @mousedown="onSuggestionsMouseDown"
    >
      <slot name="suggestions" :query="modelValue" />
    </div>
  </div>
</template>

<style scoped>
.md-search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding-inline: 16px 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
}

.md-search-bar.is-focused {
  box-shadow: var(--md-sys-elevation-level1);
}

.md-search-bar__leading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-search-bar.is-focused .md-search-bar__leading {
  color: var(--md-sys-color-primary);
}

.md-search-bar__input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  caret-color: var(--md-sys-color-primary);
  appearance: none;
}

/* 去掉 WebKit 给 type=search 的默认清除按钮，我们用 M3IconButton */
.md-search-bar__input::-webkit-search-cancel-button {
  display: none;
}

.md-search-bar__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-search-bar__input:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}

.md-search-bar__clear {
  margin-inline-end: 0;
}

.md-search-bar__trailing {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.md-search-bar__spinner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 2px solid var(--md-sys-color-primary);
  border-right-color: transparent;
  border-radius: var(--md-sys-shape-corner-full);
  animation: md-search-bar-spin 640ms linear infinite;
}

@keyframes md-search-bar-spin {
  to {
    transform: rotate(360deg);
  }
}

.md-search-bar__suggestions {
  position: absolute;
  z-index: 130;
  inset-inline: 0;
  inset-block-start: calc(100% + 8px);
  padding-block: 8px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2);
  overflow: hidden auto;
  max-height: min(360px, calc(100dvh - 160px));
  overscroll-behavior: contain;
  animation: md-fade-in var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard) both;
}

@media (prefers-reduced-motion: reduce) {
  .md-search-bar__spinner {
    animation-duration: 1400ms;
  }
}
</style>
