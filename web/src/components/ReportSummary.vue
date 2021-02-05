<template>
<div>
  <h3>Summary</h3>
  <div class="summary-counts mb-3">
    As of {{ dateUpdated }}, <b>{{ totalLineage }}</b> sequences in the {{ mutationName }} lineage have been detected since the {{reportType}} was identified:

    <!-- PREVALENCE SUMMARY TABLE -->
    <table class="border-bottom line-height-1 mt-2 w-100">
      <thead>
        <tr class="border-bottom">
          <th>
            location
            <font-awesome-icon class="ml-1 font-size-small pointer" :icon="['fas', 'sync']" data-toggle="modal" data-target="#change-locations-modal" />
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
            {{ totalLineage }}
          </td>
          <td class="text-center">
            {{ globalPrev }}
          </td>
        </tr>
        <tr v-for="(location, lIdx) in locationTotals" :key="lIdx">
          <td>
            {{ location.name }}
          </td>
          <td class="text-center">
            {{ location.cum_lineage_count.toLocaleString() }}
          </td>
          <td class="text-center">
            {{ location.proportion_formatted }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-between">
      <small class="bright-hyperlink"><a href="#longitudinal">view change over time</a></small>
      <small class="bright-hyperlink pointer"><a data-toggle="modal" data-target="#change-locations-modal">change locations</a></small>
    </div>
    <div class="line-height-1 my-2">
      <small><em><sup>*</sup> Apparent prevalence is the ratio of the sequences containing {{mutationName}} to all sequences collected since the identification of {{mutationName}} in that location.</em> </small>
    </div>
  </div>

  <!-- GEO SUMMARY -->
  <div id="geo-summary" v-if="countries" class="d-flex flex-column" ref="geo_summary">
    <div>
      The strain has been detected in at least <b>{{ countries.length }} {{countries.length === 1 ? "country" : "countries"}}</b>.
      <!-- and <b> {{ "XXXX" }} U.S. {{states.length === 1 ? "state" : "states"}}</b>. -->
    </div>
    <CountryMap :countries="countries" :width="summaryWidth" :showNames="false" class="align-self-center" />
    <small class="bright-hyperlink"><a href="#geographic">view geographic prevalence</a></small>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import CountryMap from "@/components/CountryMap.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSync
} from "@fortawesome/free-solid-svg-icons";

library.add(faSync);

export default {
  name: "ReportSummary",
  components: {
    CountryMap,
    FontAwesomeIcon
  },
  props: {
    dateUpdated: String,
    totalLineage: String,
    mutationName: String,
    reportType: String,
    globalPrev: String,
    locationTotals: Array,
    countries: Array
  },
  data() {
    return {
      // sizes
      summaryWidth: 400
    }
  },
  mounted() {
    this.setDims();

    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
    })
  },
  methods: {
    setDims() {
      const summaryFraction = 0.95;
      this.summaryWidth = document.getElementById('geo-summary') ? document.getElementById('geo-summary').offsetWidth * summaryFraction : 400;
    }
  }
}
</script>
