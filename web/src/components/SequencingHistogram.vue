<template>
<div>
  <!-- SEQUENCING HISTOGRAM -->
  <svg :width="width" :height="heightCounts" :class="className" ref="svg-counts" :name="title">
    <g ref="counts" :transform="`translate(${margin.left}, ${margin.top})`"></g>
    <g :transform="`translate(${margin.left - xBandwidth/2 - 5}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisLeft" :hidden="!data.length"></g>
    <g :transform="`translate(${width - margin.right + xBandwidth/2 + 5}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisRight" :hidden="!data.length"></g>
  </svg>
  <div class="d-flex">
    <small class="text-uppercase lt-purple" :style="{'margin-left' : this.margin.left + 'px'}">Total samples sequenced per day</small>
    <small class="text-uppercase purple ml-3"><span v-if="showDetected">* </span>{{mutationName}} detected</small>
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
</div>
</template>

<script>
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

export default Vue.extend({
  name: "SequencingHistogram",
  props: {
    data: Array,
    mutationName: String,
    title: String,
    x: Function,
    className: {
      type: String,
      default: "sequencing-histogram"
    },
    width: Number,
    margin: Object
  },
  data() {
    return ({
      heightCounts: 80,
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",

      showDetected: null,
      detectedDisplayThresh: 50,
      // variables
      xVariable: "dateTime",
      totalVariable: "total_count",
      // axes
      yCounts: scaleLinear(),
      maxCounts: null,
      xBandwidth: 1,
      xAxis: null,
      yCountsAxisLeft: null,
      yCountsAxisRight: null,
      numXTicks: 5,
      // refs
      counts: null
    })
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
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {
      this.counts = select(this.$refs.counts);
    },
    updateScales() {
      if (!this.x) {
        this.x = this.x
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain(extent(this.data.map(d => d[this.xVariable])));
      }

      this.maxCounts = max(this.data, d => d[this.totalVariable]);
      this.yCounts = scaleLinear()
        .range([0, this.heightCounts - this.margin.top - this.margin.top])
        .domain([0, this.maxCounts]);

      const numDays = timeDay.count(...this.x.domain());
      this.xBandwidth = (0.65) * (this.width - this.margin.left - this.margin.right) / numDays;


      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yCountsAxisLeft = axisLeft(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      this.yCountsAxisRight = axisRight(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

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

        let detected = this.data.filter(d => d.lineage_count);
        this.showDetected = detected.length < this.detectedDisplayThresh;
        if (!this.showDetected) {
          detected = [];
        }
        const detectedSelector = this.counts
          .selectAll(".detected")
          .data(detected);

        detectedSelector.join(
          enter => {
            enter.append("text")
              .attr("class", "detected")
              .attr("id", d => `date${d.date}`)
              .attr("x", d => this.x(d[this.xVariable]))
              .attr("y", d => this.yCounts(d[this.totalVariable]))
              .attr("dy", 3)
              .style("dominant-baseline", "hanging")
              .style("text-anchor", "middle")
              .text("*")
              .style("fill", "#980072");
          },
          update =>
          update
          .attr("class", "detected")
          .attr("id", d => `date${d.date}`)
          .attr("x", d => this.x(d[this.xVariable]))
          .attr("y", d => this.yCounts(d[this.totalVariable])),
          exit =>
          exit.call(exit =>
            exit
            .transition(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )

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
              .style("stroke", d => d.lineage_count ? "#980072" : "#af88a5");
          },
          update =>
          update
          .attr("id", d => `date${d.date}`)
          .attr("x1", d => this.x(d[this.xVariable]))
          .attr("x2", d => this.x(d[this.xVariable]))
          .attr("y1", d => this.yCounts(0))
          .attr("y2", d => this.yCounts(d[this.totalVariable]))
          .style("stroke", d => d.lineage_count ? "#980072" : "#af88a5")
          .style("stroke-width", this.xBandwidth),
          exit =>
          exit.call(exit =>
            exit
            .transition(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )

// tooltip event listener
        this.counts.selectAll(".raw-counts")
          .on("mousemove", () => this.tooltipOn())
          .on("mouseleave", () => this.tooltipOff())
      }
    }
  }
})
</script>
