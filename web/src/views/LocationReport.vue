<template>
<div class="my-4 half-page text-left" :class="[smallScreen ? 'mx-5' : 'mx-2']">
  <!-- LOADING -->
  <div v-if="reportloading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>
  <!-- CHANGE LOCATION MODAL -->
  <!-- <div id="change-locations-modal" class="modal fade">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header border-secondary">
          <h5 class="modal-title" id="exampleModalLabel">Select report locations</h5>
          <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-3 py-3 border-bottom border-secondary">
            <h6 class="text-muted text-underline m-0">Current locations</h6>
            <button class="btn btn-accent-flat text-muted px-2 py-1 mr-2" v-for="(location, lIdx2) in currentLocs" :key="lIdx2" @click="removeLocation(lIdx2)">
              {{ location.name }}
              <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
            </button>
          </div>

          <div class="py-3 border-bottom">
            <div v-if="ctry2Add.length" class="my-3">
              <h6 class="text-sec text-underline m-0">Countries to add</h6>
              <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(country, cIdx) in ctry2Add" :key="cIdx" id="new-countries" @click="removeCountry2Add(cIdx)">
                {{ country }}
                <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
              </button>
            </div>

            <div class="d-flex align-items-center justify-content-center my-3" id="select-country">
              <TypeaheadSelect :queryFunction="queryCountry" @selected="updateCountries" :apiUrl="this.$genomicsurl" placeholder="Add country" totalLabel="total sequences" />
            </div>
          </div>

          <div class="py-3">
            <div v-if="div2Add.length" class="my-3">
              <h6 class="text-sec text-underline m-0">Divisions (States/Provinces) to add</h6>
              <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(division, dIdx) in div2Add" :key="dIdx" id="new-divisions" @click="removeDivision2Add(cIdx)">
                {{ division }}
                <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
              </button>
            </div>


            <div class="d-flex align-items-center justify-content-center my-3" id="select-division">
              <TypeaheadSelect :queryFunction="queryDivision" @selected="updateDivision" :apiUrl="this.$genomicsurl" placeholder="Add division" totalLabel="total sequences" />
            </div>
          </div>
        </div>


        <div class="modal-footer border-secondary">
          <button type="button" class="btn" @click="clearNewLocations">Clear additions</button>
          <button type="button" class="btn btn-primary" @click="selectNewLocations" data-dismiss="modal">Save changes</button>

        </div>
      </div>
    </div>
  </div> -->
  <!-- end change location modal -->

  <template v-if="hasData">
    <!-- SOCIAL MEDIA SHARE, BACK BTN -->
    <div class="d-flex align-items-center mb-2">
      <router-link :to="{ name: 'SituationReports'}">
        <button class="btn py-0 px-2 btn-grey-outline">back</button>
      </router-link>
      <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline" data-toggle="modal" data-target="#change-pangolin-modal">select mutation(s)</button>
      <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline" data-toggle="modal" data-target="#change-locations-modal">change locations</button>
      <ShareReport title="title" url="url" />
    </div>

    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column align-items-start">
        <h1 class="m-0">{{ title }}</h1>
        <div class="d-flex my-1 align-items-center">

        </div>

        <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
        </small>
      </div>
      <div class="d-flex flex-column align-items-end justify-content-between">
        <div class="d-flex align-items-center">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
          </a>
        </div>
        <router-link :to="{name:'SituationReportCaveats'}" class="btn btn-main-outline mt-3 p-0 px-1"><small>How to interpret these reports</small></router-link>
        <!-- <small class="mr-1"><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
      </div>
    </div>

    <!-- LOGOS -->
    <ReportLogos class="mb-4" />

    <!-- REPORT -->
    <div id="location-report">
      <section id="variants-of-concern" v-if="lineageTable">
        <div>
          <!-- <h6>{{lineageGroup.key}}</h6> -->
          <table>
            <thead>
              <tr>
                <th rowspan="2" class="border-bottom">
                  lineage
                </th>
                <th class="text-center padded border-bottom border-secondary" colspan="2">
                  lineage found
                </th>
                <th>
                </th>
                <th class="text-center padded border-bottom border-secondary" colspan="2">
                  when found
                </th>
              </tr>
              <tr class="border-bottom">
                <th class="text-center padded">
                  total
                </th>
                <th class="text-center padded">
                  apparent prevalence<sup>*</sup>
                </th>
                <th>

                </th>
                <th class="text-center padded">
                  first
                </th>
                <th class="text-center padded">
                  last
                </th>
              </tr>
            </thead>
            <tbody class="checkbook" v-for="(lineageGroup, gIdx) in lineageTable" :key="gIdx">
              <tr class="border-top border-bottom">
                <td colspan="6">
                  {{lineageGroup.key}}
                </td>

              </tr>
              <tr v-for="(lineage, lIdx) in lineageGroup.values" :key="lIdx">
                <td>
                  {{ lineage.pangolin_lineage }}
                </td>
                <td>
                  {{ lineage.lineage_count_formatted }}
                </td>
                <td>
                  {{ lineage.proportion_formatted }}
                <td class="spacer">

                </td>
                <td>
                  {{ lineage.first_detected }}
                </td>
                <td>
                  {{ lineage.last_detected }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="lineages-over-time" class="row">
        <div class="col-sm-12">
          <!-- <LineagesByLocation :data="lineagesByDay" /> -->
        </div>
      </section>

    </div>


    <!-- METHODOLOGY -->
    <section class="mt-3 mb-5 border-top pt-3" id="methods">
      <h4>Methodology</h4>
      <ReportMethodology :dateUpdated="dateUpdated" />
      <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
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
</template>
</div>
</template>

<script>
import Vue from "vue";
import ReportLogos from "@/components/ReportLogos.vue";
import ReportMethodology from "@/components/ReportMethodology.vue";
import CharacteristicMutations from "@/components/CharacteristicMutations.vue";
import Warning from "@/components/Warning.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import ReportPrevalence from "@/components/ReportPrevalence.vue";
import ReportPrevalenceByLocation from "@/components/ReportPrevalenceByLocation.vue";
import ReportChoropleth from "@/components/ReportChoropleth.vue";
import ReportResources from "@/components/ReportResources.vue";
import ShareReport from "@/components/ShareReport.vue";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import ReportSummary from "@/components/ReportSummary.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import MutationsByLineage from "@/components/MutationsByLineage.vue";
import LineagesByLocation from "@/components/LineagesByLocation.vue";

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
  faSpinner
} from "@fortawesome/free-solid-svg-icons";


library.add(faClock, faSpinner);

import {
  mapState
} from "vuex";

import {
  timeFormat
} from "d3";

import {
  getLocationReportData
} from "@/api/genomics.js";

export default {
  name: "LocationReport",
  props: {
    country: String,
    division: String,
    muts: {
      type: Array,
      default: () => ["S:N501Y"]
    },
    pango: Array
  },
  components: {
    ReportLogos,
    ReportMethodology,
    // CharacteristicMutations,
    FontAwesomeIcon,
    Warning,
    ReportAcknowledgements,
    // ReportPrevalence,
    // ReportPrevalenceByLocation,
    // ReportChoropleth,
    // ReportResources,
    ShareReport,
    // LineagesByLocation
    // ReportSummary,
    // TypeaheadSelect,
    // CustomReportForm,
    // MutationsByLineage
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"]),
    smallScreen() {
      return (window.innerSize < 500)
    },
    title() {
      return (this.division ? `${this.division} Mutation Report` : `${this.country} Mutation Report`)
    },
    hasData() {
      return (true)
    },
    selectedLocation() {
      return (this.division ? this.division : this.country)
    },
    selectedLocationType() {
      return (this.division ? "division" : "country")
    }
  },
  mounted() {
    const formatDate = timeFormat("%e %B %Y");
    var currentTime = new Date();
    this.today = formatDate(currentTime);

    // set URL for sharing, etc.
    this.$nextTick(function() {
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    this.reportSubscription = getLocationReportData(this.$genomicsurl, this.selectedLocation, this.selectedLocationType, this.muts, this.pango).subscribe(results => {
      console.log(results)
      this.dateUpdated = results.dateUpdated.dateUpdated;
      this.lastUpdated = results.dateUpdated.lastUpdated;
      this.lineagesByDay = results.lineagesByDay;
      this.lineageTable = results.lineageTable;
    })
  },
  data() {
    return ({

      today: null,
      url: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      reportSubscription: null,
      // data
      dateUpdated: null,
      lastUpdated: null,
      lineagesByDay: null,
      lineageTable: null
    })
  },
  destroyed() {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.gisaid {
    height: 25px;
}

.font-size-small {
    font-size: small;
}

.btn-active {
    background-color: $primary-color;
    color: white;
}

th.padded {
    padding: 0.25rem 0.25rem 0.5rem;
}

.checkbook td {
    padding: 0.5rem;
    text-align: center;
}

.checkbook tr:nth-child(2n+1) {
    background-color: lighten($secondary-color, 60%);
}
</style>
