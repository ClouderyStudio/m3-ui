<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconChevronRight } from '../icons'
import M3Icon from './M3Icon.vue'
import M3JsonNode from './M3JsonNode.vue'

/**
 * JSON 树的一行（递归自身）。
 *
 * 折叠状态留在每个节点内部，而不是由父级统一维护一棵 expanded 集合 ——
 * JSON 的键 seldom 稳定（对象被替换后 id 就全变了），按节点自己记更省事，
 * 也允许「同一个对象出现在两个位置」各自展开。
 */
const props = withDefaults(
  defineProps<{
    name?: string
    value: unknown
    depth?: number
    /** 初始展开到第几层。 */
    defaultExpandDepth?: number
    isLast?: boolean
  }>(),
  { name: undefined, depth: 0, defaultExpandDepth: 2, isLast: true },
)

const kind = computed(() => {
  const value = props.value
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
})

const isBranch = computed(() => kind.value === 'object' || kind.value === 'array')
const entries = computed<[string, unknown][]>(() => {
  if (kind.value === 'array') return (props.value as unknown[]).map((item, index) => [String(index), item])
  if (kind.value === 'object' && props.value && typeof props.value === 'object') {
    return Object.entries(props.value as Record<string, unknown>)
  }
  return []
})

const expanded = ref(props.depth < props.defaultExpandDepth)

const summary = computed(() => {
  if (kind.value === 'array') {
    const size = (props.value as unknown[]).length
    return '[ ' + size + ' 项 ]'
  }
  if (kind.value === 'object') {
    const size = Object.keys(props.value as Record<string, unknown>).length
    return '{ ' + size + ' 个键 }'
  }
  return ''
})

const primitive = computed(() => {
  if (kind.value === 'string') return JSON.stringify(props.value)
  if (kind.value === 'null') return 'null'
  if (kind.value === 'undefined') return 'undefined'
  return String(props.value)
})

function toggle(): void {
  if (!isBranch.value) return
  expanded.value = !expanded.value
}
</script>

<template>
  <li class="md-json-node" :class="'md-json-node--' + kind">
    <div class="md-json-node__row" :class="{ 'is-branch': isBranch }" @click="toggle">
      <M3Icon
        v-if="isBranch"
        :icon="IconChevronRight"
        :size="16"
        class="md-json-node__chevron"
        :class="{ 'is-open': expanded }"
      />
      <span v-else class="md-json-node__spacer" aria-hidden="true" />

      <span v-if="name !== undefined" class="md-json-node__key">{{ name }}</span>
      <span v-if="name !== undefined" class="md-json-node__colon">:</span>

      <span v-if="isBranch" class="md-json-node__summary">{{ summary }}</span>
      <span v-else class="md-json-node__value">{{ primitive }}</span>

      <span v-if="!isLast" class="md-json-node__comma">,</span>
    </div>

    <ul v-if="isBranch && expanded" class="md-json-node__children">
      <M3JsonNode
        v-for="([childName, childValue], index) in entries"
        :key="childName + index"
        :name="kind === 'array' ? undefined : childName"
        :value="childValue"
        :depth="depth + 1"
        :default-expand-depth="defaultExpandDepth"
        :is-last="index === entries.length - 1"
      />
    </ul>
  </li>
</template>

<style scoped>
.md-json-node {
  list-style: none;
}

.md-json-node__row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-height: 22px;
  padding-inline: 4px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  font-family: var(--md-ref-typeface-mono);
  font-size: 12px;
  line-height: 22px;
  white-space: pre;
}

.md-json-node__row.is-branch {
  cursor: pointer;
}

@media (hover: hover) {
  .md-json-node__row.is-branch:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent);
  }
}

.md-json-node__chevron {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  transition: rotate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

.md-json-node__chevron.is-open {
  rotate: 90deg;
}

.md-json-node__spacer {
  width: 16px;
  flex-shrink: 0;
}

.md-json-node__key {
  color: var(--md-sys-color-primary);
}

.md-json-node__colon,
.md-json-node__comma,
.md-json-node__spacer {
  color: var(--md-sys-color-on-surface-variant);
}

.md-json-node__summary {
  color: var(--md-sys-color-on-surface-variant);
}

.md-json-node--string .md-json-node__value {
  color: var(--md-sys-color-tertiary);
}

.md-json-node--number .md-json-node__value {
  color: var(--md-sys-color-primary);
}

.md-json-node--boolean .md-json-node__value {
  color: var(--md-sys-color-secondary);
}

.md-json-node--null .md-json-node__value,
.md-json-node--undefined .md-json-node__value {
  color: var(--md-sys-color-outline);
  font-style: italic;
}

.md-json-node__children {
  margin: 0;
  padding-inline-start: 16px;
  border-inline-start: 1px solid var(--md-sys-color-outline-variant);
}
</style>
