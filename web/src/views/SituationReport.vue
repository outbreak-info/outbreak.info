<template>
<div>
  <div class="my-4 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- CHANGE LOCATION MODAL -->
    <div id="change-locations-modal" class="modal fade">
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
                {{ location.label }}
                <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
              </button>
            </div>

            <div class="py-3 border-bottom">
              <div v-if="loc2Add.length" class="my-3">
                <h6 class="text-sec text-underline m-0">Locations to add</h6>
                <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(location, cIdx) in loc2Add" :key="cIdx" id="new-locations" @click="removeLoc2Add(cIdx)">
                  {{ location.label }}
                  <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
                </button>
              </div>

              <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
                <TypeaheadSelect :queryFunction="queryLocation" @selected="addLoc2Add" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Add location" totalLabel="total sequences" />
              </div>
            </div>
          </div>


          <div class="modal-footer border-secondary">
            <button type="button" class="btn" @click="clearNewLocations">Clear additions</button>
            <button type="button" class="btn btn-accent" @click="selectNewLocations" data-dismiss="modal">Save changes</button>

          </div>
        </div>
      </div>
    </div>

    <!-- CHANGE SELECTED LOCATION MODAL -->
    <div id="change-selected-location" class="modal fade">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Change selected location</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-3 py-3 border-bottom border-secondary">
              <h6 class="text-muted text-underline m-0">Current locations</h6>
              <button class="btn btn-accent-flat text-muted px-2 py-1 mr-2" @click="switchLocation()" data-dismiss="modal">
                Worldwide
              </button>
              <button class="btn btn-accent-flat text-muted px-2 py-1 mr-2" v-for="(location, lIdx3) in currentLocs" :key="lIdx3" @click="switchLocation(location)" data-dismiss="modal">
                {{ location.label }}
              </button>
            </div>

            <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
              <TypeaheadSelect :queryFunction="queryLocation" @selected="updateSelectedLoc" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Change location" totalLabel="total sequences" />
            </div>
          </div>


          <div class="modal-footer border-secondary">
            <!-- <button type="button" class="btn btn-accent" @click="switchLocationSubmit" data-dismiss="modal">Save changes</button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- CHANGE PANGOLIN LINEAGE MODAL -->
    <div id="change-pangolin-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Generate Custom Mutation Report</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <CustomReportForm @exit="closeModal" />
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="hasData">
      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div class="d-flex align-items-center mb-2">
        <router-link :to="{ name: 'SituationReports'}" class="no-underline">
          <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
            <font-awesome-icon class="mr-2 fa-sm" :icon="['fas', 'arrow-left']" />
            back
          </button>
        </router-link>
        <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center" data-toggle="modal" data-target="#change-locations-modal">
          <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
          add locations
        </button>
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div class="d-flex flex-column text-light mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start">

            <div class="d-flex align-items-end">
              <div class="d-flex align-items-center">
                <h1 class="m-0 font-weight-bold mutation-header">{{ title }}</h1>
                <button class="btn py-1 px-2 ml-4 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-pangolin-modal">
                  <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'sync']" />change mutation(s)
                </button>
              </div>
            </div>
            <div class="d-flex my-1 align-items-center">
              <small class="text-muted mr-3" v-if="reportMetadata && reportMetadata.mutation_synonyms && reportMetadata.mutation_synonyms.length > 1"><span>a.k.a. </span>
                <span v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms" :key="sIdx">
                  <b>{{ synonym }}</b>
                  <span v-if="sIdx < reportMetadata.mutation_synonyms.length - 1">, </span></span>
              </small>
              <small class="mutation-hyperlink" v-if="pangoLink">
                <a :href="pangoLink" target="_blank" rel="noreferrer">view on PANGO lineages</a>
              </small>

              <small class="text-grey mx-2" v-if="pangoLink && aquariaLink">
                &bull;
              </small>


              <!-- link to Aquaria structures -->
              <template v-if="aquariaLink">
                <small class="mutation-hyperlink" v-for="(link, lIdx) in aquariaLink" :key="lIdx">
                  <a :href="link.value.link" target="_blank" rel="noreferrer">
                    view <b>{{aquariaLink.length > 1 ? link.key + "-gene" : ""}}</b> {{link.value.count === 1 ? "mutation" : "mutations"}} on 3D structures (Aquaria)</a>
                  <span class="text-grey mx-2" v-if="lIdx < aquariaLink.length - 1">
                    &bull;
                  </span>
                </small>
              </template>

            </div>
            <div class="d-flex align-items-center">
              <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
                <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
              </small>
              <div class="text-grey font-size-2 ml-3" v-if="totalLineage">
                with <span class="text-light">{{totalLineage}} sequences</span> from GISAID
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

      <div id="warning" class="w-100 mt-3" v-if="(alias && alias.toLowerCase() == 'omicron') || pango == 'B.1.1.529'">
        <Warning
          text="As a newly designated Variant of Concern, Omicron is highly in flux. Expect the characteristic mutations associated with Omicron and its prevalence across locations to change as more sequences are reported. outbreak.info updates daily with new data from GISAID." />

      </div>

      <!-- Report Nav bar -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom">
        <div class="d-flex flex-wrap justify-content-center mx-3 py-2">
          <a href="#longitudinal">
            <button class="btn btn-grey mr-3">
              <small>Daily prevalence</small>
            </button>
          </a>

          <a href="#geographic">
            <button class="btn btn-grey mx-3 py-2">
              <small>Geographic prevalence</small>
            </button>
          </a>
          <a href="#resources">
            <button class="btn btn-grey mx-3 py-2">
              <small>Publications</small>
            </button>
          </a>
        </div>
      </div>


      <!-- REPORT -->
      <div class="row">
        <section id="intro" class="col-sm-6 col-md-7 pr-4">
          <div id="about-variant" class="mb-3 mx-4" v-if="reportMetadata">
            <div class="d-flex flex-wrap align-items-center justify-content-end">
              <small class="mx-3 text-muted" v-if="reportMetadata.location_first_identified"><em>First identified in {{ reportMetadata.location_first_identified }}</em></small>
              <div class="VOC" v-if="reportMetadata.variantType == 'Variant of Concern'">Variant of Concern</div>
              <div class="VOI" v-if="reportMetadata.variantType == 'Variant of Interest'">Variant of Interest</div>
              <div class="MOC" v-if="reportMetadata.variantType == 'Mutation of Concern'">Mutation of Concern</div>
              <div class="MOI" v-if="reportMetadata.variantType == 'Mutation of Interest'">Mutation of Interest</div>
            </div>

          </div>

          <!-- CHARACTERISTIC MUTATIONS -->
          <div class="mt-4" id="definition">
            <CharacteristicMutations :mutationName="reportName" :mutations="mutations" :reportType="reportType" :definitionLabel="definitionLabel" :additionalMutations="additionalMutations" :lineageName="lineageName" :sublineages="sublineageOptions"
              :aquariaLink="aquariaLink" v-if="mutations" />
          </div>

          <!-- SUBLINEAGE BREAKDOWN -->
          <SublineageTotals :lineageName="lineageName" :location="selectedLocation.label" :data="sublineagePrev" v-if="sublineagePrev && sublineagePrev.length" />


          <!-- BREAKDOWN BY PANGO LINEAGE -->
          <div class="my-4" v-if="mutationsByLineage && mutationsByLineage.length">
            <div v-if="reportType == 'lineage with added mutations'" class="mx-2 mb-1">
              <button class="btn btn-main-outline btn-mut router-link px-1 collapsed" data-toggle="collapse" href="#collapsePangoBreakdown" aria-expanded="true" aria-controls="collapsePangoBreakdown">
                <small><span class="if-collapsed">Show</span>
                  <span class="if-not-collapsed">Hide</span>
                  other lineages with {{ mutationName }}</small>
              </button>
            </div>

            <div class="mx-3" :class="{'collapse' : reportType == 'lineage with added mutations'}" id="collapsePangoBreakdown">
              <MutationsByLineage :title="`Global prevalence of ${mutationName} per PANGO lineage`" subtitle="Since first identification" :lineage="lineageName" :mutationName="mutationName" :data="mutationsByLineage" />
            </div>
          </div>

        </section>

        <!-- RIGHT: SUMMARY BOX -->
        <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-5 p-3 pr-4 summary-box bg-main text-light">
          <ReportSummary :dateUpdated="dateUpdated" :totalLineage="totalLineage" :smallScreen="smallScreen" :mutationName="reportName" :locationQueryParams="locationQueryParams" :reportType="reportType" :selected="selected"
            :locationTotals="locationTotals" :countries="countries" :states="states" />
        </section>
      </div>


      <!-- DAILY PREVALENCE -->
      <section class="vis my-3 py-3 d-flex flex-column align-items-center" id="longitudinal">
        <h4 class="mb-0">Average daily {{reportName}} prevalence {{locationLabel}}</h4>
        <small class="text-muted mb-2">Based on reported sample collection date</small>
        <div id="location-buttons" class="d-flex flex-wrap">
          <button class="btn btn-tab my-2" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="switchLocation(location)">{{ location.label }}</button>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
        </div>
        <ReportPrevalence :data="prevalence" :mutationName="reportName" :xmin="xmin" :xmax="xmax" :location="selectedLocation.label" :setWidth="width" />
      </section>

      <!-- DAILY SUBLINEAGE PREVALENCE -->
      <section class="vis my-3 py-3 d-flex flex-column align-items-center" id="longitudinal-sublineage" v-if="lineagesByDay">
        <h4 class="mb-0">Lineage breakdown of {{reportName}} by day {{locationLabel}}</h4>
        <small class="text-muted mb-2">Based on reported sample collection date</small>

        <!-- change location selectors for sublineage prevalences -->
        <div id="location-buttons" class="d-flex flex-wrap align-items-center">
          <button class="btn btn-tab my-2" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="switchLocation(location)">{{ location.label }}</button>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>

          <!-- change selection for streamgraph or overlay -->
          <div id="sublineage-overlay-selector ml-4">
            <div class="radio-item mr-3">
              <input type="radio" id="stack" :value="false" v-model="sublineageOverlay" @change="changeSublineageOverlay">
              <label for="stack">stack lineages</label>
            </div>
            <div class="radio-item mr-3">
              <input type="radio" id="overlay" :value="true" v-model="sublineageOverlay" @change="changeSublineageOverlay">
              <label for="overlay">overlay lineages</label>
            </div>
          </div>
        </div>

        <div id="sublinege-prevalence-overlay" v-if="sublineageOverlay">
          <div class="d-flex flex-wrap justify-content-center mt-2">
            <label class="b-contain m-0 mr-3 mb-2 variant-checkbox" v-for="option in sublineageOptions" :key="option">
              <small :style="`color: ${sublineageColorScale(option)}`" v-if="sublineageColorScale">{{option}}</small>
              <input type="checkbox" :value="option" v-model.lazy="selectedSublineages" @change="debounceSelectSublineage" />
              <div class="b-input" :style="[selectedSublineages.includes(option) ? {'background': sublineageColorScale(option), 'border-color': '#555'} : 'background:none']"></div>
            </label>
          </div>

          <ReportPrevalenceOverlay :data="sublineageLongitudinal" :epi="[]" :seqCounts="prevalence" :mutationName="reportName" :onlyTotals="false" :setWidth="width" v-if="sublineageLongitudinal&& sublineageLongitudinal.length" :xmin="xmin"
            :xmax="xmax" routeName="MutationReport" :locationID="selectedLocation.id" :locationName="selectedLocation.label" :setColorScale="sublineageColorScale" />
        </div>

        <!-- SUBLINEAGE BREAKDOWN: STREAMGRAPH -->
        <div id="sublineage-streamgraph" v-else>
          <HorizontalCategoricalLegend :values="sublineageOptions" :colorScale="sublineageColorScale" class="p-2 pt-3 bg-grey__lightest justify-content-center" />

          <LineagesByLocation :data="lineagesByDay" :recentData="sublineageTotalStacked" :xmin="xmin" :xmax="xmax" class="d-flex flex-column align-items-center" routeName="MutationReport" :setWidth="width" :location="selectedLocation.label"
            :seqCounts="prevalence" :mutationName="reportName" :onlyTotals="false" :colorScale="sublineageColorScale" :tooltipTotal="true" :plotTitle="`Percentage of ${reportName} sequences by lineage`" />
        </div>
      </section>

      <!-- GEOGRAPHIC PREVALENCE -->
      <section class="my-4 d-flex flex-column align-items-center" id="geographic">
        <div class="d-flex align-items-center">
          <h4 class="mb-0 mr-3">Cumulative {{reportName}} prevalence</h4>
          <div id="location-buttons" class="d-flex flex-wrap align-items-center">
            <button class="btn btn-tab" :class="{'btn-active': location.isActive }" v-for="(location, cIdx) in choroplethLocations" :key="cIdx" @click="switchLocation(location)">{{ location.label }}</button>
            <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
              <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
            </button>
          </div>
        </div>

        <div v-if="selectedLocation && selectedLocation.admin_level < 2">
          <template v-if="selectedLocation.admin_level < 1">
            <div class="d-flex align-items-center justify-content-end mb-3 mt-2">
              <router-link v-if="selectedLocation.id && selectedLocation.id != 'Worldwide'" class="btn btn-sec mr-3" :to="{name:'LocationReport', query:{loc: selectedLocation.id}}">View {{selectedLocation.label}} report</router-link>
              <Warning text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
            </div>
            <div class="d-flex flex-wrap">
              <!-- Legend -->
              <div class="d-flex flex-wrap justify-content-around align-items-center" id="choropleth-legend">
                <ClassedLegend :colorScale="choroColorScale" :label="`Est. ${ reportName } prevalence since identification`" :countThreshold="choroCountThreshold" :mutationName="mutationName" />
              </div>
              <!-- Total count filter -->
              <ThresholdSlider :countThreshold.sync="choroCountThreshold" :maxCount="choroMaxCount" />
            </div>

            <ReportChoropleth report="variant" class="mb-5" :data="choroData" :mutationName="reportName" :location="selectedLocation.label" :colorScale="choroColorScale" :countThreshold="choroCountThreshold" :setWidth="width" />
          </template>

          <ReportPrevalenceByLocation :data="choroData" :mutationName="reportName" :location="selected" :locationName="selectedLocation.label" class="mt-2" :colorScale="choroColorScale" />
        </div>

        <div class="text-muted my-5" v-else>
          Geographic prevalence is not available for counties. Please select worldwide, a country, or a division/state.
        </div>

      </section>

      <!-- RESOURCES -->
      <section id="resources">
        <ReportResources :mutationName="reportName" :searchTerms="searchTerms" />
      </section>

      <!-- METHODOLOGY -->
      <section class="mt-3 mb-5" id="methods">
        <h4>Methodology</h4>
        <ReportMethodology :dateUpdated="dateUpdated" :summary="true" />
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

    <div v-else-if="reportloading" class="half-page" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
      <div class="mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <h1 class="m-0 font-weight-bold mutation-header">{{ title }}</h1>
      </div>
      <p class="my-5">
        Calculating prevalences for {{title}}. Please be patient.
      </p>
    </div>

    <div v-else>
      <div class="d-flex flex-column align-items-start text-light mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <h1 class="m-0 font-weight-bold mutation-header">{{ title }}</h1>
      </div>
      <p class="my-5">
        No data found for <b>{{title}}</b>. Please check that you have specified the {{reportType}} properly.
      </p>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import uniq from "lodash/uniq";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";

import {
  scaleOrdinal,
  nest
} from "d3";

import ReportResources from "@/components/ReportResources.vue";
import ReportSummary from "@/components/ReportSummary.vue";

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
  faTrashAlt,
  faPlusCircle,
  faSpinner,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";


library.add(faClock, faTrashAlt, faPlusCircle, faSpinner, faInfoCircle);

import {
  mapState
} from "vuex";

import {
  getReportData,
  getCuratedMetadata,
  updateLocationData,
  findLocation,
  findPangolin,
  getLocationPrevalence
} from "@/api/genomics.js";

import {
  timeFormat,
  max,
  scaleThreshold
} from "d3";

import {
  schemeYlGnBu
} from "d3-scale-chromatic";

export default {
  name: "SituationReport",
  components: {
    FontAwesomeIcon,
    ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    CharacteristicMutations: () => import( /* webpackPrefetch: true */ "@/components/CharacteristicMutations.vue"),
    Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ReportPrevalence: () => import( /* webpackPrefetch: true */ "@/components/ReportPrevalence.vue"),
    ReportPrevalenceByLocation: () => import( /* webpackPrefetch: true */ "@/components/ReportPrevalenceByLocation.vue"),
    ReportChoropleth: () => import( /* webpackPrefetch: true */ "@/components/ReportChoropleth.vue"),
    ReportResources: () => import( /* webpackPrefetch: true */ "@/components/ReportResources.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    ReportSummary: () => import( /* webpackPrefetch: true */ "@/components/ReportSummary.vue"),
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    CustomReportForm: () => import( /* webpackPrefetch: true */ "@/components/CustomReportForm.vue"),
    MutationsByLineage: () => import( /* webpackPrefetch: true */ "@/components/MutationsByLineage.vue"),
    ClassedLegend: () => import( /* webpackPrefetch: true */ "@/components/ClassedLegend.vue"),
    ThresholdSlider: () => import( /* webpackPrefetch: true */ "@/components/ThresholdSlider.vue"),
    SublineageTotals: () => import( /* webpackPrefetch: true */ "@/components/SublineageTotals.vue"),
    HorizontalCategoricalLegend: () => import( /* webpackPrefetch: true */ "@/components/HorizontalCategoricalLegend.vue"),
    ReportPrevalenceOverlay: () => import( /* webpackPrefetch: true */ "@/components/ReportPrevalenceOverlay.vue"),
    LineagesByLocation: () => import( /* webpackPrefetch: true */ "@/components/LineagesByLocation.vue"),
  },
  props: {
    alias: String,
    loc: [Array, String],
    muts: [Array, String],
    pango: String,
    xmin: String,
    xmax: String,
    overlay: {
      type: [String, Boolean],
      default: "false"
    },
    selected: {
      type: String,
      default: "Worldwide"
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"]),
    smallScreen() {
      return (window.innerWidth < 500)
    },
    definitionLabel() {
      return this.reportType == "lineage" ? "Characteristic mutations in lineage" :
        this.reportType == "lineage with added mutations" ? "Characteristic mutations in variant" : "List of mutations";
    },
    locationLabel() {
      return this.selectedLocation.label == "Worldwide" ? "globally" : `in ${this.selectedLocation.label}`;
    },
    pangoLink() {
      return this.lineageName ? `https://cov-lineages.org/lineage.html?lineage=${this.lineageName}` : null
    },
    aquariaLink() {
      if (this.additionalMutations && this.additionalMutations.length > 0) {
        const aquariaStub = "https://aquaria.app/SARS-CoV-2/";
        const mutationsByGene = nest()
          .key(d => d.gene)
          .rollup(values => {
            return ({
              link: values[0].gene.toLowerCase() === "orf1b" ?
                // convert between ORF1b and ORF1ab: e.g. ORF1b P314L becomes https://aquaria.app/SARS-CoV-2/PP1ab?P4715L
                // in general: gene?mutations, separated by &
                `${aquariaStub}PP1ab?${values.map(d => this.calcORF1bLink(d)).join("&")}` : `${aquariaStub}${values[0].gene}?${values.map(d => d.mutation.replace(d.gene, "").replace(":", "")).join("&")}`,
              count: values.length
            })
          })
          .entries(this.additionalMutations)

        return (mutationsByGene)
      } else {
        return (null)
      }
    },
    choroplethLocations() {
      return (this.selectedLocations ? this.selectedLocations.filter(d => d.admin_level < 2) : null)
    }
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.pango != oldVal.pango || !isEqual(newVal.muts, oldVal.muts)) {
        this.newPangolin = null;
        this.lineageName = null;
        this.reportMetadata = null;
        this.setupReport();
      } else {
        this.updateLocations();
      }
    },
    alias: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.newPangolin = null;
        this.lineageName = null;
        this.reportMetadata = null;
        this.setupReport();
      }
    }
  },
  data() {
    return {
      // report details
      today: null,
      url: null,
      lineageName: null,
      mutationName: null,
      reportName: null,
      mutationVar: null,
      mutations: null,
      reportType: null,
      locationQueryParams: null,
      title: null,
      lastUpdated: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      width: 800,

      // Changing locations
      queryLocation: null,
      queryPangolin: null,
      newPangolin: null,
      currentLocs: null, // placeholder for current locations
      loc2Add: [], // array to store new locations to add
      newSelectedLocation: null, // stores location data when change the selected value

      // subscriptions
      dataSubscription: null,
      curatedSubscription: null,
      locationChangeSubscription: null,
      choroSubscription: null,
      hasData: false,

      // curated values
      searchTerms: null,

      // methods
      choroColorDomain: [0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75],
      choroColorScale: null,
      choroCountThreshold: 25,
      totalThresh: 25, // threshold for "unreliable estimate" in the table

      // forms
      sublineageOverlay: null,

      // data
      selectedLocations: null,
      selectedLocation: null,
      dateUpdated: null,
      reportMetadata: null,
      choroLocation: "country",
      choroData: null,
      choroMaxCount: null,
      countries: null,
      states: null,
      additionalMutations: null,
      sublineagePrev: null,
      sublineageLongitudinalAll: null,
      sublineageLongitudinal: null,
      sublineageTotalStacked: null,
      lineagesByDay: null,
      sublineageColorScale: null,
      sublineageColorPalette: [
        "#4E79A7", // dk blue
        "#f28e2b", // orange
        "#59a14f", // green
        "#e15759", // red
        "#499894", // teal
        "#B6992D", // dk yellow
        "#D37295", // dk pink
        "#B07AA1", // dk purple
        "#9D7660", // brown
        "#aecBe8", // lt blue
        "#FFBE7D", // lt. orange
        "#8CD17D", // lt. green
        "#FF9D9A", // lt. red
        "#86BCB6", // lt. teal
        "#F1CE63", // yellow
        "#FABFD2", // lt. pink,
        "#D4A6C8", // lt. purple
        "#D7B5A6", // lt. brown
        "#bcbd22", // puce
        "#79706E", // grey
      ],
      sublineageOptions: [],
      selectedSublineages: [],
      sublineages2Plot: 5,
      locationTotals: null,
      totalLineage: null,
      prevalence: [],
      mutationsByLineage: []
    }
  },
  created: function() {
    this.debounceSetDims = debounce(this.setDims, 150);
    this.debounceSelectSublineage = debounce(this.selectSublineage, 250);
  },
  mounted() {
    this.sublineageOverlay = this.overlay === "true";
    this.setDims();
    this.queryLocation = findLocation;
    this.queryPangolin = findPangolin;

    // common color scale for choropleth
    this.choroColorScale = scaleThreshold(schemeYlGnBu[this.choroColorDomain.length + 2])
      .domain(this.choroColorDomain);

    // Get date for the citation object
    const formatDate = timeFormat("%e %B %Y");
    var currentTime = new Date();
    this.today = formatDate(currentTime);

    // set URL for sharing, etc.
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);

      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })
    this.setupReport();
  },
  methods: {
    setDims() {
      const windowWidth = window.innerWidth;
      const widthRatio = windowWidth > 1000 ? 0.7 : 0.9;
      this.width = windowWidth * widthRatio;
    },
    setLineageAndMutationStr() {
      // Combined report for the WHO lineages; requires lookup of the WHO name using the curated lineages file.
      if (this.alias) {
        this.lineageName = this.$options.filters.capitalize(this.alias.toLowerCase());
        this.selectedMutationArr = null;
        this.title = `${this.lineageName} Variant Report`;
        this.reportType = "combined lineage";
        this.reportName = this.lineageName;
      } else {

        if (this.$route.query.pango) {
          if (this.$route.query.muts && this.$route.query.muts.length) {
            // Lineage + Mutation report
            this.lineageName = this.$route.query.pango.toUpperCase();
            this.selectedMutationArr = typeof(this.$route.query.muts) == "string" ? [this.$route.query.muts] : this.$route.query.muts;
            this.mutationName = typeof(this.$route.query.muts) == "string" ? this.$route.query.muts : this.$route.query.muts.join(", ");
            this.reportName = `${this.lineageName} Lineage with ${this.mutationName}`;
            this.reportType = "lineage with added mutations";
            this.searchTerms = [`${this.lineageName}" AND "${typeof(this.$route.query.muts) == "string" ? this.$route.query.muts.split(":").slice(-1) : this.$route.query.muts.map(d => d.split(":").slice(-1)[0]).join('" AND "')}`]
            this.title = `${this.reportName} Report`;
            const qParam = typeof(this.$route.query.muts) == "string" ? `${this.lineageName}|${this.$route.query.muts}` : `${this.lineageName}|${this.$route.query.muts.join(",")}`;
            this.locationQueryParams = {
              variant: [qParam]
            };
          } else {
            // Lineage report
            this.lineageName = this.$route.query.pango.toUpperCase();
            this.reportName = this.lineageName;
            this.selectedMutationArr = null;
            this.reportType = "lineage";
            this.title = `${this.reportName} Lineage Report`;
            this.searchTerms = [this.lineageName];
            this.locationQueryParams = {
              pango: [this.lineageName],
              selected: this.lineageName
            };
          }

        } else {
          if (typeof(this.$route.query.muts) == "string") {
            // Single mutation report
            this.lineageName = null;
            this.selectedMutationArr = this.$route.query.muts.split(",");
            this.reportName = this.selectedMutationArr.join(", ");
            this.mutationName = this.reportName;
            this.reportType = "mutation";
            this.searchTerms = [this.mutationName.split(":").slice(-1)];
            this.locationQueryParams = {
              muts: this.selectedMutationArr.join(" AND "),
              selected: this.selectedMutationArr.join(" AND ")
            };
            this.title = `${this.reportName} Mutation Report`;
          } else {
            // Variant (multiple mutation) report
            this.lineageName = null;
            this.reportName = this.$route.query.muts.join(", ");
            this.mutationName = this.reportName;
            this.searchTerms = [this.$route.query.muts.map(d => d.split(":").slice(-1)[0]).join('" AND "')];
            this.selectedMutationArr = this.$route.query.muts;
            this.reportType = this.$route.query.muts.length === 1 ? "mutation" : "variant";
            this.title = `${this.reportName} ${this.$options.filters.capitalize(this.reportType)} Report`;
            this.locationQueryParams = {
              muts: this.selectedMutationArr.join(" AND "),
              selected: this.selectedMutationArr.join(" AND ")
            };
          }
        }
      }
    },
    setupReport() {
      // set default, if needed.
      if (!this.selected) {
        this.selected = "Worldwide";
      }

      this.setLineageAndMutationStr();
      if (this.lineageName || this.selectedMutationArr || this.alias) {
        this.dataSubscription = getReportData(this.$genomicsurl, this.alias, this.loc, this.selectedMutationArr, this.lineageName, this.selected, this.totalThresh).subscribe(results => {
          this.hasData = true;

          // selected locations
          this.selectedLocations = results.locations;
          this.currentLocs = results.locations.filter(d => d.id != "Worldwide");
          const selected = results.locations.filter(d => d.isActive);
          this.selectedLocation = selected.length === 1 ? selected[0] : null;

          // date updated
          this.dateUpdated = results.dateUpdated.dateUpdated;
          this.lastUpdated = results.dateUpdated.lastUpdated;

          // worldwide stats
          const global = results.locPrev.filter(d => d.location_id == "Worldwide");
          this.totalLineage = global.length === 1 ? global[0].lineage_count_formatted : null;

          // sublineagePrev
          this.sublineagePrev = results.sublineagePrev;

          // location prevalence
          this.locationTotals = results.locPrev;

          // longitudinal data: prevalence over time
          this.prevalence = results.longitudinal;
          this.sublineageLongitudinalAll = results.longitudinalSublineages;
          // stream graph of lineages by day
          this.lineagesByDay = results.lineagesByDay;
          this.sublineageTotalStacked = results.sublineageTotalStacked;
          this.setSublineageColorScale();


          // // recent data by country & countries with that lineage.
          this.countries = results.countries;
          this.states = results.states;
          this.choroData = results.choroData;
          this.choroMaxCount = max(this.choroData, d => d.cum_total_count);

          // characteristic mutations
          this.mutations = results.mutations;

          // Mutation details for queried mutations -- to add to the characteristic mutation maps for things like Alpha + E484K
          this.additionalMutations = results.mutationDetails;

          // Mutation distribution by lineage
          this.mutationsByLineage = results.mutationsByLineage;

          if (results.md) {
            this.reportMetadata = results.md;
            this.searchTerms = this.reportType != "lineage with added mutations" && results.md.searchTerms ? results.md.searchTerms : [this.searchTerms];
            this.disclaimer = results.md.disclaimer ? results.md.disclaimer : this.disclaimer;
          } else {
            this.searchTerms = [this.searchTerms];
          }
        })
      }
    },
    selectSublineage() {
      this.sublineageLongitudinal = this.sublineageLongitudinalAll.filter(d => this.selectedSublineages.includes(d.label));
    },
    setSublineageColorScale() {
      if (this.sublineagePrev) {
        this.sublineageOptions = this.sublineagePrev
          .filter(d => d.lineage_count)
          .map(d => d.mutation_string)
          .slice(0, this.sublineageColorPalette.length);

        // only show the top 5 most prevalent sublineages
        if (!this.selectedSublineages.length) {
          this.selectedSublineages = this.sublineageOptions.slice(0, this.sublineages2Plot);
        }
        this.selectSublineage();

        this.sublineageColorScale = scaleOrdinal(this.sublineageColorPalette)
          .domain(this.sublineageOptions)
          .unknown("#bab0ab");
      }
    },
    removeLocation(idx) {
      this.currentLocs.splice(idx, 1);
    },
    addLoc2Add(selected) {
      this.loc2Add.push(selected);
    },
    updateSelectedLoc(selected) {
      this.selectedLocations.push(selected);
      this.closeLocModal();
      this.switchLocation(selected)
    },
    removeLoc2Add(idx) {
      this.loc2Add.splice(idx, 1);
    },
    clearNewLocations() {
      this.loc2Add = [];
    },
    // Add new locations
    selectNewLocations() {
      let locationIDs = this.loc2Add.map(d => d.id);
      const newSelected = locationIDs[0];
      // de-duplicate
      locationIDs = uniq(this.currentLocs.map(d => d.id).concat(locationIDs).filter(d => d != "Worldwide"));

      // reset the fields.
      this.loc2Add = [];

      this.$router.push({
        name: "MutationReport",
        params: {
          alias: this.alias
        },
        query: {
          pango: this.pango,
          muts: this.muts,
          selected: newSelected,
          loc: locationIDs,
          overlay: this.sublineageOverlay
        }
      })
    },
    // Select a location button on the longitudinal traces or choropleths
    switchLocation(location) {
      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      if (!location) {
        this.selectedLocation = "Worldwide";
      } else {
        location.isActive = true;

        this.selectedLocation = location.id;
      }

      // const countries = this.selectedLocations.filter(d => d.type == "country").map(d => d.name);
      const ids = this.selectedLocations.map(d => d.id).filter(d => d != "Worldwide");

      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.pango,
          muts: this.muts,
          loc: ids,
          selected: this.selectedLocation,
          overlay: this.sublineageOverlay
        },
        params: {
          alias: this.alias,
          disableScroll: true
        }
      })
    },
    updateLocations() {
      // set default, if needed.
      if (!this.selected) {
        this.selected = "Worldwide";
      }
      this.locationChangeSubscription = updateLocationData(this.$genomicsurl, this.alias, this.selectedMutationArr, this.lineageName, this.loc, this.selected, this.totalThresh).subscribe(results => {
        // selected locations
        this.selectedLocations = results.locations;
        this.currentLocs = results.locations.filter(d => d.id != "Worldwide");
        const selected = results.locations.filter(d => d.isActive);
        this.selectedLocation = selected.length === 1 ? selected[0] : null;

        // longitudinal data: prevalence over time
        this.prevalence = results.longitudinal;
        this.sublineageLongitudinalAll = results.longitudinalSublineages;
        // stream graph of lineages by day
        this.lineagesByDay = results.lineagesByDay;
        this.sublineageTotalStacked = results.sublineageTotalStacked;
        this.setSublineageColorScale();

        // cumulative totals for table
        this.locationTotals = results.locPrev;

        // recent data by country.
        this.choroData = results.byCountry;

        // sublineage breakdown
        this.sublineagePrev = results.sublineagePrev;

      })
    },
    changeSublineageOverlay(selected) {
      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.pango,
          muts: this.muts,
          loc: this.loc,
          selected: this.selected,
          xmin: this.xmin,
          xmax: this.xmax,
          overlay: this.sublineageOverlay
        },
        params: {
          alias: this.alias,
          disableScroll: true
        }
      })
    },
    updatePangolin(selected) {
      this.newPangolin = selected.name;
    },
    selectNewPangolin() {
      // const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          loc: this.loc,
          pango: this.newPangolin,
          muts: this.muts,
          selected: this.selected,
          overlay: this.sublineageOverlay
        }
      })
    },
    closeLocModal() {
      $("#change-selected-location").modal("hide");
    },
    closeModal() {
      $("#change-pangolin-modal").modal("hide");
    },
    calcORF1bLink(mutation) {
      const codonOffset = 4401;
      // convert between ORF1b and ORF1ab: e.g. ORF1b P314L becomes https://aquaria.app/SARS-CoV-2/PP1ab?P4715L
      if (mutation.type == "substitution") {
        return (`${mutation.ref_aa}${mutation.codon_num + codonOffset}${mutation.alt_aa}`)
      } else if (mutation.type == "deletion") {
        return (`${mutation}`)
      }

    }
  },
  destroyed() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    if (this.choroSubscription) {
      this.choroSubscription.unsubscribe();
    }

    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }

    if (this.locationChangeSubscription) {
      this.locationChangeSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
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
