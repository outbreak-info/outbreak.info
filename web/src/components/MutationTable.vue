<template>
<div class="d-flex flex-column w-100 align-items-center mt-3">

  <h5 class="">{{ tableTitle }}</h5>
  <svg :width="width" :height="height" class="characteristic_mutations" :name="title" ref="mut_bars_svg">
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="mut_bars"></g>
    <!-- <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-x axis--x" ref="xAxisTop"></g> -->
    <!-- <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxisBottom"></g> -->
  </svg>

  <small class="my-3">
    <button class="btn btn-main-outline">view more mutations</button>
  </small>

</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";


import cloneDeep from "lodash/cloneDeep";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  format
} from "d3";

export default Vue.extend({
  name: "MutationTable",
  props: {
    data: Array,
    colorScale: Function,
    lineageName: String,
    tableTitle: String,
    width: {
      type: Number,
      default: 400
    },
    fillColor: {
      type: String,
      default: "#bab0ab"
    },
    thresholdColor: {
      type: String,
      default: "#e15759"
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
    }
  },
  computed: {
    ...mapState("genomics", ["characteristicThreshold"]),
    title() {
      return (`Characteristic mutations in ${this.lineageName}`)
    }
  },
  data() {
    return {
      margin: {
        top: 30,
        bottom: 30,
        left: 150,
        right: 35
      },
      numXTicks: 4,
      bandwidth: 25,
      height: null,
      // axes
      x: null,
      y: null,
      paddingInner: 0.25,
      // refs
      chart: null,
      // data
      plottedData: null,
      // forms
      sortVar: "prevalence"
    }
  },
  methods: {
    setupPlot() {
      this.chart = select(this.$refs.mut_bars);
    },
    updatePlot: function() {
      if (this.data) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    updateAxes() {
      this.plottedData = cloneDeep(this.data);
      this.plottedData.sort((a, b) => a[this.sortVar] > b[this.sortVar] ? -1 : 1);

      this.height = this.bandwidth * this.plottedData.length * (1 + this.paddingInner);

      this.x = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, 1]);

      this.y = scaleBand()
        .paddingInner(this.paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.plottedData.map(d => d.mutation));

    },
    drawPlot() {
      const geneX = -75;
      const mutationX = -5;
      const yHeader = -10;

      this.chart.append("text")
        .attr("class", "th")
        .attr("x", 0)
        .attr("dx", geneX)
        .attr("y", 0)
        .attr("dy", yHeader)
        .text("gene")
        .style("fill", "#555")
        .style("font-size", 14)
        .style("dominant-baseline", "central")
        .style("text-anchor", "end");

      this.chart.append("text")
        .attr("class", "th")
        .attr("x", 0)
        .attr("dx", mutationX)
        .attr("y", 0)
        .attr("dy", yHeader)
        .text("mutation")
        .style("fill", "#555")
        .style("dominant-baseline", "central")
        .style("font-size", 14)
        .style("text-anchor", "end");

      this.chart.append("text")
        .attr("class", "th")
        .attr("x", this.width - this.margin.left - this.margin.right)
        .attr("y", 0)
        .attr("dy", yHeader)
        .text("prevalence in lineage")
        .style("fill", "#555")
        .style("dominant-baseline", "central")
        .style("font-size", 14)
        .style("text-anchor", "end");

      const mutSelector = this.chart
        .selectAll("mutation-group")
        .data(this.plottedData);

      mutSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("class", "mutation-group")
            .attr("id", d => d.id);

          grp.append("rect")
            .attr("class", "hundred-percent")
            .attr("x", this.x(0))
            .attr("y", d => this.y(d.mutation))
            .attr("width", d => this.x(1) - this.x(0))
            .attr("height", this.y.bandwidth())
            .style("fill", "none")
            .style("stroke", this.fillColor)
            .style("stroke", this.fillColor)
            .style("stroke-width", 0.75)

          grp.append("rect")
            .attr("class", "prevalence")
            .attr("x", this.x(0))
            .attr("y", d => this.y(d.mutation))
            .attr("width", d => this.x(d.prevalence) - this.x(0))
            .attr("height", this.y.bandwidth())
            .style("fill", this.fillColor);

          grp.append("text")
            .attr("class", "gene")
            .attr("x", 0)
            .attr("dx", geneX)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text(d => d.gene)
            .style("fill", d => this.colorScale(d.gene))
            .style("font-weight", 700)
            .style("dominant-baseline", "central")
            .style("text-anchor", "end");

          grp.append("text")
            .attr("class", "mutation")
            .attr("x", 0)
            .attr("dx", mutationX)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text(d => d.type == "substitution" ? `${d.ref_aa}${d.codon_num}${d.alt_aa}` : `${d.mutation.split(":")[-1].toUpperCase()}`)
            .style("fill", "#555")
            // .style("fill", d => this.colorScale(d.gene))
            // .style("font-weight", 700)
            .style("dominant-baseline", "central")
            .style("text-anchor", "end");

          grp.append("text")
            .attr("class", "annotation")
            .attr("x", this.width - this.margin.left - this.margin.right)
            .attr("dx", 10)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text(d => format(".0%")(d.prevalence))
            .style("font-size", 13)
            .style("fill", this.fillColor)
            .style("dominant-baseline", "central")
            .style("text-anchor", "start");
        }
      )

      const thresholdExtension = 2;
      const thresholdX = -7;
      const thresholdY = 18;
      this.chart
        .append("line")
        .attr("x1", this.x(this.characteristicThreshold))
        .attr("x2", this.x(this.characteristicThreshold))
        .attr("y1", -1*thresholdExtension)
        .attr("y2", this.height - this.margin.top - this.margin.bottom + thresholdExtension)
        .style("stroke", this.thresholdColor)
        .style("stroke-width", 1)
        .style("stroke-dasharray", "4,4")

      this.chart
        .append("polyline")
        .attr("points", `${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom} ${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom + thresholdY} ${this.x(this.characteristicThreshold) + thresholdX},${this.height - this.margin.top - this.margin.bottom + thresholdY}`)
        .style("fill", "none")
        .style("stroke", this.thresholdColor)
        .style("stroke-width", 1)

      this.chart
        .append("text")
        .attr("x", this.x(this.characteristicThreshold))
        .attr("y", this.height - this.margin.top - this.margin.bottom + thresholdY)
        .attr("dx", -3 + thresholdX)
        .text(`characteristic threshold (${format(".0%")(this.characteristicThreshold)})`)
        .style("text-anchor", "end")
        .style("font-size", 14)
        .style("dominant-baseline", "central")
        .style("fill", this.thresholdColor)
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
</script>

<style lang="scss" scoped>
.checkbook td {
    padding: 0.5rem;
}

.checkbook tr:nth-child(2n+1) {
    background-color: $lightback;
}
</style>
