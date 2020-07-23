<template>
<div class="col-sm-12 epidemiology-curves flex-column align-items-center" style="margin-bottom: 45px">
  <svg :width="width" :height="height-45" class="epi-curve" ref="svg" :name="title">
    <defs>
      <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`" class="epi-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="epi-curve" ref="epi_curve"></g>
  </svg>
  <svg :width="width" :height="height" class="swoopy-arrow-group position-absolute" ref="svg_arrows">
    <g ref="switchX" class="switch-x-button-group" transform="translate(0,0)">
      <path class="swoopy-arrow" id="switch-x-btn-swoopy-arrow"></path>
    </g>
    <g ref="switchY" class="switch-y-button-group" transform="translate(5,0)" v-if="loggable">
      <path class="swoopy-arrow" id="switch-y-btn-swoopy-arrow"></path>
      <rect class="switch-button-rect" id="switch-y-btn-rect"></rect>
      <text class="switch-button" id="switch-y-btn-text"></text>
    </g>
  </svg>
  <small class="d-flex position-absolute justify-content-end pr-5 x-axis-select" ref="xSelector">
    <select v-model="xVariable" class="select-dropdown" @change="changeScale">
      <option v-for="option in xVarOptions" :value="option.value" :key="option.value">
        {{ option.label }}
      </option>
    </select>
  </small>

</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  epiDataState$
} from "@/api/epi-traces.js";

import * as d3 from "d3";
import {
  cloneDeep
} from "lodash";

import store from "@/store";

const width = 500;
const height = 300;
const radius = 2.5;
const margin = {
  top: 15,
  right: 225,
  bottom: 75,
  left: 95
};
const transitionDuration = 3500;

export default Vue.extend({
  name: "EpiCurve",
  components: {},
  props: {
    data: Array,
    location: String,
    variableObj: Object,
    xVariableInput: String,
    log: Boolean,
    percapita: Boolean,
    loggable: Boolean,
    percent: Boolean
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
      dataSubscription: null,
      // logData: null,
      plottedData: null,

      // button interfaces
      isLogY: false,
      xVariable: "date",
      xVarOptions: [{
        value: "date",
        label: "date"
      }, {
        value: "daysSince100Cases",
        label: "days since 100 cases"
      }, {
        value: "daysSince10Deaths",
        label: "days since 10 deaths"
      }, {
        value: "daysSince50Deaths",
        label: "days since 50 deaths"
      }],
      // axes
      numXTicks: 6,
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
  computed: {
    dataUpdated() {
      // Combo property to check if the data has changed, or the normalization has.
      // TODO: in Vue 3, this can be streamlined as a dual watcher
      return JSON.stringify(this.data) + this.variable + String(this.percapita);
    },
    title() {
      if (this.data.length == 1) {
        return (this.percapita ? `Number of COVID-19 ${this.variableObj.label} in ${this.data[0].value[0].name} per 100,000 residents` : `Number of COVID-19 ${this.variableObj.label} in ${this.data[0].value[0].name}`)
      } else {
        return (this.percapita ? `Number of COVID-19 ${this.variableObj.label} per 100,000 residents` : `Number of COVID-19 ${this.variableObj.label}`)
      }
    }
  },
  watch: {
    dataUpdated: function() {
      this.updatePlot();
    },
    variableObj: {
      immediate: true,
      handler(newObj, oldObj) {
        this.variable = newObj.value;
        this.updatePlot();
      }
    },
    log: {
      immediate: true,
      handler(newVal, oldVal) {
        this.isLogY = this.loggable ? newVal : false;
      },
    },
    xVariableInput: {
      immediate: true,
      handler(newVal, oldVal) {
        this.xVariable = newVal;
      },
    },
    width() {
      this.updatePlot();
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setPlotDims);
  },
  methods: {
    setPlotDims() {
      // let idealWidth = 750;
      const padding = 0.85;
      let idealWidth = document.getElementById('curveContainer') ? document.getElementById('curveContainer').offsetWidth : 750;

      const whRatio = 5 / 3;
      const framePadding = 32; // left / right padding on the div of 16px ea.
      const newWidth = window.innerWidth < idealWidth ? window.innerWidth * padding - framePadding : idealWidth * padding - framePadding;
      const newHeight = newWidth / whRatio;
      // check height within limits
      if (newHeight > window.innerHeight * padding) {
        this.width = window.innerHeight * whRatio * padding;
        this.height = window.innerHeight * padding;
      } else {
        this.width = newWidth;
        this.height = newHeight;
      }

      this.margin.right = this.width < 600 ? 115 : 205;

      this.numXTicks = this.width < 750 ? 2 : 6;
      this.numYTicks = this.height < 250 ? 2 : 6;
    },
    colorScale: function(location) {
      const scale = store.getters["colors/getColor"];
      return scale(location);
    },
    lightColorScale: function(location) {
      const scale = store.getters["colors/getColor"];
      return scale(location, 0.7);
    },

    changeYScale: function() {
      this.isLogY = !this.isLogY;
      this.changeScale();

    },
    changeScale: function() {
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
          xVariable: this.xVariable,
          percapita: String(this.percapita)
        }
      });

      this.updatePlot();
    },
    tooltipOn: function(d, location_id) {
      d3.select(`#tooltip-${d._id}`).attr("display", "block");

      d3.select(`#${d._id}`).attr("r", this.radius * 2);

      d3.selectAll(`#${d[location_id]}`)
        .select("text")
        .style("font-weight", 700);

      d3.selectAll(`.epi-region`).style("opacity", 0.35);

      d3.selectAll(`#${d[location_id]}`).style("opacity", 1);
    },
    tooltipOff: function(d) {
      d3.selectAll(".tooltip--epi-curve").attr("display", "none");

      d3.selectAll("circle").attr("r", this.radius);

      d3.selectAll(".annotation--region-name").style("font-weight", 400);

      d3.selectAll(`.epi-region`).style("opacity", 1);
    },
    updatePlot: function() {
      console.log("upat")
      this.prepData();

      if (this.data && this.chart) {
        // create slice so you create a copy, and sorting doesn't lead to an infinite update callback loop
        this.updateScales();
        this.drawDots();
      }
    },
    prepData: function() {
      this.loggable = this.variable != "testing_positivity";

      if (this.percapita) {
        this.variable = this.variable.includes("_per_100k") || this.variableObj.percapita === false ? this.variable : this.variable + "_per_100k";
      } else {
        this.variable = this.variable.replace("_per_100k", "");
      }

      if (this.data) {
        this.plottedData = cloneDeep(this.data);

        this.plottedData.forEach(d => {
          d["value"] = this.isLogY && this.loggable ? d.value.filter(x => x[this.variable] >= 1 && (x[this.xVariable] || x[this.xVariable] === 0)) : d.value.filter(x => x[this.variable] && (x[this.xVariable] || x[this.xVariable] === 0));

          // ensure dates are sorted
          d.value.sort((a, b) => a[this.xVariable] - b[this.xVariable]);
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

      this.svg = d3.select(this.$refs.svg);
      this.chart = d3.select(this.$refs.epi_curve);

      this.line = d3
        .line()
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.variable]));
    },
    updateScales: function() {
      if (this.xVariable == "date") {
        this.x = d3.scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain(
            d3.extent(this.plottedData.flatMap(d => d.value).map(d => d[this.xVariable]))
          );
      } else {
        this.x = d3.scaleLinear()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain(
            [0, d3.max(this.plottedData.flatMap(d => d.value).map(d => d[this.xVariable]))]
          );
      }

      if (this.isLogY && this.loggable) {
        this.y = d3
          .scaleLog()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .nice()
          .domain([
            1,
            d3.max(this.plottedData.flatMap(d => d.value).map(d => d[this.variable]))
          ]);
      } else {
        this.y = d3
          .scaleLinear()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .domain([
            0,
            d3.max(this.plottedData.flatMap(d => d.value).map(d => d[this.variable]))
          ]);
      }

      this.xAxis = d3.axisBottom(this.x).ticks(this.numXTicks);

      d3.select(this.$refs.xAxis).call(this.xAxis);

      if (this.isLogY && this.loggable) {
        this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0).ticks(this.numYTicks).tickFormat((d, i) => {
          const log = Math.log10(d);
          return Math.abs(Math.round(log) - log) < 1e-6 ? d3.format(",")(d) : ""
        })
      } else {
        this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0).ticks(this.numYTicks);
      }

      if (this.percent) {
        this.yAxis.tickFormat(d3.format(".0%"))
      }


      d3.select(this.$refs.yAxis).call(this.yAxis);

      // --- update x-scale switch button --
      const dySwitch = -10;
      const xSwoop = 30;
      const ySwoop = -35;
      const swoopOffset = 10;

      d3.select(this.$refs.switchX).select("path")
        .attr("marker-end", "url(#arrow)")
        .attr(
          "d",
          `M ${xSwoop + this.width - this.margin.right} ${this.height + ySwoop}
          C ${xSwoop + this.width - this.margin.right*0.95 } ${this.height-45},
          ${xSwoop + this.width - this.margin.right + 10} ${this.height -
            this.margin.bottom +
            18},
          ${xSwoop + this.width - this.margin.right + ySwoop + 20} ${this.height -
            this.margin.bottom +
            15}`
        );

      // --- update y-scale switch button --
      // const dySwitch = -10;
      // const xSwoop = 30;
      // const ySwoop = -35;
      // const swoopOffset = 10;
      if (this.loggable) {
        this.switchBtn = d3.select(this.$refs.switchY);

        d3.select(this.$refs.switchY).select("rect")
          .attr("x", 0)
          .attr("width", 0)
          .attr("height", 26.5)
          .attr("y", this.height - 28)
          .on("mouseover", () =>
            this.switchBtn.select("rect").classed("switch-button-hover", true)
          )
          .on("mouseout", () =>
            this.switchBtn.select("rect").classed("switch-button-hover", false)
          )
          .on("click", () => this.changeYScale());;

        d3.select(this.$refs.switchY).select("path")
          .attr("marker-end", "url(#arrow)")
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
          );


        const switchTextEnter = this.switchBtn.select("text")
          .attr("class", "switch-button")
          .attr("x", 3.84 * 2)
          .text(`switch to ${this.isLogY ? "linear" : "log"} scale`)
          .attr("y", this.height + 6 - 12.8);

        if (this.switchBtn.select("text").node()) {
          this.switchBtn
            .select("rect")
            .attr(
              "width",
              this.switchBtn
              .select("text")
              .node()
              .getBBox().width + 3.84 * 4
            );
          // .attr(
          //   "height",
          //   .select("text")
          //   .node()
          //   .getBBox().height + 3.84*2
          // );
        }
      }

      d3.select(this.$refs.xSelector)
        .style("right", this.margin.right + "px")
        .style("top", this.height - 28 + "px");
    },
    drawDots: function() {
      if (this.plottedData && this.plottedData.length) {
        const t1 = d3.transition().duration(this.transitionDuration);
        const t2 = d3.transition().duration(1500);
        const formatDate = d3.timeFormat("%d %b %Y");

        // --- annotation: change in case definition ---
        const includesChina = this.plottedData
          .filter(d => d.key.includes("CHN"))
        const dateCaseDefChange = new Date("2020-02-13");

        const defChangedSelector = this.chart
          .selectAll(".case-def-changed")
          .data(includesChina.length > 0 ? ["includesChina"] : []);
        const defChangedLine = this.chart
          .selectAll(".case-def-changed-line")
          .data(includesChina.length > 0 ? ["includesChina"] : []);


        const defChangedEnter = defChangedSelector
          .join(
            enter => {
              enter.append("text")
                .attr("dx", -3)
                .attr("y", 0)
                .attr("x", this.x(dateCaseDefChange))
                .attr("class", "annotation-label case-def-changed")
                .text("Case definition changed")

              // defEnter.append("line")
              //   .attr("class", "annotation--line case-def-changed")
              //   .attr("y1", 8)
              //   .attr("x1", this.x(dateCaseDefChange))
              //   .attr("x2", this.x(dateCaseDefChange))
              //   .attr("y2", this.height - this.margin.top - this.margin.bottom)
            },
            update => {
              update.attr("x", this.x(dateCaseDefChange))

              // update.select("line")
              //   .attr("class", "annotation--line case-def-changed")
              //   .attr("y1", 8)
              //   .attr("x1", this.x(dateCaseDefChange))
              //   .attr("x2", this.x(dateCaseDefChange))
              //   .attr("y2", this.height - this.margin.top - this.margin.bottom)
            },
            exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
          );

        defChangedLine
          .join(
            enter => {
              enter.append("line")
                .attr("class", "annotation--line case-def-changed-line")
                .attr("y1", 8)
                .attr("x1", this.x(dateCaseDefChange))
                .attr("x2", this.x(dateCaseDefChange))
                .attr("y2", this.height - this.margin.top - this.margin.bottom)
            },
            update => {
              update
                .attr("x1", this.x(dateCaseDefChange))
                .attr("x2", this.x(dateCaseDefChange))
                .attr("y2", this.height - this.margin.top - this.margin.bottom)
            },
            exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
          );
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
          .attr("id", d => d.key)
          .attr("fill", d => this.colorScale(d.key));

        // --- region annotation ---
        // using force direction to make sure they don't overlap.
        // based off https://bl.ocks.org/wdickerson/bd654e61f536dcef3736f41e0ad87786
        const labelHeight = 16;
        // Create nodes of the text labels for force direction
        this.plottedData.forEach(d => {
          d["fx"] = 0;
          const yMax = d.value.filter(d => d.mostRecent).map(d => d[this.variable]);
          d["targetY"] = yMax[0] ? this.y(yMax[0]) : this.height;
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
          .force("collide", d3.forceCollide(labelHeight / 2).strength(0.1))
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
          .transition(t2)
          .delay(250)
          .style("opacity", 1);

        countrySelector
          .merge(textEnter)
          // .attr('x', 0)
          // .attr('y', this.y(0))
          .attr("class", d => `annotation--region-name ${d.key}`)
          .attr("x", this.width - this.margin.left - this.margin.right)
          .attr("y", d => d.y)
          .text(d => d.value[0] ? d.value[0].name : "")
          .style("opacity", 1e-6)
          .transition(t1)
          .delay(1000)
          .style("opacity", 1);

        // --- path ---
        const pathSelector = this.chart.selectAll(".epi-line2")
          .data(this.plottedData, d => {
            // kind of a weird hack; on the first iteration of the data call, you get d is this.plottedData[i].value (e.g. array of timepoints)
            // and then it gets called again, where d is this.plottedData[i]
            // this is probably doubling the work that needs to be done, but it works, so...
            return d.key ? d.key : d[0] ? d[0].location_id : null
          })

        pathSelector.join(
          enter => {
            enter.append("path")
              .attr("class", "epi-line2")
              .attr("stroke", d => this.colorScale(d.key))
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .attr("id", d => d.key ? `epi-line-${d.key}` : "epi-line-blank")
              .datum(d => d.value)
              .attr("d", this.line)
              .attr("stroke-dasharray", function() {
                var totalLength = this.getTotalLength();
                return totalLength + " " + totalLength;
              })
              .attr("stroke-dashoffset", function() {
                var totalLength = this.getTotalLength();
                return totalLength;
              })
              .call(update => {
                update.transition(t2)
                  .attr("d", this.line)
                  .ease(d3.easeLinear)
                  .attr("stroke-dashoffset", 0)
              })
          },

          // update
          update => update
          .attr("stroke", d => this.colorScale(d.key))
          .attr("id", d => d.key ? `epi-line-${d.key}` : "epi-line-blank")
          .datum(d => d.value)
          .attr("stroke-dashoffset", 0)
          .attr("stroke-dasharray", "none")
          .call(update => {
            update.transition(t2).attr("d", this.line)
          }),

          // exit
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )

        // --- dots ---
        const keyFunc = function(d, i) {
          return d._id
        }
        const dotGroupSelector = this.chart
          .selectAll(".epi-region")
          .selectAll(".epi-point")
          .data(d => d.value, keyFunc);

        dotGroupSelector.exit().remove();

        const dotGroupEnter = dotGroupSelector
          .join(
            enter => enter.append("circle")
            .attr("r", this.radius)
            .attr("class", "epi-point")
            // .attr("cy", this.y(0))
            .attr("class", d => `epi-point ${d.location_id}`)
            .attr("id", d => `${d._id}`)
            .attr("cx", d => this.x(d[this.xVariable]))
            .attr("cy", d => this.y(d[this.variable]))
            .attr("opacity", 0)
            // .attr("opacity", d => d.mostRecent ? 1 : 0)
            .call(update => update.transition(t2).delay(1500)
              .attr("opacity", d => d.mostRecent ? 1 : 0)),
            update => update
            .attr("class", d => `epi-point ${d.location_id}`)
            .attr("id", d => `${d._id}`)
            .attr("opacity", 0)
            .call(update => update.transition(t2)
              .attr("opacity", d => d.mostRecent ? 1 : 0)
              .attr("cx", d => this.x(d[this.xVariable]))
              .attr("cy", d => this.y(d[this.variable]))),
            exit => exit.call(exit => exit.transition(t2).style("opacity", 1e-5).remove())

          );

        dotGroupSelector
          .merge(dotGroupEnter);

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
          .attr("fill", d => this.lightColorScale(d.key))
          .attr("stroke", d => this.colorScale(d.key));

        tooltipGroupSelector
          .merge(tooltipGroupEnter)
          .attr("class", d => `epi-tooltip-group ${d.key}`);

        // INNER GROUPS: one per timepoint
        const tooltipSelector = this.chart
          .selectAll(".epi-tooltip-group")
          .selectAll(".tooltip--epi-curve")
          .data(d => d.value);

        tooltipSelector.exit().remove();

        const tooltipEnter = tooltipSelector
          .enter()
          .append("g")
          .attr("class", "tooltip--epi-curve")
          .attr("transform", "translate(5,5)")
          .attr("display", "none");

        tooltipSelector
          .merge(tooltipEnter)
          .attr("id", d => `tooltip-${d._id}`);

        const tooltipRect = tooltipSelector.select(".tooltip--rect");

        const tooltipRectEnter = tooltipEnter
          .append("rect")
          .attr("class", "tooltip--rect");

        tooltipRect
          .merge(tooltipRectEnter)
          .attr("x", d => this.x(d[this.xVariable]))
          .attr("y", d => this.y(d[this.variable]))
          .attr("width", 165)
          .attr("height", 60)
          .attr("stroke-dasharray", "165, 285")
          .attr("stroke-width", "3");

        const tooltipText = tooltipSelector.select(".tooltip--text");

        const tooltipTextEnter = tooltipEnter
          .append("text")
          .attr("class", "tooltip--text default-black")
          .attr("transform", "translate(5,5)");

        const tooltipCtryEnter = tooltipTextEnter.append("tspan")
          .attr("class", "tooltip--country");

        tooltipText.select(".tooltip--country").merge(tooltipCtryEnter)
          .attr("x", d => this.x(d[this.xVariable]))
          .attr("y", d => this.y(d[this.variable]))
          .text(d => d.name)

        const tooltipDateEnter = tooltipTextEnter
          .append("tspan")
          .attr("class", "tooltip--date");

        tooltipText
          .select(".tooltip--date")
          .merge(tooltipDateEnter)
          .attr("x", d => this.x(d[this.xVariable]))
          .attr("y", d => this.y(d[this.variable]))
          .attr("dy", "1.1em")
          .text(d => d.date ? formatDate(d.date) : "interpolated value");

        const tooltipCasesEnter = tooltipTextEnter
          .append("tspan")
          .attr("class", "tooltip--case-count");

        tooltipText
          .select(".tooltip--case-count")
          .merge(tooltipCasesEnter)
          .attr("x", d => this.x(d[this.xVariable]))
          .attr("y", d => this.y(d[this.variable]))
          // .attr("dy", "1.1em")
          .attr("dy", "2.2em")
          .text(d => this.percent ? `${d3.format(".1%")(d[this.variable])} ${this.variableObj.ttip}` : `${d[this.variable].toLocaleString()} ${this.variableObj.ttip}`);

        // dynamically adjust the width of the rect
        if (tooltipSelector.selectAll("rect")["_groups"].length) {
          tooltipSelector.each(function(d) {
            const bounds = d3.select(this).select("text")
              .node()
              .getBBox();

            d3.select(this).select("rect").attr("width", bounds.width + 10)
              .attr("height", bounds.height + 5)
              .attr("stroke-dasharray", `${bounds.width + 10}, ${(bounds.height + 5)*2 + bounds.width + 10}`)
          })
        }

        // --- event listeners ---
        d3.selectAll("circle")
          .on("mouseover", d => this.tooltipOn(d, "location_id"))
          .on("mouseout", d => this.tooltipOff(d));

        d3.selectAll(".annotation--region-name")
          .on("mouseover", d => this.tooltipOn(d, "key"))
          .on("mouseout", d => this.tooltipOff(d));
      }
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.epi-axis text {
    font-size: 12pt;
}

.epi-point {
    // opacity: 0.4;
}

.annotation--region-name {
    dominant-baseline: middle;
    stroke: none !important;
    font-family: $font-family;
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
    pointer-events: none;
    dominant-baseline: text-after-edge;
    // fill: $grey-90 !important;
    font-weight: 300 !important;
    font-size: 12.8px;
    fill: $secondary-color;

    &:hover {}
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
    cursor: pointer;
    fill: white;
    rx: 5;
    ry: 5;
    stroke: $secondary-color;
    stroke-width: 1;
    shape-rendering: crispedges;
    &:hover {
        fill: $secondary-bright;
    }
}

.switch-button-hover {}

.epidemiology-curves line.case-def-changed-line {
    stroke: $grey-60;
    stroke-width: 0.75;
    shape-rendering: crispedges;
    stroke-dasharray: 6, 6;
}
.epidemiology-curves .case-def-changed text {
    text-anchor: start;
}

.x-axis-select {
    // top: -29px;
    // right: 20px;
}

.swoopy-arrow-group {
    pointer-events: none;
    & rect {
        pointer-events: auto !important;
    }
}
</style>
