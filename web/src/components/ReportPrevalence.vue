<template>
<div class="d-flex flex-column align-items-center w-100" id="report-prevalence">
  <div class="d-flex flex-column">
    <!-- LEGEND -->
    <div class="d-flex flex-wrap justify-content-between">
      <div class="d-flex flex-column ml-5 mt-3" id="legend">
        <!-- legend: rolling average -->
        <div class="d-flex">
          <svg width="15" height="15" class="mr-2">
            <line x1="0" x2="15" y1="8" y2="8" class="trace-legend"></line>
          </svg>
          <small class="text-muted">7 day rolling average of percent of {{ mutationName }}-positive sequences</small>
        </div>

        <div class="d-flex">
          <svg width="15" height="15" class="mr-2">
            <line x1="0" x2="15" y1="8" y2="8" stroke="#555" stroke-width="1" stroke-dasharray="4,4"></line>
          </svg>
          <small class="text-muted">Days with fewer than {{ rollingTotalThreshold }} total samples</small>
        </div>

        <!-- legend: confidence interval -->
        <div class="d-flex">
          <div class="ci-legend mr-2" :style="{background: CIColor}">

          </div>
          <small class="text-muted">95% confidence interval</small>
        </div>
      </div>

      <div class="d-flex flex-column">
        <ThresholdSlider :countThreshold.sync="rollingTotalThreshold" :maxCount="maxTotal" v-if="maxTotal" />

        <label class="b-contain m-auto pr-3">
          <small>Hide ends w/ &lt; {{ rollingTotalThreshold }} total samples</small>
          <input type="checkbox" :value="trimEnds" v-model.lazy="trimEnds" @change="changeTrimmed" />
          <div class="b-input"></div>
        </label>

      </div>

    </div>

    <!-- zoom btns -->

    <div class="d-flex justify-content-end px-3" :style="{width: width + 'px'}">
      <button class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2" @click="enableZoom">
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
      </button>
      <button class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2" @click="resetZoom">
        <font-awesome-icon class="text-right" :icon="['fas', 'compress-arrows-alt']" />
      </button>
    </div>


    <!-- SVGs -->
    <div class="d-flex flex-column align-items-start mt-2">
      <!-- TIME TRACE -->
      <svg :width="width" :height="height" class="prevalence-curve" ref="svg" :name="title">
        <defs>
          <marker id="arrow" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth" stroke="#929292" fill="none">
            <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
          </marker>
        </defs>

        <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xAxis"></g>
        <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yAxis"></g>
        <g ref="chart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
        <g id="no-data" v-if="!data.length">
          <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">No sequences found</text>
        </g>
        <g id="no-data" v-if="data.length < lengthThreshold && data.length">
          <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">Two points may make a line, but it's not very informative.</text>
          <text font-size="24px" fill="#888888" transform="translate(0, 28)" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">{{location}} only has {{data.length}} {{data.length === 1 ? "date" : "dates"}} with
            sequencing data</text>
        </g>
        <g id="weird-last values" :hidden="data.length < lengthThreshold || trimEnds">
          <text :x="width - margin.left" :y="0" fill="#929292" font-size="14px" dominant-baseline="hanging" text-anchor="end" :style="`font-family: ${fontFamily};`">Latest dates are noisy due to fewer samples</text>
          <path stroke="#BBBBBB" fill="none" :d="`M ${width - margin.left - 75} 20 c 10 10, 20 20, 50 20`" marker-end="url(#arrow)"></path>
        </g>

        <g ref="brush" class="brush" id="brush-zoom" :transform="`translate(${margin.left},${margin.top})`" v-if="data" :class="{hidden: !zoomAllowed}"></g>
      </svg>

      <SequencingHistogram :data="data" :xInput="x" :width="width" :svgTitle="title" :margin="margin" :mutationName="mutationName" className="prevalence-curve prevalence-curve-counts" />

    </div>
  </div>

  <!-- TOOLTIPS -->
  <div ref="tooltip_prevalence" class="tooltip-basic box-shadow" id="tooltip-prevalence">
    <h5 id="date"></h5>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>

    <div id="sequencing-count"></div>
    <div id="sequencing-count-rolling"></div>
  </div>

  <DownloadReportData :data="data" figureRef="prevalence-curve" :isVertical="true" dataType="Mutation Report Prevalence over Time" />

</div>
</template>


<script lang="js">
import Vue from "vue";
import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  timeParse,
  timeFormat,
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  event,
  max,
  brushX,
  format,
  line,
  area,
  transition,
  timeDay
} from "d3";

import cloneDeep from "lodash/cloneDeep";
import findLastIndex from "lodash/findLastIndex";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSearchPlus,
  faCompressArrowsAlt
} from "@fortawesome/free-solid-svg-icons/";

library.add(faSearchPlus, faCompressArrowsAlt);


import DownloadReportData from "@/components/DownloadReportData.vue";
import SequencingHistogram from "@/components/SequencingHistogram.vue";
import ThresholdSlider from "@/components/ThresholdSlider.vue";

export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    mutationName: String,
    location: String,
    trim: String
  },
  components: {
    SequencingHistogram,
    DownloadReportData,
    ThresholdSlider,
    FontAwesomeIcon
  },
  computed: {
    title() {
      return (this.location == "Worldwide" ? `${this.mutationName} prevalence over time worldwide` : `${this.mutationName} prevalence over time in ${this.location}`)
    },
    countTitle() {
      return (`Total samples sequenced by collection date in ${this.location}`)
    }
  },
  data() {
    return {
      width: 400,
      height: 400,
      margin: {
        top: 10,
        bottom: 40,
        left: 70,
        right: 70
      },
      lengthThreshold: 5,
      rollingTotalThreshold: 50,
      CIColor: "#df4ab7",
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",
      // variables
      xVariable: "dateTime",
      yVariable: "proportion",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xMin: null,
      xMax: null,
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 6,
      // methods
      line: null,
      area: null,
      brush: null,
      // refs
      chart: null,
      brushRef: null,
      // data
      plottedData: null,
      maxTotal: null,
      // interaction
      zoomAllowed: false,
      trimEnds: null
    }
  },
  watch: {
    rollingTotalThreshold() {
      this.updatePlot();
    },
    width: function() {
      this.setXScale();
      this.updateBrush();
      this.updatePlot();
    },
    data: function() {
      this.setXScale();
      this.updatePlot();
    },
  },
  mounted() {
    this.trimEnds = this.trim === "true";
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);
      this.updateBrush();
    })

    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
    this.debounceZoom = this.debounce(this.zoom, 150);
  },
  methods: {
    updateBrush() {
      // Update brush so it spans the whole of the area
      this.brush = brushX()
        .extent([
          [0, 0],
          [this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]
        ])
        .on("end", () => this.debounceZoom(event));

      this.brushRef
        .call(this.brush)
        .on("dblclick", this.resetZoom);
    },
    zoom(evt, ref) {
      // reset domain to new coords
      const selection = this.event.selection;

      if (selection) {
        const newMin = this.x.invert(selection[0]);
        const newMax = this.x.invert(selection[1]);

        this.x = scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain([newMin, newMax]);

        // update plotted data
        this.prepData(newMin, newMax);

        // move the brush
        this.brushRef.call(this.brush.move, null);
        this.zoomAllowed = false;
        this.updatePlot();
        //
        //
        // update route
        const queryParams = this.$route.query;

        this.$router.push({
          name: "MutationReport",
          params: {
            disableScroll: true
          },
          query: {
            loc: queryParams.loc,
            muts: queryParams.muts,
            pango: queryParams.pango,
            variant: queryParams.variant,
            selected: queryParams.selected,
            trim: queryParams.trim,
            xmin: timeFormat("%Y-%m-%d")(newMin),
            xmax: timeFormat("%Y-%m-%d")(newMax)
          }
        })
      }
    },
    resetZoom() {
      this.brushRef.call(this.brush.move, null);
      const queryParams = this.$route.query;

      this.xMin = null;
      this.xMax = null;
      this.setXScale();

      this.$router.push({
        name: "MutationReport",
        params: {
          disableScroll: true
        },
        query: {
          loc: queryParams.loc,
          muts: queryParams.muts,
          pango: queryParams.pango,
          selected: queryParams.selected,
          trim: queryParams.trim
        }
      })

      this.updatePlot();
    },
    enableZoom() {
      this.zoomAllowed = true;
    },
    changeTrimmed() {
      this.setXScale();

      this.updatePlot();
      // update route
      const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        params: {
          disableScroll: true
        },
        query: {
          loc: queryParams.loc,
          muts: queryParams.muts,
          pango: queryParams.pango,
          variant: queryParams.variant,
          selected: queryParams.selected,
          trim: String(this.trimEnds),
          xmin: queryParams.xmin,
          xmax: queryParams.xmax
        }
      })
    },
    setDims() {
      const mx = 0.7;
      const my = 0.9;
      const hwRatio = 0.525;
      const svgContainer = document.getElementById('report-prevalence');

      let maxWidth = svgContainer ? svgContainer.offsetWidth : 800;
      maxWidth = maxWidth < 500 ? maxWidth * 0.98 : maxWidth * mx;
      const maxHeight = window.innerHeight * my;

      const idealHeight = hwRatio * maxWidth;
      if (idealHeight <= maxHeight) {
        this.height = idealHeight;
        this.width = maxWidth;
      } else {
        this.height = maxHeight;
        this.width = this.height / this.hwRatio;
      }

      if (this.width < 600) {
        this.numXTicks = 2;
        this.numYTicks = 4;
      } else {
        this.numXTicks = 6;
        this.numYTicks = 5;
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.chart);
      this.brushRef = select(this.$refs.brush);

      // estimate
      this.line = line()
        .defined(d => d.total_count_rolling >= this.rollingTotalThreshold)
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.yVariable]));

      this.line2 = line()
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.yVariable]));

      // confidence interval area method
      this.area = area()
        .x(d => this.x(d[this.xVariable]))
        .y0(d => this.y(d.proportion_ci_lower))
        .y1(d => this.y(d.proportion_ci_upper));
    },
    setXScale() {
      this.xMin = timeParse("%Y-%m-%d")(this.$route.query.xmin);
      this.xMax = timeParse("%Y-%m-%d")(this.$route.query.xmax);

      let xDomain;
      if (this.xMin && this.xMax && this.xMin < this.xMax) {
        this.prepData(this.xMin, this.xMax);
        xDomain = [this.xMin, this.xMax];
      } else {
        this.prepData(0, Infinity)
        xDomain = extent(this.plottedData.map(d => d[this.xVariable]));
      }

      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(xDomain);
    },
    prepData(xMin, xMax) {
      this.plottedData = cloneDeep(this.data);
      this.plottedData = this.plottedData.filter(d => d[this.xVariable] >= xMin && d[this.xVariable] <= xMax);

      if (this.trimEnds) {
        const minIdx = this.plottedData.findIndex(d => d.total_count_rolling >= this.rollingTotalThreshold);
        const maxIdx = findLastIndex(this.plottedData, d => d.total_count_rolling >= this.rollingTotalThreshold);
        this.plottedData = this.plottedData.slice(minIdx, maxIdx);
      }
    },
    updateScales() {
      this.maxTotal = max(this.data, d => d.total_count);
      const avgMax = max(this.plottedData, d => d[this.yVariable]);
      const CIMax = max(this.plottedData, d => d.proportion_ci_upper);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, (avgMax + CIMax) * 0.5])
      // .domain([0, max(this.data, d => d[this.yVariable])])

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.yAxis).call(this.yAxis);
    },
    tooltipOn() {
      const ttipShift = 20;

      // find closest date
      const selectedX = this.x.invert(event.offsetX - this.margin.left);
      const selectedDate = timeDay.round(selectedX);
      const selected = this.plottedData.filter(d => Math.abs(d.dateTime - selectedDate) < 1e-12);

      if (selected.length) {
        // tooltip on
        const ttip = select(this.$refs.tooltip_prevalence);

        // edit text
        ttip.select("h5").text(selected[0].date)

        ttip.select("#proportion").text(format(".0%")(selected[0].proportion))
        ttip.select("#confidence-interval").text(`(95% CI: ${format(".0%")(selected[0].proportion_ci_lower)}-${format(".0%")(selected[0].proportion_ci_upper)})`)
        ttip.select("#sequencing-count").text(`Number of cases: ${format(",")(selected[0].lineage_count)}/${format(",")(selected[0].total_count)}`)
        ttip.select("#sequencing-count-rolling").text(`Rolling average: ${format(",.1f")(selected[0].lineage_count_rolling)}/${format(",.1f")(selected[0].total_count_rolling)}`)

        // fix location
        ttip
          .style("left", `${event.clientX + ttipShift}px`)
          .style("top", `${event.clientY + ttipShift}px`)
          .style("display", "block");

        // histogram off/on
        selectAll(".raw-counts")
          .style("opacity", 0.3);

        selectAll(`#date${selected[0].date}`)
          .style("opacity", 1);
      }
    },
    tooltipOff() {
      select(this.$refs.tooltip_prevalence)
        .style("display", "none");

      selectAll(".raw-counts")
        .style("opacity", 1);
    },
    updatePlot() {
      const t1 = transition().duration(2500);

      if (this.plottedData) {
        this.updateScales();


        const CISelector = this.chart
          .selectAll(".confidence-interval")
          .data([this.plottedData]);

        CISelector.join(
          enter => {
            enter.append("path")
              .attr("class", "confidence-interval")
              .style("fill", this.CIColor)
              .style("fill-opacity", 0.3)
              .attr("d", this.area)
          },
          update => update
          // .transition(t1)
          .attr("d", this.area),
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

        const dashedPath = this.chart
          .selectAll(".prevalence-line-all")
          .data([this.plottedData]);

        dashedPath.join(
          enter => {
            enter.append("path")
              .attr("class", "prevalence-line-all")
              .style("stroke", "#555")
              .style("fill", "none")
              .style("stroke-width", "1")
              .style("stroke-dasharray", "4,4")
              .datum(d => d)
              .attr("d", this.line2)
          },
          // update
          update => update
          .datum(d => d)
          // .transition(t1)
          .attr("d", this.line2),

          // exit
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

        const pathSelector = this.chart
          .selectAll(".prevalence-line")
          .data([this.plottedData]);

        pathSelector.join(
          enter => {
            enter.append("path")
              .attr("class", "prevalence-line")
              .style("stroke", "#2c3e50")
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .datum(d => d)
              .attr("d", this.line)
          },
          // update
          update => update
          .datum(d => d)
          // .transition(t1)
          .attr("d", this.line),

          // exit
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

        // event listener for tooltips
        this.chart.selectAll(".confidence-interval")
          .on("mousemove", () => this.tooltipOn())
          .on("mouseleave", () => this.tooltipOff())
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
.count-axis,
.prevalence-axis {
    font-size: 16px;
    text {
        fill: $grey-90;
    }

}
.ci-legend {
    width: 15px;
    height: 15px;
    opacity: 0.3;
}
.trace-legend {
    stroke: $base-grey;
    stroke-width: 2.5;
}
</style>
