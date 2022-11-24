<template>
  <div id="sublineage-totals" class="mt-4">
    <div class="d-flex align-items-center">
      <h5 class="m-0">Lineage breakdown of {{ title }}</h5>
      <button
        class="btn btn-main-outline d-flex align-items-center my-2 px-2 ml-2"
        data-toggle="modal"
        data-target="#change-selected-location"
      >
        <font-awesome-icon class="fa-sm" :icon="['fas', 'sync']" />
      </button>
    </div>

    <p class="text-muted m-0">
      There are
      <b>{{ data.length }}</b>
      <a>Pango lineages</a>
      currently associated with the {{ lineageName }} variant:
    </p>

    <svg
      :width="width"
      :height="height"
      class="sublineage_counts"
      :name="title"
    >
      <defs>
        <marker
          id="arrow-sublineage"
          markerWidth="13"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M5,0 L12,5 L5,10"
            class="swoopy-arrowhead-sublineage"
            :stroke="fill"
            fill="none"
          />
        </marker>
      </defs>
      <g
        ref="horizontal_bargraph"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        ref="yAxis"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="horizontal-bargraph-y pointer axis--y"
      />
      <g class="swoopy-arrow-group">
        <path
          id="switch-btn-swoopy-arrow"
          class="swoopy-arrow"
          marker-end="url(#arrow-sublineage)"
          :d="swoopyPosition"
          :stroke="fill"
          fill="none"
        />
        <text
          :x="width - margin.right - 10"
          :y="height - margin.top"
          text-anchor="end"
          :fill="fill"
        >
          all {{ lineageName }} lineages
        </text>
      </g>
    </svg>

    <div class="d-flex align-items-center mt-3">
      <button
        id="zeros-filtered"
        class="btn btn-main-outline m-0 btn-sublineages mr-3"
        @click="showZeros"
      >
        <small v-if="showZero">
          {{ hideZeros ? 'show' : 'hide' }} lineages with zero sequences
        </small>

        <small v-else>
          {{ showAll ? 'show top 10 lineages' : 'show all lineages' }}
        </small>
      </button>

      <DownloadReportData
        :data="data"
        figureRef="sublineage_counts"
        dataType="Sublineage breakdown"
        :fullWidth="false"
      />
    </div>

    <div
      v-if="areZerosFiltered || (!areZerosFiltered && !hideZeros)"
      class="text-muted mt-2 line-height-sm"
    >
      <small>
        <font-awesome-icon class="mr-1" :icon="['far', 'question-circle']" />
        Lineages may show zero sequences immediately after the
        <a
          href="https://www.pango.network/how-does-the-system-work/genome-designation-versus-assignation/"
          target="_blank"
        >
          Pango network designates a new lineage
        </a>
        since lineage assignment models used by
        <a
          href="https://cov-lineages.org/resources/pangolin.html"
          target="_blank"
        >
          Pangolin
        </a>
        have to be retrained, followed by sequence classification with the
        updated models.
      </small>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { select, selectAll, scaleLinear, scaleBand, axisLeft, sum } from 'd3';
import cloneDeep from 'lodash/cloneDeep';

import { lazyLoad } from '@/js/lazy-load';

export default Vue.extend({
  name: 'SublineageTotals',
  components: {
    DownloadReportData: lazyLoad('DownloadReportData'),
  },
  props: {
    data: Array,
    lineageName: String,
    location: String,
    routeTo: String,
    margin: {
      type: Object,
      default: () => {
        return {
          left: 80,
          right: 100,
          top: 10,
          bottom: 45,
        };
      },
    },
    width: {
      type: Number,
      default: 500,
    },
    fill: {
      type: String,
      default: '#f28e2c',
    },
  },
  data() {
    return {
      numXTicks: 4,
      bandwidth: 25,
      height: null,

      // forms
      hideZeros: true,
      areZerosFiltered: false,

      // variables
      yVar: 'mutation_string',

      // refs
      svg: null,
      // axes
      x: null,
      y: null,
      combinedTotal: null,
      yAxis: null,
      showAll: false,
      showZero: false,
    };
  },
  computed: {
    geographicName() {
      return this.location === 'Worldwide'
        ? 'globally'
        : this.location
        ? `in ${this.location}`
        : null;
    },
    title() {
      return this.geographicName
        ? `${this.lineageName} ${this.geographicName}`
        : this.lineageName;
    },
    swoopyPosition() {
      return `M ${this.width - this.margin.left - 20} ${
        this.height - this.margin.top - 5
      } c 0 0, 15 0, 0 -25`;
    },
  },
  watch: {
    data() {
      this.preprocessData();
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    handleLineageClick(lineage) {
      const queryParams = this.$route.query;
      if (this.routeTo === 'GenomicsEmbedVariant') {
        this.$router.push({
          name: 'GenomicsEmbed',
          query: {
            type: 'var',
            country: queryParams.country,
            division: queryParams.division,
            pango: lineage,
            selected: queryParams.selected,
            selectedType: queryParams.selectedType,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          query: {
            country: queryParams.country,
            division: queryParams.division,
            pango: lineage,
            selected: queryParams.selected,
            selectedType: queryParams.selectedType,
          },
        });
      }
    },
    preprocessData() {
      this.processedData = cloneDeep(this.data);

      if (this.hideZeros) {
        this.processedData = this.processedData.filter((d) => d.lineage_count);
        this.areZerosFiltered = this.data.length !== this.processedData.length;
      } else {
        this.areZerosFiltered = false;
      }

      this.processedData.sort((a, b) => {
        return b.lineage_count - a.lineage_count;
      });

      if (this.processedData.length > 10) {
        if (!this.showAll) {
          this.processedData = this.processedData.slice(0, 10);
        }
      } else {
        this.showZero = true;
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
      this.preprocessData();
    },
    updatePlot() {
      this.updateAxes();
      this.drawBars();
    },
    tooltipOn(d) {
      this.svg.selectAll('.lineage-group').style('opacity', 0.3);

      select(this.$refs.yAxis).selectAll('text').style('opacity', 0.3);

      select(this.$refs.yAxis)
        .selectAll('text')
        .filter((axis_label) => axis_label === d[this.yVar])
        .style('opacity', 1);

      this.svg.select(`#${d.id}`).style('opacity', 1);
    },
    tooltipOff() {
      this.svg.selectAll('.lineage-group').style('opacity', 1);

      select(this.$refs.yAxis).selectAll('text').style('opacity', 1);
    },
    showZeros() {
      if (this.showZero) {
        this.hideZeros = !this.hideZeros;
      }
      this.showAll = !this.showAll;
      this.preprocessData();
      this.updatePlot();
    },
    updateAxes() {
      const paddingInner = 0.25;
      this.height =
        this.processedData.length * this.bandwidth +
        (this.processedData.length - 1) * this.bandwidth * paddingInner +
        this.margin.top +
        this.margin.bottom;

      this.combinedTotal = sum(this.processedData, (d) => d.lineage_count);

      this.x = scaleLinear()
        .range([0, this.width - this.margin.right - this.margin.left])
        .domain([0, this.combinedTotal]);

      this.y = scaleBand()
        .paddingInner(paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map((d) => d[this.yVar]));

      this.yAxis = axisLeft(this.y).tickSizeOuter(0);

      select(this.$refs.yAxis).call(this.yAxis);
    },
    drawBars() {
      const rectSelector = this.svg
        .selectAll('.lineage-group')
        .data(this.processedData, (d) => d[this.yVar]);

      rectSelector.join(
        (enter) => {
          const grp = enter
            .append('g')
            .attr('class', 'lineage-group')
            .attr('id', (d) => d.id);

          grp
            .append('rect')
            .attr('class', 'variant-total')
            .attr('x', (d) => this.x(0))
            .attr('y', (d) => this.y(d[this.yVar]))
            .attr('height', (d) => this.y.bandwidth())
            .style('fill', this.fill)
            .style('fill-opacity', 0.05)
            .style('stroke', this.fill)
            .attr('width', this.x(this.combinedTotal) - this.x(0));

          grp
            .append('rect')
            .attr('class', 'rect-by-lineage')
            .attr('x', (d) => this.x(0))
            .attr('y', (d) => this.y(d[this.yVar]))
            .attr('height', (d) => this.y.bandwidth())
            .style('fill', this.fill)
            .attr('width', (d) => this.x(d.lineage_count) - this.x(0));

          grp
            .append('text')
            .attr('class', 'lineage-count-annotation')
            .attr('x', (d) => this.width - this.margin.left - this.margin.right)
            .attr('dx', 10)
            .attr('y', (d) => this.y(d[this.yVar]) + this.y.bandwidth() / 2)
            .text((d) => d.lineage_count_formatted)
            .style(
              'font-family',
              "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
            )
            .style('fill', this.fill)
            .style('font-weight', 700)
            .style('dominant-baseline', 'central');
        },
        (update) => {
          update.attr('id', (d) => d.id + this.location);

          update
            .select('.variant-total')
            .attr('y', (d) => this.y(d[this.yVar]))
            .attr('height', (d) => this.y.bandwidth())
            .attr('width', this.x(this.combinedTotal) - this.x(0));

          update
            .select('.rect-by-lineage')
            .attr('x', (d) => this.x(0))
            .transition()
            .duration(250)
            .attr('width', (d) => this.x(d.lineage_count) - this.x(0))
            .attr('y', (d) => this.y(d[this.yVar]))
            .attr('height', (d) => this.y.bandwidth());

          update
            .select('.lineage-count-annotation')
            .transition()
            .duration(250)
            .attr('y', (d) => this.y(d[this.yVar]) + this.y.bandwidth() / 2)
            .text((d) => d.lineage_count_formatted);
        },
        (exit) => {
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          );
        },
      );

      // event listener for click event
      select(this.$refs.yAxis)
        .selectAll('text')
        .classed('pointer', true)
        .on('click', (d) => this.handleLineageClick(d));

      selectAll('.lineage-group')
        .classed('pointer', true)
        .on('mousemove', (d) => this.tooltipOn(d))
        .on('mouseleave', () => this.tooltipOff())
        .on('click', (d) => this.handleLineageClick(d[this.yVar]));
    },
  },
});
</script>

<style lang="scss">
.horizontal-bargraph-y {
  font-size: 16px;
}

.horizontal-bargraph-y path {
  display: none;
}

.horizontal-bargraph-y line {
  stroke: #888;
}

.btn-sublineages {
  line-height: 1 !important;
}
</style>
