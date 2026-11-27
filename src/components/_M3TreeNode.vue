<script setup lang="ts">
import { computed, inject } from 'vue'
import { IconChevronRight } from '../icons'
import type { TreeContext, TreeNode } from './M3Tree.vue'
import M3Checkbox from './M3Checkbox.vue'
import M3Icon from './M3Icon.vue'
/* 递归引用自己：script setup 不会按文件名注册组件，必须显式导入自己 */
import M3TreeNode from './_M3TreeNode.vue'

/**
 * 树的一行（递归自身）。
 *
 * 展开动画交给 grid-template-rows 0fr → 1fr：
 * 不用猜内容高度，内容再多也不会露馅；折叠时子树仍然在 DOM 里，
 * 所以给它加 inert —— 否则 Tab 会钻进看不见的行里。
 */
const props = defineProps<{ node: TreeNode; depth: number; index: number }>()

defineSlots<{
  label?: (props: { node: TreeNode }) => unknown
  trailing?: (props: { node: TreeNode }) => unknown
}>()

const tree = inject<TreeContext>('m3-tree')!

const hasChildren = computed(() => Boolean(props.node.children?.length))
const isExpanded = computed(() => tree.expanded.value.has(props.node.id))
const isSelected = computed(() => tree.selected.value === props.node.id)

const leaves = computed(() => tree.leafIds(props.node))
const checkedCount = computed(() => leaves.value.filter((id) => tree.checked.value.has(id)).length)
const isChecked = computed(() => leaves.value.length > 0 && checkedCount.value === leaves.value.length)
const isIndeterminate = computed(() => checkedCount.value > 0 && !isChecked.value)

/* 漫游 tabindex：整棵树只占一个 Tab 停靠点，进入后用方向键走 */
const tabbable = computed(
  () => tree.focusedId.value === props.node.id || (tree.focusedId.value === null && props.depth === 0 && props.index === 0),
)

function onRowClick(): void {
  if (props.node.disabled) return
  /*
   * 可勾选模式下整行就是「勾选」的点击区。
   *
   * 否则整行只做选中、只有 18dp 的方框能勾，而 hover 高亮却铺满整行 ——
   * 用户会以为点哪都能勾，点了却没反应。要么让点击区变小，要么让行为变大；
   * 这里选后者：多选列表里用户在意的本来就是「勾上没有」。
   */
  if (tree.checkable.value) {
    tree.toggleCheck(props.node)
    return
  }
  tree.selectNode(props.node)
  if (hasChildren.value) tree.toggleExpand(props.node.id)
}

function onChevronClick(event: MouseEvent): void {
  event.stopPropagation()
  if (props.node.disabled) return
  tree.toggleExpand(props.node.id)
}

function onCheck(value: boolean): void {
  if (props.node.disabled) return
  // 只在状态真的要变的时候生效：M3Checkbox 是受控的，父级级联会自己算最终值
  if (value !== isChecked.value) tree.toggleCheck(props.node)
}
</script>

<template>
  <div class="md-tree-node">
    <div
      class="md-tree-node__row"
      :class="{ 'is-selected': isSelected, 'is-disabled': node.disabled }"
      role="treeitem"
      :data-tree-row="node.id"
      :data-tree-depth="depth"
      :aria-level="depth + 1"
      :aria-selected="isSelected"
      :aria-expanded="hasChildren ? isExpanded : undefined"
      :aria-disabled="node.disabled ? 'true' : undefined"
      :tabindex="tabbable ? 0 : -1"
      @click="onRowClick"
      @focus="tree.focusedId.value = node.id"
    >
      <span class="md-tree-node__chevron-slot">
        <button
          v-if="hasChildren"
          type="button"
          class="md-tree-node__chevron"
          :class="{ 'is-open': isExpanded }"
          :aria-label="isExpanded ? tree.collapseLabel : tree.expandLabel"
          :disabled="node.disabled"
          tabindex="-1"
          @click="onChevronClick"
        >
          <M3Icon :icon="IconChevronRight" :size="16" />
        </button>
      </span>

      <span v-if="tree.checkable.value" class="md-tree-node__checkbox" @click.stop>
        <M3Checkbox
          :model-value="isChecked"
          :indeterminate="isIndeterminate"
          :disabled="node.disabled"
          :aria-label="'勾选 ' + node.label"
          @update:model-value="onCheck"
        />
      </span>

      <M3Icon
        v-if="node.icon"
        :icon="node.icon"
        :size="18"
        class="md-tree-node__icon"
        :class="{ 'is-selected': isSelected }"
      />

      <span class="md-tree-node__label">
        <slot name="label" :node="node">{{ node.label }}</slot>
      </span>

      <span v-if="hasChildren && tree.checkable.value" class="md-tree-node__count">
        {{ checkedCount }}/{{ leaves.length }}
      </span>

      <span v-if="$slots.trailing" class="md-tree-node__trailing">
        <slot name="trailing" :node="node" />
      </span>
    </div>

    <div
      v-if="hasChildren"
      class="md-tree-node__children"
      :class="{ 'is-open': isExpanded }"
      :inert="!isExpanded"
    >
      <div class="md-tree-node__clip">
        <M3TreeNode
          v-for="(child, childIndex) in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :index="childIndex"
        >
          <template v-if="$slots.label" #label="{ node: slotNode }">
            <slot name="label" :node="slotNode" />
          </template>
          <template v-if="$slots.trailing" #trailing="{ node: slotNode }">
            <slot name="trailing" :node="slotNode" />
          </template>
        </M3TreeNode>
      </div>
    </div>
  </div>
</template>

<style scoped>
.md-tree-node {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.md-tree-node__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding-inline: 4px 8px;
  border-radius: var(--md-sys-shape-corner-small);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* 行不整体缩放（文字会跟着抖），只叠一层浅浅的状态层 */
.md-tree-node__row::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-tree-node__row:hover::after {
    opacity: calc(var(--md-sys-state-hover-state-layer-opacity) * 0.5);
  }
}
.md-tree-node__row:focus-visible {
  outline: 2px solid var(--md-sys-color-secondary);
  outline-offset: -2px;
}
.md-tree-node__row:active::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-tree-node__row.is-selected {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.md-tree-node__chevron-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.md-tree-node__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: rotate var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

@media (hover: hover) {
  .md-tree-node__chevron:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-tree-node__chevron.is-open {
  rotate: 90deg;
}

.md-tree-node__checkbox,
.md-tree-node__icon,
.md-tree-node__label,
.md-tree-node__count,
.md-tree-node__trailing {
  position: relative;
  z-index: 3;
}

.md-tree-node__checkbox {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.md-tree-node__icon {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-tree-node__icon.is-selected {
  color: var(--md-sys-color-primary);
}

.md-tree-node__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
}

.md-tree-node__row.is-selected .md-tree-node__label {
  font-weight: var(--md-ref-typeface-weight-medium);
}

.md-tree-node__count {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  line-height: var(--md-sys-typescale-label-small-line-height);
  font-variant-numeric: tabular-nums;
}

.md-tree-node__trailing {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* ---------- 子树 ---------- */
.md-tree-node__children {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--md-sys-motion-duration-medium2)
    var(--md-sys-motion-easing-emphasized);
}

.md-tree-node__children.is-open {
  grid-template-rows: 1fr;
}

/* 缩进 + 引导线都用内边距实现，行本身仍然占满宽度，点击热区不会被缩窄 */
.md-tree-node__clip {
  min-height: 0;
  overflow: hidden;
  margin-inline-start: 10px;
  padding-inline-start: 10px;
  border-inline-start: 1px solid var(--md-sys-color-outline-variant);
}

.md-tree-node__row.is-disabled {
  pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .md-tree-node__children {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
  .md-tree-node__chevron {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
}
</style>
