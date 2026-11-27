<script setup lang="ts">
import { computed, provide, ref, type Ref } from 'vue'
import type { IconComponent } from '../icons'
import M3TreeNode from './_M3TreeNode.vue'

/**
 * 树形列表：展开/收起、单选、可选的级联勾选。
 *
 * 键盘导航没交给每行各自处理，而是由根节点做事件委托：
 * 树的「上一项/下一项」本来就是**可见行**的顺序，只有根知道整棵树的排版结果。
 * 每行各自找邻居的话，要么递归着把上下文传下去，要么写一堆父子关系判断。
 */
export interface TreeNode {
  id: string | number
  label: string
  icon?: IconComponent | null
  children?: TreeNode[]
  disabled?: boolean
  /** 业务方自己的附加数据，组件不读。 */
  [key: string]: unknown
}

/** 递归行组件通过 inject 拿到的上下文。 */
export interface TreeContext {
  selected: Ref<string | number | null>
  checked: Ref<Set<string | number>>
  expanded: Ref<Set<string | number>>
  focusedId: Ref<string | number | null>
  checkable: Ref<boolean>
  expandLabel: string
  collapseLabel: string
  selectNode: (node: TreeNode) => void
  toggleExpand: (id: string | number) => void
  toggleCheck: (node: TreeNode) => void
  leafIds: (node: TreeNode) => (string | number)[]
}

const props = withDefaults(
  defineProps<{
    nodes: TreeNode[]
    /** 选中项（v-model:selected），null 表示未选。 */
    selected?: string | number | null
    /** 勾选项（v-model:checked），存的是叶子 id。 */
    checked?: (string | number)[]
    /** 显示复选框，并按叶子级联。 */
    checkable?: boolean
    /** 初始展开：'all' / 'none' / 一组 id。 */
    defaultExpanded?: (string | number)[] | 'all' | 'none'
    /** 空状态文案。 */
    emptyText?: string
    expandLabel?: string
    collapseLabel?: string
  }>(),
  {
    selected: null,
    checked: () => [],
    checkable: false,
    defaultExpanded: 'none',
    emptyText: '暂无内容',
    expandLabel: '展开',
    collapseLabel: '收起',
  },
)

defineSlots<{
  /** 行内标签的自定义渲染。 */
  label?: (props: { node: TreeNode }) => unknown
  /** 行尾的附加内容，例如操作按钮。 */
  trailing?: (props: { node: TreeNode }) => unknown
}>()

const emit = defineEmits<{
  'update:selected': [id: string | number | null]
  'update:checked': [ids: (string | number)[]]
  'node-click': [node: TreeNode]
}>()

const rootEl = ref<HTMLElement | null>(null)

function subtreeIds(node: TreeNode): (string | number)[] {
  return [node.id, ...(node.children ?? []).flatMap(subtreeIds)]
}

function leafIds(node: TreeNode): (string | number)[] {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(leafIds)
}

function allIds(nodes: TreeNode[]): (string | number)[] {
  return nodes.flatMap(subtreeIds)
}

function initialExpanded(): Set<string | number> {
  if (props.defaultExpanded === 'all') return new Set(allIds(props.nodes))
  if (props.defaultExpanded === 'none') return new Set()
  return new Set(props.defaultExpanded)
}

const expanded = ref<Set<string | number>>(initialExpanded())
const focusedId = ref<string | number | null>(null)

const selectedRef = computed(() => props.selected ?? null)
const checkedSet = computed(() => new Set(props.checked))

function selectNode(node: TreeNode): void {
  if (node.disabled) return
  emit('update:selected', selectedRef.value === node.id ? null : node.id)
  emit('node-click', node)
}

function toggleExpand(id: string | number): void {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function toggleCheck(node: TreeNode): void {
  if (node.disabled) return
  const leaves = leafIds(node)
  const allChecked = leaves.every((id) => checkedSet.value.has(id))
  const next = new Set(props.checked)
  if (allChecked) subtreeIds(node).forEach((id) => next.delete(id))
  else leaves.forEach((id) => next.add(id))
  emit('update:checked', [...next])
}

provide<TreeContext>('m3-tree', {
  selected: selectedRef,
  checked: checkedSet,
  expanded,
  focusedId,
  checkable: computed(() => props.checkable),
  expandLabel: props.expandLabel,
  collapseLabel: props.collapseLabel,
  selectNode,
  toggleExpand,
  toggleCheck,
  leafIds,
})

/* ---------- 键盘导航（事件委托） ---------- */

/** 可见行：折叠的子树虽然还在 DOM 里（为了高度动画），但带 inert，不算可见。 */
function visibleRows(): HTMLElement[] {
  const root = rootEl.value
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>('[data-tree-row]')).filter(
    (row) => !row.closest('[inert]'),
  )
}

function focusRow(row: HTMLElement | undefined): void {
  if (!row) return
  focusedId.value = row.dataset.treeRow ?? null
  row.focus({ preventScroll: false })
}

function nodeFor(id: string | number): TreeNode | undefined {
  function walk(nodes: TreeNode[]): TreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = walk(node.children ?? [])
      if (found) return found
    }
    return undefined
  }
  return walk(props.nodes)
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  const row = target?.closest<HTMLElement>('[data-tree-row]')
  if (!row) return

  const id = row.dataset.treeRow ?? ''
  const node = nodeFor(id) ?? nodeFor(Number(id))
  if (!node) return

  const rows = visibleRows()
  const index = rows.indexOf(row)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusRow(rows[index + 1])
      return
    case 'ArrowUp':
      event.preventDefault()
      focusRow(rows[index - 1])
      return
    case 'Home':
      event.preventDefault()
      focusRow(rows[0])
      return
    case 'End':
      event.preventDefault()
      focusRow(rows[rows.length - 1])
      return
    case 'ArrowRight': {
      event.preventDefault()
      const hasChildren = Boolean(node.children?.length)
      if (!hasChildren) return
      if (!expanded.value.has(node.id)) {
        toggleExpand(node.id)
        return
      }
      // 已展开：把焦点交给第一个子行
      focusRow(rows[index + 1])
      return
    }
    case 'ArrowLeft': {
      event.preventDefault()
      if (node.children?.length && expanded.value.has(node.id)) {
        toggleExpand(node.id)
        return
      }
      // 找上一行里深度更小的那个，就是父节点
      for (let cursor = index - 1; cursor >= 0; cursor--) {
        const candidate = rows[cursor]
        if (Number(candidate?.dataset.treeDepth ?? 0) < Number(row.dataset.treeDepth ?? 0)) {
          focusRow(candidate)
          return
        }
      }
      return
    }
    case 'Enter':
      event.preventDefault()
      selectNode(node)
      return
    case ' ':
      event.preventDefault()
      if (props.checkable) toggleCheck(node)
      else selectNode(node)
      return
  }
}

function expandAll(): void {
  expanded.value = new Set(allIds(props.nodes))
}

function collapseAll(): void {
  expanded.value = new Set()
}

defineExpose({ expandAll, collapseAll, expanded })
</script>

<template>
  <div
    ref="rootEl"
    class="md-tree"
    role="tree"
    @keydown="onKeydown"
  >
    <template v-if="nodes.length">
      <M3TreeNode
        v-for="(node, index) in nodes"
        :key="node.id"
        :node="node"
        :depth="0"
        :index="index"
      >
        <template v-if="$slots.label" #label="{ node: slotNode }">
          <slot name="label" :node="slotNode" />
        </template>
        <template v-if="$slots.trailing" #trailing="{ node: slotNode }">
          <slot name="trailing" :node="slotNode" />
        </template>
      </M3TreeNode>
    </template>

    <p v-else class="md-tree__empty">{{ emptyText }}</p>
  </div>
</template>

<style scoped>
.md-tree {
  display: flex;
  flex-direction: column;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-tree__empty {
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
</style>
