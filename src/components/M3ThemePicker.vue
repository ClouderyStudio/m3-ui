<script setup lang="ts">
import { computed } from 'vue'
import { IconAdd, IconCheck } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Button from './M3Button.vue'
import M3SegmentedButton from './M3SegmentedButton.vue'
import { useTheme, type ThemeMode } from '../composables/useTheme'
import { hexToOklch } from '../utils/color'

/**
 * 主题与配色选择器。
 *
 * 它改的是模块单例（useTheme），不通过 props/v-model 传递：
 * 外观属于整页，而不是属于这张卡片。多个地方（顶栏、设置页）放同一个组件也能同步。
 *
 * 配色由种子色现算（见 utils/color.ts），所以「自定义」不是摆设 ——
 * 挑任意颜色都会得到一整套协调的 49 个 color role，而不是只换主色。
 */
withDefaults(
  defineProps<{
    title?: string
    /** 显示浅色 / 深色 / 跟随系统的切换。 */
    showMode?: boolean
    /** 允许自定义种子色。 */
    allowCustom?: boolean
    /** 底部说明文字。 */
    hint?: string
  }>(),
  {
    title: '主题配色',
    showMode: true,
    allowCustom: true,
    hint: '配色只覆盖 --md-sys-color-*，形状、字阶与动效保持不变。',
  },
)

const { mode, seed, presets, setMode, setSeed, reset } = useTheme()

const modeOptions = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
]

function isPreset(value: string): boolean {
  return presets.some((preset) => preset.seed.toLowerCase() === value.toLowerCase())
}

const customActive = computed(() => !isPreset(seed.value))

/** 亮色种子上的对勾要用深色，否则白对勾在白圆点上等于没有。 */
function checkColor(value: string): string {
  const oklch = hexToOklch(value)
  return oklch && oklch.l > 0.7 ? '#1c1c1c' : '#ffffff'
}

function onMode(value: string): void {
  setMode(value as ThemeMode)
}

function onCustom(event: Event): void {
  setSeed((event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="md-theme-picker" :aria-label="title">
    <header class="md-theme-picker__header">
      <h3 class="md-theme-picker__title">{{ title }}</h3>
      <M3Button variant="text" size="sm" @click="reset">恢复默认</M3Button>
    </header>

    <div v-if="showMode" class="md-theme-picker__row">
      <span class="md-theme-picker__label">外观</span>
      <M3SegmentedButton
        :model-value="mode"
        :options="modeOptions"
        size="sm"
        aria-label="外观"
        @update:model-value="onMode"
      />
    </div>

    <div class="md-theme-picker__row">
      <span class="md-theme-picker__label">主色</span>
      <div class="md-theme-picker__swatches" role="group" aria-label="主色">
        <button
          v-for="preset in presets"
          :key="preset.seed"
          type="button"
          class="md-theme-picker__swatch"
          :class="{ 'is-selected': preset.seed.toLowerCase() === seed.toLowerCase() }"
          :style="{ '--swatch': preset.seed, '--swatch-check': checkColor(preset.seed) }"
          :aria-label="preset.name"
          :aria-pressed="preset.seed.toLowerCase() === seed.toLowerCase()"
          :title="preset.name + ' · ' + preset.seed"
          @click="setSeed(preset.seed)"
        >
          <M3Icon
            v-if="preset.seed.toLowerCase() === seed.toLowerCase()"
            :icon="IconCheck"
            :size="18"
          />
        </button>

        <label
          v-if="allowCustom"
          class="md-theme-picker__swatch md-theme-picker__swatch--custom"
          :class="{ 'is-selected': customActive }"
          :style="{ '--swatch': 'var(--md-sys-color-surface-container-highest)', '--swatch-check': 'var(--md-sys-color-on-surface)' }"
          title="自定义主色"
        >
          <input
            class="md-theme-picker__color-input"
            type="color"
            :value="seed"
            aria-label="自定义主色"
            @input="onCustom"
          />
          <M3Icon v-if="customActive" :icon="IconCheck" :size="18" />
          <M3Icon v-else :icon="IconAdd" :size="18" class="md-theme-picker__eyedropper" />
        </label>
      </div>
    </div>

    <p v-if="hint" class="md-theme-picker__hint">{{ hint }}</p>
    <p class="md-theme-picker__seed">
      种子色 <code>{{ seed }}</code>
    </p>
  </section>
</template>

<style scoped>
.md-theme-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-ref-typeface-plain);
}

.md-theme-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-block-end: -4px;
}

.md-theme-picker__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.md-theme-picker__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.md-theme-picker__label {
  flex: 0 0 48px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
}

.md-theme-picker__swatches {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/*
 * 色板是「内容」而不是「控件」：没有边框，只有一圈 2dp 的选中环。
 * 环用 outline + offset 而不是 border —— border 会把 36dp 的圆撑到 40dp，
 * 选中时整行会轻微跳动。
 */
.md-theme-picker__swatch {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--swatch);
  color: var(--swatch-check);
  cursor: pointer;
  transition:
    outline-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

@media (hover: hover) {
  .md-theme-picker__swatch:hover {
    scale: 1.06;
  }
}

.md-theme-picker__swatch:active {
  scale: 0.96;
}

.md-theme-picker__swatch.is-selected {
  outline-color: var(--md-sys-color-primary);
}

/* 自定义：彩色圆点上叠一个取色图标；原生 color input 透明铺满，点哪都能开系统取色器 */
/*
 * 自定义色板不镜像当前种子色：镜像之后它常常和某个预置色板长得一模一样，
 * 用户分不清「这是预设」还是「这是我刚调的」。改成中性底 + 虚线环的「新颜色」入口。
 */
.md-theme-picker__swatch--custom {
  cursor: pointer;
  outline: 2px dashed var(--md-sys-color-outline);
  outline-offset: 0;
}

.md-theme-picker__swatch--custom.is-selected {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.md-theme-picker__swatch--custom:hover {
  outline-color: var(--md-sys-color-on-surface-variant);
}

.md-theme-picker__color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}

.md-theme-picker__eyedropper {
  opacity: 0.85;
}

.md-theme-picker__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
}

.md-theme-picker__seed {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}

.md-theme-picker__seed code {
  font-family: var(--md-ref-typeface-mono);
  font-size: 12px;
  color: var(--md-sys-color-on-surface);
}

@media (prefers-reduced-motion: reduce) {
  .md-theme-picker__swatch:hover,
  .md-theme-picker__swatch:active {
    scale: 1;
  }
}
</style>
