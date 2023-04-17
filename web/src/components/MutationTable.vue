<template>
  <div class="d-flex flex-column w-100 align-items-center mt-3">
    <h5 class="">
      {{ tableTitle }}
    </h5>
    <table>
      <thead>
        <tr class="border-bottom">
          <th>gene</th>
          <th>amino acid</th>
        </tr>
      </thead>
      <tbody class="checkbook border-bottom">
        <tr v-for="(mutation, mIdx) in sortedMutations" :key="mIdx">
          <td>
            {{ mutation.gene }}
          </td>
          <td v-if="mutation.type === 'substitution'">
            {{ mutation.ref_aa }}{{ mutation.codon_num }}{{ mutation.alt_aa }}
          </td>
          <td v-else-if="mutation.type === 'deletion'">
            {{ mutation.mutation.replace(/(.)*:/, '') }}
            <!-- <span v-if="Array.isArray(mutation.codon_num)">&Delta;{{mutation.codon_num[0]}}-{{mutation.codon_num.slice(-1)[0]}}</span>
        <span v-else>&Delta;{{mutation.codon_num}}
          </span> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import cloneDeep from 'lodash/cloneDeep';

import NT_MAP from '@/assets/genomics/sarscov2_NC045512_genes_nt.json';

const props = defineProps({
  mutations: Array,
  tableTitle: String,
});

const sortedMutations = computed(() => {
  let sortedMutations = [];
  sortedMutations = cloneDeep(props.mutations);
  const compare = (a, b) => {
    if (!(a.gene in NT_MAP) || !(b.gene in NT_MAP)) return 0;
    if (NT_MAP[a.gene].start < NT_MAP[b.gene].start) return -1;
    if (NT_MAP[a.gene].start > NT_MAP[b.gene].start) return 0;
    return a.codon_num < b.codon_num ? -1 : 0;
  };

  sortedMutations = sortedMutations.sort(compare);

  return sortedMutations;
});
</script>

<style lang="scss" scoped>
.checkbook td {
  padding: 0.5rem;
}
.checkbook tr:nth-child(2n + 1) {
  background-color: $lightback;
}
</style>
<!-- <template> -->
<!-- <div class="d-flex flex-column w-100 align-items-center mt-3"> -->

<!--   <h5 class="">{{ tableTitle }}</h5> -->
<!--   <svg :width="width" :height="height" class="characteristic_mutations" :name="title" ref="mut_bars_svg"> -->
<!--     <g :transform="`translate(${margin.left}, ${margin.top})`" ref="mut_bars"></g> -->
<!--     <\!-- <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-x axis--x" ref="xAxisTop"></g> -\-> -->
<!--     <\!-- <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxisBottom"></g> -\-> -->
<!--   </svg> -->

<!--   <div class="d-flex"> -->
<!--     <small class="my-3"> -->
<!--       <button class="btn btn-main-outline" @click="viewMore">view more mutations</button> -->
<!--     </small> -->
<!--     <div class="d-flex flex-column"> -->
<!--       <small class="text-muted">min. prevalence</small> -->
<!--       <span class="percent-sign border bg-white py-1"> -->
<!--         <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 65px" v-model="selectedMutationThreshold" placeholder="0-100" /> -->
<!--         <span class="mr-1">%</span> -->
<!--       </span> -->
<!--     </div> -->
<!--   </div> -->

<!-- </div> -->
<!-- </template> -->

<!-- <script> -->
<!-- import Vue from "vue"; -->

<!-- import { -->
<!--   mapState -->
<!-- } from "vuex"; -->

<!-- import cloneDeep from "lodash/cloneDeep"; -->

<!-- import { -->
<!--   select, -->
<!--   selectAll, -->
<!--   scaleLinear, -->
<!--   scaleBand, -->
<!--   format, -->
<!--   transition -->
<!-- } from "d3"; -->

<!-- export default Vue.extend({ -->
<!--   name: "MutationTable", -->
<!--   props: { -->
<!--     data: Array, -->
<!--     colorScale: Function, -->
<!--     lineageName: String, -->
<!--     tableTitle: String, -->
<!--     moi: Array, -->
<!--     moc: Array, -->
<!--     width: { -->
<!--       type: Number, -->
<!--       default: 450 -->
<!--     }, -->
<!--     fillColor: { -->
<!--       type: String, -->
<!--       default: "#bab0ab" -->
<!--     }, -->
<!--     thresholdColor: { -->
<!--       type: String, -->
<!--       default: "#e15759" -->
<!--     } -->
<!--   }, -->
<!--   watch: { -->
<!--     data() { -->
<!--       this.updatePlot(); -->
<!--     } -->
<!--   }, -->
<!--   computed: { -->
<!--     ...mapState("genomics", ["characteristicThreshold"]), -->
<!--     title() { -->
<!--       return (`Characteristic mutations in ${this.lineageName}`) -->
<!--     } -->
<!--   }, -->
<!--   data() { -->
<!--     return { -->
<!--       margin: { -->
<!--         top: 30, -->
<!--         bottom: 30, -->
<!--         left: 170, -->
<!--         right: 80 -->
<!--       }, -->
<!--       numXTicks: 4, -->
<!--       bandwidth: 20, -->
<!--       interestWidth: 35, -->
<!--       interestBg: "#fef5ec", -->
<!--       interestColor: "#f28e2c", -->
<!--       concernBg: "#fceeef", -->
<!--       concernColor: "#e15759", -->
<!--       selectedMutationThreshold: 50, -->
<!--       height: null, -->
<!--       // axes -->
<!--       x: null, -->
<!--       y: null, -->
<!--       paddingInner: 0.25, -->
<!--       // refs -->
<!--       chart: null, -->
<!--       // data -->
<!--       plottedData: null, -->
<!--       // forms -->
<!--       sortVar: "prevalence" -->
<!--     } -->
<!--   }, -->
<!--   methods: { -->
<!--     viewMore() { -->
<!--       console.log("MORE") -->
<!--     }, -->
<!--     setupPlot() { -->
<!--       this.chart = select(this.$refs.mut_bars); -->
<!--     }, -->
<!--     updatePlot() { -->
<!--       if (this.data) { -->
<!--         this.updateAxes(); -->
<!--         this.drawPlot(); -->
<!--       } -->
<!--     }, -->
<!--     updateAxes() { -->
<!--       this.plottedData = cloneDeep(this.data); -->
<!--       this.plottedData.sort((a, b) => a[this.sortVar] > b[this.sortVar] ? -1 : 1); -->

<!--       this.height = this.bandwidth * this.plottedData.length * (1 + this.paddingInner) + this.margin.top + this.margin.bottom; -->

<!--       this.x = scaleLinear() -->
<!--         .range([0, this.width - this.margin.left - this.margin.right]) -->
<!--         .domain([0, 1]); -->

<!--       this.y = scaleBand() -->
<!--         .paddingInner(this.paddingInner) -->
<!--         .range([0, this.height - this.margin.top - this.margin.bottom]) -->
<!--         .domain(this.plottedData.map(d => d.mutation)); -->

<!--     }, -->
<!--     drawPlot() { -->
<!--       const mutationX = -5; -->
<!--       const yHeader = -15; -->
<!--       const t1 = transition() -->
<!--         .duration(1500); -->

<!--       const mutSelector = this.chart -->
<!--         .selectAll(".mutation-group") -->
<!--         .data(this.plottedData, d => d.id); -->

<!--       mutSelector.join( -->
<!--         enter => { -->
<!--           const grp = enter.append("g") -->
<!--             .attr("class", "mutation-group") -->
<!--             .attr("id", d => d.id); -->

<!--           grp.append("rect") -->
<!--             .attr("class", "hundred-percent") -->
<!--             .attr("x", this.x(0)) -->
<!--             .attr("y", d => this.y(d.mutation)) -->
<!--             .attr("width", d => this.x(1) - this.x(0)) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .style("fill", "none") -->
<!--             .style("stroke", this.fillColor) -->
<!--             .style("stroke", this.fillColor) -->
<!--             .style("stroke-width", 0.75) -->

<!--           grp.append("rect") -->
<!--             .attr("class", "prevalence") -->
<!--             .attr("x", this.x(0)) -->
<!--             .attr("y", d => this.y(d.mutation)) -->
<!--             .attr("width", d => this.x(d.prevalence) - this.x(0)) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .style("fill", this.fillColor); -->

<!--           const textGrp = grp.append("text") -->
<!--             .attr("class", "gene-mutation") -->
<!--             .attr("x", 0) -->
<!--             .attr("dx", mutationX) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2) -->
<!--             .style("fill", d => this.colorScale(d.gene)) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("text-anchor", "end"); -->

<!--           textGrp.append("tspan") -->
<!--             .attr("class", "gene") -->
<!--             .text(d => `${d.gene}: `); -->

<!--           textGrp.append("tspan") -->
<!--             .attr("class", "mutation") -->
<!--             .text(d => d.type == "substitution" ? `${d.ref_aa}${d.codon_num}${d.alt_aa}` : `${d.mutation.split(":").slice(-1)[0].toUpperCase()}`) -->
<!--             .style("font-weight", 700) -->
<!--           // .style("fill", "#555"); -->

<!--           grp.append("text") -->
<!--             .attr("class", "annotation") -->
<!--             .attr("x", this.x(1)) -->
<!--             .attr("dx", 37) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2) -->
<!--             .text(d => format(".0%")(d.prevalence)) -->
<!--             .style("font-size", 13) -->
<!--             .style("fill", this.fillColor) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("text-anchor", "end"); -->

<!--           grp -->
<!--             .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .append("rect") -->
<!--             .attr("class", "moi") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth - 2) -->
<!--             .attr("width", this.interestWidth) -->
<!--             .attr("y", d => this.y(d.mutation)) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .style("rx", 4) -->
<!--             .style("fill", this.interestBg) -->
<!--             .style("stroke", this.interestColor) -->
<!--             .style("stroke-width", 0.75); -->

<!--           grp -->
<!--             .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .append("text") -->
<!--             .attr("class", "moi-annotation") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2) -->
<!--             .text("MOI") -->
<!--             .style("fill", this.interestColor) -->
<!--             .style("font-size", 11) -->
<!--             .style("font-weight", 700) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("text-anchor", "middle"); -->

<!--           grp -->
<!--             .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .append("rect") -->
<!--             .attr("class", "moc") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth - 2) -->
<!--             .attr("width", this.interestWidth) -->
<!--             .attr("y", d => this.y(d.mutation)) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .style("rx", 4) -->
<!--             .style("fill", this.concernBg) -->
<!--             .style("stroke", this.concernColor) -->
<!--             .style("stroke-width", 0.75); -->

<!--           grp -->
<!--             .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .append("text") -->
<!--             .attr("class", "moi-annotation") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2) -->
<!--             .text("MOC") -->
<!--             .style("fill", this.concernColor) -->
<!--             .style("font-size", 11) -->
<!--             .style("font-weight", 700) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("text-anchor", "middle"); -->
<!--         }, -->
<!--         update => { -->
<!--           update.attr("id", d => d.id); -->

<!--           update -->
<!--             .select(".prevalence") -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .transition(t1) -->
<!--             .attr("width", d => this.x(d.prevalence) - this.x(0)) -->
<!--             .attr("y", d => this.y(d.mutation)); -->

<!--           update.select(".gene-mutation") -->
<!--             .style("fill", d => this.colorScale(d.gene)) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2) -->

<!--           update.select(".gene") -->
<!--             .text(d => `${d.gene}: `); -->

<!--           update.select(".mutation") -->
<!--             .text(d => d.type == "substitution" ? `${d.ref_aa}${d.codon_num}${d.alt_aa}` : `${d.mutation.split(":")[-1].toUpperCase()}`); -->

<!--           update -->
<!--             .select(".annotation") -->
<!--             .attr("x", this.width - this.margin.left - this.margin.right) -->
<!--             .text(d => format(".0%")(d.prevalence)) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2); -->

<!--           update -->
<!--             .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .select(".moi") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth - 2) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation)); -->

<!--           update -->
<!--             .filter(d => this.moi.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .select(".moi-annotation") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2); -->

<!--           update -->
<!--             .filter(d => this.moc.map(d => d.toLowerCase()).includes(d.mutation)) -->
<!--             .select(".moc") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth - 2) -->
<!--             .attr("height", this.y.bandwidth()) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation)); -->

<!--           update -->
<!--             .filter(d => this.moc.includes(d.mutation)) -->
<!--             .select(".moi-annotation") -->
<!--             .attr("x", this.width - this.margin.left - this.interestWidth / 2 - 2) -->
<!--             .transition(t1) -->
<!--             .attr("y", d => this.y(d.mutation) + this.y.bandwidth() / 2); -->
<!--         }, -->
<!--         exit => -->
<!--         exit.call(exit => -->
<!--           exit -->
<!--           .transition() -->
<!--           .style("opacity", 1e-5) -->
<!--           .remove() -->
<!--         ) -->
<!--       ) -->

<!--       const thresholdExtension = 2; -->
<!--       const thresholdX = -7; -->
<!--       const thresholdY = 18; -->

<!--       const annotSelector = this.chart -->
<!--         .selectAll(".annotation-group") -->
<!--         .data([0]); -->

<!--       annotSelector.join( -->
<!--         enter => { -->
<!--           const grp = enter.append("g") -->
<!--             .attr("class", "annotation-group"); -->

<!--           const textGrp = grp.append("text") -->
<!--             .attr("class", "th") -->
<!--             .attr("x", 0) -->
<!--             .attr("dx", mutationX) -->
<!--             .attr("y", 0) -->
<!--             .attr("dy", yHeader) -->

<!--             .style("fill", "#555") -->
<!--             .style("font-size", 14) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("text-anchor", "end"); -->

<!--           textGrp.append("tspan") -->
<!--             .text("gene: "); -->

<!--           textGrp.append("tspan") -->
<!--             .text("mutation") -->
<!--             .style("font-weight", 700); -->

<!--           grp.append("text") -->
<!--             .attr("class", "th") -->
<!--             .attr("x", this.width - this.margin.left - this.margin.right) -->
<!--             .attr("y", 0) -->
<!--             .attr("dy", yHeader) -->
<!--             .text("prevalence in lineage") -->
<!--             .style("fill", "#555") -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("font-size", 14) -->
<!--             .style("text-anchor", "end"); -->

<!--           grp -->
<!--             .append("line") -->
<!--             .attr("class", "characteristic-threshold") -->
<!--             .attr("x1", this.x(this.characteristicThreshold)) -->
<!--             .attr("x2", this.x(this.characteristicThreshold)) -->
<!--             .attr("y1", -1 * thresholdExtension) -->
<!--             .attr("y2", this.height - this.margin.top - this.margin.bottom + thresholdExtension) -->
<!--             .style("stroke", this.thresholdColor) -->
<!--             .style("stroke-width", 1) -->
<!--             .style("stroke-dasharray", "4,4") -->

<!--           grp -->
<!--             .append("polyline") -->
<!--             .attr("class", "threshold-annotation-line") -->
<!--             .attr("points", -->
<!--               `${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom} ${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom + thresholdY} ${this.x(this.characteristicThreshold) + thresholdX},${this.height - this.margin.top - this.margin.bottom + thresholdY}` -->
<!--             ) -->
<!--             .style("fill", "none") -->
<!--             .style("stroke", this.thresholdColor) -->
<!--             .style("stroke-width", 1) -->

<!--           grp -->
<!--             .append("text") -->
<!--             .attr("class", "threshold-annotation") -->
<!--             .attr("x", this.x(this.characteristicThreshold)) -->
<!--             .attr("y", this.height - this.margin.top - this.margin.bottom + thresholdY) -->
<!--             .attr("dx", -3 + thresholdX) -->
<!--             .text(`characteristic threshold (${format(".0%")(this.characteristicThreshold)})`) -->
<!--             .style("text-anchor", "end") -->
<!--             .style("font-size", 14) -->
<!--             .style("dominant-baseline", "central") -->
<!--             .style("fill", this.thresholdColor) -->
<!--         }, -->
<!--         update => { -->
<!--           update -->
<!--             .select(".characteristic-threshold") -->
<!--             .attr("x1", this.x(this.characteristicThreshold)) -->
<!--             .attr("x2", this.x(this.characteristicThreshold)) -->
<!--             .attr("y2", this.height - this.margin.top - this.margin.bottom + thresholdExtension); -->

<!--           update -->
<!--             .select(".threshold-annotation-line") -->
<!--             .attr("points", -->
<!--               `${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom} ${this.x(this.characteristicThreshold)},${this.height - this.margin.top - this.margin.bottom + thresholdY} ${this.x(this.characteristicThreshold) + thresholdX},${this.height - this.margin.top - this.margin.bottom + thresholdY}` -->
<!--             ); -->

<!--           update -->
<!--             .select(".threshold-annotation") -->
<!--             .attr("x", this.x(this.characteristicThreshold)) -->
<!--             .attr("y", this.height - this.margin.top - this.margin.bottom + thresholdY) -->
<!--             .text(`characteristic threshold (${format(".0%")(this.characteristicThreshold)})`); -->
<!--         }, -->
<!--         exit => -->
<!--         exit.call(exit => -->
<!--           exit -->
<!--           .transition() -->
<!--           .style("opacity", 1e-5) -->
<!--           .remove() -->
<!--         ) -->
<!--       ) -->
<!--     } -->
<!--   }, -->
<!--   mounted() { -->
<!--     this.setupPlot(); -->
<!--     this.updatePlot(); -->
<!--   } -->
<!-- }) -->
<!-- </script> -->

<!-- <style lang="scss" scoped> -->
<!-- .checkbook td { -->
<!--     padding: 0.5rem; -->
<!-- } -->

<!-- .checkbook tr:nth-child(2n+1) { -->
<!--     background-color: $lightback; -->
<!-- } -->
<!-- </style> -->
