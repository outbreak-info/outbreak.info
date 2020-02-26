<template>
<div class="epidemiology">
  <h1 v-if="country">{{ country }}</h1>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-curve">
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-curve"></g>
  </svg>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from 'd3';
import {
  schemeTableau10
} from 'd3-scale-chromatic';

const width = 500;
const height = 300;
const radius = 3;
const margin = {
  top: 10,
  right: 100,
  bottom: 25,
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
      x: d3.scaleTime(),
      y: d3.scaleLinear(),
      colorScale: d3.scaleOrdinal(schemeTableau10),
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
        this.drawDots();
      }
    },
    setupPlot: function() {
      this.svg = d3.select("svg");
      this.chart = d3.select("#epi-curve");
      this.line = d3.line()
        .x((d: any) => {
          console.log(d)
          return (this.x(d.date))
        })
        .y((d: any) => this.y(d.cases));
    },
    createScales: function() {
      this.x = this.x
        .domain(d3.extent(this.data.flatMap(d => d.data).map(d => d.date)))
        .range([0, this.width]);

      this.y = this.y
        .range([this.height, 0])
        .domain([0, d3.max(this.data.flatMap(d => d.data).map(d => d.cases))]);

      this.colorScale = this.colorScale
        .domain(this.data.flatMap(d => d.metadata).map(d => d.country))

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
      const t1 = d3.transition().duration(2000);

      // --- create groups for each region ---
      const regionGroups = this.chart
        .selectAll(".epi-region")
        .data(this.data);

      // -- exit --
      regionGroups.exit().remove();

      // -- enter --
      const regionsEnter = regionGroups.enter()
        .append("g")
        .attr("class", "epi-region")
        .attr("id", d => d.metadata.country)
        .attr("fill", d => this.colorScale(d.metadata.country));

      // --- region annotation ---
      regionsEnter.append("text")
      .attr('class', 'annotation--region-name')
      .attr('dx', 8)
      .attr('x', 0)
      .attr('y', this.y(0))
      .text(d => d.metadata.country)
      // .style("fill-opacity", 1e-6)
      .transition(t1)
      .attr('x', this.width)
      .attr('y', d => this.y(d.metadata.currentCases))
      // .style("fill-opacity", 1);

      // --- path ---
      // const groupPaths = this.chart
      //   .selectAll(".epi-region")
      //   .selectAll(".epi-line")
      //   .data(d => d.data);
      //
      // groupPaths.exit().remove();
      //
      // const pathEnter = this.chart.selectAll(".epi-line").enter()
      //   .append("path")
      //   .datum(this.data.map(d => d.data))
      //   .attr("class", "epi-line epi-line--all")
      //
      // groupPaths.merge(pathEnter)
      //   .attr("d", this.line);

      // --- dots ---
      const dots = this.chart
        .selectAll(".epi-region")
        .selectAll(".epi-point")
        .data(d => d.data);

      dots.exit().remove();

      const dotEnter = dots.enter()
        .append("circle")
        .attr("class", 'epi-point')
        .attr("r", this.radius);

      dots.merge(dotEnter)
        .attr('cx', 0)
        .attr('cy', this.y(0))
        .transition(t1)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d.cases));

      // --- paths ---
      const paths = this.chart
        .selectAll(".epi-region");

      paths.exit().remove();

      const pathEnter = paths
        .append("path")
        .datum(d => d.data)
        .attr("class", 'epi-line');

      paths.merge(pathEnter)
        .attr("d", this.line);
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

.epi-point {
    // opacity: 0.4;
}

.annotation--region-name {
    dominant-baseline: middle;
}
</style>
