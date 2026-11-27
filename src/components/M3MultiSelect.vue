<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { IconComponent } from '../icons'
import { IconCheck } from '../icons'
import M3Chip from './M3Chip.vue'
import M3Icon from './M3Icon.vue'
import M3FieldShell from './_M3Field.vue'
import { useAnchoredPanel } from '../composables/usePopupPosition'
import { useEscapeStack } from '../composables/useEscapeStack'
import { useClickOutsideWhen } from '../composables/useClickOutside'

/**
 * 多选：已选项以 chip 摆在输入框里，下拉勾选，v-model 是值数组。
 *
 * 勾选后面板**不关**：多选的意图通常是「再选一个」，
 * 每勾一次就收起等于逼用户重新打开。关闭靠 Esc、点外部或 Tab。
 */
export interface MultiSelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: (string | number)[]
    options: MultiSelectOption[]
    label: string
    variant?: 'filled' | 'outlined'
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    icon?: IconComponent | null
    /** 面板里是否提供筛选输入。 */
    filterable?: boolean
    /** 最多可选数量。 */
    max?: number
    emptyText?: string
  }>(),
  {
    variant: 'filled',
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    icon: null,
    filterable: true,
    max: undefined,
    emptyText: '没有可选项',
  },
)

const emit = defineEmits<{ 'update:modelValue': [values: (string | number)[]] }>()

const uid = useId()
const listId = uid + '-list'
const wrapper = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const focused = ref(false)
const query = ref('')
const activeIndex = ref(0)

const selectedSet = computed(() => new Set(props.modelValue))
const selectedOptions = computed(() =>
  props.modelValue
    .map((value) => props.options.find((option) => option.value === value))
    .filter((option): option is MultiSelectOption => Boolean(option)),
)

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(keyword) ||
      (option.description?.toLowerCase().includes(keyword) ?? false),
  )
})

const full = computed(() => props.max !== undefined && props.modelValue.length >= props.max)

const { style: panelStyle } = useAnchoredPanel(wrapper, panelRef, open, { matchWidth: true, gap: 4 })

watch(open, async (value) => {
  if (!value) return
  await nextTick()
  activeIndex.value = 0
})

function openPanel(): void {
  if (props.disabled || open.value) return
  open.value = true
}

function closePanel(): void {
  if (!open.value) return
  open.value = false
  query.value = ''
}

/* 输入框没有焦点（点到面板上）时也要能收起，Esc 走共享的栈 */
useEscapeStack(open, () => closePanel())
useClickOutsideWhen(open, [wrapper, panelRef], () => closePanel())

function toggle(option: MultiSelectOption): void {
  if (option.disabled) return
  if (selectedSet.value.has(option.value)) {
    emit('update:modelValue', props.modelValue.filter((value) => value !== option.value))
    return
  }
  if (full.value) return
  emit('update:modelValue', [...props.modelValue, option.value])
}

function remove(value: string | number): void {
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== value))
}

function move(delta: number): void {
  const total = filtered.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
}

function onFieldKeydown(event: KeyboardEvent): void {
  if (event.key === 'Backspace' && query.value === '' && props.modelValue.length > 0) {
    event.preventDefault()
    remove(props.modelValue[props.modelValue.length - 1] as string | number)
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) openPanel()
    else move(event.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (event.key === 'Enter') {
    if (!open.value) return
    event.preventDefault()
    const option = filtered.value[activeIndex.value]
    if (option) toggle(option)
    return
  }
  if (event.key === 'Tab') closePanel()
}

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

<template>
  <div ref="wrapper" class="md-multiselect">
    <M3FieldShell
      :label="label"
      :variant="variant"
      :floating="focused || modelValue.length > 0 || open"
      :focused="focused || open"
      :error="error"
      :hint="hint"
      :disabled="disabled"
      :leading-icon="icon"
      :label-for="uid"
    >
      <div class="md-multiselect__body" @click="inputEl?.focus()">
        <M3Chip
          v-for="option in selectedOptions"
          :key="option.value"
          :label="option.label"
          variant="input"
          :disabled="disabled"
          @remove="remove(option.value)"
        />

        <input
          :id="uid"
          ref="inputEl"
          v-model="query"
          class="md-multiselect__input"
          type="text"
          role="combobox"
          autocomplete="off"
          :aria-expanded="open"
          :aria-controls="listId"
          :aria-label="label"
          :placeholder="modelValue.length === 0 ? placeholder : ''"
          :disabled="disabled"
          @focus="focused = true; openPanel()"
          @blur="focused = false"
          @input="openPanel(); activeIndex = 0"
          @keydown="onFieldKeydown"
        />
      </div>
    </M3FieldShell>

    <Teleport to="body">
      <Transition name="md-pop">
        <ul
          v-if="open"
          :id="listId"
          ref="panelRef"
          class="md-panel md-panel--flush md-multiselect__panel"
          role="listbox"
          aria-multiselectable="true"
          :aria-label="label"
          :style="panelStyle"
        >
          <li
            v-for="(option, index) in filtered"
            :key="option.value"
            class="md-panel-option"
            :class="{
              'is-active': index === activeIndex,
              'is-selected': selectedSet.has(option.value),
              'is-disabled': option.disabled || (full && !selectedSet.has(option.value)),
            }"
            role="option"
            :aria-selected="selectedSet.has(option.value)"
            @pointerdown.prevent="toggle(option)"
            @pointerenter="activeIndex = index"
          >
            <span class="md-multiselect__check" aria-hidden="true">
              <M3Icon v-if="selectedSet.has(option.value)" :icon="IconCheck" :size="18" />
            </span>
            <span class="md-multiselect__option-text">
              <span class="md-multiselect__option-label">{{ option.label }}</span>
              <span v-if="option.description" class="md-multiselect__option-desc">{{ option.description }}</span>
            </span>
          </li>

          <li v-if="filtered.length === 0" class="md-multiselect__empty" role="presentation">
            {{ emptyText }}
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.md-multiselect {
  display: block;
  min-width: 0;
}

.md-multiselect__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding-block: 6px;
  cursor: text;
}

.md-multiselect__input {
  flex: 1 1 80px;
  min-width: 80px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  caret-color: var(--md-sys-color-primary);
}

.md-multiselect__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--md-sys-color-primary);
}

.md-multiselect__option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.md-multiselect__option-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-multiselect__option-desc {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-multiselect__panel {
  padding-block: 8px;
}

.md-multiselect__empty {
  padding: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  text-align: center;
}

:deep(.md-field__control) {
  flex-wrap: wrap;
  padding-block-start: 8px;
}

:deep(.md-field.is-floating .md-field__control) {
  padding-block-start: 18px;
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
