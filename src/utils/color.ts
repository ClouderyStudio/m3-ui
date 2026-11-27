/**
 * 由「种子色」生成一套 MD3 配色（不依赖第三方库）。
 *
 * 为什么自己算而不是内置几套死配色：使用方换一个品牌色就该得到一整套协调的
 * primary / secondary / tertiary / neutral 色阶，而不是让设计从 49 个变量里挑。
 *
 * 色彩空间用 OKLCH —— 它在感知上比 HSL 均匀得多：
 * 同样是 tone 40，蓝和黄的「看起来一样深」才是配色表能成立的前提（HSL 做不到）。
 * M3 的 tone 是 CIE L*（0-100），这里先换算成相对亮度 Y，再取 OKLab 的 L = ∛Y，
 * 于是哈瓦那蓝和琥珀橙在同一 tone 上的明度读数是一致的。
 */

export interface Oklch {
  l: number
  c: number
  h: number
}

export interface ThemeScheme {
  light: Record<string, string>
  dark: Record<string, string>
}

/** 与本项目自带的 m3-color-tokens.css 同一颗种子色。 */
export const DEFAULT_SEED = '#2196f3'

type Rgb = [number, number, number]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055
}

/** '#abc' / 'abcdef' / '#ABCDEF' → [r, g, b]（0-1），非法输入返回 null。 */
export function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) return null
  let digits = match[1]
  if (digits.length === 3) {
    digits = digits
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return [
    Number.parseInt(digits.slice(0, 2), 16) / 255,
    Number.parseInt(digits.slice(2, 4), 16) / 255,
    Number.parseInt(digits.slice(4, 6), 16) / 255,
  ]
}

export function rgbToHex(rgb: Rgb): string {
  const part = (value: number) =>
    Math.round(clamp(value, 0, 1) * 255)
      .toString(16)
      .padStart(2, '0')
  return '#' + part(rgb[0]) + part(rgb[1]) + part(rgb[2])
}

/** 归一化成 '#rrggbb'；非法输入返回 null。 */
export function normalizeHex(hex: string): string | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHex(rgb) : null
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const r = srgbToLinear(rgb[0])
  const g = srgbToLinear(rgb[1])
  const b = srgbToLinear(rgb[2])

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  let hue = (Math.atan2(bb, a) * 180) / Math.PI
  if (hue < 0) hue += 360

  return { l: lightness, c: Math.hypot(a, bb), h: hue }
}

function oklchToLinear({ l, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)

  const l1 = l + 0.3963377774 * a + 0.2158037573 * b
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b
  const s1 = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l1 ** 3
  const m3 = m1 ** 3
  const s3 = s1 ** 3

  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

function inGamut(rgb: Rgb): boolean {
  return rgb.every((channel) => channel >= -0.0008 && channel <= 1.0008)
}

/**
 * OKLCH → sRGB。
 *
 * 超出色域时**二分收敛彩度**，而不是直接截断 RGB 通道 ——
 * 截断会把颜色整体推向黄/青，色相都变了；收彩度只是「没那么艳」。
 */
export function oklchToHex(input: Oklch): string {
  const { l, h } = input
  let chroma = Math.max(0, input.c)

  if (!inGamut(oklchToLinear({ l, c: chroma, h }))) {
    let low = 0
    let high = chroma
    for (let step = 0; step < 18; step += 1) {
      const mid = (low + high) / 2
      if (inGamut(oklchToLinear({ l, c: mid, h }))) low = mid
      else high = mid
    }
    chroma = low
  }

  const linear = oklchToLinear({ l, c: chroma, h })
  return rgbToHex([
    linearToSrgb(linear[0]),
    linearToSrgb(linear[1]),
    linearToSrgb(linear[2]),
  ])
}

/** M3 tone（CIE L*，0-100）→ OKLab 的 L。 */
function toneToLightness(tone: number): number {
  const t = clamp(tone, 0, 100)
  // CIE L* → 相对亮度 Y（分段函数，t=8 是两段的分界）
  const y = t > 8 ? ((t + 16) / 116) ** 3 : t / 903.2962962
  return Math.cbrt(y)
}

type PaletteKey = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error'

interface RoleTone {
  role: string
  palette: PaletteKey
  light: number
  dark: number
}

/**
 * 角色 → 色阶 + tone。
 * light/dark 两列取自 M3 标准配色方案（surface 98/6、container 90-100 / 4-22 等）。
 */
const ROLE_TONES: RoleTone[] = [
  { role: 'primary', palette: 'primary', light: 40, dark: 80 },
  { role: 'on-primary', palette: 'primary', light: 100, dark: 20 },
  { role: 'primary-container', palette: 'primary', light: 90, dark: 30 },
  { role: 'on-primary-container', palette: 'primary', light: 10, dark: 90 },
  { role: 'primary-fixed', palette: 'primary', light: 90, dark: 90 },
  { role: 'primary-fixed-dim', palette: 'primary', light: 80, dark: 80 },
  { role: 'on-primary-fixed', palette: 'primary', light: 10, dark: 10 },
  { role: 'on-primary-fixed-variant', palette: 'primary', light: 30, dark: 30 },

  { role: 'secondary', palette: 'secondary', light: 40, dark: 80 },
  { role: 'on-secondary', palette: 'secondary', light: 100, dark: 20 },
  { role: 'secondary-container', palette: 'secondary', light: 90, dark: 30 },
  { role: 'on-secondary-container', palette: 'secondary', light: 10, dark: 90 },
  { role: 'secondary-fixed', palette: 'secondary', light: 90, dark: 90 },
  { role: 'secondary-fixed-dim', palette: 'secondary', light: 80, dark: 80 },
  { role: 'on-secondary-fixed', palette: 'secondary', light: 10, dark: 10 },
  { role: 'on-secondary-fixed-variant', palette: 'secondary', light: 30, dark: 30 },

  { role: 'tertiary', palette: 'tertiary', light: 40, dark: 80 },
  { role: 'on-tertiary', palette: 'tertiary', light: 100, dark: 20 },
  { role: 'tertiary-container', palette: 'tertiary', light: 90, dark: 30 },
  { role: 'on-tertiary-container', palette: 'tertiary', light: 10, dark: 90 },
  { role: 'tertiary-fixed', palette: 'tertiary', light: 90, dark: 90 },
  { role: 'tertiary-fixed-dim', palette: 'tertiary', light: 80, dark: 80 },
  { role: 'on-tertiary-fixed', palette: 'tertiary', light: 10, dark: 10 },
  { role: 'on-tertiary-fixed-variant', palette: 'tertiary', light: 30, dark: 30 },

  { role: 'error', palette: 'error', light: 40, dark: 80 },
  { role: 'on-error', palette: 'error', light: 100, dark: 20 },
  { role: 'error-container', palette: 'error', light: 90, dark: 30 },
  { role: 'on-error-container', palette: 'error', light: 10, dark: 90 },

  { role: 'background', palette: 'neutral', light: 98, dark: 6 },
  { role: 'on-background', palette: 'neutral', light: 10, dark: 90 },
  { role: 'surface', palette: 'neutral', light: 98, dark: 6 },
  { role: 'on-surface', palette: 'neutral', light: 10, dark: 90 },
  { role: 'surface-variant', palette: 'neutralVariant', light: 90, dark: 30 },
  { role: 'on-surface-variant', palette: 'neutralVariant', light: 30, dark: 80 },
  { role: 'surface-dim', palette: 'neutral', light: 87, dark: 6 },
  { role: 'surface-bright', palette: 'neutral', light: 98, dark: 24 },
  { role: 'surface-container-lowest', palette: 'neutral', light: 100, dark: 4 },
  { role: 'surface-container-low', palette: 'neutral', light: 96, dark: 10 },
  { role: 'surface-container', palette: 'neutral', light: 94, dark: 12 },
  { role: 'surface-container-high', palette: 'neutral', light: 92, dark: 17 },
  { role: 'surface-container-highest', palette: 'neutral', light: 90, dark: 22 },
  { role: 'inverse-surface', palette: 'neutral', light: 20, dark: 90 },
  { role: 'inverse-on-surface', palette: 'neutral', light: 95, dark: 20 },
  { role: 'inverse-primary', palette: 'primary', light: 80, dark: 40 },
  { role: 'outline', palette: 'neutralVariant', light: 50, dark: 60 },
  { role: 'outline-variant', palette: 'neutralVariant', light: 80, dark: 30 },
  { role: 'surface-tint', palette: 'primary', light: 40, dark: 80 },
]

function makeTone(hue: number, chroma: number): (tone: number) => string {
  return (tone) => oklchToHex({ l: toneToLightness(tone), c: chroma, h: hue })
}

/**
 * 由一颗种子色生成 light / dark 两套 --md-sys-color-*。
 *
 * 彩度按角色派生而不是取同一档：大面积的中性表面必须几乎无彩，
 * 否则页面整体会「泛色」；强调色则要保住种子色的鲜艳度。
 */
export function buildScheme(seedHex: string): ThemeScheme {
  const seed = hexToOklch(normalizeHex(seedHex) ?? DEFAULT_SEED) ?? { l: 0.6, c: 0.12, h: 250 }

  const primaryChroma = clamp(seed.c, 0.045, 0.16)
  const palettes: Record<PaletteKey, (tone: number) => string> = {
    primary: makeTone(seed.h, primaryChroma),
    secondary: makeTone(seed.h, clamp(seed.c * 0.38, 0.014, 0.06)),
    tertiary: makeTone((seed.h + 60) % 360, clamp(seed.c * 0.78, 0.03, 0.12)),
    neutral: makeTone(seed.h, 0.006),
    neutralVariant: makeTone(seed.h, clamp(seed.c * 0.12, 0.006, 0.022)),
    error: makeTone(27, 0.135),
  }

  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  for (const { role, palette, light: lightTone, dark: darkTone } of ROLE_TONES) {
    light['--md-sys-color-' + role] = palettes[palette](lightTone)
    dark['--md-sys-color-' + role] = palettes[palette](darkTone)
  }

  // 阴影与遮罩不参与配色推导：它们在两套方案里都必须是纯黑
  for (const role of ['shadow', 'scrim']) {
    light['--md-sys-color-' + role] = '#000000'
    dark['--md-sys-color-' + role] = '#000000'
  }

  return { light, dark }
}

/** 生成可直接写进 style 标签的文本：:root 放浅色，.dark 放深色。 */
export function schemeToCss(scheme: ThemeScheme): string {
  const declarations = (tokens: Record<string, string>) =>
    Object.entries(tokens)
      .map(([name, value]) => name + ':' + value + ';')
      .join('')

  return ':root{' + declarations(scheme.light) + '}\n.dark{' + declarations(scheme.dark) + '}'
}
