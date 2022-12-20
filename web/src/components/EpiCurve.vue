<template>
  <div
    class="col-sm-12 epidemiology-curves flex-column align-items-center"
    style="margin-bottom: 45px"
  >
    <!-- zoom btns -->
    <div
      class="d-flex justify-content-end px-3"
      :style="{ width: width + 'px' }"
    >
      <button
        class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2"
        @click="enableZoom"
      >
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
      </button>
      <button
        class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2"
        @click="resetZoom"
      >
        <font-awesome-icon
          class="text-right"
          :icon="['fas', 'compress-arrows-alt']"
        />
      </button>
    </div>

    <svg
      ref="svg"
      :width="width"
      :height="height - 45"
      class="epi-curve"
      :name="title"
    >
      <g
        class="tooltip-cover"
        :transform="`translate(${margin.left}, ${margin.top})`"
      >
        <line class="mouse-line" />
        <rect id="tooltip-cover-rect" />
      </g>

      <defs>
        <marker
          id="arrow"
          markerWidth="13"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>
      <g
        ref="xAxis"
        :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`"
        class="epi-axis axis--x"
      />
      <g
        ref="yAxis"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="epi-axis axis--y"
      />
      <g
        id="epi-curve"
        ref="epi_curve"
        :transform="`translate(${margin.left},${margin.top})`"
      />
      <g
        v-if="data"
        id="brush-zoom"
        ref="brush"
        class="brush"
        :transform="`translate(${margin.left},${margin.top})`"
        :class="{ hidden: !zoomAllowed }"
      />
    </svg>

    <svg
      ref="svg_arrows"
      :width="width"
      :height="height"
      class="swoopy-arrow-group position-absolute"
    >
      <g
        v-if="loggable"
        ref="switchY"
        class="switch-y-button-group"
        transform="translate(5,0)"
      >
        <path id="switch-y-btn-swoopy-arrow" class="swoopy-arrow" />
        <rect id="switch-y-btn-rect" class="switch-button-rect" />
        <text id="switch-y-btn-text" class="switch-button" />
      </g>
    </svg>
    <div class="tooltip p-2">
      <p class="date m-0" />
      <div v-for="line1 in plottedData" :key="line1.key" :class="line1.key">
        <h6 class="country-name m-0" />
        <b class="count-avg m-0" />
      </div>
    </div>

    <div v-if="plottedData && plottedData.length" class="mt-4">
      <router-link
        v-for="_line in plottedData"
        :key="_line.key"
        class="btn btn-main mr-2"
        :to="{
          name: 'LocationReports',
          query: { loc: _line.value[0].location_id },
        }"
      >
        View {{ _line.value[0].name }} Variant Report
      </router-link>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { max, extent, bisector } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { forceSimulation, forceCollide, forceY } from 'd3-force';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeParse, timeFormat } from 'd3-time-format';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';

import store from '@/store';

const width = 500;
const height = 300;
const radius = 3.5;
const margin = {
  top: 15,
  right: 225,
  bottom: 75,
  left: 125,
};
const transitionDuration = 1500;

export default Vue.extend({
  name: 'EpiCurve',
  components: {},
  props: {
    data: Array,
    location: String,
    xmin: String,
    xmax: String,
    variableObj: Object,
    log: Boolean,
    percapita: Boolean,
    loggable: Boolean,
    percent: Boolean,
  },
  data() {
    return {
      width,
      height,
      margin,
      radius,
      transitionDuration,
      backgroundColor: '#f8f9fa',

      // data
      dataSubscription: null,
      plottedData: null,

      // button interfaces
      zoomAllowed: false,
      xVariable: 'date',
      // axes
      numXTicks: 6,
      numYTicks: 6,
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      switchBtn: null,
      brushRef: null,
      // methods
      line: null,
      brush: null,
    };
  },
  computed: {
    dataUpdated() {
      // Combo property to check if the data has changed, or the normalization has.
      // TODO: in Vue 3, this can be streamlined as a dual watcher
      return (
        JSON.stringify(this.data) +
        this.selectedVariable +
        String(this.percapita)
      );
    },
    selectedVariable() {
      if (this.percapita) {
        return this.variableObj.percapita === false
          ? this.variableObj.value
          : this.variableObj.value + '_per_100k';
      }
      return this.variableObj.value;
    },
    title() {
      if (this.data.length === 1) {
        return this.percapita && this.variableObj.percapita !== false
          ? `Number of COVID-19 ${this.variableObj.label} in ${this.data[0].value[0].name} per 100,000 residents`
          : `Number of COVID-19 ${this.variableObj.label} in ${this.data[0].value[0].name}`;
      } else {
        return this.percapita && this.variableObj.percapita !== false
          ? `Number of COVID-19 ${this.variableObj.label} per 100,000 residents`
          : `Number of COVID-19 ${this.variableObj.label}`;
      }
    },
  },
  watch: {
    dataUpdated() {
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
    variable() {
      this.setXScale();
      this.updatePlot();
    },
    width() {
      this.setXScale();
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updateBrush();
    this.updatePlot();
  },
  created() {
    this.debounceZoom = this.debounce(this.zoom, 150);
  },
  destroyed() {
    window.removeEventListener('resize', this.setPlotDims);
  },
  methods: {
    setPlotDims() {
      // let idealWidth = 750;
      const padding = 0.85;
      let idealWidth = document.getElementById('curveContainer')
        ? document.getElementById('curveContainer').offsetWidth
        : 750;

      const whRatio = 5 / 3;
      const framePadding = 32; // left / right padding on the div of 16px ea.
      const newWidth =
        window.innerWidth < idealWidth
          ? window.innerWidth * padding - framePadding
          : idealWidth * padding - framePadding;
      const newHeight = newWidth / whRatio;
      // check height within limits
      if (newHeight > window.innerHeight * padding) {
        this.width = window.innerHeight * whRatio * padding;
        this.height = window.innerHeight * padding;
      } else {
        this.width = newWidth;
        this.height = newHeight;
      }

      this.margin.right = this.width < 600 ? 115 : 205;

      this.numXTicks = this.width < 750 ? 2 : 6;
      this.numYTicks = this.height < 250 ? 2 : 6;
    },
    colorScale(location) {
      const scale = store.getters['colors/getColor'];
      return scale(location);
    },
    lightColorScale(location) {
      const scale = store.getters['colors/getColor'];
      return scale(location, 0.7);
    },

    changeYScale() {
      this.isLogY = !this.isLogY;
      this.changeScale();
    },
    changeScale() {
      this.$router.replace({
        path: 'epidemiology',
        name: 'Epidemiology',
        params: {
          disableScroll: true,
        },
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.selectedVariable.replace('_per_100k', ''),
          xmin: this.xmin,
          xmax: this.xmax,
          percapita: String(this.percapita),
        },
      });

      this.updatePlot();
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
      selectAll('.tooltip').style('opacity', 0);
      selectAll('.mouse-line').style('opacity', 0);
      // reset domain to new coords
      const selection = this.event.selection;

      if (selection) {
        const newMin = this.x.invert(selection[0]);
        const newMax = this.x.invert(selection[1]);

        this.x = scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain([newMin, newMax]);

        // update plotted data
        this.prepData();

        // move the brush
        this.brushRef.call(this.brush.move, null);
        this.zoomAllowed = false;
        this.updatePlot();

        // update route
        const queryParams = this.$route.query;

        this.$router.push({
          name: 'Epidemiology',
          params: {
            disableScroll: true,
          },
          query: {
            xmin: timeFormat('%Y-%m-%d')(newMin),
            xmax: timeFormat('%Y-%m-%d')(newMax),
            location: queryParams.location,
            variable: queryParams.variable,
            log: queryParams.log,
            fixedY: queryParams.fixedY,
            percapita: queryParams.percapita,
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
      this.setXScale();

      this.$router.push({
        name: 'Epidemiology',
        params: {
          disableScroll: true,
        },
        query: {
          location: queryParams.location,
          variable: queryParams.variable,
          log: queryParams.log,
          fixedY: queryParams.fixedY,
          percapita: queryParams.percapita,
        },
      });

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
    tooltipOn(d, location_id) {
      select(`#tooltip-${d._id}`).attr('display', 'block');
      select(`#${d._id}`).attr('r', this.radius * 2);

      selectAll(`#${d[location_id]}`).select('text').style('font-weight', 700);

      selectAll(`.epi-region`).style('opacity', 0.35);
      selectAll(`.epi-line`).style('opacity', 0.35);

      selectAll(`.${d[location_id]}`).style('opacity', 1);
      selectAll(`#${d[location_id]}`).style('opacity', 1);
    },
    tooltipOff(d) {
      selectAll('.tooltip--epi-curve').attr('display', 'none');

      selectAll('circle').attr('r', this.radius);

      selectAll('.annotation--region-name').style('font-weight', 400);

      selectAll(`.epi-region`).style('opacity', 1);
      selectAll(`.epi-line`).style('opacity', 1);
    },

    mouseOn() {
      const ttip = selectAll('.tooltip')
        .style('pointer-events', 'none')
        .style('top', event.y + 'px')
        .style('left', event.x + 'px')
        .style('opacity', 1);

      let date = this.x.invert(
        event.pageX -
          document.getElementById('tooltip-cover-rect').getBoundingClientRect()
            .x,
      );

      this.plottedData.forEach((line, ind) => {
        const bisect = bisector((d) => d.date);
        let i = bisect.left(line.value, date, 1);
        const a = line.value[i - 1];
        const b = line.value[i];
        let dat = date - a.date > b.date - date ? b : a;

        ttip
          .select(`.${dat.location_id}`)
          .select(`.country-name`)
          .text(dat.name);
        if (ind === 0) {
          ttip.select(`.date`).text(`${timeFormat('%d %b %Y')(dat.date)}`);
          const mouseLine = selectAll('.mouse-line')
            .attr('x1', this.x(dat.date))
            .attr('x2', this.x(dat.date))
            .style('opacity', 1);
        }
        ttip
          .select(`.${dat.location_id}`)
          .select(`.count-avg`)
          .text(`${format(',.1f')(dat[this.selectedVariable])}`);
      });
    },
    mouseOff() {
      selectAll('.tooltip').style('opacity', 0);
      selectAll('.mouse-line').style('opacity', 0);
    },

    updatePlot() {
      if (this.data && this.chart) {
        // create slice, so you create a copy, and sorting doesn't lead to an infinite update callback loop
        this.updateScales();
        this.drawPlot();
      }
    },
    prepData() {
      this.loggable = this.selectedVariable !== 'testing_positivity';
      this.isLogY = this.loggable && this.log;

      if (this.data) {
        this.plottedData = cloneDeep(this.data);

        this.plottedData.forEach((d) => {
          d['value'] =
            this.isLogY && this.loggable
              ? d.value.filter(
                  (x) =>
                    x[this.selectedVariable] >= 1 &&
                    x[this.xVariable] >= this.x.domain()[0] &&
                    x[this.xVariable] <= this.x.domain()[1] &&
                    (x[this.xVariable] || x[this.xVariable] === 0),
                )
              : d.value.filter(
                  (x) =>
                    x[this.selectedVariable] &&
                    x[this.xVariable] >= this.x.domain()[0] &&
                    x[this.xVariable] <= this.x.domain()[1] &&
                    (x[this.xVariable] || x[this.xVariable] === 0),
                );

          // ensure dates are sorted
          d.value.sort((a, b) => a[this.xVariable] - b[this.xVariable]);
        });
      }
    },
    setupPlot() {
      // Event listener for mobile responsiveness
      // $nextTick waits till DOM rendered
      this.$nextTick(() => {
        window.addEventListener('resize', this.setPlotDims);
        // set initial dimensions for the stacked area plots.
        this.setPlotDims();
      });

      this.setPlotDims();

      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.epi_curve);

      this.line = line()
        .x((d) => this.x(d[this.xVariable]))
        .y((d) => this.y(d[this.selectedVariable]));

      this.brushRef = select(this.$refs.brush);
      this.setXScale();
    },
    setXScale() {
      let xDomain;

      if (this.xMin && this.xMax && this.xMin < this.xMax) {
        xDomain = [this.xMin, this.xMax];
      } else {
        xDomain = extent(
          this.data.flatMap((d) => d.value).map((d) => d[this.xVariable]),
        );

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

      this.prepData();
    },
    updateScales() {
      if (this.isLogY && this.loggable) {
        this.y = scaleLog()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .nice()
          .domain([
            1,
            max(
              this.plottedData
                .flatMap((d) => d.value)
                .map((d) => d[this.selectedVariable]),
            ),
          ]);
      } else {
        this.y = scaleLinear()
          .range([this.height - this.margin.top - this.margin.bottom, 0])
          .domain([
            0,
            max(
              this.plottedData
                .flatMap((d) => d.value)
                .map((d) => d[this.selectedVariable]),
            ),
          ]);
      }

      this.xAxis = axisBottom(this.x).ticks(this.numXTicks);

      select(this.$refs.xAxis).call(this.xAxis);

      if (this.isLogY && this.loggable) {
        this.yAxis = axisLeft(this.y)
          .tickSizeOuter(0)
          .ticks(this.numYTicks)
          .tickFormat((d, i) => {
            const log = Math.log10(d);
            return Math.abs(Math.round(log) - log) < 1e-6 ? format(',')(d) : '';
          });
      } else {
        this.yAxis = axisLeft(this.y).tickSizeOuter(0).ticks(this.numYTicks);
      }

      if (this.percent) {
        this.yAxis.tickFormat(format('.0%'));
      }

      select(this.$refs.yAxis).call(this.yAxis);

      // --- update y-scale switch button --
      const xSwoop = 30;
      const ySwoop = -35;
      const swoopOffset = 10;
      if (this.loggable) {
        this.switchBtn = select(this.$refs.switchY);

        select(this.$refs.switchY)
          .select('rect')
          .attr('x', 0)
          .attr('width', 0)
          .attr('height', 26.5)
          .attr('y', this.height - 28)
          .on('mouseover', () =>
            this.switchBtn.select('rect').classed('switch-button-hover', true),
          )
          .on('mouseout', () =>
            this.switchBtn.select('rect').classed('switch-button-hover', false),
          )
          .on('click', () => this.changeYScale());

        select(this.$refs.switchY)
          .select('path')
          .attr('marker-end', 'url(#arrow)')
          // M x-start y-start C x1 y1, x2 y2, x-end y-end -- where x1/y1/x2/y2 are the coordinates of the bezier curve.
          .attr(
            'd',
            `M ${xSwoop} ${this.height + ySwoop}
          C ${xSwoop + swoopOffset} ${this.height + ySwoop},
          ${this.margin.left + ySwoop + 20} ${
              this.height - this.margin.bottom + 15 + swoopOffset
            },
          ${this.margin.left + ySwoop + 20} ${
              this.height - this.margin.bottom + 15
            }`,
          );

        const switchTextEnter = this.switchBtn
          .select('text')
          .attr('class', 'switch-button')
          .attr('x', 3.84 * 2)
          .text(`switch to ${this.isLogY ? 'linear' : 'log'} scale`)
          .attr('y', this.height + 6 - 12.8);

        if (this.switchBtn.select('text').node()) {
          this.switchBtn
            .select('rect')
            .attr(
              'width',
              this.switchBtn.select('text').node().getBBox().width + 3.84 * 4,
            );
          // .attr(
          //   "height",
          //   .select("text")
          //   .node()
          //   .getBBox().height + 3.84*2
          // );
        }
      }
    },
    drawPlot() {
      if (this.plottedData && this.plottedData.length) {
        const t1 = transition().duration(this.transitionDuration);
        const t2 = transition().duration(500);
        const formatDate = timeFormat('%d %b %Y');

        // --- location annotation ---
        // using force direction to make sure they don't overlap.
        // based off https://bl.ocks.org/wdickerson/bd654e61f536dcef3736f41e0ad87786
        const labelHeight = 16;
        // Create nodes of the text labels for force direction
        this.plottedData.forEach((d) => {
          d['fx'] = 0;
          const filtered = d.value.slice(-1);
          const yMax = filtered.map((d) => d[this.selectedVariable]);
          d['xMax'] =
            filtered.length === 1 ? this.x(filtered[0][this.xVariable]) : null;
          d['targetY'] = yMax[0] ? this.y(yMax[0]) : this.height;
        });

        // Define a custom force
        const forceClamp = (min, max) => {
          let nodes;
          const force = () => {
            nodes.forEach((n) => {
              if (n.y > max) n.y = max;
              if (n.y < min) n.y = min;
            });
          };
          force.initialize = (_) => (nodes = _);
          return force;
        };

        // Set up the force simulation
        const force = forceSimulation()
          .nodes(this.plottedData)
          .force('collide', forceCollide(labelHeight / 2).strength(0.1))
          .force('y', forceY((d) => d.targetY).strength(1))
          .force(
            'clamp',
            forceClamp(0, this.height - this.margin.top - this.margin.bottom),
          )
          .stop();

        // Execute the simulation
        for (let i = 0; i < 300; i++) force.tick();

        // --- create groups for each region ---
        const regionGroups = this.chart
          .selectAll('.epi-region')
          .data(this.plottedData, (d) => d.key);

        regionGroups.join(
          (enter) => {
            const grps = enter
              .append('g')
              .attr('class', 'epi-region')
              .attr('id', (d) => d.key)
              .attr('fill', (d) => this.colorScale(d.key));

            grps
              .append('text')
              .attr('dx', 8)
              .attr('class', (d) => `annotation--region-name ${d.key}`)
              .attr('x', this.width - this.margin.left - this.margin.right)
              .attr('y', (d) => d.y)
              .text((d) => (d.value[0] ? d.value[0].name : ''))
              .style(
                'font-family',
                "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
              )
              // .transition(t1)
              // .delay(1000)
              .style('opacity', 1);

            grps
              .append('path')
              .attr('class', (d) => `epi-line ${d.key}`)
              .attr('stroke', (d) => this.colorScale(d.key))
              .style('fill', 'none')
              .style('stroke-width', '2.5')
              .attr('id', (d) =>
                d.key ? `epi-line-${d.key}` : 'epi-line-blank',
              )
              .datum((d) => d.value)
              .attr('d', this.line);

            // .attr("stroke-dasharray", () => {
            //   var totalLength = this.getTotalLength();
            //   return totalLength + " " + totalLength;
            // })
            // .attr("stroke-dashoffset", () => {
            //   var totalLength = this.getTotalLength();
            //   return totalLength;
            // })
            // .transition(t1)
            // .ease(easeLinear)
            // .attr("stroke-dashoffset", 0)

            grps
              .append('circle')
              .attr('class', (d) => `epi-point ${d.key}`)
              .attr('id', (d) => `${d.key}`)
              .attr('r', this.radius)
              .attr('cx', (d) => d.xMax)
              .attr('cy', (d) => d.y)
              .style('opacity', 1);
          },
          (update) => {
            update
              .attr('id', (d) => d.key)
              .attr('fill', (d) => this.colorScale(d.key));

            update
              .select('.annotation--region-name')
              .attr('x', this.width - this.margin.left - this.margin.right)
              .text((d) => (d.value[0] ? d.value[0].name : ''))
              .style('opacity', 1)
              .transition(t2)
              .attr('y', (d) => d.y);

            update
              .select('.epi-line')
              .attr('stroke', (d) => this.colorScale(d.key))
              .attr('id', (d) =>
                d.key ? `epi-line-${d.key}` : 'epi-line-blank',
              )
              .attr('class', (d) => `epi-line ${d.key}`)
              .datum((d) => d.value)
              .attr('stroke-dashoffset', 0)
              .attr('stroke-dasharray', 'none')
              .transition(t2)
              .attr('d', this.line);

            update
              .select('.epi-point')
              .attr('class', (d) => `epi-point ${d.key}`)
              .attr('id', (d) => `${d.key}`)
              .attr('cx', (d) => d.xMax)
              .transition(t2)
              .attr('cy', (d) => d.y);
          },
          (exit) =>
            exit.call((exit) =>
              exit.transition().style('opacity', 1e-5).remove(),
            ),
        );

        // --- event listeners ---
        selectAll('.annotation--region-name')
          .on('mouseover', (d) => this.tooltipOn(d, 'key'))
          .on('mouseout', (d) => this.tooltipOff(d));

        const mouseRect = select('#tooltip-cover-rect')
          .style('fill', 'none')
          .style('pointer-events', 'all')
          .attr('width', this.width - this.margin.left - this.margin.right)
          .attr('height', this.height - this.margin.top - this.margin.bottom)
          .on('touchmove mouseover mousemove', this.mouseOn)
          .on('touchend mouseout', this.mouseOff);

        selectAll('.mouse-line')
          .attr('y1', this.height - this.margin.top - this.margin.bottom)
          .attr('y2', 0)
          .attr('stroke', 'currentColor')
          .style('stroke-width', '1')
          .style('opacity', 0);
      }
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.tooltip {
  position: fixed;
  z-index: 1000;
  background: #ffffffcf;
  opacity: 0;
  pointer-events: none;
}
.epi-axis text {
  font-size: 12pt;
}

.epi-point {
  // opacity: 0.4;
}

.annotation--region-name {
  dominant-baseline: middle;
  stroke: none !important;
  font-family: $font-family;
}

.tooltip--text {
  dominant-baseline: hanging;
  stroke: none !important;
}

.tooltip--date {
  font-weight: 400;
}

.tooltip--case-count {
  font-weight: 700;
}

.switch-button {
  pointer-events: none;
  dominant-baseline: text-after-edge;
  // fill: $grey-90 !important;
  font-weight: 300 !important;
  font-size: 12.8px;
  fill: $secondary-color;

  &:hover {
  }
}

.swoopy-arrow,
.swoopy-arrowhead {
  stroke: $grey-70;
  fill: none;
  stroke-width: 0.8;
}
.swoopy-arrowhead {
  stroke-width: 1;
}

.switch-button-rect {
  cursor: pointer;
  fill: white;
  rx: 5;
  ry: 5;
  stroke: $secondary-color;
  stroke-width: 1;
  shape-rendering: crispedges;
  &:hover {
    fill: $secondary-bright;
  }
}

.switch-button-hover {
}

.epidemiology-curves line.case-def-changed-line {
  stroke: $grey-60;
  stroke-width: 0.75;
  shape-rendering: crispedges;
  stroke-dasharray: 6, 6;
}
.epidemiology-curves .case-def-changed text {
  text-anchor: start;
}

.x-axis-select {
  // top: -29px;
  // right: 20px;
}

.swoopy-arrow-group {
  pointer-events: none;
  & rect {
    pointer-events: auto !important;
  }
}
</style>
