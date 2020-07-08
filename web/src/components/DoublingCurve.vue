<template>
  <div class="doubling-curves d-flex flex-column align-items-center">
    <div style="max-width:700px;" v-if="drawable" class="m-auto d-flex">
      <Warning
        :animate="true"
        class="mt-2"
        text="Click on the graph to select new points"
      ></Warning>
      <div
        class="alert done-btn p-2 row m-0 rounded-0 mt-2 scale-in-center"
        @click="executeFit"
      >
        done
      </div>
    </div>

    <svg :width="width" :height="height" class="doubling-curve" :name="title">
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
    </svg>
    <DataSource :ids="['NYT','JHU']" v-if="data" dataType="maps" figureRef="doubling-curve" :data="plottedData" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DataSource from "@/components/DataSource.vue";
import Warning from "@/components/Warning.vue";

import * as d3 from "d3";
import { cloneDeep } from "lodash";

import store from "@/store";

const width = 500;
const height = 300;
const radius = 4.5;
const margin = {
  top: 15,
  right: 25,
  bottom: 75,
  left: 95
};
const transitionDuration = 500;

export default Vue.extend({
  name: "DoublingCurve",
  components: {
    DataSource,
    Warning
  },
  props: {
    data: Object,
    toFit: Number,
    variable: String
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
      plottedData: null,
      fit1: null,
      fit2: null,

      // button interfaces
      selectedPoints: [],

      // axes
      numXTicks: 8,
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
      this.prepData();
      this.updatePlot();
    },
    width() {
      this.updatePlot();
    }
  },
  computed: {
    title() {
      return(`Cumulative number of COVID-19 ${this.variable} in ${this.data.data[0].name}`)
    },
    fitIdx1() {
      return d3.range(this.fit1.minIdx, this.fit1.maxIdx);
    },
    fitIdx2() {
      return d3.range(this.fit2.minIdx, this.fit2.maxIdx);
    },
    drawable() {
      if (this.toFit) {
        this.removeFit();
        this.drawRect();
      }
      return this.toFit;
    },
    locationName() {
      if (this.plottedData.length === 1) {
        return this.plottedData[0].locationName;
      }
      return null;
    },
    dataLength() {
      return this.plottedData.length;
    }
  },
  mounted() {
    this.prepData();
    this.setupPlot();
    this.updatePlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setPlotDims);
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

      this.numXTicks = this.width < 650 ? 4 : 6;
      this.numYTicks = this.height < 250 ? 4 : 6;
    },
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
        this.prepData();
        this.updateScales();
        this.drawDots();
      }
    },
    prepData: function() {
      if (this.data) {
        // console.log(this.data)
        // console.log(this.plottedData)
        this.plottedData = this.data.data.filter(d => d[this.variable]);
        this.fit1 = this.data.fit1;
        this.fit2 = this.data.fit2;
      }
    },
    drawRect() {
      console.log("drawing rect");
      // this.drawable = !this.drawable;
      // allow drawing of rects
      // based off https://bl.ocks.org/romsson/568e166d702b4a464347
      const mousedown = function(x, y, variable) {
        const mouseLoc = d3.mouse(d3.event.target);
        d3.select(".doubling-curve")
          .append("rect")
          .attr("class", "selection-box")
          .attr("x", mouseLoc[0])
          .attr("y", mouseLoc[1])
          .attr("width", 0)
          .attr("height", 0);

        d3.select(".doubling-curve").on("mousemove", () =>
          mousemove(x, y, variable)
        );
      };

      const mouseup = function() {
        d3.select(".doubling-curve").on("mousemove", null);
      };

      const mousemove = function(x, y, variable) {
        console.log(y);
        const mouseLoc = d3.mouse(d3.event.target);
        console.log(mouseLoc);
        console.log(d3.event);

        const rect = d3.select(".doubling-curve").select(".selection-box");

        const x1 = mouseLoc[0];
        const x2 = +rect.attr("x");
        const y1 = mouseLoc[1];
        const y2 = +rect.attr("y");

        rect
          .attr("width", Math.max(0, x1 - x2))
          .attr("height", Math.max(0, y1 - y2));

        const circles = d3.selectAll("circle").classed("highlight", d => {
          return (
            d && d[variable] && y(d[variable]) <= y2 && y(d[variable]) >= y1
          );
        });
      };

      this.svg = d3
        .select("svg.doubling-curve")
        .on("mousedown", () => mousedown(this.x, this.y, this.variable))
        .on("mouseup", mouseup);
    },
    executeFit: function() {
      console.log("finishing fit");
      this.$emit("executeFit", this.toFit);
    },
    removeFit: function() {
      console.log("removing fit");
      this.chart.selectAll(".epi-line").style("opacity", 0.3);
      if (this.toFit === 2) {
        this.chart.selectAll("circle").classed("penultimate-data", false);
        this.chart.selectAll(".penultimate-fit").style("display", "none");
      }
      if (this.toFit === 1) {
        this.chart.selectAll("circle").classed("recent-data", false);
        this.chart.selectAll(".recent-fit").style("display", "none");
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

      this.svg = d3.select("svg.doubling-curve");
      this.chart = d3.select("#epi-curve");
      this.dots = this.chart.append("g").attr("id", "confirmed-timepoints");

      this.line = d3
        .line()
        .x((d, i) => this.x(d.date))
        .y(d => this.y());
    },
    updateScales: function() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(d3.extent(this.plottedData.map(d => d.date)));

      this.y = d3
        .scaleLog()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([1, d3.max(this.plottedData.map(d => d[this.variable]))]);

      this.xAxis = d3.axisBottom(this.x).ticks(this.numXTicks);

      d3.select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = d3
        .axisLeft(this.y)
        .ticks(this.numYTicks)
        .tickFormat((d, i) => {
          const log = Math.log10(d);
          return Math.abs(Math.round(log) - log) < 1e-6
            ? d3.format(",")(d)
            : "";
        });

      d3.select(this.$refs.yAxis).call(this.yAxis);
    },
    drawDots: function() {
      const t1 = d3.transition().duration(this.transitionDuration);
      const formatDate = d3.timeFormat("%d %b %Y");

      // --- best-fit lines ---
      //       // y = -1222.7800       0.0672
      //       dashed line animation from Nadieh Brehmer: https://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
      const calcDashArray = function(selector) {
        //Get the total length of the path
        var totalLength = selector.getTotalLength();

        /////// Create the required stroke-dasharray to animate a dashed pattern ///////

        //Create a (random) dash pattern
        //The first number specifies the length of the visible part, the dash
        //The second number specifies the length of the invisible part
        var dashing = "12,6";

        //This returns the length of adding all of the numbers in dashing
        //(the length of one pattern in essence)
        //So for "6,6", for example, that would return 6+6 = 12
        var dashLength = dashing
          .split(/[\s,]/)
          .map(function(a) {
            return parseFloat(a) || 0;
          })
          .reduce(function(a, b) {
            return a + b;
          });

        //How many of these dash patterns will fit inside the entire path?
        var dashCount = Math.ceil(totalLength / dashLength);

        //Create an array that holds the pattern as often
        //so it will fill the entire path
        var newDashes = new Array(dashCount).join(dashing + " ");

        //Then add one more dash pattern, namely with a visible part
        //of length 0 (so nothing) and a white part
        //that is the same length as the entire path
        var dashArray = newDashes + " 0, " + totalLength;
        return totalLength + " " + totalLength;
        // return dashArray
      };

      const penultimateFitSelector = this.chart
        .selectAll(".penultimate-fit")
        .data([this.fit1]);

      penultimateFitSelector.join(
        enter =>
          enter
            .append("line")
            .attr("class", "epi-line penultimate-fit")
            .style("fill", "none")
            .style("stroke-width", "2")
            .style("stroke", "#59a14f")
            // .transition(t1)
            .attr("x1", d => this.x(d.x1))
            .attr("x2", d => this.x(d.x2))
            .attr("y1", d => this.y(d.y1))
            .attr("y2", d => this.y(d.y2))
            .attr("stroke-dasharray", function() {
              return calcDashArray(this);
            })
            .attr("stroke-dashoffset", function() {
              var totalLength = this.getTotalLength();
              return totalLength;
            })
            .call(update =>
              update
                .transition(t1)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
            ),
        update =>
          update
            .attr("x1", d => this.x(d.x1))
            .attr("x2", d => this.x(d.x2))
            .attr("y1", d => this.y(d.y1))
            .attr("y2", d => this.y(d.y2))
            .attr("stroke-dasharray", function() {
              return calcDashArray(this);
            })
            .attr("stroke-dashoffset", function() {
              var totalLength = this.getTotalLength();
              return totalLength;
            })
            .call(update =>
              update
                .transition(t1)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
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

      // y = -313.6766 + 0.0176x
      const recentFitSelector = this.chart
        .selectAll(".recent-fit")
        .data([this.fit2]);

      recentFitSelector.join(
        enter =>
          enter
            .append("line")
            .attr("class", "epi-line recent-fit")
            .style("fill", "none")
            .style("stroke-width", "2")
            .style("stroke", "#f28e2c")
            // .transition(t1)
            .attr("x1", d => this.x(d.x1))
            .attr("x2", d => this.x(d.x2))
            .attr("y1", d => this.y(d.y1))
            .attr("y2", d => this.y(d.y2))
            .attr("stroke-dasharray", function() {
              return calcDashArray(this);
            })
            .attr("stroke-dashoffset", function() {
              var totalLength = this.getTotalLength();
              return totalLength;
            })
            .call(update =>
              update
                .transition(t1)
                .delay(this.transitionDuration + 50)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
            ),
        update =>
          update
            .attr("x1", d => this.x(d.x1))
            .attr("x2", d => this.x(d.x2))
            .attr("y1", d => this.y(d.y1))
            .attr("y2", d => this.y(d.y2))
            .attr("stroke-dasharray", function() {
              return calcDashArray(this);
            })
            .attr("stroke-dashoffset", function() {
              var totalLength = this.getTotalLength();
              return totalLength;
            })
            .call(update =>
              update
                .transition(t1)
                .delay(this.transitionDuration + 50)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
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

      // --- show cases as dot plot ---
      const dotGroups = this.dots
        .selectAll(".circle-confirmed")
        .data(this.plottedData);

      // -- exit --
      dotGroups.exit().remove();

      // -- enter --
      const dotsEnter = dotGroups
        .enter()
        .append("circle")
        .attr("r", this.radius);
      dotGroups
        .merge(dotsEnter)
        .attr("id", d => d.id)
        .attr("class", d => `circle-confirmed ${d.id}`)
        .style("fill", d => this.fitIdx2.includes(d.idx) ? "#f28e2c" : (this.fitIdx1.includes(d.idx) ? "#59a14f" : "#bab0ab"))
        .style("fill-opacity", 0.5)
        .attr("cx", d => this.x(d.date))
        .attr("cy", d => this.y(d[this.variable]))
        .classed("recent-data", d => this.fitIdx2.includes(d.idx))
        .classed("penultimate-data", d => this.fitIdx1.includes(d.idx));

      // --- tooltips ---
      // need to be outside the path/dot groups, so they're on top of all the curves.
      // OUTER GROUP: one per country
      // const tooltipGroupSelector = this.chart
      //   .selectAll(".epi-tooltip-group")
      //   .data(this.plottedData);
      //
      // // -- exit --
      // tooltipGroupSelector.exit().remove();
      //
      // // -- enter --
      // const tooltipGroupEnter = tooltipGroupSelector
      //   .enter()
      //   .append("g")
      //   .attr("class", "epi-tooltip-group")
      //   .attr("fill", d => this.lightColorScale(d.locationName))
      //   .attr("stroke", d => this.colorScale(d.locationName));
      //
      // tooltipGroupSelector
      //   .merge(tooltipGroupEnter)
      //   .attr("class", d => `epi-tooltip-group ${d.id}`);
      //
      // // INNER GROUPS: one per timepoint
      // const tooltipSelector = this.chart
      //   .selectAll(".epi-tooltip-group")
      //   .selectAll(".tooltip--epi-curve")
      //   .data(d => d.data);
      //
      // tooltipSelector.exit().remove();
      //
      // const tooltipEnter = tooltipSelector
      //   .enter()
      //   .append("g")
      //   .attr("class", "tooltip--epi-curve")
      //   .attr("transform", "translate(5,5)")
      //   .attr("display", "none");
      //
      // tooltipSelector
      //   .merge(tooltipEnter)
      //   .attr("id", d => `tooltip-${d.id}-${d.date_string}`);
      //
      // const tooltipRect = tooltipSelector.select(".tooltip--rect");
      //
      // const tooltipRectEnter = tooltipEnter
      //   .append("rect")
      //   .attr("class", "tooltip--rect");
      //
      // tooltipRect
      //   .merge(tooltipRectEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.confirmed))
      //   .attr("width", 108)
      //   .attr("height", 40)
      //   .attr("stroke-dasharray", "108, 188")
      //   .attr("stroke-width", "3");
      //
      // const tooltipText = tooltipSelector.select(".tooltip--text");
      //
      // const tooltipTextEnter = tooltipEnter
      //   .append("text")
      //   .attr("class", "tooltip--text default-black")
      //   .attr("transform", "translate(5,5)");
      //
      // const tooltipDateEnter = tooltipTextEnter
      //   .append("tspan")
      //   .attr("class", "tooltip--date");
      //
      // tooltipText
      //   .select(".tooltip--date")
      //   .merge(tooltipDateEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.confirmed))
      //   // .attr("dy", "1.1em")
      //   .text(d => formatDate(d.date));
      //
      // const tooltipCasesEnter = tooltipTextEnter
      //   .append("tspan")
      //   .attr("class", "tooltip--case-count");
      //
      // tooltipText
      //   .select(".tooltip--case-count")
      //   .merge(tooltipCasesEnter)
      //   .attr("x", d => this.x(d.date))
      //   .attr("y", d => this.y(d.confirmed))
      //   .attr("dy", "1.1em")
      //   // .attr("dy", "2.2em")
      //   .text(d => `${d.confirmed.toLocaleString()} cases`);
      //
      //
      // // --- event listeners ---
      // d3.selectAll("circle")
      //   .on("mouseover", d => this.tooltipOn(d))
      //   .on("mouseout", d => this.tooltipOff(d));
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
$fit1-color: #59a14f;
$fit2-color: #f28e2c;

.doubling-curves {
  & .epi-axis {
    -webkit-user-select: none;
    /* Safari */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* IE10+/Edge */
    user-select: none;
    /* Standard */
  }

  & .recent-data {
    fill: $fit2-color;
    fill-opacity: 0.5;
  }

  & .penultimate-data {
    fill: $fit1-color;
    fill-opacity: 0.5;
  }

  & .epi-axis text {
    font-size: 12pt;
  }

  & .tooltip--text {
    dominant-baseline: hanging;
    stroke: none !important;
  }

  & .tooltip--date {
    font-weight: 300;
  }

  & .tooltip--case-count {
    font-weight: 500;
  }
  & .selection-box {
    opacity: 0.2;
  }
  .highlight {
    fill: green !important;
  }

  .done-btn {
    background: lighten($warning-color, 40%);
    border: 1px solid $warning-color;
    cursor: pointer;
    color: $warning-color;
    text-transform: uppercase;
    font-size: 0.8em;
    font-weight: 600;
    align-items: center;
  }
}
</style>
