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
const radius = 2.5;
const margin = {
  top: 10,
  right: 100,
  bottom: 75,
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
    tooltipOn: function(d) {
      d3.select(`#tooltip-${d.id}-${d.date_string}`)
      .attr("display", "block");

      d3.select(`#${d.id}-${d.date_string}`).select("circle")
      .attr("r", this.radius*2);

      d3.selectAll(`.epi-region`)
      .style("opacity", 0.35);

      d3.selectAll(`#${d.id}`)
      .style("opacity", 1);

    },
    tooltipOff: function(d) {
      d3.selectAll(".tooltip--epi-curve")
      .attr("display", "none");

      d3.selectAll("circle")
      .attr("r", this.radius);

      d3.selectAll(`.epi-region`)
      .style("opacity", 1);
    },
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
        .x((d: any) => this.x(d.date))
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
      const t1 = d3.transition().duration(4000);
      const formatDate = d3.timeFormat("%d %b %Y");

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
        .attr("id", d => d.metadata.country.replace(/\s/g, "_"))
        .attr("fill", d => this.colorScale(d.metadata.country))
        .attr("stroke", d => this.colorScale(d.metadata.country));

      // --- region annotation ---
      regionsEnter.append("text")
        .attr("class", d => `annotation--region-name ${d.id}`)
        .attr('dx', 8)
        // .attr('x', 0)
        // .attr('y', this.y(0))
        .attr('x', this.width)
        .attr('y', d => this.y(d.metadata.currentCases))
        .text(d => d.metadata.country)
        .style("fill-opacity", 1e-6)
        .transition(t1)
        .delay(1000)

        .style("fill-opacity", 1);

      // --- path ---
      const groupPaths = this.chart
        .selectAll(".epi-region")
        .selectAll(".epi-line");

      regionsEnter
        .append("path")
        .datum(d => d.data)
        .attr("class", d => `epi-line ${d.id}`)
        .attr("d", this.line);


      // --- dots ---
      const dots = this.chart
        .selectAll(".epi-region")
        .selectAll(".epi-point")
        .data(d => d.data);

      dots.exit().remove();

      const dotGroupEnter = dots.enter()
        .append("g")
        .attr("class", d => `epi-point-group ${d.id}`)
        .attr("id", d => `${d.id}-${d.date_string}`);

      const dotEnter = dotGroupEnter
        .append("circle")
        .attr("class", d => `epi-point ${d.id}`)
        .attr("r", this.radius);

      dots.merge(dotEnter)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d.cases));

      // --- tooltips ---
      const tooltipEnter = dotGroupEnter
        .append("g")
        .attr("class", "tooltip--epi-curve")
        .attr("transform", "translate(5,5)")
        .attr("id", d => `tooltip-${d.id}-${d.date_string}`)
        .attr("display", "none");

      dots.merge(tooltipEnter);

      const tooltipRect = dots.select(".tooltip--rect");


      const tooltipRectEnter = tooltipEnter
        .append("rect")
        .attr("class", "tooltip--rect");

      tooltipRect.merge(tooltipRectEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        .attr("width", 100)
        .attr("height", 40)
        .attr("stroke-dasharray", "100, 180")
        .attr("stroke-width", "3")
        .attr("fill-opacity", 0.4)

      const tooltipText = dots.select(".tooltip--text");

      const tooltipTextEnter = tooltipEnter
        .append("text")
        .attr("class", "tooltip--text")
        .attr("transform", "translate(5,5)");

      // const tooltipCtryEnter = tooltipTextEnter.append("tspan")
      //   .attr("class", "tooltip--country");
      //
      // tooltipText.merge(tooltipCtryEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.cases))
      //   .text(d => d.id.replace(/_/g, " "))

      const tooltipDateEnter = tooltipTextEnter.append("tspan")
        .attr("class", "tooltip--date");

      tooltipText.merge(tooltipDateEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        // .attr("dy", "1.1em")
        .text(d => formatDate(d.date))

      const tooltipCasesEnter = tooltipTextEnter.append("tspan")
        .attr("class", "tooltip--case-count");

      tooltipText.merge(tooltipCasesEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        .attr("dy", "1.1em")
        // .attr("dy", "2.2em")
        .text(d => `${d.cases} cases`)

      console.log(tooltipRect)
      // dynamically adjust the width of the rect
      // dots.selectAll(".tooltip--epi-curve").selectAll('rect')
      // .attr("width", function(d: any) {
      //   console.log(d3.select(this.parentNode));
      //   return(500)
      // })
      dots.select(".tooltip--rect").attr("width", d => 500)
        // `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().width + 10}`)
        .attr("height", (d: any) => `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().height + 5}`);

      // event listener
      d3.selectAll("circle")
        .on("mouseover", d => this.tooltipOn(d))
        .on("mouseout", d => this.tooltipOff(d))



      // --- transition: trace the curves ---
      this.chart.append("rect")
        .attr("class", "transition-curtain")
        .attr("width", this.width + this.radius + this.margin.right)
        .attr("height", this.height + this.margin.top + this.radius * 2)
        .attr("x", -this.radius)
        .attr("y", -this.margin.top)
        .style("fill", "white")
        .transition(t1)
        .ease(d3.easeLinear)
        .attr("x", this.width + this.margin.right)

    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.epi-axis text {
    font-size: 12pt;
}

.epi-line {
    fill: none;
    stroke-width: 2;
}

.epi-point {
    // opacity: 0.4;
}

.annotation--region-name {
    dominant-baseline: middle;
}

.tooltip--text {
    dominant-baseline: hanging;
}

.tooltip--date {
    font-weight: 300;
}

.tooltip--case-count {
    font-weight: 500;
}
</style>
