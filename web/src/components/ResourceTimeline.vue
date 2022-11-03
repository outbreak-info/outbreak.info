<template>
  <div class="timeline-group d-flex flex-column text-left">
    <h6 class="m-0">Results by publication date</h6>
    <small class="text-accent text-right">7 day rolling average</small>
    <svg :width="width" :height="height" class="epi-sparkline" ref="timeline">
      <g
        :transform="`translate(${margin.left}, ${height - margin.bottom + 3})`"
        class="resource-timeline-axis axis--x"
        ref="xAxis"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="resource-timeline-axis axis--y"
        ref="yAxis"
      ></g>
    </svg>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import { select, selectAll, scaleLinear, scaleBand, scaleTime, axisBottom, axisLeft, timeFormat, timeDay, timeWeek, extent, sum, min, max, line } from "d3";

export default Vue.extend({
  name: "ResourceTimeline",
  components: {},
  props: {
    data: Array,
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 225
    }
  },
  methods: {
    prepData() {
      function movingAverage(date, values, firstDate, lastDate, N = 3) {
        const lowDate = Math.max(timeDay.offset(date, -1 * N), firstDate);
        const highDate = Math.min(timeDay.offset(date, N), lastDate);
        const filtered = values.filter(d => d.date <= highDate && d.date >= lowDate);
        const daySpan = Math.round((highDate - lowDate) / (24 * 3600 * 1000)) + 1;
        return (sum(filtered, d => d.count) / daySpan)
      }

      function weeklySum(date, values, N = 3) {
        const dateRange = timeDay.range(timeWeek.floor(date), timeWeek.ceil(date));
        const lowDate = dateRange[0];
        const highDate = dateRange[1];
        const filtered = values.filter(d => d.date <= highDate && d.date >= lowDate);
        return (sum(filtered, d => d.count))
      }

      const firstDate = min(this.data, d => d.date)
      const lastDate = max(this.data, d => d.date);

      this.data.forEach(d => {
        d["avg"] = movingAverage(d.date, this.data, firstDate, lastDate)
      })

      this.data.sort((a, b) => a.date - b.date);

      // Filter out ridiculous dates
      this.plotted = this.data.filter(d => d.date > new Date("2019-12-01"))
    },
    setupPlot() {
      this.svg = select(this.$refs.timeline);

      this.chart = this.svg.append("g").attr("class", "resource-timeline").attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

      // this.line = area()
      //   .x(d => this.x(d.date))
      //   .y0(d => this.y(0))
      //   .y1(d => this.y(d.avg));
      this.area = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d.avg));
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
        this.setupPlot();
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {
      const dateRange = extent(this.plotted, d => d.date);

      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.plotted, d => d.date));

      this.xBand = this.xBand
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(timeDay.range(dateRange[0], timeDay.offset(dateRange[1], 1)));

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, max(this.plotted, d => d.count)]);


      this.xAxis = axisBottom(this.x)
        .tickSizeOuter(0)
        .ticks(4)
        // .tickValues(
        //   this.x.domain().filter(function(d, i) {
        //     return !(i % 28);
        //   })
        // )
        .tickFormat(timeFormat("%d %b"));

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0)
        .tickSize(-(this.width - this.margin.left - this.margin.right))
        .ticks(6);

      select(this.$refs.xAxis).call(this.xAxis);
      select(this.$refs.yAxis).call(this.yAxis);
    },
    drawPlot() {
      const sparkSelector = this.chart
        .selectAll(".sparkline")
        .data([this.plotted]);

      const barSelector = this.chart.append("g")
        .attr("class", "timeline-count-group")
        .selectAll("rect")
        .data(this.plotted);

      barSelector.join(enter => {
        enter.append("rect")
          .attr("class", "resource-timeline-bar")
          .attr("x", d => this.xBand(d.date))
          .attr("y", d => this.y(d.count))
          .attr("width", this.xBand.bandwidth())
          .attr("height", d => this.y(0) - this.y(d.count))
      })

      const sparkEnter = sparkSelector
        .enter()
        .append("path")
        .attr("class", "sparkline");

      // merge
      sparkSelector
        .merge(sparkEnter)
        .datum(d => d)
        .join("path")
        .attr("d", this.area);
    }
  },
  mounted() {
    this.updatePlot();
  },
  data() {
    return {
      margin: {
        top: 10,
        right: 20,
        bottom: 25,
        left: 25
      },
      // data
      plotted: null,
      // axes
      y: scaleLinear(),
      x: scaleTime(),
      xBand: scaleBand(),
      xAxis: null,
      yAxis: null,
      // refs
      chart: null,
      // methods
      area: null
    }
  }
})
</script>
<style lang="scss">
.timeline-group .text-accent {
  color: $warning-color;
  margin-right: 20px;
}

.resource-timeline path {
  stroke: $warning-color;
  stroke-width: 2;
  fill: none;
}

.resource-timeline-bar {
  fill: $grey-45;
  stroke: none;
}

.resource-timeline-axis {
  font-size: 16px;
}
.resource-timeline-axis.axis--y {
  font-size: 13px;
}

.resource-timeline-axis.axis--y path {
  display: none;
}

.resource-timeline-axis.axis--y line {
  stroke: $grey-60;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}
</style>
