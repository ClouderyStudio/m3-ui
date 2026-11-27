<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IconComponent } from '../icons'
import { IconClose, IconNotifications } from './../icons'
import M3Icon from './M3Icon.vue'
import M3IconButton from './M3IconButton.vue'
import M3SegmentedButton from './M3SegmentedButton.vue'

/**
 * 通知中心（收件箱）：按时间分组的通知列表，可筛选未读、标记已读、逐条移除。
 *
 * 与右上角浮层的区别：浮层是「刚刚发生」的瞬时提醒，中心是「回来看」的存档，
 * 所以这里按天分组、未读用色点标记，而不是自动消失。
 */
export interface InboxNotification {
  id: string
  title: string
  body?: string
  /** ISO 时间。 */
  time: string
  read?: boolean
  icon?: IconComponent | null
  avatar?: string
  tone?: 'info' | 'success' | 'warning' | 'error'
}

const props = withDefaults(
  defineProps<{
    /** 通知列表（v-model）。 */
    modelValue: InboxNotification[]
    title?: string
    /** 显示全部 / 未读筛选。 */
    filter?: boolean
    dismissible?: boolean
    maxHeight?: string
    emptyText?: string
    readAllLabel?: string
  }>(),
  {
    title: '通知',
    filter: true,
    dismissible: true,
    maxHeight: '420px',
    emptyText: '还没有通知',
    readAllLabel: '全部已读',
  },
)

const emit = defineEmits<{
  'update:modelValue': [items: InboxNotification[]]
  open: [item: InboxNotification]
  dismiss: [item: InboxNotification]
}>()

const mode = ref<'all' | 'unread'>('all')

const filtered = computed(() =>
  mode.value === 'unread' ? props.modelValue.filter((item) => !item.read) : props.modelValue,
)

const unreadCount = computed(() => props.modelValue.filter((item) => !item.read).length)

function dayLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const diff = Math.round((startOf(today) - startOf(date)) / 86_400_000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  return date.getFullYear() + ' 年 ' + (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日'
}

function timeLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
}

const groups = computed(() => {
  const map = new Map<string, InboxNotification[]>()
  for (const item of filtered.value) {
    const key = dayLabel(item.time)
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return [...map.entries()]
})

function markAllRead(): void {
  emit('update:modelValue', props.modelValue.map((item) => ({ ...item, read: true })))
}

function open(item: InboxNotification): void {
  emit('open', item)
  if (!item.read) {
    emit('update:modelValue', props.modelValue.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)))
  }
}

function dismiss(event: MouseEvent, item: InboxNotification): void {
  event.stopPropagation()
  emit('update:modelValue', props.modelValue.filter((entry) => entry.id !== item.id))
  emit('dismiss', item)
}

const modeOptions = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
]
</script>

<template>
  <section class="md-inbox" :aria-label="title">
    <header class="md-inbox__header">
      <h2 class="md-inbox__title">
        {{ title }}
        <span v-if="unreadCount" class="md-inbox__unread">{{ unreadCount }}</span>
      </h2>
      <button v-if="unreadCount" type="button" class="md-inbox__read-all" @click="markAllRead">
        {{ readAllLabel }}
      </button>
    </header>

    <div v-if="filter" class="md-inbox__filter">
      <M3SegmentedButton v-model="mode" :options="modeOptions" size="sm" aria-label="筛选" />
    </div>

    <div class="md-inbox__list" :style="{ maxHeight }">
      <template v-for="[day, list] in groups" :key="day">
        <p class="md-inbox__day">{{ day }}</p>

        <button
          v-for="item in list"
          :key="item.id"
          type="button"
          class="md-inbox__item"
          :class="{ 'is-unread': !item.read, ['is-' + (item.tone ?? 'info')]: true }"
          @click="open(item)"
        >
          <img v-if="item.avatar" class="md-inbox__avatar" :src="item.avatar" alt="" />
          <span v-else class="md-inbox__icon">
            <M3Icon :icon="item.icon ?? IconNotifications" :size="20" />
          </span>

          <span class="md-inbox__body">
            <span class="md-inbox__item-title">{{ item.title }}</span>
            <span v-if="item.body" class="md-inbox__text">{{ item.body }}</span>
          </span>

          <span class="md-inbox__time">{{ timeLabel(item.time) }}</span>
          <M3IconButton
            v-if="dismissible"
            :icon="IconClose"
            label="移除通知"
            size="sm"
            variant="standard"
            @click="dismiss($event, item)"
          />
        </button>
      </template>

      <p v-if="filtered.length === 0" class="md-inbox__empty">{{ emptyText }}</p>
    </div>
  </section>
</template>

<style scoped>
.md-inbox {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface);
  overflow: hidden;
  font-family: var(--md-ref-typeface-plain);
  color: var(--md-sys-color-on-surface);
}

.md-inbox__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 8px;
}

.md-inbox__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.md-inbox__unread {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 6px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.md-inbox__read-all {
  margin-inline-start: auto;
  padding: 4px 10px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-primary);
  font: inherit;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
}

.md-inbox__filter {
  padding: 0 16px 8px;
}

.md-inbox__list {
  overflow-y: auto;
  padding-block-end: 8px;
}

.md-inbox__day {
  margin: 8px 0 4px;
  padding-inline: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
}

.md-inbox__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 8px 10px 16px;
  border: none;
  border-radius: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-inbox__item:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  }
}

.md-inbox__item.is-unread {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
}

.md-inbox__avatar,
.md-inbox__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  object-fit: cover;
  color: var(--md-sys-color-primary);
}

.md-inbox__item.is-warning .md-inbox__icon {
  color: var(--md-sys-color-tertiary);
}

.md-inbox__item.is-error .md-inbox__icon {
  color: var(--md-sys-color-error);
}

.md-inbox__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.md-inbox__item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-ref-typeface-weight-medium);
}

.md-inbox__text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-inbox__time {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-variant-numeric: tabular-nums;
}

.md-inbox__empty {
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
}
</style>
