<script setup lang="ts">
import { computed } from 'vue'
import M3Select from './M3Select.vue'
import { COUNTRIES, findCountry, flagOf, type Country } from '../utils/countries'

/**
 * 国家/地区选择：M3Select + 国旗 + 拨号代码。
 *
 * 国旗用 Unicode 区域指示符拼出来，不引入任何图片或图标包 ——
 * 一面国旗对应两个码点，比维护一套 SVG 便宜得多，缩放也不会糊。
 */
const props = withDefaults(
  defineProps<{
    /** 选中的 ISO 3166-1 alpha-2。 */
    modelValue: string
    label?: string
    variant?: 'filled' | 'outlined'
    disabled?: boolean
    error?: string
    hint?: string
    /** 自定义清单（默认内置 60 个常用国家）。 */
    countries?: Country[]
    /** 标签里带拨号代码。 */
    showDial?: boolean
    placeholder?: string
  }>(),
  {
    label: '国家/地区',
    variant: 'filled',
    disabled: false,
    error: '',
    hint: '',
    countries: undefined,
    showDial: true,
    placeholder: '',
  },
)

const emit = defineEmits<{ 'update:modelValue': [iso: string]; change: [country: Country | undefined] }>()

const list = computed(() => props.countries ?? COUNTRIES)

const options = computed(() =>
  list.value.map((country) => ({
    value: country.iso,
    label: [flagOf(country.iso), country.name, props.showDial ? country.dial : '']
      .filter(Boolean)
      .join(' '),
  })),
)

const selected = computed(() => findCountry(props.modelValue))

function onSelect(iso: string): void {
  emit('update:modelValue', iso)
  emit('change', findCountry(iso))
}

defineExpose({ selected })
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
    :placeholder="placeholder"
    @update:model-value="onSelect"
  />
</template>
