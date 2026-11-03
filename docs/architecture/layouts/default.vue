<script setup lang="ts">
import { chapters } from "../chapters";

// Content slide: chapter rail on top, answer title and evidence in the body,
// source line and page number at the bottom. `chapter` and `source` come from
// the slide's frontmatter.
defineProps<{ chapter?: string; source?: string }>();
</script>

<template>
  <div class="slidev-layout lv-slide">
    <header class="lv-head">
      <div class="lv-wordmark"><span class="lv-bar" />Lizenzverwaltung</div>
      <nav class="lv-rail" aria-label="Kapitel">
        <span
          v-for="item in chapters"
          :key="item"
          :class="{ active: item === chapter }"
          :aria-current="item === chapter ? 'step' : undefined"
          >{{ item }}</span
        >
      </nav>
    </header>
    <main class="lv-body">
      <slot />
    </main>
    <footer class="lv-foot">
      <span>{{ source }}</span>
      <span class="lv-page">{{ $page }} / {{ $nav.total }}</span>
    </footer>
  </div>
</template>

<style scoped>
.lv-slide {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 44px;
}

.lv-head {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 44px;
  border-bottom: 1px solid var(--lv-line-subtle);
  flex: none;
}

.lv-wordmark {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.lv-bar {
  width: 3px;
  height: 16px;
  background: var(--lv-brand-red);
}

.lv-rail {
  display: flex;
  gap: 22px;
}

.lv-rail span {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--lv-ink-subtle);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.lv-rail span.active {
  color: var(--lv-primary-strong);
  border-bottom-color: var(--lv-primary);
}

.lv-body {
  flex: 1;
  min-height: 0;
  padding: 22px 0 10px;
  display: flex;
  flex-direction: column;
}

/* Content keeps its height; an overflow shows up in review instead of being squeezed. */
.lv-body > :deep(*) {
  flex-shrink: 0;
}

.lv-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  flex: none;
  font-size: 11px;
  color: var(--lv-ink-subtle);
  border-top: 1px solid var(--lv-line-subtle);
}
</style>
