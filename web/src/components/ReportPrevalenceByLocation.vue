.proportion<template>
<div class="d-flex">
  <div class="d-flex flex-column">
    <h6><b>Prevalence</b></h6>


    <div class="d-flex align-items-center justify-content-between height-fixed">
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <!-- <svg id="legend" width="15" height="15" class="mr-2">
              <circle cx="7" cy="7" r="7" class="circle-legend"></circle>
            </svg> -->
          <small class="text-muted">Est. B.1.1.7 prevalence since identification</small>
        </div>


        <svg :width="legendWidth" height="30" transform="translate(0,0)">
          <defs>
            <linearGradient id="linear-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop :offset="i*100/10 + '%'" :style="{'stop-color':color}" v-for="(color, i) in legendColors" :key="i" />
            </linearGradient>
          </defs>
          <rect :width="legendWidth" height="15" fill="url(#linear-gradient)" stroke="#2c3e50" stroke-width="0.25"></rect>
          <text x="0" y="18" fill="#555" font-size="0.85em" dominant-baseline="hanging">0</text>
          <text :x="legendWidth" y="18" dominant-baseline="hanging" text-anchor="end" fill="#555" font-size="0.85em">{{maxEstFormatted}}</text>
        </svg>

      </div>


      <div class="d-flex  align-items-center">
        <svg id="legend" width="15" height="15" class="mr-2">
          <line x1="0" x2="15" y1="8" y2="8" class="ci-legend"></line>
        </svg>
        <small class="text-muted">95% confidence interval</small>
      </div>
    </div>

    <svg :width="width" :height="height" class="dotplot-prevalence" ref="svg_dot" :name="title">
      <g :transform="`translate(${margin.left}, ${25})`" class="prevalence-axis axis--x" ref="xAxis" id="dot-axis-top"></g>
      <g :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`" class="prevalence-axis axis--x" ref="xAxis2" id="dot-axis-bottom"></g>
      <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-location-axis prevalence-axis axis--y" ref="yAxis"></g>
      <g ref="dotplot" id="dotplot" :transform="`translate(${margin.left}, ${margin.top})`"></g>
    </svg>
  </div>


  <div class="d-flex flex-column ml-5">
    <h6><b>Number of samples sequenced</b></h6>

    <div class="d-flex flex-column height-fixed">
      <div class="d-flex align-items-center">
        <div class="rect-legend mr-2" :style="{background: accentColor}">

        </div>
        <small class="text-muted">B.1.1.7-positive samples</small>
      </div>

      <div class="d-flex align-items-center">
        <div class="rect-legend mr-2" :style="{background: baseColor}">

        </div>
        <small class="text-muted">all sequenced samples</small>
      </div>
    </div>


    <svg :width="barWidth" :height="height" class="sequencing-count" ref="svg_count" :name="title">
      <g :transform="`translate(${margin.left}, ${25})`" class="count-axis axis--x" ref="xAxisBar" id="bar-axis-top"></g>
      <g :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`" class="count-axis axis--x" ref="xAxisBar2" id="bar-axis-top"></g>
      <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-location-axis count-axis axis--y" ref="yAxisBar"></g>
      <g ref="bargraph" id="bargraph" :transform="`translate(${margin.left}, ${margin.top})`"></g>
    </svg>
  </div>

</div>
</template>


<script lang="js">
import Vue from "vue";


import {
  select,
  selectAll,
  scaleLinear,
  scaleLog,
  scaleBand,
  scaleSequential,
  range,
  axisTop,
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
      default: 600
    },
    height: {
      type: Number,
      default: 1000
    },
    sortVar: {
      type: String,
      default: "proportion"
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
    },
    maxEstFormatted() {
      const formatter = format(".0%");
      return this.maxEst ? formatter(this.maxEst) : null;
    }
  },
  data() {
    return {
      margin: {
        top: 35,
        right: 5,
        rightBar: 25,
        bottom: 30,
        left: 200
      },
      legendWidth: 200,
      barWidth: 500,
      bandHeight: 15,
      circleR: 8,
      ciStrokeWidth: 7,
      accentColor: "#df4ab7",
      baseColor: "#f6cceb",
      // refs
      dotplot: null,
      bargraph: null,
      // variables
      yVariable: "country",
      yIdentifier: "location_id",
      maxEst: null,
      // scales
      xDot: null,
      xBar: null,
      y: null,
      xDotAxis: null,
      xDotAxis2: null,
      xBarAxis: null,
      xBarAxis2: null,
      yAxis: null,
      numXTicks: 6,
      colorScale: null,
      legendColors: []
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
      this.bargraph = select(this.$refs.bargraph);

      this.xDot = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right]);

      this.xBar = scaleLog()
        .range([0, this.barWidth - this.margin.left - this.margin.rightBar]);

      this.y = scaleBand()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .paddingInner(0.2);

      this.colorScale = scaleSequential(interpolateYlGnBu);
    },
    updateScales() {
      // ensure the data is sorted in the proper order
      this.data.sort((a, b) => a[this.sortVar] - b[this.sortVar]);

      this.xDot = this.xDot
        .domain([0, max(this.data, d => d.proportion_ci_upper)]);

      this.xBar = this.xBar
        .domain([1, max(this.data, d => d.cum_total_count)]);

      this.y = this.y
        .domain(this.data.map(d => d[this.yVariable]));

      this.xDotAxis = axisTop(this.xDot)
        .ticks(this.numXTicks)
        .tickFormat(format(".0%"));

      this.xDotAxis2 = axisBottom(this.xDot)
        .ticks(this.numXTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.xAxis).call(this.xDotAxis);
      select(this.$refs.xAxis2).call(this.xDotAxis2);

      this.xBarAxis = axisTop(this.xBar)
        .tickFormat((d, i) => {
          const log = Math.log10(d);
          return Math.abs(Math.round(log) - log) < 1e-6 ? format(".0s")(d) : ""
        })
        .ticks(4)
        .tickSizeOuter(0);

      this.xBarAxis2 = axisBottom(this.xBar)
        .tickFormat((d, i) => {
          const log = Math.log10(d);
          return Math.abs(Math.round(log) - log) < 1e-6 ? format(".0s")(d) : ""
        })
        .ticks(4)
        .tickSizeOuter(0);

      select(this.$refs.xAxisBar).call(this.xBarAxis);
      select(this.$refs.xAxisBar2).call(this.xBarAxis2);

      this.yAxis = axisLeft(this.y);

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.yAxisBar).call(this.yAxis);

      // color scale
      this.maxEst = max(this.data, d => d.proportion);
      this.colorScale = this.colorScale
        .domain([0, this.maxEst]);

      // legend gradient
      this.legendColors = range(11).map(d => interpolateYlGnBu(d / 10));
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();

        const t1 = transition().duration(1500);

        const barSelector = this.bargraph
          .selectAll(".bar-group")
          .data(this.data, d => d[this.yVariable]);


        barSelector.join(enter => {
            const grp = enter.append("g")
              .attr("class", d => `bar-group ${d[this.yIdentifier]}`);

            grp.append("rect")
              .attr("class", "seq-count")
              .attr("x", this.xBar(1))
              .attr("width", d => this.xBar(d.cum_total_count) - this.xBar(1))
              .attr("y", d => this.y(d[this.yVariable]))
              .attr("height", this.y.bandwidth())
              .style("fill", this.baseColor);

            grp.append("rect")
              .attr("class", "mutation-count")
              .attr("x", this.xBar(1))
              .attr("width", d => (this.xBar(d.cum_total_count) - this.xBar(1)) * d.proportion)
              .attr("y", d => this.y(d[this.yVariable]))
              .attr("height", this.y.bandwidth())
              .style("fill", this.accentColor)

            grp.append("text")
              .attr("class", "count-annotation")
              .attr("x", d => this.xBar(d.cum_total_count))
              .attr("dx", d => this.xBar(d.cum_total_count) < this.barWidth * 0.25 ? 4 : -4)
              .attr("y", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .style("fill", "#777")
              .style("font-size", "9pt")
              .style("dominant-baseline", "central")
              .style("text-anchor", d => this.xBar(d.cum_total_count) < this.barWidth * 0.25 ? "start" : "end")
              .text(d => `${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)
          },
          update => {
            update.attr("class", d => `bar-group ${d[this.yIdentifier]}`);

            update.selectAll(".seq-count")
              .attr("x", this.xBar(1))
              .attr("width", d => this.xBar(d.cum_total_count) - this.xBar(1))
              .attr("y", d => this.y(d[this.yVariable]))
              .attr("height", this.y.bandwidth());

            update.selectAll(".mutation-count")
              .attr("x", this.xBar(1))
              .attr("width", d => (this.xBar(d.cum_total_count) - this.xBar(1)) * d.proportion)
              .attr("y", d => this.y(d[this.yVariable]))
              .attr("height", this.y.bandwidth());
          }
        )
        const checkbookSelector = select(this.$refs.svg_dot)
          .selectAll(".checkbook")
          .data(this.data.filter((d, i) => !((i + 1) % 5)));

        const checkbookSelector2 = this.bargraph
          .selectAll(".checkbook")
          .data(this.data.filter((d, i) => !((i + 1) % 5)));

        checkbookSelector.join(enter => {
            enter.append("line")
              .attr("class", "checkbook")
              .style("stroke", "#222")
              .style("stroke-width", 0.35)
              .attr("x1", 0)
              .attr("x2", this.width)
              .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1-this.y.paddingInner()))
              .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1-this.y.paddingInner()))
              .attr("transform", `translate(0, ${0})`)
          },
          update => update.attr("x2", this.width)
          .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1 - this.y.paddingInner()))
          .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1 - this.y.paddingInner()))
          .attr("transform", `translate(0, ${0})`)
        )

        checkbookSelector2.join(enter => {
            enter.append("line")
              .attr("class", "checkbook")
              .style("stroke", "#222")
              .style("stroke-width", 0.35)
              .attr("transform", `translate(${-1*this.margin.left},${-1*this.margin.top})`)
              .attr("x1", 0)
              .attr("x2", this.barWidth)
              .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth()* (1 - this.y.paddingInner()))
              .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1 - this.y.paddingInner()))
          },
          update => update
          .attr("transform", `translate(${-1*this.margin.left},${-1*this.margin.top})`)
          .attr("x1", 0)
          .attr("x2", this.barWidth)
          .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1 - this.y.paddingInner()))
          .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() * (1 - this.y.paddingInner()))
        )


        const dotSelector = this.dotplot.selectAll(".dot-group")
          .data(this.data, d => d[this.yVariable]);

        dotSelector.join(enter => {
            const grp = enter.append("g")
              .attr("class", d => `dot-group ${d[this.yIdentifier]}`);

            grp.append("line")
              .attr("class", "dot-ci confidence-interval")
              .attr("x1", d => this.xDot(d.proportion_ci_lower))
              .attr("x2", d => this.xDot(d.proportion_ci_upper))
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
              .style("fill", d => this.colorScale(d.proportion))
              .transition(t1)
              .attr("cx", d => this.xDot(d.proportion));
          },
          update => {
            update
              .attr("class", d => `dot-group ${d[this.yIdentifier]}`);

            update.selectAll(".dot-ci")
              .attr("x1", d => this.xDot(d.proportion_ci_lower))
              .attr("x2", d => this.xDot(d.proportion_ci_upper))
              .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .style("opacity", 0)
              .transition(t1)
              .delay(400)
              .style("opacity", 1);

            update.selectAll(".point-estimate")
              .transition(t1)
              .style("fill", d => this.colorScale(d.proportion))
              .attr("cx", d => this.xDot(d.proportion));
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove()))
      }
    }
  }
})
</script>

<style lang="scss">
.prevalence-location-axis.axis--y g.tick line,
.prevalence-location-axis.axis--y path {
    display: none;
}

.dotplot-prevalence,
.sequencing-count {
    background: white;
}

.count-axis line {
    // stroke: #aaa;
    // stroke-width: 0.25;
}
.height-fixed {
    // border: 1px solid $base-grey;
    background: white;
    padding: 0.5rem;
    margin-bottom: 0.5rem;

    height: 50px !important;
}

.circle-legend {
    stroke: #2c3e50;
    stroke-width: 0.25;
    fill: #BBB;
}

.ci-legend {
    stroke: #CCCCCC;
    stroke-width: 7;
    opacity: 0.5;
}

.rect-legend {
    width: 15px;
    height: 15px;
}
</style>
