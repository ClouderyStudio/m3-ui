import { computed, readonly, ref } from 'vue'
import { DEFAULT_SEED, buildScheme, normalizeHex, schemeToCss } from '../utils/color'
import { themeTransition } from './useThemeTransition'

/**
 * 主题：外观（浅色 / 深色 / 跟随系统）+ 品牌种子色。
 *
 * 为什么是模块单例：外观是**整页**的状态，不是某个组件的状态。
 * 主题选择器、顶栏开关、以及将来的设置页都要改同一份值，
 * 各自持有 ref 会立刻互相打脸。
 *
 * 生成出来的 token 写进一个 style 标签（:root 浅色、.dark 深色），
 * 只覆盖 --md-sys-color-*；形状、字阶、动效仍然来自 m3-foundations.css。
 * 这样换主题永远不会把「比例」也一起换掉。
 */
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemePreset {
  name: string
  seed: string
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: '云术蓝', seed: '#2196f3' },
  { name: '松林绿', seed: '#2e7d32' },
  { name: '琥珀橙', seed: '#ef6c00' },
  { name: '品红', seed: '#d81b60' },
  { name: '紫罗兰', seed: '#7c4dff' },
  { name: '石墨灰', seed: '#546e7a' },
]

const STORAGE_KEY = 'm3-ui-theme'
const STYLE_ID = 'm3-theme'

const mode = ref<ThemeMode>('light')
const seed = ref<string>(DEFAULT_SEED)
const systemDark = ref(false)

let initialized = false
let mediaQuery: MediaQueryList | null = null

const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && systemDark.value))

function styleElement(): HTMLStyleElement {
  const existing = document.getElementById(STYLE_ID)
  const element = existing instanceof HTMLStyleElement ? existing : document.createElement('style')
  element.id = STYLE_ID
  /*
   * 每次都把它挪到 head 末尾。
   * 首屏那段预注入的样式在 m3-color-tokens.css **之前**，选择器权重又相同，
   * 不挪位置的话生成的配色会被静态 token 覆盖 —— 表现为「刷新一次主题就丢了」。
   */
  document.head.appendChild(element)
  return element
}

function apply(): void {
  if (typeof document === 'undefined') return
  styleElement().textContent = schemeToCss(buildScheme(seed.value))
  document.documentElement.classList.toggle('dark', isDark.value)
  // 原生控件（滚动条、日期选择器）跟着切换配色
  document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
}

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: mode.value,
        seed: seed.value,
        // 连 CSS 一起存：首屏 <head> 里的内联脚本可以直接注入，避免先闪一下默认蓝
        css: schemeToCss(buildScheme(seed.value)),
      }),
    )
  } catch {
    // 隐私模式 / 配额已满：存不下就只影响下次打开，不该打断当前会话
  }
}

function restore(): void {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as { mode?: string; seed?: string }
    if (saved.mode === 'light' || saved.mode === 'dark' || saved.mode === 'system') mode.value = saved.mode
    const normalized = saved.seed ? normalizeHex(saved.seed) : null
    if (normalized) seed.value = normalized
  } catch {
    // 存的是坏数据就按默认值来
  }
}

function init(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  restore()

  if (typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mediaQuery.matches
    mediaQuery.addEventListener('change', (event) => {
      systemDark.value = event.matches
      if (mode.value === 'system') apply()
    })
  }

  apply()
}

function setMode(next: ThemeMode): void {
  init()
  mode.value = next
  themeTransition(apply)
  persist()
}

/** 传进来的颜色会先归一化；非法输入直接忽略，不会把主题改坏。 */
function setSeed(next: string): void {
  init()
  const normalized = normalizeHex(next)
  if (!normalized) return
  seed.value = normalized
  themeTransition(apply)
  persist()
}

function reset(): void {
  init()
  mode.value = 'light'
  seed.value = DEFAULT_SEED
  themeTransition(apply)
  persist()
}

export function useTheme() {
  init()
  return {
    mode: readonly(mode),
    seed: readonly(seed),
    systemDark: readonly(systemDark),
    isDark,
    presets: THEME_PRESETS,
    setMode,
    setSeed,
    reset,
  }
}
