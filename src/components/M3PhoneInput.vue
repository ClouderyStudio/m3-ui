<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconArrowDropDown } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Menu from './M3Menu.vue'
import M3MenuItem from './M3MenuItem.vue'
import M3FieldShell from './_M3Field.vue'
import { COUNTRIES, findCountry, flagOf, formatPhone, phoneDigits } from '../utils/countries'

/**
 * 国际电话号码：国家选择（国旗 + 拨号代码）+ 分组显示的号码。
 *
 * 对外的值统一是 E.164（+8613800138000），不把「用户看到的分组空格」混进数据里 ——
 * 存储、比较、提交都只认一种格式，展示格式随时可以变。
 * 分组只影响显示，因此切换国家不会丢字符。
 */
const props = withDefaults(
  defineProps<{
    /** E.164 或纯号码；空字符串表示未填。 */
    modelValue: string
    /** 选中的国家 ISO 码。 */
    country?: string
    label?: string
    variant?: 'filled' | 'outlined'
    disabled?: boolean
    error?: string
    hint?: string
    placeholder?: string
  }>(),
  {
    country: 'CN',
    label: '手机号',
    variant: 'filled',
    disabled: false,
    error: '',
    hint: '',
    placeholder: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:country': [iso: string]
}>()

const current = computed(() => findCountry(props.country) ?? findCountry('CN'))
const national = ref('')
const focused = ref(false)

/** 从 E.164 里剥掉当前国家的拨号代码，只留本地号码。 */
function nationalOf(value: string, dial: string): string {
  const digits = phoneDigits(value)
  const code = phoneDigits(dial)
  if (!digits) return ''
  return code && digits.startsWith(code) ? digits.slice(code.length) : digits
}

watch(
  () => [props.modelValue, props.country] as const,
  ([value, country]) => {
    const dial = findCountry(country)?.dial ?? '+86'
    national.value = nationalOf(value, dial)
  },
  { immediate: true },
)

const display = computed(() => formatPhone(national.value, current.value?.iso ?? 'CN'))

function emitValue(digits: string): void {
  const dial = phoneDigits(current.value?.dial ?? '+86')
  emit('update:modelValue', digits ? '+' + dial + digits : '')
}

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const digits = phoneDigits(input.value).slice(0, 15)
  national.value = digits
  input.value = formatPhone(digits, current.value?.iso ?? 'CN')
  emitValue(digits)
}

function pickCountry(iso: string): void {
  emit('update:country', iso)
  const dial = phoneDigits(findCountry(iso)?.dial ?? '+86')
  emit('update:modelValue', national.value ? '+' + dial + national.value : '')
}
</script>

<template>
  <M3FieldShell
    :label="label"
    :variant="variant"
    :floating="focused || national.length > 0"
    :focused="focused"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :leading-width="96"
  >
    <template #leading>
      <M3Menu :min-width="240" placement="bottom-start" :gap="6">
        <template #trigger="{ open }">
          <button
            type="button"
            class="md-phone__country"
            :disabled="disabled"
            aria-label="选择国家/地区"
            :aria-expanded="open"
          >
            <span class="md-phone__flag" aria-hidden="true">{{ flagOf(current?.iso ?? '') }}</span>
            <span class="md-phone__dial">{{ current?.dial }}</span>
            <M3Icon :icon="IconArrowDropDown" :size="18" />
          </button>
        </template>

        <M3MenuItem
          v-for="country in COUNTRIES"
          :key="country.iso"
          :label="flagOf(country.iso) + '  ' + country.name"
          :trailing-text="country.dial"
          :selected="country.iso === current?.iso"
          @click="pickCountry(country.iso)"
        />
      </M3Menu>
    </template>

    <input
      class="md-phone__input"
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      :value="display"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
    />
  </M3FieldShell>
</template>

<style scoped>
.md-phone__country {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding-inline: 4px 6px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: none;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: var(--md-sys-typescale-body-medium-size);
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-phone__country:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }
}

.md-phone__country:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-phone__flag {
  font-size: 18px;
  line-height: 1;
}

.md-phone__dial {
  font-variant-numeric: tabular-nums;
}

.md-phone__input {
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  font-variant-numeric: tabular-nums;
  caret-color: var(--md-sys-color-primary);
}

.md-phone__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.md-phone__input:disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  cursor: not-allowed;
}
</style>
