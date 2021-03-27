<template>
<div>
  <div class="my-2 mx-4 half-page text-left">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- SOCIAL MEDIA SHARE, BACK BTN -->
    <div class="d-flex align-items-center">
      <ShareReport title="title" url="url" />
    </div>

    <!-- REPORT HEADER -->
    <div class="d-flex flex-column text-light comparison-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
      <h3 class="m-0 mt-n1 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex flex-column align-items-start">

          <div class="d-flex align-items-end">
            <div class="d-flex align-items-center">
              <h1 class="m-0 font-weight-bold comparison-header">Lineage Comparison</h1>
              <button class="btn py-1 px-2 mx-4 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-locations-modal">
                <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'plus']" />add lineages
              </button>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
            </small>
            <div class="text-light font-size-2 ml-5" v-if="totalSequences">
              {{totalSequences}} sequences
            </div>
          </div>


        </div>
        <div class="d-flex flex-column align-items-end justify-content-between flex-shrink-0">
          <div class="d-flex align-items-center mb-1">
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
            </a>
          </div>
          <div class="d-flex align-items-center bright-hyperlink my-1">
            <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
            <router-link :to="{name:'SituationReportCaveats'}" class="bright-hyperlink">How to interpret these reports</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="d-flex flex-wrap align-items-center">
      <h1 class="mr-3">Lineage comparison</h1>
      <div class="d-flex flex-wrap">
        <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(lineage, lIdx) in selectedPango" :key="lIdx" @click="deletePango(lIdx)">
          <span>{{lineage}}</span>
          <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
        </button>
      </div>
    </div> -->

    <div id="select-lineages" class="my-3 p-2 bg-white border-top border-bottom">
      <h5>Selected lineages</h5>
      <div class="d-flex flex-wrap">
        <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(lineage, lIdx) in selectedPango" :key="lIdx" @click="deletePango(lIdx)">
          <span>{{lineage}}</span>
          <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
        </button>
        <button role="button" class="btn chip btn-main d-flex align-items-center py-1 px-2 mx-3 line-height-1" @click="clearPango()">
          clear lineages
        </button>
        <div style="width: 150px">
          <TypeaheadSelect :queryFunction="queryPangolin" @selected="addPango" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Add lineage" />
        </div>
        <button @click="addMutations()">Add E484K</button>
      </div>
    </div>

    <!-- LOOP OVER MUTATION HEATMAPS -->
    <div id="mutation-heatmaps">
      <div class="d-flex flex-wrap justify-content-between">
        <div>
          <h3 class="m-0">Mutation prevalence across lineages</h3>
          <p class="text-muted m-0">Mutations with > {{ prevalenceThresholdFormatted }} prevalence in at least one lineage</p>
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

      <!-- CHECKBOX TO SELECT GENES -->
      <div id="select-genes" class="d-flex flex-wrap align-items-center justify-content-between mt-3">
        <div class="d-flex flex-wrap">
          <small class="text-muted mr-2 align-self-start">include genes:</small>
          <label class="b-contain pr-3" v-for="(gene, idx) in geneOpts" :key="idx">
            <span>{{gene}}</span>
            <input type="checkbox" :id="gene" :value="gene" v-model.lazy="selectedGenes" @change="updateGenes()" />
            <div class="b-input"></div>
          </label>
        </div>
      </div>


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
</div>
</template>

<script>
import Vue from "vue";
import {
  findPangolin,
  getBasicComparisonReportData,
  getLineagesComparison,
  getMutationsByLineage
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

import {
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {
  faSync
} from "@fortawesome/free-solid-svg-icons/faSync";

library.add(faPlus, faTimesCircle, faSpinner, faSync, faInfoCircle);

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  mapState
} from "vuex";

import {
  scaleSequential,
  format
} from "d3";
import {
  uniq
} from "lodash";

export default {
  name: "SituationReportComparison",
  props: {
    pango: {
      type: Array,
      default: () => []
    },
    gene: {
      type: Array,
      default: () => [
        "S"
      ]
    }
  },
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    // ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    // Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    // ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    MutationHeatmap: () => import( /* webpackPrefetch: true */ "@/components/MutationHeatmap.vue"),
    GradientLegend: () => import( /* webpackPrefetch: true */ "@/components/GradientLegend.vue"),
    FontAwesomeIcon
  },
  computed: {
    ...mapState("genomics", ["locationLoading1", "locationLoading2"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2)
    },
    smallScreen() {
      return (window.innerWidth < 500)
    },
    selectedPango() {
      const merged = typeof(this.pango) == "string" ? [this.pango] : this.pango
      // const merged = typeof(this.pango) == "string" ? [this.pango, "average"] : this.pango.concat(["average"])
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
      selectedMutationQuery: "S:E484K",
      selectedMutationThreshold: 0.5,
      colorScale: null,
      prevalenceThreshold: 0.85,
      heatmapSubscription: null,
      basicSubscription: null,
      lineageByMutationsSubscription: null,
      totalSequences: null,
      lastUpdated: null,
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
    this.getData();
    this.queryPangolin = findPangolin;

    this.basicSubscription = getBasicComparisonReportData(this.$genomicsurl).subscribe(results => {
      this.totalSequences = results.total;
      this.lastUpdated = results.dateUpdated.lastUpdated;
    })
  },
  destroyed() {
    if (this.basicSubscription) {
      this.basicSubscription.unsubscribe();
    }
    if (this.heatmapSubscription) {
      this.heatmapSubscription.unsubscribe();
    }
    if (this.lineageByMutationsSubscription) {
      this.lineageByMutationsSubscription.unsubscribe();
    }
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
    getData() {
      this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold).subscribe(results => {
        console.log(results)
        this.mutationHeatmap = results;
      })
    },
    addMutations() {
      this.lineageByMutationsSubscription = getMutationsByLineage(this.$genomicsurl, this.selectedMutationQuery, this.selectedMutationThreshold).subscribe(results => {
        results.sort((a, b) => b.proportion - a.proportion);
        this.pango = uniq(this.selectedPango.concat(results.map(d => d.pangolin_lineage)));
        this.$router.push({
          name: "SituationReportComparison",
          query: {
            pango: this.pango,
            gene: this.selectedGenes
          }
        })
        this.getData();
      })
    },
    addPango(selected) {
      this.selectedPango.push(selected.name);
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: this.selectedPango,
          gene: this.selectedGenes
        }
      })
      this.getData();
    },
    clearPango() {
      this.selectedPango = [];
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: [],
          gene: this.selectedGenes
        }
      })
      this.getData();
    },
    deletePango(idx) {
      this.selectedPango.splice(idx, 1);
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          pango: this.selectedPango,
          gene: this.selectedGenes
        }
      })
      this.getData();
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

.gisaid {
    height: 25px;
}
</style>
