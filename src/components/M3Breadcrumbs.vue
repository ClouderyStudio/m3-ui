<script setup lang="ts">
import { computed } from 'vue'
import { IconChevronRight, IconMoreHoriz, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import M3Menu from './M3Menu.vue'
import M3MenuItem from './M3MenuItem.vue'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: IconComponent | null
}

const props = withDefaults(
  defineProps<{
    items: BreadcrumbItem[]
    /**
     * Maximum visible crumbs including the ellipsis. Defaults to 4:
     * first / … / parent / current.
     */
    max?: number
    separator?: 'chevron' | 'slash' | 'dot'
    ariaLabel?: string
  }>(),
  { max: 4, separator: 'chevron', ariaLabel: '面包屑导航' },
)

type Crumb = { kind: 'item'; item: BreadcrumbItem } | { kind: 'gap'; hidden: BreadcrumbItem[] }

const crumbs = computed<Crumb[]>(() => {
  const list = props.items
  const limit = Math.max(2, props.max)
  if (list.length <= limit) return list.map((item) => ({ kind: 'item' as const, item }))

  const tailCount = Math.max(1, limit - 2)
  const hidden = list.slice(1, list.length - tailCount)
  return [
    { kind: 'item', item: list[0]! },
    { kind: 'gap', hidden },
    ...list.slice(list.length - tailCount).map((item) => ({ kind: 'item' as const, item })),
  ]
})

const isLast = (crumb: Crumb) => {
  const index = crumbs.value.indexOf(crumb)
  return index === crumbs.value.length - 1
}
</script>

<template>
  <nav class="md-breadcrumbs" :aria-label="ariaLabel">
    <ol class="md-breadcrumbs__list">
      <li v-for="(crumb, index) in crumbs" :key="index" class="md-breadcrumbs__li">
        <span v-if="index > 0" class="md-breadcrumbs__separator" aria-hidden="true">
          <M3Icon v-if="separator === 'chevron'" :icon="IconChevronRight" :size="16" />
          <template v-else-if="separator === 'slash'">/</template>
          <template v-else>•</template>
        </span>

        <template v-if="crumb.kind === 'gap'">
          <M3Menu placement="bottom-start" :min-width="200">
            <template #trigger="{ open }">
              <M3IconButton
                :icon="IconMoreHoriz"
                label="显示更多层级"
                size="sm"
                variant="standard"
                :aria-expanded="open"
              />
            </template>
            <M3MenuItem
              v-for="hiddenItem in crumb.hidden"
              :key="hiddenItem.label"
              :headline="hiddenItem.label"
              :href="hiddenItem.href"
              :icon="hiddenItem.icon"
            />
          </M3Menu>
        </template>

        <a
          v-else-if="crumb.item.href && !isLast(crumb)"
          class="md-breadcrumbs__link md-typescale-label-large"
          :href="crumb.item.href"
        >
          <M3Icon v-if="crumb.item.icon" :icon="crumb.item.icon" :size="16" />
          {{ crumb.item.label }}
        </a>

        <span
          v-else
          class="md-breadcrumbs__current md-typescale-label-large"
          :aria-current="isLast(crumb) ? 'page' : undefined"
        >
          <M3Icon v-if="crumb.item.icon" :icon="crumb.item.icon" :size="16" />
          {{ crumb.item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.md-breadcrumbs {
  min-width: 0;
}

.md-breadcrumbs__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-breadcrumbs__li {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.md-breadcrumbs__separator {
  display: inline-flex;
  align-items: center;
  color: var(--md-sys-color-outline);
  font-size: 12px;
  user-select: none;
}

.md-breadcrumbs__link,
.md-breadcrumbs__current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 220px;
  padding: 4px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-breadcrumbs__link {
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
}

@media (hover: hover) {
  .md-breadcrumbs__link:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
    color: var(--md-sys-color-on-surface);
  }
}

.md-breadcrumbs__current {
  color: var(--md-sys-color-on-surface);
  font-weight: 500;
}

.md-breadcrumbs :deep(.md-icon-btn) {
  margin-inline: 2px;
}
</style>
