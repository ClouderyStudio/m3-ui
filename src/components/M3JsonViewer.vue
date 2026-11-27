<script setup lang="ts">
import { computed } from 'vue'
import M3CopyButton from './M3CopyButton.vue'
import M3JsonNode from './M3JsonNode.vue'

/**
 * JSON 查看器：可折叠的树 + 一键复制。
 *
 * 用真实的 <ul>/<li> 结构而不是 div 拼缩进：读屏能数出层级，
 * 键盘用户也能用 Tab 逐层展开（分支行是 focusable 的）。
 */
const props = withDefaults(
  defineProps<{
    value: unknown
    rootLabel?: string
    /** 初始展开层数。 */
    defaultExpandDepth?: number
    /** 滚动区高度。 */
    maxHeight?: string
    /** 显示「节点数 / 字节数」摘要。 */
    showMeta?: boolean
  }>(),
  { rootLabel: 'root', defaultExpandDepth: 2, maxHeight: '360px', showMeta: true },
)

const serialized = computed(() => {
  try {
    return JSON.stringify(props.value, null, 2)
  } catch {
    return ''
  }
})

const size = computed(() => {
  const bytes = new Blob([serialized.value]).size
  return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB'
})
</script>

<template>
  <div class="md-json-viewer">
    <header class="md-json-viewer__header">
      <span class="md-json-viewer__label">{{ rootLabel }}</span>
      <span v-if="showMeta" class="md-json-viewer__meta">{{ size }}</span>
      <M3CopyButton :text="serialized" label="复制 JSON" size="sm" variant="text" />
    </header>

    <div class="md-json-viewer__body" :style="{ maxHeight }">
      <ul class="md-json-viewer__tree">
        <M3JsonNode
          :name="rootLabel"
          :value="value"
          :depth="0"
          :default-expand-depth="defaultExpandDepth"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.md-json-viewer {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-lowest);
  overflow: hidden;
}

.md-json-viewer__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 14px;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  background-color: var(--md-sys-color-surface-container-low);
}

.md-json-viewer__label {
  font-family: var(--md-ref-typeface-mono);
  font-size: 12px;
  color: var(--md-sys-color-on-surface);
}

.md-json-viewer__meta {
  margin-inline-end: auto;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.md-json-viewer__body {
  overflow: auto;
  padding: 8px 6px;
}

.md-json-viewer__tree {
  margin: 0;
  padding: 0;
}
</style>
