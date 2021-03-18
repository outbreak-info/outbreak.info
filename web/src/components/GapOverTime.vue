<template>
<div class="d-flex flex-column">
  <h5 class="text-muted">Weekly median difference between sample collection and sequence submission in days</h5>
  <svg :width="width" :height="height" id="gap-over-time">
    <g ref="chart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom + 1})`" class="prevalence-axis total-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yAxisLeft"></g>
  </svg>
</div>
</template>

<script>
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  event,
  min,
  max,
  format,
  line,
  transition,
  timeDay
} from "d3";

export default Vue.extend({
  name: "SequencingHistogram",
  props: {
    data: Array,
    setWidth: {
      type: Number,
      default: 1000
    },
    height: {
      type: Number,
      default: 400
    },
    margin: {
      type: Object,
      default: () => {
        return ({
          top: 10,
          bottom: 30,
          left: 50,
          right: 10
        })
      }
    },
    fillColor: {
      type: String,
      default: "#9edae5"
    }
  },
  watch: {
    data() {
      this.updatePlot()
    }
  },
  data() {
    return ({
      // dims
      width: 1000,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // variables
      radius: 7,
      xVariable: "maxDate",
      yVariable: "median",
      // refs
      chart: null,
      // methods
      line: null
    })
  },
  methods: {
    updatePlot() {
      if (this.data) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    setupPlot() {
      this.$nextTick(function() {
        window.addEventListener("resize", this.setDims);

        // set initial dimensions for the plots.
        this.setDims();
      });

      this.chart = select(this.$refs.chart);

      // line method
      this.line = line()
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.yVariable]));
    },
    setDims() {
      if (this.setWidth) {
        this.width = this.setWidth;
      }
    },
    updateAxes() {
      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.data, d => d[this.xVariable]))

      const maxCounts = max(this.data.flatMap(d => d.gaps), d => d);
      // const maxCounts = max(this.data.map(d => d[this.yVariable]));
      this.y = scaleLinear()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, maxCounts]);

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickSizeOuter(0);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y)
        .ticks(this.numYTicks)
        .tickSizeOuter(0);
      select(this.$refs.yAxisLeft).call(this.yAxis);

    },
    drawPlot() {
      const t1 = transition().duration(1500);

      const dotSelector = this.chart
        .selectAll("seq-gap")
        .data(this.data);

      dotSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("id", d => `week${d.week}`)
            .attr("class", "seq-gap")
            .attr("cx", d => this.x(d[this.xVariable]));

          grp.selectAll(".seq-gap")
            .data(d => d.gaps)
            .enter()
            .append("circle")
            .attr('cx', function(d) {
              return (select(this.parentNode).attr("cx"));
            })
            .attr("cy", d => this.y(d))
            .attr("r", this.radius)
            .style("fill-opacity", 0.05)
            .style("fill", "#bab0ab")
        },
        update => {

        },
        exit =>
        exit.call(exit =>
          exit
          .transition(10)
          .style("opacity", 1e-5)
          .remove()
        )
      )

      const lineSelector = this.chart
        .selectAll(".time-trace")
        .data([this.data]);

      lineSelector.join(
        enter => {
          enter.append("path")
            .attr("class", "time-trace")
            .attr("d", this.line)
            .style("stroke", this.fillColor)
            .style("fill", "none")
            .style("stroke-width", "2.5")
        },
        update => {
          update
            .transition(t1)
            .attr("d", this.line)
        },
        exit =>
        exit.call(exit =>
          exit
          .transition(10)
          .style("opacity", 1e-5)
          .remove()
        )
      )
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
</script>

<style lang="scss">
#gap-over-time {
    .axis--x text,
    .axis--y text {
        font-size: 16px;
        fill: $grey-90;

    }
}
</style>
