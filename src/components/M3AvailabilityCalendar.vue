<script setup lang="ts">
import M3Calendar from './M3Calendar.vue'

/**
 * 可用性日历：在月历上标出每天是否可约、价格或状态。
 *
 * 复用 M3Calendar 的网格与键盘行为，只通过 #day 插槽替换格子内容；
 * 不可用的日期交给 disabledDate，这样键盘用户也会跳过它们，
 * 而不是看起来能点、点了没反应。
 */
export interface AvailabilityDay {
  available?: boolean
  price?: number
  label?: string
}

const props = withDefaults(
  defineProps<{
    /** 选中的日期（v-model）。 */
    modelValue?: string | null
    /** 受控月份（YYYY-MM）。 */
    month?: string
    /** 日期 → 可用性。 */
    days: Record<string, AvailabilityDay>
    currency?: string
    locale?: string
    weekStartsOn?: 0 | 1
    ariaLabel?: string
  }>(),
  {
    modelValue: null,
    month: undefined,
    currency: '¥',
    locale: undefined,
    weekStartsOn: 1,
    ariaLabel: '可预约日期',
  },
)

const emit = defineEmits<{
  'update:modelValue': [date: string | null]
  'update:month': [month: string]
}>()

function isUnavailable(date: string): boolean {
  return props.days[date]?.available === false
}

function infoOf(date: string): AvailabilityDay {
  return props.days[date] ?? {}
}
</script>

<template>
  <div class="md-availability">
    <M3Calendar
      :model-value="modelValue"
      :month="month"
      :disabled-date="isUnavailable"
      :week-starts-on="weekStartsOn"
      :locale="locale"
      :aria-label="ariaLabel"
      @update:model-value="emit('update:modelValue', $event)"
      @update:month="emit('update:month', $event)"
    >
      <template #day="{ date, day, disabled }">
        <span class="md-availability__cell" :class="{ 'is-unavailable': disabled }">
          <span class="md-availability__day">{{ day }}</span>
          <span v-if="infoOf(date).price !== undefined" class="md-availability__price">
            {{ currency }}{{ infoOf(date).price }}
          </span>
          <span v-else-if="infoOf(date).label" class="md-availability__label">
            {{ infoOf(date).label }}
          </span>
        </span>
      </template>
    </M3Calendar>
  </div>
</template>

<style scoped>
.md-availability {
  display: inline-block;
  padding: 4px;
  border-radius: var(--md-sys-shape-corner-medium);
  background-color: var(--md-sys-color-surface-container-low);
}

/* 格子里要多放一行价格，所以不能是正方形；高度固定保证翻月不跳 */
.md-availability :deep(.md-calendar__day) {
  aspect-ratio: auto;
  min-height: 52px;
  border-radius: var(--md-sys-shape-corner-small);
}

.md-availability__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  line-height: 1.2;
}

.md-availability__price {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.md-availability__label {
  color: var(--md-sys-color-primary);
  font-size: 9px;
}

.md-availability :deep(.md-calendar__day.is-selected) .md-availability__price,
.md-availability :deep(.md-calendar__day.is-selected) .md-availability__label {
  color: var(--md-sys-color-on-primary);
}

.md-availability__cell.is-unavailable {
  text-decoration: line-through;
}
</style>
