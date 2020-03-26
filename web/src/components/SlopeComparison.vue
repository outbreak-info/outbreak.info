<template>
<div class="slope-comparison flex-column align-left">

  <svg :width="width" :height="height" class="slope-comparison">
    <defs>
      <marker id="arrowhead" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M5,0 L12,5 L5,10" class="slope-arrowhead" :class="[slope1 < slope2 ? 'worse' : 'better']" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="epi-axis axis--x" ref="xAxis"></g>
    <!-- <g :transform="`translate(${margin.left}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g> -->
    <g :transform="`translate(${margin.left},${margin.top})`" class="slopes" ref="slopes">
    </g>
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
      yMax: 0.5,
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
      this.chart = this.svg.select(".slopes");
    },
    updateScales: function() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, 1]);

      this.y = d3
        .scaleLinear()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, this.yMax])

      this.xAxis = d3.axisBottom(this.x).ticks(0).tickSizeOuter(0);

      d3.select(this.$refs.xAxis).call(this.xAxis);

      // this.yAxis = d3.axisLeft(this.y).ticks(this.numYTicks);

      // d3.select(this.$refs.yAxis).call(this.yAxis);

    },
    drawSlopes: function() {

      // --- poly fill and swoopy arrow ---
      this.chart.selectAll(".fit-diff").data(this.slope1 && this.slope2 ? [{
          slope1: this.slope1,
          slope2: this.slope2
        }] : [])
        .join(
          enter => enter.append("polygon")
          .attr("class", d => this.slope1 < this.slope2 ? "fit-diff worse" : "fit-diff better")
          .attr("points", d => `${this.x(0)},${this.y(0)} ${this.x(1)},${this.y(d.slope1)} ${this.x(1)},${this.y(d.slope2)}`),
          update => update
          .attr("points", d => `${this.x(0)},${this.y(0)} ${this.x(1)},${this.y(d.slope1)} ${this.x(1)},${this.y(d.slope2)}`),
          exit => exit.call(exit => exit.remove())
        )


      this.chart.selectAll(".swoopy-arrow").data(this.slope1 && this.slope2 ? [{
          slope1: this.slope1,
          slope2: this.slope2
        }] : [])
        .join(
          enter => enter.append("path")
          .attr("transform", "translate(15, 0)")
          .attr("marker-end", "url(#arrowhead)")
          .attr("d", d => `M${this.x(1)} ${this.y(d.slope1)} C ${this.x(1) + 10} ${this.y(d.slope1)}, ${this.x(1) + 10} ${this.y(d.slope2)}, ${this.x(1)-4} ${this.y(d.slope2)}`)
          .attr("class", d => d.slope1 < d.slope2 ? "swoopy-arrow worse" : "swoopy-arrow better"),
          update => update
          .attr("d", d => `M${this.x(1)} ${this.y(d.slope1)} C ${this.x(1) + 10} ${this.y(d.slope1)}, ${this.x(1) + 10} ${this.y(d.slope2)}, ${this.x(1)-4} ${this.y(d.slope2)}`)
          .attr("class", d => d.slope1 < d.slope2 ? "swoopy-arrow worse" : "swoopy-arrow better"),
          exit => exit.call(exit => exit.remove())
        )

      // --- slope lines ---
      this.chart.selectAll(".recent-slope").data(this.slope2 ? [this.slope2] : [])
        .join(
          enter => enter.append("line")
          .attr("x1", this.x(0))
          .attr("y1", this.y(0))
          .attr("x2", this.x(1))
          .attr("y2", d => this.y(d))
          .attr("class", "recent-slope"),
          update => update
          .attr("x1", this.x(0))
          .attr("y1", this.y(0))
          .attr("x2", this.x(1))
          .attr("y2", d => this.y(d)),
          exit => exit.call(exit => exit.remove())
        )

      this.chart.selectAll(".penultimate-slope").data(this.slope1 ? [this.slope1] : [])
        .join(
          enter => enter.append("line")
          .attr("x1", this.x(0))
          .attr("y1", this.y(0))
          .attr("x2", this.x(1))
          .attr("y2", d => this.y(d))
          .attr("class", "penultimate-slope"),
          update => update
          .attr("x1", this.x(0))
          .attr("y1", this.y(0))
          .attr("x2", this.x(1))
          .attr("y2", d => this.y(d)),
          exit => exit.call(exit => exit.remove())
        )

      // --- circles ---
      this.chart.selectAll(".recent-slope-end").data(this.slope2 ? [this.slope2] : [])
        .join(
          enter => enter.append("circle")
          .attr("r", 3)
          .attr("cx", this.x(1))
          .attr("cy", d => this.y(d))
          .attr("class", "recent-slope-end"),
          update => update
          .attr("cx", this.x(1))
          .attr("cy", d => this.y(d)),
          exit => exit.call(exit => exit.remove())
        )

      this.chart.selectAll(".penultimate-slope-end").data(this.slope1 ? [this.slope1] : [])
        .join(
          enter => enter.append("circle")
          .attr("r", 3)
          .attr("cx", this.x(1))
          .attr("cy", d => this.y(d))
          .attr("class", "penultimate-slope-end"),
          update => update
          .attr("cx", this.x(1))
          .attr("cy", d => this.y(d)),
          exit => exit.call(exit => exit.remove())
        )

    }
  }
})
</script>

<style lang=scss>
.slope-comparison {
  $fit1-color: #59a14f;
  $fit2-color: #f28e2c;

  .recent-slope {
    stroke: $fit2-color;
    stroke-width: 3;
  }

  .penultimate-slope {
    stroke: $fit1-color;
    stroke-width: 1.5;
    stroke-dasharray: 6, 6;
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
    fill: $fit1-color;
  }

  .recent-slope-end {
    fill: $fit2-color;
  }

  .slope-comparison .axis--x path {
    stroke: $grey-60;
  }

  .swoopy-arrow.better,
  .slope-arrowhead.better {
    stroke: $secondary-color !important;
    fill: none;
    stroke-width: 1.5;
  }

  .swoopy-arrow.worse,
  .slope-arrowhead.worse {
    stroke: $warning-color !important;
    fill: none;
    stroke-width: 1.5;
  }

}
</style>
