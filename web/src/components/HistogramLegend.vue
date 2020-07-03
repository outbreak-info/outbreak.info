<template>
<div>
  <div>
    {{variableLabel}}
  </div>
  <svg :width="width" :height="height + margin.top + margin.bottom*2" ref="legend_svg">
    <g class="legend-bars" ref="legend_bars" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
    <g class="legend" :transform="`translate(${margin.left},${height + margin.bottom + margin.top})`">
      <rect x="0" y="0" :width="item.width" height="10" :fill="item.fill" :id="`legendrect${idx}`"
      :transform="`translate(${item.x0}, 0)`" v-for="(item, idx) in legendColors" :key="idx">
      </rect>
      <rect x="0" y="0" :width="width - margin.left - margin.right" height="10"
      stroke="black" fill="none"
      :stroke-width="0.5"></rect>
    </g>

  </svg>
</div>
</template>


<script>
import * as d3 from "d3";
import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

export default {
  name: "HistogramLegend",
  props: {
    data: Array,
    variable: String,
    variableLabel: String,
    colorScale: Function,
    width: Number
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    variable: function() {
      this.updatePlot();
    }
  },
  data() {
    return {
      height: 100,
      margin: {
        top: 5,
        bottom: 25,
        left: 5,
        right: 5
      },
      // axes
      x: null,
      y: null,
      xAxis: null,
      legendColors: null,
      // binned data
      bins: null,
      numBins: 50,
      // refs
      chart: null,
      xAxisRef: null
    };
  },
  computed: {},
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot: function() {
      this.chart = d3.select(this.$refs.legend_bars);
      this.xAxisRef = d3.select(this.$refs.x_axis);
    },
    updateAxes: function() {
      // x-axis
      this.x = d3.scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(d3.extent(this.data, d => d[this.variable]));

      this.xAxis = d3.axisBottom(this.x).tickSizeOuter(0).ticks(5);
      this.xAxisRef.call(this.xAxis);

      // legend gradient
      this.legendColors = this.colorScale.range()
      .map((color,i) => {
        return({
        fill: color,
        width: this.x(this.colorScale.domain()[i+1]) - this.x(this.colorScale.domain()[i]),
        x0: this.x(this.colorScale.domain()[i])
        })

      })

      d3.selectAll(".axis").call(this.xAxis);

      // set bins
      this.bins = d3.histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(this.numBins))(this.data.map(d => d[this.variable]));

      // y-axis
      this.y = d3.scaleLinear()
        .range([this.height, 0])
        .domain([0, d3.max(this.bins, d => d.length)]);

    },
    updatePlot: function() {
      if (this.data && this.colorScale) {
        this.updateAxes();

        this.chart
          .selectAll("rect")
          .data(this.bins)
          .join(
            enter => {
              enter.append("rect")
                .attr("class", "histogram-bar")
                .attr("fill", d => this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : "none")
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            },
            update => {
              update
                .attr("fill", d => this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : "none")
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            }
          )
      }
    }
  }
}
</script>

<style lang="scss">
.histogram-bar {
    stroke: $base-grey;
    stroke-width: 0.5;
    shape-rendering: crispedges;
}
</style>
