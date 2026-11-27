<script setup lang="ts">
import { computed } from 'vue'
import { diffLines } from '../utils/diff'

/**
 * 文本差异查看器。
 *
 * 差异算法在 utils/diff（LCS + 大文本降级 + 折叠相同段），这里只管渲染：
 * 行号、+/- 标记、统计。算法抽出去之后，其他地方（编辑器、变更预览）也能复用同一份。
 */
const props = withDefaults(
  defineProps<{
    before: string
    after: string
    /** 每个改动块上下保留的上下文行数。 */
    context?: number
    beforeLabel?: string
    afterLabel?: string
  }>(),
  { context: 3, beforeLabel: '修改前', afterLabel: '修改后' },
)

const result = computed(() => diffLines(props.before, props.after, { context: props.context }))
const rows = computed(() => result.value.rows)
const stats = computed(() => ({ added: result.value.added, removed: result.value.removed }))
</script>

<template>
  <div class="md-diff">
    <header class="md-diff__header">
      <span class="md-diff__label">{{ beforeLabel }}</span>
      <span class="md-diff__arrow" aria-hidden="true">→</span>
      <span class="md-diff__label">{{ afterLabel }}</span>
      <span v-if="result.degraded" class="md-diff__degraded">文本过长，已按行比较</span>
      <span class="md-diff__stats">
        <span class="md-diff__added">+{{ stats.added }}</span>
        <span class="md-diff__removed">−{{ stats.removed }}</span>
      </span>
    </header>

    <div class="md-diff__body">
      <table class="md-diff__table">
        <tbody>
          <tr v-for="(row, index) in rows" :key="index" class="md-diff__row" :class="'is-' + row.type">
            <template v-if="row.type === 'gap'">
              <td colspan="4" class="md-diff__gap">⋯ 省略 {{ row.skipped }} 行相同内容</td>
            </template>
            <template v-else>
              <td class="md-diff__no">{{ row.oldNo ?? '' }}</td>
              <td class="md-diff__no">{{ row.newNo ?? '' }}</td>
              <td class="md-diff__marker" aria-hidden="true">
                {{ row.type === 'add' ? '+' : row.type === 'remove' ? '−' : ' ' }}
              </td>
              <td class="md-diff__text">{{ row.text }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.md-diff {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
  font-family: var(--md-ref-typeface-mono);
  font-size: 12px;
}

.md-diff__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--md-sys-color-surface-container-low);
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-medium-size);
}

.md-diff__label {
  color: var(--md-sys-color-on-surface);
}

.md-diff__arrow {
  color: var(--md-sys-color-on-surface-variant);
}

.md-diff__degraded {
  margin-inline-start: 8px;
  padding: 1px 8px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: color-mix(in srgb, var(--md-sys-color-tertiary) 16%, transparent);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
}

.md-diff__stats {
  margin-inline-start: auto;
  display: inline-flex;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}

.md-diff__added {
  color: var(--md-sys-color-primary);
}

.md-diff__removed {
  color: var(--md-sys-color-error);
}

.md-diff__body {
  max-height: 420px;
  overflow: auto;
  background-color: var(--md-sys-color-surface-container-lowest);
}

.md-diff__table {
  width: 100%;
  border-collapse: collapse;
}

.md-diff__no {
  width: 3.5em;
  padding: 2px 6px;
  text-align: end;
  color: var(--md-sys-color-on-surface-variant);
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.md-diff__marker {
  width: 2em;
  text-align: center;
  user-select: none;
}

.md-diff__text {
  padding: 2px 8px;
  white-space: pre-wrap;
  word-break: break-all;
}

.md-diff__row.is-add {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}

.md-diff__row.is-remove {
  background-color: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
}

.md-diff__row.is-add .md-diff__marker {
  color: var(--md-sys-color-primary);
}

.md-diff__row.is-remove .md-diff__marker {
  color: var(--md-sys-color-error);
}

.md-diff__gap {
  padding: 4px 8px;
  color: var(--md-sys-color-on-surface-variant);
  background-color: var(--md-sys-color-surface-container-low);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-small-size);
}
</style>