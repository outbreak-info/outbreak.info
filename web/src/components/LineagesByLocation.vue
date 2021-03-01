<template>
<div>
  <svg :width="width" :height="height" class="lineages-by-location" ref="lineages_by_location" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>
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
  stackOrderInsideOut,
  // stackOrderAscending,
  // stackOrderDescending,
  event,
  extent,
  format,
  max
} from "d3";


export default Vue.extend({
  name: "LineagesByLocation",
  components: {},
  props: {
    data: Array,
    colorScale: Function
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
      // variables
      fillVar: "pangolin_lineage",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      area: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null
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
        .join(enter => {
            enter.append("path")
              .attr("fill", ({
                key
              }) => this.colorScale(key))
              .attr("id", ({
                key
              }) => `area_${key.replace(/\./g, "-")}`)
              .attr("d", this.area)
              .style("stroke", "white")
              .style("stroke-width", 0.5)
              .append("title")
              .text(({
                key
              }) => key)
          },
          update =>
          update
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
          }) => key),
          exit =>
          exit.call(exit =>
            exit
            .transition()
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
