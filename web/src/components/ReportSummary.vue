<template>
<div class="px-2">
  <h3>Summary</h3>
  <div class="summary-counts mb-3" style="overflow-x:auto;">
    <span class="font-size-2">
    As of {{ dateUpdated }}, <b>{{ totalLineage }}</b> sequences in the <b>{{ mutationName }}</b> lineage have been detected since the {{reportType}} was identified:
</span>
    <!-- PREVALENCE SUMMARY TABLE -->
    <table class="border-bottom line-height-1 mt-2 w-100">
      <thead>
        <tr>
          <th rowspan="2" class="border-bottom">
            location
            <font-awesome-icon class="ml-2 font-size-small pointer" :icon="['fas', 'sync']" data-toggle="modal" data-target="#change-locations-modal" />
            <!-- sync, globe-americas, map-marked-alt -->
          </th>
          <th class="text-center padded border-bottom border-secondary" colspan="2">
            {{mutationName}} found
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

      <tbody class="checkbook">
        <tr>
          <td>
            Worldwide
          </td>
          <td class="text-center">
            {{ totalLineage }}
          </td>
          <td class="text-center">
            {{ globalPrev.proportion_formatted }}
          </td>
          <td>

          </td>
          <td class="text-center">
            {{ globalPrev.first_detected }}
          </td>
          <td class="text-center">
            {{ globalPrev.last_detected }}
          </td>
        </tr>

        <tr v-for="(location, lIdx) in locationTotals" :key="lIdx">
          <td>
            {{ location.name }}
          </td>
          <td class="text-center">
            {{ location.lineage_count_formatted }}
          </td>
          <td class="text-center">
            {{ location.proportion_formatted }}
          </td>
          <td>

          </td>
          <td class="text-center">
            {{ location.first_detected }}
          </td>
          <td class="text-center">
            {{ location.last_detected }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-between">
      <small class="bright-hyperlink"><a href="#longitudinal">view change over time</a></small>
      <small class="bright-hyperlink pointer"><a data-toggle="modal" data-target="#change-locations-modal">change locations</a></small>
    </div>
    <div class="d-flex align-items-center my-2">
      <div class="line-height-1">
        <small><em><sup>*</sup> Apparent prevalence is the ratio of the sequences containing {{mutationName}} to all sequences collected since the identification of {{mutationName}} in that location.</em> </small>
      </div>
      <div class="bias-btn ml-2">
        <router-link :to="{name: 'SituationReportCaveats'}" class="no-underline pointer">
          <Warning text="Read about biases" />
        </router-link>
      </div>

    </div>
  </div>

  <!-- GEO SUMMARY -->
  <div id="geo-summary" v-if="countries" class="d-flex flex-column" ref="geo_summary">
    <div>
      The strain has been detected in at least <b>{{ countries.length }} {{countries.length === 1 ? "country" : "countries"}}</b> and <b> {{ states.length }} U.S. {{states.length === 1 ? "state" : "states"}}</b>.
    </div>
    <CountryMap :countries="countries" :width="summaryWidth" :showNames="false" class="align-self-center" />
    <small class="bright-hyperlink"><a href="#geographic">view geographic prevalence</a></small>
  </div>
</div>
</template>

<script>
import Vue from "vue";

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
  faSync
} from "@fortawesome/free-solid-svg-icons";

library.add(faSync);

export default {
  name: "ReportSummary",
  components: {
    CountryMap,
    Warning,
    FontAwesomeIcon
  },
  props: {
    dateUpdated: String,
    totalLineage: String,
    mutationName: String,
    reportType: String,
    globalPrev: Object,
    locationTotals: Array,
    countries: Array,
    states: Array
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

<style lang="scss" scoped>
.bright-hyperlink a {
    color: #70d3ff;
}

th.padded {
    padding: 0.25rem 0.25rem 0.5rem;
}

.checkbook td {
    padding: 0.5rem;
}

.checkbook tr:nth-child(2n+1) {
    background-color: lighten($primary-color, 7%);
}

.bias-btn {
    min-width: 200px;
}
</style>
