<template>
  <div class="epidemiology-area">
    <svg
      :id="id"
      :width="width"
      :height="height"
      class="epi-summary-svg"
      :name="title"
    >
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
        :transform="`translate(${margin.left},${margin.top})`"
        class="epi-summary"
      >
        <g class="annotation-group case-def-changed" />
      </g>
      <g class="epi-axis axis--x" />
      <g class="epi-axis axis--y" />

      <g
        :transform="`translate(${margin.left},${-margin.top})`"
        class="legend"
      />
    </svg>
  </div>
</template>

<script>
import { max, extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, stack, stackOrderReverse } from 'd3-shape';

import { mapState } from 'pinia';
import { colorsStore } from '@/stores/colorsStore';

const margin = {
  top: 10,
  right: 50,
  bottom: 25,
  left: 90,
};

export default {
  name: 'EpiStacked',
  components: {},
  props: {
    id: String,
    title: String,
    data: Array,
    width: Number,
    height: Number,
    includeChinaAnnot: Boolean,
  },
  data() {
    return {
      margin,
      series: null,
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      legend: null,
      // methods
      area: null,
    };
  },
  computed: {
    ...mapState(colorsStore, ['getRegionColor']),
  },
  watch: {
    data() {
      this.updatePlot();
    },
    width() {
      this.updatePlot();
    },
    height() {
      this.updatePlot();
    },
  },
  mounted() {
    this.updatePlot();
  },
  methods: {
    handleClick(key) {
      this.$emit('regionSelected', {
        region: key,
        display: false,
        displayMore: true,
      });
    },
    handleMouseover(d) {
      selectAll('.legend-group').style('opacity', 0.4);

      selectAll('.stacked-area-chart').style('opacity', 0.4);

      selectAll(
        `.${d.key
          .replace(/\s/g, '_')
          .replace(/\//g, '_')
          .replace(/&/g, '_')
          .replace(/:/g, '_')
          .replace(/\(/g, '_')
          .replace(/\)/g, '_')}`,
      ).style('opacity', 1);

      this.$emit('regionSelected', {
        region: d.key,
        display: true,
        currentCases: d.slice(-1)[0].data[d.key],
        x: event.x + 10,
        y: event.y + 10,
      });
    },
    handleMouseout(key) {
      selectAll('.legend-group').style('opacity', 1);

      selectAll('.stacked-area-chart').style('opacity', 1);

      this.$emit('regionSelected', {
        region: key,
        display: false,
      });
    },
    colorScale(location) {
      const scale = this.getRegionColor;
      return scale(location);
    },
    updatePlot() {
      if (this.data) {
        this.setupPlot();
        this.updateScales();
        this.drawPlot();
      }
    },
    setupPlot() {
      this.svg = select(`#${this.id}`);
      this.chart = this.svg.select('.epi-summary');
      this.legend = this.svg.select('.legend');
    },
    updateScales() {
      const keys = Object.keys(this.data[0]).filter((d) => d !== 'date');

      this.series = stack()
        .keys(keys)
        // .order(stackOrderDescending)
        // .order(stackOrderAscending)
        // .order(stackOrderAppearance)
        // .order(stackOrderNone)
        .order(stackOrderReverse)(
        // .order(stackOrderInsideOut)
        this.data,
      );

      this.x = this.x
        .domain(extent(this.data.map((d) => d.date)))
        .range([0, this.width - this.margin.left - this.margin.right]);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, max(this.series, (d) => max(d, (d) => d[1]))])
        .nice();

      const numXTicks = this.width < 575 ? 2 : 4;
      this.xAxis = axisBottom(this.x).ticks(numXTicks);

      this.svg
        .select('.axis--x')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${
            this.height - this.margin.bottom + 2
          })`,
        )
        .call(this.xAxis);

      const numYTicks = this.height < 375 ? 5 : 8;
      this.yAxis = axisLeft(this.y).ticks(numYTicks);
      this.yAxis = this.yAxis
        .tickFormat((d, i) =>
          i === this.yAxis.scale().ticks().length - 1
            ? d / 1e6 + ' million'
            : d / 1e6,
        )
        .tickSizeOuter(0);

      this.svg
        .select('.axis--y')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .call(this.yAxis);
    },
    drawPlot() {
      // --- annotations ---
      this.area = area()
        .x((d) => this.x(d.data.date))
        .y0((d) => this.y(d[0]))
        .y1((d) => this.y(d[1]));

      const areaSelector = this.chart
        .selectAll('.stacked-area-chart')
        .data(this.series);

      areaSelector
        .join('path')
        .style('fill', ({ key }) => this.colorScale(key))
        .attr(
          'class',
          (d) =>
            `stacked-area-chart ${d.key
              .replace(/\s/g, '_')
              .replace(/&/g, '_')
              .replace(/:/g, '_')
              .replace(/\//g, '_')
              .replace(/\(/g, '_')
              .replace(/\)/g, '_')}`,
        )
        .attr('d', this.area)
        .append('title')
        .text(({ key }) => key);

      const legendRectWidth = 15;

      const legendData = this.legend
        .selectAll('.legend-group')
        .data(this.series);

      const legendEnter = legendData
        .enter()
        .append('g')
        .attr(
          'class',
          (d) =>
            `legend-group ${d.key
              .replace(/\s/g, '_')
              .replace(/&/g, '_')
              .replace(/:/g, '_')
              .replace(/\//g, '_')
              .replace(/\(/g, '_')
              .replace(/\)/g, '_')}`,
        );

      legendEnter
        .append('rect')
        .attr('y', (d, i) => i * (legendRectWidth + 4) + legendRectWidth)
        .attr('x', 10)
        .attr('width', legendRectWidth)
        .attr('height', legendRectWidth)
        .style('fill', ({ key }) => this.colorScale(key));

      legendEnter
        .append('text')
        .attr('y', (d, i) => i * (legendRectWidth + 4) + legendRectWidth * 1.5)
        .attr('x', 10 + legendRectWidth)
        .attr('dx', 8)
        .attr('class', 'legend-name')
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('font-size', '10px')
        .style('dominant-baseline', 'middle')
        .text(({ key }) => key);

      // --- tooltips ---
      this.chart
        .selectAll('path.stacked-area-chart')
        .on('mouseover', (d) => this.handleMouseover(d))
        .on('mouseout', (d) => this.handleMouseout(d.key))
        .on('click', (d) => this.handleClick(d.key));

      this.legend
        .selectAll('.legend-group')
        .on('mouseover', (d) => this.handleMouseover(d))
        .on('mouseout', (d) => this.handleMouseout(d.key))
        .on('click', (d) => this.handleClick(d.key));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.legend-name {
  &:hover {
    text-decoration: underline;
  }
}

.epi-axis text {
  font-size: 12pt;
}

.annotation--region-name {
  dominant-baseline: middle;
}

.legend-group,
path.stacked-area-chart {
  cursor: pointer;
}

.stacked-area-title {
  margin: 0.5em 0 0;
}

.case-def-changed {
  font-size: 0.85em;
  text-anchor: middle;
  fill: $grey-60;
}

.swoopy-arrow,
.swoopy-arrowhead {
  stroke: $grey-60;
  fill: none;
  stroke-width: 0.8;
}
.swoopy-arrowhead {
  stroke-width: 1;
}
</style>
