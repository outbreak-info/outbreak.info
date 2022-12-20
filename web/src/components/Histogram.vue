<template>
  <div class="d-flex flex-column">
    <h5 class="text-muted">{{ title }}</h5>

    <svg :width="width" :height="height" id="generic-histogram" name="title">
      <g ref="hist" :transform="`translate(${margin.left}, ${margin.top})`"></g>
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
import { max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';

export default Vue.extend({
  name: 'SequencingHistogram',
  props: {
    data: Array,
    median: Number,
    title: String,
    setWidth: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 400,
    },
    margin: {
      type: Object,
      default: () => {
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
    medianColor: {
      type: String,
      default: '#114068',
    },
  },
  data() {
    return {
      // dims
      width: 500,
      // height: 400,
      // margin: {
      //   top: 10,
      //   bottom: 30,
      //   left: 10,
      //   right: 10
      // },
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // refs
      chart: null,
    };
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

      this.chart = select(this.$refs.hist);
    },
    setDims() {
      if (this.setWidth) {
        this.width = this.setWidth;
      }
    },
    updateAxes() {
      const minVal = min(this.data, (d) => d.x0);
      const maxVal = max(this.data, (d) => d.x1);

      this.x = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([minVal, maxVal]);

      const maxCounts = max(this.data.map((d) => d.length));
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
      const xGap = 1;

      if (this.median) {
        const medianSelector = this.chart
          .selectAll('.median')
          .data([this.median]);

        medianSelector.join(
          (enter) => {
            const grp = enter.append('g').attr('class', 'median');

            grp
              .append('line')
              .attr('class', 'median-line')
              .attr('x1', (d) => this.x(d))
              .attr('x2', (d) => this.x(d))
              .attr('y1', 0)
              .attr('y2', this.height - this.margin.top - this.margin.bottom)
              .style('stroke', this.medianColor)
              .style('stroke-width', 1)
              .style('stroke-dasharray', '4,4');

            grp
              .append('text')
              .attr('class', 'median-annotation')
              .attr('x', (d) => this.x(d))
              .attr('dx', 10)
              .attr('y', this.margin.top)
              .attr('dy', 5)
              .text((d) => `median: ${d} days`)
              .style('fill', this.medianColor)
              .style('font-size', 18)
              .style(
                'font-family',
                "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
              );
          },
          (update) => {
            update
              .select('.median-line')
              .attr('y2', this.height - this.margin.top - this.margin.bottom)
              .transition(t1)
              .attr('x1', (d) => this.x(d))
              .attr('x2', (d) => this.x(d));

            update
              .select('.median-annotation')
              .attr('y', this.margin.top)
              .text((d) => `median: ${d} days`)
              .transition(t1)
              .attr('x', (d) => this.x(d));
          },
          (exit) =>
            exit.call((exit) =>
              exit.transition().duration(10).style('opacity', 1e-5).remove(),
            ),
        );
      }

      const histSelector = this.chart.selectAll('.hist').data(this.data);

      histSelector.join(
        (enter) => {
          enter
            .append('rect')
            .attr('class', 'hist')
            .attr('x', (d) => this.x(d.x0) - xGap)
            .attr('width', (d) => this.x(d.x1) - this.x(d.x0) - xGap * 2)
            .attr('y', (d) => this.y(d.length))
            .attr('height', (d) => this.y(0) - this.y(d.length))
            .style('fill', this.fillColor);
        },
        (update) => {
          update
            .transition(t1)
            .attr('x', (d) => this.x(d.x0) - xGap)
            .attr('width', (d) => this.x(d.x1) - this.x(d.x0) - xGap * 2)
            .attr('y', (d) => this.y(d.length))
            .attr('height', (d) => this.y(0) - this.y(d.length));
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );
    },
  },
});
</script>

<style lang="scss">
#generic-histogram {
  .axis--x text,
  .axis--y text {
    font-size: 16px;
    fill: $grey-90;
  }
}
</style>
