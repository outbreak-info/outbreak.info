<template>
<div class="" ref="dotplot_container">
  <h6 class="text-left">Worst change</h6>
  <svg :width="width" :height="height" ref="dotplot_svg" class="dotplot-svg" :name="title">
    <g ref="circles" class="circles-group" :transform="`translate(${margin.left}, ${margin.top})`">
      <line :x1="x(0)" :x2="x(0)" :y1="0" :y2="height - margin.top - margin.bottom" v-if="x" stroke="black" stroke-width="0.5"></line>
    </g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="epi-axis axis--x" ref="xAxis" id="xAxis"></g>
    <!-- <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis" id="yAxis"></g> -->
  </svg>
</div>
</template>

<script>
import * as d3 from "d3";
import {
  cloneDeep
} from "lodash";

export default {
  name: "DotPlot",
  props: {
    data: Array,
    variable: String,
    title: String,
    sortAsc: Boolean,
    colorScale: Function
  },
  watch: {
    data: function() {
      this.drawPlot();
    }
  },
  data() {
    return {
      num2Plot: 5,
      width: 300,
      height: 150,
      widthLegend: 200,
      margin: {
        top: 0,
        right: 30,
        bottom: 30,
        left: 130
      },
      radius: 6,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      // data
      plottedData: null
    };
  },
  mounted() {
    this.setupPlot();
    this.drawPlot();
  },
  methods: {
    setupPlot() {
      this.svg = d3.select(this.$refs.dotplot_svg);
      this.chart = d3.select(this.$refs.circles);
    },
    prepData() {
      this.plottedData = cloneDeep(this.data);
      if (this.sortAsc) {
        this.plottedData.sort((a, b) => a[this.variable] - b[this.variable]);
        this.plottedData = this.plottedData.slice(0, this.num2Plot);
      } else {
        this.plottedData.sort((a, b) => b[this.variable] - a[this.variable]);
        this.plottedData = this.plottedData.slice(0, this.num2Plot);
      }

    },
    updateAxes() {
      this.x = d3.scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([-200, 5000]);
      // .domain(d3.extent(this.plottedData.map(d => d[this.variable])));

      this.y = d3.scaleBand()
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.plottedData.map(d => d.name));

      this.xAxis = d3
        .axisBottom(this.x)
        .ticks(2)
        .tickSizeOuter(0)

      d3.select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0);

      d3.select(this.$refs.yAxis).call(this.yAxis);

    },
    drawPlot() {
      this.prepData();
      this.updateAxes();

      const t1 = d3.transition().duration(2000);

      const lolliSelector = this.chart.selectAll(".lollipop")
        .data(this.plottedData, d => d.location_id);

      lolliSelector.join(
        enter => enter.append("line")
        .attr("class", "lollipop line-most-change")
        .attr("id", d => `lollipop-change-${d._id}`)
        .attr("x1", d => this.x(0))
        .attr("x2", d => this.x(d[this.variable]))
        .attr("y1", d => this.y(d.name) + this.y.bandwidth() / 2)
        .attr("y2", d => this.y(d.name) + this.y.bandwidth() / 2)
        .style("stroke", "#2c3e50")
        .style("stroke-width", 0.75),

        update =>
        update
        .attr("id", d => `lollipop-change-${d._id}`)
        .attr("x1", d => this.x(0))
        .attr("x2", d => this.x(0))
        .attr("y1", d => this.y(d.name) + this.y.bandwidth() / 2)
        .attr("y2", d => this.y(d.name) + this.y.bandwidth() / 2)
        .call(update => update.transition(t1).attr("x2", d => this.x(d[this.variable]))),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );


      const circleSelector = this.chart.selectAll("circle")
        .data(this.plottedData, d => d.location_id);

      circleSelector.join(
        enter => enter.append("circle")
        .attr("class", "circle-most-change")
        .attr("id", d => `circle-change-${d._id}`)
        .attr("cx", d => this.x(d[this.variable]))
        .attr("cy", d => this.y(d.name) + this.y.bandwidth() / 2)
        .attr("r", this.radius)
        .style("fill", d => this.colorScale(d[this.variable]))
        .style("stroke", "#2c3e50")
        .style("stroke-width", 0.5),

        update =>
        update
        .attr("id", d => `circle-change-${d._id}`)
        .attr("cx", d => this.x(0))
        .call(update => update.transition(t1)
          .style("fill", d => this.colorScale(d[this.variable]))
          .attr("cx", d => this.x(d[this.variable]))
          .attr("cy", d => this.y(d.name) + this.y.bandwidth() / 2)),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );

      const yAxSelector = this.chart.selectAll(".y-axis")
        .data(this.plottedData, d => d.location_id);

      yAxSelector.join(
        enter => enter.append("text")
        .attr("class", "location-most-change y-axis")
        .attr("id", d => `location-change-${d._id}`)
        .attr("x", d => this.x(0))
        .attr("dx", this.sortAsc ? 5 : -5)
        .attr("y", d => this.y(d.name) + this.y.bandwidth() / 2)
        .text(d => d.name)
        .style("text-anchor", this.sortAsc ? "start" : "end")
        .style("dominant-baseline", "middle")
        .style("fill", "#2c3e50"),

        update =>
        update
        .attr("id", d => `location-change-${d._id}`)
        .text(d => d.name)
        .call(update => update.transition(t1)
          .attr("y", d => this.y(d.name) + this.y.bandwidth() / 2)),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      )
    }
  }
}
</script>

<style lang="scss">
// .dotplot-svg .axis--y line,
// .dotplot-svg .axis--y path {
//     display: none;
// }
</style>
