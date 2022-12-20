<template>
  <div class="d-flex flex-column">
    <h5 class="text-muted">{{ title }}</h5>
    <svg :width="width" :height="height" id="gap-over-time" :name="title">
      <g
        ref="chart"
        :transform="`translate(${margin.left}, ${margin.top})`"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${height - margin.bottom + 1})`"
        class="prevalence-axis total-axis axis--x"
        ref="xAxis"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="prevalence-axis total-axis axis--y"
        ref="yAxisLeft"
      ></g>
    </svg>
  </div>
</template>

<script>
import Vue from 'vue';
import { max, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line, area } from 'd3-shape';
import { transition } from 'd3-transition';

export default Vue.extend({
  name: 'SequencingHistogram',
  props: {
    data: Array,
    location: String,
    setWidth: {
      type: Number,
      default: 1000,
    },
    height: {
      type: Number,
      default: 400,
    },
    margin: {
      type: Object,
      default() {
        return {
          top: 10,
          bottom: 30,
          left: 50,
          right: 10,
        };
      },
    },
    fillColor: {
      type: String,
      default: '#9edae5',
    },
  },
  data() {
    return {
      // dims
      width: 1000,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // variables
      radius: 7,
      xVariable: 'maxDate',
      yVariable: 'median',
      // refs
      chart: null,
      // methods
      line: null,
      area: null,
    };
  },
  computed: {
    title() {
      return this.location
        ? `Weekly median difference between sample collection and sequence submission in days ${this.location}`
        : 'Weekly median difference between sample collection and sequence submission in days';
    },
  },
  watch: {
    data() {
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    updatePlot() {
      if (this.data) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    setupPlot() {
      this.$nextTick(() => {
        window.addEventListener('resize', this.setDims);

        // set initial dimensions for the plots.
        this.setDims();
      });

      this.chart = select(this.$refs.chart);

      // line method
      this.line = line()
        .x((d) => this.x(d[this.xVariable]))
        .y((d) => this.y(d[this.yVariable]));
      // area method

      this.area = area()
        .x((d) => this.x(d[this.xVariable]))
        .y0((d) => this.y(d.quartile25))
        .y1((d) => this.y(d.quartile75));
    },
    setDims() {
      if (this.setWidth) {
        this.width = this.setWidth;
      }
    },
    updateAxes() {
      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.data, (d) => d[this.xVariable]));

      const maxCounts = max(this.data.map((d) => d.quartile25));
      // const maxCounts = max(this.data.map(d => d[this.yVariable]));
      this.y = scaleLinear()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, maxCounts]);

      this.xAxis = axisBottom(this.x).ticks(this.numXTicks).tickSizeOuter(0);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).ticks(this.numYTicks).tickSizeOuter(0);
      select(this.$refs.yAxisLeft).call(this.yAxis);
    },
    drawPlot() {
      const t1 = transition().duration(1500);

      const areaSelector = this.chart
        .selectAll('.quartile-trace')
        .data([this.data]);

      areaSelector.join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'quartile-trace')
            .attr('d', this.area)
            .style('stroke', this.fillColor)
            .style('fill', this.fillColor)
            .style('fill-opacity', 0.15)
            .style('stroke-width', 1)
            .style('stroke-dasharray', '4,4');
        },
        (update) => {
          update.transition(t1).attr('d', this.area);
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition(10).style('opacity', 1e-5).remove(),
          ),
      );

      const lineSelector = this.chart
        .selectAll('.time-trace')
        .data([this.data]);

      lineSelector.join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'time-trace')
            .attr('d', this.line)
            .style('stroke', this.fillColor)
            .style('fill', 'none')
            .style('stroke-width', '2.5');
        },
        (update) => {
          update.transition(t1).attr('d', this.line);
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition(10).style('opacity', 1e-5).remove(),
          ),
      );
    },
  },
});
</script>

<style lang="scss">
#gap-over-time {
  .axis--x text,
  .axis--y text {
    font-size: 16px;
    fill: $grey-90;
  }
}
</style>
