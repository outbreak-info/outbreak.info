<template>
  <div>
    <!-- LEGEND -->
    <div class="d-flex" v-if="!downward">
      <small class="text-uppercase" :style="{ color: notDetectedColor }">
        {{ title }}
      </small>
      <small
        class="text-uppercase ml-3"
        :style="{ color: detectedColor }"
        v-if="!onlyTotals"
      >
        <span v-if="showDetected">*</span>
        {{ mutationName }} detected
      </small>
    </div>

    <!-- SEQUENCING HISTOGRAM -->
    <svg
      :width="width"
      :height="height"
      :class="className"
      ref="svg-counts"
      :name="svgTitle"
    >
      <g
        ref="counts"
        :transform="`translate(${margin.left}, ${margin.top})`"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${height - margin.bottom + 1})`"
        class="prevalence-axis total-axis axis--x"
        ref="xAxis"
        :hidden="!includeXAxis"
      ></g>
      <g
        :transform="
          `translate(${margin.left - xBandwidth / 2 - 5}, ${margin.top})`
        "
        class="prevalence-axis total-axis axis--y"
        ref="yAxisLeft"
        :hidden="!data.length"
      ></g>
      <g
        :transform="
          `translate(${width - margin.right + xBandwidth / 2 + 5}, ${
            margin.top
          })`
        "
        class="prevalence-axis total-axis axis--y"
        ref="yAxisRight"
        :hidden="!data.length"
      ></g>
    </svg>

    <!-- LEGEND -->
    <div class="d-flex" v-if="downward">
      <small
        class="text-uppercase"
        :style="{
          'margin-left': this.margin.left + 'px',
          color: notDetectedColor,
        }"
        v-if="width > 250"
      >
        {{ title }}
      </small>
      <small class="text-uppercase" :style="{ color: notDetectedColor }" v-else>
        {{ title }}
      </small>
      <small
        class="text-uppercase ml-3"
        :style="{ color: detectedColor }"
        v-if="!onlyTotals"
      >
        <span v-if="showDetected">*</span>
        {{ mutationName }} detected
      </small>
    </div>

    <!-- TOOLTIPS -->
    <div
      ref="tooltip_prevalence"
      class="tooltip-basic box-shadow"
      id="tooltip-prevalence"
      v-if="onlyTotals"
    >
      <h5 id="date"></h5>
      <b id="sequencing-count" class="font-size-2"></b>
    </div>

    <div
      ref="tooltip_prevalence"
      class="tooltip-basic box-shadow"
      id="tooltip-prevalence"
      v-else
    >
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
import Vue from 'vue';

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
  transition,
  timeDay,
} from 'd3';

export default Vue.extend({
  name: 'SequencingHistogram',
  props: {
    data: Array,
    mutationName: String,
    svgTitle: String,
    title: {
      type: String,
      default: 'Total samples sequenced per day',
    },
    xInput: Function,
    className: {
      type: String,
      default: 'sequencing-histogram',
    },
    width: Number,
    height: {
      type: Number,
      default: 80,
    },
    margin: Object,
    notDetectedColor: {
      type: String,
      default: '#af88a5',
    },
    detectedColor: {
      type: String,
      default: '#980072',
    },
    downward: {
      type: Boolean,
      default: true,
    },
    includeXAxis: {
      type: Boolean,
      default: false,
    },
    onlyTotals: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",

      showDetected: null,
      detectedDisplayThresh: 50,
      // variables
      xVariable: 'dateTime',
      totalVariable: 'total_count',
      // axes
      x: null,
      y: scaleLinear(),
      maxCounts: null,
      xBandwidth: 1,
      xAxis: null,
      yAxisLeft: null,
      yAxisRight: null,
      numXTicks: 2,
      // refs
      counts: null,
    };
  },
  watch: {
    xInput() {
      this.updatePlot();
    },
    width: () => {
      this.updatePlot();
    },
    data: () => {
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
      if (!this.xInput) {
        this.x = scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain(extent(this.data.map((d) => d[this.xVariable])));
      } else {
        this.x = this.xInput;
      }

      this.maxCounts = max(this.data, (d) => d[this.totalVariable]);
      if (this.downward) {
        this.y = scaleLinear()
          .range([0, this.height - this.margin.top - this.margin.bottom])
          .domain([0, this.maxCounts]);
      } else {
        this.y = scaleLinear()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .domain([0, this.maxCounts]);
      }

      const numDays = timeDay.count(...this.x.domain());
      this.xBandwidth =
        (0.65 * (this.width - this.margin.left - this.margin.right)) / numDays;

      this.xAxis = axisBottom(this.x).ticks(this.numXTicks);
      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxisLeft = axisLeft(this.y)
        .tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      this.yAxisRight = axisRight(this.y)
        .tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      if (this.includeXAxis) {
        select(this.$refs.xAxis).call(this.xAxis);
      }

      select(this.$refs.yAxisLeft).call(this.yAxisLeft);
      select(this.$refs.yAxisRight).call(this.yAxisRight);
    },
    tooltipOn() {
      const ttipShift = 20;

      // find closest date
      const selectedX = this.x.invert(event.offsetX - this.margin.left);
      const selectedDate = timeDay.round(selectedX);
      const selected = this.data.filter(
        (d) => Math.abs(d[this.xVariable] - selectedDate) < 1e-12,
      );

      if (selected.length) {
        // tooltip on
        const ttip = select(this.$refs.tooltip_prevalence);

        // edit text
        ttip.select('h5').text(selected[0].date);

        if (this.onlyTotals) {
          ttip
            .select('#sequencing-count')
            .text(`Samples sequenced: ${format(',')(selected[0].total_count)}`);
        } else {
          ttip
            .select('#proportion')
            .text(format('.0%')(selected[0].proportion));
          ttip
            .select('#confidence-interval')
            .text(
              `(95% CI: ${format('.0%')(
                selected[0].proportion_ci_lower,
              )}-${format('.0%')(selected[0].proportion_ci_upper)})`,
            );
          ttip
            .select('#sequencing-count')
            .text(
              `Number of cases: ${format(',')(
                selected[0].lineage_count,
              )}/${format(',')(selected[0].total_count)}`,
            );
          ttip
            .select('#sequencing-count-rolling')
            .text(
              `Rolling average: ${format(',.1f')(
                selected[0].lineage_count_rolling,
              )}/${format(',.1f')(selected[0].total_count_rolling)}`,
            );
        }
        // fix location
        ttip
          .style('left', `${event.clientX + ttipShift}px`)
          .style('top', `${event.clientY + ttipShift}px`)
          .style('display', 'block');

        // histogram off/on
        selectAll('.raw-counts').style('opacity', 0.3);

        selectAll(`#date${selected[0].date}`).style('opacity', 1);
      }
    },
    tooltipOff() {
      select(this.$refs.tooltip_prevalence).style('display', 'none');

      selectAll('.raw-counts').style('opacity', 1);
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();

        let detected = this.data.filter((d) => d.lineage_count);
        this.showDetected = detected.length < this.detectedDisplayThresh;
        if (!this.showDetected) {
          detected = [];
        }
        const detectedSelector = this.counts
          .selectAll('.detected')
          .data(detected);

        detectedSelector.join(
          (enter) => {
            enter
              .append('text')
              .attr('class', 'detected')
              .attr('id', (d) => `date${d.date}`)
              .attr('x', (d) => this.x(d[this.xVariable]))
              .attr('y', (d) => this.y(d[this.totalVariable]))
              .attr('dy', 3)
              .style('dominant-baseline', 'hanging')
              .style('text-anchor', 'middle')
              .text('*')
              .style('fill', this.detectedColor);
          },
          (update) =>
            update
              .attr('class', 'detected')
              .attr('id', (d) => `date${d.date}`)
              .attr('x', (d) => this.x(d[this.xVariable]))
              .attr('y', (d) => this.y(d[this.totalVariable])),
          (exit) =>
            exit.call((exit) =>
              exit
                .transition()
                .style('opacity', 1e-5)
                .remove(),
            ),
        );

        const countSelector = this.counts
          .selectAll('.raw-counts')
          .data(this.data);
        countSelector.join(
          (enter) => {
            enter
              .append('line')
              .attr('class', 'raw-counts')
              .attr('id', (d) => `date${d.date}`)
              .attr('x1', (d) => this.x(d[this.xVariable]))
              .attr('x2', (d) => this.x(d[this.xVariable]))
              .attr('y1', (d) => this.y(0))
              .attr('y2', (d) => this.y(d[this.totalVariable]))
              .classed(
                'hidden',
                (d) =>
                  this.x(d[this.xVariable]) < 0 ||
                  this.x(d[this.xVariable]) >
                    this.width - this.margin.left - this.margin.right,
              )
              .style('stroke-width', this.xBandwidth)
              .style('stroke', (d) =>
                d.lineage_count ? this.detectedColor : this.notDetectedColor,
              );
          },
          (update) =>
            update
              .attr('id', (d) => `date${d.date}`)
              .attr('x1', (d) => this.x(d[this.xVariable]))
              .attr('x2', (d) => this.x(d[this.xVariable]))
              .attr('y1', (d) => this.y(0))
              .attr('y2', (d) => this.y(d[this.totalVariable]))
              .classed(
                'hidden',
                (d) =>
                  this.x(d[this.xVariable]) < 0 ||
                  this.x(d[this.xVariable]) >
                    this.width - this.margin.left - this.margin.right,
              )
              .style('stroke', (d) =>
                d.lineage_count ? this.detectedColor : this.notDetectedColor,
              )
              .style('stroke-width', this.xBandwidth),
          (exit) =>
            exit.call((exit) =>
              exit
                .transition()
                .style('opacity', 1e-5)
                .remove(),
            ),
        );

        // tooltip event listener
        this.counts
          .selectAll('.raw-counts')
          .on('mousemove', () => this.tooltipOn())
          .on('mouseleave', () => this.tooltipOff());
      }
    },
  },
});
</script>
