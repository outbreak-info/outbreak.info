<template>
<div class="d-flex flex-column align-items-center w-100" id="report-cum-totals">
  <div class="">
    <div class="d-flex align-items-center justify-content-end">
      <router-link v-if="location != 'Worldwide'" class="mr-3 btn btn-sec" :to="{name:'LocationReport', query:{loc: location}}">View {{locationName}} report</router-link>
      <button class="btn btn-main-outline px-2 py-1 mr-3" @click="includeNotDetected = !includeNotDetected"><small>{{includeNotDetected ? "hide" : "show"}} not detected</small></button>
      <div class="d-flex align-items-center justify-content-end">
        sort by
        <select v-model="sortVar" class="ml-2">
          <option value="proportion">prevalence</option>
          <option value="cum_total_count">total sequenced</option>
          <option value="country">name</option>
        </select>
      </div>
    </div>

    <div class="d-flex flex-wrap" :class="[stacked ? 'justify-content-center' : 'justify-content-center']">
      <div class="d-flex flex-column" :class="{'mr-5': !stacked}">
        <h5><b>Cumulative Prevalence</b></h5>

        <!-- LEGEND -->
        <div class="d-flex align-items-center justify-content-between height-fixed">
          <!-- scale bar with gradient -->
          <ClassedLegend :colorScale="colorScale" :horizontal="false" :includeNulls="false" :label="`Est. ${ mutationName } prevalence since identification`" :countThreshold="25" :mutationName="mutationName" nullColor="#EFEFEF" filteredColor="#A5A5A5" strokeColor="#2c3e50"
            maxCount="maxEstFormatted" />

          <div class="d-flex  align-items-center">
            <svg id="legend" width="15" height="15" class="mr-2">
              <line x1="0" x2="15" y1="8" y2="8" class="ci-legend"></line>
            </svg>
            <small class="text-muted">95% confidence interval</small>
          </div>
        </div>

        <!-- LEFT: DOTPLOT -->
        <svg :width="width" :height="height + margin.bottom + margin.top" class="dotplot-prevalence prevalence-by-location" ref="svg_dot" :name="title">
        <!-- <svg :width="width" :height="height + margin.bottom + margin.top" class="dotplot-prevalence prevalence-by-location" ref="svg_dot" :name="title" :subtitle="subtitle"> -->
          <defs>
            <filter id="dropshadow" filterUnits="userSpaceOnUse">
              <feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" />
              <feFlood flood-color="#222222" flood-opacity="0.5" result="offsetColor" />
              <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1.5" />
              <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g :transform="`translate(${margin.left}, ${25})`" class="prevalence-axis axis--x" ref="xAxis" id="dot-axis-top" :hidden="!data.length"></g>
          <g :transform="`translate(${margin.left}, ${height + margin.top + 5})`" class="prevalence-axis axis--x" ref="xAxis2" id="dot-axis-bottom" :hidden="!data.length"></g>
          <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-location-axis prevalence-axis axis--y" ref="yAxis"></g>
          <g ref="dotplot" id="dotplot" :transform="`translate(${margin.left}, ${margin.top})`"></g>
        </svg>
      </div>

      <!-- RIGHT: BARPLOT -->
      <div class="d-flex flex-column">
        <h5><b>Number of samples sequenced</b></h5>

        <div class="d-flex flex-column height-fixed">
          <div class="d-flex align-items-center">
            <div class="rect-legend mr-2" :style="{background: accentColor}">

            </div>
            <small class="text-muted">{{ mutationName }}-positive samples</small>
          </div>

          <div class="d-flex align-items-center">
            <div class="rect-legend mr-2" :style="{background: baseColor}">

            </div>
            <small class="text-muted">all sequenced samples</small>
          </div>
        </div>


        <svg :width="barWidth" :height="height + margin.bottom + margin.top" class="sequencing-count prevalence-by-location" ref="svg_count" :name="title">
          <g :transform="`translate(${margin.left}, ${25})`" class="count-axis axis--x" ref="xAxisBar" id="bar-axis-top" :hidden="!data.length"></g>
          <g :transform="`translate(${margin.left}, ${height + margin.top + 5})`" class="count-axis axis--x" ref="xAxisBar2" id="bar-axis-top" :hidden="!data.length"></g>
          <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-location-axis count-axis axis--y" ref="yAxisBar"></g>
          <g ref="bargraph" id="bargraph" :transform="`translate(${margin.left}, ${margin.top})`"></g>
        </svg>
      </div>
    </div>
  </div>

  <div ref="tooltip_chart" class="tooltip-basic box-shadow" id="tooltip_chart">
    <h5 id="location-name"></h5>
    <em id="no-sequencing">No reported sequencing</em>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>
    <div id="sequencing-count"></div>
  </div>

  <DownloadReportData :data="data" figureRef="prevalence-by-location" class="mt-2" dataType="Mutation Prevelance by Location Dot Plot" />

</div>
</template>


<script lang="js">
import Vue from "vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleLog,
  scaleBand,
  range,
  axisTop,
  axisBottom,
  axisLeft,
  max,
  format,
  transition,
  event
} from "d3";

import cloneDeep from "lodash/cloneDeep";

import ClassedLegend from "@/components/ClassedLegend.vue";

export default Vue.extend({
  name: "ReportPrevalenceByLocation",
  components: {
    ClassedLegend,
    DownloadReportData
  },
  props: {
    data: Array,
    mutationName: String,
    location: {type: String, default: "USA_US-CA_06073"},
    locationName: {type: String, default: "San Diego"},
    colorScale: Function
  },
  watch: {
    width() {
      this.updatePlot();
    },
    data() {
      this.updatePlot();
    },
    sortVar() {
      this.updatePlot();
    },
    includeNotDetected() {
      this.updatePlot();
    }
  },
  computed: {
    title() {
      return (this.location == "Worldwide" ? `Cumulative ${this.mutationName} prevalence by country` : `Cumulative ${this.mutationName} prevalence in ${this.location}`)
    },
    subtitle() {
      return (this.location == "Worldwide" ? `Since ${this.mutationName} identification` : `Since ${this.mutationName} identification in ${this.location}`)
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
        right: 15,
        rightBar: 25,
        bottom: 30,
        left: 270
      },
      maxWidth: 1100,
      width: 600,
      height: 100,
      bandHeight: 18,
      barWidth: 500,
      circleR: 8,
      ciStrokeWidth: 7,
      accentColor: "#df4ab7",
      baseColor: "#f6cceb",
      stacked: false,
      includeNotDetected: false,
      // data
      plottedData: null,
      // refs
      dotplot: null,
      bargraph: null,
      // variables
      yVariable: "name",
      yIdentifier: "location_id",
      sortVar: "proportion",
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
      numXTicks: 4
    }
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
    })

    // set initial dimensions for the plots.
    this.setDims();

    this.setupPlot();
    this.updatePlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
  methods: {
    setDims() {
      const mx = 0.9;
      const svgContainer = document.getElementById('report-cum-totals');
      const barRatio = 0.4;
      const minBarWidth = 350;

      const maxScreenWidth = window.innerWidth;
      this.maxWidth = svgContainer ? svgContainer.offsetWidth * mx : 800;
      if(this.maxWidth > maxScreenWidth) {
        this.maxWidth = maxScreenWidth - 20;
        this.numXTicks = 2;
      }
      this.barWidth = barRatio * this.maxWidth;
      if (this.barWidth <= minBarWidth) {
        this.barWidth = this.maxWidth;
        this.width = this.maxWidth;
        this.stacked = true;
      } else {
        this.width = this.maxWidth * (1 - barRatio) * 0.9;
        this.stacked = false;
      }
      // this.numXTicks = this.width > minBarWidth ? 4 : 2;

    },
    tooltipOn(d) {
      const ttipShift = 15;

      // dim everything
      this.dotplot
        .selectAll(".dot-group")
        .style("opacity", 0.2);

      this.bargraph
        .selectAll(".bar-group")
        .style("opacity", 0.2);

      // turn on the location
      this.dotplot
        .select(`.${d.location_id}`)
        .style("opacity", 1);

      this.bargraph
        .select(`.${d.location_id}`)
        .style("opacity", 1);

      const ttip = select(this.$refs.tooltip_chart);

      // edit text
      ttip.select("h5").text(d.name);
      ttip.select("#no-sequencing").classed("hidden", true);
      ttip.select("#proportion")
        .text(d.proportion_formatted)
        .classed("hidden", false);

      ttip.select("#confidence-interval")
        .text(`(95% CI: ${format(".0%")(d.proportion_ci_lower)}-${format(".0%")(d.proportion_ci_upper)})`)
        .classed("hidden", false);

      ttip.select("#sequencing-count")
        .text(`Number of total cases: ${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)

      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipOff() {
      select(this.$refs.tooltip_chart)
        .style("display", "none");

      this.dotplot
        .selectAll(".dot-group")
        .style("opacity", 1);

      this.bargraph
        .selectAll(".bar-group")
        .style("opacity", 1);
    },
    setupPlot() {
      this.dotplot = select(this.$refs.dotplot);
      this.bargraph = select(this.$refs.bargraph);

      this.y = scaleBand()
        .paddingInner(0.25)
        .paddingOuter(0.15);
    },
    updateScales() {
      // resize the canvas to cover the length of the data.
      this.height = this.plottedData.length * this.bandHeight * (1 + this.y.paddingInner());

      this.xDot = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, max(this.plottedData, d => d.proportion_ci_upper)]);

      this.xBar = scaleLog()
        .range([0, this.barWidth - this.margin.left - this.margin.rightBar])
        .domain([1, max(this.plottedData, d => d.cum_total_count)]);

      this.y = this.y
        .range([0, this.height])
        .domain(this.plottedData.map(d => d[this.yVariable]));

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
        .ticks(2)
        .tickSizeOuter(0);

      this.xBarAxis2 = axisBottom(this.xBar)
        .tickFormat((d, i) => {
          const log = Math.log10(d);
          return Math.abs(Math.round(log) - log) < 1e-6 ? format(".0s")(d) : ""
        })
        .ticks(2)
        .tickSizeOuter(0);

      select(this.$refs.xAxisBar).call(this.xBarAxis);
      select(this.$refs.xAxisBar2).call(this.xBarAxis2);

      this.yAxis = axisLeft(this.y);

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.yAxisBar).call(this.yAxis);

      // color scale
      this.maxEst = max(this.plottedData, d => d.proportion);
    },
    updatePlot() {
      if (this.data) {
        // ensure the data is sorted in the proper order
        // Create a copy so Vue doesn't flip out.
        this.plottedData = cloneDeep(this.data);

        if (!this.includeNotDetected) {
          this.plottedData = this.plottedData.filter(d => d.proportion)
        }

        if (this.sortVar == "country") {
          // asc
          this.plottedData.sort((a, b) => a[this.sortVar] < b[this.sortVar] ? -1 : 1);
        } else {
          // desc
          this.plottedData.sort((a, b) => b[this.sortVar] < a[this.sortVar] ? -1 : 1);
        }


        this.updateScales();

        const t1 = transition().duration(1500);
        const annotThresh = 0.15;

        const barSelector = this.bargraph
          .selectAll(".bar-group")
          .data(this.plottedData, d => d.location_id);


        barSelector.join(enter => {
            const grp = enter.append("g")
              .attr("class", (d, i) => `bar-group bar-group${i} ${d[this.yIdentifier]}`);

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
              .attr("dx", d => this.xBar(d.cum_total_count) < this.barWidth * annotThresh ? 4 : -4)
              .attr("y", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("fill", "#777")
              .style("font-size", "9pt")
              .style("dominant-baseline", "central")
              .style("text-anchor", d => this.xBar(d.cum_total_count) < this.barWidth * annotThresh ? "start" : "end")
              .text(d => `${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)
          },
          update => {
            update.attr("class", d => `bar-group ${d[this.yIdentifier]}`);
            // !!!!! UPDATES MUST BE SELECT, NOT SELECT ALL
            // h/t to https://observablehq.com/@thetylerwolf/day-18-join-enter-update-exit for pointing me in right direction
            update.select(".seq-count")
              .attr("x", this.xBar(1))
              .attr("width", d => this.xBar(d.cum_total_count) - this.xBar(1))
              .attr("height", this.y.bandwidth())
              .transition(t1)
              .attr("y", d => this.y(d[this.yVariable]));

            update.select(".mutation-count")
              .attr("x", this.xBar(1))
              .attr("width", d => (this.xBar(d.cum_total_count) - this.xBar(1)) * d.proportion)
              .attr("height", this.y.bandwidth())
              .transition(t1)
              .attr("y", d => this.y(d[this.yVariable]));

            update.select(".count-annotation")
              .attr("x", d => this.xBar(d.cum_total_count))
              .attr("dx", d => this.xBar(d.cum_total_count) < this.barWidth * annotThresh ? 4 : -4)
              .style("text-anchor", d => this.xBar(d.cum_total_count) < this.barWidth * annotThresh ? "start" : "end")
              .text(d => `${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)
              .transition(t1)
              .attr("y", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2);
          }
        )

        const checkbookSpacing = 5;
        // CHECKBOOK DIVISIONS FOR ORIENTATION
        if (this.data.length > checkbookSpacing * 1.5) {
          const checkbookSelector = this.dotplot
            .selectAll(".checkbook")
            .data(this.plottedData.filter((d, i) => !(i % checkbookSpacing)));

          const checkbookSelector2 = this.bargraph
            .selectAll(".checkbook")
            .data(this.plottedData.filter((d, i) => !(i % checkbookSpacing)));

          checkbookSelector.join(enter => {
              enter.append("line")
                .attr("class", "checkbook")
                .style("stroke", "#222")
                .style("stroke-width", 0.35)
                .attr("transform", `translate(${-1*this.margin.left},${0})`)
                .attr("x1", 0)
                .attr("x2", this.width)
                .attr("y1", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
                .attr("y2", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
            },
            update => update.attr("x2", this.width)
            .attr("transform", `translate(${-1*this.margin.left},${0})`)
            .attr("y1", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
            .attr("y2", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5),
            exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
          )

          checkbookSelector2.join(enter => {
              enter.append("line")
                .attr("class", "checkbook")
                .style("stroke", "#222")
                .style("stroke-width", 0.35)
                .attr("transform", `translate(${-1*this.margin.left},${0})`)
                .attr("x1", 0)
                .attr("x2", this.barWidth)
                .attr("y1", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
                .attr("y2", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
            },
            update => update
            .attr("transform", `translate(${-1*this.margin.left},${0})`)
            .attr("x1", 0)
            .attr("x2", this.barWidth)
            .attr("y1", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5)
            .attr("y2", d => this.y(d[this.yVariable]) - this.y.paddingInner() * this.y.step() * 0.5),
            exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove()));
        }

        const dotSelector = this.dotplot.selectAll(".dot-group")
          .data(this.plottedData, d => d.location_id);

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
              // .style("opacity", 0)
              // .transition(t1)
              // .delay(400)
              .style("opacity", 0.5);

            grp.append("circle")
              .attr("class", "dot-circle point-estimate")
              .attr("cy", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .attr("r", this.circleR)
              .style("stroke", "#2c3e50")
              .style("stroke-width", 0.25)
              // .style("filter", "url(#dropshadow)")
              .style("fill", d => this.colorScale(d.proportion))
              .transition(t1)
              .attr("cx", d => this.xDot(d.proportion));
          },
          update => {
            update
              .attr("class", d => `dot-group ${d[this.yIdentifier]}`);

            update
              .select(".dot-circle")
              .transition(t1)
              .attr("cx", d => this.xDot(d.proportion))
              .style("fill", d => this.colorScale(d.proportion))
              .attr("cy", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2);

            update.select(".dot-ci")
              .attr("x1", d => this.xDot(d.proportion_ci_lower))
              .attr("x2", d => this.xDot(d.proportion_ci_upper))
              .transition(t1)
              .attr("y1", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2)
              .attr("y2", d => this.y(d[this.yVariable]) + this.y.bandwidth() / 2);
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove()));


        this.bargraph
          .selectAll(".bar-group")
          .on("mousemove", d => this.tooltipOn(d))
          .on("mouseleave", () => this.tooltipOff());

        this.dotplot
          .selectAll(".dot-group")
          .on("mousemove", d => this.tooltipOn(d))
          .on("mouseleave", () => this.tooltipOff());
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

.prevalence-location-axis {
  font-size: 16px;
}

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
