import { originPoint, type EffectOrigin } from '../utils/effects'

/**
 * 飘心 / 飘表情：从一点浮起一个 emoji 或短文本，边飘边摆，然后淡出。
 *
 * 用 Web Animation（合成器线程）而不是 canvas：单个元素只要 transform/opacity，
 * 交给合成器最省；canvas 方案还得自己管字形渲染与 DPR。
 *
 * 与上游的差别：上游支持 Material Symbols 的图标名，本项目用内联 SVG 图标、
 * 没有图标字体，所以这里只接受**文本/emoji**（图标请用 M3Icon 自己叠）。
 */
export type ReactionContent = string | { text: string; color?: string }

export interface ReactionOptions {
  /** 同时飘起几个（默认 1）。 */
  count?: number
  /** 尺寸（px，默认 32）。 */
  size?: number
  /** 上升距离（px，默认 260）。 */
  distance?: number
  /** 持续时间（ms，默认 2200）。 */
  duration?: number
  /** 左右摆幅（px，默认 20）。 */
  sway?: number
}

let layer: HTMLElement | null = null
let alive = 0

function ensureLayer(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (layer) return layer
  layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText =
    'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2147483000'
  document.body.appendChild(layer)
  return layer
}

function release(element: HTMLElement): void {
  element.remove()
  alive -= 1
  if (alive <= 0 && layer) {
    layer.remove()
    layer = null
    alive = 0
  }
}

const easeOut = (t: number): number => 1 - (1 - t) ** 2

/** 采样一条「上浮 + 摆动 + 先弹一下再缩」的路径。 */
function floatFrames(distance: number, sway: number, phase: number, drift: number): Keyframe[] {
  const frames: Keyframe[] = []
  const steps = 30
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    const y = -distance * easeOut(t)
    const wave = Math.sin(phase + t * Math.PI * 2.4)
    const x = sway * wave * (0.4 + 0.6 * t) + drift * t
    const scale =
      t < 0.12
        ? 1.15 * easeOut(t / 0.12)
        : t < 0.22
          ? 1.15 - 0.15 * ((t - 0.12) / 0.1)
          : 1 - 0.15 * ((t - 0.22) / 0.78)
    const opacity = t < 0.08 ? t / 0.08 : t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1
    frames.push({
      transform:
        'translate(-50%, -50%) translate(' +
        x.toFixed(1) +
        'px, ' +
        y.toFixed(1) +
        'px) rotate(' +
        (wave * 10).toFixed(1) +
        'deg) scale(' +
        scale.toFixed(3) +
        ')',
      opacity: Number(opacity.toFixed(3)),
    })
  }
  return frames
}

/**
 * 飘一个反应：react(event, '🎉') 从指针、react(el, '❤️', { count: 5 }) 从元素。
 * 减少动态效果时只在原地淡入淡出（不是完全不出现）。
 */
export function useReactions() {
  function react(origin: EffectOrigin | undefined, content: ReactionContent, options: ReactionOptions = {}): void {
    if (typeof window === 'undefined') return
    const host = ensureLayer()
    if (!host) return

    const point = originPoint(origin)
    const text = typeof content === 'string' ? content : content.text
    const color = typeof content === 'string' ? undefined : content.color
    const size = options.size ?? 32
    const count = Math.max(1, options.count ?? 1)
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = options.duration ?? 2200

    for (let index = 0; index < count; index += 1) {
      const element = document.createElement('span')
      element.textContent = text
      element.style.cssText =
        'position:absolute;left:' +
        point.x +
        'px;top:' +
        point.y +
        'px;line-height:1;font-size:' +
        size +
        'px;white-space:nowrap;opacity:0;will-change:transform,opacity' +
        (color ? ';color:' + color : '')
      host.appendChild(element)
      alive += 1

      const frames = reduced
        ? [
            { transform: 'translate(-50%, -50%)', opacity: 0 },
            { transform: 'translate(-50%, -50%)', opacity: 1, offset: 0.2 },
            { transform: 'translate(-50%, -50%)', opacity: 0 },
          ]
        : floatFrames(
            (options.distance ?? 260) * (0.8 + Math.random() * 0.4),
            (options.sway ?? 20) * (0.7 + Math.random() * 0.6),
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 40,
          )

      const animation = element.animate(frames, {
        duration: reduced ? 1200 : duration * (0.9 + Math.random() * 0.2),
        delay: index * 90,
        easing: 'linear',
        fill: 'both',
      })

      let done = false
      const end = (): void => {
        if (done) return
        done = true
        release(element)
      }
      animation.addEventListener('finish', end, { once: true })
      animation.addEventListener('cancel', end, { once: true })
    }
  }

  return { react }
}
