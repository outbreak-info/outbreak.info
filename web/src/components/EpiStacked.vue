<template>
<div class="epidemiology">
  <h4 class="stacked-area-title" v-if="title">{{title}}</h4>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-summary-svg" :id="id">
    <defs>
      <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left},${margin.top})`" class="epi-summary"></g>
    <g :transform="`translate(${margin.left},${-margin.top})`" class="legend"></g>
  </svg>

</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from 'd3';
import store from "@/store";

const width = 500;
const height = 300;
const margin = {
  top: 10,
  right: 100,
  bottom: 25,
  left: 70
}

export default Vue.extend({
  name: "EpiStacked",
  components: {},
  props: {
    id: String,
    title: String,
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
      this.updatePlot();
    }
  },
  mounted() {
    this.updatePlot();
  },
  methods: {
    handleClick: function(key) {
      const getLocations = store.getters['epidata/getCountryFromRegion'];

      this.$router.push({
        path: 'epidemiology',
        query: {
          location: getLocations(key)
        }
      })

      this.$emit("regionSelected", {
        region: key,
        display: false
      })
    },
    handleMouseover: function(key) {
      this.$emit("regionSelected", {
        region: key,
        display: true,
        x: d3.event.x + 10,
        y: d3.event.y + 10
      })
    },
    handleMouseout: function(key) {
      this.$emit("regionSelected", {
        region: key,
        display: false
      })
    },
    colorScale: function(location) {
      const scale = store.getters['colors/getRegionColor'];
      return (scale(location))
    },
    updatePlot: function() {
      if (this.data) {
        this.setupPlot();
        this.createScales();
        this.drawPlot();
      }
    },
    setupPlot: function() {
      this.svg = d3.select(`#${this.id}`);
      this.chart = this.svg.select(".epi-summary");
      this.legend = this.svg.select(".legend");
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

      this.x = this.x
        .domain(d3.extent(this.data.map(d => d.date)))
        .range([0, this.width]);

      this.y = this.y
        .range([this.height, 0])
        .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))]).nice();

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
      const dateCaseDefChange = new Date("2020-02-13");

      // --- annotations ---
      if(Object.keys(this.data[0]).includes("China")){
      const annotGrp = this.chart.append("g")
        .attr("class", "annotation-group case-def-changed");
        annotGrp
        .append("text")
        .attr("x", this.x(dateCaseDefChange))
        .attr("y", this.y(80000))
        .text("Case definition changed");

        const x1 = this.x(new Date("2020-02-08"));
        const x2 = this.x(new Date("2020-02-12"));
        const y1 = this.y(77000);
        const y2 = this.y(55000);

        annotGrp
        .append("path")
          .attr("class", "swoopy-arrow")
          .attr("id", "switch-btn-swoopy-arrow")
          .attr("marker-end", "url(#arrow)")
          // M x-start y-start C x1 y1, x2 y2, x-end y-end -- where x1/y1/x2/y2 are the coordinates of the bezier curve.
          .attr("d", `M ${x1} ${y1} C ${x1 + 5} ${y1 + 45}, ${x2 - 10} ${y2 - 5}, ${x2} ${y2}`)
}
      this.area = d3.area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]));

      this.chart
        .selectAll(".stacked-area-chart")
        .data(this.series)
        .join("path")
        .style("fill", ({
          key
        }) => this.colorScale(key))
        .attr("class", "stacked-area-chart")
        .attr("d", this.area)
        .append("title")
        .text(({
          key
        }) => key)

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
        }) => key);


      // --- tooltips ---
      this.chart.selectAll("path.stacked-area-chart")
        .on("mouseover", (d) => this.handleMouseover(d.key))
        .on("mouseout", (d) => this.handleMouseout(d.key))
        .on("click", (d) => this.handleClick(d.key));

      this.legend.selectAll(".legend-group")
        .on("mouseover", (d) => this.handleMouseover(d.key))
        .on("mouseout", (d) => this.handleMouseout(d.key))
        .on("click", (d) => this.handleClick(d.key));

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

.legend-group,
path.stacked-area-chart {
    cursor: pointer;
}

.stacked-area-title {
    margin: 0.5em 0 0;
}

.case-def-changed {
  font-size: 0.85em;
  text-anchor: middle;
  fill: $grey-60;
}

.swoopy-arrow,
.swoopy-arrowhead {
    stroke: $grey-60;
    fill: none;
    stroke-width: 0.8;
}
.swoopy-arrowhead {
    stroke-width: 1;
}
</style>
