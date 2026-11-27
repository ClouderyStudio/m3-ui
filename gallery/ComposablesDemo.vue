<script setup lang="ts">
import { ref } from 'vue'
import {
  M3Button,
  printElement,
  useAutoGrow,
  useDebounce,
  useDevice,
  useIntersectionObserver,
  useLocalStorage,
  useMediaQuery,
  useResizeObserver,
  useSpring,
  useWindowSizeClass,
} from '../src'

/**
 * 组合式函数的现场演示。
 *
 * 每张卡片只做一件事，但状态是真的：拖窗口、切系统深色、清空 localStorage、
 * 打字、滚动到哨兵 —— 数值都会跟着变。文档里写「响应式」很容易，
 * 能当场看到它反应才算数。
 */
const { width, height, widthClass, heightClass } = useWindowSizeClass()
const dark = useMediaQuery('(prefers-color-scheme: dark)')
const device = useDevice()

const count = useLocalStorage('m3-gallery-demo-count', 0)

const query = ref('')
const debouncedValue = ref('')
const runDebounce = useDebounce((value: string) => {
  debouncedValue.value = value
}, 400)

function onQueryInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
  runDebounce(query.value)
}

const sentinel = ref<HTMLElement | null>(null)
const seen = ref(false)
useIntersectionObserver(
  sentinel,
  (entry) => {
    if (entry.isIntersecting) seen.value = true
  },
  { rootMargin: '0px 0px -20px 0px', once: true },
)

const box = ref<HTMLElement | null>(null)
const boxWidth = ref(0)
useResizeObserver(box, (entry) => {
  boxWidth.value = Math.round(entry.contentRect.width)
})

const square = ref<HTMLElement | null>(null)
const offset = ref(0)
useSpring(
  () => [offset.value],
  (values) => {
    if (square.value) square.value.style.transform = 'translateX(' + (values[0] ?? 0) + 'px)'
  },
)

const textarea = ref<HTMLTextAreaElement | null>(null)
const note = ref('第一行\n第二行')
useAutoGrow(textarea, { minRows: 2, maxRows: 8, value: note })

const printable = ref<HTMLElement | null>(null)
function doPrint(): void {
  printElement(printable.value, { title: 'M3 组件库 · 打印示例' })
}
</script>

<template>
  <div class="demo-grid">
    <article class="demo-card">
      <h3 class="demo-card__title">useWindowSizeClass</h3>
      <p class="demo-card__desc">M3 窗口尺寸类，拖窄/拖宽窗口看变化。</p>
      <p class="demo-card__value">{{ width }} × {{ height }} px</p>
      <p class="demo-card__hint">宽 {{ widthClass }} · 高 {{ heightClass }}</p>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useMediaQuery / useDevice</h3>
      <p class="demo-card__desc">媒体查询与设备能力，全部响应式。</p>
      <p class="demo-card__value">{{ dark ? '深色' : '浅色' }} · {{ device.isTouch.value ? '触摸' : '指针' }}</p>
      <p class="demo-card__hint">
        hover {{ device.hover.value ? '有' : '无' }} · 减少动效 {{ device.reducedMotion.value ? '开' : '关' }} ·
        DPR {{ device.dpr.value }}
      </p>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useLocalStorage</h3>
      <p class="demo-card__desc">刷新页面后数字还在（换标签页也会同步）。</p>
      <p class="demo-card__value">{{ count }}</p>
      <div class="demo-card__row">
        <M3Button size="sm" variant="tonal" @click="count += 1">+1</M3Button>
        <M3Button size="sm" variant="text" @click="count = 0">清零</M3Button>
      </div>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useDebounce</h3>
      <p class="demo-card__desc">停止输入 400ms 后才更新右侧的值。</p>
      <input class="demo-card__input" :value="query" placeholder="随便打几个字" aria-label="防抖输入" @input="onQueryInput" />
      <p class="demo-card__hint">防抖后：{{ debouncedValue || '（等待输入）' }}</p>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useIntersectionObserver</h3>
      <p class="demo-card__desc">滚动到这个哨兵时只触发一次。</p>
      <div ref="sentinel" class="demo-card__sentinel" :class="{ 'is-seen': seen }">
        {{ seen ? '已进入视口 ✓' : '还没看到我' }}
      </div>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useResizeObserver</h3>
      <p class="demo-card__desc">拖动下面盒子的右下角，或改变窗口宽度。</p>
      <div ref="box" class="demo-card__resizable">宽 {{ boxWidth }} px</div>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useSpring</h3>
      <p class="demo-card__desc">FastSpatial 弹簧：冲过一点再收住（减少动效时直接落位）。</p>
      <div class="demo-card__track">
        <span ref="square" class="demo-card__square" />
      </div>
      <M3Button size="sm" variant="tonal" @click="offset = offset === 0 ? 160 : 0">移动</M3Button>
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">useAutoGrow</h3>
      <p class="demo-card__desc">textarea 随内容长高，2–8 行之间。</p>
      <textarea ref="textarea" v-model="note" class="demo-card__textarea" aria-label="自动增高示例" />
    </article>

    <article class="demo-card">
      <h3 class="demo-card__title">printElement</h3>
      <p class="demo-card__desc">只把这一个卡片送进打印窗口，而不是整页。</p>
      <div ref="printable" class="demo-card__printable">
        <strong>M3 组件库</strong>
        <p>这是被打印的区块。</p>
      </div>
      <M3Button size="sm" variant="tonal" @click="doPrint">打印这张卡片</M3Button>
    </article>

    <article class="demo-card demo-card--wide">
      <h3 class="demo-card__title">useEscapeStack / useClickOutside / useEventListener / useThrottle</h3>
      <p class="demo-card__desc">
        Esc 走共享的栈：对话框里再开日期面板，一次 Esc 只关最上面那层（去「日期时间」小节试试）。
        点击外部、事件监听、节流同理 —— 浮层组件不再各挂一份 document 监听。
      </p>
    </article>
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.demo-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-lowest);
  font-family: var(--md-ref-typeface-plain);
}

.demo-card--wide {
  grid-column: 1 / -1;
}

.demo-card__title {
  margin: 0;
  font-family: var(--md-ref-typeface-mono, monospace);
  font-size: 12px;
  color: var(--md-sys-color-primary);
}

.demo-card__desc {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 11px;
  line-height: 1.5;
}

.demo-card__value {
  margin: 0;
  font-size: 20px;
  font-variant-numeric: tabular-nums;
  color: var(--md-sys-color-on-surface);
}

.demo-card__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 11px;
}

.demo-card__row {
  display: flex;
  gap: 8px;
}

.demo-card__input,
.demo-card__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 12px;
}

.demo-card__textarea {
  resize: none;
  line-height: 1.5;
}

.demo-card__sentinel {
  display: grid;
  place-items: center;
  height: 56px;
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
}

.demo-card__sentinel.is-seen {
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}

.demo-card__resizable {
  display: grid;
  place-items: center;
  height: 56px;
  resize: horizontal;
  overflow: auto;
  min-width: 80px;
  max-width: 100%;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.demo-card__track {
  position: relative;
  height: 28px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
}

.demo-card__square {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 4px;
  translate: 0 -50%;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background-color: var(--md-sys-color-primary);
}

.demo-card__printable {
  padding: 8px 10px;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-surface-container);
  font-size: 12px;
}

.demo-card__printable p {
  margin: 4px 0 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
