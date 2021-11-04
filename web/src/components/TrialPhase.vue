<template>
  <div class="my-2 d-flex align-items-center">
    <span class="mr-3" v-if="includeLabel">Phase</span>
    <svg :width="width" :height="height">
      <g>
        <polygon
          class="polygon-phase"
          :points="
            `0,0 ${phaseWidth - 2 * triangleWidth},0 ${phaseWidth -
              triangleWidth},${height / 2} ${phaseWidth -
              2 * triangleWidth},${height} 0,${height}`
          "
        ></polygon>
        <text
          class="text-phase"
          :x="(phaseWidth - 1.5 * triangleWidth) / 2"
          :y="height / 2"
        >
          0
        </text>
      </g>
      <g
        :class="{ 'current-phase': phases.includes(phase) }"
        v-for="(phase, idx) in allPhases"
        :key="idx"
        :transform="
          `translate(${(phaseWidth - triangleWidth + spacer) * (idx + 1) -
            triangleWidth},0)`
        "
      >
        <polygon
          class="polygon-phase"
          :points="
            `0,0 ${phaseWidth - triangleWidth},0 ${phaseWidth},${height /
              2} ${phaseWidth -
              triangleWidth},${height} 0,${height} ${triangleWidth},${height /
              2}`
          "
        ></polygon>
        <text class="text-phase" :x="phaseWidth / 2" :y="height / 2">
          {{ phase }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script lang="js">
import Vue from "vue";

export default Vue.extend({
  name: "TrialPhase",
  props: {
    phases: Array,
    includeLabel: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      phaseWidth: 55,
      triangleWidth: 10,
      allPhases: [1, 2, 3, 4],
      spacer: 7,
      height: 22
    };
  },
  watch: {},
  computed: {
    width() {
      return (this.phaseWidth * 4 + this.spacer * 5)
    }
  },
  methods: {},
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
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
