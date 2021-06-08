<template>
<div>
  <div class="bg-main__darker mutation-banner border-top py-4">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 mutation-header font-weight-bold">Lineage <span class="mx-2">|</span> Mutation Tracker</h1>
  </div>

  <div class="my-2 mx-4 px-4">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <div class="mb-1">
      <img src="@/assets/sars-virus.svg" alt="map" class="bg-image" />
      <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex w-75 justify-content-around align-items-center">
          <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2">
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
            </a>
          </div>
        </div>

        <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19) variants with lineage and mutation reports, updated
          daily.
          Access curated reports below, or create your own <a href="#custom-report">custom reports</a> with any combination of lineages and/or mutations.
        </div>
        <div class="d-flex align-items-center justify-content-between my-2">
          <div id="date-updated" class="mr-2">
            <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
            </small>
          </div>
          <div id="sequence-count" class="ml-2 mr-5 text-highlight" v-if="total">
            {{total}} sequences
          </div>
        </div>

        <div class="d-flex flex-column text-left font-size-large bg-white border-top border-bottom p-2">
          <div class="d-flex flex-wrap">
            View:
            <router-link class="mx-3" :to="{ hash: '#voc' }">Variants of Concern</router-link>

            <div class="d-flex flex-column mx-3">
              <router-link :to="{ hash: '#voi' }" class="">Variants of Interest</router-link>
              <div class="text-muted text-size-xs mt-n1">a.k.a. Variants Under Investigation</div>
            </div>

            <router-link class="mx-3" :to="{ hash: '#moc' }">Mutations of Concern</router-link>

            <router-link class="mx-3" :to="{ hash: '#moi' }">Mutations of Interest</router-link>
          </div>
          <div class="d-flex justify-content-center mt-3 fa-sm">
            <button class="btn btn-grey-outline" data-toggle="collapse" href="#filter-classifiers">
              Filter reports
            </button>
          </div>

          <div id="filter-classifiers" class="mt-3 collapse">
            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">VOC classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                <span>{{curator.label}}</span>
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOC" @change="filterVOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">VOI classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                <span>{{curator.label}}</span>
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOI" @change="filterVOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">MOC classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0">
                <img :src="require(`@/assets/icon-01.svg`)" class="variant-logo mr-1" />
                <span>outbreak.info</span>
                <input type="checkbox" id="outbreak.info" value="outbeak" v-model.lazy="selectedMOC" @change="filterMOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">MOI classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0">
                <img :src="require(`@/assets/icon-01.svg`)" class="variant-logo mr-1" />
                <span>outbreak.info</span>
                <input type="checkbox" id="outbreak.info" value="outbeak" v-model.lazy="selectedMOI" @change="filterMOC()" />
                <div class="b-input"></div>
              </label>
            </div>
          </div>
          <div class="d-flex flex-column border-top mt-3 pt-2 w-100">
            <div class="align-self-center my-3">
              <div class="btn btn-main" data-toggle="collapse" href="#custom-report" aria-expanded="false">Select my own lineage and/or mutation(s)</div>
            </div>

            <section id="custom-report" class="collapse text-left">
              <CustomReportForm />
            </section>
          </div>
        </div>
      </div>

    </div>

    <section id="report-list" class="text-left">
      <!-- lineage groups -->
      <div class="lineage-group my-10" v-for="(group, i) in filteredReports" :key="i" :id="group.id + '-reports'">

        <div class="d-flex justify-content-between">
          <h2 class="mb-0" :id="group.id">{{ group.key | capitalize }} Reports</h2>
          <div class="d-flex align-items-center text-sec" v-if="i === 0">
            <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
            <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
          </div>
        </div>

        <small>
          <div class="line-height-1">
            <span class="text-highlight d-inline" v-html="getReportType(group.key)"></span>
            <a class='ml-2 d-inline' href='http://localhost:8080/situation-reports/caveats#variant'>Read more</a>
          </div>
        </small>


        <template v-if="group.values.length">
          <div class="d-flex flex-wrap align-items-center ml-3 my-3 border-top border-bottom bg-white py-2 justify-content-center">
            <small class="text-muted mr-2">include {{group.id.toUpperCase()}}s classified by:</small>
            <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
              <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
              <span>{{curator.label}}</span>
              <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOC" @change="filterVOC()" v-if="group.id == 'voc'" />
              <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOI" @change="filterVOC()" v-if="group.id == 'voi'" />
              <div class="b-input"></div>
            </label>
            <button class="btn btn-grey-outline py-1 m-0" @click="clearFilters">clear</button>
          </div>

          <table class="bg-white my-2">
            <thead class="text-uppercase bg-dark text-light">
              <tr class="border-bottom border-white">
                <th>
                  <div class="d-flex align-items-center">
                    variant
                    <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
                      <div class="input-group">
                        <input :id="'sBar' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                        <div class="input-group-prepend">
                          <span class="input-group-text text-muted border-0" id="sb">
                            <font-awesome-icon :icon="['fas', 'search']" />
                          </span>
                        </div>
                      </div>
                    </form>
                  </div>
                </th>
                <th>
                  classifications
                </th>
                <th>
                  first identified
                </th>
                <th>
                  total found
                </th>
                <th>
                  S-gene Mutations<sup>*</sup>
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="(report, rIdx) in group.values">
                <tr :key="rIdx" class="border-bottom" :class="{checkbook : rIdx%2-1}" :id="report.identifier">
                  <!-- name + synonyms -->
                  <td class="pt-2">
                    <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
                      <h3 class="m-0"><b>{{ report.mutation_name }}</b></h3>
                      <!-- <router-link class="btn btn-main" :to="{ name: 'MutationReport', query: report.reportQuery }">View report</router-link> -->

                    </router-link>

                    <small class="d-flex flex-column text-muted">
                      <div v-if="report.who_name">
                        WHO: <span class="font-weight-bold">{{report.who_name}}</span>
                      </div>
                      <div v-if="report.phe_name">
                        PHE: <span class="font-weight-bold">{{report.phe_name}}</span>
                      </div>
                      <div v-if="report.nextstrain_clade">
                        Nextstrain: <span class="font-weight-bold">{{report.nextstrain_clade}}</span>
                      </div>
                      <div v-if="report.gisaid_clade">
                        GISAID: <span class="font-weight-bold">{{report.gisaid_clade}}</span>
                      </div>
                      <div class="text-highlight d-flex flex-wrap" v-if="report.related">
                        <span class="mr-1">related:</span>
                        <span v-for="(related, rIdx) in report.related" :key="rIdx">
                          <router-link :to="{hash: related.identifier}" class="font-weight-bold">{{related.label}}</router-link>
                          <span class="mx-1" v-if="rIdx < report.related.length - 1">&bull;</span>
                        </span>
                      </div>
                    </small>
                  </td>

                  <!-- classifications -->
                  <td>
                    <table class="bordered">
                      <thead>
                        <tr class="fa-xs">
                          <th></th>
                          <th v-for="(curator, cIdx) in curatorOpts" :key="cIdx +'table'">
                            <img :src="require(`@/assets/${curator.src}`)" class="variant-logo" />
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr v-for="(variant, vIdx) in variantTypes" :key="vIdx">
                          <th>
                            <span :class="'tracked-variant-badge ' + variant + '-logo'">{{variant}}</span>
                          </th>

                          <td v-for="(curator, cIdx) in curatorOpts" :key="cIdx +'td'" :class="[report.classificationTable[variant] && report.classificationTable[variant][curator.id] ? variant + '-bg' : 'no-classification']">
                            <div v-if="report.classificationTable[variant]" class="border-inset">
                              <small class="line-height-1 tracked-variant-report" v-if="report.classificationTable[variant][curator.id] && report.classificationTable[variant][curator.id].report"
                                :data-tippy-info="report.classificationTable[variant][curator.id].ttip" v-html="report.classificationTable[variant][curator.id].report"></small>
                            </div>

                          </td>
                        </tr>

                      </tbody>

                    </table>
                  </td>

                  <td class="text-center line-height-1">
                    {{ report.location_first_identified }}
                  </td>

                  <td class="text-center">
                    {{ report.lineage_count }}
                  </td>

                  <!-- s-gene mutations heatmap -->
                  <td>
                    <div class="d-flex flex-column align-items-center bg-dark">
                      <MutationHeatmap :data="report.sMutations" gene="S" :yDomain="[report.mutation_name]" :onlyTopAxis="true" :moc="curatedMOC" :moi="curatedMOI" v-if="report.sMutations.length" />
                      <router-link class="text-light" :to="{ name: 'SituationReportComparison'}" v-if="report.sMutations.length">
                        <small>Explore all genes
                        </small>
                      </router-link>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>

          </table>

          <div class="mt-2">

            <div class="mt-2 d-flex justify-content-between align-items-center">
              <div class="flex-shrink-0">
                <sup class="text-muted mr-1">*</sup>
                <small class="text-muted">S-gene mutations appearing in at least {{charMutThreshold}} of sequences <router-link :to="{name: 'SituationReportMethodology', hash: '#characteristic'}" target="_blank">(read
                    more)
                  </router-link></small>
              </div>

              <DownloadReportData :data="group.values" dataType="Curated Variant List" reportType="curated-list" :downloadLabel="`${group.id} list`" :numSvgs="1000" class="mt-3" />
            </div>
          </div>
        </template>

        <div class="d-flex align-items-center my-3" v-else>
          <h5 class="text-muted m-0">No {{group.key}} reports found</h5>
          <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
            <div class="input-group">
              <input :id="'sBar-clear' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
              <div class="input-group-prepend">
                <span class="input-group-text text-muted border-0" id="sb">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
            </div>
          </form>

          <button class="btn btn-grey-outline py-1 m-0 ml-4" @click="clearFilters">clear filters</button>
        </div>
      </div>

      <!-- mutation groups -->
      <div class="mutation-group my-10" v-for="(group, i) in filteredMutations" :key="'mutation' + i" :id="group.id + '-reports'">
        <div class="d-flex justify-content-between">
          <h2 class="mb-0" :id="group.id">{{ group.key | capitalize }} Reports</h2>
        </div>
        <small>
          <div class="line-height-1">
            <span class="text-highlight d-inline" v-html="getReportType(group.key)"></span>
            <a class='ml-2 d-inline' href='http://localhost:8080/situation-reports/caveats#variant'>Read more</a>
          </div>
        </small>

        <template v-if="group.values.length">
          <table class="bg-white mt-2 w-100">
            <thead class="text-uppercase bg-dark text-light">
              <tr class="border-bottom border-white">
                <th>
                  <div class="d-flex align-items-center">
                    mutation
                    <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
                      <div class="input-group">
                        <input :id="'sBar-mutation' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                        <div class="input-group-prepend">
                          <span class="input-group-text text-muted border-0" id="sb">
                            <font-awesome-icon :icon="['fas', 'search']" />
                          </span>
                        </div>
                      </div>
                    </form>
                  </div>
                </th>
                <th>
                  prominent in <sup>**</sup>
                </th>
                <th>
                  total found
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="(report, rIdx) in group.values">
                <tr :key="rIdx" :class="{checkbook : rIdx%2-1}" :id="report.identifier">

                  <!-- name + synonyms -->
                  <td class="pt-2">
                    <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
                      <h3 class="m-0"><b>{{ report.mutation_name }}</b></h3>
                    </router-link>
                  </td>

                  <td>
                    <router-link class="btn btn-main-outline mx-1 my-1 py-0 px-1" :to="{name: 'MutationReport', query:{pango: lineage}}" v-for="(lineage, lIdx) in report.lineages" :key="lIdx">
                      {{lineage}}
                    </router-link>
                  </td>

                  <td>
                    {{ report.lineage_count }}
                  </td>
                </tr>

              </template>
            </tbody>
          </table>

          <div class="mt-2 d-flex justify-content-between align-items-center">
            <div class="flex-shrink-0">
              <sup class="text-muted mr-1">**</sup>
              <small class="text-muted">Lineages with the mutation in at least {{charMutThreshold}} of sequences
              </small>
            </div>

            <DownloadReportData :data="group.values" dataType="Curated Mutation List" reportType="curated-list" :downloadLabel="`${group.id} list`" :numSvgs="1000" class="mt-3" />
          </div>
        </template>
        <div class="d-flex align-items-center my-3" v-else>
          <h5 class="text-muted m-0">No {{group.key}} reports found</h5>
          <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
            <div class="input-group">
              <input :id="'sBar-clear-mut' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
              <div class="input-group-prepend">
                <span class="input-group-text text-muted border-0" id="sb">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
            </div>
          </form>

          <button class="btn btn-grey-outline py-1 m-0 ml-4" @click="clearFilters">clear filters</button>
        </div>

      </div>
    </section>

    <ReportAcknowledgements />
  </div>
</div>
</template>

<script>
import Vue from "vue";

// import ReportLogos from "@/components/ReportLogos.vue";
import ReportCard from "@/components/ReportCard.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import MutationHeatmap from "@/components/MutationHeatmap.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faSpinner,
  faInfoCircle,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faInfoCircle, faSearch);

import {
  mapState
} from "vuex";

import {
  format
} from "d3";

import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";

import {
  getReportList,
  getSequenceCount, getBadMutations
} from "@/api/genomics.js";

export default {
  name: "SituationReports",
  props: {
    voc: [Array, String],
    voi: [Array, String],
    moc: [Array, String],
    moi: [Array, String],
    name: String
  },
  components: {
    DownloadReportData,
    CustomReportForm,
    ReportAcknowledgements,
    FontAwesomeIcon,
    MutationHeatmap
  },
  computed: {
    ...mapState("admin", ["reportloading"]),
    ...mapState("genomics", ["characteristicThreshold"]),
    charMutThreshold() {
      return (format(".0%")(this.characteristicThreshold))
    }
  },
  methods: {
    clearFilters() {
      this.selectedVOC = [];
      this.selectedVOI = [];
      this.selectedMOC = [];
      this.selectedMOI = [];
      this.searchInput = null;
      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: true
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      })
    },
    getReportType(group) {
      return group.toLowerCase() == "variant of concern" ?
        "Variants with increased transmissibility, virulence, and/or decrease in therapeutic or vaccine efficacy" :
        group.toLowerCase() == "variant of interest" ? "Variants with community transmission, a cluster of cases, or detection in multiple countries" :
        group.toLowerCase() == "mutation of concern" ?
        "Mutations with evidence of increasing transmissibility or virulence or decreasing therapeutic/vaccine efficacy. <span class='text-underline'>However</span>, the phenotype of a variant depends on <b>all</b> its mutations, not any one particular mutation." :
        group.toLowerCase() == "mutation of interest" ?
        "Mutations suspected of causing a change in transmissibility, virulence, or therapeutic/vaccine efficacy. <span class='text-underline'>However</span>, the phenotype of a variant depends on <b>all</b> its mutations, not any one particular mutation." :
        null
    },
    filterVOC(disableScroll = true) {
      // cleanup empty values
      if (!this.selectedVOC[0]) {
        this.selectedVOC = [];
      }
      if (!this.selectedVOI[0]) {
        this.selectedVOI = [];
      }

      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: disableScroll
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      });
    },
    filterMOC(disableScroll = true) {
      // cleanup empty values
      if (!this.selectedMOC[0]) {
        this.selectedMOC = [];
      }
      if (!this.selectedMOI[0]) {
        this.selectedMOI = [];
      }

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: disableScroll
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      });
    },
    route2Filtered(org, type) {
      if (type == "VOC") {
        this.selectedVOC = [org];
        this.selectedVOI = [];
        this.selectedMOC = [];
        this.selectedMOI = [];
      }
      if (type == "VOI" || type == "VUI") {
        this.selectedVOI = [org];
        this.selectedVOC = [];
        this.selectedMOC = [];
        this.selectedMOI = [];
      }

      this.filterVOC(false);
    },
    route2OutbreakClass(anchorID) {
      // clear anything that's selected
      this.clearFilters();
      this.$router.push({
        name: "SituationReports",
        query: {},
        hash: `#${anchorID}`
      })
    },
    filterName() {
      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: true
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      })
    },
    filterReports() {
      this.filteredReports = cloneDeep(this.reports);
      this.filteredMutations = cloneDeep(this.mutationReports);

      if (this.selectedVOC.length || this.selectedVOI.length || this.searchInput) {
        // filter the selected VOC/VOI
        this.filteredReports.forEach(group => {
          let filtered = [];
          group.values.forEach(report => {
            report["sMutations"] = report.mutations.filter(x => x.gene == "S");

            if (report.classifications && (this.selectedVOC.length || this.selectedVOI.length)) {
              // filter name filters
              if (this.searchInput) {
                if (report.mutation_synonyms.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase())) &&
                  (report.classifications.filter(x => x.variantType == "VOC" && this.selectedVOC.includes(x.author)).length ||
                    report.classifications.filter(x => (x.variantType == "VOI" || x.variantType == "VUI") &&
                      this.selectedVOI.includes(x.author)).length)) {
                  filtered.push(report);
                }
              } else {
                if (report.classifications.filter(x => x.variantType == "VOC" && this.selectedVOC.includes(x.author)).length || report.classifications.filter(x => (x.variantType == "VOI" || x.variantType == "VUI") && this.selectedVOI
                    .includes(x
                      .author))
                  .length) {
                  filtered.push(report);
                }
              }
            } else {
              // no report classifications
              if (report.mutation_synonyms.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase()))) {
                filtered.push(report);
              }
            }
          })

          group.values = filtered;
        })

        // filter mutation reports
        if (this.searchInput) {
          this.filteredMutations.forEach(group => {
            let mutFiltered = [];
            group.values.forEach(report => {
              if (report.mutation_name.toLowerCase().includes(this.searchInput.toLowerCase()) || report.lineages.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase()))) {
                mutFiltered.push(report);
              }
            })
            group.values = mutFiltered;
          })
        }

      } else {
        // no filters applied
        this.filteredReports.forEach(report => {
          report.values.forEach(d => {
            d["sMutations"] = d.mutations.filter(x => x.gene == "S");
          })
        })
      }
    }
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      curatedSubscription: null,
      totalSubscription: null,
      lastUpdated: null,
      total: null,
      reports: null,
      mutationReports: null,
      filteredReports: null,
      filteredMutations: null,
      variantTypes: ["VOC", "VOI", "VUM"],
      curatedMOC: null,
      curatedMOI: null,
      curatorOpts: [{
          id: "outbreak",
          label: "outbreak.info",
          src: "icon-01.svg"
        }, {
          id: "CDC",
          label: "CDC",
          src: "resources/cdc-logo.svg"
        }, {
          id: "ECDC",
          label: "ECDC",
          src: "resources/ecdc-logo.png"
        },
        {
          id: "PHE",
          label: "Public Health England",
          src: "resources/PHE-logo-square.png"
        }, {
          id: "WHO",
          label: "WHO",
          src: "resources/who-emblem.svg"
        }
      ],
      searchInput: "",
      selectedVOC: [],
      selectedVOI: [],
      selectedMOC: [],
      selectedMOI: []
    }
  },
  mounted() {
    this.selectedVOC = this.voc ? typeof(this.voc) == "string" ? [this.voc] : this.voc : [];
    this.selectedVOI = this.voi ? typeof(this.voi) == "string" ? [this.voi] : this.voi : [];
    this.searchInput = this.name;

    const ofInterest = getBadMutations(true);
    this.curatedMOC = ofInterest.moc;
    this.curatedMOI = ofInterest.moi;

    this.curatedSubscription = getReportList(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      this.reports = results.md;
      this.mutationReports = results.mutations;
      this.filterReports();
    })

    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, true).subscribe(total => {
      this.total = total;
    })

  },
  created: function() {
    this.debounceSearch = debounce(this.filterName, 250);
  },
  updated() {
    tippy(".tracked-variant-report", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      allowHTML: true,
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  },
  beforeDestroyed() {
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }

    if (this.totalSubscription) {
      this.totalSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
}

$mutation-width: 275px;
.mutation-name {
    flex: 0 0 $mutation-width;
    width: $mutation-width;
    // flex-basis: $mutation-width !important;
    // flex-grow: 0 !important;
    // flex-shrink: 0 !important;
    // width: $mutation-width;
}

.mutation-map {
    min-width: 0;
}

.bg-image {
    width: 16%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: -1;
}

.font-size-large {
    font-size: large;
}

td {
    padding: 0.5rem 0.75rem;
}

th {
    padding: 0.25rem 0.5rem;
    font-weight: 400;
    text-align: center;
}

.checkbook {
    background: lighten($base-grey,70%);
}

$voc-height: 20px;

.variant-logo {
    height: $voc-height;
}

.tracked-variant-badge {
    color: white;
    font-weight: 700;
    font-size: $voc-height * 0.75;
    display: flex;
    align-items: center;
    justify-content: center;
    height: $voc-height;
    line-height: $voc-height;
    padding: 0 0.25rem;
    text-align: center;
    border-radius: 0.25rem;
}

.MOC-logo,
.VOC-logo {
    // border: 2px solid $publication-color;
    // color: $publication-color;
    background: $publication-color;
}

.VOC-bg {
    background: lighten($publication-color, 33%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $publication-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.MOI-logo,
.VOI-logo,
.VUI-logo {
    background: $website-color;
    // border: 2px solid $website-color;
    // color: $website-color;
    // border-left: 4px solid lighten($website-color, 23%);
}

.VOI-bg {
    background: lighten($website-color, 37%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $website-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

$vum-color: #edc949;
.VUM-logo {
    background: lighten($vum-color, 20%);
    color: darken($vum-color, 20%);
    // border-left: 4px solid lighten($vum-color, 0%);
}

.VUM-bg {
    background: lighten($vum-color, 33%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $vum-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.none-logo {
    background: #DDD;
    color: #888;
    height: $voc-height;
    border-left: 4px solid #BBB;
    padding: 0 0.25rem;
    font-weight: 400;
}

.variant-logo-large {
    height: $voc-height * 1.0;
    font-size: $voc-height * 1.0 * 0.75;
}

.text-size-xs {
    font-size: x-small;
}

.opacity-0 {
    opacity: 0;
}

.bordered td,
.bordered th {
    padding: 0.25rem 0.5rem;
    text-align: center;
    line-height: 1em;
}

.bordered td {
    border: 1px solid #dee2e6;
    width: 95px;
    height: 10px;
}

.my-10 {
    margin-bottom: 6rem;
    margin-top: 6rem;
}
</style>
