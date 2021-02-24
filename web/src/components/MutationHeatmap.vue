<template>
<svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg" class="mutation-heatmap">
  <g ref="xAxisTop" class="axis axis--x" :transform="`translate(${this.margin.left}, ${this.margin.top})`"></g>
  <g ref="xAxisBottom" class="axis axis--x" :transform="`translate(${this.margin.left}, ${this.margin.top + this.height})`"></g>
  <g ref="yAxisLeft" class="axis axis--y" :transform="`translate(${this.margin.left}, ${this.margin.top})`"></g>
  <g ref="yAxisRight" class="axis axis--y" :transform="`translate(${this.margin.left + this.width}, ${this.margin.top})`"></g>
  <g ref="heatmap" id="heatmap" :transform="`translate(${this.margin.left}, ${this.margin.top})`"></g>
</svg>
</template>


<script lang="js">
import Vue from "vue";

import {
  cloneDeep
} from "lodash";

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  select,
  selectAll,
  scaleBand,
  axisLeft,
  axisRight,
  axisBottom,
  axisTop,
  transition,
  max
} from "d3";


import chroma from "chroma-js";

export default Vue.extend({
  name: "MutationHeatmap",
  props: {
    data: Array,
    xVar: {
      type: String,
      default: "mutation_simplified"
    },
    yVar: {
      type: String,
      default: "pangolin_lineage"
    }
  },
  watch: {
    data() {
      this.updatePlot();
    }
  },
  data() {
    return {
      margin: {
        top: 50,
        right: 75,
        bottom: 50,
        left: 75
      },
      // UI
      sortVar: "codon_num",
      // scales
      x: scaleBand(),
      y: scaleBand(),
      xAxisTop: null,
      xAxisBottom: null,
      yAxisLeft: null,
      yAxisRight: null,
      width: null,
      height: null,
      bandHeight: 25,
      colorScale: interpolateRdPu,
      // references
      svg: null,
      heatmap: null,
      // data
      plottedData: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupDims() {

    },
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.heatmap = select(this.$refs.heatmap);
    },
    updateScales() {
      this.height = 150; //this.data.length * this.bandHeight;
      this.width = 600; //max(this.data.map(d => d.length), d => d) * this.bandHeight;

      this.x = scaleBand()
        .range([0, this.width])
        .domain(this.plottedData.map(d => d[this.xVar]));

      this.y = scaleBand()
        .range([0, this.height])
        .domain(this.plottedData.map(d => d[this.yVar]));

      this.xAxisBottom = axisBottom(this.x).tickSizeOuter(0);
      select(this.$refs.xAxisBottom).call(this.xAxisBottom);

      this.yAxisLeft = axisLeft(this.y).tickSizeOuter(0);
      select(this.$refs.yAxisLeft).call(this.yAxisLeft);

      this.xAxisTop = axisTop(this.x).tickSizeOuter(0);
      select(this.$refs.xAxisTop).call(this.xAxisTop);

      this.yAxisRight = axisRight(this.y).tickSizeOuter(0);
      select(this.$refs.yAxisRight).call(this.yAxisRight);
    },
    prepData() {
      this.plottedData = cloneDeep(this.data);
      this.plottedData.sort((a, b) => a.codon_num - b.codon_num)
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
        this.updateScales();
        this.drawPlot();
      }
    },
    drawPlot() {
      const heatmapSelector = this.heatmap
        .selectAll(".heatmap")
        .data(this.plottedData, d => d.id);

      heatmapSelector.join(
        enter => {
          enter
            .append("rect")
            .attr("class", "heatmap")
            .attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
            .style("stroke", "#888")
            .style("stroke-width", 0.5)
            .style("rx", 5)
        },
        update => {
          update.attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
        }
      )

      // rotate axes :(
    select(this.$refs.xAxisTop)
  .selectAll("text")
    .attr("y", 0)
    .attr("dx", 6)
    .attr("dy", "-0.75em")
    .attr("transform", "rotate(-25)")
    .style("text-anchor", "start");

    }
  }
})
</script>

<style lang = "scss">
.mutation-heatmap .axis--x text {
    font-size: 16px;
}

.mutation-heatmap .axis--y text {
    font-size: 18px;
}

.mutation-heatmap .axis path {
    display: none;
}
</style>
