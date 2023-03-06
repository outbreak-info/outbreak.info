<template>
  <div>
    <div class="orange-title uppercase mt-2">Primary</div>
    <ul>
      <li v-for="(outcome, idx) in primary" :key="idx">
        <span class="text-dark font-weight-700">
          {{ outcome.outcomeMeasure }}
        </span>
        <span v-if="outcome.outcomeTimeFrame">
          ({{ outcome.outcomeTimeFrame }})
        </span>
      </li>
    </ul>
    <div v-if="secondary.length">
      <div class="orange-title uppercase">secondary</div>
      <ul>
        <li v-for="(outcome, idx) in secondary" :key="idx">
          <span class="text-dark">{{ outcome.outcomeMeasure }}</span>
          <span v-if="outcome.outcomeTimeFrame">
            ({{ outcome.outcomeTimeFrame }})
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: Array,
});

const primary = computed(() => {
  return props.data.filter((d) => d.outcomeType === 'primary');
});

const secondary = computed(() => {
  return props.data.filter((d) => d.outcomeType !== 'primary');
});
</script>

<style lang="scss" scoped></style>
