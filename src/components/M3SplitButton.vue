<script setup lang="ts">
import { computed } from 'vue'
import type { IconComponent } from '../icons'
import { IconArrowDropDown } from '../icons'
import M3Icon from './M3Icon.vue'
import M3Menu from './M3Menu.vue'
import M3MenuItem from './M3MenuItem.vue'
import { vRipple } from '../directives/ripple'

/**
 * 拆分按钮：左边是主动作，右边的箭头展开一组备选动作。
 *
 * 弹层直接用 M3Menu，而不是再写一套定位 / 键盘逻辑 ——
 * 菜单的焦点进入、↑↓ 移动、Esc 收起、点外部关闭都已经在那边做过了，
 * 这里只负责「两个半边拼成一个胶囊」的形状与强调级别。
 */
export interface SplitButtonItem {
  label: string
  icon?: IconComponent | null
  disabled?: boolean
  /** 选中该项时执行。 */
  onSelect?: () => void
}

type SplitVariant = 'filled' | 'tonal' | 'elevated' | 'outlined'
type SplitSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** 主动作文字。 */
    label: string
    variant?: SplitVariant
    size?: SplitSize
    /** 主动作图标。 */
    icon?: IconComponent | null
    /** 备选动作列表。给了 items 就不用默认插槽。 */
    items?: SplitButtonItem[]
    disabled?: boolean
    /** 箭头按钮的读屏名字。 */
    menuLabel?: string
  }>(),
  {
    variant: 'filled',
    size: 'md',
    icon: null,
    items: () => [],
    disabled: false,
    menuLabel: '更多操作',
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const glyphSize = computed(() => (props.size === 'lg' ? 24 : 18))

/** 内部圆角取 shape-extra-small：两个半边靠这一档圆角「咬合」成一颗胶囊。 */
const innerRadius = computed(() => (props.size === 'lg' ? 8 : 4))

function onMainClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
}

function selectItem(item: SplitButtonItem): void {
  if (item.disabled) return
  item.onSelect?.()
}
</script>

<template>
  <div
    class="md-split-btn"
    :class="['md-split-btn--' + variant, 'md-split-btn--' + size, { 'is-disabled': disabled }]"
    :style="{ '--md-split-inner-radius': innerRadius + 'px' }"
  >
    <button
      v-ripple
      type="button"
      class="md-split-btn__main"
      :disabled="disabled"
      @click="onMainClick"
    >
      <M3Icon v-if="icon" :icon="icon" :size="glyphSize" class="md-split-btn__icon" />
      <span class="md-split-btn__label">{{ label }}</span>
    </button>

    <M3Menu placement="bottom-end" :min-width="180" :gap="6" close-on-select>
      <template #trigger="{ open }">
        <button
          v-ripple
          type="button"
          class="md-split-btn__toggle"
          :aria-label="menuLabel"
          :aria-expanded="open"
          aria-haspopup="menu"
          :disabled="disabled"
        >
          <M3Icon
            :icon="IconArrowDropDown"
            :size="glyphSize + 6"
            class="md-split-btn__arrow"
            :class="{ 'is-open': open }"
          />
        </button>
      </template>

      <slot name="menu">
        <M3MenuItem
          v-for="item in props.items"
          :key="item.label"
          :label="item.label"
          :icon="item.icon"
          :disabled="item.disabled"
          @click="selectItem(item)"
        />
      </slot>
    </M3Menu>
  </div>
</template>

<style scoped>
.md-split-btn {
  --md-split-radius: var(--md-sys-shape-corner-full);
  display: inline-flex;
  align-items: stretch;
  gap: 2px;
  color: var(--md-sys-color-on-primary);
  font-family: var(--md-ref-typeface-plain);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.md-split-btn__main,
.md-split-btn__toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
    border-radius var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

/* 主动作的圆角：外侧保持胶囊，靠箭头的那一侧收成小圆角 */
.md-split-btn__main {
  gap: 8px;
  padding-inline: 24px;
  border-start-start-radius: var(--md-split-radius);
  border-end-start-radius: var(--md-split-radius);
  border-start-end-radius: var(--md-split-inner-radius);
  border-end-end-radius: var(--md-split-inner-radius);
}

/* 箭头半边镜像：小圆角朝左，胶囊朝右 */
.md-split-btn__toggle {
  justify-content: center;
  width: 40px;
  border-start-start-radius: var(--md-split-inner-radius);
  border-end-start-radius: var(--md-split-inner-radius);
  border-start-end-radius: var(--md-split-radius);
  border-end-end-radius: var(--md-split-radius);
}

/* 菜单展开时把外侧圆角收掉：面板就贴在它下面，留个圆角会露出一条缝 */
.md-split-btn__toggle:has(.is-open) {
  border-start-end-radius: var(--md-split-inner-radius);
  border-end-end-radius: var(--md-split-inner-radius);
}

/* 状态层：两个半边各画各的，拼起来仍是完整的一颗按钮 */
.md-split-btn__main::after,
.md-split-btn__toggle::after {
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
  .md-split-btn__main:hover::after,
  .md-split-btn__toggle:hover::after {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
}
.md-split-btn__main:focus-visible::after,
.md-split-btn__toggle:focus-visible::after {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.md-split-btn__main:active::after,
.md-split-btn__toggle:active::after {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}

.md-split-btn__icon,
.md-split-btn__label,
.md-split-btn__arrow {
  position: relative;
  z-index: 3;
}

.md-split-btn__arrow {
  transition: rotate var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

.md-split-btn__arrow.is-open {
  rotate: 180deg;
}

/* ---------- 尺寸 ---------- */
.md-split-btn--sm .md-split-btn__main {
  height: 32px;
  padding-inline: 16px;
}
.md-split-btn--sm .md-split-btn__toggle {
  height: 32px;
  width: 32px;
}
.md-split-btn--md .md-split-btn__main {
  height: 40px;
}
.md-split-btn--md .md-split-btn__toggle {
  height: 40px;
}
.md-split-btn--lg {
  font-size: var(--md-sys-typescale-title-medium-size);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}
.md-split-btn--lg .md-split-btn__main {
  height: 56px;
  padding-inline: 32px;
  gap: 12px;
}
.md-split-btn--lg .md-split-btn__toggle {
  height: 56px;
  width: 56px;
}

/* ---------- 变体 ---------- */
.md-split-btn--filled {
  color: var(--md-sys-color-on-primary);
}
.md-split-btn--filled .md-split-btn__main,
.md-split-btn--filled .md-split-btn__toggle {
  background-color: var(--md-sys-color-primary);
}

.md-split-btn--tonal {
  color: var(--md-sys-color-on-secondary-container);
}
.md-split-btn--tonal .md-split-btn__main,
.md-split-btn--tonal .md-split-btn__toggle {
  background-color: var(--md-sys-color-secondary-container);
}

.md-split-btn--elevated {
  color: var(--md-sys-color-primary);
}
.md-split-btn--elevated .md-split-btn__main,
.md-split-btn--elevated .md-split-btn__toggle {
  background-color: var(--md-sys-color-surface-container-low);
  box-shadow: var(--md-sys-elevation-level1);
}
@media (hover: hover) {
  .md-split-btn--elevated .md-split-btn__main:hover,
  .md-split-btn--elevated .md-split-btn__toggle:hover {
    box-shadow: var(--md-sys-elevation-level2);
  }
}

.md-split-btn--outlined {
  color: var(--md-sys-color-primary);
}
/* outlined 的描边要绕着「整颗按钮」一圈，两个半边各画自己那一段 */
.md-split-btn--outlined .md-split-btn__main,
.md-split-btn--outlined .md-split-btn__toggle {
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
}

/* ---------- 禁用 ---------- */
.md-split-btn.is-disabled {
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
}
.md-split-btn.is-disabled .md-split-btn__main,
.md-split-btn.is-disabled .md-split-btn__toggle {
  pointer-events: none;
  box-shadow: none;
}
.md-split-btn--filled.is-disabled .md-split-btn__main,
.md-split-btn--filled.is-disabled .md-split-btn__toggle,
.md-split-btn--tonal.is-disabled .md-split-btn__main,
.md-split-btn--tonal.is-disabled .md-split-btn__toggle,
.md-split-btn--elevated.is-disabled .md-split-btn__main,
.md-split-btn--elevated.is-disabled .md-split-btn__toggle {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}
.md-split-btn--outlined.is-disabled .md-split-btn__main,
.md-split-btn--outlined.is-disabled .md-split-btn__toggle {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .md-split-btn__arrow {
    transition-duration: var(--md-sys-motion-duration-short3);
  }
  .md-split-btn__arrow.is-open {
    rotate: 0deg;
  }
}
</style>
