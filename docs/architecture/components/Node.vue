<script setup lang="ts">
// A box in an architecture diagram: an actor, a component or a resource.
// `icon` is a full UnoCSS class (e.g. "i-lucide-server") so UnoCSS finds it
// in the Markdown. `meta` is a machine name in mono (resource, path).
withDefaults(
  defineProps<{
    title: string;
    icon?: string;
    meta?: string;
    tone?: "default" | "accent" | "quiet";
  }>(),
  { tone: "default" },
);
</script>

<template>
  <div class="node" :class="tone">
    <div class="head">
      <span v-if="icon" :class="icon" class="icon" aria-hidden="true" />
      <span class="title">{{ title }}</span>
    </div>
    <div v-if="meta" class="meta">{{ meta }}</div>
    <div v-if="$slots.default" class="body"><slot /></div>
  </div>
</template>

<style scoped>
.node {
  background: var(--lv-surface);
  border: 1px solid var(--lv-line);
  border-radius: var(--lv-radius);
  box-shadow: var(--lv-shadow-card);
  padding: 8px 11px 9px;
  min-width: 0;
}

.node.accent {
  border-color: var(--lv-primary);
  background: var(--lv-primary-subtle);
}

.node.quiet {
  background: var(--lv-surface-muted);
  box-shadow: none;
  border-style: dashed;
}

.head {
  display: flex;
  align-items: center;
  gap: 7px;
}

.icon {
  width: 16px;
  height: 16px;
  color: var(--lv-ink-muted);
}

.accent .icon {
  color: var(--lv-primary-strong);
}

.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}

.meta {
  margin-top: 3px;
  font-family: "Fira Mono", ui-monospace, monospace;
  font-size: 11px;
  color: var(--lv-ink-muted);
  overflow-wrap: anywhere;
}

.body {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--lv-ink-muted);
}

.body :deep(p) {
  margin: 0;
}

.body :deep(code) {
  font-size: 11px;
}
</style>
