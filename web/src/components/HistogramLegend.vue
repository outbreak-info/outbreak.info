<template>
<div>
  <div>
    {{variableLabel}}
  </div>
  <svg class="epi-map-svg epi-map-legend" name="" :width="width" :height="height + margin.top + margin.bottom*2 + 15" ref="legend_svg">
    <g class="legend-bars" ref="legend_bars" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
    <g class="legend" :transform="`translate(${margin.left},${height + margin.bottom + margin.top})`">
      <rect x="0" y="0" :width="item.width" height="10" :fill="item.fill" :id="`legendrect${idx}`" :transform="`translate(${item.x0}, 0)`" v-for="(item, idx) in legendColors" :key="idx">
      </rect>
      <rect x="0" y="0" :width="width - margin.left - margin.right" height="10" stroke="black" fill="none" :stroke-width="0.5"></rect>
    </g>
    <g class="slider-handle pointer" :transform="`translate(${margin.left/2},${height + margin.bottom + margin.top + 14})`">
      <polygon ref="slider_left" stroke="#D13B62" fill="#D13B62" stroke-width="0.5" fill-opacity="0.4" points="6.5,12.1 0.1,12.1 0.1,2.9 3.3,-0.2 6.5,2.9 "/>
      <polygon ref="slider_right" :transform="`translate(${width - margin.left - margin.right},0)`" stroke="#D13B62" fill="#D13B62" stroke-width="0.5" fill-opacity="0.3" points="6.5,12.1 0.1,12.1 0.1,2.9 3.3,-0.2 6.5,2.9 "/>
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
    minVal: Number,
    maxVal: Number,
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
        .domain(d3.extent(this.colorScale.domain()));

      this.xAxis = d3.axisBottom(this.x).tickSizeOuter(0).ticks(5);
      this.xAxisRef.call(this.xAxis);

      // legend gradient
      this.legendColors = this.colorScale.range()
        .map((color, i) => {
          return ({
            fill: color,
            width: this.x(this.colorScale.domain()[i + 1]) - this.x(this.colorScale.domain()[i]),
            x0: this.x(this.colorScale.domain()[i])
          })

        })

      d3.selectAll(".axis").call(this.xAxis);

      // calculate bins
      this.bins = d3.histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(this.numBins))(this.data.map(d => d[this.variable]));

      // pre-calc if the data should be selected or not
      this.bins.forEach(d => {
        if ((this.minVal || this.minVal === 0) && (this.maxVal || this.maxVal === 0)) {
          d["selected"] = d.x0 >= this.minVal && d.x1 <= this.maxVal;
        } else if (this.minVal || this.minVal === 0) {
          d["selected"] = d.x0 >= this.minVal;
        } else if (this.maxVal || this.maxVal === 0) {
          d["selected"] = d.x1 <= this.maxVal;
        } else {
          d["selected"] = true;
        }
      })


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
                .attr("opacity", d => d.selected ? 1 : 0.25)
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            },
            update => {
              update
                .attr("fill", d => this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : "none")
                .attr("opacity", d => d.selected ? 1 : 0.25)
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
