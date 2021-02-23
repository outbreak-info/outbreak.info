<template>
<div>
  <svg :width="width" :height="height" class="lineages-by-location" ref="lineages_by_location" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>

    <!-- <g :transform="`translate(${margin.left},${-margin.top})`" class="legend"></g> -->
  </svg>
</div>
</template>


<script lang="js">
import Vue from "vue";

import { uniq } from "lodash";

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
      // variables
      fillVar: "pangolin_lineage",
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
          "#bab0ab"
        ]),
      // methods
      area: null,
      // data
      series: null,
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

      this.colorScale = this.colorScale.domain(d => d[this.fillVar]);

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);

      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

        // stacking
        const keys = uniq(this.data.map(d => d[this.fillVar]));

        this.series = stack()
          .keys(keys)
          .value(d => d.proportion)
          // .order(stackOrderDescending)
          // .order(stackOrderAscending)
          // .order(stackOrderAppearance)
          // .order(stackOrderNone)
          .order(stackOrderReverse)(
            // .order(stackOrderInsideOut)
            this.data
          );
          console.log(this.series)


      select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      if (this.data) {
        console.log(this.data)
        this.updateScales();
        console.log(this.colorScale.domain())
        this.drawPlot();

        const areaSelector = this.chart
          .selectAll(".stacked-area-chart")
          .data(this.series);

        areaSelector
          .join("path")
          .style("fill", key => this.colorScale(key))
          .attr("d", this.area)
          .append("title")
          .text(({
            key
          }) => key);
      }
    },
    drawPlot() {

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
