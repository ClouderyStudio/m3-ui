<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { IconCheck, IconRemove } from '../icons'
import M3Icon from './M3Icon.vue'

type CheckboxColor = 'primary' | 'secondary' | 'tertiary' | 'error'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    /** 部分选中的父级复选框（例如「全选」）。 */
    indeterminate?: boolean
    label?: string
    disabled?: boolean
    /** 选中态的色角色；M3 只定义 primary，其余是库扩展。 */
    color?: CheckboxColor
    /** 没有可见标签时给读屏用的名字。 */
    ariaLabel?: string
    name?: string
    value?: string
  }>(),
  {
    indeterminate: false,
    label: undefined,
    disabled: false,
    color: 'primary',
    ariaLabel: undefined,
    name: undefined,
    value: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const inputEl = ref<HTMLInputElement | null>(null)
const checked = computed(() => props.modelValue || props.indeterminate)

function syncIndeterminate(): void {
  if (inputEl.value) inputEl.value.indeterminate = props.indeterminate
}

onMounted(syncIndeterminate)
watch(() => props.indeterminate, syncIndeterminate)

function onChange(): void {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label
    class="md-checkbox"
    :class="['md-checkbox--' + color, { 'is-checked': checked, 'is-disabled': disabled }]"
  >
    <span class="md-checkbox__control">
      <input
        ref="inputEl"
        class="md-checkbox__input"
        type="checkbox"
        :name="name"
        :value="value"
        :checked="modelValue"
        :disabled="disabled"
        :aria-label="ariaLabel ?? label"
        :aria-checked="indeterminate ? 'mixed' : undefined"
        @change="onChange"
      />

      <span class="md-checkbox__layer" aria-hidden="true" />
      <span class="md-checkbox__ring" aria-hidden="true" />

      <span class="md-checkbox__box" aria-hidden="true">
        <M3Icon
          :icon="indeterminate ? IconRemove : IconCheck"
          :size="18"
          class="md-checkbox__mark"
        />
      </span>
    </span>

    <span v-if="label || $slots.default" class="md-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.md-checkbox {
  --md-checkbox-tint: var(--md-sys-color-primary);
  --md-checkbox-on: var(--md-sys-color-on-primary);

  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  cursor: pointer;
  user-select: none;
}

.md-checkbox--secondary {
  --md-checkbox-tint: var(--md-sys-color-secondary);
  --md-checkbox-on: var(--md-sys-color-on-secondary);
}
.md-checkbox--tertiary {
  --md-checkbox-tint: var(--md-sys-color-tertiary);
  --md-checkbox-on: var(--md-sys-color-on-tertiary);
}
.md-checkbox--error {
  --md-checkbox-tint: var(--md-sys-color-error);
  --md-checkbox-on: var(--md-sys-color-on-error);
}

.md-checkbox__control {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/*
 * 原生 input 留在原地、只做透明处理。
 *
 * 不用 sr-only 的 clip 方案：绝对定位到远处的 input 会让浏览器的
 * 「滚动到焦点」算法一路找到某个 overflow:hidden 祖先，点一下整页就跳走。
 * 这里 input 恰好覆盖 18px 的盒子，点击盒子就是点击 input。
 */
.md-checkbox__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 4;
}

/* 40dp 的圆形状态层，向外扩 11dp，不占布局 */
.md-checkbox__layer,
.md-checkbox__ring {
  position: absolute;
  inset: -11px;
  border-radius: var(--md-sys-shape-corner-full);
  pointer-events: none;
}

.md-checkbox__layer {
  background-color: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-checkbox.is-checked .md-checkbox__layer {
  background-color: var(--md-checkbox-tint);
}

@media (hover: hover) {
  .md-checkbox:hover .md-checkbox__layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-checkbox:active .md-checkbox__layer {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-checkbox__ring {
  border: 2px solid var(--md-sys-color-secondary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.md-checkbox__input:focus-visible ~ .md-checkbox__ring {
  opacity: 1;
}

.md-checkbox__box {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid var(--md-sys-color-on-surface-variant);
  border-radius: 2px;
  background-color: transparent;
  color: transparent;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

@media (hover: hover) {
  .md-checkbox:hover .md-checkbox__box {
    border-color: var(--md-sys-color-on-surface);
  }
}

.md-checkbox.is-checked .md-checkbox__box {
  border-color: var(--md-checkbox-tint);
  background-color: var(--md-checkbox-tint);
  color: var(--md-checkbox-on);
}

.md-checkbox__mark {
  /* 勾/横杠从 0.6 弹到 1；短促的动效让「选中了」这个离散变化被看见 */
  animation: md-pop-in var(--md-sys-motion-duration-short4)
    var(--md-sys-motion-easing-emphasized-decelerate) both;
}

.md-checkbox:not(.is-checked) .md-checkbox__mark {
  animation: none;
}

.md-checkbox__label {
  min-width: 0;
}

.md-checkbox.is-disabled {
  pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-checkbox.is-disabled .md-checkbox__box {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}

.md-checkbox.is-disabled.is-checked .md-checkbox__box {
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  color: var(--md-sys-color-surface);
}

@media (prefers-reduced-motion: reduce) {
  .md-checkbox__mark {
    animation: md-fade-in var(--md-sys-motion-duration-short3) linear both;
  }
}
</style>
