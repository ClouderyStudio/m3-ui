<script setup lang="ts">
import { computed } from 'vue'
import { IconAdd, IconClose } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import M3SegmentedButton from './M3SegmentedButton.vue'
/* 递归引用自己：script setup 不会按文件名注册组件，必须显式导入 */
import M3FilterGroup from './_M3FilterGroup.vue'
import {
  createRule,
  createFilter,
  operatorLabel,
  operatorsFor,
  type FilterField,
  type FilterGroup,
  type FilterOperator,
  type FilterRule,
} from '../utils/filter'

/**
 * 筛选树的一层（递归自身）。
 *
 * 状态是纯 JSON 树，所以更新只能「自下而上」：叶子改了就把新的整棵树交给父层，
 * 父层用 id 替换子树再往上抛。直接在原地改对象看起来更省事，但那样父组件的
 * v-model 拿不到新引用，外部 watch 也不会触发。
 */
const props = defineProps<{
  group: FilterGroup
  fields: FilterField[]
  depth: number
  maxDepth: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [group: FilterGroup]
}>()

const conjunctionOptions = [
  { value: 'and', label: '且' },
  { value: 'or', label: '或' },
]

const canNest = computed(() => props.depth < props.maxDepth)

function fieldOf(key: string): FilterField | undefined {
  return props.fields.find((field) => field.key === key)
}

function replaceChild(id: string, next: FilterRule | FilterGroup): void {
  emit('update', {
    ...props.group,
    children: props.group.children.map((child) => (child.id === id ? next : child)),
  })
}

function removeChild(id: string): void {
  emit('update', {
    ...props.group,
    children: props.group.children.filter((child) => child.id !== id),
  })
}

function addRule(): void {
  emit('update', { ...props.group, children: [...props.group.children, createRule(props.fields[0])] })
}

function addGroup(): void {
  emit('update', { ...props.group, children: [...props.group.children, createFilter()] })
}

function setConjunction(value: string): void {
  emit('update', { ...props.group, conjunction: value === 'or' ? 'or' : 'and' })
}

/* ---------- 单条规则 ---------- */

function patchRule(rule: FilterRule, patch: Partial<FilterRule>): void {
  replaceChild(rule.id, { ...rule, ...patch })
}

function setField(rule: FilterRule, key: string): void {
  const field = fieldOf(key)
  // 换字段时运算符与值都要重来：数字的「大于」在文本上没有意义
  patchRule(rule, {
    field: key,
    operator: field ? operatorsFor(field.type)[0] : 'eq',
    value: field?.type === 'boolean' ? 'true' : '',
    value2: null,
  })
}

function operatorOptions(rule: FilterRule): { value: string; label: string }[] {
  const field = fieldOf(rule.field)
  const type = field?.type ?? 'text'
  return operatorsFor(type).map((operator) => ({ value: operator, label: operatorLabel(operator) }))
}

function setOperator(rule: FilterRule, operator: string): void {
  patchRule(rule, { operator: operator as FilterOperator })
}

function setValue(rule: FilterRule, value: string): void {
  patchRule(rule, { value })
}

function setValue2(rule: FilterRule, value: string): void {
  patchRule(rule, { value2: value })
}

function valueType(rule: FilterRule): FilterField['type'] {
  return fieldOf(rule.field)?.type ?? 'text'
}

function needsValue(rule: FilterRule): boolean {
  return rule.operator !== 'isTrue' && rule.operator !== 'isFalse'
}

function isBetween(rule: FilterRule): boolean {
  return rule.operator === 'between'
}
</script>

<template>
  <div class="md-filter-group" :class="{ 'is-nested': depth > 0 }">
    <header class="md-filter-group__header">
      <M3SegmentedButton
        :model-value="group.conjunction"
        :options="conjunctionOptions"
        size="sm"
        :disabled="disabled"
        aria-label="条件组合方式"
        @update:model-value="setConjunction"
      />
      <span class="md-filter-group__hint">
        满足{{ group.conjunction === 'and' ? '全部' : '任意' }}条件
      </span>
    </header>

    <div class="md-filter-group__rows">
      <template v-for="child in group.children" :key="child.id">
        <!-- 规则行 -->
        <div v-if="child.kind === 'rule'" class="md-filter-rule">
          <select
            class="md-filter__select"
            :value="child.field"
            :disabled="disabled"
            aria-label="字段"
            @change="setField(child, ($event.target as HTMLSelectElement).value)"
          >
            <option value="" disabled>选择字段</option>
            <option v-for="field in fields" :key="field.key" :value="field.key">{{ field.label }}</option>
          </select>

          <select
            class="md-filter__select md-filter__select--operator"
            :value="child.operator"
            :disabled="disabled"
            aria-label="运算符"
            @change="setOperator(child, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in operatorOptions(child)" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <template v-if="needsValue(child)">
            <template v-if="valueType(child) === 'select'">
              <select
                class="md-filter__select"
                :value="String(child.value ?? '')"
                :disabled="disabled"
                aria-label="值"
                @change="setValue(child, ($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled>选择值</option>
                <option v-for="option in fieldOf(child.field)?.options ?? []" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </template>

            <template v-else-if="valueType(child) === 'date'">
              <input
                class="md-filter__input"
                type="date"
                :value="String(child.value ?? '')"
                :disabled="disabled"
                aria-label="日期"
                @input="setValue(child, ($event.target as HTMLInputElement).value)"
              />
              <input
                v-if="isBetween(child)"
                class="md-filter__input"
                type="date"
                :value="String(child.value2 ?? '')"
                :disabled="disabled"
                aria-label="结束日期"
                @input="setValue2(child, ($event.target as HTMLInputElement).value)"
              />
            </template>

            <template v-else-if="valueType(child) === 'number'">
              <input
                class="md-filter__input"
                type="number"
                :value="child.value ?? ''"
                :disabled="disabled"
                aria-label="数值"
                @input="setValue(child, ($event.target as HTMLInputElement).value)"
              />
              <input
                v-if="isBetween(child)"
                class="md-filter__input"
                type="number"
                :value="child.value2 ?? ''"
                :disabled="disabled"
                aria-label="上限"
                @input="setValue2(child, ($event.target as HTMLInputElement).value)"
              />
            </template>

            <input
              v-else
              class="md-filter__input"
              type="text"
              :value="String(child.value ?? '')"
              :disabled="disabled"
              aria-label="值"
              @input="setValue(child, ($event.target as HTMLInputElement).value)"
            />
          </template>

          <M3IconButton
            :icon="IconClose"
            label="删除条件"
            size="sm"
            variant="standard"
            :disabled="disabled"
            @click="removeChild(child.id)"
          />
        </div>

        <!-- 嵌套分组 -->
        <M3FilterGroup
          v-else
          :group="child"
          :fields="fields"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :disabled="disabled"
          @update="replaceChild(child.id, $event)"
        />
      </template>

      <p v-if="group.children.length === 0" class="md-filter-group__empty">还没有条件</p>
    </div>

    <footer class="md-filter-group__footer">
      <button type="button" class="md-filter__add" :disabled="disabled" @click="addRule">
        <M3Icon :icon="IconAdd" :size="18" />
        添加条件
      </button>
      <button
        v-if="canNest"
        type="button"
        class="md-filter__add"
        :disabled="disabled"
        @click="addGroup"
      >
        <M3Icon :icon="IconAdd" :size="18" />
        添加分组
      </button>
    </footer>
  </div>
</template>

<style scoped>
.md-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: var(--md-sys-shape-corner-medium);
  border: 1px solid var(--md-sys-color-outline-variant);
  background-color: var(--md-sys-color-surface-container-low);
}

.md-filter-group.is-nested {
  border-inline-start: 3px solid var(--md-sys-color-primary);
  background-color: transparent;
}

.md-filter-group__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.md-filter-group__hint {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-filter-group__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.md-filter-rule {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.md-filter__select,
.md-filter__input {
  height: 36px;
  min-width: 120px;
  padding-inline: 10px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-body-medium-size);
  outline: none;
}

.md-filter__select--operator {
  min-width: 104px;
}

.md-filter__select:focus,
.md-filter__input:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
}

.md-filter__select:disabled,
.md-filter__input:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  cursor: not-allowed;
}

.md-filter__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding-inline: 10px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-primary);
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
}

@media (hover: hover) {
  .md-filter__add:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
  }
}

.md-filter__add:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}

.md-filter-group__empty {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
}

.md-filter-group__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
