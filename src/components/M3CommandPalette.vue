<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { IconComponent } from '../icons'
import { IconSearch } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Kbd from './M3Kbd.vue'
import { useModal } from '../composables/useModal'

/**
 * 命令面板（⌘K / Ctrl+K）。
 *
 * 搜索是朴素子串匹配，不做模糊匹配：命令名都很短，模糊匹配反而会把
 * 「格式：文档」和「导出：文档」这种相近的命令混在一起，按回车就选错。
 *
 * 焦点、滚动锁、Esc 都交给 useModal —— 面板本质是一个对话框，
 * 只是内容长得像搜索框加列表，没必要再写一套浮层行为。
 */
export interface CommandItem {
  id: string
  label: string
  icon?: IconComponent | null
  /** 右侧显示的快捷键提示，例如 '⌘K'。 */
  shortcut?: string
  /** 分组标题；同名分组的项会连在一起。 */
  group?: string
  disabled?: boolean
  /** 选中后执行；emit('select') 先于它触发。 */
  onSelect?: () => void
}

const props = withDefaults(
  defineProps<{
    /** 开关状态（v-model）。 */
    modelValue: boolean
    items: CommandItem[]
    placeholder?: string
    /** 搜不到时的文案。 */
    emptyText?: string
    /** 全局快捷键的按键（与 Ctrl/⌘ 组合）。 */
    hotkey?: string
    /** 是否监听全局快捷键。 */
    enableHotkey?: boolean
    navigateHint?: string
    selectHint?: string
    closeHint?: string
  }>(),
  {
    placeholder: '搜索命令…',
    emptyText: '没有匹配的命令',
    hotkey: 'k',
    enableHotkey: true,
    navigateHint: '选择',
    selectHint: '执行',
    closeHint: '关闭',
  },
)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  select: [item: CommandItem]
}>()

const uid = useId()
const listId = uid + '-list'

const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const activeIndex = ref(0)

const open = computed(() => props.modelValue)

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return props.items.filter((item) => {
    if (item.disabled) return false
    if (!keyword) return true
    return (
      item.label.toLowerCase().includes(keyword) ||
      (item.group?.toLowerCase().includes(keyword) ?? false)
    )
  })
})

const grouped = computed(() => {
  const groups = new Map<string, CommandItem[]>()
  for (const item of filtered.value) {
    const key = item.group ?? ''
    const bucket = groups.get(key)
    if (bucket) bucket.push(item)
    else groups.set(key, [item])
  }
  return groups
})

const activeItem = computed(() => filtered.value[activeIndex.value])

function isActive(item: CommandItem): boolean {
  return activeItem.value?.id === item.id
}

function optionId(item: CommandItem): string {
  return uid + '-option-' + item.id
}

function close(): void {
  emit('update:modelValue', false)
}

function select(item: CommandItem): void {
  if (item.disabled) return
  emit('select', item)
  item.onSelect?.()
  close()
}

function scrollActiveIntoView(): void {
  nextTick(() => {
    const panel = panelRef.value
    panel?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  })
}

function move(delta: number): void {
  const total = filtered.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
  scrollActiveIntoView()
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      return
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      return
    case 'Home':
      event.preventDefault()
      activeIndex.value = 0
      scrollActiveIntoView()
      return
    case 'End':
      event.preventDefault()
      activeIndex.value = Math.max(0, filtered.value.length - 1)
      scrollActiveIntoView()
      return
    case 'Enter': {
      event.preventDefault()
      const item = activeItem.value
      if (item) select(item)
      return
    }
  }
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (!props.enableHotkey) return
  if (event.defaultPrevented) return
  if (!(event.metaKey || event.ctrlKey)) return
  if (event.key.toLowerCase() !== props.hotkey.toLowerCase()) return
  event.preventDefault()
  if (props.modelValue) close()
  else emit('update:modelValue', true)
}

useModal(open, panelRef, { onClose: close })

watch(open, (value) => {
  if (value) {
    query.value = ''
    activeIndex.value = 0
    nextTick(() => inputRef.value?.focus())
  }
})

watch(query, () => {
  activeIndex.value = 0
})

onMounted(() => document.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="md-cmd">
      <div v-if="modelValue" class="md-cmd" @pointerdown.self="close">
        <div
          ref="panelRef"
          class="md-cmd__panel"
          role="dialog"
          aria-modal="true"
          aria-label="命令面板"
          tabindex="-1"
        >
          <div class="md-cmd__search">
            <M3Icon :icon="IconSearch" :size="20" class="md-cmd__search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              class="md-cmd__input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="true"
              :aria-controls="listId"
              :aria-activedescendant="activeItem ? optionId(activeItem) : undefined"
              :placeholder="placeholder"
              autocomplete="off"
              spellcheck="false"
              @keydown="onKeydown"
            />
            <M3Kbd size="sm">ESC</M3Kbd>
          </div>

          <ul :id="listId" class="md-cmd__list" role="listbox" aria-label="命令列表">
            <template v-for="[group, groupItems] in grouped" :key="group">
              <li v-if="group" class="md-cmd__group" role="presentation">{{ group }}</li>

              <li
                v-for="item in groupItems"
                :id="optionId(item)"
                :key="item.id"
                class="md-cmd__option"
                :class="{ 'is-active': isActive(item) }"
                role="option"
                :aria-selected="isActive(item)"
                :data-active="isActive(item) ? 'true' : undefined"
                @click="select(item)"
                @pointermove="activeIndex = filtered.indexOf(item)"
              >
                <M3Icon v-if="item.icon" :icon="item.icon" :size="20" class="md-cmd__option-icon" />
                <span class="md-cmd__option-label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="md-cmd__option-shortcut">
                  <M3Kbd size="sm">{{ item.shortcut }}</M3Kbd>
                </span>
              </li>
            </template>

            <li v-if="filtered.length === 0" class="md-cmd__empty" role="presentation">
              {{ emptyText }}
            </li>
          </ul>

          <div class="md-cmd__footer">
            <span class="md-cmd__hint">
              <M3Kbd size="sm">↑</M3Kbd><M3Kbd size="sm">↓</M3Kbd> {{ navigateHint }}
            </span>
            <span class="md-cmd__hint">
              <M3Kbd size="sm">↵</M3Kbd> {{ selectHint }}
            </span>
            <span class="md-cmd__hint">
              <M3Kbd size="sm">ESC</M3Kbd> {{ closeHint }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.md-cmd {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-block-start: 12vh;
  padding-inline: 16px;
  /* 遮罩用 scrim 的 32%，和 M3Dialog 保持一致 */
  background-color: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent);
}

.md-cmd__panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-inline-size: 560px;
  max-block-size: 70vh;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-extra-large);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level3);
  font-family: var(--md-ref-typeface-plain);
}

.md-cmd__panel:focus {
  outline: none;
}

/* ---------- 搜索区 ---------- */
.md-cmd__search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-inline: 16px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-cmd__search-icon {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-cmd__input {
  flex: 1;
  min-width: 0;
  height: 52px;
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

.md-cmd__input::placeholder {
  color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 60%, transparent);
}

/* ---------- 列表 ---------- */
.md-cmd__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding-block: 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
}

.md-cmd__group {
  padding: 12px 16px 4px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  line-height: var(--md-sys-typescale-label-small-line-height);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.md-cmd__option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  margin-inline: 8px;
  padding-inline: 12px;
  border-radius: var(--md-sys-shape-corner-small);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/*
 * 鼠标悬停与键盘高亮走同一套样式。
 * 分开做的话，键盘用户看到的高亮和鼠标用户看到的深浅不一样，
 * 会让人以为两者选的不是同一项。
 */
.md-cmd__option.is-active {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
}

.md-cmd__option-icon {
  flex-shrink: 0;
  color: inherit;
  opacity: 0.75;
}

.md-cmd__option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-cmd__option-shortcut {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-cmd__empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

/* ---------- 底部提示 ---------- */
.md-cmd__footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}

.md-cmd__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  line-height: var(--md-sys-typescale-label-small-line-height);
  white-space: nowrap;
}

/* ---------- 出入场 ---------- */
.md-cmd-enter-active {
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-cmd-leave-active {
  transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
}

.md-cmd-enter-from,
.md-cmd-leave-to {
  opacity: 0;
}

/* 面板从上方「掉」进来一点：说明它是从快捷键那儿召唤出来的浮层，不是一个新页面 */
.md-cmd-enter-active .md-cmd__panel,
.md-cmd-leave-active .md-cmd__panel {
  transition:
    transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-cmd-enter-from .md-cmd__panel,
.md-cmd-leave-to .md-cmd__panel {
  transform: scale(0.96) translateY(-10px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .md-cmd-enter-from .md-cmd__panel,
  .md-cmd-leave-to .md-cmd__panel {
    transform: none;
  }
}
</style>
