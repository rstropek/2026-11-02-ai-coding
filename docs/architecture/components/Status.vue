<script setup lang="ts">
import { computed } from "vue";

// Status chip with icon and text, never color alone. The default text can be
// replaced through the slot.
const props = defineProps<{
  kind: "done" | "open" | "high" | "medium" | "low";
}>();

const variants = {
  done: { text: "Umgesetzt", icon: "i-lucide-circle-check" },
  open: { text: "Offen", icon: "i-lucide-circle-dashed" },
  high: { text: "Hoch", icon: "i-lucide-triangle-alert" },
  medium: { text: "Mittel", icon: "i-lucide-circle-alert" },
  low: { text: "Niedrig", icon: "i-lucide-info" },
} as const;

const variant = computed(() => variants[props.kind]);
</script>

<template>
  <span class="status" :class="kind">
    <span :class="variant.icon" class="icon" aria-hidden="true" />
    <slot>{{ variant.text }}</slot>
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 6px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

.icon {
  width: 13px;
  height: 13px;
}

.done {
  color: var(--lv-success);
  background: var(--lv-success-subtle);
}

.open {
  color: var(--lv-ink-muted);
  background: var(--lv-canvas);
}

.high {
  color: var(--lv-danger);
  background: var(--lv-danger-subtle);
}

.medium {
  color: var(--lv-warning);
  background: var(--lv-warning-subtle);
}

.low {
  color: var(--lv-info);
  background: var(--lv-info-subtle);
}
</style>
