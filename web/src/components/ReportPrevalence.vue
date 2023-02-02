<template>
  <div
    id="report-prevalence"
    class="d-flex flex-column align-items-center w-100"
  >
    <!-- zoom btns -->
    <div
      class="d-flex justify-content-start"
      :style="{ width: width + 'px' }"
    >
      <button
        class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2 mr-2"
        @click="enableZoom"
      >
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
      </button>
      <button
        v-for="(beforeTime, lIdx) in timeOptions"
        :key="lIdx"
        class="btn btn-accent-outline timeline-btn m-0 px-2 py-1 mr-2"
        :class="{
          'time-btn-active': beforeTime.value === countMonth && !isZooming,
        }"
        @click="changeXScale(beforeTime.value)"
      >
        {{ beforeTime.label }}
      </button>
      <button
        class="btn btn-accent-outline timeline-btn text-highlight d-flex align-items-center m-0 px-2 py-1"
        :class="{ 'time-btn-active': countMonth === 0 && !isZooming }"
        @click="resetZoom"
      >
        all time
        <font-awesome-icon
          class="text-right ml-1"
          :icon="['fas', 'compress-arrows-alt']"
        />
      </button>
    </div>

    <div class="d-flex flex-column">
      <!-- LEGEND -->
      <div id="legend" class="d-flex flex-column mt-3">
        <!-- legend: rolling average -->
        <div class="d-flex">
          <svg width="15" height="15" class="mr-2">
            <line x1="0" x2="15" y1="8" y2="8" class="trace-legend" />
          </svg>
          <small class="text-muted">
            7 day rolling average of percent of {{ mutationName }}-positive
            sequences
          </small>
        </div>

        <!-- legend: confidence interval -->
        <div class="d-flex align-items-center mb-3">
          <div class="ci-legend mr-2" :style="{ background: CIColor }" />
          <small class="text-muted">95% confidence interval</small>
          <svg width="15" height="15" class="ml-4 mr-2">
            <rect
              x="0"
              y="0"
              :width="15"
              :height="15"
              fill="url(#diagonalHatchLight)"
            />
          </svg>
          <small class="text-muted">missing recent data</small>
        </div>
      </div>

      <!-- SVGs -->
      <div
        id="report-prevalence-svg"
        class="d-flex flex-column align-items-start mt-2"
      >
        <!-- TIME TRACE -->
        <svg
          ref="svg"
          :width="width"
          :height="height"
          class="prevalence-curve"
          :name="title"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="13"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
              stroke="#929292"
              fill="none"
            >
              <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
            </marker>

            <pattern
              id="diagonalHatchLight"
              width="7"
              height="7"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect x="-2" y="-2" width="10" height="10" fill="#efefef" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="25"
                :style="`stroke:#CCC; stroke-width:4`"
              />
            </pattern>
          </defs>

          <g
            ref="xAxis"
            :transform="`translate(${margin.left}, ${height - margin.bottom})`"
            class="prevalence-axis axis--x"
          />
          <g
            ref="yAxis"
            :transform="`translate(${margin.left}, ${margin.top})`"
            class="prevalence-axis axis--y"
          />
          <g
            ref="chart"
            :transform="`translate(${margin.left}, ${margin.top})`"
          />
          <g v-if="!data.length" id="no-data">
            <text
              font-size="24px"
              fill="#888888"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              No sequences found
            </text>
          </g>
          <g v-if="data.length < lengthThreshold && data.length" id="no-data">
            <text
              font-size="24px"
              fill="#888888"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              Two points may make a line, but it's not very informative.
            </text>
            <text
              font-size="24px"
              fill="#888888"
              transform="translate(0, 28)"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              {{ location }} only has {{ data.length }}
              {{ data.length === 1 ? 'date' : 'dates' }} with sequencing data
            </text>
          </g>
          <g id="weird-last values" :hidden="data.length < lengthThreshold">
            <text
              :x="width - margin.right"
              :y="-1"
              fill="#929292"
              font-size="13px"
              dominant-baseline="hanging"
              text-anchor="end"
              :style="`font-family: ${fontFamily};`"
            >
              Latest dates are noisy due to fewer samples, or missing from
              sequencing delays
            </text>
            <path
              stroke="#BBBBBB"
              fill="none"
              :d="`M ${width - margin.right - 75} 20 c 10 10, 20 20, 50 20`"
              marker-end="url(#arrow)"
            />
          </g>
          <g
            v-if="data"
            id="brush-zoom"
            ref="brush"
            class="brush"
            :transform="`translate(${margin.left},${margin.top})`"
            :class="{ hidden: !zoomAllowed }"
          />
        </svg>

        <SequencingHistogram
          :data="data"
          :xInput="x"
          :width="width"
          :svgTitle="title"
          :margin="margin"
          :mutationName="mutationName"
          className="prevalence-curve prevalence-curve-counts"
        />
      </div>
    </div>

    <!-- TOOLTIPS -->
    <div
      id="tooltip-prevalence"
      ref="tooltip_prevalence"
      class="tooltip-basic box-shadow"
    >
      <h5 id="date" />
      <div class="d-flex align-items-center">
        <b id="proportion" class="font-size-2" />
        <span id="confidence-interval" class="text-muted ml-2" />
      </div>

      <div id="sequencing-count" />
      <div id="sequencing-count-rolling" />
    </div>

    <DownloadReportData
      :data="data"
      figureRef="prevalence-curve"
      :isVertical="true"
      dataType="Mutation Report Prevalence over Time"
    />
  </div>
</template>

<script>
import { min, max, extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line, area } from 'd3-shape';
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear  } from 'd3-time';
import { timeFormat, timeParse } from 'd3-time-format';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';

import { lazyLoad } from '@/js/lazy-load';

export default {
  name: 'ReportPrevalence',
  components: {
    SequencingHistogram: lazyLoad('SequencingHistogram'),
    DownloadReportData: lazyLoad('DownloadReportData'),
  },
  props: {
    data: Array,
    mutationName: String,
    location: String,
    xmin: String,
    xmax: String,
    setWidth: Number,
    includeToday: {
      type: Boolean,
      default: true,
    },
    routeName: {
      type: String,
      default: 'MutationReport',
    },
  },
  data() {
    return {
      width: 400,
      height: 400,
      margin: {
        top: 10,
        bottom: 40,
        left: 85,
        right: 135,
      },
      lengthThreshold: 5,
      CIColor: '#df4ab7',
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",
      // data
      plottedData: null,
      // variables
      xVariable: 'dateTime',
      yVariable: 'proportion',
      // axes
      x: null,
      y: scaleLinear(),
      xAxis: null,
      maxDate: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 6,
      // methods
      line: null,
      area: null,
      brush: null,
      //zoom
      zoomAllowed: false,
      // refs
      brushRef: null,
      chart: null,
      month: 6,
      timeOptions: [
        { label: '3 months', value: 3 },
        { label: '6 months', value: 6 },
        { label: '1 year', value: 12 },
      ],
      isZooming: false,
    };
  },
  computed: {
    title() {
      return this.location === 'Worldwide'
        ? `${this.mutationName} prevalence over time worldwide`
        : `${this.mutationName} prevalence over time in ${this.location}`;
    },
    countTitle() {
      return `Total samples sequenced by collection date in ${this.location}`;
    },
    countMonth() {
      if (this.xmin && this.xmax) {
        return timeMonth.count(new Date(this.xmin), new Date(this.xmax));
      } else {
        return 0;
      }
    },
  },
  watch: {
    width() {
      this.setXScale();
      this.updateBrush();
      this.updatePlot();
    },
    setWidth() {
      this.setDims();
    },
    data() {
      this.xMin = timeParse('%Y-%m-%d')(this.xmin);
      this.xMax = timeParse('%Y-%m-%d')(this.xmax);
      this.setXScale();
      this.updatePlot();
    },
    xmin() {
      this.xMin = timeParse('%Y-%m-%d')(this.xmin);
      this.xMax = timeParse('%Y-%m-%d')(this.xmax);
      this.setXScale();
      this.updatePlot();
    },
    xmax() {
      this.xMin = timeParse('%Y-%m-%d')(this.xmin);
      this.xMax = timeParse('%Y-%m-%d')(this.xmax);
      this.setXScale();
      this.updatePlot();
    },
  },
  mounted() {
    if (!this.setWidth) {
      this.$nextTick(() => {
        window.addEventListener('resize', this.debounceSetDims);
      });
      this.updateBrush();
    }
    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
    if (!this.xmin && !this.xmax) {
      this.changeXScale(6);
    }
  },
  created() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
    this.debounceZoom = this.debounce(this.zoom, 150);
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
          this.width = this.height / hwRatio;
        }
      } else {
        this.width = this.setWidth;
        this.height = hwRatio * this.width;
      }

      if (this.width < 600) {
        this.numXTicks = 2;
        this.numYTicks = 4;
      } else if (this.width < 1000) {
        this.numXTicks = 4;
        this.numYTicks = 5;
      } else {
        this.numXTicks = 6;
        this.numYTicks = 5;
      }
    },
    setupPlot() {
      // read in the limits from the route params
      this.xMin = timeParse('%Y-%m-%d')(this.xmin);
      this.xMax = timeParse('%Y-%m-%d')(this.xmax);

      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.chart);
      this.brushRef = select(this.$refs.brush);

      // estimate
      this.line = line()
        .x((d) => this.x(d[this.xVariable]))
        .y((d) => this.y(d[this.yVariable]));

      // confidence interval area method
      this.area = area()
        .x((d) => this.x(d[this.xVariable]))
        .y0((d) => this.y(d.proportion_ci_lower))
        .y1((d) => this.y(d.proportion_ci_upper));

      this.setXScale();
    },
    changeXScale(month) {
      this.isZooming = false;
      this.month = month;
      this.isZooming = false;
      const newMax = new Date();
      const newMin = timeMonth.offset(newMax, -month);

      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([newMin, newMax]);

      this.plottedData = cloneDeep(this.data);

      this.plottedData = this.plottedData.filter(
        (d) => d[this.xVariable] >= newMin && d[this.xVariable] <= newMax,
      );

      // reset the axis
      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickFormat(function(date){
          return (timeSecond(date) < date ? timeFormat('.%L')
            : timeMinute(date) < date ? timeFormat(':%S')
            : timeHour(date) < date ? timeFormat('%I:%M')
            : timeDay(date) < date ? timeFormat('%I %p')
            : timeMonth(date) < date ? timeWeek(date) < date ? timeFormat('%a %d') : timeFormat('%b %d')
            : timeYear(date) < date ? timeFormat('%b')
            : timeFormat('%Y'))(date)
        });

      select(this.$refs.xAxis).call(this.xAxis);

      // move the brush
      // this.brushRef.call(this.brush.move, null);
      this.zoomAllowed = false;
      this.updatePlot();

      // update the url
      this.updateUrl(newMin, newMax);
    },
    setXScale() {
      let xDomain;

      if (this.xMin && this.xMax && this.xMin < this.xMax) {
        xDomain = [this.xMin, this.xMax];
        this.maxDate = max(this.data, (d) => d[this.xVariable]);
      } else {
        if (this.includeToday) {
          const today = new Date();
          this.maxDate = max(this.data, (d) => d[this.xVariable]);
          xDomain = [min(this.data, (d) => d[this.xVariable]), today];
        } else {
          xDomain = extent(this.data.map((d) => d[this.xVariable]));
        }

        if (this.xMin && this.xMin < xDomain[1]) {
          xDomain[0] = this.xMin;
        }

        if (this.xMax && this.xMax > xDomain[0]) {
          xDomain[1] = this.xMax;
        }
      }

      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(xDomain);

      this.plottedData = cloneDeep(this.data);

      this.plottedData = this.plottedData.filter(
        (d) =>
          d[this.xVariable] >= xDomain[0] && d[this.xVariable] <= xDomain[1],
      );
    },
    updateScales() {
      const avgMax = max(this.plottedData, (d) => d[this.yVariable]);
      const CIMax = max(this.plottedData, (d) => d.proportion_ci_upper);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, (avgMax + CIMax) * 0.5]);
      // .domain([0, max(this.data, d => d[this.yVariable])])

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickFormat(function(date){
          return (timeSecond(date) < date ? timeFormat('.%L')
            : timeMinute(date) < date ? timeFormat(':%S')
            : timeHour(date) < date ? timeFormat('%I:%M')
            : timeDay(date) < date ? timeFormat('%I %p')
            : timeMonth(date) < date ? timeWeek(date) < date ? timeFormat('%a %d') : timeFormat('%b %d')
            : timeYear(date) < date ? timeFormat('%b')
            : timeFormat('%Y'))(date)
        });

      select(this.$refs.xAxis).call(this.xAxis);

      const yTickFormat = this.y.domain()[1] < 0.02 ? '.1%' : '.0%';

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(yTickFormat));

      select(this.$refs.yAxis).call(this.yAxis);
    },
    tooltipOn() {
      const ttipShift = 20;

      // find the closest date
      const selectedX = this.x.invert(event.offsetX - this.margin.left);
      const selectedDate = timeDay.round(selectedX);
      const selected = this.plottedData.filter(
        (d) => Math.abs(d.dateTime - selectedDate) < 1e-12,
      );

      if (selected.length) {
        // tooltip on
        const ttip = select(this.$refs.tooltip_prevalence);

        // edit text
        ttip.select('h5').text(selected[0].date);

        ttip.select('#proportion').text(format('.0%')(selected[0].proportion));
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
      const t1 = transition().duration(2500);

      if (this.plottedData) {
        this.updateScales();

        // hash to highlight the gap between today
        if (this.includeToday) {
          const noDataSelector = this.chart.selectAll('.no-data').data([0]);
          noDataSelector.join(
            (enter) => {
              enter
                .append('rect')
                .attr('class', 'no-data')
                .attr('x', this.x(this.maxDate))
                .attr(
                  'width',
                  this.width
                    ? this.width -
                        this.margin.left -
                        this.margin.right -
                        this.x(this.maxDate)
                    : 0,
                )
                .attr(
                  'height',
                  this.height - this.margin.top - this.margin.bottom,
                )
                .style('fill', 'url(#diagonalHatchLight)');
            },
            (update) => {
              update
                .attr(
                  'height',
                  this.height - this.margin.top - this.margin.bottom,
                )
                .style('fill', 'url(#diagonalHatchLight)')
                .transition(100)
                .attr('x', this.x(this.maxDate))
                .attr(
                  'width',
                  this.width
                    ? this.width -
                        this.margin.left -
                        this.margin.right -
                        this.x(this.maxDate)
                    : 0,
                );
            },
            (exit) =>
              exit.call((exit) =>
                exit.transition().style('opacity', 1e-5).remove(),
              ),
          );
        }

        const CISelector = this.chart
          .selectAll('.confidence-interval')
          .data([this.plottedData]);

        CISelector.join(
          (enter) => {
            enter
              .append('path')
              .attr('class', 'confidence-interval')
              .style('fill', this.CIColor)
              .style('fill-opacity', 0.3)
              .attr('d', this.area);
          },
          (update) =>
            update
              // .transition(t1)
              .attr('d', this.area),
          (exit) =>
            exit.call((exit) =>
              exit.transition().style('opacity', 1e-5).remove(),
            ),
        );

        const pathSelector = this.chart
          .selectAll('.prevalence-line')
          .data([this.plottedData]);

        pathSelector.join(
          (enter) => {
            enter
              .append('path')
              .attr('class', 'prevalence-line')
              .style('stroke', '#2c3e50')
              .style('fill', 'none')
              .style('stroke-width', '2.5')
              .datum((d) => d)
              .attr('d', this.line);
          },
          // update
          (update) =>
            update
              .datum((d) => d)
              // .transition(t1)
              .attr('d', this.line),

          // exit
          (exit) =>
            exit.call((exit) =>
              exit.transition().style('opacity', 1e-5).remove(),
            ),
        );

        // event listener for tooltips
        this.chart
          .selectAll('.confidence-interval')
          .on('mousemove', () => this.tooltipOn())
          .on('mouseleave', () => this.tooltipOff());
      }
    },
    updateBrush() {
      // Update brush so it spans the whole of the area
      this.brush = brushX()
        .extent([
          [0, 0],
          [
            this.width - this.margin.left - this.margin.right,
            this.height - this.margin.top - this.margin.bottom,
          ],
        ])
        .on('end', () => this.debounceZoom(event));

      this.brushRef.call(this.brush).on('dblclick', this.resetZoom);
    },
    zoom(evt, ref) {
      this.isZooming = true;
      // reset domain to new coords
      const selection = this.event.selection;

      if (selection) {
        const newMin = this.x.invert(selection[0]);
        const newMax = this.x.invert(selection[1]);

        this.x = scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain([newMin, newMax]);

        // update plotted data
        this.plottedData = cloneDeep(this.data);
        this.plottedData = this.plottedData.filter(
          (d) => d[this.xVariable] >= newMin && d[this.xVariable] <= newMax,
        );

        // move the brush
        this.brushRef.call(this.brush.move, null);
        this.zoomAllowed = false;
        this.updatePlot();

        // update route
        this.updateUrl(newMin, newMax);
      }
    },
    updateUrl(newMin, newMax) {
      const queryParams = this.$route.query;

      if (this.routeName === 'MutationReport') {
        const params = this.$route.params;
        this.$router.push({
          name: this.routeName,
          params: {
            disableScroll: true,
            alias: params.alias,
          },
          query: {
            xmin: timeFormat('%Y-%m-%d')(newMin),
            xmax: timeFormat('%Y-%m-%d')(newMax),
            loc: queryParams.loc,
            muts: queryParams.muts,
            pango: queryParams.pango,
            selected: queryParams.selected,
          },
        });
      } else if (this.routeName === 'GenomicsEmbedVariant') {
        const params = this.$route.params;
        this.$router.push({
          name: 'GenomicsEmbed',
          params: {
            disableScroll: true,
          },
          query: {
            type: 'var',
            alias: queryParams.alias,
            xmin: timeFormat('%Y-%m-%d')(newMin),
            xmax: timeFormat('%Y-%m-%d')(newMax),
            loc: queryParams.loc,
            muts: queryParams.muts,
            pango: queryParams.pango,
            selected: queryParams.selected,
          },
        });
      }
    },
    resetZoom() {
      this.brushRef.call(this.brush.move, null);
      const queryParams = this.$route.query;
      const params = this.$route.params;

      this.xMin = null;
      this.xMax = null;
      this.isZooming = false;
      this.month = 0;
      this.isZooming = false;
      this.setXScale();

      if (this.routeName === 'MutationReport') {
        this.$router.push({
          name: this.routeName,
          params: {
            disableScroll: true,
            alias: params.alias,
          },
          query: {
            loc: queryParams.loc,
            muts: queryParams.muts,
            pango: queryParams.pango,
            selected: queryParams.selected,
          },
        });
      } else if (this.routeName === 'GenomicsEmbedVariant') {
        this.$router.push({
          name: 'GenomicsEmbed',
          params: {
            disableScroll: true,
          },
          query: {
            type: 'var',
            alias: queryParams.alias,
            loc: queryParams.loc,
            muts: queryParams.muts,
            pango: queryParams.pango,
            selected: queryParams.selected,
          },
        });
      }

      this.updatePlot();
    },
    enableZoom() {
      this.zoomAllowed = true;
    },
    debounce(fn, delay) {
      let timer = null;
      return () => {
        const context = this,
          args = arguments,
          evt = event;
        //we get the D3 event here
        clearTimeout(timer);
        timer = setTimeout(() => {
          context.event = evt;
          //and use the reference here
          fn.apply(context, args);
        }, delay);
      };
    },
  },
};
</script>

<style lang="scss">
#report-prevalence-svg {
  & .mutation-axis,
  & .prevalence-axis {
    font-size: 16px;
    @media (max-width: 664px) {
      font-size: 12px;
    }
    @media (min-width: 664px) {
      font-size: 12px;
    }
    @media (min-width: 900px) {
      font-size: 14px;
    }
    @media (min-width: 1000px) {
      font-size: 14px;
    }
    @media (min-width: 1200px) {
      font-size: 16px;
    }
    @media (min-width: 1310px) {
      font-size: 16px;
    }
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

.no-data-legend {
  width: 15px;
  height: 15px;
  opacity: 0.3;
}

.trace-legend {
  stroke: $base-grey;
  stroke-width: 2.5;
}
</style>
