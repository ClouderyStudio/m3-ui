import { prefersReducedMotion } from './motion'

/**
 * 特效共用的底座：取色、取起点、以及一张全屏 canvas。
 *
 * 撒花、礼花、飘心如果各建一张 canvas，同一刻会有三张全屏合成层叠在一起，
 * 移动端的显存和带宽都不够；这里全库共用一张，没人用时立刻摘掉。
 *
 * 与组件动效的分工：这些是装饰，减少动态效果时直接不做（不是缩短）——
 * 装饰不承载信息，消失不会让用户失去反馈。
 */
export type EffectOrigin = Event | Element | { x: number; y: number }

/** 从事件指针、元素中心或视口坐标取一个起点。 */
export function originPoint(origin?: EffectOrigin): { x: number; y: number; el: Element } {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0, el: null as unknown as Element }
  }
  if (!origin) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2, el: document.documentElement }
  }
  if (origin instanceof Event) {
    const event = origin as (MouseEvent | PointerEvent | TouchEvent) & { target?: EventTarget | null }
    const touches = 'touches' in event ? event.touches : undefined
    const touch = touches?.[0] ?? ('changedTouches' in event ? event.changedTouches[0] : undefined)
    const el = event.target instanceof Element ? event.target : document.documentElement
    const x = touch?.clientX ?? (event as MouseEvent).clientX
    const y = touch?.clientY ?? (event as MouseEvent).clientY

    /*
     * 键盘触发（Enter/空格）的 click 没有坐标，clientX/clientY 是 0 ——
     * 直接用它会让撒花从左上角飞出来。这时退回到触发元素的中心。
     */
    if ((!x && !y) || typeof x !== 'number' || typeof y !== 'number') {
      const rect = el.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, el }
    }
    return { x, y, el }
  }
  if (origin instanceof Element) {
    const rect = origin.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, el: origin }
  }
  return { x: origin.x, y: origin.y, el: document.documentElement }
}

/** 读取主题色（默认主/次/三色及其容器色），读不到时退化为中性色板。 */
export function readThemeColors(el: Element | null | undefined, roles: string[]): string[] {
  if (typeof window === 'undefined') return ['#2196f3']
  const style = getComputedStyle(el ?? document.documentElement)
  const colors = roles
    .map((role) => style.getPropertyValue('--md-sys-color-' + role).trim())
    .filter((value) => value.length > 0)
  return colors.length > 0 ? colors : ['#2196f3', '#4caf50', '#ff9800']
}

export function reducedMotion(): boolean {
  return prefersReducedMotion()
}

export interface EffectLayer {
  /** 画一帧；返回 false 表示这一层已经结束，可以从画布上摘掉。 */
  step(ctx: CanvasRenderingContext2D, dt: number, dpr: number, now: number): boolean
}

const Z_INDEX = '2147483000'
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let layers: EffectLayer[] = []
let frame = 0
let last = 0
let dpr = 1

function resize(): void {
  if (!canvas || !ctx) return
  dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (canvas && ctx) return ctx
  canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;width:100%;height:100%;z-index:' + Z_INDEX
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  if (!ctx) return null
  resize()
  window.addEventListener('resize', resize)
  return ctx
}

function releaseCanvas(): void {
  window.removeEventListener('resize', resize)
  canvas?.remove()
  canvas = null
  ctx = null
  layers = []
  frame = 0
}

function tick(now: number): void {
  if (!ctx || !canvas) return
  const dt = Math.min((now - last) / 1000, 1 / 20)
  last = now
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  layers = layers.filter((layer) => layer.step(ctx!, dt, dpr, now))
  if (layers.length === 0) {
    releaseCanvas()
    return
  }
  frame = requestAnimationFrame(tick)
}

/** 把一层挂到共享画布上；返回的函数只摘掉这一层。 */
export function runEffectCanvas(layer: EffectLayer): () => void {
  if (typeof window === 'undefined') return () => {}
  if (!ensureCanvas()) return () => {}
  if (!layers.includes(layer)) layers.push(layer)
  if (!frame) {
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }
  return () => {
    layers = layers.filter((entry) => entry !== layer)
    if (layers.length === 0 && frame) {
      cancelAnimationFrame(frame)
      releaseCanvas()
    }
  }
}
