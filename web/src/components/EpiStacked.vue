<template>
  <div class="epidemiology-area">
    <h4
      class="stacked-area-title pt-2 pb-4"
      v-if="title && data && data.length > 0"
    >
      {{ title }}
    </h4>
    <svg :width="width" :height="height" class="epi-summary-svg" :id="id">
      <defs>
        <marker
          id="arrow"
          markerWidth="13"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        class="epi-summary"
      >
        <g class="annotation-group case-def-changed"></g>
      </g>
      <g class="epi-axis axis--x"></g>
      <g class="epi-axis axis--y"></g>

      <g
        :transform="`translate(${margin.left},${-margin.top})`"
        class="legend"
      ></g>
    </svg>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import * as d3 from "d3";
import store from "@/store";

const margin = {
  top: 10,
  right: 50,
  bottom: 25,
  left: 100
};

export default Vue.extend({
  name: "EpiStacked",
  components: {},
  props: {
    id: String,
    title: String,
    data: Array,
    width: Number,
    height: Number,
    includeChinaAnnot: Boolean
  },
  data() {
    return {
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
    };
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    width: function() {
      this.updatePlot();
    },
    height: function() {
      this.updatePlot();
    }
  },
  mounted() {
    this.updatePlot();
  },
  methods: {
    handleClick: function(key) {
      this.$emit("regionSelected", {
        region: key,
        display: false,
        displayMore: true
      });
    },
    handleMouseover: function(d) {
      d3.selectAll(".legend-group").style("opacity", 0.4);

      d3.selectAll(".stacked-area-chart").style("opacity", 0.4);

      d3.selectAll(
        `.${d.key
          .replace(/\s/g, "_")
          .replace(/\//g, "_")
          .replace(/&/g, "_")
          .replace(/:/g, "_")
          .replace(/\(/g, "_")
          .replace(/\)/g, "_")}`
      ).style("opacity", 1);

      this.$emit("regionSelected", {
        region: d.key,
        display: true,
        currentCases: d.slice(-1)[0].data[d.key],
        x: d3.event.x + 10,
        y: d3.event.y + 10
      });
    },
    handleMouseout: function(key) {
      d3.selectAll(".legend-group").style("opacity", 1);

      d3.selectAll(".stacked-area-chart").style("opacity", 1);

      this.$emit("regionSelected", {
        region: key,
        display: false
      });
    },
    colorScale: function(location) {
      const scale = store.getters["colors/getRegionColor"];
      return scale(location);
    },
    updatePlot: function() {
      if (this.data) {
        this.setupPlot();
        this.updateScales();
        this.drawPlot();
      }
    },
    setupPlot: function() {
      this.svg = d3.select(`#${this.id}`);
      this.chart = this.svg.select(".epi-summary");
      this.legend = this.svg.select(".legend");
    },
    updateScales: function() {
      const keys = Object.keys(this.data[0]).filter(d => d !== "date");

      this.series = d3
        .stack()
        .keys(keys)
        // .order(d3.stackOrderDescending)
        // .order(d3.stackOrderAscending)
        // .order(d3.stackOrderAppearance)
        // .order(d3.stackOrderNone)
        .order(d3.stackOrderReverse)(
        // .order(d3.stackOrderInsideOut)
        this.data
      );

      this.x = this.x
        .domain(d3.extent(this.data.map(d => d.date)))
        .range([0, this.width - this.margin.left - this.margin.right]);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, d3.max(this.series, d => d3.max(d, d => d[1]))])
        .nice();

      const numXTicks = this.width < 575 ? 3 : 6;
      this.xAxis = d3.axisBottom(this.x).ticks(numXTicks);

      this.svg
        .select(".axis--x")
        .attr(
          "transform",
          `translate(${this.margin.left}, ${this.height -
            this.margin.bottom +
            2})`
        )
        .call(this.xAxis);

      const numYTicks = this.height < 375 ? 5 : 10;
      this.yAxis = d3.axisLeft(this.y).ticks(numYTicks);

      this.svg
        .select(".axis--y")
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .call(this.yAxis);
    },
    drawPlot: function() {

      // --- annotations ---
      this.area = d3
        .area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]));

      const areaSelector = this.chart
        .selectAll(".stacked-area-chart")
        .data(this.series);

      areaSelector
        .join("path")
        .style("fill", ({ key }) => this.colorScale(key))
        .attr(
          "class",
          d =>
            `stacked-area-chart ${d.key
              .replace(/\s/g, "_")
              .replace(/&/g, "_")
              .replace(/:/g, "_")
              .replace(/\//g, "_")
              .replace(/\(/g, "_")
              .replace(/\)/g, "_")}`
        )
        .attr("d", this.area)
        .append("title")
        .text(({ key }) => key);

      const legendRectWidth = 15;

      const legendData = this.legend
        .selectAll(".legend-group")
        .data(this.series);

      const legendEnter = legendData
        .enter()
        .append("g")
        .attr(
          "class",
          d =>
            `legend-group ${d.key
              .replace(/\s/g, "_")
              .replace(/&/g, "_")
              .replace(/:/g, "_")
              .replace(/\//g, "_")
              .replace(/\(/g, "_")
              .replace(/\)/g, "_")}`
        );

      legendEnter
        .append("rect")
        .attr("y", (d, i) => i * (legendRectWidth + 4) + legendRectWidth)
        .attr("x", 10)
        .attr("width", legendRectWidth)
        .attr("height", legendRectWidth)
        .style("fill", ({ key }) => this.colorScale(key));

      legendEnter
        .append("text")
        .attr("y", (d, i) => i * (legendRectWidth + 4) + legendRectWidth * 1.5)
        .attr("x", 10 + legendRectWidth)
        .attr("dx", 8)
        .attr("class", "legend-name")
        .text(({ key }) => key);

      // --- tooltips ---
      this.chart
        .selectAll("path.stacked-area-chart")
        .on("mouseover", d => this.handleMouseover(d))
        .on("mouseout", d => this.handleMouseout(d.key))
        .on("click", d => this.handleClick(d.key));

      this.legend
        .selectAll(".legend-group")
        .on("mouseover", d => this.handleMouseover(d))
        .on("mouseout", d => this.handleMouseout(d.key))
        .on("click", d => this.handleClick(d.key));
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.legend-name {
  font-size: 10px;
  dominant-baseline: middle;
  &:hover {
    text-decoration: underline;
  }
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
