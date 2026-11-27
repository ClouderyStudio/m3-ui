<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import M3Kbd from './M3Kbd.vue'

/**
 * 全局快捷键注册 + 可选速查表。
 *
 * 组合写法：mod+k（mod 在 Mac 上是 ⌘、其它平台是 Ctrl）、shift+/、alt+enter。
 * 三个容易忽略的细节：
 *   1. 正在输入框里打字时不能触发单键绑定（否则打「/」就跳搜索）；
 *   2. 按住不放的自动重复要忽略，一次按键只算一次；
 *   3. mod 不能当成第五个修饰键去比较 —— 它在 Mac 上是 meta、其它平台是 ctrl，
 *      两边都算一次的话，任何 mod 组合都永远匹配不上。
 */
export interface HotkeyBinding {
  /** 组合键，例如 'mod+k' / 'shift+/' / 'escape'。 */
  keys: string
  /** 速查表里显示的名字。 */
  label: string
  handler: () => void
  /** 速查表里的分组标题。 */
  group?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    bindings: HotkeyBinding[]
    /** 渲染一张可见的速查表（默认只监听，不占布局）。 */
    showOverlay?: boolean
    title?: string
  }>(),
  { showOverlay: false, title: '键盘快捷键' },
)

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

function prettyKey(raw: string): string {
  const map: Record<string, string> = {
    mod: isMac ? '⌘' : 'Ctrl',
    ctrl: isMac ? '⌃' : 'Ctrl',
    meta: '⌘',
    alt: isMac ? '⌥' : 'Alt',
    shift: isMac ? '⇧' : 'Shift',
    enter: '↵',
    escape: 'Esc',
    backspace: '⌫',
    delete: '⌦',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    ' ': 'Space',
  }
  const key = raw.trim().toLowerCase()
  return map[key] ?? (key.length === 1 ? key.toUpperCase() : key)
}

function keysOf(combo: string): { modifiers: Set<string>; key: string } {
  const modifiers = new Set<string>()
  let key = ''
  for (const part of combo.split('+').map((piece) => piece.trim().toLowerCase())) {
    if (part === 'mod') modifiers.add(isMac ? 'meta' : 'ctrl')
    else if (part === 'ctrl' || part === 'alt' || part === 'shift' || part === 'meta') modifiers.add(part)
    else key = part
  }
  return { modifiers, key }
}

function matches(binding: HotkeyBinding, event: KeyboardEvent): boolean {
  const { modifiers, key } = keysOf(binding.keys)
  if (!key) return false
  const pressed = event.key.toLowerCase()
  if (pressed !== key) return false
  return (
    event.ctrlKey === modifiers.has('ctrl') &&
    event.altKey === modifiers.has('alt') &&
    event.shiftKey === modifiers.has('shift') &&
    event.metaKey === modifiers.has('meta')
  )
}

function isEditable(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}

function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.repeat) return
  const editable = isEditable(event.target)
  const hasModifier = event.ctrlKey || event.metaKey || event.altKey

  for (const binding of props.bindings) {
    if (binding.disabled) continue
    if (!matches(binding, event)) continue
    // 输入框里只放行带修饰键的组合（Ctrl+S 这类），单键与 shift+字符留给打字
    if (editable && !hasModifier) return
    event.preventDefault()
    binding.handler()
    return
  }
}

const groups = computed(() => {
  const map = new Map<string, HotkeyBinding[]>()
  for (const binding of props.bindings) {
    const group = binding.group ?? '通用'
    const list = map.get(group)
    if (list) list.push(binding)
    else map.set(group, [binding])
  }
  return [...map.entries()]
})

function chips(combo: string): string[] {
  return combo.split('+').map((part) => prettyKey(part))
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section v-if="showOverlay" class="md-hotkeys" :aria-label="title">
    <h3 class="md-hotkeys__title">{{ title }}</h3>

    <div v-for="[group, list] in groups" :key="group" class="md-hotkeys__group">
      <p class="md-hotkeys__group-name">{{ group }}</p>
      <dl class="md-hotkeys__list">
        <div v-for="binding in list" :key="binding.keys + binding.label" class="md-hotkeys__row">
          <dt class="md-hotkeys__label">{{ binding.label }}</dt>
          <dd class="md-hotkeys__keys">
            <M3Kbd v-for="(key, index) in chips(binding.keys)" :key="key + index" size="sm">{{ key }}</M3Kbd>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.md-hotkeys {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-hotkeys__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.md-hotkeys__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.md-hotkeys__group-name {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  text-transform: uppercase;
}

.md-hotkeys__list {
  margin: 0;
}

.md-hotkeys__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 6px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.md-hotkeys__row:last-child {
  border-block-end: none;
}

.md-hotkeys__label {
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md-hotkeys__keys {
  display: flex;
  gap: 4px;
  margin: 0;
}
</style>
