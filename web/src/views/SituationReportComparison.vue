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
      <div class="d-flex flex-wrap justify-content-between align-items-center">
        <div class="d-flex flex-column align-items-start">

          <div class="d-flex align-items-end">
            <div class="d-flex flex-wrap align-items-center">
              <h1 class="m-0 font-weight-bold comparison-header">Lineage Comparison</h1>
              <button class="btn py-1 px-2 mx-4 my-1 btn-grey flex-shrink-0" data-toggle="collapse" data-target="#select-lineages">
                <font-awesome-icon class="m-0 mr-2 font-size-small" :icon="['fas', 'sync']" />change lineages
              </button>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
            </small>
            <div class="text-grey font-size-2 ml-5" v-if="totalSequences">
              with <span class="text-light">{{totalSequences}} sequences</span> from GISAID
            </div>
          </div>


        </div>
        <div class="d-flex flex-column align-items-end justify-content-between flex-shrink-0">
          <div class="d-flex align-items-center mb-1 fa-lg">
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

    <div id="select-lineages" class="my-3 p-2 bg-white border-top border-bottom collapse">
      <div class="d-flex justify-content-between mt-1 mb-2">
        <h4>Selected lineages</h4>
        <font-awesome-icon class="mr-2" :icon="['far', 'times-circle']" :style="{'opacity': '0.6'}" data-toggle="collapse" data-target="#select-lineages" />
      </div>
      <div class="d-flex flex-wrap align-items-center">
        <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(lineage, lIdx) in selectedPango" :key="lIdx" @click="deletePango(lIdx)">
          <span>{{lineage}}</span>
          <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
        </button>
        <div class="ml-3">
          <label class="b-contain pr-4 m-0">
            <input type="checkbox" id="checkbox" v-model="includeSublineages" @change="changeInclSublineages">
            include sublineages
            <div class="b-input"></div>
          </label>
        </div>

        <button role="button" class="btn chip btn-main d-flex align-items-center py-1 px-2 mx-3 line-height-1" @click="clearPango()">
          clear lineages
        </button>
      </div>

      <div class="border-top pt-3 my-3 mb-1">
        <h4 class="mb-3">Add lineages</h4>
        <div class="d-flex flex-wrap justify-content-between">
          <div class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3">
            <h6 class="d-flex align-items-center">
              <div class="mr-2 circle">1</div>
              <span class="mr-1">By Variants of Concern &amp; Interest</span>
            </h6>
            <div class="d-flex flex-column align-items-center">
              <div class="d-flex mt-2 mb-2">
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addVOCs(false)">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add <b>VOCs</b>
                </button>
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addVOCs(true)">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add <b>VOCs</b>
                </button>
              </div>
              <div class="d-flex pt-2 border-top">
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addVOIs(false)">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add <b>VOIs</b>
                </button>
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addVOIs(true)">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add <b>VOIs</b>
                </button>
              </div>
            </div>
          </div>

          <div class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3">
            <h6 class="d-flex align-items-center">
              <div class="mr-2 circle">2</div>
              <span class="mr-1"></span><a href='https://cov-lineages.org/lineage_list.html' target='_blank'>WHO VOC/VOI sublineages</a>
            </h6>
            <div class="line-height-1" style="width: 200px">
              <div class="fa-sm mt-2 ml-2">&gt;&gt; Add all lineages associated with a WHO VOC / VOI</div>
            </div>

            <div class="d-flex flex-wrap align-items-center mt-3 justify-content-center">
              <select v-model="selectedWHO">
                <option v-for="(who, wIdx) in whoLineages" :key="wIdx" class="ml-2 px-2 py-1 btn btn-sec fa-sm text-no-transform">
                  {{ who }}
                </option>
              </select>
            </div>

            <div class="d-flex align-items-center justify-content-between my-3" style="width: 250px" v-if="selectedWHO">
              <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addWHO(false)">
                <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add <b>{{selectedWHO}}</b> lineages
              </button>
              <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addWHO(true)">
                <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add <b>{{selectedWHO}}</b> lineages
              </button>
            </div>

          </div>

          <div class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3">
            <h6 class="d-flex align-items-center">
              <div class="mr-2 circle">3</div>
              <span class="mr-1">By</span><a href='https://cov-lineages.org/lineage_list.html' target='_blank'>PANGO lineage</a>
            </h6>
            <div class="line-height-1" style="width: 200px">
              <div class="fa-sm mt-2 ml-2">&gt;&gt; Add a specific lineage</div>
            </div>
            <div class="d-flex h-100 align-items-center">
              <div style="width: 170px" class="align-self-middle">
                <TypeaheadSelect :queryFunction="queryPangolin" @selected="addPango" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Add lineage" />
              </div>
            </div>
          </div>

          <div class="mr-5 mb-3 bg-grey__lightest p-2 rounded mb-3">
            <h6 class="d-flex align-items-center p-0 m-0">
              <div class="mr-2 circle">4</div>
              Containing a mutation(s)
            </h6>

            <div class="d-flex flex-column">
              <div class="d-flex flex-column">
                <label for="add-mutation" class="fa-sm mt-2 ml-2" style="width: 300px">&gt;&gt; Find lineages with mutation(s) <span v-if="selectedMutationQuery">{{selectedMutationQuery}}</span> at &ge; {{selectedMutationThreshold}}%
                  prevalence</label>
                <div class="d-flex align-items-center">
                  <textarea id="add-mutation" class="form-control border" style="width: 200px" v-model="selectedMutationQuery" placeholder="S:E484K, ORF1a:DEL3675/3677" />

                  <span class="ml-2 mr-3">@ &ge;</span>
                  <div class="d-flex flex-column">
                    <small class="text-muted">min. prevalence</small>
                    <span class="percent-sign border border-radius-1 bg-white py-1">
                      <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 60px" v-model="selectedMutationThreshold" placeholder="0-100" />
                      <span class="mr-1">%</span>
                    </span>
                  </div>
                </div>
              </div>
              <div id="warnings" style="width: 400px" v-if="selectedMutationQuery && !mutationValid">
                <div class="warning">
                  Please check the mutation format:
                </div>
                <ul class="warning">
                  <li>
                    Add the gene before the mutation, like <b>"S:N501Y"</b>
                  </li>
                  <li>
                    Substitutions should be "{gene}:{original amino acid}{codon number}{new amino acid}" like <b>"S:E484K"</b>
                  </li>
                  <li>
                    Deletions should be "{gene}:DEL{start codon}/{end codon}" like <b>"ORF1a:DEL3675/3677"</b>
                  </li>
                  <li>
                    Separate mutations with commas like <b>"S:E484K,S:N501Y"</b>
                  </li>
                </ul>
              </div>

              <!-- select btns -->
              <small>
                <div class="d-flex align-items-center justify-content-between my-3" style="width: 250px" v-if="selectedMutationQuery">
                  <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addMutations()" :disabled="!mutationValid">
                    <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add {{selectedMutationQuery}}-containing lineages
                  </button>
                  <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="clearAddMutations()" :disabled="!mutationValid">
                    <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add {{selectedMutationQuery}}-containing lineages
                  </button>
                </div>
              </small>
            </div>
          </div>

          <div class="mr-5 mb-3 bg-grey__lightest p-2 rounded mb-3">
            <h6 class="d-flex align-items-center p-0 m-0">
              <div class="mr-2 circle">5</div>
              Prevalent in a location
            </h6>
            <div class="d-flex">
              <div class="d-flex flex-column" style="width: 250px">
                <label for="add-mutation" class="fa-sm line-height-1 mt-2 ml-2">&gt;&gt; Find lineages with &gt; {{selectedOtherThreshold}}% total prevalence in the last {{selectedWindow}} days <span v-if="selectedLocation">in
                    {{selectedLocation.label}}</span></label>
                <TypeaheadSelect :queryFunction="queryLocation" :selectedValue="selectedLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location"
                  totalLabel="total sequences" />
              </div>
              <div class="d-flex flex-column ml-3">
                <div class="d-flex flex-column">
                  <small class="text-muted">min. prevalence</small>
                  <span class="percent-sign border border-radius-1 bg-white py-1">
                    <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 60px" v-model="selectedOtherThreshold" placeholder="0-100" />
                    <span class="mr-1">%</span>
                  </span>
                </div>
                <div class="d-flex flex-column">
                  <small class="text-muted">over the last</small>
                  <span class="percent-sign border border-radius-1 bg-white py-1">
                    <input type="number" min="0" max="1000" class="flex-grow-0 px-2" style="width: 60px" v-model="selectedWindow" placeholder="num. days" />
                    <span class="mr-1">days</span>
                  </span>
                </div>
              </div>
            </div>

            <small>
              <div class="d-flex align-items-center justify-content-between my-3" style="width: 400px" v-if="locationValid">
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="addLocationLineages()">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />Add lineages in {{ selectedLocation.label }}
                </button>
                <button class="ml-2 px-2 py-1 btn btn-sec fa-sm" @click="clearAddLocationLineages()">
                  <font-awesome-icon class="mr-2" :icon="['fas', 'sync']" />clear &amp; add lineages in {{ selectedLocation.label }}
                </button>
              </div>

              <div v-else-if="selectedLocation" class="warning" style="width: 400px">
                <p class="warning" v-if="!selectedOtherThreshold || !(selectedOtherThreshold >= 0)">
                  Specify a minimum prevalence (<b>3%</b> by default)
                </p>
                <p class="warning" v-if="!(selectedWindow > 0)">
                  Specify a time window (over the last <b>60</b> days by default)
                </p>
              </div>
            </small>

          </div>


        </div>
      </div>
    </div>


    <!-- LOOP OVER MUTATION HEATMAPS -->
    <div id="mutation-heatmaps" class="mt-4">
      <!-- ADJUST PARAMS -->
      <div class="d-flex w-100 flex-column bg-white border-top border-bottom py-1 mb-3" :class="{'flex-wrap': smallScreen}">
        <div class="d-flex flex-wrap justify-content-between align-items-center" :class="{'flex-wrap': smallScreen}">
          <div class="dark-mode-helper" :data-tippy-info="darkModeHelper" style="margin-left: 90px;">
            <input class="checkbox" id="checkbox1" type="checkbox" v-model.lazy="darkMode" @change="routeDark" />
            <label for="checkbox1" class="checkbox-label">
              <span class="on">dark mode</span>
              <span class="off">light mode</span>
            </label>
          </div>

          <!-- CHECKBOX TO SELECT GENES -->
          <div id="select-genes" class="d-flex align-items-center justify-content-between ml-3">
            <small class="text-muted text-right mx-2 line-height-1">include genes:</small>
            <div class="d-flex flex-wrap">
              <label class="b-contain pr-3" v-for="(gene, idx) in geneOpts" :key="idx">
                <span>{{gene}}</span>
                <input type="checkbox" :id="gene" :value="gene" v-model.lazy="selectedGenes" @change="updateGenes()" />
                <div class="b-input"></div>
              </label>
            </div>
          </div>

          <div class="d-flex" style="margin-right: 90px;">
            <!-- MIN MUTATION % -->
            <div class="d-flex flex-column ml-3">
              <small class="text-muted line-height-1" style="width: 100px">Min. mutation prevalence</small>
              <div class="mt-2">
                <span class="percent-sign border border-radius-1 bg-white py-1">
                  <input type="number" min="0" max="100" class="flex-grow-0 px-2" style="width: 42px" v-model="prevalenceThreshold" />
                  <span class="mr-1">%</span>
                </span>
              </div>
            </div>

            <!-- MIN LINEAGE COUNT -->
            <div class="d-flex flex-column ml-3">
              <small class="text-muted line-height-1" style="width: 100px">Min. sequences per lineage</small>
              <div class="mt-2">
                <input type="number" min="1" class="flex-grow-0 px-2 border border-radius-1" style="width: 85px" v-model="countThreshold" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- OMICRON WARNING -->
      <div id="warning" class="w-100 mt-3" v-if="selectedPango && (selectedPango.includes('Omicron') || selectedPango.includes('omicron') || selectedPango.includes('B.1.1.529'))">
        <Warning text="As a newly designated Variant of Concern, Omicron / B.1.1.529 is highly in flux. Expect the characteristic mutations associated with Omicron and its prevalence across locations to change as more sequences are reported. outbreak.info updates daily with new data from GISAID." />
      </div>


      <!-- TITLE -->
      <div class="d-flex flex-wrap justify-content-between">
        <div class="d-flex align-items-center" :class="{'flex-wrap': mediumScreen}">
          <div class="d-flex flex-column">
            <div class="d-flex align-items-center">
              <h2 class="m-0">Mutation prevalence across lineages</h2>
              <button class="btn py-1 px-2 mx-4 my-2 btn-grey flex-shrink-0" data-toggle="collapse" data-target="#select-lineages">
                <font-awesome-icon class="m-0 mr-2 fa-xs" :icon="['fas', 'sync']" />
                <span class="fa-xs">change lineages</span>
              </button>
            </div>
            <div class="d-flex flex-wrap">
              <p class="text-muted line-height-1 m-0 my-1">Mutations with > {{ prevalenceThreshold }}% prevalence in at least one lineage.</p>
              <p class="text-muted font-weight-bold line-height-1 m-0 my-1 ml-2" v-if="countThreshold > 1">Lineages with fewer than {{countThreshold.toLocaleString()}} sequences have been removed.</p>
            </div>

          </div>

        </div>

        <!-- LEGEND -->
        <div id="legend" class="d-flex px-2 py-1 my-2" :class="{'bg-dark' : darkMode}">
          <GradientLegend maxValue="100%" :colorScale="colorScale" :dark="darkMode" label="Mutation prevalence in lineage" class="mr-3" />
          <div class="d-flex align-items-center">
            <svg width="24" height="24">
              <defs>
                <pattern id="diagonalHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:#AAA; stroke-width:0.75`" />
                </pattern>
              </defs>
              <rect x="2" y="2" width="20" height="20" fill="url(#diagonalHatch)" rx="4" stroke="#888" stroke-width="0.5"></rect>
            </svg>
            <small class="ml-2" :class="[darkMode ? 'text-light' : 'text-muted']">not detected</small>
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



      <div class="d-flex flex-wrap">
        <div v-for="(geneData, gIdx) in filteredMutationHeatmap" :key="gIdx" class="mr-4 mb-2">

          <template v-if="selectedGenes.includes(geneData.key)">
            <h4 class="m-0 text-dark">{{ geneData.key }}</h4>

            <!-- OMICRON INSERTION WARNING -->
            <Warning text="<p>Most Omicron sequences also contain a <b>3 amino acid insertion (EPE) at position 214 in the Spike</b> protein.</p> outbreak.info currently only reports substitution and deletion changes, due to the computational challenges with identifying insertions in 5+ million sequences every day. We’re working towards incorporating insertions into our data processing pipeline, and we encourage you to refer back to the sequence data available on GISAID for more information about these insertions." class="fa-sm mt-1 mb-2" :align_left="true" v-if="geneData.key == 'S' && selectedPango && (selectedPango.includes('Omicron') || selectedPango.includes('omicron') || selectedPango.includes('B.1.1.529'))" />

            <MutationHeatmap :data="geneData.values" :yDomain="selectedPango" :gene="geneData.key" :voc="voc" :voi="voi" :moc="moc" :moi="moi" :dark="darkMode" />
          </template>
        </div>
      </div>
      <DownloadReportData class="mt-3" :data="downloadableHeatmap" figureRef="mutation-heatmap" dataType="Mutation Report Heatmap" :darkMode="darkMode" />

    </div>

  </div>
  <div class="mx-5 text-left">

    <!-- METHODOLOGY -->
    <section class="mt-3 mb-5 border-top pt-3" id="methods">
      <h4>Methodology</h4>
      <ReportMethodology :dateUpdated="lastUpdated" :summary="true" />
      <Warning class="mt-2" :text="disclaimer" />
    </section>

    <!-- CITATION -->
    <section class="my-3 border-top pt-3">
      <h4 class="">Citing this report</h4>
      <p class="m-0">
        <b>{{ title }}</b>. {{ mutationAuthors }}. outbreak.info, (available at {{ url }}). Accessed {{ today }}.
      </p>
      <ShareReport :title="title" :url="url" />
    </section>

    <!-- ACKNOWLEDGEMENTS -->
    <ReportAcknowledgements class="border-top pt-3" />
  </div>
</div>
</template>

<script>
import Vue from "vue";
import {
  findPangolin,
  findLocation,
  getBasicComparisonReportData,
  getLineagesComparison,
  getComparisonByMutations,
  getComparisonByLocation,
  getBadMutations
} from "@/api/genomics.js";

import tippy from "tippy.js";
import 'tippy.js/themes/light.css';


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
  format,
  timeFormat
} from "d3";

import debounce from "lodash/debounce";
import uniq from "lodash/uniq";

export default {
  name: "SituationReportComparison",
  props: {
    pango: [Array, String],
    threshold: {
      type: [Number, String],
      default: 75
    },
    nthresh: {
      type: [Number, String],
      default: 1
    },
    dark: {
      type: [String, Boolean],
      default: true
    },
    sub: {
      type: [String, Boolean],
      default: false
    },
    gene: {
      type: [Array, String],
      default: () => [
        "ORF1a", "ORF1b", "S"
      ]
    }
  },
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    MutationHeatmap: () => import( /* webpackPrefetch: true */ "@/components/MutationHeatmap.vue"),
    GradientLegend: () => import( /* webpackPrefetch: true */ "@/components/GradientLegend.vue"),
    DownloadReportData: () => import( /* webpackPrefetch: true */ "@/components/DownloadReportData.vue"),
    FontAwesomeIcon
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"]),
    ...mapState("genomics", ["locationLoading1", "locationLoading2"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2)
    },
    smallScreen() {
      return (window.innerWidth < 500)
    },
    mediumScreen() {
      return (window.innerWidth < 1000)
    },
    locationValid() {
      return this.selectedLocation && this.selectedOtherThreshold && this.selectedOtherThreshold >= 0 && this.selectedWindow > 0 ? true : false;
    },
    mutationValid() {
      return /\w+:[A-z]\d+[A-z]/.test(this.selectedMutationQuery) || /\w+:DEL\d+/.test(this.selectedMutationQuery.toUpperCase());
    },
    darkModeHelper() {
      return (this.darkMode ? "Switch to <b>light mode</b> to focus on similarities between lineages" : "Switch to <b>dark mode</b> to emphasize mutations with low prevalence")
    }
  },
  watch: {
    countThreshold(newVal, oldVal) {
      if (oldVal && newVal != oldVal) {
        this.debounceCountThreshold();
      }
    },
    prevalenceThreshold(newVal, oldVal) {
      if (oldVal && newVal != oldVal) {
        this.debounceThreshold();
      }
    }
  },
  data() {
    return {
      today: null,
      url: null,
      darkMode: null,
      includeSublineages: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      title: "Lineage Comparison",
      queryPangolin: null,
      mutationHeatmap: null,
      filteredMutationHeatmap: null,
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
      lineageByLocationSubscription: null,
      totalSequences: null,
      lastUpdated: null,
      showSnackbar: false,
      snackbarText: null,
      selectedLocation: null,
      selectedOtherThreshold: 3,
      selectedNdayThreshold: 5,
      // selectedNdays: 60,
      selectedWindow: 60,
      queryLocation: null,
      voi: null, // array of all the VOIs, including sublineages
      voi_parent: null, // just the main lineages -- one lineage per VOI/VOC, such as Alpha, Beta, Gamma, Delta...
      voc: null,
      voc_parent: null,
      moi: null,
      moc: null,
      countThreshold: null,
      selectedWHO: null,
      whoLineages: [],
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
    const formatDate = timeFormat("%e %B %Y");
    this.currentTime = new Date();
    this.today = formatDate(this.currentTime);

    this.darkMode = this.dark == "true" || !!(this.dark) && this.dark != "false";
    this.includeSublineages = this.sub == "true" || !!(this.sub) && this.sub != "false";

    this.prevalenceThreshold = +this.threshold;
    this.countThreshold = +this.nthresh;

    this.colorScale = scaleSequential(interpolateRdPu);
    this.selectedGenes = typeof(this.gene) === "string" ? [this.gene] : this.gene;

    if (this.pango) {
      this.selectedPango = typeof(this.pango) === "string" ? [this.pango] : this.pango;
    }

    this.$nextTick(function() {
      // set URL for sharing, etc.
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;

      tippy(".dark-mode-helper", {
        content: "Loading...",
        maxWidth: "200px",
        placement: "right",
        animation: "fade",
        theme: "light",
        allowHTML: true,
        onShow(instance) {
          let info = instance.reference.dataset.tippyInfo;
          instance.setContent(info);
        }
      });
    })

    // load the initial data
    this.getData();
    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;

    this.basicSubscription = getBasicComparisonReportData(this.$genomicsurl).subscribe(results => {
      this.totalSequences = results.total;
      this.lastUpdated = results.dateUpdated.lastUpdated;
      this.whoLineages = results.who;
    })
  },
  created() {
    this.debounceThreshold = debounce(this.changeThreshold, 250);
    this.debounceCountThreshold = debounce(this.changeCountThreshold, 250);
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
    if (this.lineageByLocationSubscription) {
      this.lineageByLocationSubscription.unsubscribe();
    }
  },
  methods: {
    addVOCs(clear = true) {
      // remove lineages w/ additional mutations
      this.selectedPango = clear ? this.voc_parent :
        this.voc_parent.concat(this.selectedPango);
      this.selectedPango = uniq(this.selectedPango);

      this.showSnackbar = true;
      this.snackbarText = "Variants of Concern added"
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
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
        }
      })
      this.getData();
    },
    addVOIs(clear = true) {
      // remove lineages w/ additional mutations
      this.selectedPango = clear ? this.voi_parent :
        this.voi_parent.concat(this.selectedPango);
      this.selectedPango = uniq(this.selectedPango);

      this.showSnackbar = true;
      this.snackbarText = "Variants of Interest added"
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
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
        }
      })
      this.getData();
    },
    updateGenes() {
      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.pango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
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
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            sub: this.includeSublineages,
            dark: this.darkMode
          }
        })

        this.getData();
      }
    },
    changeCountThreshold() {
      if (this.countThreshold) {
        this.$router.push({
          name: "SituationReportComparison",
          params: {
            disableScroll: true
          },
          query: {
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            sub: this.includeSublineages,
            dark: this.darkMode
          }
        })
        // reapply the filter
        this.filteredMutationHeatmap = this.mutationHeatmap.map(gene => {
          return ({
            key: gene.key,
            values: gene.values.filter(d => d.lineage_count >= this.countThreshold)
          })
        })
        this.selectedPango = uniq(this.filteredMutationHeatmap.flatMap(d => d.values).map(d => d.pangolin_lineage));

      }
    },
    changeInclSublineages() {
      this.selectedPango = this.pango;
      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.pango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
        }
      })

      this.getData();
    },
    updateLocation(location) {
      this.selectedLocation = location;
    },
    getData() {
      const ofInterest = getBadMutations(true);
      this.moc = ofInterest.moc;
      this.moi = ofInterest.moi;

      this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold / 100, this.includeSublineages).subscribe(results => {
        this.prepResults(results);
      })
    },
    routeDark() {
      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.pango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
        }
      })
    },
    prepResults(results) {
      this.mutationHeatmap = results.data;
      this.filteredMutationHeatmap = results.data.map(gene => {
        return ({
          key: gene.key,
          values: gene.values.filter(d => d.lineage_count >= this.countThreshold)
        })
      })

      this.downloadableHeatmap = results.dataFlat;
      // update lineages to be the "fixed" names, to account for WHO / grouped names.
      this.selectedPango = uniq(this.filteredMutationHeatmap.flatMap(d => d.values).map(d => d.pangolin_lineage));

      this.voc = results.voc;
      this.voc_parent = results.voc_parent;
      this.voi = results.voi;
      this.voi_parent = results.voi_parent;
    },
    addMutations() {
      const selMutation = this.selectedMutationQuery.replace(/\s/g, "").split(",");
      this.lineageByMutationsSubscription = getComparisonByMutations(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold / 100, selMutation, this.selectedMutationThreshold / 100).subscribe(results => {
        this.showSnackbar = true;
        this.snackbarText = `${results.addedLength} lineages added`
        setTimeout(() => {
          this.showSnackbar = false;
        }, 5000);

        this.prepResults(results);

        this.$router.push({
          name: "SituationReportComparison",
          params: {
            disableScroll: true
          },
          query: {
            pango: results.yDomain,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            sub: this.includeSublineages,
            dark: this.darkMode
          }
        })

        // reset / clear
        this.selectedMutationQuery = null;
      })
    },
    addLocationLineages() {
      this.lineageByLocationSubscription = getComparisonByLocation(this.$genomicsurl, this.selectedPango, this.prevalenceThreshold / 100, this.selectedLocation.id, this.selectedOtherThreshold / 100, this.selectedNdayThreshold, this.selectedWindow,
        this.selectedWindow).subscribe(results => {
        this.showSnackbar = true;
        this.snackbarText = `${results.addedLength} lineages added`
        setTimeout(() => {
          this.showSnackbar = false;
        }, 5000);
        this.prepResults(results);

        this.$router.push({
          name: "SituationReportComparison",
          params: {
            disableScroll: true
          },
          query: {
            pango: results.yDomain,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            sub: this.includeSublineages,
            dark: this.darkMode
          }
        })

        // reset / clear
        this.selectedLocation = null;
      })
    },
    clearAddMutations() {
      this.selectedPango = [];
      this.addMutations();
    },
    clearAddLocationLineages() {
      this.selectedPango = [];
      this.addLocationLineages();
    },
    addWHO(clearPrevious = false) {
      // set new values
      if (clearPrevious) {
        this.selectedPango = [this.selectedWHO];
      } else {
        this.selectedPango.push(this.selectedWHO)
      }
      this.includeSublineages = true;

      this.showSnackbar = true;
      this.snackbarText = `${this.selectedWHO} lineages added`
      setTimeout(() => {
        this.showSnackbar = false;
      }, 5000);

      this.$router.push({
        name: "SituationReportComparison",
        params: {
          disableScroll: true
        },
        query: {
          pango: this.selectedPango,
          gene: this.selectedGenes,
          threshold: this.prevalenceThreshold,
          sub: true,
          dark: this.darkMode
        }
      })

      // reset / clear
      this.selectedWHO = null;
      this.getData();
    },
    addPango(selected) {
      this.selectedPango.push(selected.name);
      this.selectedPango = uniq(this.selectedPango);

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
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
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
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
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
          threshold: this.prevalenceThreshold,
          nthresh: this.countThreshold,
          sub: this.includeSublineages,
          dark: this.darkMode
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

.w-75px {
    width: 75px;
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

.border-radius-1 {
    border-radius: 0.25rem;
}

.percent-sign input {
    border: none;
    padding: 0;
    outline: none;
}

.warning {
    color: $warning-color;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
}
</style>
