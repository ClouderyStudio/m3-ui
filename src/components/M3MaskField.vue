<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { IconComponent } from '../icons'
import M3FieldShell from './_M3Field.vue'

/**
 * 掩码输入（电话、卡号、证件号、日期）。
 *
 * 掩码用模板字符串描述：# 占数字位，A 占字母位，* 占字母或数字，其它字符是固定分隔符。
 * 例：###-####-####、AAAA-####、(###) ###-####。
 *
 * 两个刻意的取舍：
 *   - 光标固定落在末尾。做「光标跟随重排」需要在每次输入后重算插入位置，
 *     而输入法、粘贴、选区替换会让这件事变得极其脆弱；掩码输入本来就短，
 *     末尾输入覆盖了绝大多数场景。
 *   - 分隔符由掩码自动补，用户不需要自己打 -；手动输入的分隔符会被忽略。
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    /** 掩码模板：# 数字、A 字母、* 两者皆可。 */
    mask?: string
    /** 只允许这些字符（正则字符集，如 '0-9a-f'），与 mask 二选一。 */
    pattern?: string
    variant?: 'filled' | 'outlined'
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    icon?: IconComponent | null
    inputmode?: 'text' | 'numeric' | 'tel'
  }>(),
  {
    mask: '#### #### #### ####',
    pattern: undefined,
    variant: 'filled',
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    icon: null,
    inputmode: 'text',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>()

const uid = useId()
const focused = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

const patternRegExp = computed(() => {
  if (!props.pattern) return null
  try {
    return new RegExp('[' + props.pattern + ']')
  } catch {
    return null
  }
})

function accepts(char: string): boolean {
  if (patternRegExp.value) return patternRegExp.value.test(char)
  return true
}

function tokenMatches(token: string, char: string): boolean {
  if (token === '#') return /\d/.test(char)
  if (token === 'A') return /[a-zA-Z]/.test(char)
  if (token === '*') return /[a-zA-Z0-9]/.test(char)
  return false
}

/** 把任意输入按掩码收敛；多余的字符直接丢掉。 */
function applyMask(raw: string): string {
  const mask = props.mask
  if (!mask) {
    return raw
      .split('')
      .filter((char) => accepts(char))
      .join('')
  }

  const input = raw.split('').filter((char) => accepts(char))
  let out = ''
  let cursor = 0

  for (const token of mask) {
    if (cursor >= input.length) break
    const isSlot = token === '#' || token === 'A' || token === '*'

    if (isSlot) {
      // 跳过填不进这一位的字符（例如用户手打的分隔符）
      while (cursor < input.length && !tokenMatches(token, input[cursor] as string)) cursor += 1
      if (cursor >= input.length) break
      out += input[cursor]
      cursor += 1
      continue
    }

    if (input[cursor] === token) cursor += 1
    out += token
  }

  return out
}

const unmasked = computed(() => props.modelValue.replace(/[^a-zA-Z0-9]/g, ''))

const slotCount = computed(() => {
  const mask = props.mask
  if (!mask) return 0
  return [...mask].filter((token) => token === '#' || token === 'A' || token === '*').length
})

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const next = applyMask(input.value)
  input.value = next
  if (next !== props.modelValue) emit('update:modelValue', next)
  if (slotCount.value > 0 && next.replace(/[^a-zA-Z0-9]/g, '').length >= slotCount.value) {
    emit('complete', next)
  }
}

function focus(): void {
  inputEl.value?.focus()
}

defineExpose({ focus, unmasked })
</script>

<template>
  <M3FieldShell
    :label="label"
    :variant="variant"
    :floating="focused || modelValue.length > 0"
    :focused="focused"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :leading-icon="icon"
    :label-for="uid"
  >
    <input
      :id="uid"
      ref="inputEl"
      class="md-mask__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :inputmode="inputmode"
      :aria-invalid="error ? 'true' : undefined"
      autocomplete="off"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
    />
  </M3FieldShell>
</template>

<style scoped>
.md-mask__input {
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
  font-variant-numeric: tabular-nums;
  caret-color: var(--md-sys-color-primary);
}

.md-mask__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-mask__input:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}
</style>
