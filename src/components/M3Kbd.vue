<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Key sequence, e.g. ['Ctrl', 'K']. Falls back to the default slot. */
    keys?: string[]
    /** Separator between keys. */
    separator?: string
    size?: 'sm' | 'md'
  }>(),
  { keys: undefined, separator: '+', size: 'md' },
)
</script>

<template>
  <span class="md-kbd-group" :class="'md-kbd-group--' + size">
    <template v-if="keys && keys.length">
      <template v-for="(key, index) in keys" :key="key + index">
        <span v-if="index > 0" class="md-kbd-group__separator" aria-hidden="true">{{ separator }}</span>
        <kbd class="md-kbd">{{ key }}</kbd>
      </template>
    </template>
    <kbd v-else class="md-kbd"><slot /></kbd>
  </span>
</template>

<style scoped>
.md-kbd-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
}

.md-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 5px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  box-shadow:
    inset 0 0 0 1px var(--md-sys-color-outline-variant),
    0 1px 0 0 var(--md-sys-color-outline-variant);
  font-family: var(--md-ref-typeface-mono);
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.md-kbd-group--md .md-kbd {
  min-width: 22px;
  height: 22px;
  padding-inline: 6px;
  font-size: 12px;
}

.md-kbd-group__separator {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 11px;
  line-height: 1;
  user-select: none;
}

@media (prefers-reduced-motion: reduce) {
  /* nothing animates; the kbd is static by design */
}
</style>
