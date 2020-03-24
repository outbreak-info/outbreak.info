<template>
<div class="epidemiology-curves flex-column align-left">

  <svg :width="width" :height="height" class="slope-comparison">
    <defs>
      <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="epi-axis axis--x" ref="xAxis"></g>
    <!-- <g :transform="`translate(${margin.left}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g> -->
    <g :transform="`translate(${margin.left},${margin.top})`" class="slopes"></g>
  </svg>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from "d3";

const width = 125;
const height = 75;
const margin = {
  top: 5,
  right: 50,
  bottom: 5,
  left: 5
};

export default Vue.extend({
  name: "SlopeComparison",
  components: {},
  props: {
    slope1: Number,
    slope2: Number
  },
  data() {
    return {
      width,
      height,
      margin,

      // scales
      x: d3.scaleLinear(),
      y: d3.scaleLinear(),
      xAxis: null,
      // yAxis: null,
      // refs
      svg: null,
      chart: null,
      // methods
      line: null
    };
  },
  watch: {
    slope1: function() {
      this.updatePlot();
    },
    slope2: function() {
      this.updatePlot();
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    updatePlot: function() {
        this.updateScales();
        this.drawSlopes();
    },
    setupPlot: function() {
      this.svg = d3.select("svg.slope-comparison");
      this.chart = d3.select(".slopes");
    },
    updateScales: function() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, 1]);

      this.y = d3
        .scaleLinear()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, 0.3])

      this.xAxis = d3.axisBottom(this.x).ticks(0).tickSizeOuter(0);

      d3.select(this.$refs.xAxis).call(this.xAxis);

      // this.yAxis = d3.axisLeft(this.y).ticks(this.numYTicks);

      // d3.select(this.$refs.yAxis).call(this.yAxis);

    },
    drawSlopes: function() {
      this.chart.append("polygon")
      .attr("points",`${this.x(0)},${this.y(0)} ${this.x(1)},${this.y(this.slope1)} ${this.x(1)},${this.y(this.slope2)}`)
      .attr("class", d => this.slope1 < this.slope2 ? "worse" : "better");

      this.chart.append("path")
      .attr("d",`M${this.x(1)} ${this.y(this.slope1)} C ${this.x(1) + 10} ${this.y(this.slope1)}, ${this.x(1) + 10} ${this.y(this.slope2)}, ${this.x(1)-4} ${this.y(this.slope2)}`)
      .attr("transform", "translate(15, 0)")
      .attr("class", d => this.slope1 < this.slope2 ? "swoopy-arrow worse" : "swoopy-arrow better")
      .attr("marker-end", "url(#arrow)");


      this.chart.append("line")
      .attr("x1", this.x(0))
      .attr("y1", this.y(0))
      .attr("x2", this.x(1))
      .attr("y2", this.y(this.slope1))
      .attr("class", "penultimate-slope");

      this.chart.append("line")
      .attr("x1", this.x(0))
      .attr("y1", this.y(0))
      .attr("x2", this.x(1))
      .attr("y2", this.y(this.slope2))
      .attr("class", "recent-slope");

      this.chart.append("circle")
      .attr("cx", this.x(1))
      .attr("cy", this.y(this.slope1))
      .attr("r", 3)
      .attr("class", "penultimate-slope-end");

      this.chart.append("circle")
      .attr("cx", this.x(1))
      .attr("cy", this.y(this.slope2))
      .attr("r", 3)
      .attr("class", "recent-slope-end");

    }
  }
})
</script>

<style lang=scss>

.recent-slope {
    stroke: $warning-color;
    stroke-width: 3;
}

.penultimate-slope {
    stroke: $secondary-color;
    stroke-width: 1.5;
    stroke-dasharray: 6,6;
}

.worse {
    fill: $warning-color;
    fill-opacity: 0.2;
}

.better {
    fill: $secondary-color;
    fill-opacity: 0.2;
}

.penultimate-slope-end {
  fill: $secondary-color;
}

.recent-slope-end {
  fill: $warning-color;
}

.slope-comparison .axis--x path {
  stroke: $grey-60;
}

.swoopy-arrow.better,
.swoopy-arrowhead.better {
    stroke: $secondary-color;
    fill: none;
    stroke-width: 1.5;
}
.swoopy-arrow.worse,
.swoopy-arrowhead.worse {
    stroke: $warning-color;
    fill: none;
    stroke-width: 1.5;
}

</style>
