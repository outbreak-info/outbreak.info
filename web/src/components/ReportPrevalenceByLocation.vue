<template>
<div class="">
  <svg :width="width" :height="height" class="dotplot-prevalence" ref="svg_dot" :name="title">
    <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yAxis"></g>
    <g ref="dotplot" id="dotplot" :transform="`translate(${margin.left}, ${margin.top})`"></g>
  </svg>
</div>
</template>


<script lang="js">
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  scaleSequential,
  axisBottom,
  axisLeft,
  max,
  format,
  transition
} from "d3";

import chroma from "chroma-js";

import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

export default Vue.extend({
  name: "ReportPrevalenceByLocation",
  props: {
    data: Array,
    setWidth: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 1000
    },
    sortVar: {
      type: String,
      default: "est"
    }
  },
  watch: {
    width() {
      this.updatePlot();
    }
  },
  computed: {
    width() {
      return this.setWidth ? this.setWidth : this.maxWidth;
    },
    title() {
      return ("title")
    }
  },
  data() {
    return {
      margin: {
        top: 2,
        right: 25,
        bottom: 25,
        left: 200
      },
      bandHeight: 15,
      circleR: 8,
      ciStrokeWidth: 7,
      // refs
      dotplot: null,
      // variables
      yVariable: "country",
      yIdentifier: "location_id",
      // scales
      xDot: null,
      y: null,
      xDotAxis: null,
      yAxis: null,
      numXTicks: 6,
      colorScale: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
  methods: {
    setDims() {
      this.maxWidth = document.getElementById('mutation-map') ? document.getElementById('mutation-map').offsetWidth : 1000;
    },
    setupPlot() {
      this.dotplot = select(this.$refs.dotplot);

      this.xDot = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right]);

      this.y = scaleBand()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .paddingInner(0.2);

      this.colorScale = scaleSequential(interpolateYlGnBu);
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot()
      }
    },
    updateScales() {
      // ensure the data is sorted in the proper order
      this.data.sort((a, b) => a[this.sortVar] - b[this.sortVar]);

      this.colorScale = this.colorScale
        .domain([0, max(this.data, d => d.est)]);

      this.xDot = this.xDot
        .domain([0, max(this.data, d => d.upper)]);

      this.y = this.y
        .domain(this.data.map(d => d[this.yVariable]));

      this.xDotAxis = axisBottom(this.xDot)
        .ticks(this.numXTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.xAxis).call(this.xDotAxis);

      this.yAxis = axisLeft(this.y);

      select(this.$refs.yAxis).call(this.yAxis);
    },
    drawPlot() {
      const t1 = transition().duration(1500);

      // const checkbookSelector = select(this.$refs.svg_dot)
      //   .selectAll(".checkbook")
      //   .data(this.data.filter((d, i) => (i+1) % 2));
      //
      // checkbookSelector.join(enter => {
      //   enter.append("rect")
      //     .attr("class", "checkbook")
      //     .style("fill", "#EEEEEE")
      //     .style("fill-opacity", 0.8)
      //     .attr("x", 0)
      //     .attr("width", this.width)
      //     .attr("y", d => this.y(d[this.yVariable]))
      //     .attr("height", this.y.bandwidth())
      //
      // })
      const dotSelector = this.dotplot.selectAll(".dot-group")
        .data(this.data, d => d[this.yVariable]);

      dotSelector.join(enter => {
          const grp = enter.append("g")
            .attr("class", d => `dot-group ${d[this.yIdentifier]}`);

          grp.append("line")
            .attr("class", "dot-ci confidence-interval")
            .attr("x1", d => 0)
            .attr("x2", d => this.xDot(d.est))
            .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .style("stroke", "#555555")
            .style("stroke-width", 1)
            .style("display", "none")
            .transition(t1)

          grp.append("line")
            .attr("class", "dot-ci confidence-interval")
            .attr("x1", d => this.xDot(d.lower))
            .attr("x2", d => this.xDot(d.upper))
            .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .style("stroke", "#CCCCCC")
            .style("stroke-width", this.ciStrokeWidth)
            .style("opacity", 0)
            .transition(t1)
            .delay(400)
            .style("opacity", 0.5);

          grp.append("circle")
            .attr("class", "dot-circle point-estimate")
            .attr("cy", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .attr("r", this.circleR)
            .style("stroke", "#2c3e50")
            .style("stroke-width", 0.25)
            .style("fill", d => this.colorScale(d.est))
            .transition(t1)
            .attr("cx", d => this.xDot(d.est));
        },
        update => {
          update.selectAll(".dot-ci")
            .attr("x1", d => this.xDot(d.lower))
            .attr("x2", d => this.xDot(d.upper))
            .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
            .style("opacity", 0)
            .transition(t1)
            .delay(400)
            .style("opacity", 1);

          update.selectAll(".point-estimate")
            .transition(t1)
            .style("fill", d => this.colorScale(d.est))
            .attr("cx", d => this.xDot(d.est));
        },
        exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove()))
    }
  }
})
</script>

<style lang="scss">
g.axis--y g.tick line,
g.axis--y path {
    display: none;
}
</style>
