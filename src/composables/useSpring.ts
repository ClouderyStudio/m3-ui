import { onBeforeUnmount, onMounted, watch } from 'vue'
import { prefersReducedMotion } from '../utils/motion'

/**
 * 数值弹簧：一组数字按真实弹簧积分趋近目标，每帧通过 apply 写回。
 *
 * 与 CSS transition 的分工：颜色、透明度交给 CSS；**形状与位移**用弹簧 ——
 * M3 Expressive 的圆角/尺寸变化是「先冲过去一点再收住」，
 * 线性或三次缓动做不出这种手感（ToggleButton 的胶囊→小圆角就是例子）。
 *
 * 积分用半隐式欧拉 + 4ms 固定子步：掉帧时大步长会让硬弹簧发散，
 * 固定子步既稳定，又保证不同刷新率下轨迹一致。
 */
export interface SpringSpec {
  /** 刚度。越大越快。 */
  stiffness: number
  /** 阻尼比。1 为临界阻尼（不过冲），0.9 会轻微过冲。 */
  dampingRatio: number
}

/** M3 标准动效方案里的四组弹簧。 */
export const SPRINGS = {
  /** FastSpatial：小范围位移、形状变化。 */
  fastSpatial: { stiffness: 1400, dampingRatio: 0.9 },
  /** DefaultSpatial：中等位移。 */
  defaultSpatial: { stiffness: 700, dampingRatio: 0.9 },
  /** FastEffects：透明度、颜色类效果。 */
  fastEffects: { stiffness: 3800, dampingRatio: 1 },
  /** DefaultEffects：慢一些的效果。 */
  defaultEffects: { stiffness: 1600, dampingRatio: 1 },
} satisfies Record<string, SpringSpec>

const SUBSTEP = 0.004

export interface SpringControls {
  /** 直接跳到目标值，不播放动画。 */
  snap: () => void
}

export function useSpring(
  target: () => readonly number[],
  apply: (values: readonly number[]) => void,
  spec: SpringSpec = SPRINGS.fastSpatial,
): SpringControls {
  let current = [...target()]
  let velocity = current.map(() => 0)
  let frame = 0
  let last = 0

  function step(now: number): void {
    let dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    const goal = target()

    if (goal.length !== current.length) {
      current = [...goal]
      velocity = goal.map(() => 0)
    }

    const k = spec.stiffness
    const c = 2 * spec.dampingRatio * Math.sqrt(k)
    while (dt > 0) {
      const h = Math.min(dt, SUBSTEP)
      dt -= h
      for (let index = 0; index < goal.length; index += 1) {
        const goalValue = goal[index] ?? 0
        velocity[index] = (velocity[index] ?? 0) + (-k * ((current[index] ?? 0) - goalValue) - c * (velocity[index] ?? 0)) * h
        current[index] = (current[index] ?? 0) + (velocity[index] ?? 0) * h
      }
    }

    const settled = goal.every(
      (value, index) => Math.abs(value - (current[index] ?? 0)) < 0.05 && Math.abs(velocity[index] ?? 0) < 0.05,
    )
    if (settled) {
      current = [...goal]
      velocity = goal.map(() => 0)
    }

    apply(current)
    frame = settled ? 0 : requestAnimationFrame(step)
  }

  function start(): void {
    if (frame) return
    if (prefersReducedMotion()) {
      current = [...target()]
      velocity = current.map(() => 0)
      apply(current)
      return
    }
    last = performance.now()
    frame = requestAnimationFrame(step)
  }

  function snap(): void {
    cancelAnimationFrame(frame)
    frame = 0
    current = [...target()]
    velocity = current.map(() => 0)
    apply(current)
  }

  watch(() => target().join(','), start)
  onMounted(() => apply(current))
  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return { snap }
}
