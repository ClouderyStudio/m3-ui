<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { IconCheck, IconExpandMore } from '../icons'
import M3Icon from './M3Icon.vue'

/**
 * 下拉选择：MD3 filled select。
 *
 * **为什么不用原生 <select>**：它的弹层是操作系统画的 —— 浅色系统配色、系统圆角、
 * 不受页面主题影响，深色站点上会突然冒出一块亮色的白板（2026-11 实测就是这样）。
 * 原生弹层的样式**完全无法通过 CSS 控制**，所以只能自绘。
 *
 * 自绘之后键盘与读屏要自己补全（原生本来免费给的）：
 *   - combobox + listbox 角色，aria-expanded / aria-controls / aria-activedescendant；
 *   - ↑↓ 移动高亮、Home/End 跳首尾、Enter/Space 选中、Esc 关闭、Tab 关闭并保留选择；
 *   - 输入字母做前缀查找（原生 <select> 的行为，长列表里很好用）。
 *
 * 面板用 fixed 定位并贴住控件，滚动与 resize 时跟随；窗口下方放不下就向上翻。
 */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    options: SelectOption[]
    /** 空值选项的文案（传空串表示不提供空选项）。 */
    placeholder?: string
    disabled?: boolean
    required?: boolean
    hint?: string
    error?: string
  }>(),
  { placeholder: '', disabled: false, required: false, hint: '', error: '' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const fieldId = useId()
const describedBy = computed(() => {
  if (props.error) return fieldId + '-error'
  if (props.hint) return fieldId + '-hint'
  return undefined
})

const empty = computed(() => props.modelValue === '')

const open = ref(false)
const activeIndex = ref(-1)
const controlRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({ top: '0px', left: '0px', width: '0px' })

/** 面板里真正可选的行（把 placeholder 也算进去）。 */
interface Row {
  value: string
  label: string
  disabled: boolean
  /** 空值占位行：不参与「已选」高亮。 */
  placeholder?: boolean
}

const rows = computed<Row[]>(() => {
  const list: Row[] = []
  if (props.placeholder) list.push({ value: '', label: props.placeholder, disabled: false, placeholder: true })
  for (const option of props.options) {
    list.push({ value: option.value, label: option.label, disabled: Boolean(option.disabled) })
  }
  return list
})

const selectedIndex = computed(() => rows.value.findIndex((row) => row.value === props.modelValue))

/** 控件上显示的文本。 */
const displayText = computed(() => {
  if (empty.value) return props.placeholder || ''
  return rows.value.find((row) => row.value === props.modelValue)?.label ?? ''
})

function updatePosition(): void {
  const control = controlRef.value
  if (!control) return
  const rect = control.getBoundingClientRect()
  const panel = panelRef.value
  const panelHeight = panel ? panel.offsetHeight : 0
  const pad = 8

  let top = rect.bottom + 4
  // 下方放不下且上方够高：向上翻，避免面板被视口裁掉一半
  if (panelHeight > 0 && top + panelHeight > window.innerHeight - pad) {
    const above = rect.top - 4 - panelHeight
    if (above > pad) top = above
  }

  panelStyle.value = {
    top: top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
  }
}

async function openPanel(): Promise<void> {
  if (props.disabled || open.value) return
  open.value = true
  // 打开时高亮当前选中项（没有就落到第一个可选项）
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : firstEnabledIndex()
  await nextTick()
  updatePosition()
  scrollActiveIntoView()
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', onScroll, true)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
}

function closePanel(): void {
  if (!open.value) return
  open.value = false
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', onScroll, true)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
}

function toggle(): void {
  if (open.value) closePanel()
  else void openPanel()
}

function firstEnabledIndex(): number {
  return rows.value.findIndex((row) => !row.disabled)
}

function moveActive(step: number): void {
  const list = rows.value
  if (list.length === 0) return
  let index = activeIndex.value
  for (let count = 0; count < list.length; count++) {
    index = (index + step + list.length) % list.length
    if (!list[index]!.disabled) {
      activeIndex.value = index
      scrollActiveIntoView()
      return
    }
  }
}

function jumpActive(to: 'start' | 'end'): void {
  const list = rows.value
  const order = to === 'start' ? list.map((_, i) => i) : list.map((_, i) => list.length - 1 - i)
  for (const index of order) {
    if (!list[index]!.disabled) {
      activeIndex.value = index
      scrollActiveIntoView()
      return
    }
  }
}

function scrollActiveIntoView(): void {
  nextTick(() => {
    const panel = panelRef.value
    const item = panel?.querySelector<HTMLElement>('[data-active="true"]')
    item?.scrollIntoView({ block: 'nearest' })
  })
}

function choose(index: number): void {
  const row = rows.value[index]
  if (!row || row.disabled) return
  emit('update:modelValue', row.value)
  closePanel()
  // 选完把焦点还给控件，键盘用户可以接着 Tab 走
  controlRef.value?.focus()
}

/* ---------- 前缀查找（原生 <select> 的行为） ---------- */
let searchBuffer = ''
let searchTimer = 0

function typeAhead(char: string): boolean {
  window.clearTimeout(searchTimer)
  searchBuffer += char.toLowerCase()
  searchTimer = window.setTimeout(() => { searchBuffer = '' }, 600)

  const from = Math.max(0, activeIndex.value)
  const total = rows.value.length
  for (let offset = 0; offset < total; offset++) {
    const index = (from + offset) % total
    const row = rows.value[index]!
    if (!row.disabled && row.label.toLowerCase().startsWith(searchBuffer)) {
      activeIndex.value = index
      if (!open.value) void openPanel()
      scrollActiveIntoView()
      return true
    }
  }
  return false
}

/* ---------- 事件 ---------- */
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) void openPanel()
      else moveActive(1)
      return
    case 'ArrowUp':
      event.preventDefault()
      if (!open.value) void openPanel()
      else moveActive(-1)
      return
    case 'Home':
      if (!open.value) return
      event.preventDefault()
      jumpActive('start')
      return
    case 'End':
      if (!open.value) return
      event.preventDefault()
      jumpActive('end')
      return
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!open.value) void openPanel()
      else choose(activeIndex.value)
      return
    case 'Escape':
      if (!open.value) return
      event.preventDefault()
      closePanel()
      return
    case 'Tab':
      // Tab 不拦截默认行为，只把面板收起来
      closePanel()
      return
    default:
      // 单个可打印字符才做前缀查找，避免 Ctrl / Alt 组合触发
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        typeAhead(event.key)
      }
  }
}

function onControlClick(): void {
  if (props.disabled) return
  toggle()
  controlRef.value?.focus()
}

function onDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node | null
  if (!target) return
  if (panelRef.value?.contains(target) || controlRef.value?.contains(target)) return
  closePanel()
}

function onScroll(): void {
  updatePosition()
}

// 选项列表变了但面板开着：重新定位，避免面板与控件错位
watch(
  () => props.options.length,
  () => { if (open.value) nextTick(updatePosition) },
)

watch(
  () => props.disabled,
  (value) => { if (value) closePanel() },
)

onBeforeUnmount(() => {
  closePanel()
  window.clearTimeout(searchTimer)
})
</script>

<template>
  <div class="select-field" :class="{ 'is-empty': empty, 'is-invalid': !!error, 'is-disabled': disabled, 'is-open': open }">
    <label class="select-field__label" :id="fieldId + '-label'" :for="fieldId">{{ label }}</label>

    <!--
      控件本身是一个 button：它只负责打开面板，不承载选择逻辑。
      combobox 角色 + aria-activedescendant 让读屏在面板打开时能念出高亮项。
    -->
    <button
      :id="fieldId"
      ref="controlRef"
      type="button"
      class="select-field__control"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="fieldId + '-listbox'"
      :aria-labelledby="fieldId + '-label'"
      :aria-describedby="describedBy"
      :aria-invalid="error ? 'true' : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-activedescendant="open && activeIndex >= 0 ? fieldId + '-option-' + activeIndex : undefined"
      :disabled="disabled"
      @click="onControlClick"
      @keydown="onKeydown"
    >
      <span class="select-field__value" :class="{ 'is-placeholder': empty }">{{ displayText }}</span>

      <M3Icon
        :icon="IconExpandMore"
        :size="22"
        class="select-field__chevron"
        :class="{ 'is-open': open }"
      />
    </button>

    <div class="select-field__indicator" />

    <p v-if="error" :id="fieldId + '-error'" class="select-field__support select-field__support--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="fieldId + '-hint'" class="select-field__support">{{ hint }}</p>

    <Teleport to="body">
      <Transition name="select-pop">
        <ul
          v-if="open"
          :id="fieldId + '-listbox'"
          ref="panelRef"
          class="select-panel"
          role="listbox"
          :aria-labelledby="fieldId + '-label'"
          :style="panelStyle"
        >
          <li
            v-for="(row, index) in rows"
            :id="fieldId + '-option-' + index"
            :key="row.value + '-' + index"
            class="select-panel__item"
            :class="{
              'is-selected': !row.placeholder && row.value === modelValue,
              'is-active': index === activeIndex,
              'is-disabled': row.disabled,
              'is-placeholder': row.placeholder,
            }"
            role="option"
            :aria-selected="row.value === modelValue && !row.placeholder"
            :aria-disabled="row.disabled ? 'true' : undefined"
            :data-active="index === activeIndex ? 'true' : undefined"
            @click="choose(index)"
            @pointerenter="!row.disabled && (activeIndex = index)"
          >
            <span class="select-panel__label">{{ row.label }}</span>
            <M3Icon v-if="!row.placeholder && row.value === modelValue" :icon="IconCheck" :size="18" class="select-panel__check" />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
<style scoped>
.select-field {
  display: flex;
  flex-direction: column;
  position: relative;
}

.select-field__label {
  position: absolute;
  z-index: 1;
  inset-block-start: 8px;
  inset-inline-start: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
  pointer-events: none;
  transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.select-field.is-open .select-field__label,
.select-field:focus-within .select-field__label {
  color: var(--md-sys-color-primary);
}

/*
 * 控件是一个真实的 <button>（不是套皮的原生 select），
 * 所以这里要自己把盒模型、字体、焦点环都摆正。
 */
.select-field__control {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 56px;
  padding: 22px 16px 6px;
  border: none;
  border-start-start-radius: var(--md-sys-shape-corner-extra-small);
  border-start-end-radius: var(--md-sys-shape-corner-extra-small);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  text-align: start;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .select-field__control:hover {
    background-color: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 6%,
      var(--md-sys-color-surface-container-highest)
    );
  }
}

/* 焦点环由底部指示线承担，这里不额外加 outline，避免出现双重描边 */
.select-field__control:focus-visible {
  outline: none;
}

.select-field__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

.select-field__value.is-placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.select-field__chevron {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  transition: rotate var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

/* 展开时箭头翻转 180°：比换图标更省事，也更有「打开」的连续感 */
.select-field__chevron.is-open {
  rotate: 180deg;
}

.select-field__indicator {
  height: 1px;
  margin-inline: 16px;
  background-color: var(--md-sys-color-on-surface-variant);
  transition:
    height var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    margin-inline var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.select-field.is-open .select-field__indicator,
.select-field:focus-within .select-field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-primary);
}

.select-field.is-invalid .select-field__indicator {
  height: 2px;
  margin-inline: 0;
  background-color: var(--md-sys-color-error);
}

.select-field__support {
  margin: 0;
  padding: 4px 16px 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.select-field__support--error {
  color: var(--md-sys-color-error);
}

.select-field.is-disabled .select-field__control {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.select-field.is-disabled .select-field__indicator {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
</style>

<!-- 面板被 Teleport 到 body，scoped 的 data 属性不会跟过去，所以单独一段非 scoped 样式 -->
<style>
/*
 * MD3 menu 的表面：container 色 + 一级海拔 + 4dp 圆角。
 * 定位用 fixed（由脚本按控件的 getBoundingClientRect 算出），
 * 这样控件在滚动容器里也不会把面板裁掉。
 */
.select-panel {
  position: fixed;
  z-index: 320;
  margin: 0;
  padding-block: 8px;
  list-style: none;
  /* 贴合内容高度，不给空行留白；选项多时在 max-height 处滚动 */
  max-height: min(320px, calc(100dvh - 96px));
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level2);
}

.select-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding-inline: 16px 12px;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* 高亮行用状态层，而不是 hover 专用色 —— 键盘与鼠标走同一套视觉 */
.select-panel__item.is-active {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.select-panel__item.is-selected {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

.select-panel__item.is-placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.select-panel__item.is-disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  pointer-events: none;
}

.select-panel__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-panel__check {
  flex-shrink: 0;
  color: var(--md-sys-color-primary);
}

/* 展开/收起：从控件方向长出来，与 M3Menu 同一套方向感 */
.select-pop-enter-active {
  transition:
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
  transform-origin: top center;
}

.select-pop-leave-active {
  transition:
    opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
    scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
  transform-origin: top center;
}

.select-pop-enter-from {
  opacity: 0;
  scale: 0.96;
}

.select-pop-leave-to {
  opacity: 0;
  scale: 0.98;
}

@media (prefers-reduced-motion: reduce) {
  .select-pop-enter-from,
  .select-pop-leave-to {
    scale: 1;
  }

  .select-field__chevron.is-open {
    rotate: 0deg;
  }
}
</style>
