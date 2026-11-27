/**
 * 主题切换的过渡动画。
 *
 * 换主题时几十个 color role 同时变，直接切会「闪一下」；给每个元素加 transition 又太贵
 * （几千个元素、每帧重算）。这里把 token 注册成 <color>，只在 <html> 上过渡一次，
 * 所有元素通过 var() 自然跟着走。
 *
 * 不支持 @property 的浏览器（Firefox 目前）直接切换 —— 宁可没有动画，
 * 也不要为了动画把每帧的样式计算翻几倍。
 */
export const THEME_TRANSITION_MS = 250
const STYLE_ID = 'md-theme-transition'

const COLOR_ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'inverse-surface',
  'inverse-on-surface',
  'inverse-primary',
  'outline',
  'outline-variant',
  'surface-tint',
].map((role) => '--md-sys-color-' + role)

let timer: ReturnType<typeof setTimeout> | undefined

function supportsProperty(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function'
}

function ensureStyle(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent =
    COLOR_ROLES.map((token) => '@property ' + token + " { syntax: '<color>'; inherits: true; initial-value: transparent; }").join('\n') +
    '\nhtml.md-theme-switching { transition: ' + COLOR_ROLES.map((token) => token + ' ' + THEME_TRANSITION_MS + 'ms ease').join(', ') + '; }' +
    '\nhtml.md-theme-switching *, html.md-theme-switching *::before, html.md-theme-switching *::after { transition: none !important; }'
  document.head.appendChild(style)
}

/** 在过渡动画里执行一次主题写入（apply 内应是同步的 DOM 写）。 */
export function themeTransition(apply: () => void): void {
  if (typeof document === 'undefined') return apply()

  const reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  if (reduced || !supportsProperty()) {
    apply()
    return
  }

  ensureStyle()
  const root = document.documentElement
  root.classList.add('md-theme-switching')
  // 强制一次样式刷新：让「过渡已就位」发生在颜色改变之前
  void root.offsetHeight
  apply()

  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    root.classList.remove('md-theme-switching')
  }, THEME_TRANSITION_MS + 50)
}
