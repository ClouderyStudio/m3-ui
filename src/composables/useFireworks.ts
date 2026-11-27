import { originPoint, readThemeColors, reducedMotion, runEffectCanvas, type EffectLayer, type EffectOrigin } from '../utils/effects'

/**
 * 礼花（Fireworks）：火箭升到目标高度炸开，火星受重力下落并拖出尾迹。
 *
 * 与撒花的差别在「谁受控」：撒花是一次性的纸片，礼花是持续发射的火箭 ——
 * 所以这里要保存发射状态（下一枚的时间、正在飞的火箭），停止时只停发射，
 * 空中的火星仍然落完，不会在半空突然消失。
 */
export interface FireworksOptions {
  /** 屏幕宽度内同时存在的礼花数量上限（默认 2）。 */
  count?: number
  /** 持续时长（ms）；不传就一直放，直到 stop()。 */
  duration?: number
  /** 任意 CSS 颜色；默认取主题色。 */
  colors?: string[]
  /** 从哪里发射（默认屏幕底部中央）。 */
  origin?: EffectOrigin
  /** 火星尺寸倍率。 */
  size?: number
}

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  color: string
}

const GRAVITY = 320
const DRAG = 0.9
const ROLES = ['primary', 'secondary', 'tertiary', 'primary-container', 'secondary-container']

let rockets: Rocket[] = []
let sparks: Spark[] = []
let nextAt = 0
let until = 0
let running = false
let config: Required<Omit<FireworksOptions, 'origin' | 'duration' | 'colors'>> & { colors: string[]; origin: { x: number; y: number } } = {
  count: 2,
  colors: [],
  origin: { x: 0, y: 0 },
  size: 1,
}

function explode(rocket: Rocket, size: number): void {
  const pieces = 42
  for (let index = 0; index < pieces; index += 1) {
    const angle = (index / pieces) * Math.PI * 2
    const speed = 120 + Math.random() * 240
    sparks.push({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 0.9 + Math.random() * 0.8,
      size: (2 + Math.random() * 2) * size,
      color: rocket.color,
    })
  }
}

const layer: EffectLayer = {
  step(ctx, dt, dpr, now) {
    const { width, height } = { width: window.innerWidth, height: window.innerHeight }

    if (running && (until === 0 || now < until) && rockets.length < config.count) {
      if (now >= nextAt) {
        nextAt = now + 320 + Math.random() * 420
        const color = config.colors[Math.floor(Math.random() * config.colors.length)] ?? '#2196f3'
        rockets.push({
          x: config.origin.x + (Math.random() - 0.5) * Math.min(420, width * 0.5),
          y: height,
          vy: -(height * (0.55 + Math.random() * 0.25)) / 1.1,
          targetY: height * (0.12 + Math.random() * 0.28),
          color,
        })
      }
    }

    for (const rocket of rockets) {
      rocket.y += rocket.vy * dt
      rocket.vy += GRAVITY * 0.35 * dt
    }

    rockets = rockets.filter((rocket) => {
      if (rocket.vy < 0 && rocket.y > rocket.targetY) return true
      explode(rocket, config.size)
      return false
    })

    for (const spark of sparks) {
      spark.age += dt
      spark.vx -= spark.vx * DRAG * dt
      spark.vy += (GRAVITY - spark.vy * DRAG) * dt
      spark.x += spark.vx * dt
      spark.y += spark.vy * dt
    }
    sparks = sparks.filter((spark) => spark.age < spark.life)

    ctx.globalCompositeOperation = 'lighter'
    for (const rocket of rockets) {
      ctx.globalAlpha = 0.9
      ctx.fillStyle = rocket.color
      ctx.beginPath()
      ctx.arc(rocket.x * dpr, rocket.y * dpr, 2.6 * dpr, 0, Math.PI * 2)
      ctx.fill()
    }
    for (const spark of sparks) {
      const fade = 1 - spark.age / spark.life
      ctx.globalAlpha = Math.max(0, fade) * 0.9
      ctx.fillStyle = spark.color
      ctx.beginPath()
      ctx.arc(spark.x * dpr, spark.y * dpr, Math.max(0.4, spark.size * fade) * dpr, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    return running || rockets.length > 0 || sparks.length > 0
  },
}

let stopLayer: (() => void) | null = null

function ensure(): boolean {
  if (typeof window === 'undefined' || reducedMotion()) return false
  if (!stopLayer) stopLayer = runEffectCanvas(layer)
  return stopLayer !== null
}

export function useFireworks() {
  /** 开始放礼花；再次调用会重置计时。 */
  function start(options: FireworksOptions = {}): void {
    if (!ensure()) return
    const point = originPoint(options.origin)
    config = {
      count: options.count ?? 2,
      colors:
        options.colors?.length && options.colors.length > 0
          ? options.colors
          : readThemeColors(point.el, ROLES),
      origin: { x: point.x, y: point.y },
      size: options.size ?? 1,
    }
    running = true
    until = options.duration ? performance.now() + options.duration : 0
    nextAt = performance.now()
  }

  /** 停止发射；空中的火星继续落完。 */
  function stop(): void {
    running = false
    until = 0
  }

  /** 立刻清空。 */
  function clear(): void {
    running = false
    until = 0
    rockets = []
    sparks = []
    stopLayer = null
  }

  return { start, stop, clear }
}
