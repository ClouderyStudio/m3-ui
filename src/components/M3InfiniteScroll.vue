<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import M3Progress from './M3Progress.vue'

/**
 * 无限滚动：底部放一个哨兵元素，进入视口就 emit('load')。
 *
 * 用 IntersectionObserver 而不是监听 scroll 事件：
 * 后者要在每次滚动里算位置（强制布局），长列表下掉帧很明显；
 * 观察器把这件事交给浏览器，回调只在真的跨界时才来一次。
 *
 * loading / ended 时必须断开观察：不然「正在加载」期间哨兵一直可见，
 * 会连着触发好几次 load，把同一页数据拉三遍。
 */
const props = withDefaults(
  defineProps<{
    /** 正在加载更多：显示 loading 插槽。 */
    loading?: boolean
    /** 没有更多了：显示 end 插槽并停止观察。 */
    ended?: boolean
    /** 完全停用触发（例如筛选条件还没选好）。 */
    disabled?: boolean
    /** 哨兵提前多少像素进入视口就开始加载。 */
    threshold?: number
    loadingText?: string
    endText?: string
  }>(),
  {
    loading: false,
    ended: false,
    disabled: false,
    threshold: 100,
    loadingText: '正在加载更多…',
    endText: '没有更多了',
  },
)

const emit = defineEmits<{ load: [] }>()

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function disconnect(): void {
  observer?.disconnect()
  observer = null
}

function observe(): void {
  disconnect()
  if (props.disabled || props.ended) return
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      if (props.loading || props.ended || props.disabled) return
      emit('load')
    },
    { rootMargin: '0px 0px ' + props.threshold + 'px 0px' },
  )

  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(observe)

watch(() => [props.disabled, props.ended, props.loading], observe)

onBeforeUnmount(disconnect)
</script>

<template>
  <div class="md-infinite">
    <slot />

    <div ref="sentinel" class="md-infinite__sentinel">
      <slot v-if="loading" name="loading">
        <span class="md-infinite__status">
          <M3Progress variant="circular" :size="20" :label="loadingText" />
          <span class="md-infinite__text">{{ loadingText }}</span>
        </span>
      </slot>
      <slot v-else-if="ended" name="end">
        <span class="md-infinite__text">{{ endText }}</span>
      </slot>
      <slot v-else name="idle" />
    </div>
  </div>
</template>

<style scoped>
.md-infinite {
  display: flex;
  flex-direction: column;
  font-family: var(--md-ref-typeface-plain);
}

/* 哨兵有实际高度，才能在没有内容时也观察得到 */
.md-infinite__sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-block: 12px;
}

.md-infinite__status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.md-infinite__text {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}
</style>
