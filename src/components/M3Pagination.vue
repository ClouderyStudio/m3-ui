<script setup lang="ts">
import { computed } from 'vue'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 分页。
 *
 * 页码按钮自己实现而不是用 M3IconButton：它要显示数字、要能被读屏读成「第 3 页」
 * 并带上 aria-current，图标按钮承载不了这些语义。
 *
 * 页码不是固定的 5 个：首尾页始终可见，中间围绕当前页展开，间隔处用省略号补齐。
 * 页数很多时（后台列表常见 20+ 页）固定窗口会让用户没法一键跳到最后一页。
 */
type PageItem = number | 'gap-start' | 'gap-end'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    /** 当前页两侧各显示几页（1 表示 … 8 9 10 …）。 */
    siblings?: number
  }>(),
  { siblings: 1 },
)

const emit = defineEmits<{ (e: 'update:page', value: number): void }>()

const total = computed(() => Math.max(1, props.totalPages))
const current = computed(() => Math.min(Math.max(1, props.page), total.value))

const pages = computed<PageItem[]>(() => {
  const all = total.value
  const value = current.value
  if (all <= 5) {
    return Array.from({ length: all }, (_, index) => index + 1)
  }

  const radius = Math.min(Math.max(0, props.siblings), 3)
  const keep = new Set<number>([1, all])
  for (let index = value - radius; index <= value + radius; index++) {
    if (index >= 2 && index <= all - 1) keep.add(index)
  }

  const sorted = [...keep].sort((a, b) => a - b)
  const items: PageItem[] = []
  sorted.forEach((item, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && item - previous > 1) {
      items.push(item === all ? 'gap-end' : 'gap-start')
    }
    items.push(item)
  })
  return items
})

function go(page: number): void {
  const next = Math.min(Math.max(1, page), total.value)
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="md-pagination" aria-label="分页">
    <M3IconButton
      :icon="IconChevronLeft"
      label="上一页"
      variant="standard"
      :disabled="current <= 1"
      @click="go(current - 1)"
    />

    <template v-for="item in pages" :key="item">
      <span v-if="typeof item === 'string'" class="md-pagination__gap" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        class="md-pagination__page md-typescale-label-large"
        :class="{ 'is-active': item === current }"
        :aria-current="item === current ? 'page' : undefined"
        :aria-label="'第 ' + item + ' 页'"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <M3IconButton
      :icon="IconChevronRight"
      label="下一页"
      variant="standard"
      :disabled="current >= total"
      @click="go(current + 1)"
    />
  </nav>
</template>

<style scoped>
.md-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-block-start: 28px;
  flex-wrap: wrap;
}

.md-pagination__page {
  min-width: 40px;
  height: 40px;
  padding-inline: 8px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-pagination__page:hover {
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
  }
}

.md-pagination__page:focus-visible {
  outline-offset: 0;
}

.md-pagination__page.is-active {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md-pagination__gap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 40px;
  color: var(--md-sys-color-on-surface-variant);
  user-select: none;
}

@media (max-width: 420px) {
  .md-pagination {
    gap: 2px;
  }

  .md-pagination__page {
    min-width: 34px;
    height: 34px;
    padding-inline: 4px;
  }
}
</style>
