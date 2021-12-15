<template>
<div class="px-2">
  <h3>Summary</h3>
  <div class="summary-counts mb-3" style="overflow-x:auto;">
    <span class="font-size-2">
      <span v-if="dateUpdated">As of {{ dateUpdated }},</span> <b>{{ totalLineage }}</b>
      <span v-if="reportType == 'lineage'"> sequences in the <b>{{ mutationName }}</b> {{ reportType }} have been detected since the {{reportType}} was identified:</span>
      <span v-else-if="reportType == 'lineage with added mutations'"> sequences with the <b>{{ mutationName }}</b> have been detected since the lineage was identified:</span>
      <span v-else> sequences with the <b>{{ mutationName }}</b> {{ reportType }} have been detected since the {{reportType}} was identified:</span>
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
            when found<sup>**</sup>
          </th>
        </tr>
        <tr class="border-bottom">
          <th class="text-center padded">
            total
          </th>
          <th class="text-center padded">
            cumulative prevalence<sup>*</sup>
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
        <tr v-for="(location, lIdx) in locationTotals" :key="lIdx" :class="{'font-weight-bold' : location.location_id == selected}">
          <td>
            <router-link class="bright-hyperlink" :to="{name: 'LocationReport', query:{ loc: location.location_id, ... locationQueryParams }}" v-if="location.name != 'Worldwide'">{{ location.name }}</router-link>
            <span class="bright-hyperlink" v-else>{{ location.name }}</span>
          </td>
          <td class="text-center">
            {{ location.lineage_count_formatted }}
          </td>
          <td class="text-center">
            <span :class="{'no-estimate' : location.proportion_formatted == 'no estimate'}" :data-tippy-info="`Prevalence estimates are unreliable since only ${location.total_count} ${location.total_count === 1 ? 'sample has' : 'samples have'} been sequenced since ${mutationName} detection in ${location.name}`">{{ location.proportion_formatted }}</span>
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
        <small><em><sup>*</sup> Apparent cumulative prevalence is the ratio of the sequences containing {{mutationName}} to all sequences collected since the identification of {{mutationName}} in that location.</em> </small>
        <small class="ml-2"><em><sup>**</sup> Dates are based on the sample collection date</em> </small>
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
      The {{reportType == "mutation" ? "mutation has" : reportType == "variant" ? "mutations have" : "strain has" }} been detected in at least <b>{{ countries.length }} {{countries.length === 1 ? "country" : "countries"}}</b> and <b> {{ states.length }} U.S. {{states.length === 1 ? "state" : "states"}}</b>.
    </div>
    <CountryMap :countries="countries" :width="summaryWidth" :showNames="false" class="align-self-center" mapSource="GADM" />
    <small class="bright-hyperlink"><a href="#geographic">view geographic prevalence</a></small>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import CountryMap from "@/components/CountryMap.vue";
import Warning from "@/components/Warning.vue";
//import ReportChoroplethZipcode from "@/components/ReportChoroplethZipcode.vue";
//import ReportChoroplethCounties from "@/components/ReportChoroplethCounties.vue";

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

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "ReportSummary",
  components: {
    CountryMap,
    //ReportChoroplethCounties,
    //ReportChoroplethZipcode,
    Warning,
    FontAwesomeIcon
  },
  props: {
    selected: String,
    dateUpdated: String,
    locationQueryParams: Object,
    totalLineage: String,
    mutationName: String,
    reportType: String,
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
    });

    tippy(".no-estimate", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
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
