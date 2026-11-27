<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { IconComponent } from '../icons'
import M3NavigationBar from './M3NavigationBar.vue'
import M3NavigationRail from './M3NavigationRail.vue'

/**
 * 响应式导航：按视口宽度在「底部导航 / 窄侧边栏 / 宽侧边栏」之间自动切换。
 *
 * 三个断点直接取 MD3 的窗口尺寸类（compact < 600、medium 600–839、expanded ≥ 840）。
 * 切换用的是 matchMedia 而不是 resize + innerWidth：前者只在跨断点时触发一次，
 * 后者在拖动窗口时会连续触发几十次重排。
 */
export interface SuiteItem {
  value: string
  label: string
  icon: IconComponent
  activeIcon?: IconComponent | null
  badge?: string | number | null
  badgeDot?: boolean
  disabled?: boolean
}

withDefaults(
  defineProps<{
    modelValue: string
    items: SuiteItem[]
    ariaLabel?: string
  }>(),
  { ariaLabel: '主导航' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const compact = ref(false)
const expanded = ref(false)
let compactQuery: MediaQueryList | null = null
let expandedQuery: MediaQueryList | null = null

function sync(): void {
  compact.value = compactQuery?.matches ?? false
  expanded.value = expandedQuery?.matches ?? false
}

function onMediaChange(): void {
  sync()
}

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  compactQuery = window.matchMedia('(max-width: 599px)')
  expandedQuery = window.matchMedia('(min-width: 840px)')
  sync()
  compactQuery.addEventListener('change', onMediaChange)
  expandedQuery.addEventListener('change', onMediaChange)
})

onBeforeUnmount(() => {
  compactQuery?.removeEventListener('change', onMediaChange)
  expandedQuery?.removeEventListener('change', onMediaChange)
})

const layout = computed<'bar' | 'rail' | 'rail-labeled'>(() => {
  if (compact.value) return 'bar'
  return expanded.value ? 'rail-labeled' : 'rail'
})

function select(value: string): void {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="md-nav-suite" :data-layout="layout">
    <M3NavigationBar
      v-if="layout === 'bar'"
      :model-value="modelValue"
      :items="items"
      :aria-label="ariaLabel"
      @update:model-value="select"
    />

    <M3NavigationRail
      v-else
      :model-value="modelValue"
      :items="items"
      :show-labels="layout === 'rail-labeled'"
      :aria-label="ariaLabel"
      @update:model-value="select"
    >
      <template v-if="$slots.fab" #fab><slot name="fab" /></template>
      <template v-if="$slots.default" #default><slot /></template>
    </M3NavigationRail>
  </div>
</template>

<style scoped>
.md-nav-suite {
  display: flex;
}

.md-nav-suite[data-layout='bar'] {
  width: 100%;
}

.md-nav-suite[data-layout='bar'] > * {
  flex: 1;
}
</style>
