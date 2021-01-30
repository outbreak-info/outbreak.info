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
      <g id="weird-last values">
        <text :x="width - margin.left" :y="0" fill="#929292" font-size="10 px" dominant-baseline="hanging" text-anchor="end">Latest dates are noisy due to fewer samples</text>
        <path stroke="#BBBBBB" fill="none" :d="`M ${width - margin.left - 75} 20 c 10 10, 20 20, 50 20`" marker-end="url(#arrow)"></path>
      </g>
    </svg>

    <!-- SEQUENCING HISTOGRAM -->
    <svg :width="width" :height="heightCounts" class="prevalence-curve-counts" ref="svg-counts">
      <g ref="counts" :transform="`translate(${margin.left}, ${margin.top})`"></g>
      <g :transform="`translate(${margin.left - 10}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisLeft"></g>
      <g :transform="`translate(${width - margin.right + 10}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisRight"></g>
    </svg>
    <small class="text-uppercase purple" :style="{'margin-left' : this.margin.left + 'px'}">Total samples sequenced per day</small>
  </div>
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
  transition
} from "d3";
export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    mutationName: String,
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 500
    }
  },
  computed: {
    title() {
      return ("Prevalence over time")
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

      // confidence interval
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
              .attr("x1", d => this.x(d[this.xVariable]))
              .attr("x2", d => this.x(d[this.xVariable]))
              .attr("y1", d => this.yCounts(0))
              .attr("y2", d => this.yCounts(d[this.totalVariable]))
              .style("stroke-width", this.xBandwidth)
              .style("stroke", "purple");
          },
          update =>
          update.attr("x1", d => this.x(d[this.xVariable]))
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
