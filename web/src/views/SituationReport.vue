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
        Generated using data from
        <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
        </a>
      </div>
      <small class="mr-1"><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small>
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
    </section>


    <section id="summary" class="col-sm-6 col-md-4 p-3 pr-4 summary-box bg-main text-light">
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

  <section class="vis my-3 py-3" id="longitudinal">
    <h4>Prevalence over time</h4>
    vis vis vis
  </section>

  <section class="my-3">
    <h4>Methodology</h4>
    <ReportMethodology/>
    <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small>
    <Warning class="mt-2"
      text="B.1.1.7 genomes in the US were identified by S-gene target failures (SGTF) in community-based diagnostic PCR testing. Since this is not an unbiased approach, it does not indicate the true prevalence of the B117 lineage in the US.  <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>" />

  </section>

  <section class="my-3">
    <h4 class="m-0">Citing this report</h4>
    <p class="m-0">
      Andersen lab, 2021.
    </p>
  </section>
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import ReportMethodology from "@/components/ReportMethodology.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import CountryMap from "@/components/CountryMap.vue";
import Warning from "@/components/Warning.vue";

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

import { quantile } from '@stdlib/stats/base/dists/beta';

export default {
  name: "SituationReport",
  components: {
    ReportLogos,
    ReportMethodology,
    SARSMutationMap,
    FontAwesomeIcon,
    CountryMap,
    Warning
  },
  data() {
    return {
      mutationName: "B.1.1.7",
      reportType: "lineage",
      lastUpdated: "2 hours",
      dateUpdated: "22 January 2021",
      countries: ["France", "Spain", "Canada", "United States of America", "Brazil", "India", "Australia"],
      states: ["California"],
      totalSeqs: 22470
    }
  },
  mounted() {
    this.calcCI(57, 3165)
  },
  methods: {
    downloadGISAID() {
      console.log("Downloading GISAID IDs")
    },
    calcCI(x, n) {
      const upper = quantile(0.975, x+0.5, n-x+0.5);
      const lower = quantile(0.025, x+0.5, n-x+0.5);
      const est = x / n;
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

.vis {
    background: aliceblue;
}
</style>
