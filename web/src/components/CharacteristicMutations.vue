<template>
<div>
  <h4 class="mb-0">{{ definitionLabel }}</h4>
  <div class="d-flex align-items-center justify-content-between mb-1 mr-4">
    <small class="text-muted">Mutations in at least {{charMutThreshold}} of sequences <router-link v-if="reportType != 'mutation'" :to="{name: 'SituationReportMethodology', hash: '#characteristic'}" target="_blank">(read more)</router-link></small>
    <router-link v-if="lineageName" :to="{name:'SituationReportComparison', query: { pango: lineageName }}">Compare to other lineages</router-link>
  </div>

  <SARSMutationMap :mutationKey="mutationName" :lineageMutations="mutations" :additionalMutations="additionalMutations" class="mb-3" v-if="mutations || additionalMutations" :copyable="true" />

  <div class="d-flex align-items-center ml-2 mr-3">
    <button class="btn btn-main-outline btn-mut router-link px-1 collapsed" data-toggle="collapse" href="#mutation-table" aria-expanded="true" aria-controls="mutation-table">
      <small><span class="if-collapsed">View</span>
        <span class="if-not-collapsed">Hide</span>
        mutation table</small>
    </button>
    <DownloadReportData :data="mutations" figureRef="mutation-map" dataType="Mutation Map" />
  </div>

  <div class="ml-2" id="mutation-table">
    <div class="row">
      <div class="col" v-if="lineageName">
        <MutationTable :data="mutations" :moc="moc" :moi="moi" :colorScale="colorScale" :tableTitle="`Characteristic mutations of ${lineageName}`" v-if="colorScale" />
      </div>
      <div class="col" v-if="additionalMutations.length > 0">
        <MutationTable :data="additionalMutations" :colorScale="colorScale" tableTitle="Additional Mutations" v-if="colorScale" />
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";
// --- store / Vuex ---
import {
  mapState
} from "vuex";

import {
  format,
  scaleOrdinal
} from "d3";

import SARSMutationMap from "@/components/SARSMutationMap.vue";
import MutationTable from "@/components/MutationTable.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";
import NT_MAP from "@/assets/genomics/sarscov2_NC045512_genes_nt.json";

import {
  getBadMutations
} from "@/api/genomics.js";

export default {
  name: "CharacteristicMutations",
  computed: {
    ...mapState("genomics", ["characteristicThreshold"]),
    charMutThreshold() {
      return (format(".0%")(this.characteristicThreshold))
    }
  },
  props: {
    mutations: Array,
    definitionLabel: String,
    mutationName: String,
    lineageName: String,
    reportType: String,
    additionalMutations: Array
  },
  components: {
    SARSMutationMap,
    MutationTable,
    DownloadReportData
  },
  data() {
    return ({
      colorScale: null,
      moi: null,
      moc: null,
      colorDomain: ["#bab0ab", // lt grey -- UTRs
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
      ]
    })
  },
  mounted() {
    const ofInterest = getBadMutations();
    this.moc = ofInterest.moc;
    this.moi = ofInterest.moi;
    // convert object of nucleotides into an array
    this.ntMapArr = Object.entries(NT_MAP).map(d => {
      return {
        gene: d[0],
        start: d[1].start,
        end: d[1].end
      }
    })

    let geneNames = this.ntMapArr.sort((a, b) => a.start - b.start).map(d => d.gene);

    this.colorScale = scaleOrdinal(this.colorDomain)
    .domain(geneNames);
  }
}
</script>

<style lang="scss">
[data-toggle="collapse"] {
    &.collapsed .if-not-collapsed {
        display: none;
    }
    &:not(.collapsed) .if-collapsed {
        display: none;
    }
}

.btn-mut {
    flex-basis: 210px;
    line-height: 1 !important;
}
</style>
