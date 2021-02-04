<template>
<div class="d-flex flex-column align-items-start">
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
        <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">No samples found</text>
      </g>
      <g id="weird-last values" :hidden="!data.length">
        <text :x="width - margin.left" :y="0" fill="#929292" font-size="10 px" dominant-baseline="hanging" text-anchor="end" font-family="'DM Sans', Avenir, Helvetica, Arial, sans-serif;">Latest dates are noisy due to fewer samples</text>
        <path stroke="#BBBBBB" fill="none" :d="`M ${width - margin.left - 75} 20 c 10 10, 20 20, 50 20`" marker-end="url(#arrow)"></path>
      </g>
    </svg>

    <!-- SEQUENCING HISTOGRAM -->
    <svg :width="width" :height="heightCounts" class="prevalence-curve prevalence-curve-counts" ref="svg-counts" :name="countTitle">
      <g ref="counts" :transform="`translate(${margin.left}, ${margin.top})`"></g>
      <g :transform="`translate(${margin.left - 10}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisLeft" :hidden="!data.length"></g>
      <g :transform="`translate(${width - margin.right + 10}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisRight" :hidden="!data.length"></g>
    </svg>
    <small class="text-uppercase purple" :style="{'margin-left' : this.margin.left + 'px'}">Total samples sequenced per day</small>
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

  <DownloadReportData :data="data" figureRef="prevalence-curve" :isVertical="true" />

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
  max,
  format,
  line,
  area,
  transition,
  timeDay
} from "d3";

import DownloadReportData from "@/components/DownloadReportData.vue";

export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    mutationName: String,
    location: String,
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 500
    }
  },
  components: {
    DownloadReportData
  },
  computed: {
    title() {
      return (`${this.mutationName} prevalence over time in ${this.location}`)
    },
    countTitle() {
      return (`Total samples sequenced by collection date in ${this.location}`)
    }
  },
  data() {
    return {
      margin: {
        top: 10,
        bottom: 40,
        left: 55,
        right: 55
      },
      heightCounts: 80,
      CIColor: "#df4ab7",
      // variables
      xVariable: "dateTime",
      yVariable: "proportion",
      totalVariable: "total_count",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      yCounts: scaleLinear(),
      maxCounts: null,
      xBandwith: 1,
      xAxis: null,
      yAxis: null,
      yCountsAxisLeft: null,
      yCountsAxisRight: null,
      numXTicks: 5,
      numYTicks: 6,
      // methods
      line: null,
      area: null,
      // refs
      chart: null,
      counts: null
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.chart);
      this.counts = select(this.$refs.counts);

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

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, max(this.data, d => d.proportion_ci_upper)])

      this.maxCounts = max(this.data, d => d[this.totalVariable]);
      this.yCounts = scaleLinear()
        .range([0, this.heightCounts - this.margin.top - this.margin.top])
        .domain([0, this.maxCounts]);

      this.xBandwidth = (0.65) * (this.width - this.margin.left - this.margin.right) / this.data.length;

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      this.yCountsAxisLeft = axisLeft(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      this.yCountsAxisRight = axisRight(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.yCountsAxisLeft).call(this.yCountsAxisLeft);
      select(this.$refs.yCountsAxisRight).call(this.yCountsAxisRight);
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
        ttip.select("#sequencing-count-rolling").text(`1 week average: ${format(",.1f")(selected[0].lineage_count_rolling)}/${format(",.1f")(selected[0].total_count_rolling)}`)

        // fix location
        ttip
          .style("left", `${event.pageX + ttipShift}px`)
          .style("top", `${event.pageY + ttipShift}px`)
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

        const countSelector = this.counts
          .selectAll(".raw-counts")
          .data(this.data);

        countSelector.join(
          enter => {
            enter.append("line")
              .attr("class", "raw-counts")
              .attr("id", d => `date${d.date}`)
              .attr("x1", d => this.x(d[this.xVariable]))
              .attr("x2", d => this.x(d[this.xVariable]))
              .attr("y1", d => this.yCounts(0))
              .attr("y2", d => this.yCounts(d[this.totalVariable]))
              .style("stroke-width", this.xBandwidth)
              .style("stroke", "purple");
          },
          update =>
          update
          .attr("id", d => `date${d.date}`)
          .attr("x1", d => this.x(d[this.xVariable]))
          .attr("x2", d => this.x(d[this.xVariable]))
          .attr("y1", d => this.yCounts(0))
          .attr("y2", d => this.yCounts(d[this.totalVariable]))
          .style("stroke-width", this.xBandwidth),
          exit =>
          exit.call(exit =>
            exit
            .transition(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )

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
        this.counts.selectAll(".raw-counts")
          .on("mousemove", () => this.tooltipOn())
          .on("mouseleave", () => this.tooltipOff())
      }
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

.purple {
    color: purple;
}
</style>
