<template>
<svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg" class="mutation-heatmap">
  <g ref="xAxis" class="axis axis--x"></g>
  <g ref="yAxis" class="axis axis--y"></g>
  <g v-for="(lineage, lIdx) in data" :key="lIdx">
    <rect :id="mutation.mutation" width="20" height="20" :y="mIdx*20" :x="lIdx*20" stroke="white" stroke-width="0.5" rx="3" v-for="(mutation, mIdx) in lineage" :fill="mutation.fill" :key="mIdx"></rect>
  </g>
</svg>
</template>


<script lang="js">
import Vue from "vue";

import NT_MAP from "@/assets/genomics/sarscov2_NC045512_genes_nt.json";

import {
  select,
  selectAll,
  scaleBand,
  axisLeft, axisBottom,
  transition,
  max
} from "d3";


import chroma from "chroma-js";

export default Vue.extend({
  name: "MutationHeatmap",
  props: {
    data: Array
  },
  data() {
    return {
      margin: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 35
      },
      x: scaleBand(),
      y: scaleBand(),
      xAxis: null,
      yAxis: null,
      width: null,
      height: null,
      bandHeight: 25,
      // references
      svg: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {

    },
    updateScales() {
      this.height = this.data.length * this.bandHeight;
      this.width = max(this.data.map(d => d.length), d => d) * this.bandHeight;

      this.x = scaleBand()
      .range([0, this.width])
      .domain([0,1,2,3]);

      this.y = scaleBand()
      .range([0, this.height])
      .domain(this.data.flatMap(d => d.mutation));

      this.xAxis = axisBottom(this.x);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0);
        select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      this.updateScales();
    }
  }
})
</script>
