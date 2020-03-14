<template>
  <div class="epidemiology-curves flex-column align-left">
    <div
      class="flex-column too-many-warning"
      v-if="dataLength > lengthThreshold"
    >
      <div
        class="text-center m-auto p-2 bg-grey__lightest"
        style="max-width:700px;"
      >
        <label class="b-contain m-auto">
          <span>show more than {{ lengthThreshold }} curves</span>
          <input type="checkbox" v-model="showAll" @click="plotAll()" />
          <div class="b-input"></div>
        </label>
      </div>
      <div style="max-width:700px;" class="m-auto">
        <Warning
          :animate="true"
          class="mt-2"
          v-if="!showAll"
          :text="
            'You have selected a lot of places. Showing the top ' +
              lengthThreshold +
              ' with the highest current case counts'
          "
        ></Warning>
      </div>
    </div>
    <!-- <button @click="switchAxes()">common axis</button> -->
    <h3 class="plot-title text-sec py-5">
      Cumulative number of COVID-19 cases<span v-if="locationName">
        in {{ locationName }}</span
      >
    </h3>
    <DataUpdated />
    <svg :width="width" :height="height" class="epi-curve">
      <defs>
        <marker
          id="arrow"
          markerWidth="13"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>
      <g
        :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`"
        class="epi-axis axis--x"
        ref="xAxis"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="epi-axis axis--y"
        ref="yAxis"
      ></g>
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        id="epi-curve"
      ></g>
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        id="transition-mask"
      ></g>
    </svg>
    <DataSource />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";
import Warning from "@/components/Warning.vue";

import * as d3 from "d3";
import { cloneDeep } from "lodash";

import store from "@/store";

const width = 500;
const height = 300;
const radius = 2.5;
const margin = {
  top: 10,
  right: 170,
  bottom: 75,
  left: 70
};
const transitionDuration = 3500;

export default Vue.extend({
  name: "EpiCurve",
  components: {
    DataUpdated,
    DataSource,
    Warning
  },
  props: {
    data: Array
  },
  data() {
    return {
      width,
      height,
      margin,
      radius,
      transitionDuration,
      backgroundColor: "#f8f9fa",

      // data
      logData: null,
      plottedData: null,

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
      switchBtn: null,
      // methods
      line: null
    };
  },
  watch: {
    data: function() {
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
    colorScale: function(location) {
      const scale = store.getters["colors/getColor"];
      return scale(location);
    },
    lightColorScale: function(location) {
      const scale = store.getters["colors/getColor"];
      return scale(location, 0.7);
    },
    changeScale: function() {
      this.isLogY = !this.isLogY;

      this.updatePlot();
    },
    tooltipOn: function(d) {
      d3.select(`#tooltip-${d.id}-${d.date_string}`).attr("display", "block");

      d3.select(`#${d.id}-${d.date_string}`).attr("r", this.radius * 2);

      d3.select(`#${d.id}`)
        .select("text")
        .style("font-weight", 700);

      d3.selectAll(`.epi-region`).style("opacity", 0.35);

      d3.selectAll(`#${d.id}`).style("opacity", 1);
    },
    tooltipOff: function(d) {
      d3.selectAll(".tooltip--epi-curve").attr("display", "none");

      d3.selectAll("circle").attr("r", this.radius);

      d3.selectAll(".annotation--region-name").style("font-weight", 400);

      d3.selectAll(`.epi-region`).style("opacity", 1);
    },
    plotAll: function() {
      this.showAll = !this.showAll;
      this.updatePlot();
    },
    updatePlot: function() {
      if (this.data) {
        if (this.showAll) {
          // create slice so you create a copy, and sorting doesn't lead to an infinite update callback loop
          this.plottedData = this.isLogY ? this.logData : this.data;
          this.$emit("addable", []);
        } else {
          this.plottedData = this.isLogY
            ? this.logData
                .slice()
                .sort((a, b) => b.currentCases - a.currentCases)
                .slice(0, this.lengthThreshold)
            : this.data
                .slice()
                .sort((a, b) => b.currentCases - a.currentCases)
                .slice(0, this.lengthThreshold);
          const toAdd = this.data
            .slice()
            .sort((a, b) => b.currentCases - a.currentCases)
            .slice(this.lengthThreshold)
            .map(d => d.locationName);
          this.$emit("addable", toAdd);
        }

        this.updateScales();
        this.drawDots();
      }
    },
    prepData: function() {
      if (this.data) {
        this.logData = cloneDeep(this.data);
        this.logData.forEach(d => {
          d["data"] = d.data.filter(x => x.cases > 0);
        });
      }
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

      this.line = d3
        .line()
        .x(d => this.x(d.date))
        .y(d => this.y(d.cases));
    },
    updateScales: function() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(
          d3.extent(this.plottedData.flatMap(d => d.data).map(d => d.date))
        );

      if (this.isLogY) {
        this.y = d3
          .scaleLog()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .domain([
            1,
            d3.max(this.plottedData.flatMap(d => d.data).map(d => d.cases))
          ]);
      } else {
        this.y = d3
          .scaleLinear()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .domain([
            0,
            d3.max(this.plottedData.flatMap(d => d.data).map(d => d.cases))
          ]);
      }

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

      // --- annotation: change in case definition ---
      const includesChina = this.plottedData
        .map(d => d.region)
        .includes("China");
      const dateCaseDefChange = new Date("2020-02-13");

      const defChangedSelector = this.chart
        .selectAll(".case-def-changed")
        .data(includesChina ? ["includesChina"] : []);

      defChangedSelector.exit().remove();

      const defChangedEnter = defChangedSelector
        .enter()
        .append("g")
        .attr("class", "annotation-group case-def-changed");

      defChangedSelector.merge(defChangedEnter);

      defChangedEnter
        .append("text")
        .attr("x", this.x(dateCaseDefChange))
        .attr("dx", -3)
        .attr("y", 0)
        .text("Case definition changed");

      defChangedEnter
        .append("line")
        .attr("class", "annotation--line case-def-changed")
        .attr("x1", this.x(dateCaseDefChange))
        .attr("x2", this.x(dateCaseDefChange))
        .attr("y1", 8)
        .attr("y2", this.height);

      // --- create groups for each region ---
      const regionGroups = this.chart
        .selectAll(".epi-region")
        .data(this.plottedData);

      // -- exit --
      regionGroups.exit().remove();

      // -- enter --
      const regionsEnter = regionGroups
        .enter()
        .append("g")
        .attr("class", "epi-region");

      regionGroups
        .merge(regionsEnter)
        .attr("id", d => d.id)
        .attr("fill", d => this.colorScale(d.locationName))
        .attr("stroke", d => this.colorScale(d.locationName));

      // --- region annotation ---
      // using force direction to make sure they don't overlap.
      // based off https://bl.ocks.org/wdickerson/bd654e61f536dcef3736f41e0ad87786
      const labelHeight = 16;
      // Create nodes of the text labels for force direction
      this.plottedData.forEach(d => {
        d["fx"] = 0;
        d["targetY"] = this.y(d.currentCases);
      });

      // Define a custom force
      const forceClamp = (min, max) => {
        let nodes;
        const force = () => {
          nodes.forEach(n => {
            if (n.y > max) n.y = max;
            if (n.y < min) n.y = min;
          });
        };
        force.initialize = _ => (nodes = _);
        return force;
      };

      // Set up the force simulation
      const force = d3
        .forceSimulation()
        .nodes(this.plottedData)
        .force("collide", d3.forceCollide(labelHeight / 2))
        .force("y", d3.forceY(d => d.targetY).strength(1))
        .force(
          "clamp",
          forceClamp(0, this.height - this.margin.top - this.margin.bottom)
        )
        .stop();

      // Execute the simulation
      for (let i = 0; i < 300; i++) force.tick();

      const countrySelector = this.chart
        .selectAll(".epi-region")
        .select(".annotation--region-name");

      const textEnter = regionsEnter
        .append("text")
        .style("stroke", "none")
        .attr("dx", 8)
        .style("opacity", 1e-6)
        .transition(t1)
        .delay(1000)
        .style("opacity", 1);

      countrySelector
        .merge(textEnter)
        // .attr('x', 0)
        // .attr('y', this.y(0))
        .attr("class", d => `annotation--region-name ${d.id}`)
        .attr("x", this.width - this.margin.left - this.margin.right)
        .attr("y", d => d.y)
        .text(d => d.locationName)
        .style("opacity", 1e-6)
        .transition(t1)
        .delay(1000)
        .style("opacity", 1);

      // --- path ---
      const pathEnter = regionsEnter.append("path").attr("class", "epi-line");

      const pathSelector = this.chart
        .selectAll(".epi-region")
        .select(".epi-line");

      pathSelector
        .merge(pathEnter)
        .datum(d => d.data)
        .attr("id", d => `epi-line ${d[0].id}`)
        .attr("d", this.line);

      // --- dots ---
      const dotGroupSelector = this.chart
        .selectAll(".epi-region")
        .selectAll(".epi-point")
        .data(d => d.data);

      dotGroupSelector.exit().remove();

      const dotGroupEnter = dotGroupSelector
        .enter()
        .append("circle")
        .attr("r", this.radius)
        .attr("class", "epi-point");

      dotGroupSelector
        .merge(dotGroupEnter)
        .attr("class", d => `epi-point ${d.id}`)
        .attr("id", d => `${d.id}-${d.date_string}`)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d.cases));

      // --- tooltips ---
      // need to be outside the path/dot groups, so they're on top of all the curves.
      // OUTER GROUP: one per country
      const tooltipGroupSelector = this.chart
        .selectAll(".epi-tooltip-group")
        .data(this.plottedData);

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
        .attr("y", d => this.y(d.cases))
        .attr("width", 108)
        .attr("height", 40)
        .attr("stroke-dasharray", "108, 188")
        .attr("stroke-width", "3");

      const tooltipText = tooltipSelector.select(".tooltip--text");

      const tooltipTextEnter = tooltipEnter
        .append("text")
        .attr("class", "tooltip--text default-black")
        .attr("transform", "translate(5,5)");

      // const tooltipCtryEnter = tooltipTextEnter.append("tspan")
      //   .attr("class", "tooltip--country");
      //
      // tooltipText.select(".tooltip--country").merge(tooltipCtryEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.cases))
      //   .text(d => d.id.replace(/_/g, " "))

      const tooltipDateEnter = tooltipTextEnter
        .append("tspan")
        .attr("class", "tooltip--date");

      tooltipText
        .select(".tooltip--date")
        .merge(tooltipDateEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        // .attr("dy", "1.1em")
        .text(d => formatDate(d.date));

      const tooltipCasesEnter = tooltipTextEnter
        .append("tspan")
        .attr("class", "tooltip--case-count");

      tooltipText
        .select(".tooltip--case-count")
        .merge(tooltipCasesEnter)
        .attr("x", d => this.x(d.date))
        .attr("y", d => this.y(d.cases))
        .attr("dy", "1.1em")
        // .attr("dy", "2.2em")
        .text(d => `${d.cases.toLocaleString()} cases`);

      // dynamically adjust the width of the rect
      // dots.selectAll(".tooltip--epi-curve").selectAll('rect')
      // .attr("width", functiond {
      //   console.log(d3.select(this.parentNode));
      //   return(500)
      // })
      // dots.select(".tooltip--rect").attr("width", d => 500)
      // `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().width + 10}`)
      // .attr("height", d => `${(document.getElementById("text-" + d.data.name.replace("*", "-").replace("@", "--")) as any).getBBox().height + 5}`);

      // --- event listeners ---
      d3.selectAll("circle")
        .on("mouseover", d => this.tooltipOn(d))
        .on("mouseout", d => this.tooltipOff(d));

      // --- transition: trace the curves ---
      const curtainSelector = this.svg
        .select("#transition-mask")
        .selectAll(".transition-curtain")
        .data([0]);

      curtainSelector.exit().remove();

      const curtainEnter = curtainSelector
        .enter()
        .append("rect")
        .attr("class", "transition-curtain")
        .style("fill", this.backgroundColor)
        .attr("y", -this.margin.top)
        .attr("width", this.width + this.radius - this.margin.left)
        .attr("height", this.height + this.radius * 2);

      curtainSelector
        .merge(curtainEnter)
        .attr("x", -this.radius)
        .transition(t1)
        .ease(d3.easeLinear)
        .attr("x", this.width - this.margin.left);
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.epi-axis text {
  font-size: 12pt;
}

.epi-line {
  fill: none;
  stroke-width: 2;
}

.epi-point {
  // opacity: 0.4;
}

.annotation--region-name {
  dominant-baseline: middle;
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
