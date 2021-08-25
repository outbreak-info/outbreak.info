<template>
<div class="mt-4" id="sublineage-totals">
  <h5 class="m-0">Lineage breakdown of {{title}}</h5>

  <!-- DELTA WARNING! -->
  <div style='max-width: 420px;' class="my-2 fa-sm" v-if="lineageName == 'Delta'">
    <Warning text="Classifications of Delta lineages are in flux. <a href='https://outbreak.info/situation-reports/caveats#delta' class='text-light text-underline'>(read more)</a>" />
  </div>
  <p class="text-muted m-0">There are <b>{{data.length}}</b> <a>Pango lineages</a> currently associated with the {{lineageName}} variant:</p>

  <svg :width="width" :height="height" class="sublineage_counts" :name="title">
    <defs>
      <marker id="arrow-sublineage" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead-sublineage" :stroke="fill" fill="none" />
      </marker>
    </defs>
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="horizontal_bargraph"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-y pointer axis--y" ref="yAxis"></g>
    <g class="swoopy-arrow-group">
      <path class="swoopy-arrow" id="switch-btn-swoopy-arrow" marker-end="url(#arrow-sublineage)" :d="swoopyPosition" :stroke="fill" fill="none"></path>
      <text :x="width-margin.right-10" :y="height-margin.top" text-anchor="end" :fill="fill">all {{lineageName}} lineages</text>
    </g>
  </svg>
  <div class="w-50">
    <DownloadReportData :data="data" figureRef="sublineage_counts" dataType="Sublineage breakdown" class="mt-3" />'
  </div>

</div>
</template>

<script>
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  sum,
  axisLeft,
  axisBottom,
  format,
  event
} from "d3";

import cloneDeep from "lodash/cloneDeep";
import Warning from "@/components/Warning.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

// --- store / Vuex ---
import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "SublineageTotals",
  components: {
    DownloadReportData,
    Warning
  },
  props: {
    data: Array,
    lineageName: String,
    location: String,
    margin: {
      type: Object,
      default: function() {
        return {
          left: 80,
          right: 100,
          top: 10,
          bottom: 45
        };
      }
    },
    width: {
      type: Number,
      default: 500
    },
    fill: {
      type: String,
      default: "#f28e2c"
    }
  },
  computed: {
    geographicName() {
      return this.location == "Worldwide" ? "globally" : `in ${this.location}`
    },
    title() {
      return `${this.lineageName} ${this.geographicName}`
    },
    swoopyPosition() {
      return `M ${this.width - this.margin.left - 20} ${this.height - this.margin.top-5} c 0 0, 15 0, 0 -25`
    }
  },
  data() {
    return {
      numXTicks: 4,
      bandwidth: 25,
      height: null,

      // refs
      svg: null,
      // axes
      x: null,
      y: null,
      combinedTotal: null,
      yAxis: null
    }
  },
  watch: {
    data: function() {
      this.setupPlot();
      this.updatePlot();
    }
  },
  methods: {
    handleLineageClick(lineage) {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          country: queryParams.country,
          division: queryParams.division,
          pango: lineage,
          selected: queryParams.selected,
          selectedType: queryParams.selectedType
        }
      })
    },
    preprocessData() {
      this.processedData = cloneDeep(this.data);

      this.processedData.sort((a, b) => {
        return b.lineage_count - a.lineage_count;
      })
    },
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
      this.preprocessData();
    },
    updatePlot: function() {
      this.updateAxes();
      this.drawBars();
    },
    tooltipOn(d) {
      this.svg.selectAll(".lineage-group")
        .style("opacity", 0.3);

      select(this.$refs.yAxis)
        .selectAll("text")
        .style("opacity", 0.3);

      select(this.$refs.yAxis)
        .selectAll("text")
        .filter(axis_label => axis_label == d.pangolin_lineage)
        .style("opacity", 1);

      this.svg.select(`#${d.id}`)
        .style("opacity", 1);
    },
    tooltipOff() {
      this.svg.selectAll(".lineage-group")
        .style("opacity", 1);

      select(this.$refs.yAxis)
        .selectAll("text")
        .style("opacity", 1);
    },
    updateAxes() {
      const paddingInner = 0.25;
      this.height = this.processedData.length * this.bandwidth + (this.processedData.length - 1) * this.bandwidth * paddingInner + this.margin.top + this.margin.bottom;

      this.combinedTotal = sum(this.processedData, d => d.lineage_count);

      this.x = scaleLinear()
        .range([0, this.width - this.margin.right - this.margin.left])
        .domain([0, this.combinedTotal]);

      this.y = scaleBand()
        .paddingInner(paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map(d => d.pangolin_lineage));

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0);

      select(this.$refs.yAxis).call(this.yAxis);
    },
    drawBars() {
      const rectSelector =
        this.svg
        .selectAll(".rect-by-lineage")
        .data(this.processedData, d => d.pangolin_lineage);

      rectSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("class", "lineage-group")
            .attr("id", d => d.id);

          grp.append("rect")
            .attr("class", "variant-total")
            .attr("x", d => this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", this.fill)
            .style("fill-opacity", 0.05)
            .style("stroke", this.fill)
            .attr("width", this.x(this.combinedTotal) - this.x(0))

          grp.append("rect")
            .attr("class", "rect-by-lineage")
            .attr("x", d => this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", this.fill)
            .attr("width", d => this.x(d.lineage_count) - this.x(0))

          grp.append("text")
            .attr("class", "lineage-count-annotation")
            .attr("x", d => this.width - this.margin.left - this.margin.right)
            .attr("dx", 10)
            .attr("y", d => this.y(d.pangolin_lineage) + this.y.bandwidth() / 2)
            .text(d => d.lineage_count_formatted)
            .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
            .style("fill", this.fill)
            .style("font-weight", 700)
            .style("dominant-baseline", "central")
        },
        update => {
          update
            .attr("id", d => d.id)

          update.select(".variant-total")
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .attr("width", this.x(this.combinedTotal) - this.x(0))

          update.select(".rect-by-lineage")
            .attr("x", d => this.x(0))
            .transition().duration(250)
            .attr("width", d => this.x(d.lineage_count) - this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())

          update.select(".lineage-count-annotation")
            .text(d => d.lineage_count_formatted)
        },
        exit => {
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        }
      );

      // event listener for click event
      select(this.$refs.yAxis)
        .selectAll("text")
        .classed("pointer", true)
        .on("click", d => this.handleLineageClick(d));

      selectAll(".lineage-group")
        .classed("pointer", true)
        .on("mousemove", d => this.tooltipOn(d))
        .on("mouseleave", () => this.tooltipOff())
        .on("click", d => this.handleLineageClick(d.pangolin_lineage));
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
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
</style>
