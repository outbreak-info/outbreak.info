<template>
  <div class="horizontal-bargraph d-flex flex-column text-left">
    <h6 class="m-0">{{ title }}</h6>
    <small class="text-muted">{{ subtitle }}</small>
    <svg :width="width" :height="height">
      <g
        :transform="`translate(${margin.left}, ${margin.top})`"
        ref="horizontal_bargraph"
      ></g>
      <g
        :transform="`translate(${width - margin.right + 3}, ${margin.top})`"
        class="horizontal-bargraph-y axis--y"
        ref="yAxis"
      ></g>
    </svg>
  </div>
</template>

<script>
import Vue from 'vue';

import { select, selectAll, scaleLinear, scaleBand, axisRight, max } from 'd3';
import cloneDeep from 'lodash/cloneDeep';

export default Vue.extend({
  name: 'HorizontalBargraph',
  props: {
    data: Array,
    title: String,
    subtitle: String,
    width: {
      type: Number,
      default: 250,
    },
    height: {
      type: Number,
      default: 250,
    },
    num2Show: {
      type: Number,
      default: 15,
    },
    fill: {
      type: String,
      default: '#cbd7e3',
    },
  },
  data: function() {
    return {
      barHeight: 10,
      spacing: 3,
      margin: {
        top: 10,
        bottom: 3,
        left: 3,
        right: 150,
      },
      // axes
      x: null,
      y: scaleBand(),
      yAxis: null,
      // refs
      svg: null,
    };
  },
  computed: {
    filtered: function() {
      if (this.data) {
        return this.data.slice(0, this.num2Show);
      } else {
        return null;
      }
    },
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
    },
    updatePlot: function() {
      if (this.filtered) {
        this.updateAxes();
        this.drawBars();
      }
    },
    updateAxes() {
      this.x = scaleLinear()
        .range([this.width - this.margin.left - this.margin.right, 0])
        .domain([0, max(this.filtered, (d) => d.value)]);

      this.y = scaleBand()
        .paddingInner(0.2)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.filtered.map((d) => d.key));

      this.yAxis = axisRight(this.y).tickSizeOuter(0);

      select(this.$refs.yAxis).call(this.yAxis);
    },
    drawBars() {
      const rectSelector = this.svg.selectAll('rect').data(this.filtered);

      rectSelector.join((enter) => {
        enter
          .append('rect')
          .attr('x', (d) => this.x(d.value))
          .attr('width', (d) => this.x(0) - this.x(d.value))
          .attr('y', (d) => this.y(d.key))
          .attr('height', (d) => this.y.bandwidth())
          .style('fill', this.fill);
      });
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
});
</script>

<style lang="scss">
.horizontal-bargraph {
  rect {
    stroke: $grey-70;
  }
}

.horizontal-bargraph-y path {
  display: none;
}
</style>
