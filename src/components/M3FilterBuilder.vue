<script setup lang="ts">
import { computed } from 'vue'
import M3FilterGroup from './_M3FilterGroup.vue'
import {
  countRules,
  createFilter,
  filterRows,
  matchesFilter,
  type FilterField,
  type FilterGroup,
} from '../utils/filter'

/**
 * 可视化筛选器：条件 · 运算符 · 值，按且/或组合，可嵌套分组。
 *
 * v-model 是一棵纯 JSON 树，可以直接交给服务端；本地筛选用 filterRows()。
 * 空规则（字段没选）不参与计算 —— 否则「刚点了一下添加条件」就把整张表筛空了。
 * 默认只允许一层嵌套：再深就不是给用户点的界面，而是要写代码的表达式了。
 */
const props = withDefaults(
  defineProps<{
    /** 筛选树（v-model）；null/undefined 时从空条件开始。 */
    modelValue?: FilterGroup | null
    fields: FilterField[]
    /** 最大嵌套层数；0 表示不允许分组。 */
    maxDepth?: number
    disabled?: boolean
  }>(),
  { modelValue: null, maxDepth: 1, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [filter: FilterGroup] }>()

/** 空树保持同一个引用，避免每次渲染都换 id。 */
const empty = createFilter()

const root = computed<FilterGroup>(() =>
  props.modelValue && typeof props.modelValue === 'object' ? props.modelValue : empty,
)

const ruleCount = computed(() => countRules(root.value))

function update(filter: FilterGroup): void {
  emit('update:modelValue', filter)
}

defineExpose({ matchesFilter, filterRows })
</script>

<template>
  <div class="md-filter-builder" role="group" aria-label="筛选条件">
    <M3FilterGroup
      :group="root"
      :fields="fields"
      :depth="0"
      :max-depth="maxDepth"
      :disabled="disabled"
      @update="update"
    />

    <p class="md-filter-builder__summary">
      共 {{ ruleCount }} 条条件；空条件不参与筛选。
    </p>
  </div>
</template>

<style scoped>
.md-filter-builder {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--md-ref-typeface-plain);
}

.md-filter-builder__summary {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}
</style>
