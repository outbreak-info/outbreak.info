<template>
<div>
  <svg :width="width" :height="height" class="lineages-by-location" ref="lineages_by_location" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>
  </svg>
  <svg :width="width" :height="legendHeight" class="lineages-by-location lineages-by-location-legend" ref="legend">
  </svg>
</div>
</template>


<script lang="js">
import Vue from "vue";

import {
  uniq
} from "lodash";

import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  axisLeft,
  axisBottom,
  area,
  stack,
  stackOrderReverse,
  stackOrderInsideOut,
  stackOrderAscending,
  stackOrderDescending,
  event,
  extent,
  format,
  scaleOrdinal,
  max
} from "d3";


export default Vue.extend({
  name: "LineagesByLocation",
  components: {},
  props: {
    data: Array
  },
  computed: {
    title() {
      return ("Lineage prevalence over time")
    }
  },
  watch: {
    width: function() {
      this.updatePlot();
    },
    data: function() {
      this.updatePlot();
    }
  },
  data() {
    return ({
      // dimensions
      margin: {
        top: 10,
        bottom: 25,
        left: 50,
        right: 10
      },
      width: 800,
      height: 600,
      legendHeight: null,
      // variables
      fillVar: "pangolin_lineage",
      legendRectWidth: 15,
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      colorScale: scaleOrdinal(
        [
          "#1f77b4", // dk blue
          "#aec7e8", // lt blue
          "#f28e2c", // orange
          "#e15759", // red
          "#9edae5", // teal
          "#59a14f", // green
          "#edc949", // yellow
          "#9467bd", // purple
          "#ff9da7", // pink
          "#8c564b", // brown
          "#555555", // grey
          "#bcbd22", // puce
          "#bab0ab",
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "red"
        ]),
      // methods
      area: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null,
      legend: null
    })
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);
    })

    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  methods: {
    setDims() {},
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.legend = select(this.$refs.legend);
      this.chart = select(this.$refs.chart);

      this.area = area()
        .x(d => this.x(d.data.date_time))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]));
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.data.map(d => d.date_time)));

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, 1]);

      this.lineages = Object.keys(this.data[0]).filter(d => d != "date_time");
      console.log(this.lineages)
      this.colorScale = this.colorScale.domain(this.lineages);
      this.legendHeight = 600; //this.lineages * (this.legendRectWidth + 4);

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);

      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      // stacking
      this.series = stack()
        .keys(this.lineages)
        // .order(stackOrderDescending)
        // .order(stackOrderAscending)
        // .order(stackOrderAppearance)
        // .order(stackOrderNone)
        // .order(stackOrderReverse)
        .order(stackOrderInsideOut)
        (this.data)
      console.log(this.series)

      select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot();
      }
    },
    drawPlot() {
      const areaSelector = this.chart
        .selectAll(".stacked-area-chart")
        .data(this.series);

      areaSelector
        .join("path")
        .attr("fill", ({
          key
        }) => this.colorScale(key))
        .attr("id", ({
          key
        }) => `area_${key.replace(/\./g, "-")}`)
        .attr("d", this.area)
        .append("title")
        .text(({
          key
        }) => key)

      const legendSelector = this.legend
        .selectAll(".legend")
        .data(this.lineages, d => d);

      legendSelector.join(enter => {
          const legendGrp = enter
            .append("g")
            .attr("id", d => `legend_${d.replace(/\./g, "_")}`);

          legendGrp.append("rect")
            .attr("width", this.legendRectWidth)
            .attr("height", this.legendRectWidth)
            .attr("x", 0)
            .attr("y", (d, i) => i * (this.legendRectWidth + 2))
            .style("fill", d => this.colorScale(d))
            .style("stroke", "#555")
            .style("stroke-width", 0.25)

          legendGrp.append("text")
            .attr("x", this.legendRectWidth + 4)
            .attr("y", (d, i) => i * (this.legendRectWidth + 2))
            .attr("dy", this.legendRectWidth / 2)
            .text(d => d)
            .style("dominant-baseline", "central")
        },
        update => {
          update.select("rect")
            .attr("width", this.legendRectWidth)
            .attr("height", this.legendRectWidth)
            .attr("y", (d, i) => i * (this.legendRectWidth + 2))
            .style("fill", d => this.colorScale(d))

          update.select("text")
            .attr("x", this.legendRectWidth + 4)
            .attr("y", (d, i) => i * (this.legendRectWidth + 2))
            .text(d => d)
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      )
    },
    debounce(fn, delay) {
      var timer = null;
      return function() {
        var context = this,
          args = arguments,
          evt = event;
        //we get the D3 event here
        clearTimeout(timer);
        timer = setTimeout(function() {
          context.event = evt;
          //and use the reference here
          fn.apply(context, args);
        }, delay);
      };
    }
  }
})
</script>
