<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import IcoAdd from '~icons/material-symbols/add'
import IcoAnalytics from '~icons/material-symbols/analytics'
import IcoBolt from '~icons/material-symbols/bolt'
import IcoCheck from '~icons/material-symbols/check'
import IcoCloud from '~icons/material-symbols/cloud'
import IcoDark from '~icons/material-symbols/dark-mode'
import IcoDashboard from '~icons/material-symbols/dashboard'
import IcoDelete from '~icons/material-symbols/delete'
import IcoEdit from '~icons/material-symbols/edit'
import IcoFavorite from '~icons/material-symbols/favorite'
import IcoFolder from '~icons/material-symbols/folder'
import IcoHome from '~icons/material-symbols/home'
import IcoLight from '~icons/material-symbols/light-mode'
import IcoNotifications from '~icons/material-symbols/notifications'
import IcoPerson from '~icons/material-symbols/person'
import IcoPhoto from '~icons/material-symbols/photo'
import IcoSearch from '~icons/material-symbols/search'
import IcoSettings from '~icons/material-symbols/settings'
import IcoShare from '~icons/material-symbols/share'
import IcoTask from '~icons/material-symbols/task-alt'
import ComposablesDemo from './ComposablesDemo.vue'
import EffectsDemo from './EffectsDemo.vue'

import {
  M3Alert,
  M3AnimatedNumber,
  M3Avatar,
  M3Badge,
  M3Breadcrumbs,
  M3Button,
  M3Card,
  M3Checkbox,
  M3Chip,
  M3CommandPalette,
  M3ConfirmDialog,
  M3CopyButton,
  M3Countdown,
  M3Dialog,
  M3Divider,
  M3EmptyState,
  M3ExpansionPanel,
  M3Fab,
  M3FileUpload,
  M3Icon,
  M3IconButton,
  M3InfiniteScroll,
  M3Kbd,
  M3List,
  M3ListGroup,
  M3ListItem,
  M3ListSubheader,
  M3LoadingOverlay,
  M3Menu,
  M3MenuItem,
  M3NavigationBar,
  M3NavigationRail,
  M3NumberField,
  M3PageProgress,
  M3Pagination,
  M3PasswordMeter,
  M3PinInput,
  M3Progress,
  M3RadioGroup,
  M3Rating,
  M3RelativeTime,
  M3SearchBar,
  M3SegmentedButton,
  M3Select,
  M3Sheet,
  M3Skeleton,
  M3Slider,
  M3SnackbarHost,
  M3Sparkline,
  M3StatCard,
  M3Stepper,
  M3SplitButton,
  M3Switch,
  M3Table,
  M3Tabs,
  M3TextField,
  M3ThemePicker,
  M3Timeline,
  M3ToggleButton,
  M3Tooltip,
  M3TopAppBar,
  M3Tree,
  usePageProgress,
  useSnackbar,
  useTheme,
  type BreadcrumbItem,
  type CommandItem,
  type NavBarItem,
  type NavRailItem,
  type RadioOption,
  type SelectOption,
  type SplitButtonItem,
  type StepItem,
  type TableColumn,
  type TableSort,
  type TabItem,
  type TimelineItem,
  type TreeNode,
  type UploadFile,
} from '../src'


import {
  M3AppBarWithSearch,
  M3AudioPlayer,
  M3Autocomplete,
  M3AvailabilityCalendar,
  M3BottomAppBar,
  M3Calendar,
  M3CalendarHeatmap,
  M3CameraCapture,
  M3Carousel,
  M3ContextMenu,
  M3CountrySelect,
  M3DashboardGrid,
  M3DatePicker,
  M3DateRangePicker,
  M3DiffViewer,
  M3FilterBuilder,
  M3Hotkeys,
  M3ImageCropper,
  M3JsonViewer,
  M3Lightbox,
  M3Masonry,
  M3MaskField,
  M3MultiSelect,
  M3NavigationDrawer,
  M3NavigationSuite,
  M3NotificationCenter,
  M3NotificationHost,
  M3PhoneInput,
  M3PullToRefresh,
  M3ShortNavigationBar,
  M3SignaturePad,
  M3SimpleCarousel,
  M3Splitter,
  M3SwipeToDismiss,
  M3TagInput,
  M3TimePicker,
  M3TimezoneSelect,
  M3Tour,
  M3TransferList,
  M3TreeTable,
  M3VideoPlayer,
  M3VirtualTable,
  useLocalStorage,
  useNotifications,
  type AutocompleteOption,
  type AvailabilityDay,
  type DashboardItem,
  type DateRange,
  type DrawerItem,
  type FilterField,
  type FilterGroup,
  type HotkeyBinding,
  type InboxNotification,
  type LightboxImage,
  type MultiSelectOption,
  type ShortNavItem,
  type SimpleCarouselSlide,
  type SuiteItem,
  type SwipeToDismissValue,
  type TourStep,
  type TransferItem,
  type TreeTableColumn,
  type TreeTableRow,
} from '../src'

/* ---------- A/B 批次：演示状态 ---------- */
function svgArt(label: string, from: string, to: string): string {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='" + from + "'/><stop offset='1' stop-color='" + to + "'/>" +
    '</linearGradient></defs>' +
    "<rect width='1200' height='675' fill='url(#g)'/>" +
    "<text x='600' y='350' font-family='sans-serif' font-size='72' fill='white' text-anchor='middle'>" + label + '</text>' +
    '</svg>'
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const contextPicked = ref('未选择')
const hotkeyLog = ref<string[]>([])
const hotkeys: HotkeyBinding[] = [
  { keys: 'mod+k', label: '打开命令面板', group: '全局', handler: () => { hotkeyLog.value.unshift('mod+k'); jumpOpen.value = true } },
  { keys: 'mod+s', label: '保存当前文档', group: '全局', handler: () => hotkeyLog.value.unshift('mod+s') },
  { keys: 'shift+/', label: '显示快捷键帮助', group: '全局', handler: () => hotkeyLog.value.unshift('shift+/') },
  { keys: 'escape', label: '关闭浮层', group: '全局', handler: () => hotkeyLog.value.unshift('escape') },
]

const autoValue = ref<string | number | null>('vue')
const autoOptions: AutocompleteOption[] = [
  { value: 'vue', label: 'Vue', description: '渐进式框架' },
  { value: 'vite', label: 'Vite', description: '构建工具' },
  { value: 'pinia', label: 'Pinia', description: '状态管理' },
  { value: 'nuxt', label: 'Nuxt', description: '全栈框架' },
  { value: 'vitest', label: 'Vitest', description: '单元测试' },
]

const multiValues = ref<(string | number)[]>(['ts'])
const multiOptions: MultiSelectOption[] = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'md', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
]

const tagValues = ref(['Vue', 'Vite'])
const maskValue = ref('')
const phone = ref('+8613800138000')
const phoneCountry = ref('CN')
const timezone = ref('Asia/Shanghai')

const dateValue = ref('2026-11-27')
const timeValue = ref('09:30')
const rangeValue = ref<DateRange>({ start: '2026-11-10', end: '2026-11-20' })

const availabilityDays: Record<string, AvailabilityDay> = {
  '2026-11-05': { available: false },
  '2026-11-06': { available: false },
  '2026-11-12': { price: 480 },
  '2026-11-13': { price: 620, label: '仅剩 2 间' },
  '2026-11-14': { price: 880, label: '周末' },
  '2026-11-20': { available: false },
  '2026-11-27': { price: 520 },
}
const selectedStay = ref<string | null>('2026-11-27')

const heatValues: Record<string, number> = {}
for (let index = 0; index < 160; index += 1) {
  const day = new Date(2026, 5, 20)
  day.setDate(day.getDate() + index)
  const iso = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0')
  const weight = (index * 37) % 11
  if (weight > 2) heatValues[iso] = weight
}

const filterFields: FilterField[] = [
  { key: 'name', label: '名称', type: 'text' },
  { key: 'stars', label: 'Star', type: 'number' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'active', label: '启用' },
    { value: 'archived', label: '归档' },
  ] },
  { key: 'updated', label: '更新时间', type: 'date' },
]
const filterValue = ref<FilterGroup | null>({
  id: 'g-1',
  kind: 'group',
  conjunction: 'and',
  children: [
    { id: 'r-1', kind: 'rule', field: 'name', operator: 'contains', value: 'M3' },
    { id: 'r-2', kind: 'rule', field: 'stars', operator: 'gt', value: '100' },
  ],
})

const transferItems: TransferItem[] = [
  { value: 'read', label: '查看', description: '只读权限' },
  { value: 'write', label: '编辑', description: '可修改内容' },
  { value: 'deploy', label: '发布', description: '可上线' },
  { value: 'billing', label: '账单', description: '仅管理员' },
  { value: 'audit', label: '审计日志' },
]
const transferValues = ref<(string | number)[]>(['read'])

const swipeState = ref<SwipeToDismissValue>('settled')

const tourOpen = ref(false)
const tourStep = ref(0)
const tourSteps: TourStep[] = [
  { target: '#tour-anchor-1', title: '命令面板', content: '按 ⌘K 随时呼出，选中即执行。', placement: 'bottom' },
  { target: '#tour-anchor-2', title: '主题配色', content: '换一颗种子色就能得到整套协调的配色。', placement: 'top' },
]

const drawerOpen = ref(false)
const drawerValue = ref('inbox')
const drawerItems: DrawerItem[] = [
  { value: 'inbox', label: '收件箱', icon: IcoNotifications, badge: 3, group: '工作' },
  { value: 'starred', label: '已加星标', icon: IcoFavorite, group: '工作' },
  { value: 'settings', label: '设置', icon: IcoSettings, group: '系统' },
]

const suiteValue = ref('home')
const suiteItems: SuiteItem[] = [
  { value: 'home', label: '首页', icon: IcoHome },
  { value: 'search', label: '搜索', icon: IcoSearch },
  { value: 'profile', label: '我的', icon: IcoPerson },
]

const shortNavValue = ref('home')
const shortNavItems: ShortNavItem[] = suiteItems

const carouselIndex = ref(0)
const carouselSlides: SimpleCarouselSlide[] = [
  { src: svgArt('24° 晴', '#1b5e9f', '#6ec6ff'), alt: '晴', caption: '今天 24°，适合出门' },
  { src: svgArt('多云', '#37474f', '#90a4ae'), alt: '多云', caption: '傍晚转多云' },
  { src: svgArt('小雨', '#0d47a1', '#42a5f5'), alt: '雨', caption: '夜间有小雨' },
]

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxImages: LightboxImage[] = carouselSlides.map((slide) => ({ src: slide.src, alt: slide.alt, caption: slide.caption }))

const signatureValue = ref('')
const cropSource = svgArt('裁剪我', '#00695c', '#80cbc4')
const cropResult = ref('')

const audioSrc = ref('')
const videoSrc = ref('')

const jsonSample = ref({
  name: '@clderystd/m3-ui',
  version: '0.6.0',
  components: 105,
  tokens: ['shape', 'typescale', 'elevation', 'motion'],
  theme: { seed: '#2196f3', modes: ['light', 'dark', 'system'] },
  stable: true,
  deprecated: null,
})

const diffBefore = ref('export function add(a, b) {\n  return a + b\n}\n\nconst list = [1, 2, 3]\nconsole.log(add(1, 2))')
const diffAfter = ref('export function add(a: number, b: number): number {\n  return a + b\n}\n\nconst list = [1, 2, 3, 4]\nconsole.log(add(1, 2))')

const treeTableColumns: TreeTableColumn[] = [
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型', width: '120px' },
  { key: 'size', label: '大小', width: '100px', align: 'end' },
]
const treeTableRows: TreeTableRow[] = [
  { id: 'src', name: 'src', type: '目录', size: '—', children: [
    { id: 'src-btn', name: 'M3Button.vue', type: '文件', size: '8.2 KB' },
    { id: 'src-card', name: 'M3Card.vue', type: '文件', size: '6.1 KB' },
    { id: 'src-tree', name: 'M3Tree.vue', type: '目录', size: '—', children: [
      { id: 'src-tree-node', name: '_M3TreeNode.vue', type: '文件', size: '4.4 KB' },
    ] },
  ] },
  { id: 'docs', name: 'docs', type: '目录', size: '—', children: [
    { id: 'docs-readme', name: 'README.md', type: '文件', size: '12 KB' },
  ] },
]

const virtualColumns = [
  { key: 'id', label: '#', width: '80px' },
  { key: 'name', label: '组件' },
  { key: 'size', label: '大小', width: '120px', align: 'end' as const },
]
const virtualRows = Array.from({ length: 2000 }, (_, index) => ({
  id: index + 1,
  name: 'M3Component' + (index + 1),
  size: (index % 40) + 1 + ' KB',
}))

const splitterSize = ref(40)

const dashboardItems: DashboardItem[] = [
  { id: 'visits', title: '访问量', cols: 2, rows: 1 },
  { id: 'errors', title: '错误率', cols: 1, rows: 1 },
  { id: 'latency', title: '延迟', cols: 1, rows: 1 },
  { id: 'logs', title: '最新日志', cols: 4, rows: 1 },
]
const dashboardOrder = ref(['visits', 'errors', 'latency', 'logs'])

const refreshLoading = ref(false)
async function onRefresh() {
  refreshLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 900))
  refreshLoading.value = false
  showSnack('已刷新')
}

const notifier = useNotifications()
function clearNotifications() {
  notifier.clear()
}
function notifyDemo(tone: 'info' | 'success' | 'warning' | 'error') {
  notifier.notify({
    title: { info: '有新的构建任务', success: '部署成功', warning: '磁盘空间不足', error: '同步失败' }[tone],
    body: { info: 'main 分支已开始构建', success: 'v0.6.0 已上线', warning: '剩余 8%，建议清理', error: '网络中断，稍后重试' }[tone],
    tone,
  })
}

const inbox = ref<InboxNotification[]>([
  { id: 'n1', title: '部署成功', body: 'v0.6.0 已发布到生产环境', time: new Date().toISOString(), icon: IcoCheck, tone: 'success' },
  { id: 'n2', title: '新的评论', body: '林澈 评论了「主题配色」', time: new Date(Date.now() - 3600_000).toISOString(), icon: IcoNotifications },
  { id: 'n3', title: '磁盘空间不足', body: '剩余 8%', time: new Date(Date.now() - 86_400_000).toISOString(), icon: IcoNotifications, tone: 'warning', read: true },
])

const appBarQuery = ref('')
const appBarOpen = ref(false)
const bottomFabCount = ref(0)

/* ---------- 主题 ---------- */
/*
 * Gallery 不再自己管 .dark 与配色：改由 useTheme 的模块单例负责，
 * 顶栏这颗开关和页面里的 ThemePicker 操作的是同一份状态，不会互相覆盖。
 */
const theme = useTheme()
const dark = computed(() => theme.isDark.value)

function toggleTheme() {
  theme.setMode(dark.value ? 'light' : 'dark')
}

/* ---------- 导航 ---------- */
interface Section {
  id: string
  label: string
  group: string
}

const sections: Section[] = [
  { id: 'motion', label: '动效总览', group: '基础' },
  { id: 'theme-picker', label: 'ThemePicker 主题配色', group: '基础' },
  { id: 'icon', label: 'Icon 图标', group: '基础' },
  { id: 'button', label: 'Button 按钮', group: '基础' },
  { id: 'icon-button', label: 'IconButton 图标按钮', group: '基础' },
  { id: 'fab', label: 'Fab 浮动操作', group: '基础' },
  { id: 'chip', label: 'Chip 标签', group: '基础' },
  { id: 'badge', label: 'Badge 徽标', group: '基础' },
  { id: 'segmented', label: 'SegmentedButton 分段', group: '基础' },
  { id: 'toggle-button', label: 'ToggleButton 开关按钮', group: '基础' },
  { id: 'split-button', label: 'SplitButton 拆分按钮', group: '基础' },
  { id: 'kbd', label: 'Kbd 键位', group: '基础' },

  { id: 'text-field', label: 'TextField 输入框', group: '表单' },
  { id: 'number-field', label: 'NumberField 数字框', group: '表单' },
  { id: 'pin-input', label: 'PinInput 验证码', group: '表单' },
  { id: 'password-meter', label: 'PasswordMeter 强度', group: '表单' },
  { id: 'file-upload', label: 'FileUpload 上传', group: '表单' },
  { id: 'select', label: 'Select 下拉', group: '表单' },
  { id: 'search-bar', label: 'SearchBar 搜索栏', group: '表单' },
  { id: 'checkbox', label: 'Checkbox 复选框', group: '表单' },
  { id: 'radio', label: 'RadioGroup 单选', group: '表单' },
  { id: 'switch', label: 'Switch 开关', group: '表单' },
  { id: 'slider', label: 'Slider 滑块', group: '表单' },
  { id: 'rating', label: 'Rating 评分', group: '表单' },
  { id: 'progress', label: 'Progress 进度', group: '表单' },

  { id: 'card', label: 'Card 卡片', group: '容器' },
  { id: 'list', label: 'List 列表', group: '容器' },
  { id: 'list-group', label: 'ListGroup 列表分组', group: '容器' },
  { id: 'avatar', label: 'Avatar 头像', group: '容器' },
  { id: 'expansion', label: 'ExpansionPanel 展开面板', group: '容器' },

  { id: 'stat-card', label: 'StatCard 指标卡', group: '数据' },
  { id: 'sparkline', label: 'Sparkline 迷你图', group: '数据' },
  { id: 'table', label: 'Table 表格', group: '数据' },
  { id: 'tree', label: 'Tree 树形', group: '数据' },
  { id: 'timeline', label: 'Timeline 时间线', group: '数据' },
  { id: 'countdown', label: 'Countdown 倒计时', group: '数据' },
  { id: 'infinite-scroll', label: 'InfiniteScroll 无限滚动', group: '数据' },

  { id: 'tabs', label: 'Tabs 标签页', group: '导航' },
  { id: 'top-app-bar', label: 'TopAppBar 顶栏', group: '导航' },
  { id: 'navigation-bar', label: 'NavigationBar 底部导航', group: '导航' },
  { id: 'navigation-rail', label: 'NavigationRail 侧边导航', group: '导航' },
  { id: 'breadcrumbs', label: 'Breadcrumbs 面包屑', group: '导航' },
  { id: 'stepper', label: 'Stepper 步骤条', group: '导航' },
  { id: 'pagination', label: 'Pagination 分页', group: '导航' },
  { id: 'page-progress', label: 'PageProgress 页面进度', group: '导航' },

  { id: 'dialog', label: 'Dialog / Confirm', group: '浮层' },
  { id: 'sheet', label: 'Sheet 面板', group: '浮层' },
  { id: 'menu', label: 'Menu 菜单', group: '浮层' },
  { id: 'snackbar', label: 'Snackbar 提示条', group: '浮层' },
  { id: 'tooltip', label: 'Tooltip 气泡', group: '浮层' },
  { id: 'command-palette', label: 'CommandPalette 命令面板', group: '浮层' },
  { id: 'loading-overlay', label: 'LoadingOverlay 加载遮罩', group: '浮层' },

  { id: 'alert', label: 'Alert 行内提示', group: '状态' },
  { id: 'empty', label: 'EmptyState 空状态', group: '状态' },
  { id: 'skeleton', label: 'Skeleton 骨架屏', group: '状态' },

  { id: 'animated-number', label: 'AnimatedNumber 数字滚动', group: '工具' },
  { id: 'relative-time', label: 'RelativeTime 相对时间', group: '工具' },
  { id: 'copy-button', label: 'CopyButton 复制', group: '工具' },

  /* ---------- A / B 批次 ---------- */
  { id: 'autocomplete', label: 'Autocomplete / MultiSelect', group: '表单' },
  { id: 'tag-mask', label: 'TagInput / MaskField', group: '表单' },
  { id: 'phone-timezone', label: 'Phone / Country / Timezone', group: '表单' },
  { id: 'date-time', label: '日期时间选择', group: '表单' },
  { id: 'context-menu', label: 'ContextMenu 右键菜单', group: '浮层' },
  { id: 'tour', label: 'Tour 新手引导', group: '浮层' },
  { id: 'notifications', label: '通知中心', group: '浮层' },
  { id: 'hotkeys', label: 'Hotkeys 快捷键', group: '工具' },
  { id: 'composables', label: 'Composables 组合式函数', group: '工具' },
  { id: 'effects', label: '撒花 / 礼花 / 飘表情', group: '工具' },
  { id: 'filter-builder', label: 'FilterBuilder 筛选器', group: '数据' },
  { id: 'transfer-swipe', label: 'TransferList / SwipeToDismiss', group: '数据' },
  { id: 'data-views', label: 'JSON / Diff / 树表 / 虚拟表', group: '数据' },
  { id: 'navigation-extra', label: '抽屉 / 底部栏 / 短导航', group: '导航' },
  { id: 'media', label: '媒体组件', group: '媒体' },
  { id: 'layout-extra', label: '分栏 / 瀑布流 / 仪表盘', group: '容器' },
]

const groups = computed(() => {
  const map = new Map<string, Section[]>()
  for (const item of sections) {
    if (!map.has(item.group)) map.set(item.group, [])
    map.get(item.group)!.push(item)
  }
  return [...map.entries()]
})

const active = ref('motion')

function scrollTo(id: string) {
  active.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/*
 * 滚动时高亮当前分节。
 * 用 IntersectionObserver 而不是 scroll + 逐个 getBoundingClientRect：
 * 后者在长页面上每一帧都要读布局，滚动会发涩。
 */
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) active.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )

  for (const item of sections) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }

  onBeforeUnmount(() => observer.disconnect())
})

/* ---------- 导航：搜索 / 分组折叠 / ⌘K 跳转 ---------- */
const navRef = ref<HTMLElement | null>(null)
const navSearchRef = ref<HTMLInputElement | null>(null)
const navQuery = ref('')
/* 折叠状态存本地：72 个小节，每次刷新都重开一遍太烦 */
const collapsedGroups = useLocalStorage<string[]>('m3-gallery-collapsed', [])

const filteredGroups = computed(() => {
  const keyword = navQuery.value.trim().toLowerCase()
  if (!keyword) return groups.value
  return groups.value
    .map(([group, items]) => {
      const hits = items.filter((item) => (item.label + ' ' + item.id + ' ' + group).toLowerCase().includes(keyword))
      return [group, hits] as [string, Section[]]
    })
    .filter(([, items]) => items.length > 0)
})

const matchCount = computed(() => filteredGroups.value.reduce((sum, [, items]) => sum + items.length, 0))

function isCollapsed(group: string): boolean {
  // 搜索时强制展开：把命中的项藏起来等于没有结果
  if (navQuery.value.trim()) return false
  return collapsedGroups.value.includes(group)
}

function toggleGroup(group: string): void {
  collapsedGroups.value = isCollapsed(group)
    ? collapsedGroups.value.filter((value) => value !== group)
    : [...collapsedGroups.value, group]
}

function onNavKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    navQuery.value = ''
    navSearchRef.value?.blur()
    return
  }
  if (event.key === 'Enter') {
    const first = filteredGroups.value[0]?.[1][0]
    if (!first) return
    scrollTo(first.id)
    navSearchRef.value?.blur()
  }
}

const jumpOpen = ref(false)
const jumpCommands: CommandItem[] = sections.map((item) => ({
  id: item.id,
  label: item.label,
  group: item.group,
  onSelect: () => scrollTo(item.id),
}))

const showBackToTop = ref(false)

function scrollTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* 两个全局快捷键：⌘/Ctrl+K 打开跳转面板，/ 聚焦导航搜索 */
function onWindowKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  const typing = Boolean(
    target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable),
  )
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    jumpOpen.value = true
    return
  }
  if (event.key === '/' && !typing) {
    event.preventDefault()
    navSearchRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
  window.addEventListener(
    'scroll',
    () => {
      showBackToTop.value = window.scrollY > 900
    },
    { passive: true },
  )
})
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))

/* 高亮项跟着滚进导航可视区，否则长导航里看不出自己在哪 */
watch(active, async (id) => {
  await nextTick()
  navRef.value?.querySelector<HTMLElement>('[data-nav-id="' + id + '"]')?.scrollIntoView({ block: 'nearest' })
})

/* ---------- Snackbar ---------- */
const snackbar = useSnackbar()
const showSnack = (text: string, title?: string) => snackbar.show(text, title ? { title } : {})
const showSuccess = (text: string) => snackbar.success(text)
const showWarning = (text: string, title: string) => snackbar.warning(text, title)
const showError = (text: string) => snackbar.error(text)

function showUndo() {
  snackbar.show('项目已移到回收站', {
    tone: 'neutral',
    action: { label: '撤销', onSelect: () => showSnack('已撤销') },
  })
}

/* ---------- 演示状态 ---------- */
const pressCount = ref(0)
const loading = ref(false)
const liked = ref(true)
const chipOn = ref(true)
const chips = ref<string[]>(['置顶', '精华'])
const tags = ref<string[]>(['Vue', 'Vite', 'TypeScript'])
const switchA = ref(true)
const switchB = ref(false)
const segment = ref('list')
const name = ref('')
const email = ref('')
const password = ref('')
const bio = ref('')
const search = ref('')
const query = ref('')
const planet = ref('earth')
const dialogOpen = ref(false)
const sheetOpen = ref(false)
const page = ref(3)
const pageBig = ref(21)
const confirmRef = ref<InstanceType<typeof M3ConfirmDialog> | null>(null)

const checkA = ref(true)
const checkB = ref(false)
const allChecked = computed(() => checkA.value && checkB.value)
const someChecked = computed(() => (checkA.value || checkB.value) && !allChecked.value)

function toggleAll(value: boolean) {
  checkA.value = value
  checkB.value = value
}

const radio = ref('standard')
const radioOptions: RadioOption[] = [
  { value: 'standard', label: '标准版', description: '个人项目与原型，永久免费' },
  { value: 'team', label: '团队版', description: '协作、权限与审计日志' },
  { value: 'enterprise', label: '企业版', description: '私有部署与专属支持', disabled: true },
]

const volume = ref(40)
const quality = ref(2)

const progressValue = ref(65)

const rating = ref(3.5)
const ratingReadonly = ref(4)

const tab = ref('overview')
const demoTabs = computed<TabItem[]>(() => [
  { value: 'overview', label: '概览', icon: IcoDashboard },
  { value: 'activity', label: '动态', icon: IcoNotifications, badge: 3 },
  { value: 'files', label: '文件', icon: IcoFolder },
  { value: 'settings', label: '设置', icon: IcoSettings, disabled: true },
])

const navBarValue = ref('home')
const navBarItems: NavBarItem[] = [
  { value: 'home', label: '首页', icon: IcoHome },
  { value: 'search', label: '搜索', icon: IcoSearch },
  { value: 'inbox', label: '消息', icon: IcoNotifications, badge: 5 },
  { value: 'profile', label: '我的', icon: IcoPerson },
]

const railValue = ref('inbox')
const railExpanded = ref(false)
const railItems: NavRailItem[] = [
  { value: 'inbox', label: '收件箱', icon: IcoFolder, badge: 8 },
  { value: 'analytics', label: '分析', icon: IcoAnalytics },
  { value: 'photos', label: '图片', icon: IcoPhoto },
  { value: 'settings', label: '设置', icon: IcoSettings },
]

const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首页', href: '#', icon: IcoHome },
  { label: '组件库', href: '#' },
  { label: '数据展示', href: '#' },
  { label: 'Table 表格' },
]

const step = ref(1)
const stepItems: StepItem[] = [
  { label: '选择套餐', description: '按用量或按年' },
  { label: '填写信息', description: '团队与账单联系人' },
  { label: '确认支付', description: '支持对公转账', optional: true },
  { label: '完成', description: '开通并发送邮件' },
]

const panelOpen = ref(true)

const sparkValues = [12, 18, 15, 24, 20, 32, 28, 38, 35, 46]
const sparkValues2 = [28, 22, 30, 26, 34, 30, 26, 24, 20, 18]
const bigNumber = ref(12840)

type OrderRow = Record<string, unknown>

const tableRows: OrderRow[] = [
  { id: 1, name: '云术设计系统', owner: '林澈', orders: 128, status: '进行中' },
  { id: 2, name: '品牌官网改版', owner: '周野', orders: 86, status: '待审核' },
  { id: 3, name: '移动端组件库', owner: '陈默', orders: 214, status: '已完成' },
  { id: 4, name: '数据看板', owner: '苏黎', orders: 43, status: '进行中' },
]

const demoColumns = computed<TableColumn[]>(() => [
  { key: 'name', label: '项目', sortable: true },
  { key: 'owner', label: '负责人' },
  { key: 'orders', label: '订单', align: 'end', sortable: true, width: '96px' },
  { key: 'status', label: '状态', width: '120px' },
])

const tableSort = ref<TableSort | null>({ key: 'orders', direction: 'desc' })

const sortedTableRows = computed(() => {
  const sort = tableSort.value
  if (!sort) return tableRows
  return [...tableRows].sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    if (typeof left === 'number' && typeof right === 'number') {
      return sort.direction === 'asc' ? left - right : right - left
    }
    return sort.direction === 'asc'
      ? String(left).localeCompare(String(right), 'zh')
      : String(right).localeCompare(String(left), 'zh')
  })
})

const demoEvents = computed<TimelineItem[]>(() => [
  {
    title: '部署成功',
    description: 'production · 2 分 14 秒',
    time: '10:24',
    icon: IcoCheck,
    status: 'success',
  },
  {
    title: '合并 pull request #128',
    description: '为所有表单控件补充 outlined 变体',
    time: '09:58',
    icon: IcoCloud,
    status: 'active',
  },
  {
    title: '代码评审完成',
    description: '林澈 请求了 2 处修改',
    time: '昨天',
    icon: IcoEdit,
  },
  {
    title: '构建失败',
    description: '类型检查未通过：M3Tabs 存在未使用变量',
    time: '昨天',
    status: 'error',
  },
  {
    title: '创建分支 feat/outlined-fields',
    time: '11 月 6 日',
    icon: IcoTask,
    status: 'warning',
  },
])

const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
const inThreeHours = Date.now() + 3 * 3600 * 1000
const lastWeek = Date.now() - 7 * 24 * 3600 * 1000

const installCommand = 'pnpm add @clderystd/m3-ui'

const searchSuggestions = computed(() => {
  const all = ['Vue', 'Vite', 'VueUse', 'Pinia', 'Nuxt', 'Volar']
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return all
  return all.filter((item) => item.toLowerCase().includes(keyword))
})

/* ---------- 新增组件演示状态 ---------- */
const toggleFilled = ref(false)
const toggleTonal = ref(true)
const toggleOutlined = ref(false)

const splitItems: SplitButtonItem[] = [
  { label: '另存为副本', icon: IcoEdit, onSelect: () => showSnack('已另存为副本') },
  { label: '移动到文件夹', icon: IcoFolder, onSelect: () => showSnack('已移动') },
  { label: '分享链接', icon: IcoShare, disabled: true },
  { label: '删除', icon: IcoDelete, onSelect: () => showSnack('已删除') },
]

const quantity = ref(1)
const price = ref<number | null>(1234.5)
const pin = ref('')
const pinGrouped = ref('')
const pwd = ref('')
const pwdScore = ref(-1)
const uploadFiles = ref<UploadFile[]>([])

const treeSelected = ref<string | number | null>('src-app')
const treeChecked = ref<(string | number)[]>(['src-c-btn'])
const treeNodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: IcoFolder,
    children: [
      { id: 'src-app', label: 'App.vue', icon: IcoTask },
      {
        id: 'src-components',
        label: 'components',
        icon: IcoFolder,
        children: [
          { id: 'src-c-btn', label: 'M3Button.vue', icon: IcoTask },
          { id: 'src-c-tree', label: 'M3Tree.vue', icon: IcoTask },
        ],
      },
      { id: 'src-style', label: 'm3-foundations.css', icon: IcoPhoto, disabled: true },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    icon: IcoFolder,
    children: [{ id: 'docs-readme', label: 'README.md', icon: IcoTask }],
  },
]

const countdownTarget = ref(Date.now() + 2 * 3600 * 1000 + 42 * 1000)
const countdownDone = ref(false)

interface FeedItem {
  id: number
  title: string
}

const feed = ref<FeedItem[]>(
  Array.from({ length: 6 }, (_, index) => ({ id: index + 1, title: '构建日志 #' + (index + 1) })),
)
const feedLoading = ref(false)
const feedEnded = ref(false)
let feedPage = 0

function loadMore() {
  if (feedLoading.value || feedEnded.value) return
  feedLoading.value = true
  window.setTimeout(() => {
    feedPage += 1
    const start = feed.value.length
    feed.value.push(
      ...Array.from({ length: 4 }, (_, index) => ({
        id: start + index + 1,
        title: '构建日志 #' + (start + index + 1),
      })),
    )
    feedLoading.value = false
    if (feedPage >= 3) feedEnded.value = true
  }, 900)
}

const paletteOpen = ref(false)
const commands: CommandItem[] = [
  { id: 'new', label: '新建组件', icon: IcoAdd, group: '编辑', shortcut: 'N', onSelect: () => showSnack('新建组件') },
  { id: 'rename', label: '重命名当前组件', icon: IcoEdit, group: '编辑', shortcut: 'F2', onSelect: () => showSnack('重命名') },
  { id: 'delete', label: '删除当前组件', icon: IcoDelete, group: '编辑', onSelect: () => showSnack('已删除') },
  { id: 'theme', label: '切换主题', icon: IcoBolt, group: '视图', onSelect: () => toggleTheme() },
  { id: 'dash', label: '打开数据看板', icon: IcoDashboard, group: '视图', shortcut: 'G D', onSelect: () => showSnack('打开看板') },
  { id: 'settings', label: '设置', icon: IcoSettings, group: '系统', shortcut: '⌘,', onSelect: () => showSnack('设置') },
  { id: 'share', label: '分享给同事', icon: IcoShare, group: '系统', disabled: true },
]

const overlayInline = ref(false)
const overlayFull = ref(false)
const { start: startPageProgress, done: donePageProgress } = usePageProgress()

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function runOverlayInline() {
  overlayInline.value = true
  await wait(1400)
  overlayInline.value = false
}

async function runOverlayFull() {
  overlayFull.value = true
  await wait(1200)
  overlayFull.value = false
}

async function runPageProgressDemo() {
  startPageProgress()
  await wait(1800)
  donePageProgress()
}

function resetCountdown() {
  countdownTarget.value = Date.now() + 65_000
  countdownDone.value = false
}

async function simulateUpload() {
  const pending = uploadFiles.value.find((entry) => entry.status === 'pending')
  if (!pending) {
    showSnack('先选一个文件')
    return
  }
  pending.status = 'uploading'
  for (let progress = 0; progress <= 100; progress += 10) {
    pending.progress = progress
    await wait(100)
  }
  pending.status = 'done'
  showSuccess('上传完成')
}

/* ---------- 动作 ---------- */
const planetOptions: SelectOption[] = [
  { value: 'earth', label: '地球' },
  { value: 'moon', label: '月球' },
  { value: 'mars', label: '火星' },
  { value: 'venus', label: '金星', disabled: true },
]

const segmentOptions = [
  { value: 'list', label: '列表' },
  { value: 'grid', label: '网格' },
  { value: 'table', label: '表格' },
]

const qualityOptions = [
  { value: 1, label: '标准' },
  { value: 2, label: '高清' },
  { value: 3, label: '无损' },
]

function toggleChip(tag: string) {
  chips.value = chips.value.includes(tag)
    ? chips.value.filter((item) => item !== tag)
    : [...chips.value, tag]
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((item) => item !== tag)
}

async function runLoading() {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1600))
  loading.value = false
}

async function askDanger() {
  const ok = await confirmRef.value?.ask({
    title: '删除这个组件？',
    body: ['删除后该组件会从所有页面移除。', '这个动作不可撤销。'],
    confirmLabel: '删除',
    danger: true,
  })
  snackbar.show(ok ? '已删除' : '已取消', { tone: ok ? 'success' : 'neutral' })
}

function showAllTones() {
  snackbar.show('这是一条中性提示', { tone: 'neutral' })
  setTimeout(() => snackbar.success('保存成功', '已完成'), 1800)
  setTimeout(() => snackbar.warning('磁盘空间不足 10%', '注意'), 3600)
  setTimeout(() => snackbar.error('连接超时，请稍后重试', '请求失败'), 5400)
}

function bumpNumber(amount: number) {
  bigNumber.value = Math.max(0, bigNumber.value + amount)
}

function submitSearch() {
  if (query.value) showSnack('搜索：' + query.value)
}
</script>

<template>
  <div class="gallery">
    <nav class="gallery__nav" aria-label="组件导航">
      <div class="gallery__brand">
        <span class="gallery__brand-mark">M3</span>
        <span class="gallery__brand-text">
          <span class="gallery__brand-title">云术组件库</span>
          <span class="gallery__brand-sub">Gallery · 105 components</span>
        </span>
      </div>

      <div class="gallery__search">
        <M3Icon :icon="IcoSearch" :size="18" class="gallery__search-icon" />
        <input
          ref="navSearchRef"
          v-model="navQuery"
          class="gallery__search-input"
          type="search"
          placeholder="搜索组件"
          aria-label="搜索组件"
          @keydown="onNavKeydown"
        />
        <button v-if="navQuery" type="button" class="gallery__search-clear" aria-label="清空搜索" @click="navQuery = ''">
          ×
        </button>
        <kbd v-else class="gallery__search-kbd">/</kbd>
      </div>

      <p v-if="navQuery" class="gallery__search-hint">
        {{ matchCount > 0 ? '命中 ' + matchCount + ' 项 · 回车跳到第一项' : '没有匹配的组件' }}
      </p>

      <template v-for="[group, items] in filteredGroups" :key="group">
        <button
          type="button"
          class="gallery__group-label"
          :aria-expanded="!isCollapsed(group)"
          @click="toggleGroup(group)"
        >
          <span class="gallery__group-caret" :class="{ 'is-collapsed': isCollapsed(group) }">▾</span>
          <span class="gallery__group-text">{{ group }}</span>
          <span class="gallery__group-count">{{ items.length }}</span>
        </button>

        <template v-if="!isCollapsed(group)">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="gallery__link"
            :class="{ 'is-active': active === item.id }"
            :data-nav-id="item.id"
            @click="scrollTo(item.id)"
          >
            {{ item.label }}
          </button>
        </template>
      </template>
    </nav>

    <main class="gallery__main">
      <header class="gallery__header">
        <div>
          <h1 class="gallery__title">M3 组件 Gallery</h1>
          <p class="gallery__lede">
            所有组件都跑在 <code>src/</code> 源码上，改完立刻在这里看到效果，不必先构建。
            每节的说明写的是「这个动效为什么这么做」，而不是「它长什么样」。
          </p>
        </div>
        <M3IconButton
          :icon="dark ? IcoLight : IcoDark"
          :label="dark ? '切换到浅色' : '切换到深色'"
          variant="tonal"
          @click="toggleTheme"
        />
      </header>

      <!-- ========== 动效总览 ========== -->
      <section id="motion" class="gallery__section">
        <h2 class="gallery__section-title">动效总览</h2>
        <p class="gallery__section-note">
          组件的「手感」由三件事决定：<strong>按压反馈</strong>（触摸屏没有 hover，按下缩放是唯一能确认点到了的信号）、
          <strong>状态切换</strong>（勾选、展开用 emphasized 缓动收尾，而不是线性平移）、
          <strong>内容入场</strong>（错开出现比整块淡入更像在加载）。
          下面逐个点一下，感受差异。
        </p>

        <div class="gallery__surface">
          <p class="gallery__label">按压反馈（点住不放）</p>
          <div class="gallery__row">
            <M3Button @click="pressCount++">Button 0.97</M3Button>
            <M3Button variant="tonal" @click="pressCount++">Tonal</M3Button>
            <M3Button variant="outlined" @click="pressCount++">Outlined</M3Button>
            <M3IconButton :icon="IcoFavorite" label="收藏" variant="filled" />
            <M3IconButton :icon="IcoShare" label="分享" variant="tonal" />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">错开入场（点按钮重放）</p>
          <M3Button variant="text" :icon="IcoCheck" @click="pressCount++">重放</M3Button>
          <div :key="pressCount" class="md-stagger gallery__row" style="margin-block-start: 8px">
            <M3Chip v-for="index in 6" :key="index" :label="'条目 ' + index" />
          </div>
        </div>

        <p class="gallery__hint">
          提示：系统开启「减少动态效果」时，缩放仍保留极小值（0.99）而不是完全归零 ——
          否则按钮在触摸屏上会毫无反馈。
        </p>
      </section>

      <!-- ========== ThemePicker ========== -->
      <section id="theme-picker" class="gallery__section">
        <h2 class="gallery__section-title">ThemePicker 主题配色</h2>
        <p class="gallery__section-note">
          换一颗种子色就得到一整套 49 个 color role —— 用 OKLCH 现算，不依赖第三方色彩库。
          推导时按角色分配彩度：中性表面几乎无彩（否则整页「泛色」），强调色保住种子色的鲜艳度。
          外观与种子色存进 localStorage，首屏由 index.html 的内联脚本直接注入 token，不会先闪一下默认蓝。
          它改的是 useTheme 的模块单例，顶栏那颗明暗开关与它是同一份状态。
        </p>

        <div class="gallery__surface">
          <M3ThemePicker />
          <p class="gallery__hint">「+」色板会打开系统取色器；左上角「恢复默认」回到云术蓝 + 浅色。</p>
        </div>
      </section>

      <!-- ========== Icon ========== -->
      <section id="icon" class="gallery__section">
        <h2 class="gallery__section-title">Icon 图标</h2>
        <p class="gallery__section-note">
          图标不绑定任何图标库：<code>IconComponent</code> 只要求是渲染成 &lt;svg&gt; 的 Vue 组件。
          Gallery 里用 unplugin-icons 把 Material Symbols 编译成内联 SVG；如果你手写 SFC 或换别的图标库，也照样能传。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Icon :icon="IcoHome" :size="18" label="首页" />
            <M3Icon :icon="IcoSearch" :size="24" label="搜索" />
            <M3Icon :icon="IcoNotifications" :size="32" label="通知" />
            <M3Icon :icon="IcoFavorite" :size="40" label="收藏" />
          </div>
        </div>
      </section>

      <!-- ========== Button ========== -->
      <section id="button" class="gallery__section">
        <h2 class="gallery__section-title">Button 按钮</h2>
        <p class="gallery__section-note">
          五种强调级别，外加 danger。按下时整体缩到 0.97，松手用 emphasized-decelerate 收尾，比线性回位「弹」得住。
          danger 不是第六种变体，而是把同一套强调级别重新指向 error 角色 —— 破坏性操作的视觉重量不该和普通按钮一样。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button>Filled</M3Button>
            <M3Button variant="tonal">Tonal</M3Button>
            <M3Button variant="elevated">Elevated</M3Button>
            <M3Button variant="outlined">Outlined</M3Button>
            <M3Button variant="text">Text</M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">Danger</p>
          <div class="gallery__row">
            <M3Button danger>删除</M3Button>
            <M3Button danger variant="tonal">停用</M3Button>
            <M3Button danger variant="outlined">清空</M3Button>
            <M3Button danger variant="text">移除</M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">尺寸</p>
          <div class="gallery__row">
            <M3Button size="sm">Small</M3Button>
            <M3Button size="md">Medium</M3Button>
            <M3Button size="lg">Large</M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">带图标 / 加载 / 禁用</p>
          <div class="gallery__row">
            <M3Button :icon="IcoAdd">新建</M3Button>
            <M3Button variant="tonal" :trailing-icon="IcoEdit">编辑</M3Button>
            <M3Button :loading="loading" @click="runLoading">
              {{ loading ? '保存中' : '点我加载' }}
            </M3Button>
            <M3Button disabled>已禁用</M3Button>
            <M3Button danger disabled>危险禁用</M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">通栏</p>
          <M3Button block size="lg">Block</M3Button>
        </div>
      </section>

      <!-- ========== IconButton ========== -->
      <section id="icon-button" class="gallery__section">
        <h2 class="gallery__section-title">IconButton 图标按钮</h2>
        <p class="gallery__section-note">
          40dp 的圆形热区，按压缩到 0.92 —— 比普通按钮压得更多，因为它的面积小，需要更强的视觉响应。
          <code>toggleable</code> 让「选中了没有」被读屏听见；<code>loading</code> 只拦截输入、不改变强调级别。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3IconButton :icon="IcoFavorite" label="收藏" />
            <M3IconButton :icon="IcoFavorite" label="收藏" variant="filled" />
            <M3IconButton :icon="IcoFavorite" label="收藏" variant="tonal" />
            <M3IconButton :icon="IcoFavorite" label="收藏" variant="outlined" />
            <M3IconButton :icon="IcoFavorite" label="已选中" variant="tonal" selected />
            <M3IconButton :icon="IcoDelete" label="删除" disabled />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">可切换 / 加载中</p>
          <div class="gallery__row">
            <M3IconButton
              :icon="IcoFavorite"
              label="喜欢"
              variant="tonal"
              toggleable
              :selected="liked"
              @click="liked = !liked"
            />
            <M3IconButton :icon="IcoSearch" label="正在搜索" loading variant="filled" />
            <M3IconButton :icon="IcoAdd" label="正在新建" loading variant="outlined" />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">尺寸与形状</p>
          <div class="gallery__row">
            <M3IconButton :icon="IcoSearch" label="搜索" size="sm" />
            <M3IconButton :icon="IcoSearch" label="搜索" size="md" />
            <M3IconButton :icon="IcoSearch" label="搜索" size="lg" />
            <M3IconButton :icon="IcoSearch" label="搜索" shape="small" variant="tonal" />
            <M3IconButton :icon="IcoSearch" label="搜索" shape="medium" variant="tonal" />
          </div>
        </div>
      </section>

      <!-- ========== FAB ========== -->
      <section id="fab" class="gallery__section">
        <h2 class="gallery__section-title">Fab 浮动操作按钮</h2>
        <p class="gallery__section-note">
          FAB 比普通按钮更「软」，按压时缩到 0.94，回弹也更有存在感。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Fab :icon="IcoAdd" aria-label="新建" />
            <M3Fab :icon="IcoEdit" aria-label="编辑" variant="secondary-container" />
            <M3Fab :icon="IcoCloud" aria-label="上传" variant="tertiary-container" size="sm" />
            <M3Fab :icon="IcoAdd" label="新建项目" />
          </div>
        </div>
      </section>

      <!-- ========== Chip ========== -->
      <section id="chip" class="gallery__section">
        <h2 class="gallery__section-title">Chip 标签</h2>
        <p class="gallery__section-note">
          筛选标签选中时，对勾用 scale + opacity 弹出来（0.6 → 1）。
          只做静态切换的话，选中与未选中只差一个容器明暗，扫一眼容易漏看。
          input chip 的根节点改成了 <code>span</code> + 两个真按钮：button 不能嵌套 button，否则读屏和键盘都会乱。
        </p>

        <div class="gallery__surface">
          <p class="gallery__label">Assist / Suggestion</p>
          <div class="gallery__row">
            <M3Chip :icon="IcoAdd" label="添加" />
            <M3Chip :icon="IcoCloud" label="同步" />
            <M3Chip variant="suggestion" label="试试「暗色模式」" />
            <M3Chip label="普通" disabled />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">Filter（点一下看对勾动效）</p>
          <div class="gallery__row">
            <M3Chip
              v-for="tag in ['置顶', '精华', '已归档']"
              :key="tag"
              variant="filter"
              :label="tag"
              :selected="chips.includes(tag)"
              @click="toggleChip(tag)"
            />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">Input（可移除，Tab 会停在移除按钮上）</p>
          <div class="gallery__row">
            <M3Chip
              v-for="tag in tags"
              :key="tag"
              variant="input"
              :label="tag"
              @remove="removeTag(tag)"
            />
            <M3Button v-if="tags.length === 0" variant="text" size="sm" @click="tags = ['Vue']">
              重置标签
            </M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">单个开关</p>
          <div class="gallery__row">
            <M3Chip variant="filter" label="关注中" :selected="chipOn" @click="chipOn = !chipOn" />
          </div>
        </div>
      </section>

      <!-- ========== Badge ========== -->
      <section id="badge" class="gallery__section">
        <h2 class="gallery__section-title">Badge 徽标</h2>
        <p class="gallery__section-note">
          数字徽标超过 <code>max</code> 自动变成 99+；<code>dot</code> 只表示「有新内容」，不占用数字的宽度。
          徽标会画一圈 surface 色的描边，叠在头像或图标上时边界仍然清楚。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 32px">
            <M3Badge :value="3">
              <M3IconButton :icon="IcoNotifications" label="通知" variant="tonal" />
            </M3Badge>
            <M3Badge :value="128" :max="99">
              <M3IconButton :icon="IcoFolder" label="文件" variant="outlined" />
            </M3Badge>
            <M3Badge dot>
              <M3Avatar name="林澈" :size="40" status="online" />
            </M3Badge>
            <M3Badge :value="12" tone="primary">
              <M3Avatar name="周野" :size="40" />
            </M3Badge>
            <M3Badge :value="99" :max="9" />
            <M3Badge dot tone="tertiary" />
          </div>
        </div>
      </section>

      <!-- ========== SegmentedButton ========== -->
      <section id="segmented" class="gallery__section">
        <h2 class="gallery__section-title">SegmentedButton 分段按钮</h2>
        <p class="gallery__section-note">
          与 Chip 同一套「选中即弹出对勾」的语义，两个组件的行为保持一致，用户不必分别学习。
          分隔线只由相邻选择器画，所以第一段的圆角上不会多出一条竖线。
        </p>

        <div class="gallery__surface">
          <M3SegmentedButton v-model="segment" :options="segmentOptions" aria-label="视图模式" />
          <p class="gallery__hint">当前：{{ segment }}</p>

          <p class="gallery__label" style="margin-block-start: 20px">通栏 / 小尺寸 / 禁用项</p>
          <M3SegmentedButton v-model="segment" :options="segmentOptions" block aria-label="视图模式" />
          <div style="margin-block-start: 12px">
            <M3SegmentedButton
              v-model="segment"
              :options="[
                { value: 'list', label: '列表' },
                { value: 'grid', label: '网格' },
                { value: 'chart', label: '图表', disabled: true },
              ]"
              size="sm"
              aria-label="小尺寸"
            />
          </div>
        </div>
      </section>

      <!-- ========== ToggleButton ========== -->
      <section id="toggle-button" class="gallery__section">
        <h2 class="gallery__section-title">ToggleButton 开关按钮</h2>
        <p class="gallery__section-note">
          和 SegmentedButton 的区别：那是「一组选项」，这是一枚按钮、两个状态。
          选中时形状自己收成小圆角（胶囊 → 12dp），按下再收一档，走的是真实弹簧而不是 CSS 曲线 ——
          胶囊到小圆角的位移几乎全发生在弹道前几帧，线性缓动看起来就是「啪」地一下。
          filled 变体未选中用的是 surface-container，选中才换成 primary，两者必须一眼能分出来。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 16px">
            <M3ToggleButton v-model:checked="toggleFilled" :icon="IcoFavorite">收藏</M3ToggleButton>
            <M3ToggleButton v-model:checked="toggleTonal" variant="tonal" :icon="IcoNotifications">通知</M3ToggleButton>
            <M3ToggleButton v-model:checked="toggleOutlined" variant="outlined" :icon="IcoBolt">加速</M3ToggleButton>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">尺寸 / 无图标 / 禁用</p>
          <div class="gallery__row" style="gap: 16px; align-items: center">
            <M3ToggleButton :checked="true" size="sm">Small</M3ToggleButton>
            <M3ToggleButton :checked="true" size="md">Medium</M3ToggleButton>
            <M3ToggleButton :checked="true" size="lg" :icon="IcoCheck">Large</M3ToggleButton>
            <M3ToggleButton :checked="false" disabled>禁用</M3ToggleButton>
          </div>
        </div>

        <p class="gallery__hint">点住不放：松手前圆角会保持在「按下」那一档，回弹交给弹簧。</p>
      </section>

      <!-- ========== SplitButton ========== -->
      <section id="split-button" class="gallery__section">
        <h2 class="gallery__section-title">SplitButton 拆分按钮</h2>
        <p class="gallery__section-note">
          左边主动作、右边展开备选。弹层直接复用 M3Menu：焦点进入、↑↓ 移动、Esc 收起、点外部关闭都已经在那边做过，
          这里只负责「两个半边拼成一颗胶囊」的形状与强调级别 —— 内部圆角取 4dp 让它们咬合。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 16px; flex-wrap: wrap">
            <M3SplitButton label="保存" :icon="IcoCheck" :items="splitItems" @click="showSnack('已保存')" />
            <M3SplitButton label="分享" variant="tonal" :icon="IcoShare" :items="splitItems" @click="showSnack('已分享')" />
            <M3SplitButton label="导出" variant="elevated" :icon="IcoCloud" :items="splitItems" @click="showSnack('导出中')" />
            <M3SplitButton label="删除" variant="outlined" :icon="IcoDelete" :items="splitItems" @click="showSnack('已删除')" disabled />
          </div>
          <p class="gallery__hint">点右侧箭头展开菜单；「分享链接」一项是 disabled 的。</p>
        </div>
      </section>

      <!-- ========== Kbd ========== -->
      <section id="kbd" class="gallery__section">
        <h2 class="gallery__section-title">Kbd 键位</h2>
        <p class="gallery__section-note">
          键位提示统一用等宽字体 + 单像素下沿，和普通文字区分开；多键组合按顺序渲染，不靠一张图片。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 20px">
            <span>打开命令面板 <M3Kbd :keys="['Ctrl', 'K']" /></span>
            <span>保存 <M3Kbd :keys="['Ctrl', 'S']" /></span>
            <span>关闭 <M3Kbd :keys="['Esc']" size="sm" /></span>
            <span>单键 <M3Kbd>⌘</M3Kbd></span>
          </div>
        </div>
      </section>

      <!-- ========== TextField ========== -->
      <section id="text-field" class="gallery__section">
        <h2 class="gallery__section-title">TextField 输入框</h2>
        <p class="gallery__section-note">
          浮动标签是 M3 最有辨识度的动效：标签上浮、字号缩小、颜色转主色，三者必须同一个时长，
          否则标签会「边飞边变粗」。filled 的底部指示线聚焦时从 1dp 摊开到 2dp 整宽；
          outlined 则把 1dp 描边压成 2dp，并让标签在描边上切出一个缺口。
        </p>

        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
            <M3TextField v-model="name" label="昵称" placeholder="点进来看看标签" />
            <M3TextField v-model="email" label="邮箱" type="email" :icon="IcoSearch" hint="我们不会公开你的邮箱" />
            <M3TextField v-model="password" label="密码" type="password" revealable hint="点右侧眼睛可以查看" />
            <M3TextField v-model="search" label="搜索" clearable :icon="IcoSearch" />
            <M3TextField v-model="name" label="Outlined" variant="outlined" hint="1dp 描边 + 标签缺口" />
            <M3TextField v-model="name" label="Outlined + 图标" variant="outlined" :icon="IcoPerson" />
            <M3TextField model-value="输入有误" label="错误态" error="该用户名已被占用" />
            <M3TextField model-value="" label="禁用" disabled />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">多行 + 计数器 + 右侧主操作</p>
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
            <M3TextField v-model="bio" label="简介" multiline :rows="3" :maxlength="120" hint="支持换行，最多 120 字" />
            <M3TextField v-model="bio" label="Outlined 多行" variant="outlined" multiline :rows="3" />
            <M3TextField v-model="search" label="验证码" action-text="发送" hint="60 秒后可重发" />
          </div>
        </div>
      </section>

      <!-- ========== NumberField ========== -->
      <section id="number-field" class="gallery__section">
        <h2 class="gallery__section-title">NumberField 数字输入</h2>
        <p class="gallery__section-note">
          刻意不用 <code>type="number"</code>：它自带浏览器的上下箭头、非法输入时 value 直接变空串，
          也没法约束「-」「1.」这类中间态。改成 text + inputmode="decimal"，
          输入过程中保留用户敲的原文，失焦时再收敛成合法值，光标就不会被格式化打回开头。
        </p>

        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
            <M3NumberField v-model="quantity" label="数量" :min="1" :max="99" hint="1 – 99" />
            <M3NumberField v-model="price" label="单价" variant="outlined" :min="0" :step="0.5" :precision="2" :icon="IcoAnalytics" />
            <M3NumberField :model-value="12" label="无步进按钮" :stepper="false" />
            <M3NumberField :model-value="0" label="错误态" error="数量不能为 0" />
            <M3NumberField :model-value="8" label="禁用" disabled />
          </div>
        </div>
      </section>

      <!-- ========== PinInput ========== -->
      <section id="pin-input" class="gallery__section">
        <h2 class="gallery__section-title">PinInput 验证码</h2>
        <p class="gallery__section-note">
          三件事必须同时成立：输入后自动前进、退格在空格子上先退到前一格并删掉它、粘贴整段验证码时一次铺满。
          中间留空（用户直接点第 4 格）用一个 NUL 占位，否则 "12__56" 会被读成 "1256"，补位就错位了。
        </p>

        <div class="gallery__surface">
          <div style="display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
            <M3PinInput v-model="pin" :length="6" hint="6 位数字" @complete="showSuccess('验证码填满了：' + $event)" />
            <M3PinInput v-model="pinGrouped" variant="outlined" :groups="[3, 5]" separator="—" hint="分组：3 + 5" />
            <M3PinInput :model-value="'12'" masked :length="4" error="验证码已过期" />
          </div>
        </div>
      </section>

      <!-- ========== PasswordMeter ========== -->
      <section id="password-meter" class="gallery__section">
        <h2 class="gallery__section-title">PasswordMeter 密码强度</h2>
        <p class="gallery__section-note">
          只算「长度 + 字符种类」，不做字典或熵估算 —— 组件库不该假装能判断「Password123!」是不是弱密码。
          分段而不是连续进度：分段数得清「还差几档」，连续条只能看出「大概六成」。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 20px; max-width: 420px">
          <M3TextField v-model="pwd" label="设置密码" type="password" revealable hint="至少 8 位，混合大小写、数字与符号" />
          <M3PasswordMeter :value="pwd" @score="pwdScore = $event" />
          <p class="gallery__hint">当前分数：{{ pwdScore }}（-1 表示还没输入）</p>
        </div>
      </section>

      <!-- ========== FileUpload ========== -->
      <section id="file-upload" class="gallery__section">
        <h2 class="gallery__section-title">FileUpload 文件上传</h2>
        <p class="gallery__section-note">
          它只负责「选文件、摆出来、显示进度」，真正上传由使用方做：拿到的条目是响应式对象，
          直接改 <code>entry.status</code> / <code>entry.progress</code> 就会反映到行上。
          预览图用 objectURL，条目离场时必须 revoke —— 否则一个开着的后台页会把每张图都钉在内存里。
        </p>

        <div class="gallery__surface">
          <M3FileUpload
            v-model="uploadFiles"
            accept=".png,.jpg,image/*,.pdf"
            multiple
            :max-size="5 * 1024 * 1024"
            @select="showSnack('选中了 ' + $event.length + ' 个文件')"
            @remove="showSnack('已移除 ' + $event.file.name)"
          >
            <template #actions="{ files, clear }">
              <M3Button variant="text" @click="clear">清空</M3Button>
              <M3Button variant="tonal" :icon="IcoCloud" :disabled="files.length === 0" @click="simulateUpload">
                模拟上传
              </M3Button>
            </template>
          </M3FileUpload>
        </div>
      </section>

      <!-- ========== Select ========== -->
      <section id="select" class="gallery__section">
        <h2 class="gallery__section-title">Select 下拉</h2>
        <p class="gallery__section-note">
          自绘面板。原生 &lt;select&gt; 的弹层由操作系统绘制，样式<b>完全无法用 CSS 控制</b> ——
          深色站点上会突然冒出一块浅色系统白板。自绘之后键盘与读屏要自己补全，
          支持 ↑↓ / Home / End / Enter / Esc / Tab 与首字母查找。
        </p>

        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
            <M3Select v-model="planet" label="目的地" :options="planetOptions" />
            <M3Select v-model="planet" label="Outlined" variant="outlined" :options="planetOptions" />
            <M3Select model-value="" label="带占位" :options="planetOptions" placeholder="请选择" />
            <M3Select model-value="earth" label="错误态" :options="planetOptions" error="该选项不可用" />
            <M3Select model-value="earth" label="禁用" :options="planetOptions" disabled />
          </div>
        </div>
      </section>

      <!-- ========== SearchBar ========== -->
      <section id="search-bar" class="gallery__section">
        <h2 class="gallery__section-title">SearchBar 搜索栏</h2>
        <p class="gallery__section-note">
          56dp 的整圆胶囊，聚焦时把建议以浮层接在下方。点击建议项时先 <code>preventDefault</code> 掉 mousedown，
          焦点不从 input 上移走，列表就不会在 click 之前被卸掉。
        </p>

        <div class="gallery__surface" style="padding-block: 32px 64px">
          <M3SearchBar
            v-model="query"
            placeholder="搜索组件、图标或文档…"
            @submit="submitSearch"
            @clear="query = ''"
          >
            <template #trailing>
              <M3IconButton :icon="IcoBolt" label="快捷搜索" size="sm" variant="standard" />
            </template>
            <template #suggestions>
              <button
                v-for="item in searchSuggestions"
                :key="item"
                type="button"
                role="option"
                class="gallery__suggestion"
                @click="query = item; submitSearch()"
              >
                <M3Icon :icon="IcoSearch" :size="20" />
                <span>{{ item }}</span>
              </button>
              <p v-if="searchSuggestions.length === 0" class="gallery__suggestion-empty">
                没有匹配的结果
              </p>
            </template>
          </M3SearchBar>

          <p class="gallery__hint">按 Enter 提交；按 Esc 收起建议。</p>
        </div>
      </section>

      <!-- ========== Checkbox ========== -->
      <section id="checkbox" class="gallery__section">
        <h2 class="gallery__section-title">Checkbox 复选框</h2>
        <p class="gallery__section-note">
          原生 input 留在原地、只做透明处理，点击 18dp 的方框就是点击它；
          状态层与焦点环向外扩成 40dp 的圆，不占布局。indeterminate 通过 DOM 属性同步，读屏会念成 mixed。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 32px; align-items: flex-start">
            <div style="display: grid; gap: 4px">
              <M3Checkbox
                :model-value="allChecked"
                :indeterminate="someChecked"
                label="全选"
                @update:model-value="toggleAll"
              />
              <M3Checkbox v-model="checkA" label="接收产品更新" />
              <M3Checkbox v-model="checkB" label="接收社区摘要" />
            </div>
            <div style="display: grid; gap: 4px">
              <M3Checkbox :model-value="true" color="primary" label="primary" />
              <M3Checkbox :model-value="true" color="secondary" label="secondary" />
              <M3Checkbox :model-value="true" color="tertiary" label="tertiary" />
              <M3Checkbox :model-value="true" color="error" label="error" />
            </div>
            <div style="display: grid; gap: 4px">
              <M3Checkbox :model-value="false" label="未选中" />
              <M3Checkbox :model-value="true" label="已选中" />
              <M3Checkbox :model-value="false" indeterminate label="部分选中" />
              <M3Checkbox :model-value="true" label="禁用" disabled />
            </div>
          </div>
        </div>
      </section>

      <!-- ========== RadioGroup ========== -->
      <section id="radio" class="gallery__section">
        <h2 class="gallery__section-title">RadioGroup 单选</h2>
        <p class="gallery__section-note">
          真 fieldset + 原生 radio，同组共享自动生成的 name，所以 ↑↓ / ←→ 切换是浏览器自带的，不用重写键盘逻辑。
          圆点用 scale 从 0 弹到 1，让「切换」这个离散变化被看见。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
          <M3RadioGroup v-model="radio" :options="radioOptions" label="套餐" hint="随时可以升级" />
          <M3RadioGroup
            v-model="radio"
            :options="radioOptions.slice(0, 2)"
            label="横向排列"
            direction="horizontal"
          />
          <M3RadioGroup
            model-value="team"
            :options="radioOptions.slice(0, 2)"
            label="禁用"
            disabled
          />
        </div>
      </section>

      <!-- ========== Switch ========== -->
      <section id="switch" class="gallery__section">
        <h2 class="gallery__section-title">Switch 开关</h2>
        <p class="gallery__section-note">
          滑块位移用 translate 走合成层（改 inset 会每帧触发布局）。按下滑块先缩到 0.9 再弹回，
          模拟实体开关被按下去的触感。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 24px">
            <label class="gallery__row" style="gap: 8px">
              <M3Switch v-model="switchA" label="通知" />
              <span>通知（{{ switchA ? '开' : '关' }}）</span>
            </label>
            <label class="gallery__row" style="gap: 8px">
              <M3Switch v-model="switchB" label="深色" />
              <span>深色（{{ switchB ? '开' : '关' }}）</span>
            </label>
            <M3Switch :model-value="false" label="禁用" disabled />
          </div>
        </div>
      </section>

      <!-- ========== Slider ========== -->
      <section id="slider" class="gallery__section">
        <h2 class="gallery__section-title">Slider 滑块</h2>
        <p class="gallery__section-note">
          交互仍然交给原生 range（键盘、拖拽、读屏全部免费），只是把它透明地盖在自绘轨道上。
          激活轨道和滑块的位移都绑定到同一个百分比，拖动时两者不会脱节。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 32px; max-width: 560px">
          <M3Slider v-model="volume" label="音量" show-value />
          <M3Slider v-model="volume" label="带刻度" show-value ticks :step="10" />
          <M3Slider v-model="quality" label="画质（1–3）" :min="1" :max="3" :step="1" show-value :value-text="qualityOptions.find((item) => item.value === quality)?.label" />
          <M3Slider :model-value="30" label="禁用" disabled show-value />
        </div>
      </section>

      <!-- ========== Rating ========== -->
      <section id="rating" class="gallery__section">
        <h2 class="gallery__section-title">Rating 评分</h2>
        <p class="gallery__section-note">
          允许半星时，点击或悬停星星的左半边就是 0.5 分。整整一排按钮用 radiogroup 语义，
          ↑↓ / ←→ 按 0.5 的步长调整；只读态则退化成一张有 aria-label 的静态图。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div class="gallery__row" style="gap: 16px">
            <span class="gallery__label" style="margin: 0">可交互</span>
            <M3Rating v-model="rating" allow-half allow-clear show-value />
            <span class="gallery__hint" style="margin: 0">当前 {{ rating }} 分</span>
          </div>
          <div class="gallery__row" style="gap: 16px">
            <span class="gallery__label" style="margin: 0">尺寸</span>
            <M3Rating :model-value="3" size="sm" />
            <M3Rating :model-value="3" size="md" />
            <M3Rating :model-value="3" size="lg" />
          </div>
          <div class="gallery__row" style="gap: 16px">
            <span class="gallery__label" style="margin: 0">只读</span>
            <M3Rating :model-value="ratingReadonly" readonly show-value />
            <M3Rating :model-value="4.5" allow-half readonly show-value />
            <M3Rating :model-value="2" disabled />
          </div>
        </div>
      </section>

      <!-- ========== Progress ========== -->
      <section id="progress" class="gallery__section">
        <h2 class="gallery__section-title">Progress 进度</h2>
        <p class="gallery__section-note">
          不确定进度不是「来回扫」，而是两条 40% 宽的条一前一后循环 —— 整条扫会让人误读成 50%。
          圆形不确定态则靠旋转 + dash 伸缩表达「还在走」，减少动态效果时只放慢、不停下：
          停下就等于告诉用户「卡住了」。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 24px">
          <div class="gallery__row" style="gap: 12px">
            <M3Button size="sm" variant="tonal" @click="progressValue = 30">30%</M3Button>
            <M3Button size="sm" variant="tonal" @click="progressValue = 65">65%</M3Button>
            <M3Button size="sm" variant="tonal" @click="progressValue = 100">100%</M3Button>
          </div>

          <M3Progress :value="progressValue" label="上传进度" show-value />
          <M3Progress label="正在同步" />
          <M3Progress :value="progressValue" tone="tertiary" label="磁盘使用" show-value />

          <div class="gallery__row" style="gap: 32px; margin-block-start: 8px">
            <M3Progress variant="circular" :value="progressValue" label="圆形进度" show-value />
            <M3Progress variant="circular" :value="30" tone="tertiary" label="30%" show-value />
            <M3Progress variant="circular" :size="64" label="圆形不确定进度" />
            <M3Progress variant="circular" :value="100" tone="error" :size="40" label="100%" />
          </div>
        </div>
      </section>

      <!-- ========== Card ========== -->
      <section id="card" class="gallery__section">
        <h2 class="gallery__section-title">Card 卡片</h2>
        <p class="gallery__section-note">
          可点卡片悬停时抬升 4px，按下再回落到 1px 并缩到 0.99 —— 抬起再按进去，给「按到了」的触感。
          horizontal 变体把媒体放到左侧，窄屏（&lt; 560px）自动折回纵向。
        </p>

        <div class="gallery__grid">
          <M3Card variant="filled" shape="large" interactive>
            <div style="padding: 20px">
              <p style="margin: 0 0 4px; font-weight: 500">Filled</p>
              <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-on-surface-variant)">
                容器色最高一档，悬停时浮起
              </p>
            </div>
          </M3Card>

          <M3Card variant="elevated" shape="large" interactive>
            <div style="padding: 20px">
              <p style="margin: 0 0 4px; font-weight: 500">Elevated</p>
              <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-on-surface-variant)">
                自带一层海拔，悬停升到 level2
              </p>
            </div>
          </M3Card>

          <M3Card variant="outlined" shape="large" interactive>
            <div style="padding: 20px">
              <p style="margin: 0 0 4px; font-weight: 500">Outlined</p>
              <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-on-surface-variant)">
                只有描边，最轻的一档
              </p>
            </div>
          </M3Card>
        </div>

        <p class="gallery__label" style="margin-block-start: 24px">Horizontal</p>
        <M3Card variant="elevated" shape="large" orientation="horizontal" interactive>
          <template #media>
            <div class="gallery__media-demo">
              <M3Icon :icon="IcoPhoto" :size="40" />
            </div>
          </template>
          <p style="margin: 0 0 4px; font-weight: 500">媒体在左</p>
          <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-on-surface-variant)">
            列表-详情、图集、搜索结果常用这种版式。
          </p>
          <template #actions>
            <M3Button variant="text" size="sm">查看</M3Button>
          </template>
        </M3Card>
      </section>

      <!-- ========== List ========== -->
      <section id="list" class="gallery__section">
        <h2 class="gallery__section-title">List 列表</h2>
        <p class="gallery__section-note">
          列表项不缩放 —— 整行缩放会带着文字一起抖，只用状态层的深浅表达按压，反而更稳。
          overline 会多出一行小字；padded 之前在 CSS 里少写了一个连字符，一直没生效，这次一起修了。
        </p>

        <div class="gallery__surface">
          <M3List class="md-stagger">
            <M3ListItem headline="云术身份中心" supporting="统一登录 · 8 个站点" clickable :leading-icon="IcoPerson" />
            <M3ListItem overline="最近更新" headline="组件库" supporting="v0.5.0" clickable :leading-icon="IcoCloud" />
            <M3ListItem headline="设置" clickable :leading-icon="IcoSettings" />
            <M3Divider inset="middle" />
            <M3ListItem headline="已禁用的一项" disabled :leading-icon="IcoHome" />
            <M3ListItem headline="带内边距" padded clickable :leading-icon="IcoFolder" />
          </M3List>
        </div>
      </section>

      <!-- ========== ListGroup ========== -->
      <section id="list-group" class="gallery__section">
        <h2 class="gallery__section-title">ListGroup / ListSubheader 列表分组</h2>
        <p class="gallery__section-note">
          分组是 <code>&lt;li role="none"&gt;</code> 包一个 <code>&lt;ul role="list"&gt;</code>，
          读屏会念「已分组、组名、共 N 项」，而不是把标题当成一条普通列表项；
          ListSubheader 则是 <code>role="presentation"</code>，视觉上是标题、语义上不占位。
        </p>

        <div class="gallery__surface">
          <M3List>
            <M3ListSubheader label="账户" />
            <M3ListItem headline="个人资料" supporting="昵称、头像与联系方式" clickable :leading-icon="IcoPerson" />
            <M3ListItem headline="安全" supporting="密码与两步验证" clickable :leading-icon="IcoSettings" />

            <M3ListGroup title="工作区" spaced>
              <M3ListItem headline="成员" supporting="8 人" clickable :leading-icon="IcoPerson" />
              <M3ListItem headline="账单" supporting="下次扣费 12 月 1 日" clickable :leading-icon="IcoAnalytics" />
            </M3ListGroup>

            <M3ListGroup title="与图标对齐的标题" spaced inset>
              <M3ListItem headline="已归档项目" clickable :leading-icon="IcoFolder" />
              <M3ListItem headline="回收站" clickable :leading-icon="IcoDelete" />
            </M3ListGroup>
          </M3List>
        </div>
      </section>

      <!-- ========== Avatar ========== -->
      <section id="avatar" class="gallery__section">
        <h2 class="gallery__section-title">Avatar 头像</h2>
        <p class="gallery__section-note">
          图片加载完成后淡入并轻微放大（1.04 → 1）。只淡入的话，图与首字母之间的切换像一次闪烁。
          中日韩姓名取前两个字，拉丁姓名取两个词的首字母 —— 否则「云术 工作室」会缩写成一个像另一个名字的「云工」。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 20px">
            <M3Avatar name="云术 工作室" :size="32" />
            <M3Avatar name="Cloudery Studio" :size="40" />
            <M3Avatar name="林" :size="48" ring />
            <M3Avatar name="Zed" :size="64" />
            <M3Avatar src="https://avatars.githubusercontent.com/u/1?v=4" name="GitHub" :size="56" />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">状态 / 方形</p>
          <div class="gallery__row" style="gap: 20px">
            <M3Avatar name="林澈" :size="44" status="online" />
            <M3Avatar name="周野" :size="44" status="away" />
            <M3Avatar name="陈默" :size="44" status="busy" />
            <M3Avatar name="苏黎" :size="44" status="offline" />
            <M3Avatar name="方" :size="44" shape="square" />
            <M3Avatar name="云" :size="44" shape="square" status="online" />
          </div>
        </div>
      </section>

      <!-- ========== ExpansionPanel ========== -->
      <section id="expansion" class="gallery__section">
        <h2 class="gallery__section-title">ExpansionPanel 展开面板</h2>
        <p class="gallery__section-note">
          高度动画用 <code>grid-template-rows: 0fr → 1fr</code>：它能在不知道内容高度的前提下平滑展开；
          max-height 需要猜一个上限，内容一变就会露馅。受控（v-model）与非受控两种用法都支持。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 12px">
          <M3ExpansionPanel v-model="panelOpen" title="交付说明" supporting="展开时才会渲染操作区">
            <p>组件按页面分成 8 组。新增组件都走同一套结构令牌，配色仍然由使用方的 --md-sys-color-* 注入。</p>
            <p>展开高度不做固定值，内容里的图片加载完成后面板会自己长高。</p>
            <template #actions>
              <M3Button size="sm" variant="text">查看文档</M3Button>
              <M3Button size="sm" variant="text" @click="panelOpen = false">收起</M3Button>
            </template>
          </M3ExpansionPanel>

          <M3ExpansionPanel title="默认收起（非受控）" supporting="不传 modelValue 时自己管理状态">
            <p>受控与非受控共用同一套动画；非受控只是把状态留在组件内部。</p>
          </M3ExpansionPanel>

          <M3ExpansionPanel title="禁用" disabled>
            <p>禁用时标题仍在 Tab 序里，但无法展开。</p>
          </M3ExpansionPanel>
        </div>
      </section>

      <!-- ========== StatCard ========== -->
      <section id="stat-card" class="gallery__section">
        <h2 class="gallery__section-title">StatCard 指标卡</h2>
        <p class="gallery__section-note">
          指标卡只负责「标签 / 数值 / 变化」的排版，不负责算数。trend 同时控制箭头方向与颜色：
          上升用 primary、下降用 error —— 不写死绿色，换主题色时语义仍然成立。
        </p>

        <div class="gallery__grid">
          <M3StatCard label="本周访问" :value="12840" delta="+12.4%" trend="up" hint="较上周同期" :icon="IcoAnalytics">
            <template #chart>
              <M3Sparkline :values="sparkValues" :width="220" :height="44" aria-label="访问趋势" />
            </template>
          </M3StatCard>

          <M3StatCard label="错误率" value="0.42%" delta="-0.18%" trend="down" hint="目标 < 0.5%" :icon="IcoBolt">
            <template #chart>
              <M3Sparkline :values="sparkValues2" :width="220" :height="44" tone="error" aria-label="错误率趋势" />
            </template>
          </M3StatCard>

          <M3StatCard label="组件数" :value="46" delta="持平" trend="neutral" hint="v0.5.0 新增 21 个" :icon="IcoDashboard" tone="tertiary" interactive />

          <M3StatCard label="实时在线" :value="248" delta="+3" trend="up" hint="每 30 秒刷新" :icon="IcoPerson">
            <template #footer>
              <M3Badge dot tone="primary" />
              <span style="font-size: 12px; color: var(--md-sys-color-on-surface-variant)">自动刷新中</span>
            </template>
          </M3StatCard>
        </div>
      </section>

      <!-- ========== Sparkline ========== -->
      <section id="sparkline" class="gallery__section">
        <h2 class="gallery__section-title">Sparkline 迷你图</h2>
        <p class="gallery__section-note">
          没有坐标轴、没有 tooltip —— 它只回答「最近在涨还是在跌」。曲线用 Catmull-Rom 转三次贝塞尔，
          面积填充取 12% 透明度，避免抢走旁边的数字。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 32px; align-items: flex-end">
            <M3Sparkline :values="sparkValues" :width="180" :height="48" aria-label="访问趋势" />
            <M3Sparkline :values="sparkValues2" :width="180" :height="48" tone="error" aria-label="错误率趋势" />
            <M3Sparkline :values="sparkValues" :width="180" :height="48" :filled="false" tone="tertiary" aria-label="未填充" />
            <M3Sparkline :values="[4, 4, 4, 4, 4]" :width="180" :height="48" tone="on-surface" aria-label="平坦序列" />
          </div>
        </div>
      </section>

      <!-- ========== Table ========== -->
      <section id="table" class="gallery__section">
        <h2 class="gallery__section-title">Table 表格</h2>
        <p class="gallery__section-note">
          排序是受控的：点击表头只发出 <code>update:sort</code>，真正怎么排由使用方决定（本地、远程、按业务规则都行）。
          表头带 <code>aria-sort</code>，读屏能念出当前升/降序；加载时顶部出现一条不确定进度条。
        </p>

        <div class="gallery__surface">
          <M3Table
            :columns="demoColumns"
            :rows="sortedTableRows"
            row-key="id"
            :sort="tableSort"
            sticky-header
            @update:sort="tableSort = $event"
            @row-click="showSnack('打开：' + $event.row.name)"
          >
            <template #cell-name="{ value }">
              <strong style="font-weight: 500">{{ value }}</strong>
            </template>
            <template #cell-orders="{ value }">
              <span style="font-variant-numeric: tabular-nums">{{ value }}</span>
            </template>
            <template #cell-status="{ value }">
              <M3Chip
                :label="String(value)"
                :variant="value === '已完成' ? 'filter' : 'assist'"
                :selected="value === '已完成'"
              />
            </template>
          </M3Table>

          <p class="gallery__label" style="margin-block-start: 24px">空状态 / 加载</p>
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
            <M3Table :columns="demoColumns.slice(0, 2)" :rows="[]" empty-text="还没有项目" />
            <M3Table :columns="demoColumns.slice(0, 2)" :rows="sortedTableRows.slice(0, 2)" loading />
          </div>
        </div>
      </section>

      <!-- ========== Tree ========== -->
      <section id="tree" class="gallery__section">
        <h2 class="gallery__section-title">Tree 树形列表</h2>
        <p class="gallery__section-note">
          展开高度用 <code>grid-template-rows: 0fr → 1fr</code>，不用猜内容高度；折叠的子树仍留在 DOM 里（才有动画），
          所以给它加 <code>inert</code> —— 否则 Tab 会钻进看不见的行里。
          键盘导航由根节点做事件委托：树的「上一项 / 下一项」本来就是可见行的顺序，只有根知道整棵树的排版结果。
          整棵树只占一个 Tab 停靠点，进入后用 ↑↓ / ←→ / Home / End 走，空格勾选。
          可勾选模式下**整行都是勾选区**：既然 hover 高亮铺满整行，点击就应该在整行生效，
          不能要求用户精确点到 18dp 的方框。
        </p>

        <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr))">
          <div class="gallery__surface">
            <p class="gallery__label">单选（目录树）</p>
            <M3Tree v-model:selected="treeSelected" :nodes="treeNodes" default-expanded="all" />
            <p class="gallery__hint">当前选中：{{ treeSelected ?? '无' }}</p>
          </div>

          <div class="gallery__surface">
            <p class="gallery__label">级联勾选（叶子计数）</p>
            <M3Tree v-model:checked="treeChecked" :nodes="treeNodes" checkable default-expanded="all" />
            <p class="gallery__hint">已勾选 {{ treeChecked.length }} 项</p>
          </div>
        </div>
      </section>

      <!-- ========== Timeline ========== -->
      <section id="timeline" class="gallery__section">
        <h2 class="gallery__section-title">Timeline 时间线</h2>
        <p class="gallery__section-note">
          连接线画在 marker 的中轴上，最后一个节点自动收尾。状态只影响 marker 与文字颜色，不改布局 ——
          否则一条时间线里出现错误项时，整列的圆点会错位。
        </p>

        <div class="gallery__surface">
          <M3Timeline :items="demoEvents" />
          <p class="gallery__label" style="margin-block-start: 24px">紧凑</p>
          <M3Timeline :items="demoEvents.slice(0, 3)" dense />
        </div>
      </section>

      <!-- ========== Countdown ========== -->
      <section id="countdown" class="gallery__section">
        <h2 class="gallery__section-title">Countdown 倒计时</h2>
        <p class="gallery__section-note">
          不是「每秒 setTimeout」—— 定时器晚 30ms 的话数字就会在整秒后半拍才翻，看半分钟就很明显。
          这里每次只睡到「下一个整秒边界」，数字永远在真正跨秒的那一刻翻面；晚到的定时器重新按剩余时间排下一次。
          省略某个单位时它会折算进上一个显示的单位（不显示天就显示小时）。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 28px">
          <M3Countdown :to="countdownTarget" size="md" @finished="countdownDone = true">
            <template #finished>
              <M3Alert variant="success" title="已开始">倒计时结束，会议现在开始。</M3Alert>
            </template>
          </M3Countdown>

          <div class="gallery__row" style="gap: 12px">
            <M3Button size="sm" variant="tonal" @click="resetCountdown">重置为 65 秒</M3Button>
            <span class="gallery__hint" style="margin: 0">{{ countdownDone ? '已结束' : '运行中' }}</span>
          </div>

          <p class="gallery__label" style="margin: 0">Inline / 不显示天数 / 小尺寸</p>
          <div class="gallery__row" style="gap: 24px; flex-wrap: wrap">
            <M3Countdown :to="countdownTarget" variant="inline" :units="['hours', 'minutes', 'seconds']" />
            <M3Countdown :to="countdownTarget" variant="inline" :units="['hours', 'minutes', 'seconds']" size="sm" :labels="false" />
          </div>
        </div>
      </section>

      <!-- ========== InfiniteScroll ========== -->
      <section id="infinite-scroll" class="gallery__section">
        <h2 class="gallery__section-title">InfiniteScroll 无限滚动</h2>
        <p class="gallery__section-note">
          底部放一个哨兵元素，进入视口就 emit('load')。用 IntersectionObserver 而不是监听 scroll：
          后者每帧都要读布局，长列表下掉帧很明显。loading / ended 时必须断开观察 ——
          否则「正在加载」期间哨兵一直可见，会连着触发好几次，把同一页数据拉三遍。
        </p>

        <div class="gallery__surface">
          <div style="max-block-size: 260px; overflow-y: auto; padding-inline-end: 8px">
            <M3InfiniteScroll :loading="feedLoading" :ended="feedEnded" @load="loadMore">
              <M3List dense>
                <M3ListItem
                  v-for="item in feed"
                  :key="item.id"
                  :headline="item.title"
                  :supporting="'耗时 ' + (item.id * 3 + 12) + 's'"
                  :leading-icon="IcoCloud"
                />
              </M3List>
            </M3InfiniteScroll>
          </div>
          <p class="gallery__hint">滚到列表底部会自动加载；第 3 页之后显示「没有更多了」。</p>
        </div>
      </section>

      <!-- ========== Tabs ========== -->
      <section id="tabs" class="gallery__section">
        <h2 class="gallery__section-title">Tabs 标签页</h2>
        <p class="gallery__section-note">
          指示条不是一个 CSS transition，而是两条独立的弹簧（位移 / 宽度）：连续快速切换时速度会带着走，
          不会像 transition 那样从 0 重新加速。键盘 ↑↓/←→/Home/End 自动激活并跳过禁用项。
        </p>

        <div class="gallery__surface">
          <M3Tabs v-model="tab" :tabs="demoTabs" aria-label="项目视图" />
          <p class="gallery__hint" style="margin-block-start: 16px">当前标签：{{ tab }}</p>

          <p class="gallery__label" style="margin-block-start: 24px">Secondary（通栏下划线）</p>
          <M3Tabs v-model="tab" :tabs="demoTabs.slice(0, 3)" variant="secondary" aria-label="次级标签" />

          <p class="gallery__label" style="margin-block-start: 24px">Scrollable（很多标签时横向滚动）</p>
          <M3Tabs
            v-model="tab"
            :tabs="[
              { value: 'overview', label: '概览' },
              { value: 'activity', label: '动态' },
              { value: 'files', label: '文件' },
              { value: 'settings', label: '设置' },
              { value: 'members', label: '成员' },
              { value: 'billing', label: '账单' },
              { value: 'integrations', label: '集成' },
              { value: 'audit', label: '审计日志' },
            ]"
            scrollable
            aria-label="可滚动标签"
          />
        </div>
      </section>

      <!-- ========== TopAppBar ========== -->
      <section id="top-app-bar" class="gallery__section">
        <h2 class="gallery__section-title">TopAppBar 顶栏</h2>
        <p class="gallery__section-note">
          small / medium / large 三档，medium 与 large 把标题下移，让页面在滚动时有一个自然的层级。
          overlay 模式不画自己的底色，留给使用方用 <code>background</code> 槽做玻璃拟态。
        </p>

        <div class="gallery__surface" style="padding: 0; overflow: hidden">
          <M3TopAppBar :sticky="false" elevated aria-label="示例顶栏">
            <template #leading>
              <M3IconButton :icon="IcoSearch" label="搜索" />
            </template>
            <template #default>
              <span style="font-size: 20px">组件库</span>
            </template>
            <template #actions>
              <M3IconButton :icon="IcoNotifications" label="通知" />
              <M3IconButton :icon="IcoSettings" label="设置" />
            </template>
          </M3TopAppBar>

          <M3TopAppBar :sticky="false" size="large" aria-label="大号顶栏">
            <template #leading>
              <M3IconButton :icon="IcoHome" label="返回" />
            </template>
            <template #default>
              <span style="font-size: 28px">数据展示</span>
            </template>
            <template #actions>
              <M3IconButton :icon="IcoEdit" label="编辑" />
            </template>
          </M3TopAppBar>
        </div>
      </section>

      <!-- ========== NavigationBar ========== -->
      <section id="navigation-bar" class="gallery__section">
        <h2 class="gallery__section-title">NavigationBar 底部导航</h2>
        <p class="gallery__section-note">
          3–5 个目的地的移动端主导航。选中项用 64×32 的次级容器色胶囊把图标托起来，
          标签留在原位 —— 只给图标加底色、不给文字加，视觉重心才不会被拉走。
        </p>

        <div class="gallery__surface" style="padding: 0; overflow: hidden">
          <M3NavigationBar v-model="navBarValue" :items="navBarItems" />
        </div>
        <p class="gallery__hint">当前：{{ navBarValue }}</p>
      </section>

      <!-- ========== NavigationRail ========== -->
      <section id="navigation-rail" class="gallery__section">
        <h2 class="gallery__section-title">NavigationRail 侧边导航</h2>
        <p class="gallery__section-note">
          平板与桌面的紧凑导航。80dp 窄轨只放图标和短标签，展开到 256dp 后图标与标签并排，
          给需要完整文字的场景。FAB 槽位在顶部，与 M3 rail 的规范一致。
        </p>

        <div class="gallery__surface" style="padding: 0; overflow: hidden; min-height: 320px; display: flex; gap: 16px">
          <M3NavigationRail v-model="railValue" :items="railItems" :expanded="railExpanded">
            <template #fab>
              <M3Fab :icon="IcoAdd" aria-label="新建" size="sm" variant="primary-container" />
            </template>
          </M3NavigationRail>

          <div style="padding: 20px; flex: 1">
            <label class="gallery__row" style="gap: 8px">
              <M3Switch v-model="railExpanded" label="展开侧栏" />
              <span>展开侧栏（{{ railExpanded ? '256dp' : '80dp' }}）</span>
            </label>
            <p class="gallery__hint">当前目的地：{{ railValue }}</p>
          </div>
        </div>
      </section>

      <!-- ========== Breadcrumbs ========== -->
      <section id="breadcrumbs" class="gallery__section">
        <h2 class="gallery__section-title">Breadcrumbs 面包屑</h2>
        <p class="gallery__section-note">
          超过 <code>max</code> 时折叠中间层级：首层、省略号菜单、最后几层。省略号本身是一个菜单触发器，
          隐藏的层级不会「消失」，仍然可以从菜单里回去。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 20px">
          <M3Breadcrumbs :items="breadcrumbItems" />
          <M3Breadcrumbs :items="breadcrumbItems" :max="3" separator="slash" />
          <M3Breadcrumbs
            :items="[
              { label: '首页', href: '#', icon: IcoHome },
              { label: '设置', href: '#' },
              { label: '成员', href: '#' },
              { label: '权限', href: '#' },
              { label: '角色详情' },
            ]"
            :max="4"
          />
        </div>
      </section>

      <!-- ========== Stepper ========== -->
      <section id="stepper" class="gallery__section">
        <h2 class="gallery__section-title">Stepper 步骤条</h2>
        <p class="gallery__section-note">
          默认线性：只能回到已完成的步骤，不能跳到未来。错误步骤同时显示数字与 error 色 ——
          只换颜色不够，色觉障碍用户需要另一个线索。
        </p>

        <div class="gallery__surface">
          <M3Stepper v-model="step" :steps="stepItems" aria-label="开通流程" />
          <p class="gallery__hint">当前第 {{ step + 1 }} 步</p>

          <p class="gallery__label" style="margin-block-start: 24px">纵向 + 错误步骤</p>
          <div style="max-width: 420px">
            <M3Stepper
              v-model="step"
              :steps="stepItems"
              orientation="vertical"
              :error="2"
              aria-label="纵向步骤"
            />
          </div>
        </div>
      </section>

      <!-- ========== Pagination ========== -->
      <section id="pagination" class="gallery__section">
        <h2 class="gallery__section-title">Pagination 分页</h2>
        <p class="gallery__section-note">
          首尾页始终可见，中间围绕当前页展开，间隔处补省略号。页数很多时（后台列表常见 20+ 页）
          固定 5 个页码会让用户没法一键跳到最后一页。
        </p>

        <div class="gallery__surface">
          <M3Pagination v-model:page="page" :total-pages="20" />
          <p class="gallery__hint">当前第 {{ page }} 页 / 共 20 页</p>

          <p class="gallery__label" style="margin-block-start: 24px">大页数（首尾 + 省略号）</p>
          <M3Pagination v-model:page="pageBig" :total-pages="42" :siblings="1" />
          <p class="gallery__hint">当前第 {{ pageBig }} 页 / 共 42 页</p>
        </div>
      </section>

      <!-- ========== PageProgress ========== -->
      <section id="page-progress" class="gallery__section">
        <h2 class="gallery__section-title">PageProgress 页面进度</h2>
        <p class="gallery__section-note">
          状态在 <code>usePageProgress()</code> 的模块单例里，所以路由守卫里 <code>start()</code>、
          页面里 <code>done()</code>，两边不需要互相认识。加载中每 200ms 往前蹭一点（上限 90%），
          越接近 90% 越慢 —— 线性爬升会让人以为下一秒就结束；走到 100% 后停 250ms 再淡出，太快消失反而看不出完成了。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="runPageProgressDemo">跑一次页面加载</M3Button>
            <span class="gallery__hint" style="margin: 0">进度条贴在视口顶部，注意页面最上方那一条。</span>
          </div>
        </div>
      </section>

      <!-- ========== Dialog ========== -->
      <section id="dialog" class="gallery__section">
        <h2 class="gallery__section-title">Dialog / Confirm</h2>
        <p class="gallery__section-note">
          入场从下方 16px 升上来并从 0.92 放大，出场更快地缩回去（short3）——
          「进来要稳、出去要干脆」。确认框基于同一个 Dialog，只多一层命令式 API；
          danger 直接复用 M3Button 的 danger，不再自己拼一个按钮。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button @click="dialogOpen = true">打开对话框</M3Button>
            <M3Button danger @click="askDanger">危险操作确认</M3Button>
          </div>
        </div>

        <M3Dialog v-model="dialogOpen" title="组件库说明" :icon="IcoCheck" size="md">
          <p style="margin: 0">
            对话框是少数<strong>必须</strong>打断用户的控件。它应该只用于「必须立刻决定」的事，
            凡是能撤销的操作都不该用它。
          </p>
          <template #actions>
            <M3Button variant="text" @click="dialogOpen = false">知道了</M3Button>
          </template>
        </M3Dialog>

        <M3ConfirmDialog ref="confirmRef" />
      </section>

      <!-- ========== Sheet ========== -->
      <section id="sheet" class="gallery__section">
        <h2 class="gallery__section-title">Sheet 面板</h2>
        <p class="gallery__section-note">
          侧边与底部面板都只用 transform 做动画（走合成层），不做宽度动画 ——
          宽度变化会让面板内的文字重新排版。底部面板默认带 drag handle。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="sheetOpen = true">打开底部面板</M3Button>
          </div>
        </div>

        <M3Sheet v-model="sheetOpen" side="bottom" size="60vh" title="底部面板">
          <div style="padding: 0 16px 16px">
            <p style="margin: 0 0 12px; color: var(--md-sys-color-on-surface-variant)">
              底部面板适合放「选项列表」或「次级表单」，它的优势是拇指能够到。
            </p>
            <M3List>
              <M3ListItem headline="分享" clickable :leading-icon="IcoShare" />
              <M3ListItem headline="收藏" clickable :leading-icon="IcoFavorite" />
              <M3ListItem headline="删除" clickable :leading-icon="IcoDelete" />
            </M3List>
          </div>
        </M3Sheet>
      </section>

      <!-- ========== Menu ========== -->
      <section id="menu" class="gallery__section">
        <h2 class="gallery__section-title">Menu 菜单</h2>
        <p class="gallery__section-note">
          从锚点方向「长出来」（scaleY 0.85 → 1）。打开时焦点进入第一项，
          ↑↓ / Home / End 移动，Esc 关闭并把焦点还给触发器 —— 菜单不能用 Tab 逐项走，那是表单的行为。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <!-- 菜单自己管开合：点 trigger、点外部、按 Esc 都会关 -->
            <M3Menu>
              <template #trigger="{ open }">
                <M3Button variant="outlined" :aria-expanded="open">打开菜单</M3Button>
              </template>

              <M3MenuItem headline="重命名" :leading-icon="IcoEdit" />
              <M3MenuItem headline="移动到…" :leading-icon="IcoShare" />
              <M3MenuItem headline="删除" :leading-icon="IcoDelete" />
            </M3Menu>

            <M3Menu placement="bottom-end" :min-width="220">
              <template #trigger="{ open }">
                <M3Button variant="tonal" :aria-expanded="open">可勾选菜单</M3Button>
              </template>
              <M3MenuItem headline="显示网格" checkable :selected="true" :leading-icon="IcoDashboard" />
              <M3MenuItem headline="显示列表" checkable :selected="false" />
              <M3MenuItem headline="显示详情" supporting="右侧信息栏" checkable :selected="false" />
            </M3Menu>
          </div>
        </div>
      </section>

      <!-- ========== Snackbar ========== -->
      <section id="snackbar" class="gallery__section">
        <h2 class="gallery__section-title">Snackbar 提示条</h2>
        <p class="gallery__section-note">
          从下方滑入 28px 并轻微放大，出场更快地缩回去。它盖在页面底部，
          位移幅度要比对话框大一些才看得出「来了」。带「撤销」时，鼠标停留或键盘聚焦会暂停倒计时。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="showAllTones">依次演示四种色调</M3Button>
            <M3Button variant="text" @click="showSuccess('已保存')">成功</M3Button>
            <M3Button variant="text" @click="showWarning('空间不足', '注意')">警告</M3Button>
            <M3Button variant="text" @click="showError('请求失败')">错误</M3Button>
            <M3Button variant="outlined" @click="showUndo">带撤销</M3Button>
          </div>
        </div>
      </section>

      <!-- ========== Tooltip ========== -->
      <section id="tooltip" class="gallery__section">
        <h2 class="gallery__section-title">Tooltip 气泡提示</h2>
        <p class="gallery__section-note">
          悬停 300ms 后才出现，避免扫过一排按钮时到处冒泡；这个延迟是功能，不是装饰。
          隐藏时用 <code>display:none</code> 移出布局，否则绝对定位的气泡会撑出横向滚动条。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 28px">
            <M3Tooltip text="在上方显示">
              <M3Button variant="outlined">悬停我</M3Button>
            </M3Tooltip>
            <M3Tooltip text="在下方显示" placement="bottom">
              <M3IconButton :icon="IcoSearch" label="搜索" variant="tonal" />
            </M3Tooltip>
            <M3Tooltip text="左侧" placement="left">
              <M3IconButton :icon="IcoFavorite" label="收藏" />
            </M3Tooltip>
            <M3Tooltip text="右侧的提示可以换行，长文本不会把页面撑宽" placement="right">
              <M3IconButton :icon="IcoNotifications" label="通知" />
            </M3Tooltip>
          </div>
        </div>
      </section>

      <!-- ========== CommandPalette ========== -->
      <section id="command-palette" class="gallery__section">
        <h2 class="gallery__section-title">CommandPalette 命令面板</h2>
        <p class="gallery__section-note">
          <M3Kbd :keys="['Ctrl', 'K']" /> 随时唤出。搜索是朴素子串匹配，不做模糊匹配 ——
          命令名都很短，模糊匹配反而会把「格式：文档」和「导出：文档」混在一起，按回车就选错。
          焦点、滚动锁、Esc 交给 useModal：它本质是个对话框，只是内容长得像搜索框加列表。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button variant="tonal" :icon="IcoSearch" @click="paletteOpen = true">打开命令面板</M3Button>
            <M3Kbd :keys="['Ctrl', 'K']" />
            <span class="gallery__hint" style="margin: 0">↑↓ 选择，Enter 执行，Esc 关闭。</span>
          </div>
        </div>
      </section>

      <!-- ========== LoadingOverlay ========== -->
      <section id="loading-overlay" class="gallery__section">
        <h2 class="gallery__section-title">LoadingOverlay 加载遮罩</h2>
        <p class="gallery__section-note">
          半透明 + 背景模糊，而不是纯色不透明：用户能看见底下「确实是刚刚那一块内容」，
          页面没有闪成另一个界面，也就不会怀疑自己点错了。只有要彻底遮住敏感内容时才用 <code>opaque</code>。
        </p>

        <div class="gallery__grid">
          <div class="gallery__surface" style="padding: 0; overflow: hidden">
            <M3LoadingOverlay :visible="overlayInline" text="正在同步项目…">
              <template #content>
                <div style="padding: 24px; min-block-size: 200px">
                  <p style="margin: 0 0 8px; font-weight: 500">被遮住的内容</p>
                  <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-on-surface-variant)">
                    遮罩会继承宿主元素的圆角，不会画到卡片外面去。
                  </p>
                  <div class="gallery__row" style="margin-block-start: 16px">
                    <M3Button variant="tonal" @click="runOverlayInline">重新加载</M3Button>
                  </div>
                </div>
              </template>
            </M3LoadingOverlay>
          </div>

          <div class="gallery__surface">
            <p class="gallery__label">全屏遮罩</p>
            <p class="gallery__hint" style="margin-block-start: 0">
              Teleport 到 body，盖住整个视口；1.2 秒后自动收起。
            </p>
            <M3Button variant="outlined" @click="runOverlayFull">全屏加载 1.2 秒</M3Button>
            <p class="gallery__label" style="margin-block-start: 20px">属性</p>
            <p class="gallery__hint" style="margin-block-start: 0">
              <code>fullscreen</code> 盖住视口，<code>opaque</code> 换成不透明底色，<code>size</code> 调环形指示器直径。
            </p>
          </div>
        </div>
      </section>

      <!-- ========== Alert ========== -->
      <section id="alert" class="gallery__section">
        <h2 class="gallery__section-title">Alert 行内提示</h2>
        <p class="gallery__section-note">
          MD3 没有「告警条」组件，官方做法是容器 + 语义色。错误用 <code>role="alert"</code>
          立即播报，其余用 <code>status</code> 礼貌播报；neutral 用于纯信息性的系统状态。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 12px">
          <M3Alert variant="info" title="提示">
            这是一条普通说明，可以带 <a href="#">链接</a>。
          </M3Alert>
          <M3Alert variant="success" title="已完成">配置已保存并生效。</M3Alert>
          <M3Alert variant="warning" title="注意">磁盘空间只剩 10%，建议清理。</M3Alert>
          <M3Alert variant="error" title="请求失败">
            连接超时，请稍后重试。
            <template #actions>
              <M3Button size="sm" variant="text">重试</M3Button>
              <M3Button size="sm" variant="text">查看日志</M3Button>
            </template>
          </M3Alert>
          <M3Alert variant="neutral" title="系统状态">所有服务运行正常。</M3Alert>
          <M3Alert variant="info" dismissible @dismiss="showSnack('已关闭提示')">
            这条可以手动关闭。
          </M3Alert>
        </div>
      </section>

      <!-- ========== EmptyState ========== -->
      <section id="empty" class="gallery__section">
        <h2 class="gallery__section-title">EmptyState 空状态</h2>
        <p class="gallery__section-note">
          图标 + 标题 + 说明 + 恢复操作。所有站点都长这样，各写一份迟早在内边距和圆角上分叉。
        </p>

        <div class="gallery__surface">
          <M3EmptyState
            title="还没有任何组件"
            description="组件会在你第一次创建后出现在这里。也可以从模板开始。"
            action-label="新建组件"
            @action="showSnack('已新建')"
          />
        </div>
      </section>

      <!-- ========== Skeleton ========== -->
      <section id="skeleton" class="gallery__section">
        <h2 class="gallery__section-title">Skeleton 骨架屏</h2>
        <p class="gallery__section-note">
          扫光比明暗脉冲更像「正在取数据」。只在首屏用 —— 刷新已有内容时整体替换会让页面闪。
          现在支持 list / card / text / avatar 四种版式；关掉 animated 就是一块安静的静态占位。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
          <M3Skeleton variant="list" :rows="2" label="正在加载列表" />
          <M3Skeleton variant="card" :rows="1" label="正在加载卡片" />
          <div>
            <M3Skeleton variant="text" :rows="4" label="正在加载正文" />
            <M3Skeleton variant="avatar" :rows="2" label="正在加载成员" :animated="false" />
          </div>
        </div>
      </section>

      <!-- ========== AnimatedNumber ========== -->
      <section id="animated-number" class="gallery__section">
        <h2 class="gallery__section-title">AnimatedNumber 数字滚动</h2>
        <p class="gallery__section-note">
          数值变化时用 rAF 从旧值滚到新值，缓动曲线与 emphasized 对齐。数字用
          <code>Intl.NumberFormat</code> 格式化，千分位和本地化小数位都跟着语言走。
          开启 <code>live</code> 时只把最终值交给读屏，避免每一帧都播报。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 24px; align-items: baseline">
            <span style="font-size: 40px; font-weight: 500">
              <M3AnimatedNumber :value="bigNumber" />
            </span>
            <M3Button variant="tonal" @click="bumpNumber(128)">+128</M3Button>
            <M3Button variant="outlined" @click="bumpNumber(-64)">−64</M3Button>
            <M3Button variant="text" @click="bigNumber = 0">归零</M3Button>
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">金额 / 小数 / 前后缀</p>
          <div class="gallery__row" style="gap: 24px">
            <M3AnimatedNumber :value="bigNumber * 3.14" prefix="¥ " :decimals="2" />
            <M3AnimatedNumber :value="bigNumber" suffix=" 次" />
            <M3AnimatedNumber :value="bigNumber / 1000" suffix="k" :decimals="1" />
          </div>
        </div>
      </section>

      <!-- ========== RelativeTime ========== -->
      <section id="relative-time" class="gallery__section">
        <h2 class="gallery__section-title">RelativeTime 相对时间</h2>
        <p class="gallery__section-note">
          用 <code>Intl.RelativeTimeFormat</code> 而不是自己拼「x 分钟前」，换语言时不用改代码；
          <code>&lt;time datetime&gt;</code> 和 title 上仍然保留完整的绝对时间。
          默认每 60 秒刷新一次，「3 分钟前」会自己变成「4 分钟前」。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 20px; flex-wrap: wrap">
            <span>更新于 <M3RelativeTime :value="fiveMinutesAgo" /></span>
            <span>会议在 <M3RelativeTime :value="inThreeHours" /></span>
            <span>上次登录 <M3RelativeTime :value="lastWeek" /></span>
            <span>固定语言（en）<M3RelativeTime :value="lastWeek" locale="en" /></span>
          </div>
        </div>
      </section>

      <!-- ========== CopyButton ========== -->
      <section id="copy-button" class="gallery__section">
        <h2 class="gallery__section-title">CopyButton 复制</h2>
        <p class="gallery__section-note">
          优先用 <code>navigator.clipboard</code>，在 http 页面或权限被拒时回退到
          <code>execCommand</code> —— 只写 Clipboard API 的话，内网 http 站点上点复制会静默失败。
          成功后图标短暂变成对勾，1.6 秒后自动还原。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 16px">
            <M3CopyButton :text="installCommand" variant="tonal" />
            <M3CopyButton :text="installCommand" icon-only label="复制安装命令" variant="outlined" />
            <M3CopyButton text="hello@cloudery.studio" label="复制邮箱" variant="text" />
            <code style="padding: 4px 8px; border-radius: 6px; background: var(--md-sys-color-surface-container-high); font-size: 12px">
              {{ installCommand }}
            </code>
          </div>
          <p class="gallery__hint">点击后 1.6 秒内会显示「已复制」。</p>
        </div>
      </section>
      <!-- ========== Autocomplete / MultiSelect ========== -->
      <section id="autocomplete" class="gallery__section">
        <h2 class="gallery__section-title">Autocomplete / MultiSelect</h2>
        <p class="gallery__section-note">
          自动完成 vs 下拉选择：Select 是「从固定列表里挑」，Autocomplete 是「先打几个字把候选缩到几条」。
          失焦时草稿会退回已选项 —— 输入框里不该留着一个不存在的值。多选勾选后面板不关，
          因为多选的意图通常是「再选一个」。
        </p>
        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
            <M3Autocomplete v-model="autoValue" :options="autoOptions" label="框架" :icon="IcoSearch" />
            <M3Autocomplete :model-value="'vite'" :options="autoOptions" label="Outlined" variant="outlined" hint="可清空" />
            <M3MultiSelect v-model="multiValues" :options="multiOptions" label="技术栈" placeholder="选择技术" />
            <M3MultiSelect :model-value="['ts']" :options="multiOptions" label="Outlined" variant="outlined" :max="2" hint="最多 2 项" />
          </div>
        </div>
      </section>

      <!-- ========== TagInput / MaskField ========== -->
      <section id="tag-mask" class="gallery__section">
        <h2 class="gallery__section-title">TagInput / MaskField</h2>
        <p class="gallery__section-note">
          标签输入：回车/逗号成 chip，退格在空输入框里删最后一个，失焦提交半截文字。
          掩码输入：<code>#</code> 数字位、<code>A</code> 字母位、<code>*</code> 两者皆可，分隔符由掩码自动补。
        </p>
        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
            <M3TagInput v-model="tagValues" label="标签" placeholder="输入后回车" :max="6" hint="最多 6 个" />
            <M3MaskField v-model="maskValue" label="银行卡号" mask="#### #### #### ####" inputmode="numeric" hint="四位一组，自动补空格" />
          </div>
          <p class="gallery__hint">当前标签：{{ tagValues.join(' / ') || '空' }}</p>
        </div>
      </section>

      <!-- ========== Phone / Country / Timezone ========== -->
      <section id="phone-timezone" class="gallery__section">
        <h2 class="gallery__section-title">Phone / Country / Timezone</h2>
        <p class="gallery__section-note">
          电话号码对外统一 E.164（+8613800138000），分组空格只影响显示；国家清单只收常用的一批，
          国旗用 Unicode 区域指示符拼出来，不需要图片资源；时区清单来自 Intl，带当前 UTC 偏移。
        </p>
        <div class="gallery__surface">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
            <M3PhoneInput v-model="phone" v-model:country="phoneCountry" label="手机号" />
            <M3CountrySelect v-model="phoneCountry" label="国家/地区" />
            <M3TimezoneSelect v-model="timezone" label="时区" />
          </div>
          <p class="gallery__hint">E.164：{{ phone }} · 时区：{{ timezone }}</p>
        </div>
      </section>

      <!-- ========== 日期时间 ========== -->
      <section id="date-time" class="gallery__section">
        <h2 class="gallery__section-title">日期 / 时间 / 区间 / 可用性</h2>
        <p class="gallery__section-note">
          日期一律用本地日期串 <code>YYYY-MM-DD</code> 传递，不用 Date 对象跨组件 —— 否则东八区选 11 月 1 日会变成 10 月 31 日。
          桌面用贴附面板，移动端可切 <code>mode="modal"</code>：贴输入框的浮层会被软键盘顶出屏幕。
          可用性日历复用同一套网格与键盘行为，只把格子内容换成价格。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
            <M3DatePicker v-model="dateValue" label="日期" />
            <M3TimePicker v-model="timeValue" label="时间" />
            <M3DateRangePicker v-model="rangeValue" label="日期范围" :months="2" />
          </div>

          <div class="gallery__row" style="gap: 24px; align-items: flex-start">
            <div>
              <p class="gallery__label">月历（无业务）</p>
              <M3Calendar v-model="dateValue" />
            </div>
            <M3AvailabilityCalendar v-model="selectedStay" month="2026-11" :days="availabilityDays" />
            <div style="flex: 1; min-width: 280px">
              <p class="gallery__label">热力图（近 22 周）</p>
              <M3CalendarHeatmap :values="heatValues" :weeks="22" />
              <p class="gallery__hint">选中的日期：{{ selectedStay ?? '无' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== ContextMenu ========== -->
      <section id="context-menu" class="gallery__section">
        <h2 class="gallery__section-title">ContextMenu 右键菜单</h2>
        <p class="gallery__section-note">
          与 M3Menu 同一套面板与键盘约定，只是定位来源从锚点换成光标落点；滚一下就收起 ——
          菜单跟着鼠标走，页面一滚位置就失效，飘在错的地方比消失更糟。
        </p>
        <div class="gallery__surface">
          <M3ContextMenu>
            <template #trigger>
              <div style="display: grid; place-items: center; height: 120px; border: 1px dashed var(--md-sys-color-outline); border-radius: 12px">
                在这个区域点右键
              </div>
            </template>
            <M3MenuItem label="重命名" :icon="IcoEdit" @click="contextPicked = '重命名'" />
            <M3MenuItem label="复制链接" :icon="IcoShare" @click="contextPicked = '复制链接'" />
            <M3MenuItem label="删除" :icon="IcoDelete" :disabled="true" />
          </M3ContextMenu>
          <p class="gallery__hint">选择了：{{ contextPicked }}</p>
        </div>
      </section>

      <!-- ========== Tour ========== -->
      <section id="tour" class="gallery__section">
        <h2 class="gallery__section-title">Tour 新手引导</h2>
        <p class="gallery__section-note">
          高亮不用「挖洞」：给覆盖目标的小方块加一层 100vmax 的阴影，同时完成「照亮目标」和「压暗其余」，
          也不会在圆角处露缝。每帧跟随目标位置，所以引导可以发生在正在动画的面板上。
        </p>
        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 16px">
            <M3Button variant="tonal" @click="tourOpen = true; tourStep = 0">开始引导</M3Button>
            <span id="tour-anchor-1" class="gallery__hint" style="margin: 0">① 命令面板</span>
            <span id="tour-anchor-2" class="gallery__hint" style="margin: 0">② 主题配色</span>
          </div>
        </div>
      </section>

      <!-- ========== Hotkeys ========== -->
      <section id="hotkeys" class="gallery__section">
        <h2 class="gallery__section-title">Hotkeys 快捷键</h2>
        <p class="gallery__section-note">
          mod 在 Mac 上是 ⌘、其它平台是 Ctrl；正在输入框里打字时只放行带修饰键的组合，
          按住不放的自动重复会被忽略。按下试试，记录会出现在下面。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
          <M3Hotkeys :bindings="hotkeys" show-overlay />
          <div>
            <p class="gallery__label">最近触发</p>
            <p class="gallery__hint" style="margin: 0">{{ hotkeyLog.slice(0, 6).join('  ·  ') || '（还没有）' }}</p>
          </div>
        </div>
      </section>

      <!-- ========== Effects ========== -->
      <section id="effects" class="gallery__section">
        <h2 class="gallery__section-title">撒花 / 礼花 / 飘表情 / 滚动进场</h2>
        <p class="gallery__section-note">
          这四个是「庆祝」类动效：撒花用 Path2D 现画纸片（不引入 shape-morph），礼花是火箭 + 重力火星，
          飘表情交给合成器（Web Animation），滚动进场与 <code>v-reveal</code> 共用同一份 CSS。
          撒花与礼花共用一张全屏 canvas，没人用时立刻摘掉。
        </p>
        <div class="gallery__surface">
          <EffectsDemo />
        </div>
      </section>

      <!-- ========== Composables ========== -->
      <section id="composables" class="gallery__section">
        <h2 class="gallery__section-title">Composables 组合式函数</h2>
        <p class="gallery__section-note">
          从 m3ui-vue 移植的一批通用逻辑：窗口尺寸类、媒体查询、设备能力、本地存储、
          防抖/节流、点击外部、Esc 栈、交叉/尺寸观察、弹簧、自动增高、打印、逐行差异。
          它们不是「额外的 API」，而是把组件里已经在用的那套约定抽出来 —— 浮层组件现在共用同一个 Esc 栈。
        </p>
        <div class="gallery__surface">
          <ComposablesDemo />
        </div>
      </section>

      <!-- ========== FilterBuilder ========== -->
      <section id="filter-builder" class="gallery__section">
        <h2 class="gallery__section-title">FilterBuilder 筛选器</h2>
        <p class="gallery__section-note">
          v-model 是一棵纯 JSON 树，可以直接发给服务端，本地用 <code>filterRows()</code> 过滤。
          空规则（字段没选）不参与计算 —— 否则「刚点了一下添加条件」就会把整张表筛空。
        </p>
        <div class="gallery__surface">
          <M3FilterBuilder v-model="filterValue" :fields="filterFields" :max-depth="1" />
          <pre style="margin: 12px 0 0; padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container-high); font-size: 11px; overflow: auto">{{ JSON.stringify(filterValue, null, 2) }}</pre>
        </div>
      </section>

      <!-- ========== TransferList / SwipeToDismiss ========== -->
      <section id="transfer-swipe" class="gallery__section">
        <h2 class="gallery__section-title">TransferList / SwipeToDismiss</h2>
        <p class="gallery__section-note">
          穿梭框把 items 当全集、modelValue 当子集，两侧都是派生结果，怎么移动都不会重复或丢失。
          滑动删除松手后只停在「已滑走」状态，真正删除由使用方决定 —— 手势组件自己删数据最难改。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 24px">
          <M3TransferList v-model="transferValues" :items="transferItems" filterable />
          <div>
            <p class="gallery__label">向左滑 / 向右滑</p>
            <M3SwipeToDismiss v-model="swipeState" @dismiss="(dir) => showSnack('滑走了：' + dir)">
              <M3List>
                <M3ListItem headline="项目周报.docx" supporting="向左滑归档，向右滑标记完成" :leading-icon="IcoTask" />
              </M3List>
            </M3SwipeToDismiss>
            <p class="gallery__hint">当前状态：{{ swipeState }} · <M3Button variant="text" size="sm" @click="swipeState = 'settled'">复位</M3Button></p>
          </div>
        </div>
      </section>

      <!-- ========== Data views ========== -->
      <section id="data-views" class="gallery__section">
        <h2 class="gallery__section-title">JSON / Diff / 树表 / 虚拟表</h2>
        <p class="gallery__section-note">
          JSON 查看器用真实 <code>ul/li</code> 结构，读屏能数出层级；Diff 用 LCS 只标真正的增删
          （逐行比较会在中间插一行时把后面全标成改动）；虚拟表只渲染可视区附近的行，一万行也能秒开。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))">
            <M3JsonViewer :value="jsonSample" root-label="package.json" :default-expand-depth="2" />
            <M3DiffViewer :before="diffBefore" :after="diffAfter" />
          </div>
          <M3TreeTable :columns="treeTableColumns" :rows="treeTableRows" caption="树形表格：点第一列展开" />
          <M3VirtualTable :columns="virtualColumns" :rows="virtualRows" :height="260" />
        </div>
      </section>

      <!-- ========== Navigation extra ========== -->
      <section id="navigation-extra" class="gallery__section">
        <h2 class="gallery__section-title">抽屉 / 底部栏 / 短导航 / 顶栏搜索</h2>
        <p class="gallery__section-note">
          NavigationDrawer 两种用法（常驻侧栏 / 模态抽屉）共用一套样式；模态版本复用 useModal 的滚动锁与焦点陷阱。
          NavigationSuite 按 MD3 窗口尺寸类自动在底部导航与侧边栏之间切换。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="drawerOpen = true">打开抽屉</M3Button>
            <span class="gallery__hint" style="margin: 0">当前目的地：{{ drawerValue }}</span>
          </div>

          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
            <div>
              <p class="gallery__label">底部应用栏</p>
              <M3BottomAppBar>
                <M3IconButton :icon="IcoEdit" label="编辑" variant="standard" />
                <M3IconButton :icon="IcoShare" label="分享" variant="standard" />
                <M3IconButton :icon="IcoDelete" label="删除" variant="standard" />
                <template #fab>
                  <M3Fab :icon="IcoAdd" label="新建" size="sm" @click="bottomFabCount++" />
                </template>
              </M3BottomAppBar>
              <p class="gallery__hint">FAB 点了 {{ bottomFabCount }} 次</p>
            </div>

            <div>
              <p class="gallery__label">短导航</p>
              <M3ShortNavigationBar v-model="shortNavValue" :items="shortNavItems" />
              <p class="gallery__hint">当前：{{ shortNavValue }}</p>
            </div>
          </div>

          <div>
            <p class="gallery__label">顶栏内联搜索</p>
            <M3AppBarWithSearch v-model="appBarQuery" v-model:open="appBarOpen" title="组件库" subtitle="点右侧放大镜展开" @search="showSnack('搜索：' + $event)" />
          </div>

          <div>
            <p class="gallery__label">响应式导航（拖窗口宽度看切换）</p>
            <M3NavigationSuite v-model="suiteValue" :items="suiteItems" />
            <p class="gallery__hint">当前：{{ suiteValue }}</p>
          </div>
        </div>
      </section>

      <!-- ========== Media ========== -->
      <section id="media" class="gallery__section">
        <h2 class="gallery__section-title">媒体组件</h2>
        <p class="gallery__section-note">
          轮播用原生横向滚动 + scroll-snap（触摸惯性与回弹是浏览器给的）；灯箱缩放用 transform，
          拖动只在放大后接管；签名板按 devicePixelRatio 放大绘制缓冲，高分屏上才是实线。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))">
            <div>
              <p class="gallery__label">简单轮播（自动播放，悬停暂停）</p>
              <M3SimpleCarousel v-model="carouselIndex" :slides="carouselSlides" />
            </div>
            <div>
              <p class="gallery__label">多图轮播（滚动吸附）</p>
              <M3Carousel :per-view="2" :min-slide-width="180">
                <img v-for="slide in carouselSlides" :key="slide.src" :src="slide.src" :alt="slide.alt" style="width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px" />
              </M3Carousel>
            </div>
          </div>

          <div class="gallery__row">
            <M3Button variant="tonal" @click="lightboxOpen = true; lightboxIndex = 0">打开灯箱</M3Button>
            <span class="gallery__hint" style="margin: 0">← → 切换，+ / − 缩放，0 复位，Esc 关闭。</span>
          </div>

          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))">
            <div>
              <p class="gallery__label">签名板</p>
              <M3SignaturePad v-model="signatureValue" :height="180" />
              <p class="gallery__hint">输出 {{ signatureValue ? signatureValue.slice(0, 32) + '…' : '空' }}</p>
            </div>
            <div>
              <p class="gallery__label">图片裁剪</p>
              <M3ImageCropper v-model="cropResult" :src="cropSource" :output-size="240" />
              <img v-if="cropResult" :src="cropResult" alt="裁剪结果" style="width: 120px; border-radius: 8px; margin-block-start: 8px" />
            </div>
          </div>

          <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))">
            <div>
              <p class="gallery__label">音频播放器</p>
              <M3AudioPlayer :src="audioSrc" title="示例音频" subtitle="传入 src 即可播放" />
            </div>
            <div>
              <p class="gallery__label">视频播放器</p>
              <M3VideoPlayer :src="videoSrc" title="示例视频" />
            </div>
          </div>

          <div>
            <p class="gallery__label">摄像头拍照</p>
            <M3CameraCapture v-model="signatureValue" :height="240" :width="320" @error="showSnack('摄像头：' + $event)" />
          </div>
        </div>
      </section>

      <!-- ========== Layout extra ========== -->
      <section id="layout-extra" class="gallery__section">
        <h2 class="gallery__section-title">分栏 / 瀑布流 / 仪表盘 / 下拉刷新</h2>
        <p class="gallery__section-note">
          分栏的分隔条是 <code>role="separator"</code>，方向键每次调 2%（Shift 10%）、双击回到 50%；
          仪表盘拖拽用原生 HTML5 DnD，并额外提供「前移 / 后移」按钮给键盘用户。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div style="height: 180px">
            <M3Splitter v-model="splitterSize" storage-key="gallery">
              <template #start>
                <div style="padding: 12px">左栏 {{ Math.round(splitterSize) }}%</div>
              </template>
              <template #end>
                <div style="padding: 12px">右栏，拖动中间分隔条</div>
              </template>
            </M3Splitter>
          </div>

          <div>
            <p class="gallery__label">瀑布流</p>
            <M3Masonry :columns="3" :gap="12">
              <div v-for="index in 6" :key="index" :style="{ height: 60 + ((index * 23) % 80) + 'px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '12px', display: 'grid', placeItems: 'center' }">
                卡片 {{ index }}
              </div>
            </M3Masonry>
          </div>

          <div>
            <p class="gallery__label">仪表盘（可拖拽排序）</p>
            <M3DashboardGrid v-model="dashboardOrder" :items="dashboardItems" :columns="4" :row-height="110">
              <template #item="{ item }">
                <div style="display: grid; place-items: center; height: 100%; font-size: 20px">{{ item.title }}</div>
              </template>
            </M3DashboardGrid>
          </div>

          <div>
            <p class="gallery__label">下拉刷新（在框内下拉）</p>
            <M3PullToRefresh :loading="refreshLoading" height="160px" @refresh="onRefresh">
              <div style="padding: 16px">
                <p style="margin: 0 0 8px; font-size: 13px">在框内从上往下拖，松手后触发一次模拟刷新。</p>
                <M3List>
                  <M3ListItem headline="条目 1" supporting="下拉试试" />
                  <M3ListItem headline="条目 2" supporting="加载 0.9 秒" />
                </M3List>
              </div>
            </M3PullToRefresh>
          </div>
        </div>
      </section>

      <!-- ========== Notifications ========== -->
      <section id="notifications" class="gallery__section">
        <h2 class="gallery__section-title">通知中心</h2>
        <p class="gallery__section-note">
          与 Snackbar 的分工：Snackbar 是「操作结果」，一次一条、几秒就走；通知是「需要知道的异步事件」，
          带标题正文和跳转动作，也能同时堆几条。中心里按天分组、未读用色点标记，不会自动消失。
        </p>
        <div class="gallery__surface" style="display: grid; gap: 20px">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="notifyDemo('info')">信息</M3Button>
            <M3Button variant="tonal" @click="notifyDemo('success')">成功</M3Button>
            <M3Button variant="tonal" @click="notifyDemo('warning')">警告</M3Button>
            <M3Button variant="tonal" @click="notifyDemo('error')">错误</M3Button>
            <M3Button variant="text" @click="clearNotifications">清空</M3Button>
          </div>

          <M3NotificationCenter v-model="inbox" @open="showSnack('打开：' + $event.title)" />
        </div>
      </section>

    </main>

    <M3SnackbarHost />
    <M3NotificationHost />
    <M3CommandPalette
      v-model="jumpOpen"
      :items="jumpCommands"
      :enable-hotkey="false"
      placeholder="跳转到组件…"
      empty-text="没有匹配的组件"
    />
    <button v-if="showBackToTop" type="button" class="gallery__to-top" aria-label="回到顶部" @click="scrollTop">
      ↑
    </button>
    <M3Lightbox v-model="lightboxOpen" v-model:index="lightboxIndex" :images="lightboxImages" />
    <M3Tour v-model="tourOpen" v-model:step="tourStep" :steps="tourSteps" @finish="showSnack('引导结束')" />
    <M3NavigationDrawer v-model="drawerValue" v-model:open="drawerOpen" :items="drawerItems" title="导航" subtitle="收件箱 · 3 条未读" />
    <M3PageProgress />
    <M3CommandPalette v-model="paletteOpen" :items="commands" />
    <M3LoadingOverlay :visible="overlayFull" fullscreen text="正在准备构建…" />
  </div>
</template>
