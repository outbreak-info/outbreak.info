<template>
<div>
  <div>
    {{variable}}
  </div>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="legned_svg">
    <g class="legend-bars" ref="legend_bars" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
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
    colorScale: Function
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
      width: 200,
      height: 125,
      margin: {
        top: 5,
        bottom: 25,
        left: 15,
        right: 15
      },
      // axes
      x: null,
      y: null,
      xAxis: null,
      // binned data
      bins: null,
      numBins: 40,
      // refs
      chart: null,
      xAxisRef: null
    };
  },
  computed: {},
  mounted() {
    console.log(this.data);
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
        .range([0, this.width])
        .domain(d3.extent(this.data, d => d[this.variable]))
        .nice();

      this.xAxis = d3.axisBottom(this.x).tickSizeOuter(0);
      this.xAxisRef.call(this.xAxis);

      d3.selectAll(".axis").call(this.xAxis);

      // set bins
      this.bins = d3.histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(this.numBins))(this.data.map(d => d[this.variable]));

      // y-axis
      this.y = d3.scaleLinear()
        .range([this.height, 0])
        .domain([0, d3.max(this.bins, d => d.length)]).nice()

    },
    updatePlot: function() {
      if (this.data) {
        this.updateAxes();

        this.chart
          .selectAll("rect")
          .data(this.bins)
          .join(
            enter => {
              enter.append("rect")
                .attr("class", "histogram-bar")
                .attr("fill", d => this.colorScale((d.x0 + d.x1) / 2))
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            },
            update => {
              update
                .attr("fill", d => this.colorScale((d.x0 + d.x1) / 2))
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
