# @clderystd/m3-ui

[![npm](https://img.shields.io/npm/v/@clderystd/m3-ui.svg)](https://www.npmjs.com/package/@clderystd/m3-ui)
[![license](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/vue-%5E3.5-42b883.svg)](https://vuejs.org)

云术工作室的 Material Design 3 组件库。**105 个 M3 组件 + 24 个组合式函数** + 结构令牌 +
主题配色（useTheme），不依赖任何第三方 UI 组件库。

- **纯 ESM**：`import` 直接用，`require()` 不支持（Vue 3 + Vite 场景）。
- **配色由使用方注入**：包里只有结构令牌，`--md-sys-color-*` 由站点生成。
- **零运行时依赖**：`vue` 是唯一的 peer，其余全部自实现（含撒花 / 礼花 / 差异 / 打印）。

## Gallery（先看效果）

```bash
pnpm dev     # http://localhost:5180
```

所有组件都跑在 `src/` 源码上，改完立刻在浏览器里看到效果，**不必先 build 再 install**。
每节演示都写了「这个动效为什么这么做」，而不是只摆样子。

Gallery 是开发期的东西，不进发布产物（`dist/` 里没有它）。

## 关键约定

**配色由使用方注入。** 本包只带结构令牌（形状 / 字阶 / 海拔 / 动效 / 状态层），
全部颜色走 `--md-sys-color-*` 这类语义变量。每个站点用自己的种子色生成配色表：

```css
/* 使用方自己的 m3-color-tokens.css */
:root { --md-sys-color-primary: #0061a4; /* ... */ }
.dark { --md-sys-color-primary: #9ecaff; /* ... */ }
```

这样官方站的蓝色、scforge 的橙色可以共存，而组件代码只有一份。

**图标不绑定图标库。** `IconComponent` 就是 Vue 的 `Component`，
unplugin-icons 生成的、手写 SFC、其他图标库的都能传。包里只内联了自己要用的图标
（勾、关闭、展开、星级、箭头等，见文末），其余图标一律从外面传。

## 使用

```bash
pnpm add @clderystd/m3-ui --registry=https://registry.npmjs.org
```

```ts
import { M3Button, M3Card, M3Dialog } from '@clderystd/m3-ui'
import '@clderystd/m3-ui/style.css'   // 结构令牌 + 组件样式（不含配色）
```

`style.css` 要在**站点自己的配色之前**引入，方便站点覆盖。

### 在 outlined 输入框里放表面

outlined TextField / Select 的浮动标签要在描边上切一个缺口，缺口底色默认取
`--md-sys-color-surface`。如果输入框放在更亮/更暗的容器里，覆盖一个变量即可：

```css
.my-card {
  --md-field-label-surface: var(--md-sys-color-surface-container-low);
}
```

## 组件

| 分组 | 组件 |
| --- | --- |
| 基础控件 | M3Button、M3IconButton、M3Icon、M3ToggleButton、M3SplitButton、M3Chip、M3Checkbox、M3RadioGroup、M3Switch、M3Slider、M3Rating、M3Progress |
| 表单 | M3TextField、M3NumberField、M3PinInput、M3PasswordMeter、M3MaskField、M3PhoneInput、M3CountrySelect、M3TimezoneSelect、M3TagInput、M3Autocomplete、M3MultiSelect、M3FileUpload、M3Select、M3SearchBar |
| 日期时间 | M3Calendar、M3DatePicker、M3TimePicker、M3DateRangePicker、M3AvailabilityCalendar、M3CalendarHeatmap、M3Countdown |
| 容器与布局 | M3Card、M3Divider、M3List、M3ListGroup、M3ListSubheader、M3ListItem、M3TopAppBar、M3AppBarWithSearch、M3BottomAppBar、M3ShortNavigationBar、M3Sheet、M3Menu、M3MenuItem、M3Fab、M3Avatar、M3Badge、M3ExpansionPanel、M3Tabs、M3Splitter、M3Masonry、M3DashboardGrid、M3ContainerTransform |
| 导航 | M3NavigationBar、M3NavigationRail、M3NavigationSuite、M3NavigationDrawer、M3Breadcrumbs、M3Stepper、M3Pagination、M3PageProgress |
| 数据展示 | M3Table、M3VirtualTable、M3TreeTable、M3Tree、M3DiffViewer、M3JsonViewer、M3Timeline、M3InfiniteScroll、M3TransferList、M3SwipeToDismiss、M3FilterBuilder、M3StatCard、M3Sparkline、M3AnimatedNumber、M3RelativeTime、M3Kbd、M3CopyButton、M3Hotkeys |
| 浮层 | M3Dialog、M3ConfirmDialog、M3SnackbarHost、M3NotificationHost、M3NotificationCenter、M3CommandPalette、M3ContextMenu、M3Tour、M3LoadingOverlay |
| 媒体 | M3Carousel、M3SimpleCarousel、M3Lightbox、M3VideoPlayer、M3AudioPlayer、M3CameraCapture、M3ImageCropper、M3SignaturePad |
| 状态与反馈 | M3Alert、M3EmptyState、M3Skeleton |
| 主题 | M3ThemePicker（配 useTheme / THEME_PRESETS / useScrollLock） |

另导出 `vRipple`、`vReveal`、`useModal`、`useSnackbar`、`useNotifications`、`usePageProgress`、
`useTheme` / `THEME_PRESETS`、`useAnchoredPanel`、`lockScroll` / `unlockScroll`，
以及 `utils/filter`（`filterRows` / `matchesFilter` / 运算符表）、`utils/date`（本地日期串与时间格式化）、
`utils/countries`（国家与拨号代码）、`utils/diff`（逐行 LCS）、`utils/print`（打印某个元素），和内置图标
`IconCheck`、`IconClose`、`IconExpandMore`、`IconError`、`IconWarning`、
`IconInfo`、`IconCheckCircle`、`IconVisibility`、`IconVisibilityOff`、
`IconSearch`、`IconChevronLeft`、`IconChevronRight`、`IconRemove`、
`IconStar`、`IconStarFilled`、`IconStarHalf`、`IconContentCopy`、
`IconArrowUpward`、`IconArrowDownward`、`IconArrowDropDown`、`IconAdd`、
`IconUpload`、`IconDescription`、`IconTrendingUp`、
`IconTrendingDown`、`IconTrendingFlat`、`IconMoreHoriz`、
`IconFirstPage`、`IconLastPage`。

### 0.5.0 新增

- 表单：Checkbox（含 indeterminate）、RadioGroup（原生 radio 键盘语义）、
  Slider（原生 range + 自绘轨道）、Rating（半星 / 只读）、Progress（线性 / 圆形，确定 / 不确定）。
- 导航：Tabs（双弹簧指示条、自动激活、可滚动）、NavigationBar、NavigationRail、
  Breadcrumbs（溢出折叠菜单）、Stepper（线性 / 纵向 / 错误步骤）。
- 数据：Table（受控排序、粘性表头、加载态、单元格插槽）、Timeline、StatCard、
  Sparkline、AnimatedNumber、RelativeTime。
- 基础：Badge、SearchBar、ExpansionPanel（`grid-template-rows` 高度动画）、Kbd、CopyButton。
- 既有组件：Button 的 `danger`；IconButton 的 `toggleable` / `loading`；
  TextField 的 outlined / 多行 / 计数 / 前置图标；Select 的 outlined；
  Chip 的 input chip 结构修正（不再 button 套 button）；Menu 的键盘导航与勾选项；
  ListItem 的 overline 与 padded 修复；Dialog 的尺寸；Sheet 的 handle 与 dismissible；
  Snackbar 的 action 与悬停暂停；Pagination 的首尾页 + 省略号；Skeleton 的四种版式；
  Alert 的 neutral 与 actions；Avatar 的状态点 / 方形 / 可访问名称。

### A / B 批次：43 个新组件

按「表单 → 日期时间 → 浮层 → 导航 → 媒体 → 数据 → 布局 → 通知」分批补齐，全部零第三方依赖。

| 领域 | 组件 | 关键取舍 |
| --- | --- | --- |
| 表单 | Autocomplete、MultiSelect、TagInput、MaskField、PhoneInput、CountrySelect、TimezoneSelect | 统一复用 `_M3Field` 外壳（浮动标签 / 指示线只维护一份）；电话对外只用 E.164；掩码光标固定末尾（跟随重排在输入法下极脆） |
| 日期时间 | Calendar、DatePicker、TimePicker、DateRangePicker、AvailabilityCalendar、CalendarHeatmap | 日期一律本地串 `YYYY-MM-DD`；桌面 docked / 移动端 modal；固定 6×7 格，翻月不跳 |
| 浮层 | ContextMenu、Tour、NotificationHost、NotificationCenter | 右键菜单复用 M3Menu 面板与键盘；Tour 用 100vmax 阴影同时"照亮+压暗"；通知与 Snackbar 分工（异步事件 vs 操作结果） |
| 导航 | NavigationDrawer、NavigationSuite、BottomAppBar、AppBarWithSearch、ShortNavigationBar | Drawer 常驻/模态共用样式；Suite 用 matchMedia 只在跨断点时重排 |
| 数据 | VirtualTable、TreeTable、JsonViewer、DiffViewer、TransferList、SwipeToDismiss、FilterBuilder、Hotkeys | 虚拟表只渲染可视区；Diff 用 LCS 并带大文件降级；筛选树是纯 JSON，空规则不参与 |
| 媒体 | Carousel、SimpleCarousel、Lightbox、VideoPlayer、AudioPlayer、CameraCapture、ImageCropper、SignaturePad | 轮播用原生 scroll-snap；灯箱放大后才接管拖动；摄像头默认不自动申请权限 |
| 布局 | Splitter、Masonry、DashboardGrid、PullToRefresh、ContainerTransform | 分栏有 `role="separator"` + 键盘调节；仪表盘 DnD 之外补「前移/后移」按钮 |

本批的已知简化（README 明示，避免误用）：ImageCropper 只支持正方形输出与缩放/拖拽（无旋转、无自由比例）；
Masonry 用 CSS 多列（顺序先填满整列，不适合必须按行的时间线）；ContainerTransform 是 FLIP 缩放，
不是真正的共享元素路由转场。

### 组合式函数（Composables）

从 m3ui-vue 移植并统一实现的一套通用逻辑。**组件自己先用起来**，不是只导出的「额外 API」：

| 组合式函数 | 作用 | 谁在用 |
| --- | --- | --- |
| `useWindowSizeClass` | M3 窗口尺寸类（compact / medium / expanded / large / extra-large + 高度类），可按窗口或元素 | `M3NavigationSuite`、Gallery |
| `useMediaQuery` | 响应式媒体查询（只在跨界时触发，不随 resize 连续触发） | `useDevice`、`M3NavigationSuite` |
| `useDevice` | 指针精度 / 悬停 / 触摸 / 减少动效 / DPR | 全局 |
| `useEscapeStack` | Esc 的**栈式**分发：后打开的在栈顶，一次只关一层 | `useModal`、Menu / ContextMenu / 三种日期时间选择器 / Autocomplete / MultiSelect |
| `useClickOutside` / `useClickOutsideWhen` | 点击外部（捕获阶段、pointerdown），可只在浮层打开时监听 | 同上 |
| `useEventListener` | 任意 EventTarget 的监听 + 自动清理，支持 getter 目标 | 上面两者与 `M3Menu` |
| `useLocalStorage` | 持久化响应式值（隐私模式兜底、跨标签页同步、validate 兜底） | `M3Splitter` 记忆、Gallery 折叠状态 |
| `useDebounce` / `useThrottle` / `useDebouncedRef` | 防抖与节流（带尾部调用与 cancel） | 搜索类组件、Gallery |
| `useIntersectionObserver` / `useResizeObserver` | 观察器包装，支持 `once` 与 getter 目标 | Gallery 哨兵、自适应组件 |
| `useSpring` | 弹簧积分（M3 四组标准方案），减少动效时直接落位 | `M3ToggleButton` 的形状变化 |
| `useAutoGrow` | textarea 随内容增高（行高从计算样式读，宽度变化重新折行） | 可直接用于多行输入 |
| `useThemeTransition` | 换主题时在 `<html>` 上过渡一次注册过的颜色 token（不支持 `@property` 时直接切） | `useTheme` 的 setMode / setSeed / reset |
| `useScrollReveal` | 滚动进场（fade-up / fade / scale / slide，可 stagger、可重复触发） | 与 `v-reveal` 共用同一份 `.md-reveal` 样式 |
| `useConfetti` | 撒花：Path2D 纸片 + 重力/阻尼/翻转，支持一次性爆发或持续礼花雨 | 共享效果画布 |
| `useFireworks` | 礼花：火箭升空炸开 + 火星受重力拖尾 | 共享效果画布 |
| `useReactions` | 飘表情 / 飘短文本（Web Animation，合成器线程） | 独立 DOM 层，用完即摘 |

三者共用 `utils/effects` 的一张全屏 canvas（DPR 自适应、无人使用立刻移除），不吃三份显存；
减少动态效果时撒花与礼花**直接不播放**（纯装饰），滚动进场只缩短行程（它承载「新内容出现」的信息）。
撒花纸片用基本几何现画，不引入 `shape-morph`。

### 主题与配色

配色不再只有「使用方手写一份 token」这一条路：`useTheme()` 能把一颗种子色现算成整套
49 个 color role（OKLCH 推导，不依赖第三方色彩库），写进一个 `<style>`，只覆盖
`--md-sys-color-*`；形状、字阶、动效仍然来自结构令牌，换主题不会连比例一起换。

```ts
import { useTheme } from '@clderystd/m3-ui'

const theme = useTheme()
theme.setMode('dark')      // 'light' | 'dark' | 'system'
theme.setSeed('#2e7d32')   // 任意颜色 → 一整套协调的色阶
theme.reset()
```

`<M3ThemePicker />` 是现成 UI（外观分段 + 色板 + 系统取色器）。它改的是模块单例，
顶栏开关、设置页、命令面板里的「切换主题」操作的是同一份状态；外观与种子色存在
localStorage 里，Gallery 首屏由 `index.html` 的内联脚本直接注入 token，不会先闪一下默认蓝。

为什么自己算而不是内置几套死配色：换一颗种子色应该得到协调的 primary / secondary /
tertiary / neutral，而不是让设计从 49 个变量里挑。彩度按角色分配 —— 中性表面几乎无彩
（否则整页「泛色」），强调色保住饱和度；OKLCH 保证不同色相在同一 tone 上明度一致。

### 本轮修复与调整

| # | 问题 | 处理 |
| --- | --- | --- |
| 1 | 鼠标停在 Table 上滚不动页面 | `overscroll-behavior: contain` 改 `overscroll-behavior-x` —— 没有纵向溢出的容器不该拦住滚动链 |
| 2 | 底部 / 侧边导航的指示条只垫在图标下 | 指示条改为覆盖「图标 + 文字」整块，选中态是一枚完整胶囊，文字用 on-secondary-container |
| 3 | SearchBar 建议项右侧的 Enter 键帽太抢眼 | 删掉（搜索栏下方已经写过一次，重复提示是噪音） |
| 4 | 横向 Card 的「查看」被挤成整条横杠 | 横向卡片改用 grid：媒体在左跨两行，正文与操作区排在右列 |
| 5 | ExpansionPanel 头部悬停后贴着正文 | 正文上内边距 12dp |
| 6 | Tree 可勾选时 hover 整行却只有方框可点 | 可勾选模式下整行即勾选区 |
| 7 | 打开 Dialog / Sheet 后页面右侧跳一下 | 滚动锁用 padding-right 补偿消失的滚动条（`useScrollLock`，引用计数） |
| 8 | Snackbar 一次只能显示一条 | 改为队列堆叠，最多 3 条，最新的贴近底边；同文案重复触发只重置倒计时 |
| 9 | 全屏遮罩时背景仍能滚动 | 全屏 LoadingOverlay 显式锁滚动 |
| 10 | 没有选配色的 UI | 新增 M3ThemePicker + useTheme（见上） |

### 新增：移植自 m3ui-vue 的 14 个组件

上游 [m3ui-vue](https://github.com/SrWither/m3ui-vue) 是 Tailwind v4 + Material Symbols 字符串图标
的 MIT 组件库；本包只认 CSS 变量令牌和 `IconComponent`。所以这次不是「拷文件」，而是把 14 个组件
按本项目的令牌与约定重写：

| 移植组件 | 上游来源 | 贴合本项目时改了什么 |
| --- | --- | --- |
| M3ToggleButton | MToggleButton | Tailwind 类 → 令牌 CSS；`icon: string` → `IconComponent`；弹簧保留，减少动态效果时直接归位 |
| M3SplitButton | MSplitButton | 自写弹层 → 复用 M3Menu / M3MenuItem（键盘与定位只维护一份） |
| M3NumberField | MNumberField | 与 M3TextField 共用浮动标签 / 指示线结构；输入保留草稿，不在半截时格式化 |
| M3PinInput | MPinInput | 换成 filled/outlined 两套本项目的字段外观；补读屏文案与禁用态 |
| M3PasswordMeter | MPasswordMeter | 上游的 `success` 角色本项目没有，最高两档改走 primary，用「点亮段数」区分 |
| M3FileUpload | MFileUpload | 进度条/环形指示器改用 M3Progress；文案可覆盖，默认中文 |
| M3Tree | MTree / _MTreeNode | 补键盘导航（↑↓ ←→ Home End 空格）与 roving tabindex；展开高度改用 grid-rows |
| M3ListGroup / M3ListSubheader | MListGroup / MListSubheader | 去掉 Tailwind 的 `layer components` 与分段列表耦合，只保留语义分组 |
| M3CommandPalette | MCommandPalette | 浮层行为换成 useModal（锁滚动 / Esc / 焦点陷阱），不再自带一套 |
| M3Countdown | MCountdown | 数字滚动改用 M3AnimatedNumber（新增 `pad` 属性），计时仍按整秒边界对齐 |
| M3InfiniteScroll | MInfiniteScroll | 加载指示器改用 M3Progress；loading/ended 时断开观察 |
| M3PageProgress | MPageProgress | 去掉 vue-router 自动探测（组件库不该猜路由），只导出 usePageProgress |
| M3LoadingOverlay | MLoadingOverlay | 指示器改用 M3Progress；减少动态效果时关闭背景模糊 |

没有移植的部分：依赖第三方库的（Chart.js / CodeMirror / maplibre / pdfjs / xterm / tiptap）、
以及 MapLibre 系列、Gantt、Flow、SeatMap 这类与本项目定位无关的领域组件。

## 动效

组件的「手感」由三件事决定，全部走 `--md-sys-motion-*` 令牌：

- **按压反馈** —— 触摸屏没有 hover，按下缩放是唯一能立刻确认「点到了」的信号。
  Button/IconButton/Fab/Chip/Card 用 0.97 ~ 0.92，列表项与菜单项不做整行缩放（会带着文字抖）。
- **状态切换** —— 勾选、展开、指示线这类离散变化用 `emphasized` 缓动，
  先快后慢地收尾，而不是线性平移。Tabs 的指示条更进一步：位移和宽度是两条独立弹簧，
  快速连续切换时速度会带着走。
- **内容入场** —— 容器加 `.md-stagger`，子元素依次出现（最多 12 个），比整块淡入更像在加载。

`prefers-reduced-motion: reduce` 下**削减而不是删除**：缩放降到 0.99（完全归零会让触摸屏毫无反馈），
扫光与错开入场停掉，位移归零但淡入淡出保留；Progress 的不确定动画只放慢，不停下
（停下等于告诉用户「卡住了」）。

## 无障碍

- 所有浮层（Dialog / Sheet / Select 面板 / Menu）都有焦点管理与 Esc 关闭；
  Dialog / Sheet 还会锁滚动并把焦点还给触发元素。
- Menu 打开后焦点进入第一项，↑↓ / Home / End 移动，Tab 收起菜单。
- Tabs / RadioGroup / Checkbox / Rating 使用原生控件语义（role / aria-checked / aria-current），
  不自己发明状态。
- 关闭的 ExpansionPanel 与折叠的子树内容用 `inert` 移出 Tab 序，而不是只藏起来。
- 树形列表整棵树只占一个 Tab 停靠点（roving tabindex），进入后 ↑↓ / ←→ / Home / End 移动，
  空格勾选、回车选中；菜单与命令面板同样不用 Tab 逐项走。
- 命令面板本质是对话框：`aria-modal` + combobox/listbox，焦点落在搜索框，
  Esc 关闭并把焦点还给触发元素。
- 打开浮层时锁滚动用 `padding-right` 补掉消失的滚动条，页面不会横向跳一下；
  多个浮层叠加时按引用计数，先关哪一个都不会把滚动条提前还回来。
- Snackbar 支持堆叠（最多 3 条），每条各自独立计时；鼠标停留或焦点进入只暂停那一条。
- 读屏文案默认中文（关闭、上一页、必填等），需要的站点可以按自己的语言覆盖。

## 本地联调

站点用 `file:../m3-ui` 引用本包。**注意 pnpm 的 `file:` 是复制语义，不是软链**：
改了组件源码后必须

```bash
pnpm build                          # 在 m3-ui 里重新构建
cd ../identity-ui && pnpm install   # 让站点拿到新副本
```

只跑 `pnpm build` 而不 `pnpm install`，站点侧仍指向旧的 `dist` 副本
（实测两份 `m3-ui.css` 时间戳会差几分钟，改了也不生效）。

正式接入时应改用发布后的版本号（`@clderystd/m3-ui@^0.5.0`），
那时升级用 `pnpm update`，行为符合预期。

## 开发

```bash
pnpm build       # 产出 dist/index.js + dist/m3-ui.css + dist/*.d.ts
pnpm typecheck
```

构建细节：

- `vue` 是 peerDependency，不打进产物；
- 类型由 `vite-plugin-dts` 生成后用 `scripts/flatten-dts.mjs` 摊平到 `dist/` 根
  （**不要**开 `rollupTypes`，它会把 `.vue` 的类型全丢掉，产出空的 `index.d.ts`）；
- CSS 独立成 `dist/m3-ui.css`，不在 JS 里自动注入。

## 发布

发布到 npm 公共 registry（registry.npmjs.org），包作用域是 `@clderystd`，
`publishConfig.access` 已设为 `public`。

```bash
npm login                       # 登录 npmjs（npm whoami 确认身份）
npm run build                   # ESM + CSS + 摊平后的 .d.ts，三者缺一不可
npm pack --dry-run              # 看一眼 tarball 里到底有什么
npm publish                     # prepublishOnly 会再构建一次，然后发布
```

发布物只有 `dist/`（外加 npm 自动带上的 README / LICENSE / package.json），
Gallery 与源码不进包。`exports` 只暴露三个入口：

| 入口 | 路径 |
| --- | --- |
| `@clderystd/m3-ui` | `dist/index.js` + `dist/index.d.ts` |
| `@clderystd/m3-ui/style.css` | `dist/m3-ui.css`（结构令牌 + 组件样式，**不含配色**） |
| `@clderystd/m3-ui/package.json` | 供工具读取版本号 |

发布后验证：

```bash
npm view @clderystd/m3-ui version dist-tags --json
npm pack @clderystd/m3-ui@0.5.0 --dry-run   # 确认 tarball 内容
```

> 纯 ESM 包：`exports` 只有 `import` 条件，`require()` 会失败。这是有意的 ——
> 同时产出 CJS 需要再跑一遍构建，而 Vue 3 + Vite 生态里没有这个需求。

## 许可证

本项目采用 **GNU Affero General Public License v3.0（AGPL-3.0）** 授权，完整许可证文本见仓库根目录的 [LICENSE](LICENSE)。

AGPL-3.0 是强 copyleft 协议：可以自由使用、修改和分发本项目，但若将修改后的版本作为网络服务对外提供，必须以相同协议开放其源代码。
