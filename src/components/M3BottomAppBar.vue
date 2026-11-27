<script setup lang="ts">
/**
 * 底部应用栏：承载 1–3 个主要动作，可选右侧一枚 FAB。
 *
 * 高度固定 80dp、动作区水平均分；FAB 单独一列，而不是绝对定位压在栏上 ——
 * 绝对定位会在窄屏把最后一个动作盖住，而 inset（切角）需要额外测量。
 */
withDefaults(
  defineProps<{
    ariaLabel?: string
  }>(),
  { ariaLabel: '底部操作栏' },
)
</script>

<template>
  <nav class="md-bottom-bar" :aria-label="ariaLabel">
    <div class="md-bottom-bar__actions"><slot /></div>
    <div v-if="$slots.fab" class="md-bottom-bar__fab"><slot name="fab" /></div>
  </nav>
</template>

<style scoped>
.md-bottom-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 80px;
  padding: 12px 16px;
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}

.md-bottom-bar__actions {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.md-bottom-bar__fab {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}
</style>
