<template>
<div class="epidemiology flex-column align-left">
  <h1 v-if="country">{{ country }}</h1>
  <h3 class="plot-title">Cumulative number of COVID-19 cases</h3>
  <DataUpdated />
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-curve">
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-curve"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="transition-mask"></g>
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
const radius = 2.5;
const margin = {
  top: 10,
  right: 100,
  bottom: 75,
  left: 60
}
const transitionDuration = 3500;

export default Vue.extend({
  name: "EpiCurve",
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
      radius,
      transitionDuration,
      // axes
      x: d3.scaleTime().range([0, width]),
      y: d3.scaleLinear().range([height, 0]),
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
      this.updatePlot();
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    tooltipOn: function(d) {
      d3.select(`#tooltip-${d.id}-${d.date_string}`)
        .attr("display", "block");

      d3.select(`#${d.id}-${d.date_string}`)
        .attr("r", this.radius * 2);

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
        this.updateScales();
        this.drawDots();
      }
    },
    setupPlot: function() {
      this.svg = d3.select("svg.epi-curve");
      this.chart = d3.select("#epi-curve");
      this.line = d3.line()
        .x((d: any) => this.x(d.date))
        .y((d: any) => this.y(d.cases));

      this.svg.append('g')
        .attr('class', 'epi-axis axis--x')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`);

      this.svg.append('g')
        .attr('class', 'epi-axis axis--y')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    },
    updateScales: function() {
      this.x = this.x
        .domain(d3.extent(this.data.flatMap(d => d.data).map(d => d.date)));

      this.y = this.y
        .domain([0, d3.max(this.data.flatMap(d => d.data).map(d => d.cases))]);

      this.colorScale = this.colorScale
        .domain(this.data.flatMap(d => d.metadata).map(d => d.country))

      this.xAxis = d3.axisBottom(this.x).ticks(9);

      d3.select(".axis--x")
        .call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y);

      d3.select(".axis--y")
        .call(this.yAxis);
    },
    drawDots: function() {
      const t1 = d3.transition().duration(this.transitionDuration);
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
        .attr("class", "epi-region");

      regionGroups.merge(regionsEnter)
        .attr("id", d => d.metadata.id)
        .attr("fill", d => this.colorScale(d.metadata.country))
        .attr("stroke", d => this.colorScale(d.metadata.country));

      // --- region annotation ---
      const countrySelector = this.chart.selectAll(".epi-region")
        .select(".annotation--region-name");

      const textEnter = regionsEnter.append("text")
        .style("stroke", "none")
        .attr('dx', 8)
        .style("opacity", 1e-6)
        .transition(t1)
        .delay(1000)
        .style("opacity", 1)

      countrySelector.merge(textEnter)
        // .attr('x', 0)
        // .attr('y', this.y(0))
        .attr("class", d => `annotation--region-name ${d.metadata.id}`)
        .attr('x', this.width)
        .attr('y', d => this.y(d.metadata.currentCases))
        .text(d => d.metadata.country)
        .style("opacity", 1e-6)
        .transition(t1)
        .delay(1000)
        .style("opacity", 1);

      // --- path ---
      const pathEnter = regionsEnter
        .append("path")
        .attr("class", "epi-line");

      const pathSelector = this.chart
        .selectAll(".epi-region")
        .select(".epi-line");

      pathSelector.merge(pathEnter)
        .datum(d => d.data)
        .attr("id", d => `epi-line ${d[0].id}`)
        .attr("d", this.line);


      // --- dots ---
      const dotGroupSelector = this.chart
        .selectAll(".epi-region")
        .selectAll(".epi-point")
        .data(d => d.data);

      dotGroupSelector.exit().remove();

      const dotGroupEnter = dotGroupSelector.enter()
        .append("circle")
        .attr("r", this.radius)
        .attr("class", "epi-point");

      dotGroupSelector.merge(dotGroupEnter)
        .attr("class", d => `epi-point ${d.id}`)
        .attr("id", d => `${d.id}-${d.date_string}`)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d.cases));

      // --- tooltips ---
      // need to be outside the path/dot groups, so they're on top of all the curves.
      // OUTER GROUP: one per country
      const tooltipGroupSelector = this.chart
        .selectAll(".epi-tooltip-group")
        .data(this.data);

      // -- exit --
      tooltipGroupSelector.exit().remove();

      // -- enter --
      const tooltipGroupEnter = tooltipGroupSelector.enter()
        .append("g")
        .attr("class", "epi-tooltip-group")
        .attr("fill", d => this.colorScale(d.metadata.country))
        .attr("stroke", d => this.colorScale(d.metadata.country));

      tooltipGroupSelector.merge(tooltipGroupEnter)
        .attr("class", d => `epi-tooltip-group ${d.metadata.id}`);

      // INNER GROUPS: one per timepoint
      const tooltipSelector = this.chart
        .selectAll(".epi-tooltip-group")
        .selectAll(".tooltip--epi-curve")
        .data(d => d.data);

      tooltipSelector.exit().remove();

      const tooltipEnter = tooltipSelector.enter()
        .append("g")
        .attr("class", "tooltip--epi-curve")
        .attr("transform", "translate(5,5)")
        .attr("display", "none");

      tooltipSelector.merge(tooltipEnter)
        .attr("id", d => `tooltip-${d.id}-${d.date_string}`);

      const tooltipRect = tooltipSelector.select(".tooltip--rect");


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

      const tooltipText = tooltipSelector.select(".tooltip--text");

      const tooltipTextEnter = tooltipEnter
        .append("text")
        .attr("class", "tooltip--text default-black")
        .attr("transform", "translate(5,5)");

      // const tooltipCtryEnter = tooltipTextEnter.append("tspan")
      //   .attr("class", "tooltip--country");
      //
      // tooltipText.select(".tooltip--country").merge(tooltipCtryEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.cases))
      //   .text(d => d.id.replace(/_/g, " "))

      const tooltipDateEnter = tooltipTextEnter.append("tspan")
        .attr("class", "tooltip--date");

      tooltipText.select(".tooltip--date").merge(tooltipDateEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        // .attr("dy", "1.1em")
        .text(d => formatDate(d.date))

      const tooltipCasesEnter = tooltipTextEnter.append("tspan")
        .attr("class", "tooltip--case-count");

      tooltipText.select(".tooltip--case-count").merge(tooltipCasesEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        .attr("dy", "1.1em")
        // .attr("dy", "2.2em")
        .text(d => `${d.cases} cases`)

      // dynamically adjust the width of the rect
      // dots.selectAll(".tooltip--epi-curve").selectAll('rect')
      // .attr("width", function(d: any) {
      //   console.log(d3.select(this.parentNode));
      //   return(500)
      // })
      // dots.select(".tooltip--rect").attr("width", d => 500)
      // `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().width + 10}`)
      // .attr("height", (d: any) => `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().height + 5}`);

      // event listener
      d3.selectAll("circle")
        .on("mouseover", d => this.tooltipOn(d))
        .on("mouseout", d => this.tooltipOff(d))


      // --- transition: trace the curves ---
      const curtainSelector = this.svg.select("#transition-mask").selectAll(".transition-curtain").data([0]);

      curtainSelector.exit().remove();

      const curtainEnter = curtainSelector
        .enter().append("rect")
        .attr("class", "transition-curtain")
        .style("fill", "white")
        .attr("y", -this.margin.top)
        .attr("width", this.width + this.radius + this.margin.right)
        .attr("height", this.height + this.margin.top + this.radius * 2);

      curtainSelector.merge(curtainEnter)
        .attr("x", -this.radius)
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
    stroke: none !important;
}

.tooltip--date {
    font-weight: 300;
}

.tooltip--case-count {
    font-weight: 500;
}
</style>
