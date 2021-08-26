<template>
<div class="d-flex flex-column align-items-center w-100" id="report-prevalence">
  <div class="d-flex flex-column">
    <!-- LEGEND -->
    <div class="d-flex flex-column ml-5 mt-3" id="legend">
      <!-- legend: rolling average -->
      <div class="d-flex">
        <svg width="15" height="15" class="mr-2">
          <line x1="0" x2="15" y1="8" y2="8" class="trace-legend"></line>
        </svg>
        <small class="text-muted">7 day rolling average of percent of {{ mutationName }}-positive sequences</small>
      </div>

      <!-- legend: confidence interval -->
      <div class="d-flex">
        <div class="ci-legend mr-2" :style="{background: CIColor}">

        </div>
        <small class="text-muted">95% confidence interval</small>
      </div>
    </div>

    <!-- SVGs -->
    <div class="d-flex flex-column align-items-start mt-2" id="report-prevalence-svg">
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
        <g id="weird-last values" :hidden="data.length < lengthThreshold">
          <text :x="width - margin.left" :y="0" fill="#929292" font-size="14px" dominant-baseline="hanging" text-anchor="end" :style="`font-family: ${fontFamily};`">Latest dates are noisy due to fewer samples</text>
          <path stroke="#BBBBBB" fill="none" :d="`M ${width - margin.left - 75} 20 c 10 10, 20 20, 50 20`" marker-end="url(#arrow)"></path>
        </g>
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
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  event,
  max,
  format,
  line,
  area,
  transition,
  timeDay
} from "d3";

import DownloadReportData from "@/components/DownloadReportData.vue";
import SequencingHistogram from "@/components/SequencingHistogram.vue";

export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    mutationName: String,
    location: String,
    setWidth: Number
  },
  components: {
    SequencingHistogram,
    DownloadReportData
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
        left: 85,
        right: 135
      },
      lengthThreshold: 5,
      CIColor: "#df4ab7",
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",
      // variables
      xVariable: "dateTime",
      yVariable: "proportion",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 6,
      // methods
      line: null,
      area: null,
      // refs
      chart: null
    }
  },
  watch: {
    width: function() {
      this.updatePlot();
    },
    data: function() {
      this.updatePlot();
    },
  },
  mounted() {
    if (!this.setWidth) {
      this.$nextTick(function() {
        window.addEventListener("resize", this.debounceSetDims);
      })
    }
    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  methods: {
    setDims() {
      const mx = 0.7;
      const my = 0.9;
      const hwRatio = 0.525;
      if (!this.setWidth) {
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
      } else {
        this.width = this.setWidth;
        this.height = hwRatio * this.width;
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

      // estimate
      this.line = line()
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.yVariable]));

      // confidence interval area method
      this.area = area()
        .x(d => this.x(d[this.xVariable]))
        .y0(d => this.y(d.proportion_ci_lower))
        .y1(d => this.y(d.proportion_ci_upper));
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.data.map(d => d[this.xVariable])));


      const avgMax = max(this.data, d => d[this.yVariable]);
      const CIMax = max(this.data, d => d.proportion_ci_upper);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, (avgMax + CIMax) * 0.5])
      // .domain([0, max(this.data, d => d[this.yVariable])])

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      const yTickFormat = this.y.domain()[1] < 0.02 ? ".1%" : ".0%";

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(yTickFormat));

      select(this.$refs.yAxis).call(this.yAxis);
    },
    tooltipOn() {
      const ttipShift = 20;

      // find closest date
      const selectedX = this.x.invert(event.offsetX - this.margin.left);
      const selectedDate = timeDay.round(selectedX);
      const selected = this.data.filter(d => Math.abs(d.dateTime - selectedDate) < 1e-12);

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

      if (this.data) {
        this.updateScales();


        const CISelector = this.chart
          .selectAll(".confidence-interval")
          .data([this.data]);

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

        const pathSelector = this.chart
          .selectAll(".prevalence-line")
          .data([this.data]);

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
#report-prevalence-svg {
    & .prevalence-axis,
    & .mutation-axis {
        font-size: 16pt !important;
        text {
            fill: $grey-90;
        }
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
