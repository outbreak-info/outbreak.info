<template>
<div class="bargraph-group d-flex flex-column" :id="`bargraph-${id}-${variable}`">
  <h4 v-if="title">{{ title }}</h4>
  <div class="position-relative">
    <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-bargraph" :name="plotTitle" :subtitle="title" ref="svg">
      <defs>
        <marker id="arrow-start" markerWidth="13" markerHeight="10" refX="0" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M7,0 L0,5 L7,10" class="swoopy-arrowhead" />
        </marker>
        <marker id="arrow" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>

      <g :transform="`translate(${margin.left}, ${height + margin.top + 2})`" class="epi-axis axis--x" ref="xAxis" id="xAxis"></g>
      <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis" id="yAxis"></g>
      <g :transform="`translate(${margin.left},${margin.top})`" id="case-counts" class="bargraph" ref="case_counts"></g>
      <g :transform="`translate(${margin.left},${margin.top})`" id="rolling-average" class="bargraph" ref="rolling_average"></g>
      <g class="annotations" :class="{hidden: noRollingAvg}">
        <line :style="{'stroke': this.colorAverage, 'stroke-width': 2.5}" :x1="margin.left + 5" :x2="margin.left + 20" :y1="margin.top+6" :y2="margin.top+6"></line>
        <text class="annotation--rolling-average" :x="margin.left + 25" :y="margin.top" :style="{'fill': this.colorAverage, 'font-size': '0.75em', 'dominant-baseline': 'hanging', 'font-family': 'DM Sans, Avenir, Helvetica, Arial, sans-serif'}">7 day
          rolling average</text>
      </g>
    </svg>
    <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" style="left:0; bottom:0" class="epi-bargraph-arrows position-absolute" ref="svg_arrows">
      <g class="switch-button-group" transform="translate(5,0)" ref="switch_btn" v-if="includeAxis">
        <rect class="switch-button-rect"></rect>
        <path class="swoopy-arrow" id="switch-btn-swoopy-arrow" marker-end="url(#arrow)"></path>
        <text class="switch-button" x="5"></text>
      </g>
    </svg>
  </div>

  <div class="tooltip p-2">
    <h6 class="country-name m-0"></h6>
    <p class="date m-0"></p>
    <p class="count m-0"></p>
    <b class="count-avg m-0"></b>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import { scaleBand, scaleLinear, scaleLog, axisBottom, axisLeft, line, extent, timeDay, max, select, selectAll, format, timeFormat, timeParse, transition, easeLinear, event } from "d3";
import {
  cloneDeep
} from "lodash";

export default Vue.extend({
  name: "Bargraph",
  props: {
    data: Array,
    width: Number,
    height: Number,
    // variable: String,
    variableObj: Object,
    id: String,
    color: String,
    colorAverage: {
      type: String,
      default: "black"
    },
    title: String,
    log: Boolean,
    percapita: Boolean,
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
    xVariableLim: {
      type: Array,
      default: null
    },
    date1: {
      type: String
    },
    include2Week: {
      type: Boolean,
      default: false
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
        left: 75,
        right: 25
      },
      // axes
      y: null,
      x: scaleBand().paddingInner(0),
      numYTicks: 6,
      isLogY: false,
      yMin: 0,
      // methods
      line: null,
      // refs
      chart: null,
      average: null,
      noRollinAvg: true
    };
  },
  computed: {
    plotTitle() {
      return (this.percapita ? `Number of COVID-19 ${this.variableObj.label} per 100,000 residents` : `Number of COVID-19 ${this.variableObj.label}`)
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    variableObj: {
      immediate: true,
      handler(newObj, oldObj) {
        this.variable = newObj.value;
        this.noRollingAvg = !['confirmed_numIncrease', 'dead_numIncrease', 'recovered_numIncrease'].includes(this.variable) || !this.animate;
        this.updatePlot();
      }
    },
    // variable: function() {
    //   this.updatePlot()
    // },
    fixedYMax: function() {
      this.updatePlot();
    },
    log: {
      immediate: true,
      handler(newVal, oldVal) {
        this.isLogY = newVal;
        this.updatePlot();
      }
    },
    percapita: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.updatePlot();
        }
      }
    },
    width: function() {
      this.updatePlot();
    },
    height: function() {
      this.updatePlot();
    }
  },
  methods: {
    setupPlot() {
      this.svg = select(`#bargraph-${this.id}-${this.variable}`)
        .select("svg.epi-bargraph");
      this.chart = this.svg.select("#case-counts");
      this.average = this.svg.select("#rolling-average");

      this.line = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d[this.variable.replace("_numIncrease", "_rolling")]));
    },
    prepData: function() {
      if (this.percapita) {
        this.variable = this.variable.includes("_per_100k") || this.variableObj.percapita === false ? this.variable : this.variable + "_per_100k";
      } else {
        this.variable = this.variable.replace("_per_100k", "");
      }

      if (this.data && this.includeAxis) {
        this.logData = cloneDeep(this.data).filter(d => d[this.variable] >= 1);
        this.logData.forEach(d => {
          d["confirmed_log"] = Math.log10(d.confirmed_numIncrease);
        });
        this.plottedData = this.isLogY ? this.logData : this.data.filter(d => d[this.variable] >= 0);
      } else {
        this.plottedData = this.data.filter(d => d[this.variable] >= 0);
      }
    },
    updatePlot() {
      this.prepData();

      if (
        this.plottedData &&
        this.width &&
        this.height
      ) {
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {
      const range = this.xVariableLim ?
        this.xVariableLim :
        extent(this.plottedData, d => d.date);

      this.x = this.x
        .range([0, this.width])
        .domain(timeDay.range(range[0], timeDay.offset(range[1], 1)));

      const yMax = this.fixedYMax ?
        this.fixedYMax :
        max(this.plottedData, d => d[this.variable]);

      if (this.isLogY) {
        this.yMin = 0.5;

        this.y = scaleLog()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);
      } else {
        this.yMin = 0;

        this.y = scaleLinear()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);
      }

      // --- update y-scale switch button --
      const dySwitch = 30;
      const xSwoop = 15;
      const ySwoop = -35;
      const swoopOffset = 5;

      this.switchBtn = select(this.$refs.switch_btn);

      this.switchBtn
        .select(".switch-button-rect")
        .attr("y", this.height + this.margin.top + dySwitch)
        .on("click", () => this.changeScale());

      this.switchBtn.select("path").attr(
        "d",
        `M ${xSwoop} ${this.height +
          this.margin.top +
          this.margin.bottom +
          ySwoop}
            C ${xSwoop} ${this.height +
          this.margin.top +
          this.margin.bottom +
          ySwoop -
          10},
            ${this.margin.left + ySwoop - 10} ${this.height +
          this.margin.top +
          5},
            ${this.margin.left + ySwoop + 5} ${this.height + this.margin.top}`
      );

      this.switchBtn
        .select("text")
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
        // ~ 6 tick marks, rounded to the nearest week interval (6*7)
        const plotInterval = Math.round(this.x.domain().length/42)*7;
        this.xAxis = axisBottom(this.x)
          .tickSizeOuter(0)
          .tickValues(
            this.x.domain().filter(function(d, i) {
              return !(i % plotInterval);
            })
          )
          .tickFormat(timeFormat("%d %b"));

        select(this.$refs.xAxis).call(this.xAxis);

        this.yAxis = this.isLogY ?
        axisLeft(this.y)
          .tickSizeOuter(0)
          .ticks(this.numYTicks)
          .tickFormat((d, i) => {
            const log = Math.log10(d);
            return Math.abs(Math.round(log) - log) < 1e-6 && log >= 0 ?
              format(",")(d) :
              "";
          }) :
          axisLeft(this.y)
          .tickSizeOuter(0)
          .ticks(this.numYTicks);

        select(this.$refs.yAxis).call(this.yAxis);
      }
    },
    drawPlot() {
      if (this.chart) {
        const endDate = timeParse("%Y-%m-%d")(this.date1);
        // v-line to indicate dates
        if (this.date1) {
          const dateSelector = this.chart
            .selectAll(`.date-annotation_${this.variable}`)
            .data([endDate]);

          dateSelector.join(
            enter =>
            enter
            .append("line")
            .attr("class", d => `.date-annotation_${this.variable} annotation-date1`)
            .style("stroke", "#D13B62")
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", d => 0)
            .attr("y2", d => this.height),

            update =>
            update
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", d => 0)
            .attr("y2", d => this.height),

            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(10)
              .style("opacity", 1e-5)
              .remove()
            )
          );

          if (this.include2Week && this.x(endDate)) {
            const dateSelector = this.chart
              .selectAll(`.date-annotation_${this.variable}`)
              .data([endDate]);

            dateSelector.join(
              enter =>
              enter
              .append("rect")
              .attr("class", d => `.date-annotation_${this.variable} annotation-date1`)
              .style("fill", "#D13B62")
              .style("fill-opacity", 0.1)
              .attr("x", d => this.x(timeDay.offset(endDate, -14)))
              .attr("width", d => this.x(d) - this.x(timeDay.offset(d, -14)))
              .attr("y", 0)
              .attr("height", this.height),

              update =>
              update
              .attr("x1", d => this.x(d))
              .attr("x2", d => this.x(d))
              .attr("y1", d => 0)
              .attr("y2", d => this.height),

              exit =>
              exit.call(exit =>
                exit
                .transition()
                .duration(10)
                .style("opacity", 1e-5)
                .remove()
              )
            );
          }
        }


        const t1 = transition().duration(500);
        const barSelector = this.chart
          .selectAll(".bargraph")
          .data(this.plottedData.filter(d => d[this.variable]), d => d._id);

        barSelector.join(
          enter =>
          enter
          .append("rect")
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("id", d => d._id)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())
          .attr("y", d => this.y(this.yMin))
          .attr("height", 0)
          .attr("fill", this.color)
          .attr("opacity", 0.55)
          .call(update =>
            this.animate ?
            update
            .transition(t1)
            .delay((d, i) => i * 10)
            .attr("y", d => this.y(d[this.variable]))
            .attr(
              "height",
              d => this.y(this.yMin) - this.y(d[this.variable])
            ) :
            update
            .attr("y", d => this.y(d[this.variable]))
            .attr(
              "height",
              d => this.y(this.yMin) - this.y(d[this.variable])
            )
          ),

          update =>
          update
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("id", d => d._id)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())
          // .attr("height", 0)
          .attr("fill", this.color)

          .call(update =>
            this.animate ?
            update
            .transition(t1)
            .attr("y", d => this.y(d[this.variable]))
            .attr(
              "height",
              d => this.y(this.yMin) - this.y(d[this.variable])
            ) :
            update
            .attr("y", d => this.y(d[this.variable]))
            .attr(
              "height",
              d => this.y(this.yMin) - this.y(d[this.variable])
            )
          ),

          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        );

        var lineSelector;
        if (["confirmed_numIncrease", "confirmed_numIncrease_per_100k", "dead_numIncrease", "dead_numIncrease_per_100k", "recovered_numIncrease", "recovered_numIncrease_per_100k"].includes(this.variable)) {
          const averageData = this.isLogY ? this.plottedData.filter(d => d[this.variable.replace("_numIncrease", "_rolling")] >= 1) : this.plottedData.filter(d => d[this.variable.replace("_numIncrease", "_rolling")]);
          lineSelector = this.average
            .selectAll(".rolling-average")
            .data([averageData], d => d._id);
        } else {
          lineSelector = this.average
            .selectAll(".rolling-average")
            .data([], d => d._id);
        }

        lineSelector.join(
          enter => {
            enter
              .append("path")
              .attr("class", "rolling-average")
              .style("stroke", this.colorAverage)
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .datum(d => d)
              .join("path")
              .attr("d", this.line)
              .attr("stroke-dasharray", function() {
                var totalLength = this.getTotalLength();
                return totalLength + " " + totalLength;
              })
              .attr("stroke-dashoffset", function() {
                var totalLength = this.getTotalLength();
                return totalLength;
              })
              .call(update => this.animate ? update
                .transition(t1)
                .delay(0)
                .duration((this.plottedData.length + 1) * 10 + 500)
                .ease(easeLinear)
                .attr("stroke-dashoffset", 0) :
                update.attr("stroke-dashoffset", 0)
              )
          },
          update => {
            update
              .style("stroke", this.colorAverage)
              .attr("d", this.line)
              .attr("stroke-dasharray", function() {
                var totalLength = this.getTotalLength();
                return totalLength + " " + totalLength;
              })
              .attr("stroke-dashoffset", function() {
                var totalLength = this.getTotalLength();
                return totalLength;
              })
              .call(update => this.animate ? update
                .transition(t1)
                .delay(0)
                .duration((this.plottedData.length + 1) * 10 + 500)
                .ease(easeLinear)
                .attr("stroke-dashoffset", 0) :
                update.attr("stroke-dashoffset", 0)
              )
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        );

        if (this.includeTooltips) {
          this.chart
            .selectAll("rect.bargraph")
            .on("mouseenter", d => this.mouseOn(d))
            .on("mouseleave", this.mouseOff);
        }
      }
    },
    mouseOn(d) {
      const ttip = selectAll(".tooltip")
        .style("top", event.y + "px")
        .style("left", event.x + "px")
        .style("opacity", 1);

      this.chart.selectAll(".bargraph").style("opacity", 0.5);
      this.chart.selectAll(`#${d._id}`).style("opacity", 1);

      ttip.select(".country-name").text(d.name);
      ttip.select(".date").text(timeFormat("%d %b %Y")(d.date));
      ttip
        .select(".count")
        .text(`${format(",.1f")(d[this.variable])} ${this.variableObj.ttip}`);

      if (this.noRollingAvg) {
        ttip
          .select(".count-avg")
          .text("");
      } else {
        ttip
          .select(".count-avg")
          .text(`7 day average: ${format(",.1f")(d[this.variable.replace("_numIncrease", "_rolling")])}`);
      }
    },
    mouseOff() {
      selectAll(".tooltip").style("opacity", 0);
      this.chart.selectAll("rect.bargraph").style("opacity", 0.5);
    },
    changeScale: function() {
      this.isLogY = !this.isLogY;
      this.$router.replace({
        path: "epidemiology",
        name: "Epidemiology",
        params: {
          disableScroll: true
        },
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.variable.replace("_per_100k", ""),
          fixedY: String(!!this.fixedYMax),
          percapita: String(this.percapita)
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
    background: #ffffffcf;
    opacity: 0;
    pointer-events: none;
}

.epi-bargraph-arrows {
    pointer-events: none;
    & rect {
        pointer-events: auto !important;
    }
}
</style>
