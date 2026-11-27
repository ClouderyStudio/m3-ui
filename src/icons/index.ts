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

/** Material Symbols: remove（checkbox 的 indeterminate 横杠） */
export const IconRemove = svg('M5 13v-2h14v2z', 'IconRemove')

/** Material Symbols: star / star-rate / star-half（评分） */
export const IconStar = svg(
  'm5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z',
  'IconStar',
)

export const IconStarFilled = svg(
  'm5.825 21l2.325-7.6L2 9h7.6L12 1l2.4 8H22l-6.15 4.4l2.325 7.6L12 16.3z',
  'IconStarFilled',
)

export const IconStarHalf = svg(
  'm15.15 16.85l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4v7.8zM5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z',
  'IconStarHalf',
)

/** Material Symbols: content-copy（复制按钮） */
export const IconContentCopy = svg(
  'M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V6h2v14h11v2z',
  'IconContentCopy',
)

/** Material Symbols: arrow-upward / arrow-downward（表格排序、指标趋势） */
export const IconArrowUpward = svg(
  'M11 20V7.825l-5.6 5.6L4 12l8-8l8 8l-1.4 1.425l-5.6-5.6V20z',
  'IconArrowUpward',
)

export const IconArrowDownward = svg(
  'M11 4v12.175l-5.6-5.6L4 12l8 8l8-8l-1.4-1.425l-5.6 5.6V4z',
  'IconArrowDownward',
)

/** Material Symbols: trending-up / trending-down / trending-flat（统计卡） */
export const IconTrendingUp = svg(
  'M3.4 18L2 16.6l7.4-7.45l4 4L18.6 8H16V6h6v6h-2V9.4L13.4 16l-4-4z',
  'IconTrendingUp',
)

export const IconTrendingDown = svg(
  'M16 18v-2h2.6l-5.2-5.15l-4 4L2 7.4L3.4 6l6 6l4-4l6.6 6.6V12h2v6z',
  'IconTrendingDown',
)

export const IconTrendingFlat = svg(
  'm17.5 16.5l-1.425-1.4l2.1-2.1H3v-2h15.175L16.1 8.9l1.425-1.4L22 12z',
  'IconTrendingFlat',
)

/** Material Symbols: more-horiz（面包屑折叠菜单） */
export const IconMoreHoriz = svg(
  'M6 14q-.825 0-1.412-.587T4 12t.588-1.412T6 10t1.413.588T8 12t-.587 1.413T6 14m6 0q-.825 0-1.412-.587T10 12t.588-1.412T12 10t1.413.588T14 12t-.587 1.413T12 14m6 0q-.825 0-1.412-.587T16 12t.588-1.412T18 10t1.413.588T20 12t-.587 1.413T18 14',
  'IconMoreHoriz',
)

/** Material Symbols: first-page / last-page（分页首尾跳转） */
export const IconFirstPage = svg('M6 18V6h2v12zm11 0l-6-6l6-6l1.4 1.4l-4.6 4.6l4.6 4.6z', 'IconFirstPage')

export const IconLastPage = svg('m7 18l-1.4-1.4l4.6-4.6l-4.6-4.6L7 6l6 6zm9 0V6h2v12z', 'IconLastPage')

/** Material Symbols: add（数字步进的加号） */
export const IconAdd = svg('M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z', 'IconAdd')

/** Material Symbols: upload（拖拽上传区） */
export const IconUpload = svg(
  'M11 15V8.85L9.4 10.4L8 9l4-4l4 4l-1.4 1.45L13 8.85V15zM6 20q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z',
  'IconUpload',
)

/** Material Symbols: description（文件条目占位） */
export const IconDescription = svg(
  'M8 18h8v-2H8zm0-4h8v-2H8zm-2 8q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h8l6 6v12q0 .825-.587 1.413T18 22zm7-13V4H6v16h12V9z',
  'IconDescription',
)

/** Material Symbols: arrow-drop-down（拆分按钮的展开箭头） */
export const IconArrowDropDown = svg('m7 10l5 5l5-5z', 'IconArrowDropDown')

/** Material Symbols: calendar_month（日期选择器） */
export const IconCalendar = svg(
  'M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zm0-8h14V6H5z',
  'IconCalendar',
)

/** Material Symbols: schedule（时间选择器） */
export const IconSchedule = svg(
  'M12 21q-1.875 0-3.512-.712t-2.863-1.925t-1.925-2.863T3 12t.712-3.513t1.925-2.862t2.863-1.925T12 3t3.513.713t2.862 1.924t1.925 2.863T21 12t-.712 3.513t-1.925 2.863t-2.863 1.925T12 21m2.1-3.9l1.4-1.4l-2.6-2.6V7h-2v5.6z',
  'IconSchedule',
)

/** Material Symbols: play_arrow / pause（媒体播放） */
export const IconPlay = svg('M8 19V5l11 7z', 'IconPlay')

export const IconPause = svg('M6 19V5h4v14zm8 0V5h4v14z', 'IconPause')

/** Material Symbols: fullscreen / fullscreen_exit（播放器与灯箱） */
export const IconFullscreen = svg(
  'M5 19v-6h2v4h4v2zm14 0h-6v-2h4v-4h2zM5 5h6v2H7v4H5zm14 0v6h-2V7h-4V5z',
  'IconFullscreen',
)

export const IconFullscreenExit = svg(
  'M9 5v4H5V7h2V5zm6 0h2v2h2v2h-4zM5 15h4v2H7v2H5zm10 0h4v4h-2v-2h-2z',
  'IconFullscreenExit',
)

/** Material Symbols: notifications（通知中心） */
export const IconNotifications = svg(
  'M5 17v-2h1.2v-6q0-1.85 1.2-3.225T10.5 4.2V3q0-.425.288-.712T11.5 2h1q.425 0 .713.288T13.5 3v1.2q1.6.4 2.8 1.775T17.5 9v6H19v2zm7-4.5q.625 0 1.063-.437T13.5 11t-.437-1.062T12 9.5t-1.062.438T10.5 11t.438 1.063T12 12.5M10.5 20q0 .625.438 1.063T12 21.5t1.063-.437T13.5 20z',
  'IconNotifications',
)

/** 图标组件的形状；外面传图标时用它标注类型。 */
export type { IconComponent } from '../types'
