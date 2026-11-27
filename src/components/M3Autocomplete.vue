<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { IconComponent } from '../icons'
import { IconClose } from '../icons'
import M3IconButton from './M3IconButton.vue'
import M3FieldShell from './_M3Field.vue'
import { useAnchoredPanel } from '../composables/usePopupPosition'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'

/**
 * 自动完成：可输入筛选的下拉，v-model 存的是选项值。
 *
 * 与 M3Select 的分工：Select 是「从固定列表里挑」，Autocomplete 是
 * 「先打几个字把候选缩到几条」。所以这里保留输入框，选中后回填标签，
 * 失焦时把没选中的草稿退回已选项 —— 否则输入框里会留着一个不存在的选项。
 *
 * 面板用 pointerdown 而不是 click 选择：click 会在 input 先失焦之后才触发，
 * 面板那时已经被卸载了。
 */
export interface AutocompleteOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 选中的值（v-model）；null 表示未选。 */
    modelValue: string | number | null
    options: AutocompleteOption[]
    label: string
    variant?: 'filled' | 'outlined'
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    icon?: IconComponent | null
    /** 显示清空按钮。 */
    clearable?: boolean
    /** 自定义匹配；默认匹配 label 与 description。 */
    filter?: (option: AutocompleteOption, query: string) => boolean
    loading?: boolean
    emptyText?: string
    ariaLabel?: string
  }>(),
  {
    variant: 'filled',
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    icon: null,
    clearable: true,
    filter: undefined,
    loading: false,
    emptyText: '没有匹配项',
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  /** 每次输入都发一次，供远程搜索使用。 */
  search: [query: string]
}>()

const uid = useId()
const listId = uid + '-list'
const wrapper = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const focused = ref(false)
const query = ref('')
const activeIndex = ref(0)

const selected = computed(() => props.options.find((option) => option.value === props.modelValue))

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.options
  if (props.filter) return props.options.filter((option) => props.filter!(option, keyword))
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(keyword) ||
      (option.description?.toLowerCase().includes(keyword) ?? false),
  )
})

const { style: panelStyle } = useAnchoredPanel(wrapper, panelRef, open, {
  matchWidth: true,
  gap: 4,
})

watch(
  () => props.modelValue,
  () => {
    if (focused.value) return
    query.value = selected.value?.label ?? ''
  },
  { immediate: true },
)

watch(open, async (value) => {
  if (!value) return
  await nextTick()
  activeIndex.value = Math.max(0, filtered.value.findIndex((option) => option.value === props.modelValue))
})

watch(query, (value) => emit('search', value))

function openPanel(): void {
  if (props.disabled || open.value) return
  open.value = true
}

function closePanel(): void {
  if (!open.value) return
  open.value = false
}

/* 草稿没选中任何项时退回已选项的标签，别留一个不存在的值 */
useEscapeStack(open, () => {
  query.value = selected.value?.label ?? ''
  closePanel()
})
useClickOutsideWhen(open, [wrapper, panelRef], () => {
  focused.value = false
  closePanel()
})

function choose(option: AutocompleteOption): void {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  query.value = option.label
  closePanel()
  nextTick(() => inputEl.value?.focus())
}

function clear(): void {
  emit('update:modelValue', null)
  query.value = ''
  nextTick(() => inputEl.value?.focus())
}

function onInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
  openPanel()
  activeIndex.value = 0
}

function onFocus(): void {
  focused.value = true
  openPanel()
  /*
   * 聚焦时全选已有文本：输入框里躺着一个完整选项时，
   * 用户继续打字几乎总是想「换一个」而不是「把它接长」。
   */
  nextTick(() => inputEl.value?.select())
}

function onBlur(): void {
  focused.value = false
  closePanel()
  // 草稿没选中任何项：退回已选项的标签，别留一个不存在的值
  query.value = selected.value?.label ?? ''
}

function move(delta: number): void {
  const total = filtered.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) openPanel()
      else move(1)
      return
    case 'ArrowUp':
      event.preventDefault()
      if (!open.value) openPanel()
      else move(-1)
      return
    case 'Enter': {
      if (!open.value) return
      event.preventDefault()
      const option = filtered.value[activeIndex.value]
      if (option) choose(option)
      return
    }
    case 'Tab':
      closePanel()
      return
  }
}

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

<template>
  <div ref="wrapper" class="md-autocomplete">
    <M3FieldShell
      :label="label"
      :variant="variant"
      :floating="focused || query.length > 0"
      :focused="focused || open"
      :error="error"
      :hint="hint"
      :disabled="disabled"
      :leading-icon="icon"
      :has-trailing="clearable && modelValue !== null"
      :label-for="uid"
    >
      <input
        :id="uid"
        ref="inputEl"
        class="md-autocomplete__input"
        type="text"
        role="combobox"
        autocomplete="off"
        :aria-label="ariaLabel ?? label"
        :aria-expanded="open"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-activedescendant="open && filtered[activeIndex] ? listId + '-' + activeIndex : undefined"
        :value="query"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <template v-if="clearable && modelValue !== null" #trailing>
        <M3IconButton :icon="IconClose" label="清空" size="sm" variant="standard" @click="clear" />
      </template>
    </M3FieldShell>

    <Teleport to="body">
      <Transition name="md-pop">
        <ul
          v-if="open"
          :id="listId"
          ref="panelRef"
          class="md-panel md-panel--flush md-autocomplete__panel"
          role="listbox"
          :aria-label="label"
          :style="panelStyle"
        >
          <li
            v-for="(option, index) in filtered"
            :id="listId + '-' + index"
            :key="option.value"
            class="md-panel-option"
            :class="{
              'is-active': index === activeIndex,
              'is-selected': option.value === modelValue,
              'is-disabled': option.disabled,
            }"
            role="option"
            :aria-selected="option.value === modelValue"
            @pointerdown.prevent="choose(option)"
            @pointerenter="activeIndex = index"
          >
            <span class="md-autocomplete__option-text">
              <span class="md-autocomplete__option-label">{{ option.label }}</span>
              <span v-if="option.description" class="md-autocomplete__option-desc">{{ option.description }}</span>
            </span>
          </li>

          <li v-if="filtered.length === 0" class="md-autocomplete__empty" role="presentation">
            {{ loading ? '正在搜索…' : emptyText }}
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.md-autocomplete {
  display: block;
  min-width: 0;
}

.md-autocomplete__input {
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  caret-color: var(--md-sys-color-primary);
}

.md-autocomplete__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-autocomplete__panel {
  padding-block: 8px;
}

.md-autocomplete__option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.md-autocomplete__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-autocomplete__option-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-autocomplete__empty {
  padding: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  text-align: center;
}

.md-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
  transform-origin: top center;
}

.md-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  transform-origin: top center;
}

.md-pop-enter-from,
.md-pop-leave-to {
  opacity: 0;
  scale: 0.97;
}

@media (prefers-reduced-motion: reduce) {
  .md-pop-enter-from,
  .md-pop-leave-to {
    scale: 1;
  }
}
</style>
