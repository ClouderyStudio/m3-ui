<script setup lang="ts">
import { computed } from 'vue'
import { IconChevronLeft, IconChevronRight } from '../icons'
import M3IconButton from './M3IconButton.vue'

/**
 * 分页：最多显示 5 个页码，围绕当前页展开。
 *
 * 页码按钮自己实现而不是用 M3IconButton：它要显示数字、要能被读屏读成「第 3 页」
 * 并带上 aria-current，图标按钮承载不了这些语义。
 */
const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ (e: 'update:page', value: number): void }>()

const pages = computed(() => {
  const total = Math.max(1, props.totalPages)
  const current = Math.min(Math.max(1, props.page), total)
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  const end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

function go(page: number): void {
  const next = Math.min(Math.max(1, page), Math.max(1, props.totalPages))
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="分页">
    <M3IconButton
      :icon="IconChevronLeft"
      label="上一页"
      variant="standard"
      :disabled="page <= 1"
      @click="go(page - 1)"
    />

    <button
      v-for="item in pages"
      :key="item"
      type="button"
      class="pagination__page md-typescale-label-large"
      :class="{ 'is-active': item === page }"
      :aria-current="item === page ? 'page' : undefined"
      :aria-label="'第 ' + item + ' 页'"
      @click="go(item)"
    >
      {{ item }}
    </button>

    <M3IconButton
      :icon="IconChevronRight"
      label="下一页"
      variant="standard"
      :disabled="page >= totalPages"
      @click="go(page + 1)"
    />
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-block-start: 28px;
}

.pagination__page {
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
  .pagination__page:hover {
    background-color: var(--md-sys-color-surface-container-high);
  }
}

.pagination__page.is-active {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
</style>
