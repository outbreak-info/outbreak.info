<template>
<div>
  <svg :width="100" :height="legendRectWidth + 2" class="categorical-legend" v-for="(value, vIdx) in legendValues" :key="vIdx">
    <rect :width="legendRectWidth" :height="legendRectWidth" :fill="value.fill"></rect>
    <text x="0" :y="legendRectWidth / 2" :dx="legendRectWidth + 5" style="dominant-baseline: central;">{{ value.label }}</text>
  </svg>
</div>
</template>


<script lang="js">
import Vue from "vue";

import {
  scaleOrdinal
} from "d3";

export default Vue.extend({
  name: "HorizontalCategoricalLegend",
  props: {
    values: Array,
    colorScale: Function,
    legendRectWidth: {
      type: Number,
      default: 15
    }
  },
  watch: {
    values: function() {
      this.updatePlot();
    }
  },
  computed: {
    legendValues() {
      if (this.colorScale) {
        return (this.values.map(d => {
          return ({
            fill: this.colorScale(d),
            label: d
          })
        }))
      } else {
        return (null)
      }
    }
  }
})
</script>
