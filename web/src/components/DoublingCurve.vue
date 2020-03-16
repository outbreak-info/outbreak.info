<template>
<div class="epidemiology-curves flex-column align-left">

  <!-- <button @click="switchAxes()">common axis</button> -->
  <h3 class="plot-title text-sec py-5">
    Cumulative number of COVID-19 cases in {{data[0].admin0}}
  </h3>
  <DataUpdated />
  <svg :width="width" :height="height" class="epi-curve">
    <defs>
      <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`" class="epi-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-curve"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="transition-mask"></g>
  </svg>
  <DataSource />
</div>
</template>

<script lang="ts">
import Vue from "vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";

import * as d3 from "d3";
import {
  cloneDeep
} from "lodash";

import store from "@/store";

const width = 500;
const height = 300;
const radius = 4.5;
const margin = {
  top: 35,
  right: 170,
  bottom: 75,
  left: 70
};
const transitionDuration = 3500;

export default Vue.extend({
  name: "DoublingCurve",
  components: {
    DataUpdated,
    DataSource,
  },
  props: {
    data: Array,
    fit: Object
  },
  data() {
    return {
      width,
      height,
      margin,
      radius,
      transitionDuration,
      numFit: 5,

      // data
      logData: null,

      // button interfaces
      lengthThreshold: 8,
      showAll: false,
      isLogY: false,

      // axes
      numXTicks: 9,
      numYTicks: 6,
      x: d3.scaleTime(),
      y: d3.scaleLinear(),
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      dots: null,
      switchBtn: null,
      // methods
      line: null
    };
  },
  watch: {
    data: function() {
      console.log(this.data)
      this.prepData();
      this.updatePlot();
    },
    width() {
      this.updatePlot();
    }
  },
  computed: {
    locationName() {
      if (this.data.length === 1) {
        return this.data[0].locationName;
      }
      return null;
    },
    dataLength() {
      return this.data.length;
    }
  },
  mounted() {
    console.log(this.data)
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setPlotDims() {
      const idealWidth = 750;
      const whRatio = 5 / 3;
      const framePadding = 32; // left / right padding on the div of 16px ea.
      if (window.innerWidth < idealWidth) {
        const newWidth = window.innerWidth - framePadding;
        const newHeight = newWidth / whRatio;
        // check height within limits
        if (newHeight > window.innerHeight) {
          this.width = window.innerHeight * whRatio;
          this.height = window.innerHeight;
        } else {
          this.width = newWidth;
          this.height = newHeight;
        }
      } else {
        this.width = idealWidth;
        this.height = idealWidth / whRatio;
      }

      this.numXTicks = this.width < 550 ? 3 : 9;
      this.numYTicks = this.height < 250 ? 3 : 6;
    },
    // changeScale: function() {
    //   this.isLogY = !this.isLogY;
    //
    //   this.updatePlot();
    // },
    // tooltipOn: function(d) {
    //   d3.select(`#tooltip-${d.id}-${d.date_string}`).attr("display", "block");
    //
    //   d3.select(`#${d.id}-${d.date_string}`).attr("r", this.radius * 2);
    //
    //   d3.select(`#${d.id}`)
    //     .select("text")
    //     .style("font-weight", 700);
    //
    //   d3.selectAll(`.epi-region`).style("opacity", 0.35);
    //
    //   d3.selectAll(`#${d.id}`).style("opacity", 1);
    // },
    // tooltipOff: function(d) {
    //   d3.selectAll(".tooltip--epi-curve").attr("display", "none");
    //
    //   d3.selectAll("circle").attr("r", this.radius);
    //
    //   d3.selectAll(".annotation--region-name").style("font-weight", 400);
    //
    //   d3.selectAll(`.epi-region`).style("opacity", 1);
    // },
    updatePlot: function() {
      if (this.data) {
        this.updateScales();
        this.drawDots();
      }
    },
    prepData: function() {
      // if (this.data) {
      //   this.logData = cloneDeep(this.data);
      //   this.logData.forEach(d => {
      //     d["data"] = d.data.filter(x => x[this.variable] > 0);
      //   });
      // }
    },
    setupPlot: function() {
      // Event listener for mobile responsiveness
      // $nextTick waits till DOM rendered
      this.$nextTick(function() {
        window.addEventListener("resize", this.setPlotDims);
        // set initial dimensions for the stacked area plots.
        this.setPlotDims();
      });

      this.setPlotDims();

      this.prepData();
      this.svg = d3.select("svg.epi-curve");
      this.chart = d3.select("#epi-curve");
      this.dots = this.chart.append("g").attr("id", "confirmed-timepoints");


      this.line = d3
        .line()
        .x((d, i) => this.x(d.date))
        .y(d => this.y());
    },
    updateScales: function() {
      console.log(this.data)
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(
          d3.extent(this.data.map(d => d.date))
        );

      // if (this.isLogY) {
      this.y = d3
        .scaleLog()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([
          1,
          d3.max(this.data.map(d => d.confirmed))
        ]);
      // } else {
      //   this.y = d3
      //     .scaleLinear()
      //     .range([this.height - this.margin.top - this.margin.bottom, 0])
      //     .domain([
      //       0,
      //       d3.max(this.data.flatMap(d => d.data).map(d => d.confirmed))
      //     ]);
      // }

      this.xAxis = d3.axisBottom(this.x).ticks(this.numXTicks);

      d3.select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y).ticks(this.numYTicks);

      d3.select(this.$refs.yAxis).call(this.yAxis);

      // --- update y-scale switch button --
      //
      const dySwitch = -10;
      const xSwoop = 30;
      const ySwoop = -35;
      const swoopOffset = 10;

      this.switchBtn = this.svg.selectAll(".switch-button-group").data([0]);

      this.switchBtn.exit().remove();
      const switchEnter = this.switchBtn
        .enter()
        .append("g")
        .attr("class", "switch-button-group")
        .attr("transform", "translate(5,0)");

      this.switchBtn.merge(switchEnter);

      const switchRect = this.switchBtn.select(".switch-button-rect");
      const switchRectEnter = this.switchBtn
        .append("rect")
        .attr("class", "switch-button-rect")
        .attr("x", 0)
        .attr("width", 0)
        .attr("height", 0);

      switchRect.merge(switchRectEnter).attr("y", this.height - 28);

      const switchArrow = this.switchBtn.select("path");

      const switchArrowEnter = this.switchBtn
        .append("path")
        .attr("class", "swoopy-arrow")
        .attr("id", "switch-btn-swoopy-arrow")
        .attr("marker-end", "url(#arrow)");

      switchArrow
        .merge(switchArrowEnter)
        // M x-start y-start C x1 y1, x2 y2, x-end y-end -- where x1/y1/x2/y2 are the coordinates of the bezier curve.
        .attr(
          "d",
          `M ${xSwoop} ${this.height + ySwoop}
          C ${xSwoop + swoopOffset} ${this.height + ySwoop},
          ${this.margin.left + ySwoop + 20} ${this.height -
            this.margin.bottom +
            15 +
            swoopOffset},
          ${this.margin.left + ySwoop + 20} ${this.height -
            this.margin.bottom +
            15}`
          // `M ${xSwoop} ${this.margin.top + this.height + this.margin.bottom + dySwitch - 20} C ${xSwoop + 5} ${this.margin.top + this.height + this.margin.bottom + dySwitch - 55}, ${this.margin.left - 25 - dxSwoop} ${ this.height + this.margin.top }, ${this.margin.left - 25} ${ this.height + this.margin.top }`
          // `M ${dxSwoop} ${this.margin.top + this.height + this.margin.bottom + dySwitch - 20} C ${dxSwoop+15} ${this.margin.top + this.height + this.margin.bottom - 20}, ${this.margin.left - 13} ${this.height + this.margin.top + 25}, ${this.margin.left - 13} ${this.height + this.margin.top + 10}`
        );

      const switchText = this.switchBtn.select("text");

      const switchTextEnter = this.switchBtn
        .append("text")
        .attr("class", "switch-button")
        .attr("x", 5);

      switchText
        .merge(switchTextEnter)
        .text(`switch to ${this.isLogY ? "linear" : "log"} scale`)
        .attr("y", this.height + dySwitch)
        .on("mouseover", () =>
          this.switchBtn.select("rect").classed("switch-button-hover", true)
        )
        .on("mouseout", () =>
          this.switchBtn.select("rect").classed("switch-button-hover", false)
        )
        .on("click", () => this.changeScale());

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
    },
    drawDots: function() {
      const t1 = d3.transition().duration(this.transitionDuration);
      const formatDate = d3.timeFormat("%d %b %Y");

      // --- best-fit lines ---
      //       // y = -1222.7800       0.0672
      const penultimateFitSelector = this.chart.selectAll("penultimate-fit").data([0]);

      penultimateFitSelector.exit().remove();

      const penultimateFitEnter = penultimateFitSelector
        .enter().append("line")
        .attr("class", "epi-line penultimate-fit");

        penultimateFitSelector.merge(penultimateFitEnter)
          .attr("x1", this.x(new Date("2020-02-28")))
          .attr("x2", this.x(new Date("2020-03-16")))
          .attr("y1", this.y(2738))
          .attr("y2", this.y(14958))

      // y = -313.6766 + 0.0176x
      const recentFitSelector = this.chart.selectAll("recent-fit").data([0]);

      recentFitSelector.exit().remove();

      const recentFitEnter = recentFitSelector
        .enter().append("line")
        .attr("class", "epi-line recent-fit");



        recentFitSelector.merge(recentFitEnter)
          .attr("x1", this.x(new Date("2020-03-03")))
          .attr("x2", this.x(new Date("2020-03-16")))
          .attr("y1", this.y(6358))
          .attr("y2", this.y(8279))

      // --- show cases as dot plot ---
      const dotGroups = this.dots
        .selectAll(".circle-confirmed")
        .data(this.data);

      // -- exit --
      dotGroups.exit().remove();

      // -- enter --
      const dotsEnter = dotGroups
        .enter()
        .append("circle")
        .attr("r", this.radius)
      dotGroups
        .merge(dotsEnter)
        .attr("id", d => d.id)
        .attr("class", d => `circle-confirmed ${d.id}`)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d.confirmed))
        .classed("recent-data", (d, i) => i >= (this.data.length - this.numFit))
        .classed("penultimate-data", (d, i) => i >= this.data.length - this.numFit * 2 && i < this.data.length - this.numFit);




      // --- tooltips ---
      // need to be outside the path/dot groups, so they're on top of all the curves.
      // OUTER GROUP: one per country
      const tooltipGroupSelector = this.chart
        .selectAll(".epi-tooltip-group")
        .data(this.data);

      // -- exit --
      tooltipGroupSelector.exit().remove();

      // -- enter --
      const tooltipGroupEnter = tooltipGroupSelector
        .enter()
        .append("g")
        .attr("class", "epi-tooltip-group")
        .attr("fill", d => this.lightColorScale(d.locationName))
        .attr("stroke", d => this.colorScale(d.locationName));

      tooltipGroupSelector
        .merge(tooltipGroupEnter)
        .attr("class", d => `epi-tooltip-group ${d.id}`);

      // INNER GROUPS: one per timepoint
      const tooltipSelector = this.chart
        .selectAll(".epi-tooltip-group")
        .selectAll(".tooltip--epi-curve")
        .data(d => d.data);

      tooltipSelector.exit().remove();

      const tooltipEnter = tooltipSelector
        .enter()
        .append("g")
        .attr("class", "tooltip--epi-curve")
        .attr("transform", "translate(5,5)")
        .attr("display", "none");

      tooltipSelector
        .merge(tooltipEnter)
        .attr("id", d => `tooltip-${d.id}-${d.date_string}`);

      const tooltipRect = tooltipSelector.select(".tooltip--rect");

      const tooltipRectEnter = tooltipEnter
        .append("rect")
        .attr("class", "tooltip--rect");

      tooltipRect
        .merge(tooltipRectEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.confirmed))
        .attr("width", 108)
        .attr("height", 40)
        .attr("stroke-dasharray", "108, 188")
        .attr("stroke-width", "3");

      const tooltipText = tooltipSelector.select(".tooltip--text");

      const tooltipTextEnter = tooltipEnter
        .append("text")
        .attr("class", "tooltip--text default-black")
        .attr("transform", "translate(5,5)");

      const tooltipDateEnter = tooltipTextEnter
        .append("tspan")
        .attr("class", "tooltip--date");

      tooltipText
        .select(".tooltip--date")
        .merge(tooltipDateEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.confirmed))
        // .attr("dy", "1.1em")
        .text(d => formatDate(d.date));

      const tooltipCasesEnter = tooltipTextEnter
        .append("tspan")
        .attr("class", "tooltip--case-count");

      tooltipText
        .select(".tooltip--case-count")
        .merge(tooltipCasesEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.confirmed))
        .attr("dy", "1.1em")
        // .attr("dy", "2.2em")
        .text(d => `${d.confirmed.toLocaleString()} cases`);


      // --- event listeners ---
      d3.selectAll("circle")
        .on("mouseover", d => this.tooltipOn(d))
        .on("mouseout", d => this.tooltipOff(d));

    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.circle-confirmed {
    fill: #bab0ab;
    fill-opacity: 0.75;
}

.recent-data {
    fill: $warning-color;
}

.penultimate-data {
    fill: $secondary-color;
}

.epi-axis text {
    font-size: 12pt;
}

.epi-line {
    fill: none;
    stroke-width: 2;
}

.recent-fit {
    stroke: $warning-color;
}
.penultimate-fit {
    stroke: $secondary-color;
}

.tooltip--text {
    dominant-baseline: hanging;
    stroke: none !important;
}

.tooltip--date {
    font-weight: 300;
}

.tooltip--case-count {
    font-weight: 500;
}

.switch-button {
    cursor: pointer;
    dominant-baseline: text-after-edge;
    // fill: $grey-90 !important;
    font-weight: 300 !important;
    font-size: 0.85em;

    &:hover {
        text-decoration: underline;
    }
}

.swoopy-arrow,
.swoopy-arrowhead {
    stroke: $grey-70;
    fill: none;
    stroke-width: 0.8;
}
.swoopy-arrowhead {
    stroke-width: 1;
}

.switch-button-rect {
    fill-opacity: 0.15;
    rx: 4;
    ry: 4;
    stroke: $grey-60;
    stroke-width: 0.5;
    shape-rendering: crispedges;
    &:hover {
        fill-opacity: 0.25;
    }
}

.switch-button-hover {
    fill-opacity: 0.25;
}

.epidemiology-curves line.case-def-changed {
    stroke: $grey-60;
    stroke-width: 0.75;
    shape-rendering: crispedges;
    stroke-dasharray: 6, 6;
}
.epidemiology-curves .case-def-changed text {
    text-anchor: start;
}
</style>
