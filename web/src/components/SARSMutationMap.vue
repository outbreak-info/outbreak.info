<template>
<div class="" id="mutation-map">
  <svg :width="width" :height="height" ref="svg">
    <g ref="gene_map" id="gene-map-group">
      <g ref="genes" class="genes" id="gene-group"></g>
      <!-- <g ref="nucleotide_axis" class="axis axis--x"></g> -->
      <!-- <g ref="aminoacid_axis" class="axis axis--x"></g> -->
      <g ref="aminoacids" class="mutations mutations--aa" id="aa-mutation-group"></g>
      <g ref="deletions" class="mutations deletions--aa" id="aa-deletion-group"></g>
      <g ref="brush" class="brush" id="brush-zoom"></g>
    </g>
  </svg>

  <div ref="tooltip_mutation" class="tooltip box-shadow" id="tooltip-mutation">
    <h5>
    </h5>
  </div>
  <div ref="tooltip_gene" class="tooltip box-shadow" id="tooltip-gene">
    <h5>
    </h5>
    <div id="gene-mutations" class="m-0">
      <h6 class="m-0">
        Mutations
      </h6>
      <ul id="mutation-list">
      </ul>
    </div>
    <div id="gene-deletions">
      <h6 class="m-0">
        Deletions
      </h6>
      <ul id="deletion-list" class="m-0">
      </ul>
    </div>
  </div>
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
  scaleOrdinal,
  brushX,
  event,
  transition,
  forceCollide,
  forceSimulation,
  forceX
} from "d3";

import {
  cloneDeep
} from "lodash";

import chroma from "chroma-js";

import {
  schemeTableau10
} from "d3-scale-chromatic";

export default Vue.extend({
  name: "SARSMutationMap",
  props: {
    mutationKey: String,
    setWidth: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: 90
    }
  },
  watch: {
    width() {
      this.updatePlot();
    }
  },
  computed: {
    width() {
      return this.setWidth ? this.setWidth : this.maxWidth;
    },
    hasMutations() {
      return (this.mutations || DELETIONS[this.mutationKey])
    }
  },
  data() {
    return {
      margin: {
        top: 2,
        right: 10,
        bottom: 2,
        left: 10
      },
      maxWidth: null,
      geneHeight: 25,
      mutationHeight: 55,
      aaCircleR: 9,
      geneDisplayThresh: 35,
      // data
      mutations: null,
      deletions: null,
      // refs
      svg: null,
      genes: null,
      aas: null,
      brush: null,
      deletionRef: null,
      xAmino: scaleLinear(),
      xAminoAxis: null,
      geneColorScale: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
  methods: {
    setupPlot() {
      this.mutations = MUTATIONS[this.mutationKey];
      this.deletions = DELETIONS[this.mutationKey];

      this.$nextTick(function() {
        window.addEventListener("resize", this.setDims);
        // set initial dimensions for the plots.
        this.setDims();
      });

      this.setDims();

      this.svg = select(this.$refs.svg);
      select(this.$refs.gene_map)
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      this.genes = select(this.$refs.genes)
        .attr("transform", `translate(0,${this.mutationHeight})`);

      this.aas = select(this.$refs.aminoacids)
        .attr("transform", `translate(0,22)`);

      this.deletionRef = select(this.$refs.deletions)
        .attr("transform", `translate(0,18)`);

      select(this.$refs.brush).on("mousemove", () => this.tooltipOn(this.xAmino))
      select(this.$refs.brush).on("mouseleave", this.tooltipOff)

      // Add another class for the last of the SARS-CoV-2 genes
      schemeTableau10.push("#555555");
    },
    setDims() {
      this.maxWidth = document.getElementById('mutation-map') ? document.getElementById('mutation-map').offsetWidth : 1000;
      console.log(this.maxWidth)
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

      // Update brush so it spans the whole of the area
      this.brush = brushX()
        .extent([
          [0, 0],
          [this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]
        ])
        .on("end", this.zoom);

      select(this.$refs.brush)
        .call(this.brush)
        // .call(brush.move, [3, 5].map(x))
        .on("dblclick", this.resetAxis);
    },
    tooltipOn() {
      if (this.hasMutations) {
        // Tooltip activation is a bit complicated, since I want to be able to zoom as well into the gene map.
        // That has to have a rect on top of everything which detects the pointer events.
        // So, splitting that rect into two halves; upper half is the mutation groups; lower half is the gene itself
        if (event.offsetY < this.mutationHeight) {
          // UPPER HALF: mutations and deletions
          let muts = cloneDeep(MUTATIONS[this.mutationKey]);
          muts.forEach(d => {
            d["tooltipDiff"] = Math.abs(event.offsetX - d.x);
          })
          muts.sort((a, b) => a.tooltipDiff - b.tooltipDiff);

          const selectedMut = muts[0];

          // turn off mutations / other ttip
          this.svg.selectAll(".aa-mutation")
            .style("opacity", 0.3);

          select(this.$refs.tooltip_gene).style("display", "none");

          // turn on selected mutations
          this.svg.selectAll(`#mutation_${selectedMut.gene}${selectedMut.aa_location}`)
            .style("opacity", 1);

          // tooltip on
          let ttip = select(this.$refs.tooltip_mutation);
          // edit text
          ttip.select("h5")
            .style("color", this.geneColorScale(selectedMut.gene))
            .html(`<b>${selectedMut.aa_original}${selectedMut.aa_location}${selectedMut.aa_new}</b> | ${this.mutationKey} | ${selectedMut.gene} gene`);

          ttip
            .style("left", `${event.clientX}px`)
            .style("border-color", this.geneColorScale(selectedMut.gene))
            .style("background", chroma(this.geneColorScale(selectedMut.gene)).luminance(0.8))
            .style("display", "block");

        } else {
          // LOWER HALF: gene map
          const selectedX = this.xAmino.invert(event.offsetX);
          const selectedGenes = AA_MAP.filter(d => d.startNum <= selectedX && d.stopNum >= selectedX);

          if (selectedGenes.length === 1) {
            const selectedGene = selectedGenes[0].gene;

            const selectedMutations = MUTATIONS[this.mutationKey] ? MUTATIONS[this.mutationKey].filter(d => d.gene == selectedGene) : [];
            const selectedDeletions = DELETIONS[this.mutationKey] ? DELETIONS[this.mutationKey].filter(d => d.gene == selectedGene) : [];

            // turn genes off
            select(this.$refs.tooltip_mutation).style("display", "none");

            this.svg.selectAll(".gene")
              .style("opacity", 0.3);
            // turn selected gene on
            this.svg.select(`#${selectedGene}`)
              .style("opacity", 1);

            // tooltip on
            let ttip = select(this.$refs.tooltip_gene);
            // edit text
            ttip.select("h5")
              .style("color", this.geneColorScale(selectedGene))
              .text(`${this.mutationKey} | ${selectedGene} gene`)

            const mutList = ttip.select("ul#mutation-list").selectAll("li").data(selectedMutations);
            mutList.join(enter => {
                enter.append("li")
                  .text(d => `${d.aa_original}${d.aa_location}${d.aa_new}`)
              },
              update => {
                update.text(d => `${d.aa_original}${d.aa_location}${d.aa_new}`)
              },
              exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
            )

            const delList = ttip.select("ul#deletion-list").selectAll("li").data(selectedDeletions);
            delList.join(enter => {
                enter.append("li")
                  .text(d => `${d.del_start}-${d.del_end}`)
              },
              update => {
                update.text(d => `${d.del_start}-${d.del_end}`)
              },
              exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
            )

            ttip
              .style("left", `${event.clientX}px`)
              .style("border-color", this.geneColorScale(selectedGene))
              .style("background", chroma(this.geneColorScale(selectedGene)).luminance(0.8))
              .style("display", "block");
          }
        }
      }
    },
    tooltipOff() {
      selectAll(".aa-mutation")
        .style("opacity", 1);

      selectAll(".gene")
        .style("opacity", 1);

      select(this.$refs.tooltip_mutation).style("display", "none");
      select(this.$refs.tooltip_gene).style("display", "none");
    },
    zoom() {
      // reset domain to new coords
      const selection = event.selection;
      if (selection) {
        const newMin = this.xAmino.invert(selection[0]);
        const newMax = this.xAmino.invert(selection[1]);
        this.xAmino = this.xAmino.domain([newMin, newMax]);
        // update axis for tooltip rollover
        select(".brush").on("mousemove", () => this.tooltipOn())
        this.svg.select(".brush").call(this.brush.move, null);
        this.drawPlot();
      }

    },
    resetAxis() {
      this.xAmino = this.xAmino.domain([0, max(AA_MAP, d => d.stopNum)]);
      this.drawPlot();
    },
    drawPlot() {
      if (this.hasMutations) {
        const t1 = transition().duration(1500);

        // --- GENE MAP: constant for all maps ---
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
              .attr("width", d => this.xAmino(d.stopNum + 1) - this.xAmino(d.startNum))
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
          },
          update => {
            update
              .selectAll("rect")
              .transition(t1)
              .attr("x", d => this.xAmino(d.startNum))
              .attr("width", d => this.xAmino(d.stopNum + 1) - this.xAmino(d.startNum))
              .style("fill", d => this.geneColorScale(d.gene))

            update
              .selectAll("text")
              .text(d => this.xAmino(d.stopNum) - this.xAmino(d.startNum) > this.geneDisplayThresh ? d.gene : "")
              .transition(t1)
              .attr("x", d => (this.xAmino(d.stopNum) + this.xAmino(d.startNum)) / 2)
              .style("opacity", d => this.xAmino(d.stopNum) - this.xAmino(d.startNum) > this.geneDisplayThresh ? 1 : 0);
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )

        // --- AMINO ACID MUTATIONS ---
        let aaMutationSelector = this.aas.selectAll(".aa-mutation")
          .data(this.mutations);

        // Add force direction to avoid overlap
        this.mutations.forEach(d => {
          d["fy"] = 0;
          d["targetX"] = this.xAmino(d.aa_location + d.gene_offset)
        });

        // Define a custom force
        const forceClamp = (min, max) => {
          let nodes;
          const force = () => {
            nodes.forEach(n => {
              if (n.x > max) n.x = max;
              if (n.x < min) n.x = min;
            });
          };
          force.initialize = _ => (nodes = _);
          return force;
        };

        // Set up the force simulation
        const force = forceSimulation()
          .nodes(this.mutations)
          .force("collide", forceCollide(this.aaCircleR + 1.5).strength(0.1))
          .force("x", forceX(d => d.targetX).strength(1))
          // clamp within bounds of the axes. Gets weird when you're zooming in.
          // .force("clamp", forceClamp(0, this.width - this.margin.left - this.margin.right))
          .stop();

        // Execute the simulation
        for (let i = 0; i < 300; i++) force.tick();

        // Tag if it moved:
        this.mutations.forEach(d => {
          d["adjustedX"] = Math.abs(d.vx) > 1e-6;
        })

        const labelY = this.aaCircleR * 2 + 7;
        const shiftedLabelY = this.aaCircleR + 3;
        const circleAdjY = -this.aaCircleR + 4;

        aaMutationSelector.join(
          enter => {
            let aaGrp = enter.append("g")
              .attr("class", "aa-mutation")
              .attr("id", d => `mutation_${d.gene}${d.aa_location}`);

            // leader lines
            aaGrp
              .append("path")
              .attr("class", "aa-mutation-leader")
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")

            aaGrp
              .append("circle")
              .attr("class", "leader-terminus")
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)
              .attr("r", 1.8)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")

            // circles for mutations
            aaGrp
              .append("circle")
              .attr("class", "aa-mutation-circle")
              .attr("r", this.aaCircleR)
              .attr("cy", d => d.adjustedX ? circleAdjY : this.aaCircleR)
              .attr("cx", d => d.x)
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))
              .style("fill-opacity", 0.8);

            // position locations
            aaGrp
              .append("text")
              .attr("class", "aa-mutation-text aa-mutation-location")
              .attr("y", this.aaCircleR * 2 + 7)
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY)
              .attr("x", d => d.x)
              .text(d => d.aa_location)
              .style("font-size", "0.6rem")

            // amino acid change text
            aaGrp
              .append("text")
              .attr("class", "aa-mutation-text aa-mutation-change")
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? circleAdjY : this.aaCircleR)
              .style("font-weight", 600)
              .style("fill", "white")
              .style("font-family", d => d.aa_new == "_" || d.aa_new == "*" ? "'Font Awesome 5 Free'" : "inherit")
              .style("font-size", "0.85rem")
              .text(d => d.aa_new == "_" || d.aa_new == "*" ? "\uf28d" : d.aa_new)
          },
          update => {
            // leader lines
            update
              .selectAll(".aa-mutation-leader")
              .classed("hidden", d => !d.adjustedX)
              .transition(t1)
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`);

            update
              .selectAll(".leader-terminus")
              .transition(t1)
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)
              .style("opacity", d => d.adjustedX ? 1 : 0)

            // circles for mutations
            update
              .selectAll(".aa-mutation-circle")
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))

              .transition(t1)
              .attr("cx", d => d.x)
              .attr("cy", d => d.adjustedX ? circleAdjY : this.aaCircleR);


            // text: mutation codon position
            update
              .selectAll(".aa-mutation-location")
              .text(d => d.aa_location)
              .transition(t1)
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY);

            // text: amino acid change
            update
              .selectAll(".aa-mutation-change")
              .style("font-family", d => d.aa_new == "_" || d.aa_new == "*" ? "'Font Awesome 5 Free'" : "inherit")
              .text(d => d.aa_new == "_" || d.aa_new == "*" ? "\uf28d" : d.aa_new)
              .transition(t1)
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? circleAdjY : this.aaCircleR);
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )

        let aaDeletionSelector = this.deletionRef.selectAll(".aa-deletion")
          .data(DELETIONS[this.mutationKey]);

        aaDeletionSelector.join(
          enter => {
            let aaGrp = enter.append("g")
              .attr("class", "aa-deletion")
              .attr("id", d => `${d.gene}${d.del_start}_${d.del_end}`);

            aaGrp.append("rect")
              .attr("class", "aa-deletion-rect")
              .attr("x", d => this.xAmino(d.del_start + d.gene_offset))
              .attr("width", d => this.xAmino(d.del_end + d.gene_offset + 1) - this.xAmino(d.del_start + d.gene_offset))
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
              .style("font-size", "0.85rem")
              .text(d => "\u0394")
          },
          update => {
            update.selectAll("rect")
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))
              .transition(t1)
              .attr("x", d => this.xAmino(d.del_start + d.gene_offset))
              .attr("width", d => this.xAmino(d.del_end + d.gene_offset + 1) - this.xAmino(d.del_start + d.gene_offset));

            update
              .selectAll("text")
              .text(d => "\u0394")
              .transition(t1)
              .attr("x", d => this.xAmino((d.del_start + d.del_end) / 2 + d.gene_offset));
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )
      }
    }
  }
})
</script>

<style lang="scss">
.gene rect {
    stroke: $base-grey;
    stroke-width: 0.5;
    shape-rendering: crispedges;
}

.aa-mutation-leader {
    stroke: $grey-60;
    stroke-width: 1;
    shape-rendering: crispedges;
    fill: none;
}

.leader-terminus {
    stroke: none;
    fill: $grey-90;
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

#tooltip-gene,
#tooltip-mutation {
    background-color: #fff;
    padding: 7px;
    border: 1px solid;
    border-radius: 3px;
    opacity: 0.95;
    position: absolute;
    display: none;
}
</style>
