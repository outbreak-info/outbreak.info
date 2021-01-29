<template>
<div class="d-flex flex-column align-items-end">
  <!-- LEGEND -->
  <div class="d-flex flex-column" id="legend">
    <!-- legend: rolling average -->
    <div class="d-flex">
      <svg width="15" height="15" class="mr-2">
        <line x1="0" x2="15" y1="8" y2="8" class="trace-legend"></line>
      </svg>
      <small class="text-muted">7 day rolling average of percent of B.1.1.7-positive sequences</small>
    </div>

    <!-- legend: confidence interval -->
    <div class="d-flex">
      <div class="ci-legend mr-2" :style="{background: CIColor}">

      </div>
      <small class="text-muted">95% confidence interval</small>
    </div>
  </div>

  <!-- SVGs -->
  <div class="d-flex flex-column align-items-start">
    <!-- TIME TRACE -->
    <svg :width="width" :height="height" class="prevalence-curve" ref="svg" :name="title">
      <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xAxis"></g>
      <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yAxis"></g>
      <g ref="chart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
    </svg>

    <!-- SEQUENCING HISTOGRAM -->
    <svg :width="width" :height="heightCounts" class="prevalence-curve-counts" ref="svg-counts">
      <g ref="counts" :transform="`translate(${margin.left}, 0)`"></g>

    </svg>
    <small class="text-uppercase purple" :style="{'margin-left' : this.margin.left + 'px'}">Total sequenced per day</small>
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
        top: 15,
        bottom: 40,
        left: 50,
        right: 25
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
      xBandwith: 1,
      xAxis: null,
      yAxis: null,
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

      this.yCounts = scaleLinear()
        .range([0, this.heightCounts])
        .domain([0, max(this.data, d => d[this.totalVariable])]);

      this.xBandwidth = (0.65) * (this.width - this.margin.left - this.margin.right) / this.data.length;

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.yAxis).call(this.yAxis);
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
