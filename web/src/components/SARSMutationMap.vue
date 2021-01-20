<template>
<div>
  <svg :width="width" :height="height" ref="svg">
    <g ref="genes" class="genes"></g>
    <g ref="nucleotide_axis" class="axis axis--x"></g>
    <g ref="aminoacid_axis" class="axis axis--x"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

// import AA from "@/assets/genomics/sarscov2_aa.json";
import AA_MAP from "@/assets/genomics/sarscov2_aa_gene_map.json";
import MUTATIONS from "@/assets/genomics/sarscov2_mutations.json";

import {
  select,
  selectAll,
  scaleLinear,
  min,
  max,
  map, scaleOrdinal
} from "d3";

import { schemeTableau10 } from "d3-scale-chromatic";

export default Vue.extend({
  name: "SARSMutationMap",
  props: {
    width: {
      type: Number,
      default: 1200
    },
    height: {
      type: Number,
      default: 150
    }
  },
  data() {
    return {
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      geneHeight: 30,
      mutationHeight: 100,
      // refs
      svg: null,
      genes: null,
      xAmino: scaleLinear(),
      xAminoAxis: null,
      geneColorScale: null
    }
  },
  mounted() {
    this.setupPlot();
    this.drawPlot();
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.svg).attr("transform", `translate(${this.margin.left},${this.margin.top})`);
      this.genes = select(this.$refs.genes)
      .attr("transform", `translate(0,${this.mutationHeight})`);

      console.log(AA_MAP)
      console.log(MUTATIONS)

      this.xAmino = this.xAmino
      .range([0, this.width - this.margin.left - this.margin.right])
      .domain([0, max(AA_MAP, d => d.stopNum)]);

      let geneNames = AA_MAP.sort((a,b) => a.gene_order - b.gene_order).map(d => d.gene);

      schemeTableau10.push("#555555");
      this.geneColorScale = scaleOrdinal(schemeTableau10).domain(geneNames);


    },
    drawPlot() {
    let geneSelector =
    this.genes.selectAll(".gene")
    .data(AA_MAP);

    geneSelector.join(
      enter => {
        let geneGrp = enter.append("g")
        .attr("id", d => d.gene);

        geneGrp.append("rect")
        .attr("x", d => this.xAmino(d.startNum))
        .attr("width", d => this.xAmino(d.stopNum) - this.xAmino(d.startNum))
        .attr("y", 0)
        .attr("height", this.geneHeight)
        .style("fill", d => this.geneColorScale(d.gene))

        geneGrp.append("text")
        .attr("x", d => (this.xAmino(d.stopNum) + this.xAmino(d.startNum))/2)
        .attr("y", (this.geneHeight+1)/2)
        .attr("class", "gene-name")
        .text(d => d.gene)
        .style("fill", "white")
      }
    )
    }
  }
})
</script>

<style lang="scss">

rect {
  stroke: $base-grey;
  stroke-width: 0.5;
}
.gene-name {
  dominant-baseline: central;
  text-anchor: middle;
}
</style>
