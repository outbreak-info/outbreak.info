<template>
<div class="country-bar-graph flex-column align-left" :id="`region-graphs-${id}`">
  <h4 class="plot-title">Current COVID-19 cases in {{region}}</h4>

  <svg :width="width + margin.left + margin.right + sparkWidth + 2*margin.gap" :height="height + margin.top + margin.bottom" class="case-counts">
    <g :transform="`translate(${margin.left},${margin.top})`" id="case-counts"></g>
  </svg>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from 'd3';
import {
  cloneDeep
} from "lodash";

import store from '@/store';

const width = 250;
const sparkWidth = 75;
const innerPadding = 0.25;
const margin = {
  top: 5,
  right: 100,
  bottom: 10,
  left: 35,
  gap: 10
}
const transitionDuration = 3500;

export default Vue.extend({
  name: "CountryBarGraph",
  components: {},
  props: {
    region: String,
    id: Number
  },
  data() {
    return {
      width,
      sparkWidth,
      margin,
      innerPadding,
      transitionDuration,
      height: 0,
      barHeight: 0,
      data: null,
      allData: [],

      // axes
      x: d3.scaleLinear().range([width, 0]),
      y: d3.scaleBand().paddingInner(innerPadding),
      xSpark: d3.scaleTime().range([0, sparkWidth]),
      opacityScale: d3.scaleLinear().range([0.5, 1]),
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
    region: function() {
      console.log('watching')
      this.data = this.getData(this.region);
      // this.height = this.barHeight * this.data.length + ((this.data.length - 2) * this.innerPadding);
      // this.updatePlot();
    },
    allData: function() {
      console.log('data@');
      console.log(this.allData)
    }
  },
  mounted() {
    // this.data = store.getters.getCountryCases(this.region);
    // console.log(this.region)
    // console.log(this.data)
    this.barHeight = store.getters.getBarHeight;
    this.allData = store.getters.getCountryCases;
    // this.height = this.barHeight * this.data.length + ((this.data.length - 2) * this.innerPadding);
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    getData: function(region) {
      this.data = this.allData.filter(d => d.region === region);
    },
    colorScale: function(idx) {
      this.data.length
      return store.getters.getRegionColorPalette(this.region, this.data.length, idx);
    },
    updatePlot: function() {
      this.getData(this.region);

      if (this.data) {
        this.height = this.barHeight * this.data.length + ((this.data.length - 2) * this.innerPadding);
        this.updateScales();
        this.prepData();
        this.drawPlot();
      }
    },
    setupPlot: function() {
      this.svg = d3.select(`#region-graphs-${this.id}`).select("svg.case-counts");
      this.chart = this.svg.select("#case-counts");

      this.svg.append('g')
        .attr('class', 'bar-axis axis--y')
        .attr('transform', `translate(${this.margin.left + this.width + this.margin.right - 10}, ${this.margin.top})`);

      // this.line = d3.line()
      //   .x((d: any) => this.xSpark(d.date))
      //   .y((d: any) => d.y);

      this.line = d3.area()
        .x((d: any) => this.xSpark(d.date))
        .y0((d: any) => d.y0)
        .y1((d: any) => d.y);
    },
    prepData: function() {
      this.data.forEach(d => {
        const y = d3.scaleLinear()
          .range([this.y.bandwidth() * 0.8, 0])
          .domain([0, d3.max(d.data.map(d => d.cases))]);

        d.data.forEach(datum => {
          datum['y'] = y(datum.cases);
          datum['y0'] = y(0);
        })
      })
    },
    updateScales: function() {
      this.data.sort((a, b) => a.currentCases - b.currentCases);

      this.x = this.x
        .domain([0, d3.max(this.data, d => d.currentCases)]);

      this.y = this.y.range([this.height, 0])
        .domain(this.data.map(d => d.placeName));

      this.xSpark = this.xSpark
        .domain(d3.extent(this.data.flatMap(d => d.data).map(d => d.date)));

      this.opacityScale = this.opacityScale
        .domain([0, this.data.length - 1]);

      // this.xAxis = d3.axisBottom(this.x);
      //
      // d3.select(".axis--x")
      //   .call(this.xAxis);

      this.yAxis = d3.axisRight(this.y);

      this.svg.select(".axis--y")
        .call(this.yAxis);
    },
    drawPlot: function() {
      // console.log(this.data)
      const t1 = d3.transition().duration(1000);

      // --- group ---
      const grpSelector = this.chart
        .selectAll(".country-count-group")
        .data(this.data);

      // exit
      grpSelector.exit().transition(t1).style("opacity", 1e-5).remove();

      // enter
      const grpEnter = grpSelector.enter()
        .append("g")
        .attr("class", "country-count-group");

      // merge
      grpSelector.merge(grpEnter)
        .attr("id", d => `${d.placeName}`)
        .attr("class", d => `${d.region}`)
        .style("fill", (d, i) => this.colorScale(i))
        .style("stroke", (d, i) => this.colorScale(i))
        // .style("stroke", d => this.colorScale(d.region));


      // --- bars ---
      const barSelector = grpSelector.select(".country-count");

      const barEnter = grpEnter.append("rect")
        .attr("class", "country-count");

      // merge
      barSelector.merge(barEnter)
        // .attr("width", 0)
        .attr("height", this.y.bandwidth())
        .attr("y", d => this.y(d.placeName))
        .style("fill", (d,i) => this.colorScale(i))
        // .style("fill-opacity", (d, i) => this.opacityScale(i))
        // .attr("x", d => this.x(0))
        // .transition(t1)
        .attr("width", d => this.x(0) - this.x(d.currentCases))
        .attr("x", d => this.x(d.currentCases));

      // --- text ---
      const textSelector = grpSelector.select(".annotation--country-count");

      const textEnter = grpEnter.append("text")
        .attr("class", "annotation--country-count");

      // merge
      textSelector.merge(textEnter)
        .attr("x", d => this.x(d.currentCases))
        .attr("dx", "-0.5em")
        .attr("y", d => this.y(d.placeName) + this.y.bandwidth() / 2)
        .style("font-size", this.y.bandwidth())
        .text(d => d.currentCases.toLocaleString())


      // --- sparklines ---
      const sparkSelector = grpSelector.select(".sparkline");

      const sparkEnter = grpEnter.append("path")
        .attr("transform", d => `translate(${this.width + this.margin.gap + this.margin.right}, ${this.y(d.id.replace(/_/g, " "))})`)
        .attr("class", "sparkline");

      // merge
      sparkSelector.merge(sparkEnter)
        .datum(d => d.data)
        .join("path")
        // .style("fill-opacity", (d, i) => this.opacityScale(i))
        .attr("d", this.line);


    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.country-bar-graph .axis--y path,
.country-bar-graph .tick line {
    display: none;
}

.country-bar-graph .axis--y text {
    text-anchor: end;
}

.bar-axis {
    font-size: 14px;
}

.annotation--country-count {
    dominant-baseline: central;
    text-anchor: end;
    stroke: none;
    font-weight: 700 !important;
}

.sparkline {
    // stroke-width: 0.1;
    stroke: none;
    stroke-linecap: round;
}

rect.country-count {
    shape-rendering: crispedges;
}
</style>
