<template>
<div class="my-4 mx-4 full-page text-left">
  <div class="d-flex w-100 justify-content-end text-muted mb-2">
    <font-awesome-icon class="ml-3" :icon="['fas', 'share']" />
    <font-awesome-icon class="ml-3" :icon="['fab', 'twitter']" />
    <font-awesome-icon class="ml-3" :icon="['fas', 'envelope']" />
    <font-awesome-icon class="ml-3" :icon="['fas', 'link']" />
  </div>
  <div class="d-flex justify-content-between align-items-center">
    <div class="d-flex flex-column align-items-start">
      <h1 class="m-0">{{ mutationName }} {{ reportType | capitalize }} Report</h1>
      <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
      </small>
    </div>

    <div class="d-flex flex-column align-items-end">
      <div class="d-flex align-items-center">
        Enabled by data from
        <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
        </a>
      </div>
      <!-- <small class="mr-1"><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
    </div>

  </div>

  <ReportLogos class="mb-4" />

  <div class="row">
    <section id="intro" class="col-sm-6 col-md-8 pr-4">
      <div class="font-size-2">
        Concerns surrounding a new strain of SARS-CoV-2, the virus behind the COVID-19 pandemic, have been developing. <b class="text-highlight">B.1.1.7</b> lineage, also known as <b>Variant of Concern 202012/01 (VOC-202012/01)</b> or
        <b>20B/501Y.V1</b>, was first identified in the UK in early December 2020 and has since been detected in the US and other counties. This is of growing concern because it has shown to be significantly more transmissible than other variants.
      </div>
      <router-link :to='{name:"Resources", query:{q: `"${mutationName}"`}}'>
        <small>View publications, datasets, and more related to {{mutationName}}</small>
      </router-link>
      <div class="mt-4" id="definition">
        <h4 class="">{{reportType | capitalize}} definition</h4>

        <small class="">
          <button class="btn btn-main-outline py-1" data-toggle="collapse" href="#mutation-table" aria-expanded="false" aria-controls="mutation-table">
            View mutation table
          </button>
        </small>

        <small class="ml-2 my-1"><a @click="downloadGISAID" href="">Download mutation list</a></small>

        <SARSMutationMap mutationKey="B.1.1.7" />

        <div class="collape ml-2" id="mutation-table">
          <table>
            <thead>
              <tr>
                <th>
                  gene
                </th>
                <th>
                  nucleotides
                </th>
              </tr>
            </thead>
          </table>
        </div>

      </div>
      <div class="mt-4">
        <h4>Key Insights</h4>
        <ul>
          <li>
            {{ mutationName }} has been <b>increasing</b> in prevalence over the past two weeks.
          </li>
          <li>
            Its apparent prevalence is higher in rest of the world compared to the United States or San Diego.
          </li>
          <li>
            Experimental data suggests it is more transmissable than other SARS-CoV-2 variants.
          </li>
        </ul>
      </div>

      <div class="mt-4">
        <h4>What's new today</h4>
        <table>
          <tr class="border-bottom">
            <th colspan="2">
              New sequences identified
            </th>
          </tr>
          <tr>
            <td>
              Worldwide
            </td>
            <td>
              114
            </td>
          </tr>
          <tr>
            <td>
              United States
            </td>
            <td>
              8
            </td>
          </tr>
          <tr>
            <td>
              San Diego
            </td>
            <td>
              0
            </td>
          </tr>
        </table>
      </div>
    </section>


    <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-4 p-3 pr-4 summary-box bg-main text-light">
      <h3>Summary</h3>
      <div class="summary-counts mb-3">
        As of {{ dateUpdated }}, <b>{{ totalSeqs.toLocaleString() }}</b> sequences containing the variations in {{ mutationName }} have been detected:

        <table class="border-bottom line-height-1 mt-2 w-100">
          <thead>
            <tr class="border-bottom">
              <th>

                location
                <font-awesome-icon class="ml-1 font-size-small" :icon="['fas', 'sync']" />
                <!-- sync, globe-americas, map-marked-alt -->
              </th>
              <th class="text-center">
                sequence count
              </th>
              <th class="text-center">
                apparent prevalence<sup>*</sup>
              </th>
            </tr>
          </thead>
          <tbody class="checkbook">
            <tr>
              <td>
                Worldwide
              </td>
              <td class="text-center">
                {{ totalSeqs.toLocaleString() }}
              </td>
              <td class="text-center">
                5.6%
              </td>
            </tr>
            <tr>
              <td>
                United States
              </td>
              <td class="text-center">
                180
              </td>
              <td class="text-center">
                0.2%
              </td>
            </tr>
            <tr>
              <td>
                San Diego County
              </td>
              <td class="text-center">
                1
              </td>
              <td class="text-center">
                &lt; 0.1%
              </td>
            </tr>
          </tbody>
        </table>
        <div class="d-flex justify-content-between">
          <small class="bright-hyperlink"><a href="#longitudinal">view change over time</a></small>
          <small class="bright-hyperlink"><a href="#longitudinal">change locations</a></small>
        </div>

      </div>

      <div id="geo-summary">
        The strain has been detected in at least <b>{{ countries.length }} {{countries.length === 1 ? "country" : "countries"}}</b> and <b>{{ states.length }} U.S. {{states.length === 1 ? "state" : "states"}}</b>.
        <CountryMap :countries="countries" :width="400" :showNames="false" />
        <small class="bright-hyperlink"><a href="#geographic">view geographic prevalence</a></small>
      </div>
    </section>
  </div>

  <section class="vis my-3 py-3 d-flex flex-column align-items-start" id="longitudinal">
    <h4 class="mb-0">Average daily {{mutationName}} prevalence</h4>
    <small class="text-muted mb-2">Based on reported sample collection date</small>
    <div id="location-buttons">
      <button class="btn btn-tab" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="changeLocation(location)">{{ location.name }}</button>
      <button class="btn btn-main-outline">Change locations
        <font-awesome-icon class="ml-1 font-size-small" :icon="['fas', 'sync']" />
      </button>
    </div>
    <ReportPrevalence :data="prevalence" />
  </section>

  <section class="my-4">
    <h4 class="mb-0">Cumulative {{mutationName}} prevalence by country</h4>
    <small class="text-muted">Since first identification</small>
    <ReportPrevalenceByLocation :data="ctryData" class="mt-2"/>
  </section>

  <section id="resources">
    <ReportResources :mutationName="mutationName" :searchTerms="searchTerms" />
  </section>

  <section class="my-3">
    <h4>Methodology</h4>
    <ReportMethodology />
    <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
    <Warning class="mt-2"
      text="B.1.1.7 genomes in the US were identified by S-gene target failures (SGTF) in community-based diagnostic PCR testing. Since this is not an unbiased approach, it does not indicate the true prevalence of the B117 lineage in the US.  <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>" />

  </section>

  <section class="my-3">
    <h4 class="">Citing this report</h4>
    <p class="m-0">
      <b>{{ mutationName }} {{ reportType | capitalize }} Report</b>. {{ mutationAuthors }}. outbreak.info, (available at {{ url }}). Accessed {{ today }}.
    </p>
  </section>
  <ReportAcknowledgements class="border-top pt-3" />
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import ReportMethodology from "@/components/ReportMethodology.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import CountryMap from "@/components/CountryMap.vue";
import Warning from "@/components/Warning.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import ReportPrevalence from "@/components/ReportPrevalence.vue";
import ReportPrevalenceByLocation from "@/components/ReportPrevalenceByLocation.vue";
import ReportResources from "@/components/ReportResources.vue";

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
  faLink,
  faShare,
  faEnvelope,
  faSync
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter
} from "@fortawesome/free-brands-svg-icons";

library.add(faLink, faShare, faEnvelope, faTwitter, faClock, faSync);

import {
  mapState
} from "vuex";

import {
  getDates, ctry,
  getCuratedMetadata
} from "@/api/genomics.js";

import {
  timeFormat
} from "d3";

export default {
  name: "SituationReport",
  components: {
    ReportLogos,
    ReportMethodology,
    SARSMutationMap,
    FontAwesomeIcon,
    CountryMap,
    Warning,
    ReportAcknowledgements,
    ReportPrevalence,
    ReportPrevalenceByLocation,
    ReportResources
  },
  props: {
    isCurated: {
      type: Boolean,
      default: false
    },
    location: Array,
    muts: String,
    lineage: String
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"])
  },
  data() {
    return {
      today: null,
      url: null,
      mutationName: "B.1.1.7",
      mutationID: "B-1-1-7",
      reportMetadata: null,
      reportType: "lineage",
      lastUpdated: "2 hours",
      dateUpdated: "22 January 2021",
      // subscriptions
      curatedSubscription: null,
      ctryData: null,
      countries: ["Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Czech Republic", "Denmark", "Ecuador", "Finland", "France", "Germany", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Iran", "Ireland", "Israel", "Italy",
        "Jamaica", "Japan", "Latvia", "Lebanon", "Luxembourg", "Mexico", "Netherlands", "New Zealand", "Norway", "Oman", "Pakistan", "Peru", "Poland", "Portugal", "Romania", "Singapore", "Slovakia", "South Korea", "Spain", "Sri Lanka", "Sweden",
        "Switzerland", "Turkey", "United Kingdom", "United States of America", "Vietnam"
      ],
      states: ["California", "Colorado", "Connecticut", "Florida", "Georgia", "Illinois", "Indiana", "Maryland", "Massachusetts", "Michigan", "Minnesota", "New Mexico", "New York", "Oklahoma", "Oregon", "Pennsylvania", "Texas", "Utah"],
      searchTerms: null,
      totalSeqs: 22470,
      selectedLocations: [{
          name: "Global",
          isActive: true,
          query: "global"
        },
        {
          name: "United States",
          isActive: false,
          query: "US"
        },
        {
          name: "San Diego County",
          isActive: false,
          query: "global"
        }
      ],
      prevalence: []
    }
  },
  mounted() {
    const formatDate = timeFormat("%e %B %Y");
      var currentTime = new Date();
    this.today = formatDate(currentTime);

          this.$nextTick(function() {
            this.url = window.location.href;
          })

          this.ctryData = ctry;
          console.log(this.ctryData)

    this.prevalence = getDates("global");

    this.curatedSubscription = getCuratedMetadata(this.mutationID).subscribe(results => {
      this.reportMetadata = results;
      this.searchTerms = results.searchTerms;
    });
  },
  methods: {
    changeLocation(location) {
      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      location.isActive = !location.isActive;
      this.prevalence = getDates(location.query);
    },
    downloadGISAID() {
      console.log("Downloading GISAID IDs")
    }
  },
  destroyed() {
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.gisaid {
    height: 25px;
}

.bright-hyperlink a {
    color: #70d3ff;
}

.checkbook td {
    padding: 0.5rem;
}

.checkbook tr:nth-child(2n+1) {
    background-color: lighten($primary-color, 7%);
}

.font-size-2 {
    font-size: 1.25rem;
}

.font-size-small {
    font-size: small;
}

.btn-active {
    background-color: $primary-color;
    color: white;
}

.resource-type {
    opacity: 0.6;
    font-weight: 700;
    text-transform: uppercase;
}
</style>
