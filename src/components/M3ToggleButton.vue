<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IconComponent } from '../icons'
import M3Icon from './M3Icon.vue'
import { vRipple } from '../directives/ripple'
import { SPRINGS, useSpring } from '../composables/useSpring'

/**
 * MD3 Expressive 的独立开关按钮。
 *
 * 和 M3SegmentedButton / M3ButtonGroup 的区别：那些是「一组选项」，
 * 这个只有一枚按钮、两个状态，选中时**自己的形状也跟着变** ——
 * 未选中是胶囊（圆角 = 高度的一半），选中收成小圆角，按下再收一档。
 *
 * 形状不是用 CSS transition 做的，而是一条真实的弹簧（刚度 1400、阻尼比 0.9，
 * 取自 M3 标准动效方案里的 FastSpatial）。原因在放射状位移上：
 * 从胶囊到小圆角的变化几乎全部发生在弹道的前几帧，线性缓动看起来像「啪」地一下，
 * 弹簧则会先过冲一点再收住，才像 M3 Expressive 该有的手感。
 */
type ToggleVariant = 'filled' | 'tonal' | 'elevated' | 'outlined'
type ToggleSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** 选中态（v-model:checked）。 */
    checked: boolean
    /** 强调级别，与 M3Button 同名同义。 */
    variant?: ToggleVariant
    /** 高度 32 / 40 / 56dp。 */
    size?: ToggleSize
    /** 文字前的图标。 */
    icon?: IconComponent | null
    disabled?: boolean
    /** 没有可见文字时给读屏用的名字。 */
    ariaLabel?: string
  }>(),
  {
    variant: 'filled',
    size: 'md',
    icon: null,
    disabled: false,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{ 'update:checked': [value: boolean] }>()

/*
 * 每一档的圆角都取自 shape 令牌的真实数值：
 *   未选中 = 高度的一半（胶囊）  选中 = corner-small / medium / large
 *   按下 = corner-extra-small / small / medium
 * 早先有人把未选中写成 9999px，结果弹簧整条轨迹都挤在开头几帧，
 * 看起来就是一句「瞬间变形」。用真实值，整段位移才看得见。
 */
const SPEC = {
  sm: { height: 32, pill: 16, checked: 8, pressed: 4, glyph: 18 },
  md: { height: 40, pill: 20, checked: 12, pressed: 8, glyph: 18 },
  lg: { height: 56, pill: 28, checked: 16, pressed: 12, glyph: 24 },
} as const

const spec = computed(() => SPEC[props.size])
const glyphSize = computed(() => spec.value.glyph)

const pressed = ref(false)
const radius = ref<number>(spec.value.pill)

const targetRadius = computed<number>(() => {
  if (pressed.value) return spec.value.pressed
  return props.checked ? spec.value.checked : spec.value.pill
})

/*
 * 形状用弹簧而不是 CSS transition：M3 Expressive 的「胶囊 → 小圆角」是冲过一点再收住，
 * 线性或三次缓动做不出来。算法与 M3 的四组方案都在 useSpring 里，这里只声明目标。
 * 减少动态效果时 useSpring 会直接落位（形状仍然变了，用户不会失去反馈）。
 */
useSpring(
  () => [targetRadius.value],
  (values) => {
    radius.value = values[0] ?? targetRadius.value
  },
  SPRINGS.fastSpatial,
)

function onPointerDown(): void {
  if (props.disabled) return
  pressed.value = true
}

function onPointerUp(): void {
  pressed.value = false
}

function toggle(): void {
  if (props.disabled) return
  emit('update:checked', !props.checked)
}
</script>

<template>
  <button
    v-ripple
    type="button"
    class="md-toggle-btn"
    :class="[
      'md-toggle-btn--' + variant,
      'md-toggle-btn--' + size,
      { 'is-checked': checked, 'is-disabled': disabled },
    ]"
    :style="{ borderRadius: radius + 'px' }"
    :aria-pressed="checked"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @pointercancel="onPointerUp"
    @click="toggle"
  >
    <M3Icon v-if="icon" :icon="icon" :size="glyphSize" class="md-toggle-btn__icon" />
    <span v-if="$slots.default" class="md-toggle-btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.md-toggle-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background-color: transparent;
  color: var(--md-sys-color-primary);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* ---------- 尺寸 ---------- */
.md-toggle-btn--sm {
  height: 32px;
  padding-inline: 16px;
}
.md-toggle-btn--md {
  height: 40px;
  padding-inline: 24px;
}
.md-toggle-btn--lg {
  height: 56px;
  padding-inline: 32px;
  gap: 12px;
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

/* 状态层压在文字下面，文字始终是干净的 */
.md-toggle-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-toggle-btn:hover:not(.is-disabled)::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-toggle-btn:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.md-toggle-btn:active:not(.is-disabled)::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-toggle-btn__icon,
.md-toggle-btn__label {
  position: relative;
  z-index: 3;
}

/* ---------- 变体：未选中用的是中性容器，选中才换成强调色 ---------- */
/* 这是 M3 Expressive 容易看漏的一点：filled 变体的**未选中**容器是
   surface-container，不是 primary 的浅色 —— 选中与否必须一眼能分出来。 */
.md-toggle-btn--filled {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
}
.md-toggle-btn--filled.is-checked {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md-toggle-btn--tonal {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.md-toggle-btn--tonal.is-checked {
  background-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
}

.md-toggle-btn--elevated {
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-primary);
  box-shadow: var(--md-sys-elevation-level1);
}
.md-toggle-btn--elevated.is-checked {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
@media (hover: hover) {
  .md-toggle-btn--elevated:hover:not(.is-disabled) {
    box-shadow: var(--md-sys-elevation-level2);
  }
}

.md-toggle-btn--outlined {
  color: var(--md-sys-color-on-surface-variant);
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
}
/* outlined 选中走的是反色表面，而不是主色 —— MD3 的 outlined 变体就这么定义 */
.md-toggle-btn--outlined.is-checked {
  background-color: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
}

/* ---------- 禁用 ---------- */
.md-toggle-btn.is-disabled {
  pointer-events: none;
  cursor: not-allowed;
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  /* 弹簧已经由 JS 关掉了；这里只收一下颜色切换的时长 */
  .md-toggle-btn {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
}
</style>
