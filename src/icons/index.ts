/**
 * 组件库自带的极少数图标。
 *
 * M3 组件里只有三处真正需要渲染图标（chip 的对勾/关闭、segmented 的对勾、sheet 的关闭），
 * 其余地方的 icon 都是从外面传进来的组件。为避免组件库依赖某个站点的图标注册表，
 * 这三个直接内联成 SVG —— 形状取自 Google Material Symbols，和站点用的是同一套图形。
 *
 * 外面传进来的图标只要满足 IconComponent 的形状（Vue 组件，渲染成 <svg>）即可，
 * 不要求来自任何特定的图标库。
 */
import { h, type FunctionalComponent } from 'vue'

type SvgPath = string

function svg(d: SvgPath, name: string): FunctionalComponent {
  const component: FunctionalComponent = () =>
    h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
      h('path', { fill: 'currentColor', d }),
    ])
  component.displayName = name
  return component
}

/** Material Symbols: check */
export const IconCheck = svg('m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z', 'IconCheck')

/** Material Symbols: close */
export const IconClose = svg(
  'M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z',
  'IconClose',
)

/** Material Symbols: expand-more */
export const IconExpandMore = svg(
  'm12 15.375l-6-6l1.4-1.4l4.6 4.6l4.6-4.6l1.4 1.4z',
  'IconExpandMore',
)
/** 图标组件的形状；外面传图标时用它标注类型。 */
export type { IconComponent } from '../types'
