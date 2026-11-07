<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import IcoDark from '~icons/material-symbols/dark-mode'
import IcoLight from '~icons/material-symbols/light-mode'
import IcoAdd from '~icons/material-symbols/add'
import IcoEdit from '~icons/material-symbols/edit'
import IcoDelete from '~icons/material-symbols/delete'
import IcoSearch from '~icons/material-symbols/search'
import IcoShare from '~icons/material-symbols/share'
import IcoFavorite from '~icons/material-symbols/favorite'
import IcoPerson from '~icons/material-symbols/person'
import IcoSettings from '~icons/material-symbols/settings'
import IcoHome from '~icons/material-symbols/home'
import IcoCloud from '~icons/material-symbols/cloud'
import IcoCheck from '~icons/material-symbols/check'

import {
  M3Alert,
  M3Avatar,
  M3Button,
  M3Card,
  M3Chip,
  M3ConfirmDialog,
  M3Dialog,
  M3EmptyState,
  M3Fab,
  M3IconButton,
  M3List,
  M3ListItem,
  M3Menu,
  M3MenuItem,
  M3Pagination,
  M3SegmentedButton,
  M3Select,
  M3Sheet,
  M3Skeleton,
  M3SnackbarHost,
  M3Switch,
  M3TextField,
  M3Tooltip,
  useSnackbar,
  type SelectOption,
} from '../src'

/* ---------- 主题 ---------- */
const dark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('m3-gallery-theme', dark.value ? 'dark' : 'light')
}

/* ---------- 导航 ---------- */
interface Section {
  id: string
  label: string
  group: string
}

const sections: Section[] = [
  { id: 'motion', label: '动效总览', group: '基础' },
  { id: 'button', label: 'Button 按钮', group: '基础' },
  { id: 'icon-button', label: 'IconButton 图标按钮', group: '基础' },
  { id: 'fab', label: 'Fab 浮动操作', group: '基础' },
  { id: 'chip', label: 'Chip 标签', group: '基础' },
  { id: 'switch', label: 'Switch 开关', group: '基础' },
  { id: 'segmented', label: 'SegmentedButton 分段', group: '基础' },
  { id: 'text-field', label: 'TextField 输入框', group: '表单' },
  { id: 'select', label: 'Select 下拉', group: '表单' },
  { id: 'card', label: 'Card 卡片', group: '容器' },
  { id: 'list', label: 'List 列表', group: '容器' },
  { id: 'avatar', label: 'Avatar 头像', group: '容器' },
  { id: 'dialog', label: 'Dialog / Confirm', group: '浮层' },
  { id: 'sheet', label: 'Sheet 面板', group: '浮层' },
  { id: 'menu', label: 'Menu 菜单', group: '浮层' },
  { id: 'snackbar', label: 'Snackbar 提示条', group: '浮层' },
  { id: 'tooltip', label: 'Tooltip 气泡', group: '浮层' },
  { id: 'alert', label: 'Alert 行内提示', group: '状态' },
  { id: 'empty', label: 'EmptyState 空状态', group: '状态' },
  { id: 'skeleton', label: 'Skeleton 骨架屏', group: '状态' },
  { id: 'pagination', label: 'Pagination 分页', group: '状态' },
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
    // 顶部留出 header 的高度，否则「刚滚出屏幕的那节」会一直赢
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )

  for (const item of sections) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }

  onBeforeUnmount(() => observer.disconnect())
})

/* ---------- 各演示的可变状态 ---------- */
/*
 * 模板里只调函数、不直接暴露 composable 对象：
 * useSnackbar() 返回里带一个 ref（current），Vue 的模板解包遇到带 ref 的普通对象
 * 会把它当「可能是 ref」处理，类型上就报 .show 不存在。包一层纯函数最稳。
 */
const snackbar = useSnackbar()
const showSnack = (text: string, title?: string) => snackbar.show(text, title ? { title } : {})
const showSuccess = (text: string) => snackbar.success(text)
const showWarning = (text: string, title: string) => snackbar.warning(text, title)
const showError = (text: string) => snackbar.error(text)

const pressCount = ref(0)
const loading = ref(false)
const chipOn = ref(true)
const chips = ref<string[]>(['置顶', '精华'])
const switchA = ref(true)
const switchB = ref(false)
const segment = ref('list')
const name = ref('')
const email = ref('')
const password = ref('')
const search = ref('')
const planet = ref('earth')
const dialogOpen = ref(false)
const sheetOpen = ref(false)
const page = ref(3)
const confirmRef = ref<InstanceType<typeof M3ConfirmDialog> | null>(null)

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

function toggleChip(tag: string) {
  chips.value = chips.value.includes(tag)
    ? chips.value.filter((item) => item !== tag)
    : [...chips.value, tag]
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
</script>

<template>
  <div class="gallery">
    <nav class="gallery__nav" aria-label="组件导航">
      <div class="gallery__brand">
        <span class="gallery__brand-mark">M3</span>
        <span class="gallery__brand-text">
          <span class="gallery__brand-title">云术组件库</span>
          <span class="gallery__brand-sub">Gallery</span>
        </span>
      </div>

      <template v-for="[group, items] in groups" :key="group">
        <p class="gallery__group-label">{{ group }}</p>
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="gallery__link"
          :class="{ 'is-active': active === item.id }"
          @click="scrollTo(item.id)"
        >
          {{ item.label }}
        </button>
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

      <!-- ========== Button ========== -->
      <section id="button" class="gallery__section">
        <h2 class="gallery__section-title">Button 按钮</h2>
        <p class="gallery__section-note">
          五种强调级别。按下时整体缩到 0.97，松手用 emphasized-decelerate 收尾，比线性回位「弹」得住。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button>Filled</M3Button>
            <M3Button variant="tonal">Tonal</M3Button>
            <M3Button variant="elevated">Elevated</M3Button>
            <M3Button variant="outlined">Outlined</M3Button>
            <M3Button variant="text">Text</M3Button>
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
        </p>

        <div class="gallery__surface">
          <p class="gallery__label">Assist</p>
          <div class="gallery__row">
            <M3Chip :icon="IcoAdd" label="添加" />
            <M3Chip :icon="IcoCloud" label="同步" />
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

          <p class="gallery__label" style="margin-block-start: 20px">单个开关</p>
          <div class="gallery__row">
            <M3Chip variant="filter" label="关注中" :selected="chipOn" @click="chipOn = !chipOn" />
          </div>
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

      <!-- ========== SegmentedButton ========== -->
      <section id="segmented" class="gallery__section">
        <h2 class="gallery__section-title">SegmentedButton 分段按钮</h2>
        <p class="gallery__section-note">
          与 Chip 同一套「选中即弹出对勾」的语义，两个组件的行为保持一致，用户不必分别学习。
        </p>

        <div class="gallery__surface">
          <M3SegmentedButton v-model="segment" :options="segmentOptions" aria-label="视图模式" />
          <p class="gallery__hint">当前：{{ segment }}</p>

          <p class="gallery__label" style="margin-block-start: 20px">通栏</p>
          <M3SegmentedButton v-model="segment" :options="segmentOptions" block aria-label="视图模式" />
        </div>
      </section>

      <!-- ========== TextField ========== -->
      <section id="text-field" class="gallery__section">
        <h2 class="gallery__section-title">TextField 输入框</h2>
        <p class="gallery__section-note">
          浮动标签是 M3 最有辨识度的动效：标签上浮、字号缩小、颜色转主色，三者必须同一个时长，
          否则标签会「边飞边变粗」。底部指示线聚焦时从 1dp 摊开到 2dp 整宽。
        </p>

        <div class="gallery__surface">
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
            <M3TextField v-model="name" label="昵称" placeholder="点进来看看标签" />
            <M3TextField v-model="email" label="邮箱" type="email" hint="我们不会公开你的邮箱" />
            <M3TextField
              v-model="password"
              label="密码"
              type="password"
              revealable
              hint="点右侧眼睛可以查看"
            />
            <M3TextField v-model="search" label="搜索" clearable :icon="IcoSearch" />
            <M3TextField model-value="输入有误" label="错误态" error="该用户名已被占用" />
            <M3TextField model-value="" label="禁用" disabled />
          </div>

          <p class="gallery__label" style="margin-block-start: 20px">带右侧主操作（验证码）</p>
          <M3TextField
            v-model="search"
            label="验证码"
            action-text="发送"
            hint="60 秒后可重发"
          />
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
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
            <M3Select v-model="planet" label="目的地" :options="planetOptions" />
            <M3Select model-value="" label="带占位" :options="planetOptions" placeholder="请选择" />
            <M3Select model-value="earth" label="错误态" :options="planetOptions" error="该选项不可用" />
            <M3Select model-value="earth" label="禁用" :options="planetOptions" disabled />
          </div>
        </div>
      </section>

      <!-- ========== Card ========== -->
      <section id="card" class="gallery__section">
        <h2 class="gallery__section-title">Card 卡片</h2>
        <p class="gallery__section-note">
          可点卡片悬停时抬升 4px，按下再回落到 1px 并缩到 0.99 —— 抬起再按进去，给「按到了」的触感。
        </p>

        <div class="gallery__grid">
          <M3Card variant="filled" shape="large" interactive>
            <div class="gallery__surface" style="background: none; padding: 20px">
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
      </section>

      <!-- ========== List ========== -->
      <section id="list" class="gallery__section">
        <h2 class="gallery__section-title">List 列表</h2>
        <p class="gallery__section-note">
          列表项不缩放 —— 整行缩放会带着文字一起抖，只用状态层的深浅表达按压，反而更稳。
        </p>

        <div class="gallery__surface">
          <M3List class="md-stagger">
            <M3ListItem headline="云术身份中心" supporting="统一登录 · 8 个站点" clickable :leading-icon="IcoPerson" />
            <M3ListItem headline="组件库" supporting="v0.2.0" clickable :leading-icon="IcoCloud" />
            <M3ListItem headline="设置" clickable :leading-icon="IcoSettings" />
            <M3ListItem headline="已禁用的一项" disabled :leading-icon="IcoHome" />
          </M3List>
        </div>
      </section>

      <!-- ========== Avatar ========== -->
      <section id="avatar" class="gallery__section">
        <h2 class="gallery__section-title">Avatar 头像</h2>
        <p class="gallery__section-note">
          图片加载完成后淡入并轻微放大（1.04 → 1）。只淡入的话，图与首字母之间的切换像一次闪烁。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Avatar name="云术 工作室" :size="32" />
            <M3Avatar name="Cloudery Studio" :size="40" />
            <M3Avatar name="林" :size="48" ring />
            <M3Avatar name="Zed" :size="64" />
            <M3Avatar src="https://avatars.githubusercontent.com/u/1?v=4" name="GitHub" :size="56" />
          </div>
        </div>
      </section>

      <!-- ========== Dialog ========== -->
      <section id="dialog" class="gallery__section">
        <h2 class="gallery__section-title">Dialog / Confirm</h2>
        <p class="gallery__section-note">
          入场从下方 16px 升上来并从 0.92 放大，出场更快地缩回去（short3）——
          「进来要稳、出去要干脆」。确认框基于同一个 Dialog，只多一层命令式 API。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button @click="dialogOpen = true">打开对话框</M3Button>
            <M3Button variant="tonal" @click="askDanger">危险操作确认</M3Button>
          </div>
        </div>

        <M3Dialog v-model="dialogOpen" title="组件库说明" :icon="IcoCheck">
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
          宽度变化会让面板内的文字重新排版。
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
          从锚点方向「长出来」（scaleY 0.85 → 1）。入场用 decelerate、出场用 accelerate，
          一进一出方向感一致，收起时不会像卡了一下。
        </p>

        <div class="gallery__surface">
          <!-- 菜单自己管开合：点 trigger、点外部、按 Esc 都会关 -->
          <M3Menu>
            <template #trigger="{ open }">
              <M3Button variant="outlined" :aria-expanded="open">打开菜单</M3Button>
            </template>

            <M3MenuItem headline="重命名" :leading-icon="IcoEdit" />
            <M3MenuItem headline="移动到…" :leading-icon="IcoShare" />
            <M3MenuItem headline="删除" :leading-icon="IcoDelete" />
          </M3Menu>
        </div>
      </section>

      <!-- ========== Snackbar ========== -->
      <section id="snackbar" class="gallery__section">
        <h2 class="gallery__section-title">Snackbar 提示条</h2>
        <p class="gallery__section-note">
          从下方滑入 28px 并轻微放大，出场更快地缩回去。它盖在页面底部，
          位移幅度要比对话框大一些才看得出「来了」。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row">
            <M3Button variant="tonal" @click="showAllTones">依次演示四种色调</M3Button>
            <M3Button variant="text" @click="showSuccess('已保存')">成功</M3Button>
            <M3Button variant="text" @click="showWarning('空间不足', '注意')">警告</M3Button>
            <M3Button variant="text" @click="showError('请求失败')">错误</M3Button>
          </div>
        </div>
      </section>

      <!-- ========== Tooltip ========== -->
      <section id="tooltip" class="gallery__section">
        <h2 class="gallery__section-title">Tooltip 气泡提示</h2>
        <p class="gallery__section-note">
          悬停 300ms 后才出现，避免扫过一排按钮时到处冒泡。
          隐藏时用 <code>display:none</code> 移出布局，否则绝对定位的气泡会撑出横向滚动条。
        </p>

        <div class="gallery__surface">
          <div class="gallery__row" style="gap: 24px">
            <M3Tooltip text="在上方显示">
              <M3Button variant="outlined">悬停我</M3Button>
            </M3Tooltip>
            <M3Tooltip text="在下方显示" placement="bottom">
              <M3IconButton :icon="IcoSearch" label="搜索" variant="tonal" />
            </M3Tooltip>
          </div>
        </div>
      </section>

      <!-- ========== Alert ========== -->
      <section id="alert" class="gallery__section">
        <h2 class="gallery__section-title">Alert 行内提示</h2>
        <p class="gallery__section-note">
          MD3 没有「告警条」组件，官方做法是容器 + 语义色。错误用 <code>role="alert"</code>
          立即播报，其余用 <code>status</code> 礼貌播报。
        </p>

        <div class="gallery__surface" style="display: grid; gap: 12px">
          <M3Alert variant="info" title="提示">
            这是一条普通说明，可以带 <a href="#">链接</a>。
          </M3Alert>
          <M3Alert variant="success" title="已完成">配置已保存并生效。</M3Alert>
          <M3Alert variant="warning" title="注意">磁盘空间只剩 10%，建议清理。</M3Alert>
          <M3Alert variant="error" title="请求失败">连接超时，请稍后重试。</M3Alert>
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
        </p>

        <div class="gallery__surface">
          <M3Skeleton :rows="3" label="正在加载组件列表" />
        </div>
      </section>

      <!-- ========== Pagination ========== -->
      <section id="pagination" class="gallery__section">
        <h2 class="gallery__section-title">Pagination 分页</h2>
        <p class="gallery__section-note">
          最多显示 5 个页码，围绕当前页展开。页码按钮带 <code>aria-current</code>，
          读屏会读成「第 3 页，当前页」。
        </p>

        <div class="gallery__surface">
          <M3Pagination v-model:page="page" :total-pages="20" />
          <p class="gallery__hint">当前第 {{ page }} 页</p>
        </div>
      </section>
    </main>

    <M3SnackbarHost />
  </div>
</template>
