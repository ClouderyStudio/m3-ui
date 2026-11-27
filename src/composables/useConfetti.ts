import { originPoint, readThemeColors, reducedMotion, runEffectCanvas, type EffectLayer, type EffectOrigin } from '../utils/effects'

/**
 * 撒花（Confetti）：一批纸片以抛物线飞出、旋转、翻转、落地。
 *
 * 形状用 Path2D 现画，不引入 shape-morph 之类的库 —— 纸片只要「看得出是纸片」，
 * 十种基本几何已经够用，省下的体积比多出来的花哨形状值得。
 *
 * 翻转用矩阵的 x 轴缩放（cos(flip)）模拟：真实三维旋转在 2D 画布上会让纸片
 * 整片消失，压扁到 0 再翻回来才是纸片翻面的观感。
 */
export type ConfettiShape = 'square' | 'circle' | 'triangle' | 'pill' | 'star' | 'heart' | 'gem' | 'flower'

export interface ConfettiOptions {
  /** 一次撒多少片（from 为 top 时默认 160，否则 80）。 */
  count?: number
  shapes?: ConfettiShape[]
  /** 任意 CSS 颜色；默认取主题的主/次/三色及其容器色。 */
  colors?: string[]
  /** 从一点炸开，或从屏幕顶部飘落。 */
  from?: 'point' | 'top'
  /** 喷发方向（度），0 为正上方。 */
  angle?: number
  /** 喷发锥角（度）。 */
  spread?: number
  /** 初速度（px/s）。 */
  velocity?: number
  /** 纸片尺寸（px）。 */
  size?: number
  /** 持续时长（ms）；不传就是一次性爆发。 */
  duration?: number
}

const SIZE = 100
const GRAVITY = 1500
const DRAG = 1.6
const DEFAULT_SHAPES: ConfettiShape[] = ['square', 'circle', 'triangle', 'pill', 'star', 'heart', 'gem', 'flower']
const ROLES = ['primary', 'secondary', 'tertiary', 'primary-container', 'tertiary-container']

const pathCache = new Map<ConfettiShape, Path2D>()

function buildShape(shape: ConfettiShape): Path2D {
  const path = new Path2D()
  const half = SIZE / 2
  if (shape === 'square') {
    path.rect(-half * 0.5, -half * 0.5, SIZE * 0.5, SIZE * 0.5)
  } else if (shape === 'circle') {
    path.arc(0, 0, half * 0.32, 0, Math.PI * 2)
  } else if (shape === 'triangle') {
    path.moveTo(0, -half * 0.45)
    path.lineTo(half * 0.42, half * 0.35)
    path.lineTo(-half * 0.42, half * 0.35)
    path.closePath()
  } else if (shape === 'pill') {
    path.roundRect(-half * 0.5, -half * 0.18, SIZE * 0.5, SIZE * 0.18, half * 0.09)
  } else if (shape === 'star') {
    const spikes = 5
    const outer = half * 0.46
    const inner = outer * 0.45
    for (let index = 0; index < spikes * 2; index += 1) {
      const radius = index % 2 === 0 ? outer : inner
      const angle = (index * Math.PI) / spikes - Math.PI / 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (index === 0) path.moveTo(x, y)
      else path.lineTo(x, y)
    }
    path.closePath()
  } else if (shape === 'heart') {
    const scale = half * 0.028
    path.moveTo(0, 16 * scale)
    path.bezierCurveTo(-16 * scale, 4 * scale, -10 * scale, -12 * scale, 0, -5 * scale)
    path.bezierCurveTo(10 * scale, -12 * scale, 16 * scale, 4 * scale, 0, 16 * scale)
    path.closePath()
  } else if (shape === 'gem') {
    path.moveTo(0, -half * 0.5)
    path.lineTo(half * 0.36, 0)
    path.lineTo(0, half * 0.5)
    path.lineTo(-half * 0.36, 0)
    path.closePath()
  } else {
    const petal = half * 0.2
    for (let index = 0; index < 4; index += 1) {
      const angle = (index * Math.PI) / 2
      path.moveTo(Math.cos(angle) * petal * 1.6, Math.sin(angle) * petal * 1.6)
      path.arc(Math.cos(angle) * petal, Math.sin(angle) * petal, petal, 0, Math.PI * 2)
    }
  }
  return path
}

function pathFor(shape: ConfettiShape): Path2D {
  let path = pathCache.get(shape)
  if (!path) {
    path = buildShape(shape)
    pathCache.set(shape, path)
  }
  return path
}

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  flip: number
  flipSpeed: number
  size: number
  path: Path2D
  color: string
  age: number
  life: number
}

interface Emitter {
  until: number
  rate: number
  carry: number
  spawn: () => Piece
}

let pieces: Piece[] = []
let emitters: Emitter[] = []

const layer: EffectLayer = {
  step(ctx, dt, dpr, now) {
    const height = window.innerHeight
    emitters = emitters.filter((emitter) => emitter.until > now)
    for (const emitter of emitters) {
      emitter.carry += emitter.rate * dt
      while (emitter.carry >= 1) {
        pieces.push(emitter.spawn())
        emitter.carry -= 1
      }
    }
    pieces = pieces.filter((piece) => piece.age < piece.life && piece.y < height + 80)

    for (const piece of pieces) {
      piece.age += dt
      piece.vx -= piece.vx * DRAG * dt
      piece.vy += (GRAVITY - piece.vy * DRAG) * dt
      piece.x += piece.vx * dt
      piece.y += piece.vy * dt
      piece.rot += piece.spin * dt
      piece.flip += piece.flipSpeed * dt

      const fade = Math.min(1, Math.max(0, (piece.life - piece.age) / 0.6))
      ctx.globalAlpha = fade
      ctx.fillStyle = piece.color
      const scale = (piece.size / SIZE) * dpr
      const cos = Math.cos(piece.rot)
      const sin = Math.sin(piece.rot)
      const flatten = Math.cos(piece.flip)
      ctx.setTransform(
        scale * cos,
        scale * sin,
        -scale * sin * flatten,
        scale * cos * flatten,
        piece.x * dpr,
        piece.y * dpr,
      )
      ctx.translate(-SIZE / 2, -SIZE / 2)
      ctx.fill(piece.path)
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    return pieces.length > 0 || emitters.length > 0
  },
}

function burst(origin: EffectOrigin | undefined, options: ConfettiOptions): () => void {
  const noop = () => {}
  if (typeof window === 'undefined' || reducedMotion()) return noop

  const top = options.from === 'top'
  const point = originPoint(origin)
  const colors = options.colors?.length ? options.colors : readThemeColors(point.el, ROLES)
  const shapes = options.shapes?.length ? options.shapes : DEFAULT_SHAPES
  const count = options.count ?? (top ? 160 : 80)
  const spread = ((options.spread ?? 70) * Math.PI) / 180
  const angle = ((options.angle ?? 0) * Math.PI) / 180
  const speed = options.velocity ?? 950
  const size = options.size ?? 14

  // 一次性的雨要散开一段高度，持续的雨只在屏幕上方一点点生成
  const band = options.duration ? 0.05 : 0.4

  const spawn = (): Piece => {
    const direction = angle + (Math.random() - 0.5) * spread
    const velocity = top ? 100 + Math.random() * 200 : speed * (0.55 + Math.random() * 0.6)
    return {
      x: top ? Math.random() * window.innerWidth : point.x,
      y: top ? -20 - Math.random() * window.innerHeight * band : point.y,
      vx: top ? (Math.random() - 0.5) * 200 : Math.sin(direction) * velocity,
      vy: top ? velocity : -Math.cos(direction) * velocity,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 12,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 4 + Math.random() * 8,
      size: size * (0.7 + Math.random() * 0.6),
      path: pathFor(shapes[Math.floor(Math.random() * shapes.length)] ?? 'square'),
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#2196f3',
      age: 0,
      life: top ? 4 + Math.random() * 1.5 : 2.4 + Math.random() * 1.2,
    }
  }

  const stopLayer = runEffectCanvas(layer)
  let emitter: Emitter | null = null

  if (options.duration && options.duration > 0) {
    emitter = { until: performance.now() + options.duration, rate: count, carry: 0, spawn }
    emitters.push(emitter)
  } else {
    for (let index = 0; index < count; index += 1) pieces.push(spawn())
  }

  return () => {
    if (emitter) emitter.until = 0
    // 已经飞出去的纸片继续落完；画布在最后一层结束时自动摘掉
    if (pieces.length === 0 && emitters.length === 0) stopLayer()
  }
}

/**
 * 撒花组合式函数。
 * 从指针：fire(event)；从元素：fire(el)；顶部礼花雨：fire({ from: 'top', duration: 3000 })。
 */
export function useConfetti() {
  function fire(origin?: EffectOrigin | ConfettiOptions, options?: ConfettiOptions): () => void {
    const isOrigin =
      origin instanceof Event ||
      (typeof Element !== 'undefined' && origin instanceof Element) ||
      (origin !== undefined && 'x' in origin && 'y' in origin && !('from' in origin))
    if (isOrigin) return burst(origin as EffectOrigin, options ?? {})
    return burst(undefined, { ...(origin as ConfettiOptions | undefined), ...options })
  }

  return { fire }
}
