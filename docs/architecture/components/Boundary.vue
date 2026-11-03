<script setup lang="ts">
// A trust or deployment boundary around diagram boxes (dashed magenta line).
// `quiet` draws a neutral grouping instead, for groups that are no boundary.
defineProps<{ label: string; quiet?: boolean }>();
</script>

<template>
  <div class="boundary" :class="{ quiet }">
    <span class="label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.boundary {
  position: relative;
  border: 1.5px dashed var(--lv-primary);
  border-radius: 12px;
  padding: 22px 12px 12px;
  min-width: 0;
}

.boundary.quiet {
  border: 1px solid var(--lv-line-subtle);
  background: var(--lv-surface-muted);
}

.label {
  position: absolute;
  top: 5px;
  left: 12px;
  font-family: "Fira Mono", ui-monospace, monospace;
  font-size: 11px;
  color: var(--lv-primary-strong);
}

.quiet .label {
  color: var(--lv-ink-muted);
}
</style>
