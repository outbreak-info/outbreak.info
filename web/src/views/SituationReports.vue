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
          <div class="d-flex flex-column">
            View:
            <div class="d-flex align-items-center justify-content-between my-2">
              <router-link :to="{ hash: '#voc' }">Variants of Concern</router-link>
              <div class="d-flex flex-wrap align-items-center ml-3">
                <small class="text-muted mr-2">classified by:</small>
                <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                  <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                  <span>{{curator.label}}</span>
                  <input type="checkbox" :id="curator.label" :value="curator.label" v-model.lazy="selectedVOC" @change="updateVOC()" />
                  <div class="b-input"></div>
                </label>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between my-2">
              <router-link :to="{ hash: '#voi' }">Variants of Interest</router-link>
              <div class="d-flex flex-wrap align-items-center ml-3">
                <small class="text-muted mr-2">classified by:</small>
                <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                  <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                  <span>{{curator.label}}</span>
                  <input type="checkbox" :id="curator.label" :value="curator.label" v-model.lazy="selectedVOI" @change="updateVOI()" />
                  <div class="b-input"></div>
                </label>
              </div>
            </div>

            <div class="d-flex my-2">
              <router-link :to="{ hash: '#moc' }">Mutations of Concern</router-link>
              <router-link :to="{ hash: '#moi' }" class="mx-5">Mutations of Interest</router-link>
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

      <!-- lineage or mutation -->
      <div class="mutation-group mb-5" v-for="(group, i) in filteredReports" :key="i" :id="group.key.replace(' + ', '_')">
        <div class="d-flex justify-content-between">
          <h2 class="mb-0">{{ group.key | capitalize }} Reports</h2>
          <div class="d-flex align-items-center text-sec" v-if="i === 0">
            <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
            <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
          </div>
        </div>

        <small class="text-highlight" v-html="getReportType(group.key)"></small>

        <table class="bg-white m-auto">
          <thead class="text-uppercase">
            <tr>
              <th>

              </th>

              <th class="pointer" @click="sortVar('mutation_name', group.values)">
                variant
                <font-awesome-icon class="ml-1 text-muted" :icon="['fas', 'sort-alpha-down']" v-if="tableSortVar == 'mutation_name' && tableSortAsc" />
                <font-awesome-icon class="ml-1 text-muted" :icon="['fas', 'sort-alpha-down-alt']" v-if="tableSortVar == 'mutation_name' && !tableSortAsc" />
              </th>

              <th>
                classification
              </th>

              <th class="pointer" @click="sortVar('location_first_identified', group.values)">
                first identified
                <font-awesome-icon class="ml-1 text-muted" :icon="['fas', 'sort-alpha-down']" v-if="tableSortVar == 'location_first_identified' && tableSortAsc" />
                <font-awesome-icon class="ml-1 text-muted" :icon="['fas', 'sort-alpha-down-alt']" v-if="tableSortVar == 'location_first_identified' && !tableSortAsc" />
              </th>

              <th>
                Mutations<sup>*</sup>
              </th>
              <th>

              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, rIdx) in group.values" :key="rIdx" class="checkbook" :id="report.identifier">
              <td class="align-middle">
                <router-link :to="{ hash: '#voc', params: {} }" class="tracked-variant-badge pointer" v-if="report.variantType == 'Variant of Concern'" data-tippy-info="Show outbreak.info Variants of Concern">
                  <img src="@/assets/icon-01.svg" class="variant-logo-large" />
                  <span class="ml-1 voc-logo variant-logo-large">VOC</span>
                </router-link>
                <router-link :to="{ hash: '#voi', params: {} }" class="tracked-variant-badge pointer" v-if="report.variantType == 'Variant of Interest'" data-tippy-info="Show outbreak.info Variants of Interest">
                  <img src="@/assets/icon-01.svg" class="variant-logo-large" />
                  <span class="ml-1 voi-logo variant-logo-large">VOI</span>
                </router-link>
                <small>{{ report.dateModified }}
                </small>
              </td>

              <td style="width: 200px">
                <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
                  <h4 class="m-0"><b>{{ report.mutation_name }}</b></h4>
                </router-link>
                <div class="d-flex flex-column text-muted line-height-1">
                  <small v-if="report.mutation_synonyms && report.mutation_synonyms.length"><span>a.k.a. </span>
                    <span v-for="(synonym, sIdx) in report.mutation_synonyms" :key="sIdx">
                      <b>{{ synonym }}</b>
                      <span v-if="sIdx < report.mutation_synonyms.length - 1">, </span></span>
                  </small>
                </div>
              </td>

              <td class="" style="width:385px">
                <div class="d-flex flex-wrap">
                  <div v-for="(curated, cIdx) in report.classifications" :key="cIdx">
                    <div class="d-flex flex-column align-items-center mr-3" style="width:75px">
                      <div class="tracked-variant-badge">
                        <img src="@/assets/resources/cdc-logo.svg" class="variant-logo" v-if="curated.author == 'CDC'" />
                        <img src="@/assets/resources/PHE-logo-square.png" class="variant-logo" v-if="curated.author == 'PHE'" />
                        <img src="@/assets/resources/who-emblem.svg" class="variant-logo bg-white" v-if="curated.author == 'WHO'" />
                        <img src="@/assets/resources/ecdc-logo.png" class="variant-logo bg-white" v-if="curated.author == 'ECDC'" />
                        <span :class="[
              		     curated.variantType == 'VOC' ? 'voc-logo' : 'voi-logo',
              		     ]">{{curated.variantType}}</span>
                      </div>
                      <small>
                        <a target="_blank" v-if="curated.dateModified && curated.url" :href="curated.url">{{curated.dateModified}}</a>
                        <a target="_blank" v-else-if="curated.url" :href="curated.url">report</a>
                        <span v-else>{{ curated.dateModified }}</span>
                      </small>
                    </div>
                  </div>
                </div>
              </td>

              <td>
                {{ report.location_first_identified }}
              </td>

              <td>
                <div class="d-flex flex-wrap">

                  <span v-for="(mutation, mIdx) in report.mutations" :key="mIdx">
                    <router-link :to="{ name: 'MutationReport', query: {muts: mutation.mutation} }">
                      <span v-if="mutation.type == 'substitution'">{{mutation.gene}}:<b>{{mutation.ref_aa}}{{mutation.codon_num}}{{mutation.alt_aa}}</b></span>
                      <span v-else>{{mutation.gene}}:<b>{{mutation.mutation.split(":")[1].toUpperCase()}}</b></span>
                    </router-link>
                    <span v-if="mIdx < report.mutations.length - 1" class="mr-1">,</span>
                  </span>
                </div>

                <router-link class="btn btn-main-outline mt-2 px-2 py-0" :to="{ name: 'SituationReportComparison', query: {pango: report.pangolin_lineage }}">
                  <small>View mutation frequency
                  </small>
                </router-link>
                <router-link class="btn btn-main-outline ml-2 mt-2 px-2 py-0" :to="{ name: 'SituationReportComparison', query: {pango: report.pangolin_lineage }}">
                  <small>Compare lineages
                  </small>
                </router-link>
              </td>

              <td>
                <router-link class="btn btn-main" :to="{ name: 'MutationReport', query: report.reportQuery }">View report</router-link>
                <div class="text-highlight line-height-1 fa-sm mt-2" v-if="report.related">
                  related:
                  <span v-for="(related, rIdx) in report.related" :key="rIdx">
                    <router-link :to="{hash: related.identifier}">{{related.label}}</router-link>
                    <span class="mx-1" v-if="rIdx < report.related.length - 1">&bull;</span>
                  </span>
                </div>
              </td>

            </tr>
          </tbody>
        </table>

        <sup class="text-muted mr-1 mt-1">*</sup><small class="text-muted">Mutations appearing in at least {{charMutThreshold}} of sequences <router-link :to="{name: 'SituationReportMethodology', hash: '#characteristic'}" target="_blank">(read more)
          </router-link></small>

        <!-- report cards (heh) (Oh I hated these :p) -->
        <!-- <div class="row mt-3">
          <div class="col-sm-6 col-md-4 col-lg-4 mb-3 d-flex report-group" v-for="(report, rIdx) in group.values" :key="rIdx" id="mutation-report">
            <div class="w-100 p-3 card">
              <ReportCard :report="report" />

            </div>
          </div>
        </div> -->

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
  faSortAlphaDown,
  faSortAlphaDownAlt
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faInfoCircle, faSortAlphaDown, faSortAlphaDownAlt);

import {
  mapState
} from "vuex";

import {
  format
} from "d3";

import {
  getReportList,
  getSequenceCount
} from "@/api/genomics.js";

export default {
  name: "SituationReports",
  props: {
    voc: [Array, String],
    voi: [Array, String]
  },
  components: {
    // ReportCard,
    CustomReportForm,
    ReportAcknowledgements,
    FontAwesomeIcon
  },
  computed: {
    ...mapState("admin", ["reportloading"]),
    ...mapState("genomics", ["characteristicThreshold"]),
    charMutThreshold() {
      return (format(".0%")(this.characteristicThreshold))
    }
  },
  methods: {
    getReportType(group) {
      return group.toLowerCase() == "variant of concern" ?
        "Variants with increased transmissibility, virulence, and/or decrease in therapeutic or vaccine efficacy<a class='ml-2' href='http://localhost:8080/situation-reports/caveats#variant'>read more</a>" :
        (group.toLowerCase() == "lineage + mutation" ? "sequences classified as a particular <a href='https://cov-lineages.org/lineages.html' target='_blank'>PANGO lineage</a> with added mutations" :
          "sequences with a particular mutation(s)")
    },
    sortVar(varName, reportGroup) {
      if (varName == this.tableSortVar) {
        this.tableSortAsc = !this.tableSortAsc;
      } else {
        this.tableSortVar = varName;
        this.tableSortAsc = true;
      }
      if (this.tableSortAsc) {
        reportGroup.sort((a, b) => a[varName] < b[varName] ? -1 : 1)
      } else {
        reportGroup.sort((a, b) => a[varName] > b[varName] ? -1 : 1)
      }
    },
    updateVOC() {
      console.log("VOC")
    },
    updateVOI() {
      console.log("VOC")
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
      filteredReports: null,
      tableSortVar: "mutation_name",
      tableSortAsc: true,
      // sort in alpha order
      curatorOpts: [{
          label: "outbreak.info",
          src: "icon-01.svg"
        }, {
          label: "CDC",
          src: "resources/cdc-logo.svg"
        }, {
          label: "ECDC",
          src: "resources/ecdc-logo.png"
        },
        {
          label: "Public Health England",
          src: "resources/PHE-logo-square.png"
        }, {
          label: "WHO",
          src: "resources/who-emblem.svg"
        }
      ],
      selectedVOC: [],
      selectedVOI: []
    }
  },
  mounted() {
    this.curatedSubscription = getReportList(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      this.reports = results.md;
      console.log(this.reports)
      this.filteredReports = this.reports;
    })
    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, true).subscribe(total => {
      this.total = total;
    })
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
    padding: 0.5rem;
}

th {
    padding: 0.25rem 0.5rem;
    font-weight: 400;
}

.checkbook:nth-child(2n+1) {
    background: lighten($base-grey,70%);
    border-bottom: 1px solid #dee2e6!important;
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
    // padding: 0.25rem 0.5rem 0.25rem 0.35rem;
    // border-radius: 0.25rem;
}

.voc-logo {
    // border: 2px solid $publication-color;
    // color: $publication-color;
    background: $publication-color;
    height: $voc-height;
    border-left: 4px solid lighten($publication-color, 20%);
    padding: 0 0.25rem;
}

.voi-logo {
    background: $website-color;
    // border: 2px solid $website-color;
    // color: $website-color;
    height: $voc-height;
    border-left: 4px solid lighten($website-color, 23%);
    padding: 0 0.25rem;
}

.variant-logo-large {
    height: $voc-height * 1.25;
    font-size: $voc-height * 1.25 * 0.75;
}
</style>
