<template>
<div class="bargraph-group d-flex flex-column" :id="`bargraph-${id}-${variable}`">
  <h4 v-if="title">{{title}}</h4>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-bargraph" ref="svg">
    <defs>
      <marker id="arrow-start" markerWidth="13" markerHeight="10" refX="0" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M7,0 L0,5 L7,10" class="swoopy-arrowhead" />
      </marker>
      <marker id="arrow" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
      </marker>
    </defs>

    <g :transform="`translate(${margin.left}, ${height + margin.top + 2})`" class="epi-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="case-counts" class="bargraph" ref="case_counts"></g>
    <g class="switch-button-group" transform="translate(0,0)" ref="switch_btn" v-if="includeAxis">
      <rect class="switch-button-rect"></rect>
      <path class="swoopy-arrow" id="switch-btn-swoopy-arrow" marker-end="url(#arrow)"></path>
      <text class="switch-button" x="5"></text>
    </g>
  </svg>
  <div class="tooltip p-2">
    <h6 class="country-name m-0"></h6>
    <p class="date m-0"></p>
    <p class="count m-0"></p>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from "d3";
import {
  cloneDeep
} from "lodash";

export default Vue.extend({
  name: "Bargraph",
  props: {
    data: Array,
    width: Number,
    height: Number,
    variable: String,
    id: String,
    color: String,
    title: String,
    log: Boolean,
    location: String,
    includeAxis: {
      type: Boolean,
      default: false
    },
    includeTooltips: {
      type: Boolean,
      default: false
    },
    fixedYMax: {
      type: Number,
      default: null
    },
    fixedXLim: {
      type: Array,
      default: null
    },
    animate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      margin: {
        top: 15,
        bottom: 60,
        left: 65,
        right: 20
      },
      // axes
      y: null,
      x: d3.scaleBand().paddingInner(0.1),
      numYTicks: 6,
      isLogY: false,
      yMin: 0,
      // refs
      chart: null
    };
  },
  watch: {
    data: function() {
      this.updatePlot()
    },
    variable: function() {
      this.updatePlot()
    },
    fixedYMax: function() {
      this.updatePlot()
    },
    log: {
      immediate: true,
      handler(newVal, oldVal) {
        this.isLogY = newVal;
        this.updatePlot();
      },
    },
    width: function() {
      this.updatePlot()
    },
    height: function() {
      this.updatePlot()
    }
  },
  methods: {
    setupPlot() {
      this.svg = d3.select(`#bargraph-${this.id}-${this.variable}`).select("svg.epi-bargraph");
      this.chart = this.svg.select("#case-counts");
    },
    prepData: function() {
      if (this.data && this.includeAxis) {
        this.logData = cloneDeep(this.data).filter(d => d[this.variable]);
        this.logData.forEach(d => {
          d['confirmed_log'] = Math.log10(d.confirmed_numIncrease)
        })
        this.plottedData = this.isLogY ? this.logData : this.data;
      } else {
        this.plottedData = this.data;
      }
    },
    updatePlot() {
      this.prepData();

      if (this.plottedData && this.plottedData[0] && this.width && this.height) {
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {
      const range = this.fixedXLim ? this.fixedXLim : d3.extent(this.plottedData, d => d.date);

      this.x = this.x
        .range([0, this.width])
        .domain(d3.timeDay.range(range[0], d3.timeDay.offset(range[1], 1)));

      const yMax = this.fixedYMax ? this.fixedYMax : d3.max(this.plottedData, d => d[this.variable]);

      if (this.isLogY) {
        this.yMin = .5;

        this.y = d3
          .scaleLog()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);

      } else {
        this.yMin = 0;

        this.y = d3.scaleLinear()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);
      }

      // --- update y-scale switch button --
      const dySwitch = 30;
      const xSwoop = 15;
      const ySwoop = -35;
      const swoopOffset = 5;

      this.switchBtn = d3.select(this.$refs.switch_btn);

      this.switchBtn.select(".switch-button-rect")
        .attr("y", this.height + this.margin.top + dySwitch)
        .on("click", () => this.changeScale());;

      this.switchBtn.select("path")
        .attr(
          "d",
          `M ${xSwoop} ${this.height + this.margin.top + this.margin.bottom + ySwoop}
            C ${xSwoop } ${this.height + this.margin.top + this.margin.bottom + ySwoop - 10},
            ${this.margin.left + ySwoop - 10} ${this.height + this.margin.top + 5},
            ${this.margin.left + ySwoop + 5} ${this.height + this.margin.top }`
        );

      this.switchBtn.select("text")
        .text(`switch to ${this.isLogY ? "linear" : "log"} scale`)
        .attr("y", this.height + this.margin.top + dySwitch + 20);


      if (this.switchBtn.select("text").node()) {
        this.switchBtn
          .select("rect")
          .attr(
            "width",
            this.switchBtn
            .select("text")
            .node()
            .getBBox().width + 10
          )
          .attr(
            "height",
            this.switchBtn
            .select("text")
            .node()
            .getBBox().height + 5
          );
      }

      if (this.includeAxis) {
        this.xAxis = d3.axisBottom(this.x)
          .tickSizeOuter(0)
          .tickValues(this.x.domain().filter(function(d, i) {
            return !(i % 14)
          }))
          .tickFormat(d3.timeFormat("%d %b"));

        d3.select(this.$refs.xAxis).call(this.xAxis);

        this.yAxis = this.isLogY ? d3.axisLeft(this.y).tickSizeOuter(0).ticks(this.numYTicks).tickFormat((d, i) => {
            const log = Math.log10(d);
            return Math.abs(Math.round(log) - log) < 1e-6 && log >= 0? d3.format(",")(d) : ""
          }) :
          d3.axisLeft(this.y).tickSizeOuter(0).ticks(this.numYTicks);

        d3.select(this.$refs.yAxis).call(this.yAxis);
      }
    },
    drawPlot() {
      if (this.chart) {
        const t1 = d3.transition().duration(500);
        const barSelector = this.chart.selectAll(".bargraph").data(this.plottedData);

        barSelector
          .join(
            enter => enter.append("rect")
            .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
            .attr("id", d => d._id)
            .attr("x", d => this.x(d.date))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(this.yMin))
            .attr("height", 0)
            .attr("fill", this.color)
            .call(update => this.animate ? update.transition(t1).delay((d, i) => i * 20)
              .attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(this.yMin) - this.y(d[this.variable])) :
              update.attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(this.yMin) - this.y(d[this.variable]))
            ),

            update => update
            .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
            .attr("id", d => d._id)
            .attr("x", d => this.x(d.date))
            .attr("width", this.x.bandwidth())

            .call(update => this.animate ? update.transition(t1)
              .attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(this.yMin) - this.y(d[this.variable])) :
              update.attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(this.yMin) - this.y(d[this.variable]))
            ),

            exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
          )

        if (this.includeTooltips) {
          this.chart.selectAll("rect.bargraph")
            .on("mouseenter", d => this.mouseOn(d))
           .on("mouseleave", this.mouseOff);
        }
      }
    },
    mouseOn(d) {

      const ttip = d3.selectAll(".tooltip")
        .style("top", d3.event.y + "px")
        .style("left", d3.event.x + "px")
        .style("opacity", 1);

      this.chart.selectAll("rect").style("opacity", 0.5);
      this.chart.selectAll(`#${d._id}`).style("opacity", 1);

      ttip.select(".country-name").text(d.name);
      ttip.select(".date").text(d3.timeFormat("%d %b %Y")(d.date));
      ttip.select(".count").text(d[this.variable].toLocaleString());
    },
    mouseOff() {
      d3.selectAll(".tooltip")
      .style("opacity", 0);
      this.chart.selectAll("rect.bargraph").style("opacity", 1);
    },
    changeScale: function() {
      this.isLogY = !this.isLogY;
      this.$router.replace({
        path: "epidemiology",
        name: "Epidemiology",
        params: {disableScroll: true},
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.variable,
          fixedY: String(!!this.fixedYMax)
        }
      });

      this.updatePlot();
    }
  },
  mounted() {
    if (!this.includeAxis) {
      this.margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
    }

    this.setupPlot();
    this.updatePlot();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffff70;
    opacity: 0;
    pointer-events:none;
}
</style>
