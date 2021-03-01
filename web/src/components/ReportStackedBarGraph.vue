<template>
<div>
  <svg :width="width" :height="height" class="report-stacked-bar" ref="stacked_bar" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <!-- <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g> -->
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
    data: Array,
    location: String,
    locationType: String,
    rectWidth: {
      type: Number,
      default: 25
    }
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
      fillVar: "key",
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
      this.chart = select(this.$refs.chart);
    },
    updateScales() {
      this.y = this.y
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .nice()
        .domain([0, 1]);

      this.lineages = Object.keys(this.data[0]);
      this.colorScale = this.colorScale.domain(this.lineages);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      // stacking
      this.series = stack()
        .keys(this.lineages)
        .order(stackOrderDescending)
      // .order(stackOrderAscending)
      // .order(stackOrderAppearance)
      // .order(stackOrderNone)
      // .order(stackOrderReverse)
      // .order(stackOrderInsideOut)
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
      const barSelector = this.chart
        .selectAll(".stacked-bar-chart")
        .data(this.series);

      barSelector.join(
        enter => {
          const barGrp = enter.append("g")
            .attr("class", "stacked-bar-chart")
            .attr("id", d => d.key.replace(/\./g, "-"))

          barGrp.append("rect")
            .attr("x", 0)
            .attr("width", this.rectWidth)
            .attr("y", d => this.y(d[0][0]))
            .attr("height", d => this.y(d[0][1]) - this.y(d[0][0]))
            .attr("fill", d => this.colorScale(d.key))

          barGrp.append("text")
            .attr("x", this.rectWidth)
            .attr("dx", 10)
            .attr("y", d => this.y(d[0][0]))
            .attr("dy", d => (this.y(d[0][1]) - this.y(d[0][0])) / 2)
            .text(d => d.key)
            .style("dominant-baseline", "central")
            .classed("pointer", d => d.key.toLowerCase() != "other")
            .classed("hover-underline", d => d.key.toLowerCase() != "other")
            .on("click", d => this.route2Lineage(d.key))
        }
      )
    },
    route2Lineage(pango) {
      if (this.locationType == "country") {
        this.$router.push({
          name: "MutationReport",
          query: {
            country: this.location,
            pango: pango,
            selected: this.location,
            selectedType: this.locationType
          }
        })
      } else {
        this.$router.push({
          name: "MutationReport",
          query: {
            division: this.location,
            pango: pango,
            selected: this.location,
            selectedType: this.locationType
          }
        })
      }
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

<style lang="scss">
.hover-underline:hover {
  text-decoration: underline;
}
</style>
