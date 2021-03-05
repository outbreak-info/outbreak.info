<template>
  <div class="my-5">
    <h3 class="text-center">Flagged mutations in {{location}}</h3>
    <!-- CHECKBOX TO SELECT GENES -->
    <div id="select-genes" class="d-flex flex-wrap align-items-center justify-content-center my-3">
      <div class="d-flex flex-wrap">
        <small class="text-muted mr-2 align-self-start">include genes:</small>
        <label class="b-contain pr-3" v-for="(gene, idx) in geneOpts" :key="idx">
          <span>{{gene}}</span>
          <input type="checkbox" :id="gene" :value="gene" v-model.lazy="selectedGenes" @change="updateGenes()" />
          <div class="b-input"></div>
        </label>
      </div>

    </div>
<div class="d-flex align-items-start" v-if="tableData">
    <table class="mx-auto">
      <thead>
        <tr>
          <th>
            mutation
          </th>
          <th>
            prevalent in
          </th>
          <th>
            growth rate
          </th>
          <th>
            growth rate error
          </th>
          <th>
           current prevalence (fitted)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="checkbook" v-for="(row, rIdx) in tableData" :key="rIdx">
          <td class="font-weight-bold">
            <router-link :to="{name: 'MutationReport', query: {muts: row.mutation_str}}">{{row.mutation_str}}
              </router-link>
          </td>
          <td class="d-flex flex-wrap">
            <router-link :to="{name: 'MutationReport', query: {pango: lineage}}" v-for="(lineage, lIdx) in row.lineages" :key="lIdx">
              <button class="btn chip btn-outline-secondary bg-white">{{lineage}}</button>
            </router-link>
          </td>
          <td>
            {{row.r_formatted}}
          </td>
          <td>
            {{row.r_err}}
          </td>
          <td>
            {{row.fitted_prev}}
          </td>
        </tr>
      </tbody>
    </table>
    <img src="@/assets/New York_ORF3a_P104L_fit.png" alt="growth curve" class="w-25 mt-4 ml-5" />
  </div>
  </div>
</template>

<script>
import Vue from "vue";

import { getAllLineagesForMutations } from "@/api/genomics.js";

export default {
  name: "LocationReports",
  props: {
    location: String
  },
  mounted() {
    getAllLineagesForMutations(this.$genomicsurl, this.data, 0.75).subscribe(results => {
      this.tableData = results.filter(d => this.selectedGenes.includes(d.gene));
    })
  },
  data() {
    return({
      tableData: null,
      geneOpts: [
        "ORF1a",
        "ORF1b",
        "S",
        "ORF3a",
        "E",
        "M",
        "ORF6",
        "ORF7a",
        "ORF7b",
        "ORF8",
        "N",
        "ORF10"
      ],
      selectedGenes: [
        "ORF1a",
        "ORF1b",
        "S",
        "ORF3a",
        "E",
        "M",
        "ORF6",
        "ORF7a",
        "ORF7b",
        "ORF8",
        "N",
        "ORF10"
      ],
      data: [{"mutation_str":"ORF1a:L3201P","r_formatted":"6.4%","r_err":0.0807},{"mutation_str":"ORF3a:P42L","r_formatted":"6.4%","r_err":0.0824},{"mutation_str":"ORF8:T11I","r_formatted":"6.3%","r_err":0.0815},{"mutation_str":"S:D253G","r_formatted":"6.3%","r_err":0.0961},{"mutation_str":"ORF1b:Q1011H","r_formatted":"6.3%","r_err":0.0962},{"mutation_str":"S:Q957R","r_formatted":"6.1%","r_err":0.3583},{"mutation_str":"S:T95I","r_formatted":"6%","r_err":0.0902},{"mutation_str":"S:S477N","r_formatted":"6%","r_err":0.3023},{"mutation_str":"ORF7a:L116F","r_formatted":"6%","r_err":0.349},{"mutation_str":"N:S202R","r_formatted":"5.9%","r_err":0.3391},{"mutation_str":"S:L5F","r_formatted":"5.8%","r_err":0.0842},{"mutation_str":"S:A701V","r_formatted":"5.4%","r_err":0.1133},{"mutation_str":"ORF1a:G1946S","r_formatted":"5.2%","r_err":0.2165},{"mutation_str":"ORF1a:I2230T","r_formatted":"5.1%","r_err":0.2449},{"mutation_str":"ORF1b:P218L","r_formatted":"5.1%","r_err":0.4894},{"mutation_str":"ORF1a:A1708D","r_formatted":"5.1%","r_err":0.2425},{"mutation_str":"N:D3L","r_formatted":"5%","r_err":0.2445},{"mutation_str":"S:E484K","r_formatted":"5%","r_err":0.1206},{"mutation_str":"S:D1118H","r_formatted":"5%","r_err":0.2389},{"mutation_str":"S:S982A","r_formatted":"5%","r_err":0.2418},{"mutation_str":"S:T716I","r_formatted":"5%","r_err":0.146},{"mutation_str":"ORF8:Y73C","r_formatted":"5%","r_err":0.2388},{"mutation_str":"N:S235F","r_formatted":"5%","r_err":0.2366},{"mutation_str":"S:A570D","r_formatted":"4.9%","r_err":0.2379},{"mutation_str":"ORF8:R52I","r_formatted":"4.9%","r_err":0.2385},{"mutation_str":"ORF1a:T1001I","r_formatted":"4.9%","r_err":0.2296},{"mutation_str":"ORF8:Q27_","r_formatted":"4.9%","r_err":0.2319},{"mutation_str":"S:N501Y","r_formatted":"4.8%","r_err":0.2091},{"mutation_str":"ORF1b:P970S","r_formatted":"4.2%","r_err":0.3257},{"mutation_str":"M:I82T","r_formatted":"4.2%","r_err":0.2986},{"mutation_str":"N:M234I","r_formatted":"3.9%","r_err":0.0549},{"mutation_str":"ORF1a:V3847I","r_formatted":"3.5%","r_err":0.2867},{"mutation_str":"S:F157S","r_formatted":"3.4%","r_err":0.286},{"mutation_str":"ORF3a:P104L","r_formatted":"3.4%","r_err":0.3005},{"mutation_str":"S:D80G","r_formatted":"3.4%","r_err":0.2909},{"mutation_str":"S:T859N","r_formatted":"3.3%","r_err":0.2901},{"mutation_str":"S:D950H","r_formatted":"3.3%","r_err":0.2954},{"mutation_str":"ORF1a:A3209V","r_formatted":"3.3%","r_err":0.2457},{"mutation_str":"ORF8:A51S","r_formatted":"3.2%","r_err":0.295},{"mutation_str":"ORF1a:T3255I","r_formatted":"3.2%","r_err":0.162},{"mutation_str":"ORF1a:K3162E","r_formatted":"3.2%","r_err":0.2785},{"mutation_str":"S:S494P","r_formatted":"3.2%","r_err":0.2238},{"mutation_str":"S:L452R","r_formatted":"2.8%","r_err":0.1219},{"mutation_str":"ORF1a:P959S","r_formatted":"2.6%","r_err":0.4868},{"mutation_str":"ORF1a:T4175I","r_formatted":"2.6%","r_err":0.4988},{"mutation_str":"S:T732A","r_formatted":"2.3%","r_err":0.4008},{"mutation_str":"N:T205I","r_formatted":"2%","r_err":0.0546},{"mutation_str":"S:P681H","r_formatted":"1.4%","r_err":0.0365}]
    })
  }
}
</script>

<style lang="scss">
th {
    padding: 0.5rem;
    text-align: center;
}

.checkbook td {
    padding: 0.5rem;
    text-align: center;
}

.checkbook:nth-child(2n+1) {
    background: lighten($base-grey,70%);
}
</style>
