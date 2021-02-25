<template>
<div class="my-4 mx-4 half-page text-left">
  <h1>Lineage comparison</h1>
  <div id="select-lineages" class="mb-3">
    <h6>Selected lineages</h6>
    <div class="d-flex flex-wrap">
      <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(lineage, lIdx) in selectedPango" :key="lIdx" @click="deletePango(lIdx)">
        <span>{{lineage}}</span>
        <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
      </button>
      <div style="width: 150px">
        <TypeaheadSelect :queryFunction="queryPangolin" @selected="addPango" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Add lineage" />
      </div>
    </div>
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
  <div id="mutation-heatmaps">
    <h3 class="m-0">Mutation prevalence across lineages</h3>

    <p class="text-muted m-0">Mutations with > {{ prevalenceThresholdFormatted }} prevalence in at least one lineage</p>
    <div class="d-flex flex-wrap">

      <div v-for="(geneData, gIdx) in mutationHeatmap" :key="gIdx" class="mr-4 mb-2">
        <template v-if="selectedGenes.includes(geneData.key)">
          <h4 class="m-0 text-dark">{{ geneData.key }}</h4>
          <MutationHeatmap :data="geneData.values" :yDomain="selectedPango" />
        </template>
      </div>
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

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import {
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";

library.add(faPlus, faTimesCircle);

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  scaleSequential,
  format
} from "d3";

export default {
  name: "SituationReportsDemo",
  props: {
    pango: {
      type: Array,
      default: () => ["B.1.427", "B.1.429"]
    },
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
    FontAwesomeIcon,
    TypeaheadSelect,
    MutationHeatmap,
    GradientLegend
    // CharacteristicMutations
  },
  computed: {
    selectedPango() {
      const merged = typeof(this.pango) == "string" ? [this.pango, "average"] : this.pango.concat(["average"])
      return (merged)
    },
    prevalenceThresholdFormatted() {
      return (format(".0%")(this.prevalenceThreshold))
    }
  },
  data() {
    return {
      queryPangolin: null,
      mutationHeatmap: null,
      selectedGenes: [],
      colorScale: null,
      prevalenceThreshold: 0.85,
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
    this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold).subscribe(results => {
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
    addPango(selected) {
      this.selectedPango.push(selected.name);
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: this.selectedPango,
          gene: this.gene
        }
      })
    },
    deletePango(idx) {
      this.selectedPango.splice(idx);
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: this.selectedPango,
          gene: this.gene
        }
      })
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
