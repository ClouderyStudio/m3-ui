<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

/**
 * PIN / 验证码输入：一位一个格子。
 *
 * 键盘行为是这个组件唯一的难点，三件事必须同时成立：
 *   - 输入后自动前进，退格在空格子上先「退到前一格并删掉它」；
 *   - 粘贴整段验证码时一次铺满所有格子（短信/邮件的验证码都是整段复制来的）；
 *   - 用方向键能在格子之间走，不会把光标锁死在一格。
 *
 * 中间留空（用户点到了第 4 格）用 '\u0000' 占位，而不是靠字符串长度推断 ——
 * 否则 "12__56" 会被读成 "1256"，补位的空档就错位了。
 */
const props = withDefaults(
  defineProps<{
    /** 绑定的验证码（v-model）。 */
    modelValue: string
    /** 格子数量（groups 存在时忽略）。 */
    length?: number
    /** 分组布局，例如 [3, 5] 渲染成 ___ - _____；总长度由它求和得出。 */
    groups?: number[]
    /** 分组之间的分隔符。 */
    separator?: string
    /** 允许的字符集。 */
    type?: 'numeric' | 'alphanumeric'
    /** 掩码显示（密码模式）。 */
    masked?: boolean
    variant?: 'filled' | 'outlined'
    /** 错误文案；非空即进入错误态。 */
    error?: string
    hint?: string
    disabled?: boolean
    /** 挂载后自动聚焦第一格。 */
    autoFocus?: boolean
    /** 这一组格子的读屏名字。 */
    label?: string
  }>(),
  {
    length: 6,
    groups: undefined,
    separator: '-',
    type: 'numeric',
    masked: false,
    variant: 'filled',
    error: '',
    hint: '',
    disabled: false,
    autoFocus: false,
    label: '验证码',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
}>()

/** 空格子的占位符：保证「第几格是什么」不会因为空档而错位。 */
const EMPTY = '\u0000'

const total = computed(() =>
  props.groups?.length ? props.groups.reduce((sum, size) => sum + size, 0) : props.length,
)

/** 每组最后一格的索引，用来在这些格子后面插分隔符。 */
const groupEnds = computed(() => {
  const ends = new Set<number>()
  if (!props.groups?.length) return ends
  let sum = 0
  for (const size of props.groups.slice(0, -1)) {
    sum += size
    ends.add(sum - 1)
  }
  return ends
})

const inputs = ref<(HTMLInputElement | null)[]>([])

function setInput(el: Element | null, index: number): void {
  inputs.value[index] = el as HTMLInputElement | null
}

const allowed = computed(() => (props.type === 'numeric' ? /[0-9]/ : /[a-zA-Z0-9]/))

const chars = computed(() =>
  Array.from({ length: total.value }, (_, index) => {
    const char = props.modelValue[index]
    return char === undefined || char === EMPTY ? '' : char
  }),
)

function join(parts: string[]): string {
  let end = parts.length
  while (end > 0 && !parts[end - 1]) end--
  return parts
    .slice(0, end)
    .map((char) => char || EMPTY)
    .join('')
}

function commit(parts: string[]): void {
  const next = join(parts)
  emit('update:modelValue', next)
  if (next.length === total.value && !next.includes(EMPTY)) emit('complete', next)
}

function focusAt(index: number): void {
  nextTick(() => inputs.value[index]?.focus())
}

function onFocus(index: number): void {
  inputs.value[index]?.select()
}

function onInput(index: number, event: Event): void {
  const input = event.target as HTMLInputElement
  const char = input.value.slice(-1)

  if (char && !allowed.value.test(char)) {
    input.value = chars.value[index] ?? ''
    return
  }

  const parts = [...chars.value]
  parts[index] = char
  commit(parts)

  if (char && index < total.value - 1) focusAt(index + 1)
}

function onKeydown(index: number, event: KeyboardEvent): void {
  if (event.key === 'Backspace' && !chars.value[index] && index > 0) {
    event.preventDefault()
    const parts = [...chars.value]
    parts[index - 1] = ''
    commit(parts)
    focusAt(index - 1)
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusAt(index - 1)
  } else if (event.key === 'ArrowRight' && index < total.value - 1) {
    event.preventDefault()
    focusAt(index + 1)
  }
}

function onPaste(index: number, event: ClipboardEvent): void {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '')
    .split('')
    .filter((char) => allowed.value.test(char))
  if (pasted.length === 0) return

  const parts = [...chars.value]
  let cursor = index
  for (const char of pasted) {
    if (cursor >= total.value) break
    parts[cursor] = char
    cursor++
  }
  commit(parts)
  focusAt(Math.min(cursor, total.value - 1))
}

watch(
  () => props.autoFocus,
  (value) => {
    if (value) focusAt(0)
  },
  { immediate: true },
)
</script>

<template>
  <div class="md-pin">
    <div
      role="group"
      :aria-label="label"
      class="md-pin__row"
      :class="['md-pin__row--' + variant, { 'is-invalid': !!error, 'is-disabled': disabled }]"
    >
      <template v-for="(char, index) in chars" :key="index">
        <input
          :ref="(el) => setInput(el as Element | null, index)"
          class="md-pin__box"
          :value="char"
          :type="masked ? 'password' : 'text'"
          :inputmode="type === 'numeric' ? 'numeric' : 'text'"
          autocomplete="one-time-code"
          maxlength="1"
          :disabled="disabled"
          :aria-label="'第 ' + (index + 1) + ' 位，共 ' + total + ' 位'"
          :aria-invalid="error ? 'true' : undefined"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @paste="onPaste(index, $event)"
          @focus="onFocus(index)"
        />
        <span
          v-if="groupEnds.has(index)"
          class="md-pin__separator"
          aria-hidden="true"
        >{{ separator }}</span>
      </template>
    </div>

    <p v-if="error" class="md-pin__support md-pin__support--error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="md-pin__support">{{ hint }}</p>
  </div>
</template>

<style scoped>
.md-pin {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--md-ref-typeface-plain);
}

.md-pin__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 格子宽 48dp，但允许收缩：一排 8 位在窄屏上必须还能放下，而不是横向溢出 */
.md-pin__box {
  width: 48px;
  min-width: 0;
  height: 56px;
  flex: 0 1 48px;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  text-align: center;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  font-variant-numeric: tabular-nums;
  caret-color: var(--md-sys-color-primary);
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* ---------- Filled ---------- */
.md-pin__row--filled .md-pin__box {
  border-start-start-radius: var(--md-sys-shape-corner-extra-small);
  border-start-end-radius: var(--md-sys-shape-corner-extra-small);
  border-block-end: 1px solid var(--md-sys-color-on-surface-variant);
  background-color: var(--md-sys-color-surface-container-highest);
}

@media (hover: hover) {
  .md-pin__row--filled:not(.is-disabled) .md-pin__box:hover {
    background-color: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 6%,
      var(--md-sys-color-surface-container-highest)
    );
  }
}

/* 聚焦：底边加粗到 2dp。用 border-width 会顶动整格高度，改用 inset 阴影补那一层 */
.md-pin__row--filled .md-pin__box:focus {
  border-block-end-color: var(--md-sys-color-primary);
  box-shadow: inset 0 -1px 0 0 var(--md-sys-color-primary);
}

.md-pin__row--filled.is-invalid .md-pin__box {
  border-block-end-color: var(--md-sys-color-error);
  caret-color: var(--md-sys-color-error);
}

.md-pin__row--filled.is-invalid .md-pin__box:focus {
  box-shadow: inset 0 -1px 0 0 var(--md-sys-color-error);
}

/* ---------- Outlined ---------- */
.md-pin__row--outlined .md-pin__box {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
}

@media (hover: hover) {
  .md-pin__row--outlined:not(.is-disabled) .md-pin__box:hover {
    border-color: var(--md-sys-color-on-surface);
  }
}

.md-pin__row--outlined .md-pin__box:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
}

.md-pin__row--outlined.is-invalid .md-pin__box {
  border-color: var(--md-sys-color-error);
  caret-color: var(--md-sys-color-error);
}

.md-pin__row--outlined.is-invalid .md-pin__box:focus {
  box-shadow: inset 0 0 0 1px var(--md-sys-color-error);
}

/* ---------- 分隔符 ---------- */
.md-pin__separator {
  flex: 0 0 auto;
  padding-inline: 2px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: 1;
  user-select: none;
}

/* ---------- 支持文案 ---------- */
.md-pin__support {
  margin: 0;
  padding-inline: 2px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-pin__support--error {
  color: var(--md-sys-color-error);
}

/* ---------- 禁用 ---------- */
.md-pin__row.is-disabled .md-pin__box,
.md-pin__row.is-disabled .md-pin__separator {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}

.md-pin__row--filled.is-disabled .md-pin__box {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  border-block-end-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-pin__row--outlined.is-disabled .md-pin__box {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}
</style>
