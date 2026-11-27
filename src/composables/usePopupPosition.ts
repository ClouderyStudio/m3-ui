import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * 把弹层贴到锚点上的定位计算（菜单 / 自动完成 / 日期面板共用）。
 *
 * 规则与 M3Menu 一致：先按请求的方向摆，下方放不下就翻到上方，
 * 再横向夹在视口里；面板打开期间跟随滚动与缩放。
 * 之所以抽出来：这一批新增的 7 个组件都要它，各写一遍必然会在
 * 「贴边留多少」「翻转后对齐哪条边」上分叉。
 */
export type PanelPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface PanelOptions {
  placement?: PanelPlacement
  /** 锚点与面板之间的间距。 */
  gap?: number
  /** 距视口边的最小留白。 */
  padding?: number
  /** 面板宽度与锚点一致（下拉、日期面板用）。 */
  matchWidth?: boolean
  minWidth?: number
  maxWidth?: number
}

export function useAnchoredPanel(
  anchor: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  options: PanelOptions = {},
) {
  const style = ref<Record<string, string>>({ top: '0px', left: '0px' })

  function place(): void {
    const anchorEl = anchor.value
    if (!anchorEl) return

    const gap = options.gap ?? 4
    const pad = options.padding ?? 8
    const placement = options.placement ?? 'bottom-start'
    const alignEnd = placement.endsWith('end')
    const preferTop = placement.startsWith('top')

    const rect = anchorEl.getBoundingClientRect()
    const panelEl = panel.value
    const width = panelEl?.offsetWidth ?? options.minWidth ?? 0
    const height = panelEl?.offsetHeight ?? 0

    let left = alignEnd ? rect.right - width : rect.left
    if (options.matchWidth) left = rect.left
    const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY
    const minWidth = options.minWidth ?? 0
    left = Math.min(Math.max(left, pad), Math.max(pad, window.innerWidth - Math.max(width, minWidth) - pad))

    let top = preferTop ? rect.top - gap - height : rect.bottom + gap
    if (height > 0) {
      const overflowsBottom = top + height > window.innerHeight - pad
      const overflowsTop = top < pad
      if (!preferTop && overflowsBottom && rect.top - gap - height > pad) top = rect.top - gap - height
      else if (preferTop && overflowsTop && rect.bottom + gap + height < window.innerHeight - pad) top = rect.bottom + gap
    }

    style.value = {
      top: top + 'px',
      left: left + 'px',
      ...(options.matchWidth ? { width: rect.width + 'px' } : {}),
      ...(Number.isFinite(maxWidth) ? { maxWidth: Math.min(maxWidth, window.innerWidth - 2 * pad) + 'px' } : {}),
      ...(minWidth ? { minWidth: minWidth + 'px' } : {}),
    }
  }

  function update(): void {
    place()
  }

  function stopTracking(): void {
    window.removeEventListener('resize', place)
    window.removeEventListener('scroll', place, true)
  }

  function startTracking(): void {
    stopTracking()
    window.addEventListener('resize', place)
    // 捕获阶段监听：面板嵌在滚动容器里也能跟着走
    window.addEventListener('scroll', place, true)
  }

  watch(isOpen, async (open) => {
    if (open) {
      await nextTick()
      place()
      startTracking()
    } else {
      stopTracking()
    }
  })

  onBeforeUnmount(stopTracking)

  return { style, update, place }
}
