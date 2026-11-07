/**
 * Material Design 3 组件库。
 *
 * 只用官方 M3 设计令牌实现，不依赖任何第三方 UI 组件库。
 * 配色（--md-sys-color-*）由使用方提供：本包只带结构令牌
 * （形状 / 字阶 / 海拔 / 动效 / 状态层），可换主题色。
 *
 * 分组：
 *   基础控件   Button / IconButton / Icon / Chip / Switch / TextField / Select
 *   容器与布局 Card / Divider / List / ListItem / TopAppBar / Sheet / Menu / MenuItem / Fab
 *   浮层       Dialog / ConfirmDialog / SnackbarHost
 *   状态与反馈 Alert / EmptyState / Skeleton / Pagination
 */
export { default as M3Avatar } from './M3Avatar.vue'
export { default as M3Button } from './M3Button.vue'
export { default as M3Card } from './M3Card.vue'
export { default as M3Chip } from './M3Chip.vue'
export { default as M3Dialog } from './M3Dialog.vue'
export { default as M3Divider } from './M3Divider.vue'
export { default as M3Fab } from './M3Fab.vue'
export { default as M3Icon } from './M3Icon.vue'
export { default as M3IconButton } from './M3IconButton.vue'
export { default as M3List } from './M3List.vue'
export { default as M3ListItem } from './M3ListItem.vue'
export { default as M3Menu } from './M3Menu.vue'
export { default as M3MenuItem } from './M3MenuItem.vue'
export { default as M3SegmentedButton, type SegmentedOption } from './M3SegmentedButton.vue'
export { default as M3Sheet } from './M3Sheet.vue'
export { default as M3Switch } from './M3Switch.vue'
export { default as M3Tooltip } from './M3Tooltip.vue'
export { default as M3TopAppBar } from './M3TopAppBar.vue'

/* ---------- 表单控件 ---------- */
export { default as M3TextField } from './M3TextField.vue'
export { default as M3Select, type SelectOption } from './M3Select.vue'

/* ---------- 浮层 ---------- */
export { default as M3ConfirmDialog, type ConfirmOptions } from './M3ConfirmDialog.vue'
export { default as M3SnackbarHost } from './M3SnackbarHost.vue'

/* ---------- 状态与反馈 ---------- */
export { default as M3Alert } from './M3Alert.vue'
export { default as M3EmptyState } from './M3EmptyState.vue'
export { default as M3Skeleton } from './M3Skeleton.vue'
export { default as M3Pagination } from './M3Pagination.vue'

export type { IconComponent } from '../types'
export {
  IconCheck,
  IconClose,
  IconExpandMore,
  IconError,
  IconWarning,
  IconInfo,
  IconCheckCircle,
  IconVisibility,
  IconVisibilityOff,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from '../icons'
export { vRipple } from '../directives/ripple'
export { vReveal } from '../directives/reveal'
export { useModal, type UseModalOptions, type ModalControls } from '../composables/useModal'
export {
  useSnackbar,
  type SnackbarTone,
  type SnackbarOptions,
  type SnackbarMessage,
} from '../composables/useSnackbar'
