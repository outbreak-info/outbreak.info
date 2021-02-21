<template>
<div class="" id="mutation-map" ref="svg_wrapper">
  <svg :width="width" :height="height" ref="svg" :class="[copyable ? 'mutation-map' : 'mutation_map']" :name="`${mutationKey} characteristic mutations`">
    <g ref="gene_map" id="gene-map-group">
      <g ref="genes" class="genes" id="gene-group"></g>
      <!-- <g ref="nucleotide_axis" class="axis axis--x"></g> -->
      <g ref="substitutions" class="mutations substitutions" id="substitution-group"></g>
      <g ref="deletions" class="mutations deletions" id="deletion-group"></g>
      <g ref="brush" class="brush" id="brush-zoom" v-if="mutationArr"></g>
    </g>
  </svg>

  <div ref="tooltip_mutation" class="tooltip box-shadow" id="tooltip-mutation">
    <h5>
    </h5>
  </div>
  <div ref="tooltip_gene" class="tooltip box-shadow" id="tooltip-gene">
    <h5>
    </h5>
    <div id="gene-mutations" class="m-0 mb-2">
      <h6 class="m-0">
        Mutations
      </h6>
      <em id="no-substitutions">none</em>
      <ul id="mutation-list" class="m-0">
      </ul>
    </div>
    <div id="gene-deletions">
      <h6 class="m-0">
        Deletions
      </h6>
      <em id="no-deletions">none</em>
      <ul id="deletion-list" class="m-0">
      </ul>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import NT_MAP from "@/assets/genomics/sarscov2_NC045512_genes_nt.json";

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

export default Vue.extend({
  name: "SARSMutationMap",
  props: {
    mutationKey: String,
    copyable: {
      type: Boolean,
      default: false
    },
    lineageMutations: Array,
    additionalMutations: Array,
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
    },
    lineageMutations() {
      this.setupMutationArr();
      this.updatePlot();
    },
    additionalMutations() {
      this.setupMutationArr();
      this.updatePlot();
    }
  },
  computed: {
    width() {
      return this.setWidth ? this.setWidth : this.maxWidth;
    }
  },
  data() {
    return {
      margin: {
        top: 4,
        right: 25,
        bottom: 2,
        left: 15
      },
      maxWidth: null,
      geneHeight: 25,
      mutationHeight: 55,
      aaCircleR: 9,
      geneDisplayThresh: 35,
      // data
      ntMapArr: null,
      mutationArr: null,
      mutations: null,
      deletions: null,
      // refs
      svg: null,
      genes: null,
      brush: null,
      substitutionRef: null,
      deletionRef: null,
      // scales
      x: scaleLinear(),
      xAxis: null,
      geneColorScale: scaleOrdinal(
        ["#bab0ab", // lt grey -- UTRs
          "#1f77b4", // dk blue
          "#aec7e8", // lt blue
          "#f28e2c", // orange
          "#e15759", // red
          "#9edae5", // teal
          "#59a14f", // green
          "#edc949", // yellow
          "#9467bd", // purple
          "#ff9da7", // pink
          "#8c564b", // brown
          "#555555", // grey
          "#bcbd22", // puce
          "#bab0ab"
        ]),
    }
  },
  mounted() {
    // convert object of nucleotides into an array
    this.ntMapArr = Object.entries(NT_MAP).map(d => {
      return {
        gene: d[0],
        start: d[1].start,
        end: d[1].end
      }
    })

    this.setupMutationArr();
    this.setupPlot();
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
  methods: {
    setupMutationArr() {
      if (!this.lineageMutations && this.additionalMutations)
        this.mutationArr = cloneDeep(this.additionMutations);
      else if (this.lineageMutations && this.additionalMutations) {
        this.mutationArr = cloneDeep(this.lineageMutations);
        this.mutationArr.push(...this.additionalMutations);
      } else if (this.lineageMutations) {
        this.mutationArr = cloneDeep(this.lineageMutations);
      } else {
        this.mutationArr = null;
      }
    },
    setupPlot() {
      this.$nextTick(function() {
        window.addEventListener("resize", this.setDims);

        // set initial dimensions for the plots.
        this.setDims();
      });


      this.svg = select(this.$refs.svg);
      select(this.$refs.gene_map)
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      this.genes = select(this.$refs.genes)
        .attr("transform", `translate(0,${this.mutationHeight})`);

      this.substitutionRef = select(this.$refs.substitutions)
        .attr("transform", `translate(0,22)`);

      this.deletionRef = select(this.$refs.deletions)
        .attr("transform", `translate(0,22)`);

      select(this.$refs.brush).on("mousemove", () => this.tooltipOn(this.x))
      select(this.$refs.brush).on("mouseleave", this.tooltipOff)
    },
    setDims() {
      const wrapper = select(this.$refs.svg_wrapper).node();
      this.maxWidth = wrapper ? wrapper.offsetWidth : 1000;
    },
    updatePlot() {
      if(!this.width) {
        this.setDims();
      }
      this.updateScales();
      this.drawPlot();
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, max(this.ntMapArr, d => d.end)]);

      let geneNames = this.ntMapArr.sort((a, b) => a.start - b.start).map(d => d.gene);

      this.geneColorScale = this.geneColorScale.domain(geneNames);

      // Update brush so it spans the whole of the area
      this.brush = brushX()
        .extent([
          [0, 0],
          [this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]
        ])
        .on("end", this.zoom);

      select(this.$refs.brush)
        .call(this.brush)
        .on("dblclick", this.resetAxis);
    },
    tooltipOn() {
      const ttipXOffset = 35;
      const ttipYOffset = 125;
      if (this.mutationArr && this.mutationArr.length) {
        // Tooltip activation is a bit complicated, since I want to be able to zoom as well into the gene map.
        // That has to have a rect on top of everything which detects the pointer events.
        // So, splitting that rect into two halves; upper half is the mutation groups; lower half is the gene itself
        if (event.offsetY < this.mutationHeight) {
          const maxDiff = 25; // maximum allowable difference in pixels between the location of the symbol and the cursor
          // UPPER HALF: mutations and deletions
          let muts = cloneDeep(this.mutationArr);
          muts.forEach(d => {
            d["tooltipDiff"] = Math.abs(event.offsetX - d.x);
          })
          muts.sort((a, b) => a.tooltipDiff - b.tooltipDiff);

          muts = muts.filter(d => d.tooltipDiff <= maxDiff);

          const selectedMut = muts.length ? muts[0] : null;

          if (selectedMut) {
            // turn off mutations / other ttip
            this.svg.selectAll(".substitution")
              .style("opacity", 0.3);

            this.svg.selectAll(".deletion")
              .style("opacity", 0.3);

            select(this.$refs.tooltip_gene).style("display", "none");

            // turn on selected mutations
            this.svg.selectAll(`#mutation_${selectedMut.gene}${selectedMut.codon_num}`)
              .style("opacity", 1);

            // tooltip on
            let ttip = select(this.$refs.tooltip_mutation);
            // edit text
            const ttipText = selectedMut.type == "deletion" ? `<b>${selectedMut.mutation.split(":")[1]}</b> | ${this.mutationKey} | ${selectedMut.gene} gene` :
              `<b>${selectedMut.ref_aa}${selectedMut.codon_num}${selectedMut.alt_aa}</b> | ${this.mutationKey} | ${selectedMut.gene} gene`
            ttip.select("h5")
              .style("color", this.geneColorScale(selectedMut.gene))
              .html(ttipText);

            ttip
              .style("left", `${event.offsetX + ttipXOffset}px`)
              .style("top", `${event.offsetY + ttipYOffset}px`)
              .style("border-color", this.geneColorScale(selectedMut.gene))
              .style("background", chroma(this.geneColorScale(selectedMut.gene)).luminance(0.8))
              .style("display", "block");
          }

        } else {
          // LOWER HALF: gene map
          const selectedX = this.x.invert(event.offsetX);
          const selectedGenes = this.ntMapArr.filter(d => d.start <= selectedX && d.end >= selectedX);

          if (selectedGenes.length === 1) {
            const selectedGene = selectedGenes[0].gene;

            const selectedMutations = this.mutationArr.filter(d => d.gene == selectedGene);
            const selectedSubstitutions = selectedMutations.filter(d => d.type == "substitution");
            const selectedDeletions = selectedMutations.filter(d => d.type == "deletion");

            // turn genes off
            select(this.$refs.tooltip_mutation).style("display", "none");

            this.svg.selectAll(".gene")
              .style("opacity", 0.3);

            this.svg.selectAll(".substitution")
              .style("opacity", 0.3);

            this.svg.selectAll(".deletion")
              .style("opacity", 0.3);

            // turn selected gene on
            this.svg.selectAll(`.gene_${selectedGene}`)
              .style("opacity", 1);


            // tooltip on
            let ttip = select(this.$refs.tooltip_gene);
            // edit text
            ttip.select("h5")
              .style("color", this.geneColorScale(selectedGene))
              .text(`${this.mutationKey} | ${selectedGene} gene`)

            if (selectedSubstitutions.length) {
              ttip.select("#no-substitutions")
                .classed("hidden", true);
            } else {
              ttip.select("#no-substitutions")
                .classed("hidden", false);
            }

            if (selectedDeletions.length) {
              ttip.select("#no-deletions")
                .classed("hidden", true);
            } else {
              ttip.select("#no-deletions")
                .classed("hidden", false);
            }

            const mutList = ttip.select("ul#mutation-list").selectAll("li").data(selectedSubstitutions);
            mutList.join(enter => {
                enter.append("li")
                  .text(d => `${d.ref_aa}${d.codon_num}${d.alt_aa}`)
              },
              update => {
                update.text(d => `${d.ref_aa}${d.codon_num}${d.alt_aa}`)
              },
              exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
            )

            const delList = ttip.select("ul#deletion-list").selectAll("li").data(selectedDeletions);
            delList.join(enter => {
                enter.append("li")
                  .text(d => `${d.mutation.split(":")[1]}`)
              },
              update => {
                update.text(d => `${d.mutation.split(":")[1]}`)
              },
              exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
            )

            ttip
              .style("left", `${event.offsetX + ttipXOffset}px`)
              .style("top", `${event.offsetY + ttipYOffset}px`)
              .style("border-color", this.geneColorScale(selectedGene))
              .style("background", chroma(this.geneColorScale(selectedGene)).luminance(0.8))
              .style("display", "block");
          }
        }
      }
    },
    tooltipOff() {
      selectAll(".substitution")
        .style("opacity", 1);

      selectAll(".deletion")
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
        const newMin = this.x.invert(selection[0]);
        const newMax = this.x.invert(selection[1]);
        this.x = this.x.domain([newMin, newMax]);
        // update axis for tooltip rollover
        select(".brush").on("mousemove", () => this.tooltipOn())
        this.svg.select(".brush").call(this.brush.move, null);
        this.drawPlot();
      }

    },
    resetAxis() {
      this.x = this.x.domain([0, max(this.ntMapArr, d => d.end)]);
      this.drawPlot();
    },
    prepData() {
      if (this.mutationArr && this.mutationArr.length) {
        // 1) Convert amino acid coordinates into nucleotide coordinates
        // 2) Set up force direction to shift labels if they overlap

        // convert aa --> nucleotide coords
        this.mutationArr.forEach(d => {
          const gene = NT_MAP[d.gene];
          const gene_offset = gene ? gene.start : 0;
          // calculating center of the nucleotide
          d["pos_nt"] = d.pos ? d.pos : ((d.codon_num - 1) * 3 + gene_offset + 1);

          // set up for force direction
          d["fy"] = 0;
          d["targetX"] = this.x(d.pos_nt);
        })

        // Add force direction to avoid overlap
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
          .nodes(this.mutationArr)
          .force("collide", forceCollide(this.aaCircleR + 1.5).strength(0.1))
          .force("x", forceX(d => d.targetX).strength(1))
          // clamp within bounds of the axes. Gets weird when you're zooming in.
          // .force("clamp", forceClamp(0, this.width - this.margin.left - this.margin.right))
          .stop();

        // Execute the simulation
        for (let i = 0; i < 300; i++) force.tick();

        // Tag if it moved:
        this.mutationArr.forEach(d => {
          d["adjustedX"] = Math.abs(d.vx) > 1e-6;
        })
      }
    },
    drawPlot() {
      if (this.mutationArr && this.mutationArr.length) {
        const t1 = transition().duration(1500);

        this.prepData();

        // --- GENE MAP: constant for all maps ---
        let geneSelector =
          this.genes.selectAll(".gene")
          .data(this.ntMapArr);

        geneSelector.join(
          enter => {
            let geneGrp = enter.append("g")
              .attr("id", d => `gene_${d.gene}`)
              .attr("class", d => `gene gene_${d.gene}`);

            geneGrp.append("rect")
              .attr("x", d => this.x(d.start))
              .attr("width", d => this.x(d.end) - this.x(d.start))
              .attr("y", 0)
              .attr("height", this.geneHeight)
              .style("fill-opacity", 0.40)
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke-width", 0.5)
              .style("shape-rendering", "crispedges");

            geneGrp.append("text")
              .attr("x", d => (this.x(d.end) + this.x(d.start)) / 2)
              .attr("y", (this.geneHeight + 1) / 2)
              .attr("class", "gene-name")
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle")
              .text(d => this.x(d.end) - this.x(d.start) > this.geneDisplayThresh ? d.gene : "")
          },
          update => {
            update
              .attr("id", d => `gene_${d.gene}`)
              .attr("class", d => `gene gene_${d.gene}`);

            update
              .select("rect")
              .transition(t1)
              .attr("x", d => this.x(d.start))
              .attr("width", d => this.x(d.end) - this.x(d.start))
              .style("fill", d => this.geneColorScale(d.gene))

            update
              .select("text")
              .text(d => this.x(d.end) - this.x(d.start) > this.geneDisplayThresh ? d.gene : "")
              .transition(t1)
              .attr("x", d => (this.x(d.end) + this.x(d.start)) / 2)
              .style("opacity", d => this.x(d.end) - this.x(d.start) > this.geneDisplayThresh ? 1 : 0);
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )

        // --- SUBSTITUTIONS ---
        let substitutionSelector = this.substitutionRef.selectAll(".substitution")
          .data(this.mutationArr.filter(d => d.type == "substitution"));

        const labelY = this.aaCircleR * 2 + 7;
        const shiftedLabelY = this.aaCircleR + 3;
        const circleAdjY = -this.aaCircleR + 4;

        substitutionSelector.join(
          enter => {
            let mutGrp = enter.append("g")
              .attr("class", d => `substitution gene_${d.gene}`)
              .attr("id", d => `mutation_${d.gene}${d.codon_num}`);

            // leader lines
            mutGrp
              .append("path")
              .attr("class", "substitution-leader")
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")
              .style("stroke", "#8aa4be")
              .style("stroke-width", 1)
              .style("shape-rendering", "crispedged")
              .style("fill", "none")

            mutGrp
              .append("circle")
              .attr("class", "leader-terminus")
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)
              .attr("r", 1.8)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")
              .style("fill", "#3e5871")
              .style("stroke", "none")

            // circles for mutations
            mutGrp
              .append("circle")
              .attr("class", "substitution-circle")
              .attr("r", this.aaCircleR)
              .attr("cy", d => d.adjustedX ? circleAdjY : this.aaCircleR)
              .attr("cx", d => d.x)
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))
              .style("stroke-width", 0.75)
              .style("fill-opacity", 0.8);

            // position locations
            mutGrp
              .append("text")
              .attr("class", "substitution-text substitution-location")
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY)
              .attr("x", d => d.x)
              .text(d => d.codon_num)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("font-size", "0.6rem")
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle");
            ""
            // amino acid change text
            mutGrp
              .append("text")
              .attr("class", "substitution-text substitution-change")
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? circleAdjY : this.aaCircleR)
              .style("font-weight", 600)
              .style("fill", "white")
              .style("font-family", d => d.alt_aa == "_" || d.alt_aa == "*" ? "'DM Sans', Avenir, Helvetica, Arial, 'Font Awesome 5 Free', sans-serif" : "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("font-size", "0.85rem")
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle")
              .text(d => d.alt_aa == "_" || d.alt_aa == "*" ? "\uf28d" : d.alt_aa)
          },
          update => {
            update
              .attr("class", d => `substitution gene_${d.gene}`)
              .attr("id", d => `mutation_${d.gene}${d.codon_num}`);

            // leader lines
            update
              .select(".substitution-leader")
              .classed("hidden", d => !d.adjustedX)
              .transition(t1)
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`);

            update
              .select(".leader-terminus")
              .transition(t1)
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)
              .style("opacity", d => d.adjustedX ? 1 : 0)

            // circles for mutations
            update
              .select(".substitution-circle")
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))

              .transition(t1)
              .attr("cx", d => d.x)
              .attr("cy", d => d.adjustedX ? circleAdjY : this.aaCircleR);


            // text: mutation codon position
            update
              .select(".substitution-location")
              .text(d => d.codon_num)
              .transition(t1)
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif");

            // text: amino acid change
            update
              .select(".substitution-change")
              .style("font-family", d => d.alt_aa == "_" || d.alt_aa == "*" ? "'DM Sans', Avenir, Helvetica, Arial, 'Font Awesome 5 Free', sans-serif" : "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .text(d => d.alt_aa == "_" || d.alt_aa == "*" ? "\uf28d" : d.alt_aa)
              .transition(t1)
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? circleAdjY : this.aaCircleR);
          },
          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )

        // DELETIONS
        const rectY = this.aaCircleR - 0.75 * this.aaCircleR;
        const rectAdjY = circleAdjY - 0.75 * this.aaCircleR;

        let deletionSelector = this.deletionRef.selectAll(".deletion")
          .data(this.mutationArr.filter(d => d.type == "deletion"));

        deletionSelector.join(
          enter => {
            let mutGrp = enter.append("g")
              .attr("class", d => `deletion gene_${d.gene}`)
              .attr("id", d => `mutation_${d.gene}${d.codon_num}`);

            // leader lines
            mutGrp
              .append("path")
              .attr("class", "deletion-leader")
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")
              .style("stroke", "#8aa4be")
              .style("stroke-width", 1)
              .style("shape-rendering", "crispedged")
              .style("fill", "none")

            mutGrp
              .append("circle")
              .attr("class", "deletion-leader-terminus")
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)
              .attr("r", 1.8)
              .classed("hidden", d => !d.adjustedX)
              .attr("transform", "translate(0, 5)")
              .style("fill", "#3e5871")
              .style("stroke", "none")

            // del rectangle
            mutGrp.append("rect")
              .attr("class", "deletion-rect")
              .attr("x", d => d.x)
              .attr("width", d => this.x(d.pos_nt + d.change_length_nt) - this.x(d.pos_nt))
              .attr("y", d => d.adjustedX ? rectAdjY : rectY)
              .attr("height", this.aaCircleR * 1.5)
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene));

            // del symbol
            mutGrp
              .append("text")
              .attr("class", "deletion-text del-symbol")
              .attr("y", d => d.adjustedX ? rectAdjY : rectY)
              .attr("dy", -9)
              .attr("x", d => d.adjustedX ? d.x : this.x((d.pos_nt * 2 + d.change_length_nt) / 2))
              .style("font-weight", 600)
              .style("text-anchor", "middle")
              .style("fill", d => this.geneColorScale(d.gene))
              .style("font-size", "0.85rem")
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle")
              .text(d => "\u0394")

            // position locations
            mutGrp
              .append("text")
              .attr("class", "deletion-text deletion-location")
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY)
              .attr("x", d => d.adjustedX ? d.x : this.x((d.pos_nt * 2 + d.change_length_nt) / 2))
              .text(d => `${d.codon_num}:${d.codon_num + d.change_length_nt/3 - 1}`)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("dominant-baseline", "central")
              .style("text-anchor", "middle")
              .style("font-size", "0.6rem");
          },
          update => {
            update
              .attr("class", d => `deletion gene_${d.gene}`)
              .attr("id", d => `mutation_${d.gene}${d.codon_num}`);

            // leader lines
            update.select(".deletion-leader")
              .classed("hidden", d => !d.adjustedX)
              .transition(t1)
              .attr("d", d => `M ${d.targetX} ${labelY} V ${(labelY + shiftedLabelY)*0.45} H ${d.x} V ${shiftedLabelY}`);


            update.select(".deletion-leader-terminus")
              .classed("hidden", d => !d.adjustedX)
              .transition(t1)
              .attr("cx", d => d.targetX)
              .attr("cy", d => labelY)


            // del rectangle
            update.select(".deletion-rect")
              .style("fill", d => this.geneColorScale(d.gene))
              .style("stroke", d => this.geneColorScale(d.gene))
              .transition(t1)
              .attr("x", d => d.x)
              .attr("y", d => d.adjustedX ? rectAdjY : rectY)
              .attr("width", d => this.x(d.pos_nt + d.change_length_nt) - this.x(d.pos_nt));

            // del symbol
            update
              .select(".del-symbol")
              .text(d => "\u0394")
              .transition(t1)
              .attr("x", d => d.adjustedX ? d.x : this.x((d.pos_nt * 2 + d.change_length_nt) / 2))
              .attr("y", d => d.adjustedX ? rectAdjY : rectY)

            // position locations
            update
              .select(".deletion-location")
              .text(d => `${d.codon_num}:${d.codon_num + d.change_length_nt/3 - 1}`)
              .transition(t1)
              .attr("x", d => d.adjustedX ? d.x : this.x((d.pos_nt * 2 + d.change_length_nt) / 2))
              .attr("y", d => d.adjustedX ? shiftedLabelY : labelY);

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
