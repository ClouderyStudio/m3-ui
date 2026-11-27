/**
 * 共享的动效判断。
 *
 * 组件里凡是要「按帧动画」的地方（Tabs 指示条、AnimatedNumber），
 * 都要先问一句系统是否要求减少动态效果：CSS 侧已经削减过一轮，
 * JS 驱动的动画没有对应的媒体查询，必须自己判断。
 *
 * 注意这里**不缓存**结果：用户在系统设置里切换「动画效果」后，
 * 已经打开的页面会立即生效，不需要刷新。
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 与 --md-sys-motion-easing-emphasized-decelerate 近似的缓动曲线。 */
export function emphasizedEase(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}
