<template>
<div class="donut-group d-flex" :id="`donut-${id}`">
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="date-histogram">
    <g :transform="`translate(${this.margin.left},${this.margin.top})`" ref="hist"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  axisBottom,
  nest,
  max,
  sum,
  extent,
  timeWeek,
  isoParse
} from "d3";

export default Vue.extend({
  name: "DateHistogram",
  props: {
    data: Array,
    id: String,
    filterable: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 150
    },
    height: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      margin: {
        top: 5,
        bottom: 25,
        left: 10,
        right: 10
      },
      // data
      bins: null,
      // axes,
      x: null,
      y: null,
      xAxis: null,
      // refs
      svg: null,
      xAxisRef: null
      // methods
    };
  },
  watch: {
    data: function() {
      this.updatePlot();
    }
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.hist);
      this.xAxisRef = select(this.$refs.x_axis);
    },
    updatePlot() {
      if (this.data && this.data[0] && this.width) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    updateAxes: function() {
      const dateRange = extent(this.data, d => d.date);

      // x-axis
      // Add 1 week pad on either side of the histogram to pad the ends
      this.x = scaleTime()
        .range([0, this.width])
        .domain([timeWeek.offset(dateRange[0], -1), timeWeek.offset(dateRange[1], 1)]);


      this.xAxis = axisBottom(this.x).tickSizeOuter(0).ticks(4);
      this.xAxisRef.call(this.xAxis);

      selectAll(".axis").call(this.xAxis);

      // calculate bins
      // rolled up to every week
      this.bins = nest()
        .key(d => timeWeek(d.date))
        .rollup(values => sum(values, d => d.count))
        .entries(this.data)

      // gotta reconvert dates from strings
      this.bins.forEach(d => {
        d["date"] = isoParse(d.key)
      })

      // // y-axis
      this.y = scaleLinear()
        .range([this.height, 0])
        .domain([0, max(this.bins, d => d.value)]);

    },
    drawPlot() {
      const barSelector = this.svg
        .selectAll("rect")
        .data(this.bins);

      barSelector.join(enter => {
          enter.append("rect")
            .attr("class", "histogram-bar")
            .attr("fill", d => "#66c2a5")
            // .attr("opacity", d => d.selected ? 1 : 0.25)
            .attr("x", d => this.x(d.date))
            .attr("width", d => (this.x(timeWeek.offset(d.date, 1)) - this.x(d.date)) * 0.9)
            .attr("y", d => this.y(d.value))
            .attr("height", d => this.y(0) - this.y(d.value))
        },
        update => update
        .attr("x", d => this.x(d.date))
        .attr("width", d => (this.x(timeWeek.offset(d.date, 1)) - this.x(d.date)) * 0.9)
        .attr("y", d => this.y(d.value))
        .attr("height", d => this.y(0) - this.y(d.value)))
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
