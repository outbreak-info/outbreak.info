<template>
  <div class="my-2 d-flex align-items-center">
    <span v-if="includeLabel" class="mr-3">Phase</span>
    <svg :width="width" :height="height">
      <g>
        <polygon
          class="polygon-phase"
          :points="`0,0 ${phaseWidth - 2 * triangleWidth},0 ${
            phaseWidth - triangleWidth
          },${height / 2} ${
            phaseWidth - 2 * triangleWidth
          },${height} 0,${height}`"
        />
        <text
          class="text-phase"
          :x="(phaseWidth - 1.5 * triangleWidth) / 2"
          :y="height / 2"
        >
          0
        </text>
      </g>
      <g
        v-for="(phase, idx) in allPhases"
        :key="idx"
        :class="{ 'current-phase': phases.includes(phase) }"
        :transform="`translate(${
          (phaseWidth - triangleWidth + spacer) * (idx + 1) - triangleWidth
        },0)`"
      >
        <polygon
          class="polygon-phase"
          :points="`0,0 ${phaseWidth - triangleWidth},0 ${phaseWidth},${
            height / 2
          } ${
            phaseWidth - triangleWidth
          },${height} 0,${height} ${triangleWidth},${height / 2}`"
        />
        <text class="text-phase" :x="phaseWidth / 2" :y="height / 2">
          {{ phase }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  phases: Array,
  includeLabel: {
    type: Boolean,
    default: true,
  },
});

const phaseWidth = ref(55);
const triangleWidth = ref(10);
const allPhases = ref([1, 2, 3, 4]);
const spacer = ref(7);
const height = ref(22);

const width = computed(() => {
  return phaseWidth.value * 4 + spacer.value * 5;
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.polygon-phase {
  fill: $grey-40;
  stroke: $grey-70;
  stroke-width: 1;
  // shape-rendering: crispedges;
}

.text-phase {
  dominant-baseline: central;
  text-anchor: middle;
  fill: $grey-70;
  font-size: 10pt;
  font-weight: 700;
}

.current-phase text {
  fill: lighten($clinical-trial-color, 35%);
}

.current-phase polygon {
  fill: darken($clinical-trial-color, 10%);
  stroke: darken($clinical-trial-color, 30%);
}
</style>
