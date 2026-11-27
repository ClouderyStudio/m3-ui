<script setup lang="ts">
import { computed } from 'vue'
import M3Select from './M3Select.vue'

/**
 * 时区选择：Intl 里能拿到的全部 IANA 时区，带当前偏移量。
 *
 * 偏移量不是常量：夏令时会让同一个时区在一年里出现两个值。
 * 这里按「现在」算一次，不随季节自动刷新 —— 选时区的场景不需要它每分钟变化。
 * Intl.supportedValuesOf 在旧浏览器上可能缺失，缺失时退回一份常用清单。
 */
const FALLBACK_ZONES = [
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
]

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    variant?: 'filled' | 'outlined'
    disabled?: boolean
    error?: string
    hint?: string
    /** 下拉里显示 UTC 偏移。 */
    showOffset?: boolean
  }>(),
  {
    label: '时区',
    variant: 'filled',
    disabled: false,
    error: '',
    hint: '',
    showOffset: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [zone: string] }>()

interface ZoneOption {
  value: string
  label: string
  offset: number
}

function offsetMinutes(zone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    })
    const name = formatter.formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value ?? ''
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name)
    if (!match) return 0
    const sign = match[1] === '-' ? -1 : 1
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
  } catch {
    return 0
  }
}

function prettyOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  return 'UTC' + sign + String(Math.floor(absolute / 60)).padStart(2, '0') + ':' + String(absolute % 60).padStart(2, '0')
}

const zones = computed<ZoneOption[]>(() => {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf
  const list = typeof supported === 'function' ? supported('timeZone') : FALLBACK_ZONES
  return list
    .map((zone) => {
      const offset = offsetMinutes(zone)
      return {
        value: zone,
        offset,
        label: props.showOffset ? zone.replace(/_/g, ' ') + ' （' + prettyOffset(offset) + '）' : zone,
      }
    })
    .sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value))
})

const options = computed(() => zones.value.map(({ value, label }) => ({ value, label })))
</script>

<template>
  <M3Select
    :model-value="modelValue"
    :label="label"
    :options="options"
    :variant="variant"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
