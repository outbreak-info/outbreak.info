<template>
  <div class="px-2">
    <h3>Summary</h3>
    <div class="summary-counts mb-3" style="overflow-x: auto">
      <span class="font-size-2">
        <span v-if="dateUpdated">As of {{ dateUpdated }},</span>
        <b>{{ totalLineage }}</b>
        <span v-if="reportType === 'lineage'">
          sequences in the
          <b>{{ mutationName }}</b>
          {{ reportType }} have been detected since the {{ reportType }} was
          identified:
        </span>
        <span v-else-if="reportType === 'lineage with added mutations'">
          sequences with the
          <b>{{ mutationName }}</b>
          have been detected since the lineage was identified:
        </span>
        <span v-else>
          sequences with the
          <b>{{ mutationName }}</b>
          {{ reportType }} have been detected between {{ xmin }} and {{ xmax }}:
        </span>
      </span>
      <!-- PREVALENCE SUMMARY TABLE -->
      <table class="border-bottom line-height-1 mt-2 w-100">
        <thead>
          <tr>
            <th rowspan="2" class="border-bottom">
              location
              <font-awesome-icon
                class="ml-2 font-size-small pointer"
                :icon="['fas', 'sync']"
                data-toggle="modal"
                data-target="#change-locations-modal"
              />
              <!-- sync, globe-americas, map-marked-alt -->
            </th>
            <th
              class="text-center padded border-bottom border-secondary"
              colspan="2"
            >
              {{ mutationName }} found
              <br />
              <small>{{ getDateRangeText() }}</small>
            </th>
            <th />
            <th
              class="text-center padded border-bottom border-secondary"
              colspan="2"
            >
              when found in date range
              <sup>**</sup>
            </th>
          </tr>
          <tr class="border-bottom">
            <th class="text-center padded">count</th>
            <th class="text-center padded">
              cumulative prevalence
              <sup>*</sup>
            </th>
            <th />
            <th class="text-center padded">last</th>
          </tr>
        </thead>

        <tbody class="checkbook">
          <tr
            v-for="(location, lIdx) in locationTotals"
            :key="lIdx"
            :class="{ 'font-weight-bold': location.location_id === selected }"
          >
            <td>
              <router-link
                v-if="
                  location.name !== 'Worldwide' &&
                  routeTo === 'GenomicsEmbedVariant'
                "
                class="bright-hyperlink"
                :to="{
                  name: 'GenomicsEmbed',
                  query: {
                    type: 'loc',
                    loc: location.location_id,
                    ...locationQueryParams,
                  },
                }"
              >
                {{ location.name }}
              </router-link>
              <router-link
                v-else-if="location.name !== 'Worldwide'"
                class="bright-hyperlink"
                :to="{
                  name: 'LocationReport',
                  query: { loc: location.location_id, ...locationQueryParams },
                }"
              >
                {{ location.name }}
              </router-link>
              <span v-else class="bright-hyperlink">{{ location.name }}</span>
            </td>
            <td class="text-center">
              {{ location.lineage_count_formatted }}
            </td>
            <td class="text-center">
              <span
                :class="{
                  'no-estimate':
                    location.proportion_formatted === 'no estimate',
                }"
                :data-tippy-info="`Prevalence estimates are unreliable since only ${
                  location.total_count
                } ${
                  location.total_count === 1 ? 'sample has' : 'samples have'
                } been sequenced since ${mutationName} detection in ${
                  location.name
                }`"
              >
                {{ location.proportion_formatted }}
              </span>
            </td>
            <td />
            <td class="text-center">
              {{ location.last_detected }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex justify-content-between">
        <small class="bright-hyperlink">
          <a href="#longitudinal">view change over time</a>
        </small>
        <small class="bright-hyperlink pointer">
          <a data-toggle="modal" data-target="#change-locations-modal">
            change locations
          </a>
        </small>
      </div>
      <div class="d-flex align-items-center my-2">
        <div class="line-height-1">
          <small>
            <em>
              <sup>*</sup>
              Apparent cumulative prevalence is the ratio of the sequences
              containing {{ mutationName }} to all sequences collected within
              the selected time window
            </em>
          </small>
          <small class="ml-2">
            <em>
              <sup>**</sup>
              Dates are based on the sample collection date
            </em>
          </small>
        </div>
        <div class="bias-btn ml-2">
          <router-link
            :to="{ name: 'SituationReportCaveats' }"
            class="no-underline pointer"
          >
            <Warning text="Read about biases" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- GEO SUMMARY -->
    <div
      v-if="countries"
      id="geo-summary"
      ref="geo_summary"
      class="d-flex flex-column"
    >
      <div>
        The
        {{
          reportType === 'mutation'
            ? 'mutation has'
            : reportType === 'variant'
            ? 'mutations have'
            : 'strain has'
        }}
        been detected in at least
        <b>
          {{ countries.length }}
          {{ countries.length === 1 ? 'country' : 'countries' }}
        </b>
        and
        <b>
          {{ states.length }} U.S.
          {{ states.length === 1 ? 'state' : 'states' }}
        </b>
        .
      </div>
      <CountryMap
        :countries="countries"
        :width="summaryWidth"
        :showNames="false"
        class="align-self-center"
        mapSource="GADM"
      />
      <small class="bright-hyperlink">
        <a href="#geographic">view geographic prevalence</a>
      </small>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js';

import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

export default {
  name: 'ReportSummary',
  components: {
    CountryMap: lazyLoad('CountryMap'),
    Warning: lazyLoad('Warning'),
  },
  props: {
    selected: String,
    dateUpdated: String,
    locationQueryParams: Object,
    routeTo: {
      type: String,
      default: 'MutationReport',
    },
    totalLineage: String,
    mutationName: String,
    reportType: String,
    locationTotals: Array,
    countries: Array,
    states: Array,
    xmin: String,
    xmax: String,
  },
  data() {
    return {
      // sizes
      summaryWidth: 400,
    };
  },
  mounted() {
    this.setDims();

    this.$nextTick(() => {
      window.addEventListener('resize', this.setDims);
    });

    tippy('.no-estimate', {
      content: 'Loading...',
      maxWidth: '200px',
      placement: 'bottom',
      animation: 'fade',
      theme: 'light',
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      },
    });
  },
  methods: {
    setDims() {
      const summaryFraction = 0.95;
      this.summaryWidth = document.getElementById('geo-summary')
        ? document.getElementById('geo-summary').offsetWidth * summaryFraction
        : 400;
    },
    getDateRangeText() {
      if (this.xmin && this.xmax) {
        return `${this.xmin}  -  ${this.xmax}`;
      } else {
        return 'all time';
      }
    },
  },
};
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

.checkbook tr:nth-child(2n + 1) {
  background-color: lighten($primary-color, 7%);
}

.bias-btn {
  min-width: 200px;
}
</style>
