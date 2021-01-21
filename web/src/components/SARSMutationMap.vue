<template>
<div>
  <svg :width="width" :height="height" ref="svg">
    <g ref="genes" class="genes"></g>
    <g ref="nucleotide_axis" class="axis axis--x"></g>
    <g ref="aminoacid_axis" class="axis axis--x"></g>
    <g ref="aminoacids" class="mutations mutations--aa"></g>
    <g ref="deletions" class="mutations deletions--aa"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

// import AA from "@/assets/genomics/sarscov2_aa.json";
import AA_MAP from "@/assets/genomics/sarscov2_aa_gene_map.json";
import MUTATIONS from "@/assets/genomics/sarscov2_mutations.json";
import DELETIONS from "@/assets/genomics/sarscov2_deletions.json";

import {
  select,
  selectAll,
  scaleLinear,
  min,
  max,
  map,
  scaleOrdinal
} from "d3";

import {
  schemeTableau10
} from "d3-scale-chromatic";

export default Vue.extend({
  name: "SARSMutationMap",
  props: {
    width: {
      type: Number,
      default: 1800
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
      geneHeight: 25,
      mutationHeight: 55,
      aaCircleR: 9,
      geneDisplayThresh: 50,
      // refs
      svg: null,
      genes: null,
      aas: null,
      deletions: null,
      xAmino: scaleLinear(),
      xAminoAxis: null,
      geneColorScale: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.svg).attr("transform", `translate(${this.margin.left},${this.margin.top})`);
      this.genes = select(this.$refs.genes)
        .attr("transform", `translate(0,${this.mutationHeight})`);

      this.aas = select(this.$refs.aminoacids)
        .attr("transform", `translate(0,22)`);

      this.deletions = select(this.$refs.deletions)
        .attr("transform", `translate(0,18)`);

      // Add another class for the last of the SARS-CoV-2 genes
      schemeTableau10.push("#555555");
    },
    updatePlot() {
      this.updateScales();
      this.drawPlot()
    },
    updateScales() {
      this.xAmino = this.xAmino
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, max(AA_MAP, d => d.stopNum)]);

      let geneNames = AA_MAP.sort((a, b) => a.gene_order - b.gene_order).map(d => d.gene);

      this.geneColorScale = scaleOrdinal(schemeTableau10).domain(geneNames);
    },
    drawPlot() {
      let geneSelector =
        this.genes.selectAll(".gene")
        .data(AA_MAP);

      geneSelector.join(
        enter => {
          let geneGrp = enter.append("g")
            .attr("class", "gene")
            .attr("id", d => d.gene);

          geneGrp.append("rect")
            .attr("x", d => this.xAmino(d.startNum))
            .attr("width", d => this.xAmino(d.stopNum) - this.xAmino(d.startNum))
            .attr("y", 0)
            .attr("height", this.geneHeight)
            .style("fill-opacity", 0.40)
            .style("fill", d => this.geneColorScale(d.gene))

          geneGrp.append("text")
            .attr("x", d => (this.xAmino(d.stopNum) + this.xAmino(d.startNum)) / 2)
            .attr("y", (this.geneHeight + 1) / 2)
            .attr("class", "gene-name")
            .text(d => this.xAmino(d.stopNum) - this.xAmino(d.startNum) > this.geneDisplayThresh ? d.gene : "")
          // .style("fill", "white")
        }
      )


      let aaMutationSelector = this.aas.selectAll(".aa-mutation")
        .data(MUTATIONS["B.1.1.7"]);

      aaMutationSelector.join(
        enter => {
          let aaGrp = enter.append("g")
            .attr("class", "aa-mutation")
            .attr("id", d => `${d.gene}${d.aa_location + d.gene_offset}`);

          aaGrp
            .append("circle")
            .attr("class", "aa-mutation-circle")
            .attr("r", this.aaCircleR)
            .attr("cy", this.aaCircleR)
            .attr("cx", d => this.xAmino(d.aa_location + d.gene_offset))
            .style("fill", d => this.geneColorScale(d.gene))
            .style("stroke", d => this.geneColorScale(d.gene))
            .style("fill-opacity", 0.9);

          aaGrp
            .append("text")
            .attr("class", "aa-mutation-text")
            .attr("y", this.aaCircleR * 2 + 7)
            .attr("x", d => this.xAmino(d.aa_location + d.gene_offset))
            .text(d => d.aa_location)
            .style("font-size", "0.65rem")

          aaGrp
            .append("text")
            .attr("class", "aa-mutation-text")
            .attr("y", this.aaCircleR)
            .attr("x", d => this.xAmino(d.aa_location + d.gene_offset))
            .style("font-weight", 600)
            .style("fill", "white")
            .style("font-family", d => d.aa_new == "_" ? "'Font Awesome 5 Free'" : "inherit")
            .style("font-size", "0.85rem")
            .text(d => d.aa_new == "_" ? "\uf28d" : d.aa_new)
        }
      )

      let aaDeletionSelector = this.deletions.selectAll(".aa-deletion")
        .data(DELETIONS["B.1.1.7"]);

      aaDeletionSelector.join(
        enter => {
          let aaGrp = enter.append("g")
            .attr("class", "aa-deletion")
            .attr("id", d => `${d.gene}${d.del_start}_${d.del_end}`);

          aaGrp.append("rect")
            .attr("class", "aa-deletion-rect")
            .attr("x", d => this.xAmino(d.del_start + d.gene_offset))
            .attr("width", d => this.xAmino(d.del_end + d.gene_offset) - this.xAmino(d.del_start + d.gene_offset) + 0.1)
            .attr("y", 0)
            .attr("height", 7)
            .style("fill", d => this.geneColorScale(d.gene))
            .style("stroke", d => this.geneColorScale(d.gene));

          aaGrp
            .append("text")
            .attr("class", "aa-mutation-text")
            .attr("y", -10)
            .attr("x", d => this.xAmino((d.del_start + d.del_end) / 2 + d.gene_offset))
            .style("font-weight", 600)
            .style("fill", d => this.geneColorScale(d.gene))
            .style("font-family", d => d.aa_new == "_" ? "'Font Awesome 5 Free'" : "inherit")
            .style("font-size", "0.85rem")
            .text(d => "\u0394")

        })
    }
  }
})
</script>

<style lang="scss">
rect {
    stroke: $base-grey;
    stroke-width: 0.5;
}
.aa-mutation-text,
.deletion-symbol,
.gene-name {
    dominant-baseline: central;
    text-anchor: middle;
}

.aa-mutation-circle {
    stroke-width: 0.75;
}

.aa-deletion-rect {
    stroke: 1 !important;
}
</style>
