<script setup lang="ts">
import { computed } from 'vue'
import { IconTrendingDown, IconTrendingFlat, IconTrendingUp, type IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'

type StatTone = 'default' | 'primary' | 'secondary' | 'tertiary'
type Trend = 'up' | 'down' | 'neutral'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    /** Change since the last period, already formatted (e.g. "+12.4%"). */
    delta?: string | number
    trend?: Trend
    /** Explanatory line under the value. */
    hint?: string
    icon?: IconComponent | null
    /** Tints only the icon and trend pill, not the whole card. */
    tone?: StatTone
    /** BCP 47 locale for numeric grouping. */
    locale?: string
    interactive?: boolean
    href?: string
    target?: string
    rel?: string
  }>(),
  {
    delta: undefined,
    trend: 'neutral',
    hint: undefined,
    icon: null,
    tone: 'default',
    locale: undefined,
    interactive: false,
    href: undefined,
    target: undefined,
    rel: undefined,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const trendIcon = computed<IconComponent>(() => {
  if (props.trend === 'up') return IconTrendingUp
  if (props.trend === 'down') return IconTrendingDown
  return IconTrendingFlat
})

/** 数字默认走本地化千分位；字符串原样渲染，给调用方保留格式化权。 */
const displayValue = computed(() => {
  if (typeof props.value !== 'number' || !Number.isFinite(props.value)) return props.value
  try {
    return new Intl.NumberFormat(props.locale).format(props.value)
  } catch {
    return String(props.value)
  }
})
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    class="md-stat-card"
    :class="['md-stat-card--' + tone, { 'is-interactive': interactive }]"
    :href="href"
    :target="href ? target : undefined"
    :rel="href ? rel : undefined"
    :role="interactive && !href ? 'button' : undefined"
    :tabindex="interactive && !href ? 0 : undefined"
    @click="(interactive || href) && emit('click', $event)"
  >
    <div class="md-stat-card__top">
      <span class="md-stat-card__label md-typescale-body-medium">{{ label }}</span>
      <span v-if="icon || $slots.icon" class="md-stat-card__icon">
        <slot name="icon"><M3Icon :icon="icon!" :size="20" /></slot>
      </span>
    </div>

    <div class="md-stat-card__value-row">
      <span class="md-stat-card__value md-typescale-headline-medium">{{ displayValue }}</span>
      <span v-if="delta !== undefined" class="md-stat-card__delta" :class="'is-' + trend">
        <M3Icon :icon="trendIcon" :size="16" />
        {{ delta }}
      </span>
    </div>

    <p v-if="hint" class="md-stat-card__hint md-typescale-body-small">{{ hint }}</p>

    <div v-if="$slots.chart" class="md-stat-card__chart"><slot name="chart" /></div>
    <div v-if="$slots.default" class="md-stat-card__extra"><slot /></div>
    <div v-if="$slots.footer" class="md-stat-card__footer"><slot name="footer" /></div>
  </component>
</template>

<style scoped>
.md-stat-card {
  --md-stat-tint: var(--md-sys-color-primary);

  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  transition:
    box-shadow var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard),
    transform var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
}

.md-stat-card--secondary {
  --md-stat-tint: var(--md-sys-color-secondary);
}
.md-stat-card--tertiary {
  --md-stat-tint: var(--md-sys-color-tertiary);
}

.md-stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.md-stat-card__label {
  color: var(--md-sys-color-on-surface-variant);
}

.md-stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: color-mix(in srgb, var(--md-stat-tint) 12%, transparent);
  color: var(--md-stat-tint);
}

.md-stat-card__value-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.md-stat-card__value {
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.md-stat-card__delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: var(--md-sys-typescale-label-small-weight);
  line-height: var(--md-sys-typescale-label-small-line-height);
  font-variant-numeric: tabular-nums;
}

.md-stat-card__delta.is-up {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
}

.md-stat-card__delta.is-down {
  background-color: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
}

.md-stat-card__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.md-stat-card__chart {
  margin-block-start: 4px;
}

.md-stat-card__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 4px;
}

.md-stat-card.is-interactive {
  cursor: pointer;
  box-shadow: var(--md-sys-elevation-level1);
}

@media (hover: hover) {
  .md-stat-card.is-interactive:hover {
    box-shadow: var(--md-sys-elevation-level2);
    transform: translateY(-2px);
  }
}

.md-stat-card.is-interactive:active {
  scale: 0.99;
}

@media (prefers-reduced-motion: reduce) {
  .md-stat-card.is-interactive:hover {
    transform: none;
  }

  .md-stat-card.is-interactive:active {
    scale: 1;
  }
}
</style>
