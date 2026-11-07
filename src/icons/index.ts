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
/** Material Symbols: error / warning / info / check-circle（提示类组件内置用） */
export const IconError = svg(
  'M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.212 8.1T22 12t-.788 3.9t-2.137 3.175T15.9 21.212T12 22',
  'IconError',
)

export const IconWarning = svg(
  'M1 21L12 2l11 19zm11-3q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m-1-3h2v-5h-2zm1.713-1.288',
  'IconWarning',
)

export const IconInfo = svg(
  'M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.212 8.1T22 12t-.788 3.9t-2.137 3.175T15.9 21.212T12 22',
  'IconInfo',
)

export const IconCheckCircle = svg(
  'm10.6 13.8l-2.15-2.15L7 13.1l3.6 3.6l7.1-7.1l-1.45-1.45zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.212 8.1T22 12t-.788 3.9t-2.137 3.175T15.9 21.212T12 22',
  'IconCheckCircle',
)

/** Material Symbols: visibility / visibility-off（密码可见切换） */
export const IconVisibility = svg(
  'M12 16q1.875 0 3.188-1.312T16.5 11.5t-1.312-3.187T12 7T8.813 8.313T7.5 11.5t1.313 3.188T12 16m0-1.8q-1.125 0-1.912-.787T9.3 11.5t.788-1.912T12 8.8t1.913.788t.787 1.912t-.787 1.913T12 14.2m0 3.8q-3.65 0-6.65-2.037T1 11.5q.35-2.425 3.35-4.463T12 5t6.65 2.037T21 11.5q-.35 2.425-3.35 4.463T12 18',
  'IconVisibility',
)

export const IconVisibilityOff = svg(
  'm19.8 22.6l-4.2-4.15q-.9.275-1.775.413T12 19q-3.65 0-6.65-2.037T1 12q.3-1.9 1.738-3.488T6.25 6L1.4 1.15L2.85-.3L21.25 21.15zM12 16q.275 0 .525-.025t.5-.1L8.1 10.95q-.075.25-.087.513T8 12q0 1.65 1.175 2.825T12 16m0-9q3.65 0 6.65 2.038T22 13q-.35 1.6-1.325 2.963T18.5 18.2l-3.05-3.05q.275-.4.413-.9T16 13.1q0-1.65-1.175-2.825T12 9.1q-.45 0-.95.15t-.9.4L7.2 6.7q1.1-.5 2.325-.75T12 5.7',
  'IconVisibilityOff',
)

/** Material Symbols: search（空状态默认图标） */
export const IconSearch = svg(
  'M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6l-1.4 1.4l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14',
  'IconSearch',
)

/** Material Symbols: chevron-left / chevron-right（分页） */
export const IconChevronLeft = svg(
  'M14 18l-6-6l6-6l1.4 1.4l-4.6 4.6l4.6 4.6z',
  'IconChevronLeft',
)

export const IconChevronRight = svg(
  'M9.4 18L8 16.6l4.6-4.6L8 7.4L9.4 6l6 6z',
  'IconChevronRight',
)

/** 图标组件的形状；外面传图标时用它标注类型。 */
export type { IconComponent } from '../types'
