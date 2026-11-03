<script setup lang="ts">
// Connector between two diagram boxes: a line with an arrowhead and an
// optional label. `dir` is the direction the arrow points.
withDefaults(
  defineProps<{
    label?: string;
    dir?: "right" | "left" | "down" | "up";
    tone?: "default" | "accent";
  }>(),
  { dir: "right", tone: "default" },
);
</script>

<template>
  <div class="flow" :class="[dir, tone]">
    <span v-if="label" class="label">{{ label }}</span>
    <span class="line" aria-hidden="true"><span class="head" /></span>
  </div>
</template>

<style scoped>
.flow {
  --c: var(--lv-line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  min-height: 0;
}

.flow.accent {
  --c: var(--lv-primary);
}

.flow.right,
.flow.left {
  flex-direction: column;
  padding: 0 4px;
}

.flow.down,
.flow.up {
  flex-direction: row-reverse;
  padding: 4px 0;
}

.label {
  font-size: 11px;
  line-height: 1.25;
  color: var(--lv-ink-muted);
  text-align: center;
}

.accent .label {
  color: var(--lv-primary-strong);
}

.line {
  position: relative;
  background: var(--c);
  flex: none;
}

.right .line,
.left .line {
  width: 100%;
  height: 1.5px;
}

.down .line,
.up .line {
  width: 1.5px;
  height: 100%;
  min-height: 22px;
}

.head {
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

.right .head {
  right: -2px;
  top: -4.25px;
  border-left: 7px solid var(--c);
  border-right: 0;
}

.left .head {
  left: -2px;
  top: -4.25px;
  border-right: 7px solid var(--c);
  border-left: 0;
}

.down .head {
  bottom: -2px;
  left: -4.25px;
  border-top: 7px solid var(--c);
  border-bottom: 0;
}

.up .head {
  top: -2px;
  left: -4.25px;
  border-bottom: 7px solid var(--c);
  border-top: 0;
}
</style>
