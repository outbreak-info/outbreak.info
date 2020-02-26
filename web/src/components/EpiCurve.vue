<template>
<div class="hello">
  <h1>{{ country }}</h1>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-curve">
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-curve"></g>
  </svg>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from 'd3';

const width = 700
const height = 300
const radius = 3
const margin = {
  top: 10,
  right: 20,
  bottom: 20,
  left: 60
}

export default Vue.extend({
  name: "EpiCurve",
  props: {
    country: String,
    data: Array
  },
  data() {
    return {
      width,
      height,
      margin,
      radius,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      // methods
      line: null
    }
  },
  watch: {
    data: function() {
      console.log('data changed!')
      console.log(this.data);

      this.setupPlot();
      this.createScales();
      this.drawDots();
    }
  },
  mounted() {
    this.setupPlot();
    this.createScales();
    this.drawDots();
  },
  methods: {
    setupPlot: function() {
      this.svg = d3.select("svg");
      this.chart = d3.select("#epi-curve");
      this.line = d3.line()
        .x((d: any) => this.x(d.date))
        .y((d: any) => this.y(d.cases));

    },
    createScales: function() {
      this.x = d3.scaleTime()
        .domain(d3.extent(this.data, d => d.date))
        .range([0, this.width]);

        console.log(this.x.domain())

      this.y = d3.scaleLinear()
        .range([this.height, 0])
        .domain([0, d3.max(this.data, d => d.cases)]);

      this.xAxis = d3.axisBottom(this.x).ticks(9);

      this.svg.append('g')
        .attr('class', 'epi-axis axis--x')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
        .call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y);

      this.svg.append('g')
        .attr('class', 'epi-axis axis--y')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .call(this.yAxis);

    },
    drawDots: function() {
      // --- line ---
      this.chart.append("path")
        .datum(this.data)
        .attr("class", "epi-line epi-line--all")
        .attr("d", this.line);

      const dots = this.chart
        .selectAll(".dot-point")
        .data(this.data);

      // -- exit --
      dots.exit().remove();

      // -- enter --
      dots.enter()
        .append("circle")
        .attr("class", 'dot-point')
        .attr("r", this.radius)
        .attr("cy", d => this.y(d.cases))
        .attr("cx", d => this.x(d.date));


    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.epi-axis text {
    font-size: 12pt;
    font-family: $font-family;
}

.epi-line {
    fill: none;
    stroke: red;
    stroke-width: 2;
}
</style>
