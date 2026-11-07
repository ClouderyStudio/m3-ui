<script setup lang="ts">
import { IconSearch, type IconComponent } from '../icons'
import M3Button from './M3Button.vue'
import M3Icon from './M3Icon.vue'

/**
 * 空状态：列表没有内容、搜索无结果、筛选后为空时用它。
 *
 * 一个图标 + 一句标题 + 可选的说明与恢复操作。所有站点都长这样，
 * 各自复制一份会逐渐走样（内边距、圆角、色彩角色都开始漂移）。
 */
withDefaults(
  defineProps<{
    icon?: IconComponent
    title: string
    description?: string
    /** 恢复操作的文字；不传则不显示按钮。 */
    actionLabel?: string
  }>(),
  { icon: undefined, description: undefined, actionLabel: undefined },
)

const emit = defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div class="empty">
    <span class="empty__icon">
      <M3Icon :icon="icon ?? IconSearch" :size="32" />
    </span>
    <p class="empty__title md-typescale-title-medium">{{ title }}</p>
    <p v-if="description" class="empty__description md-typescale-body-medium">{{ description }}</p>
    <M3Button v-if="actionLabel" class="empty__action" variant="tonal" size="sm" @click="emit('action')">
      {{ actionLabel }}
    </M3Button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 56px 24px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-surface-container-low);
  text-align: center;
}

.empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-block-end: 4px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.empty__title {
  font-weight: var(--md-typescale-title-medium-weight);
}

.empty__description {
  max-width: 46ch;
  color: var(--md-sys-color-on-surface-variant);
}

.empty__action {
  margin-block-start: 8px;
}
</style>
