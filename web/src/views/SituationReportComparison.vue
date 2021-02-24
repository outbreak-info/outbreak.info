<template>
<div class="my-4 mx-4 half-page text-left">
  <h1>Lineage comparison</h1>
  <div id="select-lineages">
    <!-- <div class="d-flex align-items-end mt-3 mb-5 w-100" id="mutation-1">
      <div class="w-400px mr-4">
        <TypeaheadSelect :queryFunction="queryPangolin" :selected="mutant1" @selected="updatePangolin1" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Add lineage" />
      </div>
      <div>
        <h5>
          {{ mutant1 }}
        </h5>
        <SARSMutationMap :mutationArr="mutations1" :mutationKey="mutant1" class="w-600px" />
      </div>

    </div> -->
  </div>

  <!-- CHECKBOX TO SELECT GENES -->
  <div id="select-genes" class="d-flex flex-wrap align-items-center justify-content-between">
    <div class="d-flex flex-wrap">
      <small class="text-muted mr-2 align-self-start">include genes:</small>
      <label class="b-contain pr-3" v-for="(gene, idx) in geneOpts" :key="idx">
        <span>{{gene}}</span>
        <input type="checkbox" :id="gene" :value="gene" v-model.lazy="selectedGenes" @change="updateGenes()" />
        <div class="b-input"></div>
      </label>
    </div>


    <!-- LEGEND -->
    <div id="legend" class="d-flex bg-dark px-2 py-1 mx-4">
      <GradientLegend maxValue="100%" :colorScale="colorScale" :dark="true" label="Mutation prevalence in lineage" class="mr-3" />
      <div class="d-flex align-items-center">
        <svg width="24" height="24">
          <defs>
            <pattern id="diagonalHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:#AAA; stroke-width:0.75`" />
            </pattern>
          </defs>
          <rect x="2" y="2" width="20" height="20" fill="url(#diagonalHatch)" rx="4" stroke="#888" stroke-width="0.5"></rect>
        </svg>
        <small class="text-light ml-2">not detected</small>
      </div>
    </div>
  </div>



  <!-- LOOP OVER MUTATION HEATMAPS -->
  <div id="mutation-heatmaps" class="d-flex flex-wrap">
    <div v-for="(geneData, gIdx) in mutationHeatmap" :key="gIdx" class="mr-4 mb-2">
      <template v-if="selectedGenes.includes(geneData.key)">
        <h4 class="m-0 text-dark">{{ geneData.key }}</h4>
        <MutationHeatmap :data="geneData.values" :yDomain="selectedPango" />
      </template>
    </div>

  </div>

</div>
</template>

<script>
import Vue from "vue";
import {
  findPangolin,
  getCharacteristicMutations,
  getLineagesComparison
} from "@/api/genomics.js";

import MutationHeatmap from "@/components/MutationHeatmap.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import CharacteristicMutations from "@/components/CharacteristicMutations.vue";
import GradientLegend from "@/components/GradientLegend.vue";

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  scaleSequential
} from "d3";

export default {
  name: "SituationReportsDemo",
  props: {
    pango: Array,
    gene: {
      type: Array,
      default: () => ["ORF1a",
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
      ]
    }
  },
  components: {
    // TypeaheadSelect,
    // SARSMutationMap,
    MutationHeatmap,
    GradientLegend
    // CharacteristicMutations
  },
  computed: {
    selectedPango() {
      return (["B.1.1.7", "B.1.351", "B.1.427", "B.1.429", "P.1", "B.1.525", "B.1.526", "average"])
    }
  },
  data() {
    return {
      queryPangolin: null,
      mutationHeatmap: null,
      selectedGenes: [],
      colorScale: null,
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
      ]
    }
  },
  mounted() {
    this.colorScale = scaleSequential(interpolateRdPu);
    this.selectedGenes = this.gene;
    this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango).subscribe(results => {
      this.mutationHeatmap = results;
    })

    this.queryPangolin = findPangolin;
  },
  methods: {
    updateGenes() {
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: this.pango,
          genes: this.selectedGenes
        }
      })
    },
    updatePangolin(selected) {
      // this.mutant1 = selected.name;
      // this.getMutants1();
      // this.$router.push({
      //   name: "SituationReportComparison",
      //   query: {
      //     mutant1: selected.name,
      //     mutant2: this.mutant2
      //   }
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.w-400px {
    width: 200px;
}
.w-600px {
    width: 600px;
}
</style>
