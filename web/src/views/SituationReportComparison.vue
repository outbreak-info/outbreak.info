<template>
<div>
  <div class="my-2 mx-4 half-page text-left">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <p class="snackbar snackbar-accent" :class="{ show: showSnackbar }">
      {{ snackbarText }}
    </p>

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
              <button class="btn py-1 px-2 mx-4 my-0 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-locations-modal">
                <font-awesome-icon class="m-0 mr-2 font-size-small" :icon="['fas', 'plus']" />add lineages
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
      </div>

      <div class="border-top pt-2 mt-2">
        <h5>Add lineages</h5>
        <div class="d-flex flex-wrap">
          <div class="mr-5">
            <h6 class="d-flex align-items-center">
              <div class="mr-2 circle">1</div>
              <span class="mr-1">By</span><a href='https://cov-lineages.org/lineages.html' target='_blank'>PANGO lineage</a>
            </h6>
            <div style="width: 170px">
              <TypeaheadSelect :queryFunction="queryPangolin" @selected="addPango" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Add lineage" />
            </div>
          </div>

          <div class="mr-5 mb-3">
            <h6 class="d-flex align-items-center p-0 m-0">
              <div class="mr-2 circle">2</div>
              Containing a mutation(s)
            </h6>
            <small class="text-muted mb-1" v-if="selectedMutationQuery">Add all lineages w/ mutations {{selectedMutationQuery}} &ge; {{selectedMutationThreshold}}% prevalence in lineage</small>
            <div class="d-flex">
              <div class="d-flex flex-column">
                <label for="add-mutation" class="fa-sm">Find lineages with mutation(s)</label>
                <div class="d-flex align-items-center">
                  <textarea id="add-mutation" class="form-control border" style="width: 100px" v-model="selectedMutationQuery" placeholder="S:E484K, S:N501Y" />

                  <span class="ml-2 mr-3">@ &ge;</span>
                  <span class="percent-sign border bg-white py-1">
                    <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 60px" v-model="selectedMutationThreshold" placeholder="0-100" />
                    <span class="mr-1">%</span>
                  </span>
                </div>
              </div>
              <small>
                <div class="d-flex flex-column ml-3" style="width: 200px">
                  <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addMutations()" v-if="selectedMutationQuery">
                    <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add {{selectedMutationQuery}}-containing lineages
                  </button>
                  <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="clearAddMutations()" v-if="selectedMutationQuery">
                    <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add {{selectedMutationQuery}}-containing lineages
                  </button>
                </div>
              </small>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- LOOP OVER MUTATION HEATMAPS -->
    <div id="mutation-heatmaps">
      <div class="d-flex flex-wrap justify-content-between">
        <div class="d-flex align-items-center">
          <div>
            <h3 class="m-0">Mutation prevalence across lineages</h3>
            <p class="text-muted m-0">Mutations with > {{ prevalenceThreshold }}% prevalence in at least one lineage</p>
          </div>
          <div class="d-flex flex-column ml-3">
            <small class="text-muted">Min. mutation prevalence</small>
            <div class="mt-2">
              <span class="percent-sign border bg-white py-1">
                <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 60px" v-model="prevalenceThreshold" @change="debounceThreshold" />
                <span class="mr-1">%</span>
              </span>
            </div>
          </div>
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
          <div class="d-flex justify-content-center align-items-center ml-3">
            <span class="mr-3 line-height-1 fa-sm flex-shrink-1 text-center w-75px" style="color: #fb5759">
              Variant / Mutation of Concern
            </span>
            <span class="line-height-1 fa-sm  flex-shrink-1 text-center w-75px" style="color: #feb56c">
              Variant / Mutation of Interest
            </span>
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
            <MutationHeatmap :data="geneData.values" :yDomain="selectedPango" :gene="geneData.key" :voc="voc" :voi="voi" :moc="moc" :moi="moi" />
          </template>
        </div>
      </div>
      <DownloadReportData class="mt-3" :data="downloadableHeatmap" figureRef="mutation-heatmap" dataType="Mutation Report Heatmap" :darkMode="true" />

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
  getComparisonByMutations,
  getMutationsByLineage
} from "@/api/genomics.js";

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

import debounce from "lodash/debounce";

export default {
  name: "SituationReportComparison",
  props: {
    pango: Array,
    threshold: {
      type: Number,
      default: 75
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
    DownloadReportData: () => import( /* webpackPrefetch: true */ "@/components/DownloadReportData.vue"),
    FontAwesomeIcon
  },
  computed: {
    ...mapState("genomics", ["locationLoading1", "locationLoading2"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2)
    },
    smallScreen() {
      return (window.innerWidth < 500)
    }
  },
  data() {
    return {
      queryPangolin: null,
      mutationHeatmap: null,
      downloadableHeatmap: null,
      selectedGenes: [],
      selectedPango: null,
      selectedMutationQuery: null,
      selectedMutationThreshold: 50,
      colorScale: null,
      prevalenceThreshold: null,
      heatmapSubscription: null,
      basicSubscription: null,
      lineageByMutationsSubscription: null,
      totalSequences: null,
      lastUpdated: null,
      showSnackbar: false,
      snackbarText: null,
      voi: null,
      voc: null,
      moi: ["S477N", "N501Y", "K417N", "K417T", "P681H", "L18F", "S494P", "L452R", "Y453F", "N439K"],
      moc: ["E484K"],
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
    this.prevalenceThreshold = +this.threshold;
    this.colorScale = scaleSequential(interpolateRdPu);
    this.selectedGenes = typeof(this.gene) === "string" ? [this.gene] : this.gene;

    if (this.pango) {
      this.selectedPango = typeof(this.pango) === "string" ? [this.pango] : this.pango;
    }

    // load the initial data
    this.getData();
    this.queryPangolin = findPangolin;

    this.basicSubscription = getBasicComparisonReportData(this.$genomicsurl).subscribe(results => {
      this.totalSequences = results.total;
      this.lastUpdated = results.dateUpdated.lastUpdated;
    })
  },
  created() {
    this.debounceThreshold = debounce(this.changeThreshold, 250);
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
        params: {
          disableScroll: true
        },
        query: {
          pango: this.pango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold
        }
      })
    },
    changeThreshold() {
      if (this.prevalenceThreshold) {
        this.$router.push({
          name: "SituationReportComparison",
          params: {
            disableScroll: true
          },
          query: {
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold
          }
        })

        this.getData();
      }
    },
    getData() {
      this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold / 100).subscribe(results => {
        this.mutationHeatmap = results.data;
        this.downloadableHeatmap = results.dataFlat;
        this.selectedPango = results.yDomain;
        this.voc = results.voc;
        this.voi = results.voi;
      })
    },
    addMutations() {
      const selMutation = this.selectedMutationQuery.replace(/\s/g, "");
      this.lineageByMutationsSubscription = getComparisonByMutations(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold / 100, selMutation, this.selectedMutationThreshold / 100).subscribe(results => {
        this.showSnackbar = true;
        this.snackbarText = `${results.addedLength} lineages added`
        setTimeout(() => {
          this.showSnackbar = false;
        }, 5000);
        this.mutationHeatmap = results.data;
        this.downloadableHeatmap = results.dataFlat;
        this.selectedPango = results.yDomain;
        this.voc = results.voc;
        this.voi = results.voi;

        this.$router.push({
          name: "SituationReportComparison",
          params: {
            disableScroll: true
          },
          query: {
            pango: results.yDomain,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold
          }
        })

        // reset / clear
        this.selectedMutationQuery = null;
      })
    },
    clearAddMutations() {
      this.selectedPango = [];
      this.addMutations();
    },
    addPango(selected) {
      this.selectedPango.push(selected.name);
      this.showSnackbar = true;
      this.snackbarText = `${selected.name} added`
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000);

      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.selectedPango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold
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
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold
        }
      })
      this.mutationHeatmap = null;
    },
    deletePango(idx) {
      this.selectedPango.splice(idx, 1);
      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.selectedPango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold
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

$circle-width: 1.35em;
$circle-width-sm: 1.1em;
.circle {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    color: white;
    background: $secondary-color;
    font-size: calc(#{$circle-width} * 0.9);
    width: $circle-width;
    height: $circle-width;
}

.circle-sm {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    color: white;

    font-size: calc(#{$circle-width} * 0.9);
    background: $secondary-color;
    width: $circle-width-sm;
    height: $circle-width-sm;
}

.percent-sign {
    border-radius: 0.25rem;
}

.percent-sign input {
    border: none;
    padding: 0;
    outline: none;
}
</style>
