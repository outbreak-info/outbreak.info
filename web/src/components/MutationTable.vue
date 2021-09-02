
<template>
<div class="d-flex flex-column w-100 align-items-center mt-3">

  <h5 class="">{{ tableTitle }}</h5>
  <div>
    <button class="font-size-small text-uppercase btn btn-outline-secondary px-2 py-1 mr-4" data-toggle="collapse" href="#view-more">view more mutations</button>
    <button class="font-size-small text-uppercase btn btn-outline-secondary px-2 py-1 mr-4" data-toggle="collapse" href="#find-mutation">find a mutation</button>
    <button class="font-size-small text-uppercase btn btn-outline-secondary px-2 py-1" @click="changeSort">sort by {{ isLinearSorted ? "prevalence" : "AA position"}}</button>
  </div>

  <div class="collapse" id="view-more">
    <div class="d-flex my-3 bg-grey__lightest px-3 py-2 border-top border-bottom align-items-center">
      <h5 class="mr-3">View more mutations</h5>
      <div class="d-flex flex-column mr-3">
        <small class="text-muted">min. prevalence</small>
        <span class="percent-sign border bg-white py-1">
          <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 65px" v-model="selectedMutationThreshold" placeholder="0-100" />
          <span class="mr-1">%</span>
        </span>
      </div>
      <small>
        <button class="btn btn-main" @click="viewMore">Go</button>
      </small>
    </div>
  </div>

  <div class="collapse" id="find-mutation">
    <div class="d-flex my-3 bg-grey__lightest px-3 py-2 border-top border-bottom align-items-center">
      <h5 class="mr-3">Find a mutation</h5>
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <div class="d-flex flex-column mr-3">
            <small class="text-muted line-height-1 mb-1" style="width: 175px">
              Enter mutation preceded by gene name, like <b>"S:E484K"</b>
            </small>
            <input type="text" class="flex-grow-0 border bg-white px-2" style="width: 175px" v-model="selectedMutationLookup" placeholder="gene:mutation" />
          </div>
          <small>
            <button class="btn btn-main" @click="findMutation">Go</button>
          </small>
        </div>

        <div class="d-flex align-items-center mt-2 pt-2 border-top">
          <small class="text-muted line-height-1 mr-3" style="width: 175px">
            View prevelance of all <b>Mutations of Concern</b> &amp; <b>Interest</b>
          </small>
          <small class="flex-shrink-0">
            <button class="btn btn-sec" @click="findMutation">View MOC/MOI</button>
          </small>
        </div>
      </div>

    </div>
  </div>

  <svg :width="width" :height="height" class="characteristic_mutations" :name="title" ref="mut_bars_svg">
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="mut_bars"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="annotation"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-x axis--x" ref="xAxisTop"></g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxisBottom"></g>
  </svg>



</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

import NT_MAP from "@/assets/genomics/sarscov2_NC045512_genes_nt.json";
import cloneDeep from "lodash/cloneDeep";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  format,
  transition
} from "d3";

export default Vue.extend({
  name: "MutationTable",
  props: {
    data: Array,
    colorScale: Function,
    lineageName: String,
    tableTitle: String,
    moi: Array,
    moc: Array,
    width: {
      type: Number,
      default: 450
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
      return (`Global characteristic mutations in ${this.lineageName}`)
    },
    characteristicThresholdFormatted() {
      return (format(".0%")(this.charactersticThreshold))
    }
  },
  data() {
    return {
      margin: {
        top: 30,
        bottom: 30,
        left: 170,
        right: 80
      },
      numXTicks: 4,
      bandwidth: 20,
      interestWidth: 35,
      interestBg: "#fef5ec",
      interestColor: "#f28e2c",
      concernBg: "#fceeef",
      concernColor: "#e15759",
      selectedMutationThreshold: 75,
      selectedMutationLookup: null,
      height: null,
      // axes
      x: null,
      y: null,
      paddingInner: 0.25,
      // refs
      chart: null,
      annotation: null,
      // data
      plottedData: null,
      // forms
      // interactions
      isLinearSorted: false
    }
  },
  methods: {
    changeSort() {
      this.isLinearSorted = !this.isLinearSorted;
      this.updatePlot();
    },
    viewMore() {
      console.log("MORE")
    },
    findMutation() {
      console.log("mutation")
    },
    route2Mutation(d) {
      const mutation = d.mutation.split(":")[1];

      this.$router.push({
        name: "MutationReport",
        query: {
          muts: [`${d.gene}:${mutation.toUpperCase()}`]
        }
      })
    },
    setupPlot() {
      this.chart = select(this.$refs.mut_bars);
      this.annotation = select(this.$refs.annotation);
    },
    updatePlot: function() {
      if (this.data) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    linearSorter(a, b) {
      if (!(a.gene in NT_MAP) || !(b.gene in NT_MAP))
        return 0;
      if (NT_MAP[a.gene].start < NT_MAP[b.gene].start)
        return -1;
      if (NT_MAP[a.gene].start > NT_MAP[b.gene].start)
        return 0;
      return (a.codon_num < b.codon_num ? -1 : 0);
    },
    updateAxes() {
      this.plottedData = cloneDeep(this.data);
      if (this.isLinearSorted) {
        this.plottedData.sort(this.linearSorter)
      } else {
        this.plottedData.sort((a, b) => a.prevalence > b.prevalence ? -1 : 1);
      }

      this.height = this.bandwidth * this.plottedData.length * (1 + this.paddingInner) + this.margin.top + this.margin.bottom;

      this.x = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain([0, 1]);

      this.y = scaleBand()
        .paddingInner(this.paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.plottedData.map(d => d.mutation));

    },
    drawPlot() {
      const mutationX = -5;
      const yHeader = -15;
      const t1 = transition()
        .duration(1500);

      const mutSelector = this.chart
        .selectAll(".mutation-group")
        .data(this.plottedData, d => d.id);

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

          const textGrp = grp.append("text")
            .attr("class", "gene-mutation hover-underline pointer")
            .attr("x", 0)
            .attr("dx", mutationX)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .style("fill", d => this.colorScale(d.gene))
            .style("dominant-baseline", "central")
            .style("text-anchor", "end")
            .on("click", d => this.route2Mutation(d));

          textGrp.append("tspan")
            .attr("class", "gene")
            .text(d => `${d.gene}: `);

          textGrp.append("tspan")
            .attr("class", "mutation")
            .text(d => d.mutation_simplified)
            .style("font-weight", 700);
          // .style("fill", "#555");

          grp.append("text")
            .attr("class", "annotation")
            .attr("x", this.x(1))
            .attr("dx", 37)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text(d => d.prevalence_formatted)
            .style("font-size", 13)
            .style("fill", this.fillColor)
            .style("dominant-baseline", "central")
            .style("text-anchor", "end");

          grp
            .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation))
            .append("rect")
            .attr("class", "moi")
            .attr("x", this.width - this.margin.left - this.interestWidth - 2)
            .attr("width", this.interestWidth)
            .attr("y", d => this.y(d.mutation))
            .attr("height", this.y.bandwidth())
            .style("rx", 4)
            .style("fill", this.interestBg)
            .style("stroke", this.interestColor)
            .style("stroke-width", 0.75);

          grp
            .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation))
            .append("text")
            .attr("class", "moi-annotation")
            .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text("MOI")
            .style("fill", this.interestColor)
            .style("font-size", 11)
            .style("font-weight", 700)
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle");

          grp
            .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation))
            .append("rect")
            .attr("class", "moc")
            .attr("x", this.width - this.margin.left - this.interestWidth - 2)
            .attr("width", this.interestWidth)
            .attr("y", d => this.y(d.mutation))
            .attr("height", this.y.bandwidth())
            .style("rx", 4)
            .style("fill", this.concernBg)
            .style("stroke", this.concernColor)
            .style("stroke-width", 0.75);

          grp
            .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation))
            .append("text")
            .attr("class", "moi-annotation")
            .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2)
            .text("MOC")
            .style("fill", this.concernColor)
            .style("font-size", 11)
            .style("font-weight", 700)
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle");
        },
        update => {
          update.attr("id", d => d.id);

          update
            .select(".prevalence")
            .attr("height", this.y.bandwidth())
            .transition(t1)
            .attr("width", d => this.x(d.prevalence) - this.x(0))
            .attr("y", d => this.y(d.mutation));

          update
            .select(".hundred-percent")
            .attr("height", this.y.bandwidth())
            .transition(t1)
            .attr("x", this.x(0))
            .attr("y", d => this.y(d.mutation))
            .attr("width", d => this.x(1) - this.x(0))

          update.select(".gene-mutation")
            .style("fill", d => this.colorScale(d.gene))
            .transition(t1)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2);

          update.select(".gene")
            .text(d => `${d.gene}: `);

          update.select(".mutation")
            .text(d => d.mutation_simplified);

          update
            .select(".annotation")
            .attr("x", this.width - this.margin.left - this.margin.right)
            .text(d => d.prevalence_formatted)
            .transition(t1)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2);

          update
            .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation))
            .select(".moi")
            .attr("x", this.width - this.margin.left - this.interestWidth - 2)
            .attr("height", this.y.bandwidth())
            .transition(t1)
            .attr("y", d => this.y(d.mutation));

          update
            .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation))
            .select(".moi-annotation")
            .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2)
            .transition(t1)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2);

          update
            .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation))
            .select(".moc")
            .attr("x", this.width - this.margin.left - this.interestWidth - 2)
            .attr("height", this.y.bandwidth())
            .transition(t1)
            .attr("y", d => this.y(d.mutation));

          update
            .filter(d => this.moc.includes(d.mutation))
            .select(".moi-annotation")
            .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2)
            .transition(t1)
            .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2);
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      const thresholdExtension = 2;
      const thresholdX = -7;
      const thresholdY = 18;

      const annotSelector = this.annotation
        .selectAll(".annotation-group")
        .data([0]);

      annotSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("class", "annotation-group");

          const textGrp = grp.append("text")
            .attr("class", "th")
            .attr("x", 0)
            .attr("dx", mutationX)
            .attr("y", 0)
            .attr("dy", yHeader)

            .style("fill", "#555")
            .style("font-size", 14)
            .style("dominant-baseline", "central")
            .style("text-anchor", "end");

          textGrp.append("tspan")
            .text("gene: ");

          textGrp.append("tspan")
            .text("mutation")
            .style("font-weight", 700);

          grp.append("text")
            .attr("class", "th")
            .attr("x", this.width - this.margin.left - this.margin.right)
            .attr("y", 0)
            .attr("dy", yHeader)
            .text("prevalence in lineage")
            .style("fill", "#555")
            .style("dominant-baseline", "central")
            .style("font-size", 14)
            .style("text-anchor", "end");

          grp
            .append("line")
            .attr("class", "characteristic-threshold")
            .attr("x1", this.x(this.characteristicThreshold))
            .attr("x2", this.x(this.characteristicThreshold))
            .attr("y1", -1 * thresholdExtension)
            .attr("y2", this.height - this.margin.top - this.margin.bottom + thresholdExtension)
            .style("stroke", this.thresholdColor)
            .style("stroke-width", 1)
            .style("stroke-dasharray", "4,4")

          grp
            .append("polyline")
            .attr("class", "threshold-annotation-line")
            .attr("points",
              `${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom} ${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom + thresholdY} ${this.x(this.characteristicThreshold) + thresholdX},${this.height - this.margin.top - this.margin.bottom + thresholdY}`
            )
            .style("fill", "none")
            .style("stroke", this.thresholdColor)
            .style("stroke-width", 1)

          grp
            .append("text")
            .attr("class", "threshold-annotation")
            .attr("x", this.x(this.characteristicThreshold))
            .attr("y", this.height - this.margin.top - this.margin.bottom + thresholdY)
            .attr("dx", -3 + thresholdX)
            .text(`characteristic threshold (${this.characteristicThresholdFormatted})`)
            .style("text-anchor", "end")
            .style("font-size", 14)
            .style("dominant-baseline", "central")
            .style("fill", this.thresholdColor)
        },
        update => {
          update
            .select(".characteristic-threshold")
            .attr("x1", this.x(this.characteristicThreshold))
            .attr("x2", this.x(this.characteristicThreshold))
            .attr("y2", this.height - this.margin.top - this.margin.bottom + thresholdExtension);

          update
            .select(".threshold-annotation-line")
            .attr("points",
              `${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom} ${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom + thresholdY} ${this.x(this.characteristicThreshold) + thresholdX},${this.height - this.margin.top - this.margin.bottom + thresholdY}`
            );

          update
            .select(".threshold-annotation")
            .attr("x", this.x(this.characteristicThreshold))
            .attr("y", this.height - this.margin.top - this.margin.bottom + thresholdY)
            .text(`characteristic threshold (${this.characteristicThresholdFormatted})`);
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )
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
