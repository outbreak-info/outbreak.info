<template>
  <div>
    <div :style="{ width: width + 'px' }">
      <div class="text-left line-height-1 mb-1">
        {{ variableLabel }}
      </div>
      <small
        class="d-block text-left text-muted line-height-1 mb-1"
        v-if="isFiltered"
      >
        <span v-html="filterString"></span>
      </small>
    </div>
    <svg
      class="epi-map-svg epi-map-legend"
      :subtitle="filterString"
      :width="width"
      :height="height + margin.top + margin.bottom * 2 + 15"
      ref="legend_svg"
    >
      <g
        class="legend-bars"
        ref="legend_bars"
        :transform="`translate(${margin.left},${margin.top})`"
      ></g>
      <g
        class="axis axis--x"
        ref="axis_x"
        :transform="`translate(${margin.left},${height + margin.top})`"
      ></g>
      <g
        class="legend"
        :transform="
          `translate(${margin.left},${height + margin.bottom + margin.top})`
        "
      >
        <!-- <g class="legend" :transform="`translate(${margin.left},${height + margin.bottom + margin.top})`" v-if="legendColors.length && legendColors[0].x0"> -->
        <template v-for="(item, idx) in legendColors">
          <rect
            x="0"
            y="0"
            :width="item.width"
            height="10"
            :fill="item.fill"
            :id="`legendrect${idx}`"
            :transform="`translate(${item.x0}, 0)`"
            :key="idx"
            v-if="item.width"
          ></rect>
        </template>
        <g v-if="isFiltered && x">
          <rect
            ref="rect_mask_right"
            :x="x(selectedMax)"
            y="0"
            :width="width - margin.left - margin.right"
            height="10"
            fill="white"
            fill-opacity="0.8"
          ></rect>
          <rect
            ref="rect_mask_left"
            x="0"
            y="0"
            :width="x(selectedMin)"
            height="10"
            fill="white"
            fill-opacity="0.8"
          ></rect>
        </g>
        <rect
          x="0"
          y="0"
          :width="width - margin.left - margin.right"
          height="10"
          stroke="black"
          fill="none"
          :stroke-width="0.5"
        ></rect>
      </g>
      <g
        class="slider-handle pointer"
        :transform="
          `translate(${margin.left},${height +
            margin.bottom +
            margin.top +
            17})`
        "
        v-if="x"
      >
        <g stroke="#686868" fill="#d6d6d6" stroke-width="0.5">
          <line
            ref="slider_line"
            :x1="sliderLeft"
            :x2="sliderRight"
            :y1="4.1"
            :y2="4.1"
            stroke="#d6d6d6"
            stroke-width="4.5"
          />
          <polygon
            id="slider_left"
            :transform="`translate(${sliderLeft},0)`"
            ref="slider_left"
            points="4.1,10.3 0.1,10.3 0.1,-1.8 1.1,-1.8 4.1,-1.8 8.1,4.1 "
          />
          <polygon
            ref="slider_right"
            :transform="`translate(${sliderRight - 8},0)`"
            points="0.1,4.1 4.1,-1.8 7.1,-1.8 8.1,-1.8 8.1,10.3 4.1,10.3 "
          />
        </g>
        <g
          transform="translate(0,13)"
          dominant-baseline="hanging"
          font-size="8"
          style='font-family:"DM Sans", Avenir, Helvetica, Arial, sans-serif;'
          text-anchor="start"
        >
          <text :x="x(selectedMin)" :y="0">{{ formatLimit(selectedMin) }}</text>
          <text :x="x(selectedMax)" :y="0" text-anchor="end">
            {{ formatLimit(selectedMax) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import {
  select,
  selectAll,
  scaleLinear,
  axisBottom,
  extent,
  max,
  format,
  histogram,
  drag,
  event,
} from 'd3';
import { interpolateYlGnBu } from 'd3-scale-chromatic';

export default {
  name: 'HistogramLegend',
  props: {
    data: Array,
    variable: String,
    variableLabel: String,
    minVal: Number,
    maxVal: Number,
    colorScale: Function,
    width: Number,
    transition1: Number,
    animate: Boolean,
  },
  watch: {
    data() {
      this.updatePlot();
    },
    variable() {
      this.updatePlot();
    },
    minVal: {
      immediate: true,
      handler(newMin, oldMin) {
        this.updateFilterLimits();
      },
    },
    maxVal: {
      immediate: true,
      handler(newMax, oldMax) {
        this.updateFilterLimits();
      },
    },
  },
  data() {
    return {
      height: 100,
      margin: {
        top: 5,
        bottom: 25,
        left: 5,
        right: 15,
      },
      selectedMin: null,
      selectedMax: null,
      // axes
      x: null,
      y: null,
      xAxis: null,
      legendColors: [],
      // binned data
      bins: null,
      numBins: 50,
      // refs
      chart: null,
      xAxisRef: null,
    };
  },
  computed: {
    sliderRight() {
      return this.x && (this.selectedMax || this.selectedMax === 0)
        ? this.x(this.selectedMax)
        : 8;
    },
    sliderLeft() {
      return this.x && (this.selectedMin || this.selectedMin === 0)
        ? this.x(this.selectedMin)
        : 0;
    },
    isFiltered() {
      return (
        this.$route.query.min ||
        this.$route.query.max ||
        this.$route.query.min === 0 ||
        this.$route.query.max === 0
      );
    },
    domain() {
      return extent(this.colorScale.domain());
    },
    precision() {
      return this.domain[1] - this.domain[0] <= 20 ? 10 : 1;
    },
    formatLimit() {
      return this.domain[1] - this.domain[0] <= 20
        ? format(',.1f')
        : format(',.0f');
    },
    filterString() {
      let filter = null;
      if (
        (this.minVal || this.minVal === 0) &&
        (this.maxVal || this.maxVal === 0)
      ) {
        filter = `${this.minVal.toLocaleString()} &mdash; ${this.maxVal.toLocaleString()}`;
      } else if (this.minVal || this.minVal === 0) {
        filter = `&ge; ${this.minVal.toLocaleString()}`;
      } else if (this.maxVal || this.maxVal === 0) {
        filter = `&le; ${this.maxVal.toLocaleString()}`;
      }

      return filter
        ? `filtered ${filter} ${this.variableLabel}`
        : this.variableLabel;
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();

    this.$nextTick(() => this.setupDrag());
  },
  methods: {
    setupPlot() {
      this.chart = select(this.$refs.legend_bars);
      this.xAxisRef = select(this.$refs.x_axis);
    },
    updateFilterLimits() {
      this.selectedMin =
        this.minVal || this.minVal === 0
          ? this.minVal
          : Math.floor((this.domain[0] + Number.EPSILON) * this.precision) /
            this.precision;
      this.selectedMax =
        this.maxVal || this.maxVal === 0
          ? this.maxVal
          : Math.ceil((this.domain[1] + Number.EPSILON) * this.precision) /
            this.precision;
    },
    updateAxes() {
      // x-axis
      this.x = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(this.domain)
        .clamp(true);

      this.xAxis = axisBottom(this.x)
        .tickSizeOuter(0)
        .ticks(5);
      this.xAxisRef.call(this.xAxis);

      // legend gradient
      this.legendColors = this.colorScale.range().map((color, i) => {
        return {
          fill: color,
          width:
            this.x(this.colorScale.domain()[i + 1]) -
            this.x(this.colorScale.domain()[i]),
          x0: this.x(this.colorScale.domain()[i]),
        };
      });

      selectAll('.axis').call(this.xAxis);

      // calculate bins
      this.bins = histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(this.numBins))(
        this.data.map((d) => d[this.variable]),
      );

      // pre-calc if the data should be selected or not
      this.bins.forEach((d) => {
        if (
          (this.minVal || this.minVal === 0) &&
          (this.maxVal || this.maxVal === 0)
        ) {
          d['selected'] = d.x0 >= this.minVal && d.x1 <= this.maxVal;
        } else if (this.minVal || this.minVal === 0) {
          d['selected'] = d.x0 >= this.minVal;
        } else if (this.maxVal || this.maxVal === 0) {
          d['selected'] = d.x1 <= this.maxVal;
        } else {
          d['selected'] = true;
        }
      });

      // y-axis
      this.y = scaleLinear()
        .range([this.height, 0])
        .domain([0, max(this.bins, (d) => d.length)]);
      //   select(this.$refs.slider_line)
      //   .attr("x1", this.x(this.selectedMin))
      //   .attr("x2", this.x(this.selectedMax))
    },
    setupDrag() {
      // draggable filters
      select(this.$refs.slider_left).call(
        drag()
          .on('drag', () => this.updateDrag('left'))
          .on('end', () => this.changeFilters()),
      );
      select(this.$refs.slider_right).call(
        drag()
          .on('drag', () => this.updateDrag('right'))
          .on('end', () => this.changeFilters()),
      );
    },
    updateDrag(side) {
      const newVal = this.x.invert(event.x);
      if (side === 'left') {
        this.selectedMin = newVal;
        select(this.$refs.slider_left).attr(
          'transform',
          `translate(${this.x(this.selectedMin)},0)`,
        );

        // select(this.$refs.rect_mask_left).attr("width", this.x(this.selectedMin))
      } else {
        this.selectedMax = newVal;

        select(this.$refs.slider_right).attr(
          'transform',
          `translate(${this.x(this.selectedMax) - 8},0)`,
        );

        // select(this.$refs.rect_mask_right)
        //   .attr("x", this.x(this.selectedMax))
      }
    },
    changeFilters() {
      if (this.selectedMin > this.selectedMax) {
        const minVal = this.selectedMax;
        this.selectedMax =
          Math.ceil((this.selectedMin + Number.EPSILON) * this.precision) /
          this.precision;
        this.selectedMin =
          Math.floor((minVal + Number.EPSILON) * this.precision) /
          this.precision;
      } else {
        this.selectedMax =
          Math.ceil((this.selectedMax + Number.EPSILON) * this.precision) /
          this.precision;
        this.selectedMin =
          Math.floor((this.selectedMin + Number.EPSILON) * this.precision) /
          this.precision;
      }

      const route = this.$route.query;
      this.$router.push({
        path: 'maps',
        query: {
          location: route.location,
          admin_level: route.admin_level,
          variable: route.variable,
          date: route.date,
          min: String(this.selectedMin),
          max: String(this.selectedMax),
        },
      });
    },
    updatePlot: () => {
      if (this.data && this.colorScale) {
        this.updateAxes();
        this.updateFilterLimits();

        this.chart
          .selectAll('rect')
          .data(this.bins)
          .join(
            (enter) => {
              enter
                .append('rect')
                .attr('class', 'histogram-bar')
                .attr('fill', (d) =>
                  this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : 'none',
                )
                .attr('opacity', (d) => (d.selected ? 1 : 0.25))
                .attr('x', (d) => this.x(d.x0) + 1)
                .attr('width', (d) =>
                  Math.max(0, this.x(d.x1) - this.x(d.x0) - 1),
                )
                .attr('y', (d) => this.y(d.length))
                .attr('height', (d) => this.y(0) - this.y(d.length));
            },
            (update) => {
              if (this.animate) {
                update
                  .attr('fill', (d) =>
                    this.colorScale
                      ? this.colorScale((d.x0 + d.x1) / 2)
                      : 'none',
                  )
                  .attr('opacity', (d) => (d.selected ? 1 : 0.25))
                  .attr('x', (d) => this.x(d.x0) + 1)
                  .attr('width', (d) =>
                    Math.max(0, this.x(d.x1) - this.x(d.x0) - 1),
                  )
                  .transition()
                  .duration(this.transition1)
                  .attr('height', (d) => this.y(0) - this.y(d.length))
                  .attr('y', (d) => this.y(d.length));
              } else {
                update
                  .attr('fill', (d) =>
                    this.colorScale
                      ? this.colorScale((d.x0 + d.x1) / 2)
                      : 'none',
                  )
                  .attr('opacity', (d) => (d.selected ? 1 : 0.25))
                  .attr('x', (d) => this.x(d.x0) + 1)
                  .attr('width', (d) =>
                    Math.max(0, this.x(d.x1) - this.x(d.x0) - 1),
                  )
                  .attr('y', (d) => this.y(d.length))
                  .attr('height', (d) => this.y(0) - this.y(d.length));
              }
            },
          );
      }
    },
  },
};
</script>

<style lang="scss">
.histogram-bar {
  stroke: $base-grey;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}
</style>
