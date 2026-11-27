import { computed, type Ref } from 'vue'
import { useMediaQuery } from './useMediaQuery'

/**
 * 设备能力：指针精度、是否支持悬停、是否触摸、是否要求减少动态效果。
 *
 * 这些判断散落在组件里最容易不一致（有的只看触摸、有的只看宽度）。
 * 统一走媒体查询：hover 也决定了「悬停才显示的按钮」在触摸屏上要不要一直显示。
 */
export interface DeviceInfo {
  /** 主指针是否精确（鼠标/触控板）。 */
  coarsePointer: Ref<boolean>
  /** 是否支持悬停。 */
  hover: Ref<boolean>
  /** 是否是触摸设备。 */
  touch: Ref<boolean>
  /** 系统是否要求减少动态效果。 */
  reducedMotion: Ref<boolean>
  /** 设备像素比。 */
  dpr: Ref<number>
  /** 粗指针或触摸：适合用更大的点按目标。 */
  isTouch: Ref<boolean>
}

export function useDevice(): DeviceInfo {
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const hover = useMediaQuery('(hover: hover)')
  const touch = useMediaQuery('(any-pointer: coarse)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const dpr = computed(() => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1))

  return {
    coarsePointer,
    hover,
    touch,
    reducedMotion,
    dpr,
    isTouch: computed(() => coarsePointer.value || touch.value),
  }
}
