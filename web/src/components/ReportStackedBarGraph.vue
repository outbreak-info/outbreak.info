<template>
  <div>
    <svg
      ref="stacked_bar"
      :width="width"
      :height="height"
      class="report-stacked-bar"
      :name="title"
    >
      <g ref="chart" :transform="`translate(${margin.left},${margin.top})`" />
      <!-- <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g> -->
      <g
        ref="yAxis"
        class="epi-axis axis--y"
        :transform="`translate(${margin.left},${margin.top})`"
      />
    </svg>
    <!-- Histogram of sequencing counts -->
    <SequencingHistogram
      v-if="seqCounts"
      :data="seqCounts"
      :width="width"
      :svgTitle="title"
      :margin="marginHist"
      :mutationName="null"
      className="stacked-seq-histogram"
      :onlyTotals="true"
      notDetectedColor="#bab0ab"
      :title="`Sequences over last ${recentWindow} days`"
    />

    <DownloadReportData
      :data="data"
      figureRef="report-stacked-bar"
      dataType="Mutation Report Prevalence over Time"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import { axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { forceY, forceCollide, forceSimulation } from 'd3-force';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, event } from 'd3-selection';
import { stack, stackOrderAscending } from 'd3-shape';

import { lazyLoad } from '@/js/lazy-load';

export default Vue.extend({
  name: 'LineagesByLocation',
  components: {
    SequencingHistogram: lazyLoad('SequencingHistogram'),
    DownloadReportData: lazyLoad('DownloadReportData'),
  },
  props: {
    data: Array,
    seqCounts: Array,
    locationID: String,
    locationName: String,
    colorScale: Function,
    recentWindow: String,
    routeTo: {
      type: String,
      default: 'MutationReport',
    },
    rectWidth: {
      type: Number,
      default: 25,
    },
  },
  data() {
    return {
      // dimensions
      margin: {
        top: 18,
        bottom: 30,
        left: 55,
        right: 10,
      },
      marginHist: {
        top: 5,
        bottom: 10,
        left: 55,
        right: 55,
      },
      width: 200,
      height: 500,
      legendHeight: null,
      // variables
      fillVar: 'key',
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      area: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null,
      legend: null,
    };
  },
  computed: {
    title() {
      return this.locationName
        ? `Lineage prevalence over time in ${this.locationName}`
        : 'Lineage prevalence over time';
    },
  },
  watch: {
    width() {
      this.updatePlot();
    },
    data() {
      this.updatePlot();
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.debounceSetDims);
    });

    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  methods: {
    setDims() {},
    setupPlot() {
      this.chart = select(this.$refs.chart);
    },
    updateScales() {
      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, 1]);

      this.lineages = Object.keys(this.data[0]);

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format('.0%'));

      // stacking
      this.series = stack()
        .keys(this.lineages)
        // .order(stackOrderDescending)
        .order(stackOrderAscending)(
        // .order(stackOrderAppearance)
        // .order(stackOrderNone)
        // .order(stackOrderReverse)
        // .order(stackOrderInsideOut)
        this.data,
      );

      select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot();
      }
    },
    drawPlot() {
      const barSelector = this.chart
        .selectAll('.stacked-bar-chart')
        .data(this.series);

      // calculate label positions so they don't overlap
      const labelHeight = 18;
      this.series.forEach((d) => {
        d['fx'] = 0;
        d['targetY'] =
          this.y(d[0][0]) + (this.y(d[0][1]) - this.y(d[0][0])) / 2;
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
        .nodes(this.series)
        .force('collide', forceCollide(labelHeight / 2).strength(1))
        .force('y', forceY((d) => d.targetY).strength(1))
        .force(
          'clamp',
          forceClamp(0, this.height - this.margin.top - this.margin.bottom),
        )
        .stop();

      // Execute the simulation
      for (let i = 0; i < 300; i++) force.tick();

      barSelector.join(
        (enter) => {
          const barGrp = enter
            .append('g')
            .attr('class', 'stacked-bar-chart')
            .attr('id', (d) => d.key.replace(/\./g, '-'));

          barGrp
            .append('rect')
            .attr('x', 0)
            .attr('width', this.rectWidth)
            .attr('y', (d) => this.y(d[0][1]))
            .attr('height', (d) => this.y(d[0][0]) - this.y(d[0][1]))
            .style('fill', (d) => this.colorScale(d.key));

          const tspan = barGrp
            .append('text')
            .attr('class', 'lineage_name')
            .attr('x', this.rectWidth)
            .attr('dx', 10)
            .attr('y', (d) => d.y)
            .style(
              'font-family',
              "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
            )
            .style('fill', (d) => this.colorScale(d.key))
            .style('dominant-baseline', 'central');

          tspan
            .append('tspan')
            .attr('class', 'lineage')
            .text((d) => d.key)
            .style('font-weight', '700')
            .classed('pointer', (d) => d.key.toLowerCase() !== 'other')
            .classed('hover-underline', (d) => d.key.toLowerCase() !== 'other')
            .on('click', (d) => this.route2Lineage(d.key));

          tspan
            .append('tspan')
            .attr('class', 'percent')
            .attr('dx', 5)
            .text((d) => `(${format('.0%')(d[0].data[d.key])})`);
        },
        (update) => {
          update.attr('id', (d) => d.key.replace(/\./g, '-'));

          update
            .select('rect')
            .attr('y', (d) => this.y(d[0][1]))
            .attr('height', (d) => this.y(d[0][0]) - this.y(d[0][1]))
            .style('fill', (d) => this.colorScale(d.key));

          update
            .select('text')
            .attr('y', (d) => d.y)
            .style('fill', (d) => this.colorScale(d.key));

          update
            .select('text')
            .select('.lineage')
            .text((d) => d.key)
            .classed('pointer', (d) => d.key.toLowerCase() !== 'other')
            .classed('hover-underline', (d) => d.key.toLowerCase() !== 'other')
            .on('click', (d) => this.route2Lineage(d.key));

          update
            .select('text')
            .select('.percent')
            .text((d) => `(${format('.0%')(d[0].data[d.key])})`);
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );
    },
    route2Lineage(pango) {
      if (pango.toLowerCase() !== 'other') {
        if (this.routeTo === 'GenomicsEmbedLocation') {
          this.$router.push({
            name: 'GenomicsEmbed',
            query: {
              loc: this.locationID,
              type: 'var',
              pango: pango,
              selected: this.locationID,
            },
          });
        } else {
          this.$router.push({
            name: 'MutationReport',
            query: {
              loc: this.locationID,
              pango: pango,
              selected: this.locationID,
            },
          });
        }
      }
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
});
</script>

<style lang="scss">
.hover-underline:hover {
  text-decoration: underline;
}

.report-stacked-bar {
  .axis--y text {
    font-size: 16px;
  }
}
</style>
