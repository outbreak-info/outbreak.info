<template>
  <div>
    <div
      class="mt-1 mb-4 half-page text-left"
      :class="[smallScreen ? 'mx-2' : 'mx-5']"
    >
      <!-- LOADING -->
      <div v-if="reportloading" class="loader">
        <font-awesome-icon
          class="fa-pulse fa-4x text-highlight"
          :icon="['fas', 'spinner']"
        />
      </div>

      <!-- CHANGE LOCATION MODAL -->
      <div id="change-locations-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header border-secondary">
              <h5 id="exampleModalLabel" class="modal-title">
                Select report locations
              </h5>
              <button
                type="button"
                class="close font-size-2"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="mb-3 py-3 border-bottom border-secondary">
                <h6 class="text-muted text-underline m-0">Current locations</h6>
                <button
                  v-for="(location, lIdx2) in currentLocs"
                  :key="lIdx2"
                  class="btn btn-accent-flat text-muted px-2 py-1 mr-2"
                  @click="removeLocation(lIdx2)"
                >
                  {{ location.label }}
                  <font-awesome-icon
                    class="fa-sm ml-1"
                    :icon="['fas', 'trash-alt']"
                  />
                </button>
              </div>

              <div class="py-3 border-bottom">
                <div v-if="loc2Add.length" class="my-3">
                  <h6 class="text-sec text-underline m-0">Locations to add</h6>
                  <button
                    v-for="(location, cIdx) in loc2Add"
                    id="new-locations"
                    :key="cIdx"
                    class="btn btn-main-flat px-2 py-1 mr-2"
                    @click="removeLoc2Add(cIdx)"
                  >
                    {{ location.label }}
                    <font-awesome-icon
                      class="fa-sm ml-1"
                      :icon="['fas', 'trash-alt']"
                    />
                  </button>
                </div>

                <div
                  id="select-location"
                  class="d-flex align-items-center justify-content-center my-3"
                >
                  <TypeaheadSelect
                    wrapperClass="w-100"
                    :queryFunction="queryLocation"
                    @selected="addLoc2Add"
                    :apiUrl="$genomicsurl"
                    labelVariable="label"
                    placeholder="Add location"
                    totalLabel="total sequences"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn" @click="clearNewLocations">
                Clear additions
              </button>
              <button
                type="button"
                class="btn btn-accent"
                data-dismiss="modal"
                @click="selectNewLocations"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CHANGE SELECTED LOCATION MODAL -->
      <div id="change-selected-location" class="modal fade">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header border-secondary">
              <h5 id="exampleModalLabel" class="modal-title">
                Change selected location
              </h5>
              <button
                type="button"
                class="close font-size-2"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="mb-3 py-3 border-bottom border-secondary">
                <h6 class="text-muted text-underline m-0">Current locations</h6>
                <button
                  class="btn btn-accent-flat text-muted px-2 py-1 mr-2"
                  data-dismiss="modal"
                  @click="switchLocation()"
                >
                  Worldwide
                </button>
                <button
                  v-for="(location, lIdx3) in currentLocs"
                  :key="lIdx3"
                  class="btn btn-accent-flat text-muted px-2 py-1 mr-2"
                  data-dismiss="modal"
                  @click="switchLocation(location)"
                >
                  {{ location.label }}
                </button>
              </div>

              <div
                id="select-location"
                class="d-flex align-items-center justify-content-center my-3"
              >
                <TypeaheadSelect
                  wrapperClass="w-100"
                  :queryFunction="queryLocation"
                  :apiUrl="$genomicsurl"
                  labelVariable="label"
                  placeholder="Change location"
                  totalLabel="total sequences"
                  @selected="updateSelectedLoc"
                />
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
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header border-secondary">
              <h5 id="exampleModalLabel" class="modal-title">
                Generate Custom Mutation Report
              </h5>
              <button
                type="button"
                class="close font-size-2"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <CustomReportForm @exit="closeModal" />
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn" data-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasData">
        <!-- SOCIAL MEDIA SHARE, BACK BTN -->
        <div v-if="!embedded" class="d-flex align-items-center mb-2 mt-3">
          <router-link :to="{ name: 'SituationReports' }" class="no-underline">
            <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
              <font-awesome-icon
                class="mr-2 fa-sm"
                :icon="['fas', 'arrow-left']"
              />
              back
            </button>
          </router-link>
          <button
            class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center"
            data-toggle="modal"
            data-target="#change-locations-modal"
          >
            <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
            add locations
          </button>
          <ShareReport title="title" url="url" />
        </div>

        <!-- REPORT HEADER -->
        <div
          v-if="!embedded"
          class="d-flex flex-column text-light mutation-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <h4 class="m-0 mt-n1 text-grey">
            Lineage
            <span class="mx-1">|</span>
            Mutation Tracker
          </h4>
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column align-items-start">
              <div class="d-flex align-items-end">
                <div class="d-flex align-items-center">
                  <h1 class="m-0 font-weight-bold mutation-header">
                    {{ title }}
                  </h1>
                  <button
                    class="btn py-1 px-2 ml-4 btn-grey flex-shrink-0"
                    data-toggle="modal"
                    data-target="#change-pangolin-modal"
                  >
                    <font-awesome-icon
                      class="mr-2 font-size-small"
                      :icon="['fas', 'sync']"
                    />
                    change mutation(s)
                  </button>
                </div>
              </div>
              <div class="d-flex my-1 align-items-center">
                <small
                  v-if="
                    reportMetadata &&
                    reportMetadata.mutation_synonyms &&
                    reportMetadata.mutation_synonyms.length > 1
                  "
                  class="text-muted mr-3"
                >
                  <span>a.k.a.</span>
                  <span
                    v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms"
                    :key="sIdx"
                  >
                    <b>{{ synonym }}</b>
                    <span
                      v-if="sIdx < reportMetadata.mutation_synonyms.length - 1"
                    >
                      ,
                    </span>
                  </span>
                </small>
                <small v-if="pangoLink" class="mutation-hyperlink">
                  <a :href="pangoLink" target="_blank" rel="noreferrer">
                    view on PANGO lineages
                  </a>
                </small>

                <small v-if="pangoLink && aquariaLink" class="text-grey mx-2">
                  &bull;
                </small>

                <!-- link to Aquaria structures -->
                <div v-if="aquariaLink">
                  <small
                    v-for="(link, lIdx) in aquariaLink"
                    :key="lIdx"
                    class="mutation-hyperlink"
                  >
                    <a :href="link.value.link" target="_blank" rel="noreferrer">
                      view
                      <b>
                        {{ aquariaLink.length > 1 ? link.key + '-gene' : '' }}
                      </b>
                      {{ link.value.count === 1 ? 'mutation' : 'mutations' }} on
                      3D structures (Aquaria)
                    </a>
                    <span
                      v-if="lIdx < aquariaLink.length - 1"
                      class="text-grey mx-2"
                    >
                      &bull;
                    </span>
                  </small>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <small
                  v-if="lastUpdated"
                  class="text-muted badge bg-grey__lightest mt-1"
                >
                  <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                  Updated {{ lastUpdated }} ago
                </small>
                <div v-if="totalLineage" class="text-grey font-size-2 ml-3">
                  with
                  <span class="text-light">{{ totalLineage }} sequences</span>
                  from GISAID
                </div>
              </div>
            </div>
            <div
              class="d-flex flex-column align-items-end justify-content-between flex-shrink-0"
            >
              <div class="d-flex align-items-center mb-1 fa-lg">
                Enabled by data from
                <a
                  href="https://www.gisaid.org/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <img
                    src="@/assets/resources/gisaid.png"
                    class="gisaid ml-2"
                    alt="GISAID Initiative"
                  />
                </a>
              </div>
              <div class="d-flex align-items-center bright-hyperlink my-1">
                <font-awesome-icon
                  class="mr-2"
                  :icon="['fas', 'info-circle']"
                />
                <router-link
                  :to="{ name: 'SituationReportCaveats' }"
                  class="bright-hyperlink"
                >
                  How to interpret these reports
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Simplified form for embedded reports -->
        <div
          v-else
          class="d-flex flex-column text-light mutation-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <div class="d-flex align-items-center">
            <h4 class="m-0 mt-n1 text-grey">
              Lineage
              <span class="mx-1">|</span>
              Mutation Tracker
            </h4>
            <a
              href="https://outbreak.info"
              class="ml-4 navbar-brand no-underline text-light"
            >
              <img
                src="@/assets/icon-01.svg"
                width="30"
                height="30"
                class="d-inline-block align-top"
                alt="Outbreak.info"
              />
              outbreak.info
            </a>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column align-items-start">
              <h1 class="m-0 font-weight-bold mutation-header">
                {{ title }}
              </h1>

              <div class="d-flex my-1 align-items-center">
                <small
                  v-if="
                    reportMetadata &&
                    reportMetadata.mutation_synonyms &&
                    reportMetadata.mutation_synonyms.length > 1
                  "
                  class="text-muted mr-3"
                >
                  <span>a.k.a.</span>
                  <span
                    v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms"
                    :key="sIdx"
                  >
                    <b>{{ synonym }}</b>
                    <span
                      v-if="sIdx < reportMetadata.mutation_synonyms.length - 1"
                    >
                      ,
                    </span>
                  </span>
                </small>
                <small v-if="pangoLink" class="mutation-hyperlink">
                  <a :href="pangoLink" target="_blank" rel="noreferrer">
                    view on PANGO lineages
                  </a>
                </small>

                <small v-if="pangoLink && aquariaLink" class="text-grey mx-2">
                  &bull;
                </small>

                <!-- link to Aquaria structures -->
                <div v-if="aquariaLink">
                  <small
                    v-for="(link, lIdx) in aquariaLink"
                    :key="lIdx"
                    class="mutation-hyperlink"
                  >
                    <a :href="link.value.link" target="_blank" rel="noreferrer">
                      view
                      <b>
                        {{ aquariaLink.length > 1 ? link.key + '-gene' : '' }}
                      </b>
                      {{ link.value.count === 1 ? 'mutation' : 'mutations' }} on
                      3D structures (Aquaria)
                    </a>
                    <span
                      v-if="lIdx < aquariaLink.length - 1"
                      class="text-grey mx-2"
                    >
                      &bull;
                    </span>
                  </small>
                </div>
              </div>
            </div>
            <div
              class="d-flex flex-column align-items-end justify-content-between flex-shrink-0"
            >
              <div class="d-flex align-items-center">
                <small
                  v-if="lastUpdated"
                  class="text-muted badge bg-grey__lightest mt-1"
                >
                  <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                  Updated {{ lastUpdated }} ago
                </small>
                <div v-if="totalLineage" class="text-grey font-size-2 ml-3">
                  with
                  <span class="text-light">{{ totalLineage }} sequences</span>
                  from GISAID
                </div>
              </div>

              <div class="d-flex align-items-center bright-hyperlink my-1">
                <font-awesome-icon
                  class="mr-2"
                  :icon="['fas', 'info-circle']"
                />
                <router-link
                  :to="{ name: 'SituationReportCaveats' }"
                  class="bright-hyperlink"
                >
                  How to interpret these reports
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="
            (alias && alias.toLowerCase() === 'omicron') ||
            pango === 'B.1.1.529'
          "
          id="warning"
          class="w-100 mt-3"
        />

        <!-- Report Nav bar -->
        <div
          class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom"
        >
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
            <div v-if="reportMetadata" id="about-variant" class="mb-3 mx-4">
              <div
                class="d-flex flex-wrap align-items-center justify-content-end"
              >
                <small
                  v-if="reportMetadata.location_first_identified"
                  class="mx-3 text-muted"
                >
                  <em>
                    First identified in
                    {{ reportMetadata.location_first_identified }}
                  </em>
                </small>
                <div
                  v-if="reportMetadata.variantType === 'Variant of Concern'"
                  class="VOC"
                >
                  Variant of Concern
                </div>
                <div
                  v-if="reportMetadata.variantType === 'Variant of Interest'"
                  class="VOI"
                >
                  Variant of Interest
                </div>
                <div
                  v-if="reportMetadata.variantType === 'Mutation of Concern'"
                  class="MOC"
                >
                  Mutation of Concern
                </div>
                <div
                  v-if="reportMetadata.variantType === 'Mutation of Interest'"
                  class="MOI"
                >
                  Mutation of Interest
                </div>
              </div>
            </div>

            <!-- CHARACTERISTIC MUTATIONS -->
            <div id="definition" class="mt-4">
              <CharacteristicMutations
                v-if="mutations"
                :mutationName="reportName"
                :mutations="mutations"
                :reportType="reportType"
                :definitionLabel="definitionLabel"
                :additionalMutations="additionalMutations"
                :lineageName="lineageName"
                :sublineages="sublineageOptions"
                :aquariaLink="aquariaLink"
              />
            </div>

            <!-- SUBLINEAGE BREAKDOWN -->
            <SublineageTotals
              v-if="sublineagePrev && sublineagePrev.length"
              :routeTo="routeTo"
              :lineageName="lineageName"
              :location="selectedLocation.label"
              :data="sublineagePrev"
            />

            <!-- BREAKDOWN BY PANGO LINEAGE -->
            <div
              v-if="mutationsByLineage && mutationsByLineage.length"
              class="my-4"
            >
              <div
                v-if="reportType === 'lineage with added mutations'"
                class="mx-2 mb-1"
              >
                <button
                  class="btn btn-main-outline btn-mut router-link px-1 collapsed"
                  data-toggle="collapse"
                  href="#collapsePangoBreakdown"
                  aria-expanded="true"
                  aria-controls="collapsePangoBreakdown"
                >
                  <small>
                    <span class="if-collapsed">Show</span>
                    <span class="if-not-collapsed">Hide</span>
                    other lineages with {{ mutationName }}
                  </small>
                </button>
              </div>

              <div
                id="collapsePangoBreakdown"
                class="mx-3"
                :class="{
                  collapse: reportType === 'lineage with added mutations',
                }"
              >
                <MutationsByLineage
                  :routeTo="routeTo"
                  :title="`Global prevalence of ${mutationName} per PANGO lineage`"
                  subtitle="Since first identification"
                  :lineage="lineageName"
                  :mutationName="mutationName"
                  :data="mutationsByLineage"
                />
              </div>
            </div>
          </section>

          <!-- RIGHT: SUMMARY BOX -->
          <section
            id="summary"
            class="d-flex flex-column justify-content-between col-sm-6 col-md-5 p-3 pr-4 summary-box bg-main text-light"
          >
            <ReportSummary
              :dateUpdated="dateUpdated"
              :totalLineage="totalLineage"
              :smallScreen="smallScreen"
              :mutationName="reportName"
              :locationQueryParams="locationQueryParams"
              :reportType="reportType"
              :selected="selected"
              :locationTotals="locationTotals"
              :countries="countries"
              :states="states"
              :routeTo="routeTo"
            />
          </section>
        </div>

        <!-- DAILY PREVALENCE -->
        <section
          id="longitudinal"
          class="vis my-3 py-3 d-flex flex-column align-items-center"
        >
          <h4 class="mb-0">
            Average daily {{ reportName }} prevalence {{ locationLabel }}
          </h4>
          <small class="text-muted mb-2">
            Based on reported sample collection date
          </small>
          <div id="location-buttons" class="d-flex flex-wrap mb-3">
            <button
              v-for="(location, lIdx) in selectedLocations"
              :key="lIdx"
              class="btn btn-tab my-2"
              :class="{ 'btn-active': location.isActive }"
              @click="switchLocation(location)"
            >
              {{ location.label }}
            </button>
            <button
              class="btn btn-main-outline d-flex align-items-center my-2"
              data-toggle="modal"
              data-target="#change-locations-modal"
            >
              Change locations
              <font-awesome-icon
                class="ml-2 font-size-small"
                :icon="['fas', 'sync']"
              />
            </button>
          </div>
          <ReportPrevalence
            :data="prevalence"
            :mutationName="reportName"
            :xmin="xmin"
            :xmax="xmax"
            :location="selectedLocation.label"
            :setWidth="width"
            :routeName="routeTo"
          />
        </section>

        <!-- DAILY SUBLINEAGE PREVALENCE -->
        <section
          v-if="lineagesByDay && lineagesByDay.length"
          id="longitudinal-sublineage"
          class="vis my-3 py-3 d-flex flex-column align-items-center"
        >
          <h4 class="mb-0">
            Lineage breakdown of {{ reportName }} by day {{ locationLabel }}
          </h4>
          <small class="text-muted mb-2">
            Based on reported sample collection date
          </small>

          <!-- change location selectors for sublineage prevalences -->
          <div
            id="location-buttons"
            class="d-flex flex-wrap align-items-center"
          >
            <button
              v-for="(location, lIdx) in selectedLocations"
              :key="lIdx"
              class="btn btn-tab my-2"
              :class="{ 'btn-active': location.isActive }"
              @click="switchLocation(location)"
            >
              {{ location.label }}
            </button>
            <button
              class="btn btn-main-outline d-flex align-items-center my-2"
              data-toggle="modal"
              data-target="#change-locations-modal"
            >
              Change locations
              <font-awesome-icon
                class="ml-2 font-size-small"
                :icon="['fas', 'sync']"
              />
            </button>

            <!-- change selection for streamgraph or overlay -->
            <div id="sublineage-overlay-selector ml-4">
              <div class="radio-item mr-3">
                <input
                  id="stack"
                  v-model="sublineageOverlay"
                  type="radio"
                  :value="false"
                  @change="changeSublineageOverlay"
                />
                <label for="stack">stack lineages</label>
              </div>
              <div class="radio-item mr-3">
                <input
                  id="overlay"
                  v-model="sublineageOverlay"
                  type="radio"
                  :value="true"
                  @change="changeSublineageOverlay"
                />
                <label for="overlay">overlay lineages</label>
              </div>
            </div>
          </div>

          <div v-if="sublineageOverlay" id="sublinege-prevalence-overlay">
            <div class="d-flex flex-wrap justify-content-center mt-2">
              <label
                v-for="option in sublineageOptions"
                :key="option"
                class="b-contain m-0 mr-3 mb-2 variant-checkbox"
              >
                <small
                  v-if="sublineageColorScale"
                  :style="`color: ${sublineageColorScale(option)}`"
                >
                  {{ option }}
                </small>
                <input
                  v-model.lazy="selectedSublineages"
                  type="checkbox"
                  :value="option"
                  @change="debounceSelectSublineage"
                />
                <div
                  class="b-input"
                  :style="[
                    selectedSublineages.includes(option)
                      ? {
                          background: sublineageColorScale(option),
                          'border-color': '#555',
                        }
                      : 'background:none',
                  ]"
                />
              </label>
            </div>

            <ReportPrevalenceOverlay
              v-if="sublineageLongitudinal && sublineageLongitudinal.length"
              :data="sublineageLongitudinal"
              :epi="[]"
              :routeName="routeTo"
              :seqCounts="prevalence"
              :mutationName="reportName"
              :onlyTotals="false"
              :setWidth="width"
              :xmin="xmin"
              :xmax="xmax"
              :locationID="selectedLocation.id"
              :locationName="selectedLocation.label"
              :setColorScale="sublineageColorScale"
            />
          </div>

          <!-- SUBLINEAGE BREAKDOWN: STREAMGRAPH -->
          <div v-else id="sublineage-streamgraph">
            <HorizontalCategoricalLegend
              :values="sublineageOptions"
              :colorScale="sublineageColorScale"
              class="p-2 pt-3 bg-grey__lightest justify-content-center"
            />

            <LineagesByLocation
              :data="lineagesByDay"
              :recentData="sublineageTotalStacked"
              :xmin="xmin"
              :xmax="xmax"
              class="d-flex flex-column align-items-center"
              :routeName="routeTo"
              :setWidth="width"
              :location="selectedLocation.label"
              :seqCounts="prevalence"
              :mutationName="reportName"
              :onlyTotals="false"
              :colorScale="sublineageColorScale"
              :tooltipTotal="true"
              :plotTitle="`Percentage of ${reportName} sequences by lineage`"
            />
          </div>
        </section>

        <!-- GEOGRAPHIC PREVALENCE -->
        <section
          id="geographic"
          class="my-4 d-flex flex-column align-items-center"
        >
          <div class="d-flex align-items-center">
            <h4 class="mb-0 mr-3">{{ reportName }} prevalence</h4>
            <div
              id="location-buttons"
              class="d-flex flex-wrap align-items-center"
            >
              <button
                v-for="(location, cIdx) in choroplethLocations"
                :key="cIdx"
                class="btn btn-tab"
                :class="{ 'btn-active': location.isActive }"
                @click="switchLocation(location)"
              >
                {{ location.label }}
              </button>
              <button
                class="btn btn-main-outline d-flex align-items-center my-2"
                data-toggle="modal"
                data-target="#change-locations-modal"
              >
                Change locations
                <font-awesome-icon
                  class="ml-2 font-size-small"
                  :icon="['fas', 'sync']"
                />
              </button>
            </div>
          </div>

          <div v-if="selectedLocation && selectedLocation.admin_level < 2">
            <div v-if="selectedLocation.admin_level < 1">
              <div
                class="d-flex align-items-center justify-content-end mb-3 mt-2"
              >
                <router-link
                  v-if="
                    selectedLocation.id && selectedLocation.id !== 'Worldwide'
                  "
                  class="btn btn-sec mr-3"
                  :to="{
                    name: 'LocationReport',
                    query: { loc: selectedLocation.id },
                  }"
                >
                  View {{ selectedLocation.label }} report
                </router-link>
                <Warning
                  text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>"
                />
              </div>
              <div class="d-flex flex-wrap">
                <!-- Legend -->
                <div
                  id="choropleth-legend"
                  class="d-flex flex-wrap justify-content-around align-items-center"
                >
                  <ClassedLegend
                    :colorScale="choroColorScale"
                    :label="choroLabel"
                    :countThreshold="choroCountThreshold"
                    :mutationName="mutationName"
                  />
                </div>

                <div class="d-flex flex-column flex-wrap">
                  <!-- Total count filter -->
                  <ThresholdSlider
                    v-model:countThreshold="choroCountThreshold"
                    :maxCount="choroMaxCount"
                  />

                  <!-- Ndays filter -->
                  <div class="d-flex align-items-center flex-shrink-0">
                    <small>Prevalence over the last</small>
                    <input
                      v-model="choroNdays"
                      class="border p-1 mx-2"
                      :style="{
                        'border-color': '#bababa !important',
                        width: '40px',
                      }"
                      placeholder="days"
                      @change="debounceChoroWindowChange()"
                    />
                    <small>days</small>
                    <small>
                      <button
                        class="btn btn-grey px-2 fa-sm ml-2 text-lowercase"
                        @click="updateChoroWindow(true)"
                      >
                        all time
                      </button>
                    </small>
                  </div>
                </div>
              </div>

              <ReportChoropleth
                :report="routeTo"
                class="mb-5"
                :data="choroData"
                :mutationName="reportName"
                :location="selectedLocation.label"
                :colorScale="choroColorScale"
                :countThreshold="choroCountThreshold"
                :setWidth="width"
              />
            </div>

            <div class="d-flex flex-column align-items-end">
              <!-- Ndays filter -->
              <div class="d-flex align-items-center flex-shrink-0">
                <small>Prevalence over the last</small>
                <input
                  v-model="choroNdays"
                  class="border p-1 mx-2"
                  :style="{
                    'border-color': '#bababa !important',
                    width: '40px',
                  }"
                  placeholder="days"
                  @change="debounceChoroWindowChange()"
                />
                <small>days</small>
                <small>
                  <button
                    class="btn btn-grey px-2 fa-sm ml-2 text-lowercase"
                    @click="updateChoroWindow(true)"
                  >
                    all time
                  </button>
                </small>
              </div>

              <ReportPrevalenceByLocation
                :data="choroData"
                :label="choroLabel"
                :mutationName="reportName"
                :location="selected"
                :locationName="selectedLocation.label"
                class="mt-2"
                :colorScale="choroColorScale"
              />
            </div>
          </div>

          <div v-else class="text-muted my-5">
            Geographic prevalence is not available for counties. Please select
            worldwide, a country, or a division/state.
          </div>
        </section>

        <!-- RESOURCES -->
        <section id="resources">
          <ReportResources
            :mutationName="reportName"
            :searchTerms="searchTerms"
          />
        </section>

        <!-- METHODOLOGY -->
        <section id="methods" class="mt-3 mb-5">
          <h4>Methodology</h4>
          <ReportMethodology :dateUpdated="dateUpdated" :summary="true" />
          <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
          <Warning class="mt-2" :text="disclaimer" />
        </section>

        <!-- CITATION -->
        <GenomicsCitation
          :title="title"
          :mutationAuthors="mutationAuthors"
          :genomicsCitation="genomicsCitation"
          :url="url"
          :today="today"
        />

        <!-- ACKNOWLEDGEMENTS -->
        <ReportAcknowledgements class="border-top pt-3" />
      </div>

      <div
        v-else-if="reportloading"
        class="half-page"
        :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
      >
        <div
          class="mutation-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <h4 class="m-0 mt-n1 text-grey">
            Lineage
            <span class="mx-1">|</span>
            Mutation Tracker
          </h4>
          <h1 class="m-0 font-weight-bold mutation-header">
            {{ title }}
          </h1>
        </div>
        <p class="my-5">
          Calculating prevalences for {{ title }}. Please be patient.
        </p>
      </div>

      <div v-else>
        <div
          class="d-flex flex-column align-items-start text-light mutation-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <h4 class="m-0 mt-n1 text-grey">
            Lineage
            <span class="mx-1">|</span>
            Mutation Tracker
          </h4>
          <h1 class="m-0 font-weight-bold mutation-header">
            {{ title }}
          </h1>
        </div>
        <p class="my-5">
          No data found for
          <b>{{ title }}</b>
          . Please check that you have specified the {{ reportType }} properly.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { max } from 'd3-array';
import { nest } from 'd3-collection';
import { scaleOrdinal, scaleThreshold } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { schemeYlGnBu } from 'd3-scale-chromatic';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { isArray } from 'lodash/lang';

import {
  findLocation,
  findPangolin,
  getReportData,
  updateChoroData,
  updateLocationData,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

const CharacteristicMutations = lazyLoad('CharacteristicMutations');
const ClassedLegend = lazyLoad('ClassedLegend');
const CustomReportForm = lazyLoad('CustomReportForm');
const GenomicsCitation = lazyLoad('GenomicsCitation');
const HorizontalCategoricalLegend = lazyLoad('HorizontalCategoricalLegend');
const LineagesByLocation = lazyLoad('LineagesByLocation');
const MutationsByLineage = lazyLoad('MutationsByLineage');
const ReportAcknowledgements = lazyLoad('ReportAcknowledgements');
const ReportChoropleth = lazyLoad('ReportChoropleth');
const ReportMethodology = lazyLoad('ReportMethodology');
const ReportPrevalence = lazyLoad('ReportPrevalence');
const ReportPrevalenceByLocation = lazyLoad('ReportPrevalenceByLocation');
const ReportPrevalenceOverlay = lazyLoad('ReportPrevalenceOverlay');
const ReportResources = lazyLoad('ReportResources');
const ReportSummary = lazyLoad('ReportSummary');
const ShareReport = lazyLoad('ShareReport');
const SublineageTotals = lazyLoad('SublineageTotals');
const ThresholdSlider = lazyLoad('ThresholdSlider');
const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const Warning = lazyLoad('Warning');

const props = defineProps({
  alias: String,
  loc: [Array, String],
  muts: [Array, String],
  pango: String,
  xmin: String,
  xmax: String,
  overlay: {
    type: [String, Boolean],
    default: 'false',
  },
  selected: {
    type: String,
    default: 'Worldwide',
  },
  embedded: {
    type: Boolean,
    default: false,
  },
  routeTo: {
    type: String,
    default: 'MutationReport',
  },
});

// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');
// global variable - equivalent with this.$filters
const filters = inject('filters');

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const store = adminStore();
const { mutationAuthors, genomicsCitation, reportloading } = storeToRefs(store);

// report details
const today = ref(null);
const url = ref(null);
const lineageName = ref(null);
const mutationName = ref(null);
const reportName = ref(null);
const mutations = ref(null);
const reportType = ref(null);
const locationQueryParams = ref(null);
const title = ref(null);
const lastUpdated = ref(null);
const disclaimer = ref(
  `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${reportType.value} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
);
const width = ref(800);
// Changing locations
const queryLocation = ref(null);
const queryPangolin = ref(null);
const newPangolin = ref(null);
const currentLocs = ref(null); // placeholder for current locations
const loc2Add = ref([]); // array to stores new locations to add
// subscriptions
const dataSubscription = ref(null);
const curatedSubscription = ref(null);
const locationChangeSubscription = ref(null);
const choroSubscription = ref(null);
const hasData = ref(false);
// curated values
const searchTerms = ref(null);
// methods
const choroColorDomain = ref([0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75]);
const choroColorScale = ref(null);
const choroCountThreshold = ref(25);
const choroNdays = ref(60);
const totalThresh = ref(25); // threshold for "unreliable estimate" in the table
// forms
const sublineageOverlay = ref(null);
// data
const selectedLocations = ref(null);
const selectedLocation = ref(null);
const dateUpdated = ref(null);
const reportMetadata = ref(null);
const choroData = ref(null);
const choroMaxCount = ref(null);
const countries = ref(null);
const states = ref(null);
const additionalMutations = ref(null);
const sublineagePrev = ref(null);
const sublineageLongitudinalAll = ref(null);
const sublineageLongitudinal = ref(null);
const sublineageTotalStacked = ref(null);
const lineagesByDay = ref(null);
const sublineageColorScale = ref(null);
const sublineageColorPalette = ref([
  '#4E79A7', // dk blue
  '#f28e2b', // orange
  '#59a14f', // green
  '#e15759', // red
  '#499894', // teal
  '#B6992D', // dk yellow
  '#D37295', // dk pink
  '#B07AA1', // dk purple
  '#9D7660', // brown
  '#aecBe8', // lt blue
  '#FFBE7D', // lt. orange
  '#8CD17D', // lt. green
  '#FF9D9A', // lt. red
  '#86BCB6', // lt. teal
  '#F1CE63', // yellow
  '#FABFD2', // lt. pink,
  '#D4A6C8', // lt. purple
  '#D7B5A6', // lt. brown
  '#bcbd22', // puce
  '#79706E', // grey
]);
const sublineageOptions = ref([]);
const selectedSublineages = ref([]);
const sublineages2Plot = ref(5);
const locationTotals = ref(null);
const totalLineage = ref(null);
const prevalence = ref([]);
const mutationsByLineage = ref([]);
const selectedMutationArr = ref(null);

const smallScreen = computed(() => {
  return window.innerWidth < 500;
});

const definitionLabel = computed(() => {
  return reportType.value === 'lineage'
    ? 'Characteristic mutations in lineage'
    : reportType.value === 'lineage with added mutations'
    ? 'Characteristic mutations in variant'
    : 'List of mutations';
});

const locationLabel = computed(() => {
  if (selectedLocation.value) {
    return selectedLocation.value.label === 'Worldwide'
      ? 'globally'
      : `in ${selectedLocation.value.label}`;
  } else {
    return null;
  }
});

const pangoLink = computed(() => {
  return lineageName.value
    ? `https://cov-lineages.org/lineage.html?lineage=${lineageName.value}`
    : null;
});

const aquariaLink = computed(() => {
  if (additionalMutations.value && additionalMutations.value.length > 0) {
    const aquariaStub = 'https://aquaria.app/SARS-CoV-2/';
    return nest()
      .key((d) => d.gene)
      .rollup((values) => {
        return {
          link:
            values[0].gene.toLowerCase() === 'orf1b'
              ? // convert between ORF1b and ORF1ab: e.g. ORF1b P314L becomes https://aquaria.app/SARS-CoV-2/PP1ab?P4715L
                // in general: gene?mutations, separated by &
                `${aquariaStub}PP1ab?${values
                  .map((d) => calcORF1bLink(d))
                  .join('&')}`
              : `${aquariaStub}${values[0].gene}?${values
                  .map((d) => d.mutation.replace(d.gene, '').replace(':', ''))
                  .join('&')}`,
          count: values.length,
        };
      })
      .entries(additionalMutations.value);
  } else {
    return null;
  }
});

const choroplethLocations = computed(() => {
  return selectedLocations.value
    ? selectedLocations.value.filter((d) => d.admin_level < 2)
    : null;
});

const choroLabel = computed(() => {
  return `Est. ${reportName.value} prevalence ${choroTimeFrame.value}`;
});

const choroTimeFrame = computed(() => {
  return choroNdays.value
    ? `last ${choroNdays.value} days`
    : 'since identification';
});

const setDims = () => {
  const windowWidth = window.innerWidth;
  const widthRatio = windowWidth > 1000 ? 0.7 : 0.9;
  width.value = windowWidth * widthRatio;
};

const setLineageAndMutationStr = () => {
  // Combined report for the WHO lineages; requires lookup of the WHO name using the curated lineages file.
  if (props.alias) {
    lineageName.value = props.alias.includes('*')
      ? props.alias.toUpperCase().replace('OMICRON', 'Omicron')
      : filters.capitalize(props.alias.toLowerCase());
    selectedMutationArr.value = null;
    title.value = `${lineageName.value} Variant Report`;
    reportType.value = 'combined lineage';
    reportName.value = lineageName.value;
  } else {
    if (route.query.pango) {
      if (route.query.muts && route.query.muts.length) {
        // Lineage + Mutation report
        lineageName.value = route.query.pango.toUpperCase();
        selectedMutationArr.value =
          typeof route.query.muts == 'string'
            ? [route.query.muts]
            : route.query.muts;
        mutationName.value =
          typeof route.query.muts == 'string'
            ? route.query.muts
            : route.query.muts.join(', ');
        reportName.value = `${lineageName.value} Lineage with ${mutationName.value}`;
        reportType.value = 'lineage with added mutations';
        searchTerms.value = [
          `${lineageName.value}" AND "${
            typeof route.query.muts == 'string'
              ? route.query.muts.split(':').slice(-1)
              : route.query.muts
                  .map((d) => d.split(':').slice(-1)[0])
                  .join('" AND "')
          }`,
        ];
        title.value = `${reportName.value} Report`;
        const qParam =
          typeof route.query.muts == 'string'
            ? `${lineageName.value}|${route.query.muts}`
            : `${lineageName.value}|${route.query.muts.join(',')}`;
        locationQueryParams.value = {
          variant: [qParam],
        };
      } else {
        // Lineage report
        lineageName.value = route.query.pango.toUpperCase();
        reportName.value = lineageName.value;
        selectedMutationArr.value = null;
        reportType.value = 'lineage';
        title.value = `${reportName.value} Lineage Report`;
        searchTerms.value = [lineageName.value];
        locationQueryParams.value = {
          pango: [lineageName.value],
          selected: lineageName.value,
        };
      }
    } else {
      if (typeof route.query.muts == 'string') {
        // Single mutation report
        lineageName.value = null;
        selectedMutationArr.value = route.query.muts.split(',');
        reportName.value = selectedMutationArr.value.join(', ');
        mutationName.value = reportName.value;
        reportType.value = 'mutation';
        searchTerms.value = [mutationName.value.split(':').slice(-1)];
        locationQueryParams.value = {
          muts: selectedMutationArr.value.join(' AND '),
          selected: selectedMutationArr.value.join(' AND '),
        };
        title.value = `${reportName.value} Mutation Report`;
      } else if (isArray(route.query.muts)) {
        // Variant (multiple mutation) report
        lineageName.value = null;
        reportName.value = route.query.muts.join(', ');
        mutationName.value = reportName.value;
        searchTerms.value = [
          route.query.muts
            .map((d) => d.split(':').slice(-1)[0])
            .join('" AND "'),
        ];
        selectedMutationArr.value = route.query.muts;
        reportType.value =
          route.query.muts.length === 1 ? 'mutation' : 'variant';
        title.value = `${reportName.value} ${filters.capitalize(
          reportType.value,
        )} Report`;
        locationQueryParams.value = {
          muts: selectedMutationArr.value.join(' AND '),
          selected: selectedMutationArr.value.join(' AND '),
        };
      }
    }
  }
};

const setupReport = () => {
  // set default, if needed.
  // if (!this.selected) {
  //   this.selected = 'Worldwide';
  // }

  setLineageAndMutationStr();
  if (lineageName.value || selectedMutationArr.value || props.alias) {
    dataSubscription.value = getReportData(
      genomicsUrl,
      props.alias,
      props.loc,
      selectedMutationArr.value,
      lineageName.value,
      props.selected,
      totalThresh.value,
      choroNdays.value,
    ).subscribe((results) => {
      hasData.value = true;

      // selected locations
      selectedLocations.value = results.locations;
      currentLocs.value = results.locations.filter((d) => d.id !== 'Worldwide');
      const _selected = results.locations.filter((d) => d.isActive);
      selectedLocation.value = _selected.length === 1 ? _selected[0] : null;

      // date updated
      dateUpdated.value = results.dateUpdated.dateUpdated;
      lastUpdated.value = results.dateUpdated.lastUpdated;

      // worldwide stats
      const global = results.locPrev.filter(
        (d) => d.location_id === 'Worldwide',
      );
      totalLineage.value =
        global.length === 1 ? global[0].lineage_count_formatted : null;

      // sublineagePrev
      sublineagePrev.value = results.sublineagePrev;

      // location prevalence
      locationTotals.value = results.locPrev;

      // longitudinal data: prevalence over time
      prevalence.value = results.longitudinal;
      sublineageLongitudinalAll.value = results.longitudinalSublineages;
      // stream graph of lineages by day
      lineagesByDay.value = results.lineagesByDay;
      sublineageTotalStacked.value = results.sublineageTotalStacked;
      setSublineageColorScale();

      // // recent data by country & countries with that lineage.
      countries.value = results.countries;
      states.value = results.states;
      choroData.value = results.choroData;
      choroMaxCount.value = max(choroData.value, (d) => d.cum_total_count);

      // characteristic mutations
      mutations.value = results.mutations;

      // Mutation details for queried mutations -- to add to the characteristic mutation maps for things like Alpha + E484K
      additionalMutations.value = results.mutationDetails;

      // Mutation distribution by lineage
      mutationsByLineage.value = results.mutationsByLineage;

      if (results.md) {
        reportMetadata.value = results.md;
        searchTerms.value =
          reportType.value !== 'lineage with added mutations' &&
          results.md.searchTerms
            ? results.md.searchTerms
            : [searchTerms.value];
        disclaimer.value = results.md.disclaimer
          ? results.md.disclaimer
          : disclaimer.value;
      } else {
        searchTerms.value = [searchTerms.value];
      }
    });
  }
};

const selectSublineage = () => {
  sublineageLongitudinal.value = sublineageLongitudinalAll.value.filter((d) =>
    selectedSublineages.value.includes(d.label),
  );
};

const setSublineageColorScale = () => {
  if (sublineagePrev.value) {
    sublineageOptions.value = sublineagePrev.value
      .filter((d) => d.lineage_count)
      .map((d) => d.mutation_string)
      .slice(0, sublineageColorPalette.value.length);

    // only show the top 5 most prevalent sublineages
    if (!selectedSublineages.value.length) {
      selectedSublineages.value = sublineageOptions.value.slice(
        0,
        sublineages2Plot.value,
      );
    }
    selectSublineage();

    sublineageColorScale.value = scaleOrdinal(sublineageColorPalette.value)
      .domain(sublineageOptions.value)
      .unknown('#bab0ab');
  }
};

const removeLocation = (idx) => {
  currentLocs.value.splice(idx, 1);
};

const addLoc2Add = (selected) => {
  loc2Add.value.push(selected);
};

const updateSelectedLoc = (selected) => {
  selectedLocations.value.push(selected);
  closeLocModal();
  switchLocation(selected);
};

const removeLoc2Add = (idx) => {
  loc2Add.value.splice(idx, 1);
};

const clearNewLocations = () => {
  loc2Add.value = [];
};

// Add new locations
const selectNewLocations = () => {
  let locationIDs = loc2Add.value.map((d) => d.id);
  const newSelected = locationIDs[0];
  // de-duplicate
  locationIDs = uniq(
    currentLocs.value
      .map((d) => d.id)
      .concat(locationIDs)
      .filter((d) => d !== 'Worldwide'),
  );

  // reset the fields.
  loc2Add.value = [];

  if (props.routeTo === 'MutationReport') {
    router.push({
      name: 'MutationReport',
      params: {
        alias: props.alias,
      },
      query: {
        pango: props.pango,
        muts: props.muts,
        selected: newSelected,
        loc: locationIDs,
        overlay: sublineageOverlay.value,
      },
    });
  } else if (props.routeTo === 'GenomicsEmbedVariant') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        alias: props.alias,
        pango: props.pango,
        muts: props.muts,
        selected: newSelected,
        loc: locationIDs,
        overlay: sublineageOverlay.value,
      },
    });
  }
};

// Select a location button on the longitudinal traces or choropleths
const switchLocation = (location) => {
  selectedLocations.value.forEach((d) => {
    d.isActive = false;
  });

  if (!location) {
    selectedLocation.value = 'Worldwide';
  } else {
    location.isActive = true;

    selectedLocation.value = location.id;
  }

  // const countries = selectedLocations.value.filter(d => d.type == "country").map(d => d.name);
  const ids = selectedLocations.value
    .map((d) => d.id)
    .filter((d) => d !== 'Worldwide');

  if (props.routeTo === 'MutationReport') {
    router.push({
      name: 'MutationReport',
      query: {
        pango: props.pango,
        muts: props.muts,
        loc: ids,
        selected: selectedLocation.value,
        overlay: sublineageOverlay.value,
      },
      state: {
        disableScroll: true,
      },
      params: { alias: props.alias },
    });
  } else if (props.routeTo === 'GenomicsEmbedVariant') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        alias: props.alias,
        pango: props.pango,
        muts: props.muts,
        loc: ids,
        selected: selectedLocation.value,
        overlay: sublineageOverlay.value,
      },
      state: {
        disableScroll: true,
      },
    });
  }
};

const updateLocations = () => {
  locationChangeSubscription.value = updateLocationData(
    genomicsUrl,
    props.alias,
    selectedMutationArr.value,
    lineageName.value,
    props.loc,
    props.selected,
    totalThresh.value,
    choroNdays.value,
  ).subscribe((results) => {
    // selected locations
    selectedLocations.value = results.locations;
    currentLocs.value = results.locations.filter((d) => d.id !== 'Worldwide');
    const _selected = results.locations.filter((d) => d.isActive);
    selectedLocation.value = _selected.length === 1 ? _selected[0] : null;

    // longitudinal data: prevalence over time
    prevalence.value = results.longitudinal;
    sublineageLongitudinalAll.value = results.longitudinalSublineages;
    // stream graph of lineages by day
    lineagesByDay.value = results.lineagesByDay;
    sublineageTotalStacked.value = results.sublineageTotalStacked;
    setSublineageColorScale();

    // cumulative totals for table
    locationTotals.value = results.locPrev;

    // recent data by country.
    choroData.value = results.byCountry;

    // sublineage breakdown
    sublineagePrev.value = results.sublineagePrev;
  });
};

const updateChoroWindow = (resetData) => {
  if (resetData) {
    choroNdays.value = null;
  }
  choroSubscription.value = updateChoroData(
    genomicsUrl,
    props.alias,
    selectedMutationArr.value,
    lineageName.value,
    props.selected,
    choroNdays.value,
  ).subscribe((results) => {
    choroData.value = results;
    choroMaxCount.value = max(choroData.value, (d) => d.cum_total_count);
  });
};

const changeSublineageOverlay = (selected) => {
  if (props.routeTo === 'MutationReport') {
    router.push({
      name: 'MutationReport',
      query: {
        pango: props.pango,
        muts: props.muts,
        loc: props.loc,
        selected: props.selected,
        xmin: props.xmin,
        xmax: props.xmax,
        overlay: sublineageOverlay.value,
      },
      state: {
        disableScroll: true,
      },
      params: { alias: props.alias },
    });
  } else if (props.routeTo === 'GenomicsEmbedVariant') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        alias: props.alias,
        pango: props.pango,
        muts: props.muts,
        loc: props.loc,
        selected: props.selected,
        xmin: props.xmin,
        xmax: props.xmax,
        overlay: sublineageOverlay.value,
      },
      state: {
        disableScroll: true,
      },
    });
  }
};

const closeLocModal = () => {
  $('#change-selected-location').modal('hide');
};

const closeModal = () => {
  $('#change-pangolin-modal').modal('hide');
};

const calcORF1bLink = (mutation) => {
  const codonOffset = 4401;
  // convert between ORF1b and ORF1ab: e.g. ORF1b P314L becomes https://aquaria.app/SARS-CoV-2/PP1ab?P4715L
  if (mutation.type === 'substitution') {
    return `${mutation.ref_aa}${mutation.codon_num + codonOffset}${
      mutation.alt_aa
    }`;
  } else if (mutation.type === 'deletion') {
    return `${mutation}`;
  }
};

watch(
  route,
  (newVal, oldVal) => {
    if (
      !isEqual(newVal.query.pango, oldVal.query.pango) ||
      !isEqual(newVal.params.alias, oldVal.params.alias) ||
      !isEqual(newVal.query.alias, oldVal.query.alias) ||
      !isEqual(newVal.query.muts, oldVal.query.muts)
    ) {
      newPangolin.value = null;
      lineageName.value = null;
      reportMetadata.value = null;
      debounceSetupReport();
    } else {
      debounceSetupReport();
    }
  },
  { deep: true },
);

const debounceSetDims = debounce(setDims, 150);
const debounceSelectSublineage = debounce(selectSublineage, 250);
const debounceChoroWindowChange = debounce(updateChoroWindow, 700);
const debounceUpdateLocations = debounce(updateLocations, 500);
const debounceSetupReport = debounce(setupReport, 500);

onMounted(() => {
  sublineageOverlay.value = props.overlay === 'true';
  setDims();
  queryLocation.value = findLocation;
  queryPangolin.value = findPangolin;

  // common color scale for choropleth
  choroColorScale.value = scaleThreshold(
    schemeYlGnBu[choroColorDomain.value.length + 2],
  ).domain(choroColorDomain.value);

  // Get date for the citation object
  const formatDate = timeFormat('%e %B %Y');
  let currentTime = new Date();
  today.value = formatDate(currentTime);

  // set URL for sharing, etc.
  nextTick(() => {
    window.addEventListener('resize', debounceSetDims);

    const location = window.location;
    url.value =
      location.search !== ''
        ? `${location.origin}${location.pathname}${location.search}`
        : `${location.origin}${location.pathname}`;
  });
  setupReport();
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }

  if (choroSubscription.value) {
    choroSubscription.value.unsubscribe();
  }

  if (curatedSubscription.value) {
    curatedSubscription.value.unsubscribe();
  }

  if (locationChangeSubscription.value) {
    locationChangeSubscription.value.unsubscribe();
  }
});
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
