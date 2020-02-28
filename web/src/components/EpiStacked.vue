<template>
<div class="epidemiology flex-column align-left">
  <h3 class="plot-title">Cumulative number of COVID-19 cases by region</h3>
  <DataUpdated />
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-summary">
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-summary"></g>
    <g :transform="`translate(${margin.left},${-margin.top})`" id="legend"></g>
  </svg>
  <DataSource />
</div>
</template>

<script lang="ts">
import Vue from "vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";

import * as d3 from 'd3';
import {
  schemeTableau10
} from 'd3-scale-chromatic';

const width = 500;
const height = 300;
const margin = {
  top: 10,
  right: 100,
  bottom: 25,
  left: 60
}

export default Vue.extend({
  name: "EpiStacked",
  components: {
    DataUpdated,
    DataSource
  },
  props: {
    country: String,
    data: Array
  },
  data() {
    return {
      width,
      height,
      margin,
      series: null,
      // axes
      x: d3.scaleTime(),
      y: d3.scaleLinear(),
      colorScale: d3.scaleOrdinal(schemeTableau10),
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      legend: null,
      // methods
      area: null
    }
  },
  watch: {
    data: function() {
      console.log(this.data);
      this.updatePlot();
    }
  },
  mounted() {
    this.updatePlot();
  },
  methods: {
    updatePlot: function() {
      if (this.data) {
        this.setupPlot();
        this.createScales();
        this.drawPlot();
      }
    },
    setupPlot: function() {
      this.svg = d3.select("svg");
      this.chart = d3.select("#epi-summary");
      this.legend = d3.select("#legend");
    },
    createScales: function() {
      const keys = Object.keys(this.data[0]).filter(d => d !== "date");

      this.series = d3.stack()
        .keys(keys)
        // .order(d3.stackOrderDescending)
        // .order(d3.stackOrderAscending)
        // .order(d3.stackOrderAppearance)
        // .order(d3.stackOrderNone)
        .order(d3.stackOrderReverse)
        // .order(d3.stackOrderInsideOut)
        (this.data);

      console.log(this.series)

      this.x = this.x
        .domain(d3.extent(this.data.map(d => d.date)))
        .range([0, this.width]);

      this.y = this.y
        .range([this.height, 0])
        .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))]).nice();

      this.colorScale = this.colorScale
        .domain(keys)

      this.xAxis = d3.axisBottom(this.x).ticks(9);

      this.svg.append('g')
        .attr('class', 'epi-axis axis--x')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height + 2})`)
        .call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y);

      this.svg.append('g')
        .attr('class', 'epi-axis axis--y')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .call(this.yAxis);

    },
    drawPlot: function() {
      this.area = d3.area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]));

      this.chart
        .selectAll("path")
        .data(this.series)
        .join("path")
        .style("fill", ({
          key
        }) => this.colorScale(key))
        .attr("d", this.area)
        .append("title")
        .text(({
          key
        }) => key);

      const legendRectWidth = 15;

      const legendData = this.legend
        .selectAll(".legend-group")
        .data(this.series);

      const legendEnter = legendData.enter().append("g").attr("class", "legend-group");

      legendEnter.append("rect")
        .attr("y", (d, i) => i * (legendRectWidth + 4) + legendRectWidth)
        .attr("x", 10)
        .attr("width", legendRectWidth)
        .attr("height", legendRectWidth)
        .style("fill", ({
          key
        }) => this.colorScale(key));

      legendEnter.append("text")
        .attr("y", (d, i) => i * (legendRectWidth + 4) + legendRectWidth * 1.5)
        .attr("x", 10 + legendRectWidth)
        .attr("dx", 8)
        .attr("class", "legend-name")
        .text(({
          key
        }) => key)


    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.legend-name {
    font-size: 10px;
    dominant-baseline: middle;
}

.epi-axis text {
    font-size: 12pt;
}

.annotation--region-name {
    dominant-baseline: middle;
}

</style>
