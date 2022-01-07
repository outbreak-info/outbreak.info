<template>
<div>
  <!-- <div class="p-2 border-top location-banner d-flex justify-content-between">
    <p class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</p>
    <b class="m-0 font-weight-bold location-header">Location Tracker</b>
  </div> -->

  <div class="mb-4 mt-3 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- CHANGE LOCATION MODAL -->
    <div id="change-locations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Select report location</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="py-3 border-bottom">
              <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
                <TypeaheadSelect :queryFunction="queryLocation" @selected="updateLocations" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location" totalLabel="total sequences" />
              </div>
            </div>
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-primary" @click="submitNewLocation" data-dismiss="modal">Create report</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change location modal -->

    <!-- CHANGE MUTATIONS MODAL -->
    <div id="change-mutations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Add custom mutations</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- <CustomLocationForm :curated="null" :includeLocation="false" :selectedMutations.sync="newMuts" :selectedLineage.sync="newPango" :formCount.sync="formCount" /> -->
            <VariantForm :minimalistic="false" :selectedLineage.sync="newPango" :selectedMutations.sync="newMuts" :submitted="submitCount" />

            <div class="mx-4 border-top pt-3" v-if="customMutations.length">
              <h6 class="font-weight-bold text-muted">
                Already selected:
              </h6>
              <div class="d-flex flex-wrap">
                <button role="button" class="btn chip bg-main__darker text-light d-flex align-items-center py-1 px-2 line-height-1" v-for="(mutation, mIdx) in customMutations" :key="mIdx" @click="deleteMutation(mIdx)">
                  {{mutation.label}}
                  <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-outline-secondary" @click="clearMutations">Clear selections</button>
            <button type="button" :disabled="!formValid" class="btn btn-main" @click="addMutations">Add another lineage/mutation</button>
            <button type="button" class="btn btn-accent" @click="submitNewMutations" data-dismiss="modal">Go</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change mutations modal -->

    <template>
      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div class="d-flex align-items-center mb-2">
        <router-link :to="{ name: 'LocationReports'}" class="no-underline">
          <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
            <font-awesome-icon class="mr-2 fa-sm" :icon="['fas', 'arrow-left']" />
            back
          </button>
        </router-link>
        <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center" data-toggle="modal" data-target="#change-mutations-modal">
          <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
          add variants
        </button>
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div class="d-flex flex-column text-light location-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Location Tracker</h4>
        <div class="d-flex flex-wrap justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start">
            <!-- WHO region -->
            <div v-if="selectedLocation && selectedLocation.who_region" class="mt-2 mb-n1">
              WHO Region: {{selectedLocation.who_region}}
            </div>

            <!-- name -->
            <div class="d-flex align-items-end">
              <div class="d-flex flex-wrap align-items-center">
                <h1 class="m-0 font-weight-bold location-header">{{ title }}</h1>
                <button class="btn py-1 px-2 mx-4 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-locations-modal">
                  <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'sync']" />change location
                </button>
              </div>
            </div>

            <!-- last updated info -->
            <div class="d-flex align-items-center">
              <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
                <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
              </small>
              <div id="sequence-count" class="text-grey font-size-2 ml-3" v-if="totalSequences">
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

      <!-- MINI-NAV -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom">
        <a href="#lineages">
          <button class="btn btn-grey mx-3 py-2">
            <small>Common lineages</small>
          </button>
        </a>

        <a href="#variants-of-concern">
          <button class="btn btn-grey mx-3 py-2">
            <small>Variants of Concern &amp; Interest</small>
          </button>
        </a>

        <a href="#geographic" v-if="geoData && selectedLocation.admin_level === 0">
          <button class="btn btn-grey mx-3 py-2">
            <small>Geographic breakdown</small>
          </button>
        </a>
      </div>


      <!-- REPORT -->
      <div id="location-report">
        <!-- STREAM GRAPHS -->
        <div id="lineages" v-if="lineageDomain">
          <div class="d-flex w-100 justify-content-between align-items-center bg-white p-2 border-bottom mb-2">
            <div class="d-flex flex-wrap flex-column align-items-start">
              <h3 class="m-0">Lineage prevalence <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
              <Warning class="fa-sm my-2" text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
              <small class="text-muted mb-2">Lineages without daily prevalence &gt; {{otherThreshFormatted}} on at least {{ndayThresh}} days in the last {{dayThresh}} are grouped into "Other"</small>
              <HorizontalCategoricalLegend :values="lineageDomain" :colorScale="colorScale" />
            </div>

            <div class="d-flex flex-column flex-wrap align-items-center">
              <div class="d-flex align-items-center flex-shrink-0">
                <small>Show data from last</small>
                <input class="border p-1 mx-2" :style="{ 'border-color': '#bababa !important;', 'width': '40px'}" v-model="recentWindow" placeholder="days">
                <small>days</small>
              </div>

              <!-- Histogram of sequencing counts -->
              <SequencingHistogram :data="seqCountsWindowed" :width="widthHist" :downward="false" :includeXAxis="true" :margin="marginHist" :mutationName="null" className="sequencing-histogram"
                :title="`Samples sequenced per day over last ${recentWindow} days`" :onlyTotals="true" notDetectedColor="#bab0ab" v-if="seqCountsWindowed && !noRecentData" />
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-center align-items-end">
            <section id="lineages-over-time" class="flex-grow-1 flex-shrink-1" v-if="lineagesByDay">
              <LineagesByLocation :data="lineagesByDay" :recentData="mostRecentLineages[0]" :recentWindow="recentWindow" :location="selectedLocation.label" :recentMin="recentMin" :seqCounts="seqCounts" :colorScale="colorScale" :xmin="xmin"
                :xmax="xmax" />
            </section>

            <!-- STACKED BAR / MOST RECENT -->
            <div v-if="noRecentData" class="align-self-center text-muted">
              <h4>No recent sequences found over the past {{recentWindow}} days</h4>
              <p class="text-muted mb-0">
                Try adjusting the most recent data window:
              </p>
              <div class="d-flex">
                <div class="px-3 py-2 my-2 bg-white border-top border-bottom">
                  <small>Show data from last</small>
                  <input class="border p-1 mx-2" :style="{ 'border-color': '#bababa !important;', 'width': '40px'}" v-model="recentWindow" placeholder="days">
                  <small>days</small>
                </div>
              </div>
            </div>

            <template v-else>
              <section id="most-recent-lineages" :class="{'flex-shrink-0': !mediumScreen}" v-if="mostRecentLineages">
                <h5 class="mb-0">Common lineages</h5>
                <small class="text-muted">Prevalence over last {{recentWindow}} days</small>
                <div class="d-flex align-items-start" :class="{'flex-wrap' : mediumScreen}">
                  <ReportStackedBarGraph :data="mostRecentLineages" :seqCounts="seqCountsWindowed" :colorScale="colorScale" :locationID="selectedLocation.id" :recentWindow="recentWindow" />
                </div>
              </section>
            </template>
          </div>
        </div>

        <!-- HEATMAP + LEGEND -->
        <div class="d-flex flex-column align-items-center mt-3" v-if="recentHeatmap && recentHeatmap.length">
          <h5 class="m-0">S-gene mutations in &gt; {{charMutThreshold}} of global sequences for lineages found in {{selectedLocation.label}} in the last {{recentWindow}} days</h5>
          <div class="d-flex flex-wrap justify-content-between">
            <small class="text-muted mb-2">
              <router-link :to="{name: 'SituationReportMethodology', hash: '#characteristic'}" target="_blank">Read more about characteristic mutations</router-link>
            </small>
            <small class="mb-2 ml-3">
              <router-link :to="{name: 'SituationReportComparison', query:{pango: mostRecentDomain}}">View all genes</router-link>
            </small>
          </div>

          <!-- OMICRON INSERTION WARNING -->
          <Warning text="<p>Most Omicron sequences also contain a <b>3 amino acid insertion (EPE) at position 214 in the Spike</b> protein.</p> outbreak.info currently only reports substitution and deletion changes, due to the computational challenges with identifying insertions in 5+ million sequences every day. We’re working towards incorporating insertions into our data processing pipeline, and we encourage you to refer back to the sequence data available on GISAID for more information about these insertions." class="fa-sm mt-1 mb-2" :align_left="true" v-if="mostRecentDomain && (mostRecentDomain.includes('Omicron') || mostRecentDomain.includes('omicron') || mostRecentDomain.includes('B.1.1.529'))" />

          <div class="d-flex flex-column align-items-center" :class="{'bg-dark': darkMode}">

            <!-- HEATMAP LEGEND -->
            <div id="legend" class="d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
              <div class="d-flex align-items-center dark-mode-helper my-2" :data-tippy-info="darkModeHelper" style="margin-left: 85px; margin-right: 100px;">
                <input class="checkbox" id="checkbox1" type="checkbox" v-model.lazy="darkMode" @change="routeDark" />
                <label for="checkbox1" class="checkbox-label">
                  <span class="on">dark mode</span>
                  <span class="off">light mode</span>
                </label>
              </div>

              <GradientLegend maxValue="100%" :colorScale="heatmapColorScale" :dark="darkMode" label="Mutation prevalence in lineage" class="mr-3" />
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
              <span class="ml-3 mr-2 line-height-1 fa-sm flex-shrink-1 text-center w-75px" style="color: #fb5759">
                Variant / Mutation of Concern
              </span>
              <span class="mx-2 line-height-1 fa-sm  flex-shrink-1 text-center w-75px" style="color: #feb56c">
                Variant / Mutation of Interest
              </span>
            </div>

            <MutationHeatmap :data="recentHeatmap" gene="S" :locationID="loc" :voc="voc" :voi="voi" :moc="moc" :moi="moi" :yDomain="mostRecentDomain" :dark="darkMode" />
          </div>
          <DownloadReportData class="mt-3" :data="recentHeatmap" figureRef="mutation-heatmap" dataType="Mutation Report Heatmap" />
        </div>


        <!-- TRACKED LINEAGES PREVALENCE -->
        <section id="lineages-over-time" class="my-5" py-3 border-top v-if="selectedLocation">
          <div class="d-flex flex-wrap align-items-center justify-content-center mb-3">
            <h3 class="mr-5">Tracked lineages over time <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
            <button class="btn btn-main-outline d-flex align-items-center flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change variants
              <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
            </button>
            <Warning class="fa-sm ml-3" text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
          </div>
          <OverlayLineagePrevalence :options="selectedMutations" :xmin="xmin" :xmax="xmax" :seqCounts="seqCounts" :locationID="loc" :locationName="selectedLocation.label" :selected="selected" v-if="selectedMutations && selectedMutations.length" />
        </section>

        <!-- GEOGRAPHIC CHOROPLETHS -->
        <section id="geographic" class="my-5 py-3 border-top" v-if="geoData && selectedLocation.admin_level === 0">
          <div class="d-flex flex-wrap justify-content-between align-items-center">
            <h3 class="m-0">Geographic prevalence of tracked lineages &amp; mutations</h3>
            <div class="d-flex align-items-center">
              <button class="btn btn-main-outline d-flex align-items-center my-2 flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change variants
                <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
              </button>
              <Warning class="fa-sm ml-3" text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-center">
            <div class="d-flex flex-wrap align-items-center border-top border-bottom bg-white pt-1 px-2 mt-1">
              <ClassedLegend :colorScale="choroColorScale" :horizontal="false" :label="`Est. prevalence over the last ${recentWindow} days`" :countThreshold="choroCountThreshold" :mutationName="null" />
              <div class="d-flex flex-column">
                <ThresholdSlider :countThreshold.sync="choroCountThreshold" :maxCount="choroMaxCount" class="mr-3" />
                <div class="d-flex align-items-center">
                  <small>Show data from last</small>
                  <input class="border p-1 mx-2" :style="{ 'border-color': '#bababa !important;', 'width': '40px'}" v-model="recentWindow" placeholder="days">
                  <small>days</small>
                </div>
              </div>

              <!-- Histogram of sequencing counts -->
              <SequencingHistogram :data="seqCountsWindowed" :width="widthHist" :downward="false" :includeXAxis="true" :margin="marginHist" :mutationName="null" className="sequencing-histogram"
                :title="`Samples sequenced per day over last ${recentWindow} days`" :onlyTotals="true" notDetectedColor="#bab0ab" v-if="seqCountsWindowed && !noRecentData" />

            </div>
          </div>

          <div class="d-flex flex-wrap" v-if="geoData">
            <div v-for="(choro, cIdx) in geoData" :key="cIdx" class="my-3" :class="[mediumScreen ? 'w-100' : 'w-33']">
              <div v-if="choro.values.length">
                <div class="d-flex justify-content-between align-items-center mx-4">
                  <router-link :to="{name: 'MutationReport', params: choro.params, query: { ... choro.route, loc: [loc], selected: loc }}">
                    <h5>{{ choro.key }}</h5>
                  </router-link>

                  <small v-if="choro.variantType.includes('Variant') || choro.variantType.includes('Mutation')"
                    :class="{ 'VOC': choro.variantType == 'Variant of Concern',  'VOI': choro.variantType == 'Variant of Interest', 'VUM': choro.variantType == 'Variant under Monitoring', 'MOC': choro.variantType == 'Mutation of Concern',  'MOI': choro.variantType == 'Mutation of Interest'}">
                    {{ choro.variantType }}
                  </small>
                </div>
                <ReportChoropleth report="location" :showCopy="false" :smallMultiples="true" :recentWindow="recentWindow" :showLegend="false" :data="choro.values" :countThreshold="choroCountThreshold" :fillMax="1" :location="selectedLocation.label"
                  :colorScale="choroColorScale" :mutationName="choro.key" :widthRatio="1" />
              </div>
            </div>
            <DownloadReportData :data="geoData" figureRef="report-choropleth" dataType="Variant Report Prevalence over Time" v-if="!noRecentData" />
          </div>

          <!-- no recent geo data -->
          <div v-if="noRecentData" class="align-self-center text-muted">
            <h4>No recent sequences found over the past {{recentWindow}} days</h4>
            <p class="text-muted mb-0">
              Try adjusting the most recent data window:
            </p>
            <div class="d-flex">
              <div class="px-3 py-2 my-2 bg-white border-top border-bottom">
                <small>Show data from last</small>
                <input class="border p-1 mx-2" :style="{ 'border-color': '#bababa !important;', 'width': '40px'}" v-model="recentWindow" placeholder="days">
                <small>days</small>
              </div>
            </div>
          </div>

        </section>
      </div>


      <!-- TRACKED LINEAGES TABLE -->
      <section id="variants-of-concern" class="my-5 py-3 border-top" v-if="lineageTable">
        <div class="d-flex flex-wrap align-items-center justify-content-center">
          <h3 class="mr-5">Tracked lineages <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
          <button class="btn btn-main-outline d-flex align-items-center flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change variants
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
          <Warning class="fa-sm ml-3" text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
        </div>
        <LocationTable :data="lineageTable" :locationName="selectedLocation.label" :locationID="selectedLocation.id" />
      </section>


      <!-- METHODOLOGY -->
      <section class="mt-3 mb-5 border-top pt-3" id="methods">
        <h4>Methodology</h4>
        <ReportMethodology :dateUpdated="dateUpdated" :summary="true" />
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
</div>
</template>

<script>
import Vue from "vue";

import tippy from "tippy.js";
import 'tippy.js/themes/material.css';

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons/faClock";
import {
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons/faTimesCircle";
import {
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons/faPlus";
import {
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {
  faSync
} from "@fortawesome/free-solid-svg-icons/faSync";

library.add(faClock, faSpinner, faSync, faInfoCircle, faArrowLeft, faPlus, faTimesCircle);


import debounce from "lodash/debounce";

import {
  mapState
} from "vuex";

import {
  max,
  timeFormat,
  scaleOrdinal,
  scaleThreshold,
  scaleSequential,
  scaleTime,
  timeDay,
  extent,
  format
} from "d3";

import {
  schemeYlGnBu,
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  getLocationReportData,
  getSequenceCount,
  getLocationMaps,
  getBasicLocationReportData,
  getLocationTable,
  findLocation,
  getBadMutations,
  findWHOLineage
} from "@/api/genomics.js";

import cloneDeep from "lodash/cloneDeep";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";

export default {
  name: "LocationReport",
  props: {
    loc: String,
    muts: [Array, String],
    pango: [Array, String],
    alias: [Array, String],
    variant: [Array, String],
    xmin: String,
    xmax: String,
    dark: {
      type: [String, Boolean],
      default: true
    },
    selected: {
      type: [Array, String],
      default: () => []
    }
  },
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    ReportChoropleth: () => import( /* webpackPrefetch: true */ "@/components/ReportChoropleth.vue"),
    LineagesByLocation: () => import( /* webpackPrefetch: true */ "@/components/LineagesByLocation.vue"),
    ReportStackedBarGraph: () => import( /* webpackPrefetch: true */ "@/components/ReportStackedBarGraph.vue"),
    HorizontalCategoricalLegend: () => import( /* webpackPrefetch: true */ "@/components/HorizontalCategoricalLegend.vue"),
    LocationTable: () => import( /* webpackPrefetch: true */ "@/components/LocationTable.vue"),
    OverlayLineagePrevalence: () => import( /* webpackPrefetch: true */ "@/components/OverlayLineagePrevalence.vue"),
    // CustomLocationForm: () => import( /* webpackPrefetch: true */ "@/components/CustomLocationForm.vue"),
    VariantForm: () => import( /* webpackPrefetch: true */ "@/components/VariantForm.vue"),
    ClassedLegend: () => import( /* webpackPrefetch: true */ "@/components/ClassedLegend.vue"),
    SequencingHistogram: () => import( /* webpackPrefetch: true */ "@/components/SequencingHistogram.vue"),
    ThresholdSlider: () => import( /* webpackPrefetch: true */ "@/components/ThresholdSlider.vue"),
    MutationHeatmap: () => import( /* webpackPrefetch: true */ "@/components/MutationHeatmap.vue"),
    DownloadReportData: () => import( /* webpackPrefetch: true */ "@/components/DownloadReportData.vue"),
    GradientLegend: () => import( /* webpackPrefetch: true */ "@/components/GradientLegend.vue"),
    FontAwesomeIcon
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.loc != oldVal.loc) {
        this.newLocation = null;
        this.createReport();
        this.customMutations = this.grabCustomMutations();
      }
    },
    recentWindow() {
      if (this.recentWindow) {
        this.debounceWindowChange();
      }
    },
    selectedMutations() {
      this.customMutations = this.grabCustomMutations();
      this.updateMaps();
      this.updateTable();
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"]),
    ...mapState("genomics", ["locationLoading1", "locationLoading2", "locationLoading3", "locationLoading4", "locationLoading5", "characteristicThreshold"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2 || this.locationLoading3 || this.locationLoading4 || this.locationLoading5)
    },
    charMutThreshold() {
      return (format(".0%")(this.characteristicThreshold))
    },
    otherThreshFormatted() {
      return (format(".0%")(this.otherThresh))
    },
    title() {
      return (this.selectedLocation ? `${this.selectedLocation.label} Variant Report` : null)
    },
    seqCountsWindowed() {
      return this.recentMin && this.seqCounts ?
        this.seqCounts.filter(d => d.dateTime >= this.recentMin) : null;
    },
    formValid() {
      return (this.newMuts.length > 0 || this.newPango)
    },
    darkModeHelper() {
      return (this.darkMode ? "Switch to <b>light mode</b> to focus on similarities between lineages" : "Switch to <b>dark mode</b> to emphasize mutations with low prevalence")
    },
    // object to store the temporary additions to the custom mutations form BEFORE submission
    // should consist of label + route param (qParam) + type (alias, pango, variant, mutation)
    newVariant() {
      let newVariantObj = null;
      if (this.newPango && this.newMuts.length) {
        newVariantObj = {
          label: `${this.newPango.name} + ${this.newMuts.map(d => d.mutation).join(", ")}`,
          qParam: `${this.newPango.name}|${this.newMuts.map(d => d.mutation).join(" AND ")}`,
          type: "variant"
        }
      } else if (this.newPango) {
        if (this.newPango.alias) {
          newVariantObj = {
            label: this.newPango.name,
            qParam: this.newPango.name,
            type: "alias"
          }
        } else {
          newVariantObj = {
            label: this.newPango.name,
            qParam: this.newPango.name,
            type: "pango"
          }
        }
      } else if (this.newMuts.length) {
        newVariantObj = {
          label: this.newMuts.map(d => d.mutation).join(", "),
          qParam: this.newMuts.map(d => d.mutation).join(" AND "),
          type: "mutation"
        }
      }
      return newVariantObj;
    },
    // parses the route information to track what custom mutations should be queryable.
    selectedMutations() {
      let tracked = this.curatedLineages;
      // WHO Aliases
      if (this.alias) {
        const curatedQuery = findWHOLineage(this.alias);
        if (curatedQuery) {
          tracked.push(...curatedQuery);
        }
      }

      if (this.pango) {
        if (typeof(this.pango) == "string") {
          tracked.push({
            type: "pango",
            label: this.pango,
            qParam: this.pango,
            mutation_string: this.pango,
            query: `pangolin_lineage=${this.pango}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              pango: this.pango
            }
          })
        } else {
          tracked = tracked.concat(this.pango.map(d => {
            return ({
              type: "pango",
              label: d,
              qParam: d,
              mutation_string: d,
              query: `pangolin_lineage=${d}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                pango: d
              }
            })
          }))
        }
      }
      if (this.muts) {
        if (typeof(this.muts) == "string") {
          const mutations = this.muts.split(" AND ");
          tracked.push({
            type: "mutation",
            label: this.muts,
            qParam: this.muts,
            mutation_string: this.muts,
            query: `mutations=${this.muts}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              muts: mutations
            }
          })
        } else {
          tracked = tracked.concat(this.muts.map(d => {
            const mutations = d.split(" AND ");
            return ({
              type: "mutation",
              label: mutations.join(", "),
              qParam: d,
              mutation_string: d,
              query: `mutations=${d}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                muts: d.split(" AND ")
              }
            })
          }))
        }
      }
      if (this.variant) {
        if (typeof(this.variant) == "string") {
          const variant = this.variant.split("|");
          if (variant.length == 2) {
            tracked.push({
              type: "variant",
              label: `${variant[0]} + ${variant[1]}`,
              qParam: this.variant,
              mutation_string: `(${variant[0]}) AND (${variant[1]})`,
              query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                pango: variant[0],
                muts: variant[1]
              }
            })
          }
        } else {
          this.variant.map(d => {
            const variant = d.split("|");
            if (variant.length == 2) {
              tracked.push({
                type: "variant",
                label: `${variant[0]} + ${variant[1]}`,
                qParam: d,
                mutation_string: `(${variant[0]}) AND (${variant[1]})`,
                query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
                variantType: "Custom Lineages & Mutations",
                route: {
                  pango: variant[0],
                  muts: variant[1]
                }
              })
            }
          })
        }
      }
      tracked = uniqBy(tracked, "label");
      return (tracked)
    }
  },
  created() {
    this.debounceWindowChange = debounce(this.updateWindow, 700);
  },
  mounted() {
    this.darkMode = this.dark == "true" || !!(this.dark) && this.dark != "false";

    const ofInterest = getBadMutations(true);
    this.moc = ofInterest.moc;
    this.moi = ofInterest.moi;

    this.queryLocation = findLocation;
    this.choroColorScale = scaleThreshold(schemeYlGnBu[this.choroColorDomain.length + 2])
      .domain(this.choroColorDomain);

    this.customMutations = this.grabCustomMutations();

    const formatDate = timeFormat("%e %B %Y");
    this.currentTime = new Date();
    this.today = formatDate(this.currentTime);


    this.$nextTick(function() {
      // resize listener
      window.addEventListener("resize", this.setDims);
      this.setDims;

      // set URL for sharing, etc.
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    // intial setup
    this.setDims();

    this.setupReport();
  },
  updated() {
    tippy(".dark-mode-helper", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "material",
      allowHTML: true,
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  },
  methods: {
    setDims() {
      this.mediumScreen = window.innerWidth < 900;
      this.smallScreen = window.innerWidth < 500;
    },
    setupReport() {
      this.basicSubscription = getBasicLocationReportData(this.$genomicsurl, this.loc).subscribe(results => {
        this.dateUpdated = results.dateUpdated.dateUpdated;
        this.lastUpdated = results.dateUpdated.lastUpdated;
        this.totalSequences = results.total;
        this.curatedLineages = results.curated;
        this.voc = results.voc;
        this.voi = results.voi;
        this.selectedLocation = results.location;
      })

      this.reportSubscription = getLocationReportData(this.$genomicsurl, this.loc, this.muts, this.pango, this.otherThresh, this.ndayThresh, this.dayThresh, this.recentWindow).subscribe(results => {
        this.lineagesByDay = results.lineagesByDay;
        this.noRecentData = results.mostRecentLineages && results.mostRecentLineages.length ? false : true;

        this.mostRecentLineages = results.mostRecentLineages;
        this.lineageDomain = results.lineageDomain;
        this.colorScale = scaleOrdinal(this.colorPalette).domain(this.lineageDomain);
        this.recentMin = timeDay.offset(this.currentTime, -1 * this.recentWindow);
        this.recentHeatmap = results.heatmap.characteristic.data;
        this.mostRecentDomain = results.heatmap.characteristic.yDomain;
      })

      this.updateSequenceCount();
    },
    createReport() {
      this.setupReport();
      this.updateTable();
      this.updateMaps();
    },
    updateLocations(selected) {
      if (selected) {
        this.newLocation = selected;
      }
    },
    submitNewLocation() {
      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.newLocation.id,
          alias: this.alias,
          pango: this.pango,
          variant: this.variant,
          muts: this.muts,
          dark: this.darkMode,
          selected: this.selected
        }
      })
      this.newLocation = null;
    },
    grabCustomMutations() {
      let custom = []
      if (this.pango) {
        const pango = typeof(this.pango) == "string" ? [{
          type: "pango",
          label: this.pango,
          qParam: this.pango
        }] : this.pango.map(d => ({
          type: "pango",
          label: d,
          qParam: d
        }))
        custom = custom.concat(pango);
      }
      if (this.variant) {
        let variant;
        if (typeof(this.variant) == "string") {
          const label = this.variant.split("|");
          variant = [{
            type: "variant",
            label: `${label[0]} + ${label[1]}`,
            qParam: this.variant
          }]
        } else {
          variant = this.variant.map(d => {
            const label = d.split("|");
            return ({
              type: "variant",
              label: `${label[0]} + ${label[1]}`,
              qParam: d
            })
          })
        }
        custom = custom.concat(variant);
      }
      if (this.muts) {
        const mutation = typeof(this.muts) == "string" ? [{
          type: "mutation",
          label: this.muts,
          qParam: this.muts
        }] : this.muts.map(d => ({
          type: "mutation",
          label: d,
          qParam: d
        }))
        custom = custom.concat(mutation);
      }
      return (custom)
    },
    deleteMutation(idx) {
      this.customMutations.splice(idx, 1);
    },
    addMutations() {
      if (this.newVariant) {
        this.customMutations.push(this.newVariant);
      }
      // this.customMutations.push(this.newVariant);
      this.customMutations = uniqBy(this.customMutations, "qParam");
      this.submitCount += 1;
    },
    clearMutations() {
      this.submitCount += 1;
      this.customMutations = [];
      this.selected = [];
    },
    submitNewMutations() {
      if (this.newVariant) {
        this.customMutations.push(this.newVariant);
      }
      let alias = this.customMutations.filter(d => d.type == "alias").map(d => d.qParam);
      let pango = this.customMutations.filter(d => d.type == "pango").map(d => d.qParam);

      const variant = this.customMutations.filter(d => d.type == "variant").map(d => d.qParam);
      const mutation = this.customMutations.filter(d => d.type == "mutation").map(d => d.qParam);

      let selected = this.customMutations.map(d => d.label).concat(this.selected);

      if (this.newVariant) {
        if (typeof(this.selected) == "string") {
          selected = [this.selected, this.newVariant.label];
        } else {
          selected.push(this.newVariant.label);
        }
      };

      // clear new additions
      this.submitCount += 1;

      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.loc,
          alias: uniq(alias),
          pango: uniq(pango),
          variant: uniq(variant),
          muts: uniq(mutation),
          dark: this.darkMode,
          selected: uniq(selected)
        }
      })
    },
    routeDark() {
      this.$router.push({
        name: "LocationReport",
        params: {
          disableScroll: true
        },
        query: {
          loc: this.loc,
          alias: this.alias,
          pango: this.pango,
          variant: this.variant,
          muts: this.muts,
          dark: this.darkMode,
          selected: this.selected
        }
      })
    },
    updateWindow() {
      this.dayThresh = +this.recentWindow;
      this.setupReport();
      this.updateMaps();
    },
    updateSequenceCount() {
      this.countSubscription = getSequenceCount(this.$genomicsurl, this.loc, false).subscribe(results => {
        this.seqCounts = results;
      })
    },
    updateMaps() {
      if (this.selectedLocation.admin_level === 0) {
        this.choroSubscription = getLocationMaps(this.$genomicsurl, this.loc, this.selectedMutations, this.recentWindow).subscribe(results => {
          this.geoData = results;

          this.choroMaxCount = max(results.flatMap(d => d.values), d => d.cum_total_count);
        })
      }
    },
    updateTable() {
      this.tableSubscription = getLocationTable(this.$genomicsurl, this.loc, this.selectedMutations, this.totalThresh).subscribe(results => {
        this.lineageTable = results;
      })
    }
  },
  data() {
    return ({
      smallScreen: false,
      mediumScreen: false,
      darkMode: null,
      currentTime: null,
      today: null,
      url: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      basicSubscription: null,
      reportSubscription: null,
      choroSubscription: null,
      tableSubscription: null,
      countSubscription: null,
      // methods
      queryLocation: null,
      // variables
      recentWindow: "60",
      recentMin: null,
      otherThresh: 0.03,
      ndayThresh: 5,
      dayThresh: 60,
      totalThresh: 25, // threshold for "unreliable estimate" in the table
      // location info
      selectedLocation: null,
      newLocation: null,
      // update mutations
      newMuts: [],
      newPango: null,
      customMutations: [],
      submitCount: 0,
      // data
      moi: [],
      moc: [],
      voi: null,
      voc: null,
      dateUpdated: null,
      lastUpdated: null,
      lineagesByDay: null,
      mostRecentLineages: null,
      noRecentData: false,
      lineageTable: null,
      lineageDomain: [],
      totalSequences: null,
      curatedLineages: [],
      recentHeatmap: null,
      heatmapColorScale: scaleSequential(interpolateRdPu),
      mostRecentDomain: null,
      geoData: null,
      seqCounts: null,
      widthHist: 300,
      marginHist: {
        left: 55,
        right: 55,
        top: 7,
        bottom: 25
      },
      // selections
      // scales
      // mainly Tableau 20: https://jrnold.github.io/ggthemes/reference/tableau_color_pal.html
      colorScale: null,
      choroColorDomain: [0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75],
      choroColorScale: null,
      choroCountThreshold: 25,
      choroMaxCount: null,
      colorPalette: ["#bab0ab", // grey (other)
        "#4E79A7", // dk blue
        "#aecBe8", // lt blue
        "#f28e2b", // orange
        "#FFBE7D", // lt. orange
        "#59a14f", // green
        "#8CD17D", // lt. green
        "#e15759", // red
        "#FF9D9A", // lt. red
        "#499894", // teal
        "#86BCB6", // lt. teal
        "#B6992D", // dk yellow
        "#F1CE63", // yellow
        "#D37295", // dk pink
        "#FABFD2", // lt. pink,
        "#B07AA1", // dk purple
        "#D4A6C8", // lt. purple
        "#9D7660", // brown
        "#D7B5A6", // lt. brown
        "#bcbd22", // puce
        "#79706E", // grey
        "#79706E"
      ]
      // [ "#bab0ab", // grey (other)
      //   "#4E79A7", // dk blue
      //   // "#1f77b4", // dk blue
      //   "#f28e2b", // orange
      //   "#59a14f", // green
      //   "#e15759", // red
      //   // "#9edae5", // teal
      //   "#499894", // teal
      //   "#B6992D", // dk yellow
      //   "#D37295", // dk pink
      //   // "#9467bd", // purple
      //   "#B07AA1", // dk purple
      //   "#9D7660", // brown
      //   // "#8c564b", // brown
      //   "#aecBe8", // lt blue
      //   "#FFBE7D", // lt. orange
      //   "#8CD17D", // lt. green
      //   "#FF9D9A", // lt. red
      //   "#86BCB6", // lt. teal
      //   "#F1CE63", // yellow
      //   // "#edc949", // yellow
      //   // "#ff9da7", // pink
      //   "#FABFD2", // lt. pink,
      //   "#D4A6C8", // lt. purple
      //   "#D7B5A6", // lt. brown
      //   "#bcbd22", // puce
      //   "#79706E", // grey
      //   "#79706E"
      // ])
    })
  },
  destroyed() {
    if (this.basicSubscription) {
      this.basicSubscription.unsubscribe();
    }

    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }

    if (this.choroSubscription) {
      this.choroSubscription.unsubscribe();
    }

    if (this.tableSubscription) {
      this.tableSubscription.unsubscribe();
    }

    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.font-size-small {
    font-size: small;
}

.btn-active {
    background-color: $primary-color;
    color: white;
}

.w-33 {
    width: 33% !important;
}

.w-75px {
    width: 75px !important;
}
</style>
