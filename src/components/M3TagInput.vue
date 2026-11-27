<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import type { IconComponent } from '../icons'
import M3Chip from './M3Chip.vue'
import M3FieldShell from './_M3Field.vue'

/**
 * 标签输入：输入回车/逗号成 chip，退格删最后一个。
 *
 * 交互上最容易出错的两处：
 *   - 失焦时把半截文字提交，而不是静默丢掉（用户以为已经加了）；
 *   - 退格只有在输入框为空时才删 chip，否则删的是自己刚打的字。
 *
 * 重复标签默认被忽略而不是报错：这一类输入里「又打了一遍」几乎都是手滑。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string[]
    label: string
    placeholder?: string
    variant?: 'filled' | 'outlined'
    /** 上限；到顶后输入框不再接受新标签。 */
    max?: number
    allowDuplicates?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    icon?: IconComponent | null
    /** 除回车外也接受的分隔键。 */
    separators?: string[]
  }>(),
  {
    placeholder: '',
    variant: 'filled',
    max: undefined,
    allowDuplicates: false,
    disabled: false,
    error: '',
    hint: '',
    icon: null,
    separators: () => [',', '，'],
  },
)

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  add: [tag: string]
  remove: [tag: string]
}>()

const uid = useId()
const inputEl = ref<HTMLInputElement | null>(null)
const draft = ref('')
const focused = ref(false)

const full = computed(() => props.max !== undefined && props.modelValue.length >= props.max)
const floating = computed(
  () => focused.value || props.modelValue.length > 0 || draft.value.length > 0,
)

function add(raw: string): void {
  const tag = raw.trim()
  draft.value = ''
  if (!tag || full.value) return
  if (!props.allowDuplicates && props.modelValue.includes(tag)) return
  emit('update:modelValue', [...props.modelValue, tag])
  emit('add', tag)
}

function remove(tag: string): void {
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== tag))
  emit('remove', tag)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || props.separators.includes(event.key)) {
    event.preventDefault()
    add(draft.value)
    return
  }
  if (event.key === 'Backspace' && draft.value === '' && props.modelValue.length > 0) {
    event.preventDefault()
    remove(props.modelValue[props.modelValue.length - 1] as string)
  }
}

function onBlur(): void {
  focused.value = false
  if (draft.value.trim()) add(draft.value)
}

function focus(): void {
  nextTick(() => inputEl.value?.focus())
}

defineExpose({ focus })
</script>

<template>
  <M3FieldShell
    :label="label"
    :variant="variant"
    :floating="floating"
    :focused="focused"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :leading-icon="icon"
    :label-for="uid"
  >
    <div class="md-tag-input" @click="focus">
      <M3Chip
        v-for="tag in modelValue"
        :key="tag"
        :label="tag"
        variant="input"
        :disabled="disabled"
        @remove="remove(tag)"
      />

      <input
        :id="uid"
        ref="inputEl"
        v-model="draft"
        class="md-tag-input__input"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        :disabled="disabled || full"
        :aria-invalid="error ? 'true' : undefined"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="onBlur"
      />
    </div>
  </M3FieldShell>
</template>

<style scoped>
.md-tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding-block: 6px;
  cursor: text;
}

.md-tag-input__input {
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
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  caret-color: var(--md-sys-color-primary);
}

.md-tag-input__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

/* 外壳里塞了 chip：控制区要允许换行，聚焦时的内边距也要跟着长 */
:deep(.md-field__control) {
  flex-wrap: wrap;
  padding-block-start: 8px;
}

:deep(.md-field.is-floating .md-field__control) {
  padding-block-start: 18px;
}
</style>
