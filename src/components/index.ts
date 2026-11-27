/**
 * Material Design 3 组件库。
 *
 * 只用官方 M3 设计令牌实现，不依赖任何第三方 UI 组件库。
 * 配色（--md-sys-color-*）由使用方提供：本包只带结构令牌
 * （形状 / 字阶 / 海拔 / 动效 / 状态层），可换主题色。
 *
 * 分组：
 *   基础控件   Button / IconButton / Icon / ToggleButton / SplitButton / Chip /
 *              Checkbox / RadioGroup / Switch / Slider / Rating / Progress
 *   表单       TextField / NumberField / PinInput / PasswordMeter / MaskField /
 *              PhoneInput / CountrySelect / TimezoneSelect / TagInput /
 *              Autocomplete / MultiSelect / FileUpload / Select / SearchBar
 *   日期时间   Calendar / DatePicker / TimePicker / DateRangePicker /
 *              AvailabilityCalendar / CalendarHeatmap / Countdown
 *   容器与布局 Card / Divider / List / ListGroup / ListSubheader / ListItem /
 *              TopAppBar / AppBarWithSearch / BottomAppBar / ShortNavigationBar /
 *              Sheet / Menu / MenuItem / Fab / Avatar / Badge / ExpansionPanel /
 *              Tabs / Splitter / Masonry / DashboardGrid / ContainerTransform
 *   导航       NavigationBar / NavigationRail / NavigationSuite / NavigationDrawer /
 *              Breadcrumbs / Stepper / Pagination / CommandPalette / PageProgress
 *   数据展示   Table / VirtualTable / TreeTable / Tree / DiffViewer / JsonViewer /
 *              Timeline / InfiniteScroll / TransferList / SwipeToDismiss /
 *              FilterBuilder / StatCard / Sparkline / AnimatedNumber / RelativeTime /
 *              Kbd / CopyButton / Hotkeys
 *   浮层       Dialog / ConfirmDialog / SnackbarHost / NotificationHost /
 *              NotificationCenter / CommandPalette / ContextMenu / Tour /
 *              LoadingOverlay
 *   媒体       Carousel / SimpleCarousel / Lightbox / VideoPlayer / AudioPlayer /
 *              CameraCapture / ImageCropper / SignaturePad
 *   主题       ThemePicker（配合 useTheme / THEME_PRESETS）
 *   状态与反馈 Alert / EmptyState / Skeleton
 */
export { default as M3Alert } from './M3Alert.vue'
export { default as M3AnimatedNumber } from './M3AnimatedNumber.vue'
export { default as M3AppBarWithSearch } from './M3AppBarWithSearch.vue'
export { default as M3AudioPlayer } from './M3AudioPlayer.vue'
export { default as M3Autocomplete, type AutocompleteOption } from './M3Autocomplete.vue'
export { default as M3Avatar } from './M3Avatar.vue'
export {
  default as M3AvailabilityCalendar,
  type AvailabilityDay,
} from './M3AvailabilityCalendar.vue'
export { default as M3Badge } from './M3Badge.vue'
export { default as M3BottomAppBar } from './M3BottomAppBar.vue'
export { default as M3Breadcrumbs, type BreadcrumbItem } from './M3Breadcrumbs.vue'
export { default as M3Button } from './M3Button.vue'
export { default as M3Calendar } from './M3Calendar.vue'
export { default as M3CalendarHeatmap } from './M3CalendarHeatmap.vue'
export { default as M3CameraCapture } from './M3CameraCapture.vue'
export { default as M3Card } from './M3Card.vue'
export { default as M3Carousel } from './M3Carousel.vue'
export { default as M3Checkbox } from './M3Checkbox.vue'
export { default as M3Chip } from './M3Chip.vue'
export { default as M3CommandPalette, type CommandItem } from './M3CommandPalette.vue'
export { default as M3ConfirmDialog, type ConfirmOptions } from './M3ConfirmDialog.vue'
export { default as M3ContainerTransform } from './M3ContainerTransform.vue'
export { default as M3ContextMenu } from './M3ContextMenu.vue'
export { default as M3CopyButton } from './M3CopyButton.vue'
export { default as M3Countdown, type CountdownUnit, type CountdownParts } from './M3Countdown.vue'
export { default as M3CountrySelect } from './M3CountrySelect.vue'
export { default as M3DashboardGrid, type DashboardItem } from './M3DashboardGrid.vue'
export { default as M3DatePicker } from './M3DatePicker.vue'
export { default as M3DateRangePicker, type DateRange } from './M3DateRangePicker.vue'
export { default as M3Dialog } from './M3Dialog.vue'
export { default as M3DiffViewer } from './M3DiffViewer.vue'
export { default as M3Divider } from './M3Divider.vue'
export { default as M3EmptyState } from './M3EmptyState.vue'
export { default as M3ExpansionPanel } from './M3ExpansionPanel.vue'
export { default as M3Fab } from './M3Fab.vue'
export { default as M3FileUpload, type UploadFile } from './M3FileUpload.vue'
export { default as M3FilterBuilder } from './M3FilterBuilder.vue'
export { default as M3Hotkeys, type HotkeyBinding } from './M3Hotkeys.vue'
export { default as M3Icon } from './M3Icon.vue'
export { default as M3IconButton } from './M3IconButton.vue'
export { default as M3ImageCropper } from './M3ImageCropper.vue'
export { default as M3InfiniteScroll } from './M3InfiniteScroll.vue'
export { default as M3JsonViewer } from './M3JsonViewer.vue'
export { default as M3Kbd } from './M3Kbd.vue'
export { default as M3Lightbox, type LightboxImage } from './M3Lightbox.vue'
export { default as M3List } from './M3List.vue'
export { default as M3ListGroup } from './M3ListGroup.vue'
export { default as M3ListItem } from './M3ListItem.vue'
export { default as M3ListSubheader } from './M3ListSubheader.vue'
export { default as M3LoadingOverlay } from './M3LoadingOverlay.vue'
export { default as M3Masonry } from './M3Masonry.vue'
export { default as M3MaskField } from './M3MaskField.vue'
export { default as M3Menu } from './M3Menu.vue'
export { default as M3MenuItem } from './M3MenuItem.vue'
export { default as M3MultiSelect, type MultiSelectOption } from './M3MultiSelect.vue'
export { default as M3NavigationBar, type NavBarItem } from './M3NavigationBar.vue'
export { default as M3NavigationDrawer, type DrawerItem } from './M3NavigationDrawer.vue'
export { default as M3NavigationRail, type NavRailItem } from './M3NavigationRail.vue'
export { default as M3NavigationSuite, type SuiteItem } from './M3NavigationSuite.vue'
export { default as M3NotificationCenter, type InboxNotification } from './M3NotificationCenter.vue'
export { default as M3NotificationHost } from './M3NotificationHost.vue'
export { default as M3NumberField } from './M3NumberField.vue'
export { default as M3PageProgress } from './M3PageProgress.vue'
export { default as M3Pagination } from './M3Pagination.vue'
export { default as M3PasswordMeter } from './M3PasswordMeter.vue'
export { default as M3PhoneInput } from './M3PhoneInput.vue'
export { default as M3PinInput } from './M3PinInput.vue'
export { default as M3Progress } from './M3Progress.vue'
export { default as M3PullToRefresh } from './M3PullToRefresh.vue'
export { default as M3RadioGroup, type RadioOption } from './M3RadioGroup.vue'
export { default as M3Rating } from './M3Rating.vue'
export { default as M3RelativeTime } from './M3RelativeTime.vue'
export { default as M3SearchBar } from './M3SearchBar.vue'
export { default as M3SegmentedButton, type SegmentedOption } from './M3SegmentedButton.vue'
export { default as M3Select, type SelectOption } from './M3Select.vue'
export { default as M3Sheet } from './M3Sheet.vue'
export { default as M3ShortNavigationBar, type ShortNavItem } from './M3ShortNavigationBar.vue'
export { default as M3SignaturePad } from './M3SignaturePad.vue'
export { default as M3SimpleCarousel, type SimpleCarouselSlide } from './M3SimpleCarousel.vue'
export { default as M3Skeleton } from './M3Skeleton.vue'
export { default as M3Slider } from './M3Slider.vue'
export { default as M3SnackbarHost } from './M3SnackbarHost.vue'
export { default as M3Sparkline } from './M3Sparkline.vue'
export { default as M3SplitButton, type SplitButtonItem } from './M3SplitButton.vue'
export { default as M3Splitter } from './M3Splitter.vue'
export { default as M3StatCard } from './M3StatCard.vue'
export { default as M3Stepper, type StepItem } from './M3Stepper.vue'
export { default as M3SwipeToDismiss, type SwipeToDismissValue } from './M3SwipeToDismiss.vue'
export { default as M3Switch } from './M3Switch.vue'
export {
  default as M3Table,
  type TableAlign,
  type TableColumn,
  type TableSort,
} from './M3Table.vue'
export { default as M3Tabs, type TabItem } from './M3Tabs.vue'
export { default as M3TagInput } from './M3TagInput.vue'
export { default as M3TextField } from './M3TextField.vue'
export { default as M3ThemePicker } from './M3ThemePicker.vue'
export { default as M3Timeline, type TimelineItem, type TimelineStatus } from './M3Timeline.vue'
export { default as M3TimePicker } from './M3TimePicker.vue'
export { default as M3TimezoneSelect } from './M3TimezoneSelect.vue'
export { default as M3ToggleButton } from './M3ToggleButton.vue'
export { default as M3Tooltip } from './M3Tooltip.vue'
export { default as M3TopAppBar } from './M3TopAppBar.vue'
export { default as M3Tour, type TourStep } from './M3Tour.vue'
export { default as M3TransferList, type TransferItem } from './M3TransferList.vue'
export { default as M3Tree, type TreeNode, type TreeContext } from './M3Tree.vue'
export {
  default as M3TreeTable,
  type TreeTableColumn,
  type TreeTableRow,
} from './M3TreeTable.vue'
export { default as M3VideoPlayer } from './M3VideoPlayer.vue'
export { default as M3VirtualTable } from './M3VirtualTable.vue'

export type { IconComponent } from '../types'
export {
  IconAdd,
  IconArrowDownward,
  IconArrowDropDown,
  IconArrowUpward,
  IconCalendar,
  IconCheck,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconContentCopy,
  IconDescription,
  IconError,
  IconExpandMore,
  IconFirstPage,
  IconFullscreen,
  IconFullscreenExit,
  IconInfo,
  IconLastPage,
  IconMoreHoriz,
  IconNotifications,
  IconPause,
  IconPlay,
  IconRemove,
  IconSchedule,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconStarHalf,
  IconTrendingDown,
  IconTrendingFlat,
  IconTrendingUp,
  IconUpload,
  IconVisibility,
  IconVisibilityOff,
  IconWarning,
} from '../icons'
export { vRipple } from '../directives/ripple'
export { vReveal } from '../directives/reveal'
export {
  useAutoGrow,
  type AutoGrowOptions,
} from '../composables/useAutoGrow'
export { useClickOutside, useClickOutsideWhen } from '../composables/useClickOutside'
export { useConfetti, type ConfettiOptions, type ConfettiShape } from '../composables/useConfetti'
export {
  useDebounce,
  useDebouncedRef,
  useThrottle,
  type Cancelable,
} from '../composables/useDebounce'
export { useDevice, type DeviceInfo } from '../composables/useDevice'
export { escapeStackSize, useEscapeStack } from '../composables/useEscapeStack'
export { useEventListener } from '../composables/useEventListener'
export {
  useIntersectionObserver,
  type IntersectionOptions,
} from '../composables/useIntersectionObserver'
export { useLocalStorage, type LocalStorageOptions } from '../composables/useLocalStorage'
export { useMediaQuery } from '../composables/useMediaQuery'
export { useFireworks, type FireworksOptions } from '../composables/useFireworks'
export { useReactions, type ReactionContent, type ReactionOptions } from '../composables/useReactions'
export {
  useScrollReveal,
  type RevealEffect,
  type ScrollRevealOptions,
} from '../composables/useScrollReveal'
export { useModal, type UseModalOptions, type ModalControls } from '../composables/useModal'
export { useResizeObserver } from '../composables/useResizeObserver'
export { SPRINGS, useSpring, type SpringControls, type SpringSpec } from '../composables/useSpring'
export { themeTransition, THEME_TRANSITION_MS } from '../composables/useThemeTransition'
export {
  heightSizeClass,
  useWindowSizeClass,
  widthSizeClass,
  type HeightSizeClass,
  type WidthSizeClass,
  type WindowSizeClassInfo,
} from '../composables/useWindowSizeClass'
export { usePageProgress } from '../composables/usePageProgress'
export { useAnchoredPanel, type PanelOptions, type PanelPlacement } from '../composables/usePopupPosition'
export {
  useTheme,
  THEME_PRESETS,
  type ThemeMode,
  type ThemePreset,
} from '../composables/useTheme'
export { lockScroll, unlockScroll, scrollLocked } from '../composables/useScrollLock'
export {
  useSnackbar,
  type SnackbarTone,
  type SnackbarOptions,
  type SnackbarMessage,
  type SnackbarAction,
} from '../composables/useSnackbar'
export {
  useNotifications,
  type AppNotification,
  type NotificationTone,
  type NotifyOptions,
} from '../composables/useNotifications'
export { diffLines, type DiffOptions, type DiffResult, type DiffRow, type DiffRowType } from '../utils/diff'
export { printElement } from '../utils/print'
export {
  createFilter,
  createRule,
  countRules,
  defaultOperator,
  filterRows,
  matchesFilter,
  operatorLabel,
  operatorsFor,
  type FilterField,
  type FilterFieldType,
  type FilterGroup,
  type FilterOperator,
  type FilterRule,
} from '../utils/filter'
export { COUNTRIES, findCountry, flagOf, formatPhone, phoneDigits, type Country } from '../utils/countries'
export {
  daysBetween,
  formatDate,
  formatTime,
  pad2,
  parseIsoDate,
  parseTime,
  todayIso,
  toIsoDate,
  type TimeParts,
} from '../utils/date'
