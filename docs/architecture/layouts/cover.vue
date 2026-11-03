<script setup lang="ts">
import packageJson from "../../../package.json";
import { chapters } from "../chapters";

// Title slide. The app version comes from the root package.json, so it stays
// current; `asOf` is the date the facts in the deck were last checked.
defineProps<{ asOf?: string; environment?: string }>();
const version = packageJson.version;
</script>

<template>
  <div class="slidev-layout lv-cover">
    <div class="lv-wordmark"><span class="lv-bar" />Lizenzverwaltung</div>
    <div class="lv-title">
      <slot />
    </div>
    <dl class="lv-facts">
      <div>
        <dt>App-Version</dt>
        <dd class="mono">{{ version }}</dd>
      </div>
      <div v-if="asOf">
        <dt>Stand der Fakten</dt>
        <dd>{{ asOf }}</dd>
      </div>
      <div v-if="environment">
        <dt>Produktion</dt>
        <dd class="mono">{{ environment }}</dd>
      </div>
    </dl>
    <ol class="lv-agenda" aria-label="Kapitel">
      <li v-for="item in chapters" :key="item">{{ item }}</li>
    </ol>
  </div>
</template>

<style scoped>
.lv-cover {
  height: 100%;
  padding: 40px 56px 36px;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  row-gap: 28px;
}

.lv-wordmark {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.lv-bar {
  width: 4px;
  height: 22px;
  background: var(--lv-brand-red);
}

.lv-title {
  align-self: center;
  max-width: 760px;
}

.lv-title :deep(h1) {
  font-size: 54px;
  line-height: 1.05;
  letter-spacing: -0.015em;
}

.lv-title :deep(p) {
  opacity: 1;
  margin-top: 16px;
  font-size: 19px;
  color: var(--lv-ink-muted);
  max-width: 620px;
}

.lv-facts {
  display: flex;
  gap: 48px;
  margin: 0;
}

.lv-facts dt {
  font-size: 12px;
  color: var(--lv-ink-muted);
}

.lv-facts dd {
  margin: 2px 0 0;
  font-size: 15px;
}

.lv-agenda {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--lv-line);
}

.lv-agenda li {
  margin: 0;
  padding-top: 10px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--lv-ink-muted);
}
</style>
