<template>
  <div>
    <div
      class="mb-4 mt-1 half-page text-left"
      :class="[smallScreen ? 'mx-2' : 'mx-5']"
    >
      <!-- LOADING -->
      <div v-if="loading" class="loader">
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
                Select report location
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
              <div class="py-3 border-bottom">
                <div
                  id="select-location"
                  class="d-flex align-items-center justify-content-center my-3"
                >
                  <TypeaheadSelect
                    wrapperClass="w-100"
                    :queryFunction="queryLocation"
                    :apiUrl="$genomicsurl"
                    labelVariable="label"
                    :removeOnSelect="false"
                    placeholder="Select location"
                    totalLabel="total sequences"
                    @selected="updateLocations"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button
                type="button"
                class="btn btn-primary"
                data-dismiss="modal"
                @click="submitNewLocation"
              >
                Create report
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- end change location modal -->

      <!-- CHANGE MUTATIONS MODAL -->
      <div id="change-mutations-modal" class="modal fade">
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header border-secondary">
              <h5 id="exampleModalLabel" class="modal-title">
                Add custom mutations
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
              <!-- <CustomLocationForm :curated="null" :includeLocation="false" :selectedMutations.sync="newMuts" :selectedLineage.sync="newPango" :formCount.sync="formCount" /> -->
              <VariantForm
                :minimalistic="false"
                v-model:selectedLineage="newPango"
                v-model:selectedMutations="newMuts"
                :submitted="submitCount"
              />

              <div v-if="customMutations.length" class="mx-4 border-top pt-3">
                <h6 class="font-weight-bold text-muted">Already selected:</h6>
                <div class="d-flex flex-wrap">
                  <button
                    v-for="(mutation, mIdx) in customMutations"
                    :key="mIdx"
                    role="button"
                    class="btn chip bg-main__darker text-light d-flex align-items-center py-1 px-2 line-height-1"
                    @click="deleteMutation(mIdx)"
                  >
                    {{ mutation.label }}
                    <font-awesome-icon
                      class="ml-1"
                      :icon="['far', 'times-circle']"
                      :style="{ 'font-size': '0.85em', opacity: '0.6' }"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="clearMutations"
              >
                Clear selections
              </button>
              <button
                type="button"
                :disabled="!formValid"
                class="btn btn-main"
                @click="addMutations"
              >
                Add another lineage/mutation
              </button>
              <button
                type="button"
                class="btn btn-accent"
                data-dismiss="modal"
                @click="submitNewMutations"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- end change mutations modal -->

      <div>
        <!-- SOCIAL MEDIA SHARE, BACK BTN -->
        <div v-if="!embedded" class="d-flex align-items-center mb-2 mt-3">
          <router-link :to="{ name: 'LocationReports' }" class="no-underline">
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
            data-target="#change-mutations-modal"
          >
            <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
            add variants
          </button>
          <ShareReport title="title" url="url" />
        </div>

        <!-- REPORT HEADER -->
        <div
          v-if="!embedded"
          class="d-flex flex-column text-light location-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <h4 class="m-0 mt-n1 text-grey">Location Tracker</h4>
          <div
            class="d-flex flex-wrap justify-content-between align-items-center"
          >
            <div class="d-flex flex-column align-items-start">
              <!-- WHO region -->
              <div
                v-if="selectedLocation && selectedLocation.who_region"
                class="mt-2 mb-n1"
              >
                WHO Region: {{ selectedLocation.who_region }}
              </div>

              <!-- name -->
              <div class="d-flex align-items-end">
                <div class="d-flex flex-wrap align-items-center">
                  <h1 class="m-0 font-weight-bold location-header">
                    {{ title }}
                  </h1>
                  <button
                    class="btn py-1 px-2 mx-4 btn-grey flex-shrink-0"
                    data-toggle="modal"
                    data-target="#change-locations-modal"
                  >
                    <font-awesome-icon
                      class="mr-2 font-size-small"
                      :icon="['fas', 'sync']"
                    />
                    change location
                  </button>
                </div>
              </div>

              <!-- last updated info -->
              <div class="d-flex align-items-center">
                <small
                  v-if="lastUpdated"
                  class="text-muted badge bg-grey__lightest mt-1"
                >
                  <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                  Updated {{ lastUpdated }} ago
                </small>
                <div
                  v-if="totalSequences"
                  id="sequence-count"
                  class="text-grey font-size-2 ml-3"
                >
                  with
                  <span class="text-light">{{ totalSequences }} sequences</span>
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

        <!-- simplified header for embedded options -->
        <div
          v-else
          class="d-flex flex-column text-light location-banner py-3"
          :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
        >
          <div class="d-flex align-items-center">
            <h4 class="m-0 mt-n1 text-grey">Location Tracker</h4>
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

          <div
            class="d-flex flex-wrap justify-content-between align-items-center"
          >
            <div class="d-flex flex-column align-items-start">
              <!-- name -->
              <h1 class="m-0 font-weight-bold location-header">
                {{ title }}
              </h1>

              <!-- WHO region -->
              <small
                v-if="selectedLocation && selectedLocation.who_region"
                class="mb-2 mb-n1"
              >
                WHO Region: {{ selectedLocation.who_region }}
              </small>
            </div>
            <div
              class="d-flex flex-column align-items-end justify-content-between flex-shrink-0"
            >
              <!-- last updated info -->
              <div class="d-flex align-items-center">
                <small
                  v-if="lastUpdated"
                  class="text-muted badge bg-grey__lightest mt-1"
                >
                  <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                  Updated {{ lastUpdated }} ago
                </small>
                <div
                  v-if="totalSequences"
                  id="sequence-count"
                  class="text-grey font-size-2 ml-3"
                >
                  with
                  <span class="text-light">{{ totalSequences }} sequences</span>
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

        <!-- MINI-NAV -->
        <div
          class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom"
        >
          <a href="#lineages">
            <button class="btn btn-grey mx-3 py-2">
              <small>Common lineages</small>
            </button>
          </a>

          <a href="#lineages-over-time">
            <button class="btn btn-grey mx-3 py-2">
              <small>Variants over time</small>
            </button>
          </a>

          <a href="#variants-of-concern">
            <button class="btn btn-grey mx-3 py-2">
              <small>Variants of Concern &amp; Interest</small>
            </button>
          </a>

          <a
            v-if="geoData && selectedLocation.admin_level === 0"
            href="#geographic"
          >
            <button class="btn btn-grey mx-3 py-2">
              <small>Geographic breakdown</small>
            </button>
          </a>
        </div>

        <!-- REPORT -->
        <div id="location-report">
          <!-- STREAM GRAPHS -->
          <div v-if="lineageDomain" id="lineages">
            <div
              class="d-flex w-100 justify-content-between align-items-center bg-white p-2 border-bottom mb-2"
            >
              <div class="d-flex flex-wrap flex-column align-items-start">
                <h3 class="m-0">
                  Lineage prevalence
                  <span v-if="selectedLocation">
                    in {{ selectedLocation.label }}
                  </span>
                </h3>
                <Warning
                  class="fa-sm my-2"
                  text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>"
                />
                <small class="text-muted mb-2">
                  Lineages without daily prevalence &gt;
                  {{ otherThreshFormatted }} on at least {{ ndayThresh }} days
                  in the last {{ dayThresh }} are grouped into "Other"
                </small>
                <HorizontalCategoricalLegend
                  :values="lineageDomain"
                  :colorScale="colorScale"
                />
              </div>

              <div class="d-flex flex-column flex-wrap align-items-center">
                <div class="d-flex align-items-center flex-shrink-0">
                  <small>Show data from last</small>
                  <input
                    v-model="recentWindow"
                    class="border p-1 mx-2"
                    :style="{
                      'border-color': '#bababa !important',
                      width: '40px',
                    }"
                    placeholder="days"
                  />
                  <small>days</small>
                </div>

                <!-- Histogram of sequencing counts -->
                <SequencingHistogram
                  v-if="seqCountsWindowed && !noRecentData"
                  :data="seqCountsWindowed"
                  :width="widthHist"
                  :downward="false"
                  :includeXAxis="true"
                  :margin="marginHist"
                  :mutationName="null"
                  className="sequencing-histogram"
                  :title="`Samples sequenced per day over last ${recentWindow} days`"
                  :onlyTotals="true"
                  notDetectedColor="#bab0ab"
                />
              </div>
            </div>

            <div
              class="d-flex flex-wrap justify-content-center align-items-end"
            >
              <section
                v-if="lineagesByDay"
                id="lineages-over-time"
                class="flex-grow-1 flex-shrink-1"
              >
                <LineagesByLocation
                  :data="lineagesByDay"
                  :recentData="mostRecentLineages[0]"
                  :recentWindow="recentWindow"
                  :location="selectedLocation.label"
                  :recentMin="recentMin"
                  :seqCounts="seqCounts"
                  :routeName="routeTo"
                  :colorScale="colorScale"
                  :xmin="xmin"
                  :xmax="xmax"
                />
              </section>

              <!-- STACKED BAR / MOST RECENT -->
              <div v-if="noRecentData" class="align-self-center text-muted">
                <h4>
                  No recent sequences found over the past
                  {{ recentWindow }} days
                </h4>
                <p class="text-muted mb-0">
                  Try adjusting the most recent data window:
                </p>
                <div class="d-flex">
                  <div class="px-3 py-2 my-2 bg-white border-top border-bottom">
                    <small>Show data from last</small>
                    <input
                      v-model="recentWindow"
                      class="border p-1 mx-2"
                      :style="{
                        'border-color': '#bababa !important',
                        width: '40px',
                      }"
                      placeholder="days"
                    />
                    <small>days</small>
                  </div>
                </div>
              </div>

              <div v-else>
                <section
                  v-if="mostRecentLineages"
                  id="most-recent-lineages"
                  :class="{ 'flex-shrink-0': !mediumScreen }"
                >
                  <h5 class="mb-0">Common lineages</h5>
                  <small class="text-muted">
                    Prevalence over last {{ recentWindow }} days
                  </small>
                  <div
                    class="d-flex align-items-start"
                    :class="{ 'flex-wrap': mediumScreen }"
                  >
                    <ReportStackedBarGraph
                      :data="mostRecentLineages"
                      :seqCounts="seqCountsWindowed"
                      :colorScale="colorScale"
                      :locationID="selectedLocation.id"
                      :recentWindow="recentWindow"
                      :routeTo="routeTo"
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>

          <!-- HEATMAP + LEGEND -->
          <div
            v-if="recentHeatmap && recentHeatmap.length"
            id="lineage-comparison"
            class="d-flex flex-column align-items-center mt-3"
          >
            <h5 class="m-0">
              S-gene mutations in &gt; {{ charMutThreshold }} of global
              sequences for lineages found in {{ selectedLocation.label }} in
              the last {{ recentWindow }} days
            </h5>
            <div class="d-flex flex-wrap justify-content-between">
              <small class="text-muted mb-2">
                <router-link
                  :to="{
                    name: 'SituationReportMethodology',
                    hash: '#characteristic',
                  }"
                  target="_blank"
                >
                  Read more about characteristic mutations
                </router-link>
              </small>
              <small class="mb-2 ml-3">
                <router-link
                  :to="{
                    name: 'SituationReportComparison',
                    query: { pango: mostRecentDomain },
                  }"
                >
                  View all genes
                </router-link>
              </small>
            </div>

            <!-- OMICRON INSERTION WARNING -->
            <Warning
              v-if="
                mostRecentDomain &&
                (mostRecentDomain.includes('Omicron') ||
                  mostRecentDomain.includes('omicron') ||
                  mostRecentDomain.includes('B.1.1.529'))
              "
              text="<p>Most Omicron sequences also contain a <b>3 amino acid insertion (EPE) at position 214 in the Spike</b> protein.</p> outbreak.info currently only reports substitution and deletion changes, due to the computational challenges with identifying insertions in 5+ million sequences every day. We’re working towards incorporating insertions into our data processing pipeline, and we encourage you to refer back to the sequence data available on GISAID for more information about these insertions."
              class="fa-sm mt-1 mb-2"
              :align_left="true"
            />

            <div
              class="d-flex flex-column align-items-center"
              :class="{ 'bg-dark': darkMode }"
            >
              <!-- HEATMAP LEGEND -->
              <div
                id="legend"
                class="d-flex justify-content-between align-items-center px-2 py-1 border-bottom"
              >
                <div
                  class="d-flex align-items-center dark-mode-helper my-2"
                  :data-tippy-info="darkModeHelper"
                  style="margin-left: 85px; margin-right: 100px"
                >
                  <input
                    id="checkbox1"
                    v-model.lazy="darkMode"
                    class="checkbox"
                    type="checkbox"
                    @change="routeDark"
                  />
                  <label for="checkbox1" class="checkbox-label">
                    <span class="on">dark mode</span>
                    <span class="off">light mode</span>
                  </label>
                </div>

                <GradientLegend
                  maxValue="100%"
                  :colorScale="heatmapColorScale"
                  :dark="darkMode"
                  label="Mutation prevalence in lineage"
                  class="mr-3"
                />
                <div class="d-flex align-items-center">
                  <svg width="24" height="24">
                    <defs>
                      <pattern
                        id="diagonalHatch"
                        width="5"
                        height="5"
                        patternTransform="rotate(45 0 0)"
                        patternUnits="userSpaceOnUse"
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="10"
                          :style="`stroke:#AAA; stroke-width:0.75`"
                        />
                      </pattern>
                    </defs>
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      fill="url(#diagonalHatch)"
                      rx="4"
                      stroke="#888"
                      stroke-width="0.5"
                    />
                  </svg>
                  <small
                    class="ml-2"
                    :class="[darkMode ? 'text-light' : 'text-muted']"
                  >
                    not detected
                  </small>
                </div>
                <span
                  class="ml-3 mr-2 line-height-1 fa-sm flex-shrink-1 text-center w-75px"
                  style="color: #fb5759"
                >
                  Variant / Mutation of Concern
                </span>
                <span
                  class="mx-2 line-height-1 fa-sm flex-shrink-1 text-center w-75px"
                  style="color: #feb56c"
                >
                  Variant / Mutation of Interest
                </span>
              </div>

              <MutationHeatmap
                :data="recentHeatmap"
                gene="S"
                :locationID="loc"
                :voc="voc"
                :voi="voi"
                :moc="moc"
                :moi="moi"
                :yDomain="mostRecentDomain"
                :dark="darkMode"
                :routeTo="routeTo"
              />
            </div>
            <DownloadReportData
              class="mt-3"
              :data="recentHeatmap"
              figureRef="mutation-heatmap"
              dataType="Mutation Report Heatmap"
            />
          </div>

          <!-- TRACKED LINEAGES PREVALENCE -->
          <section
            v-if="selectedLocation"
            id="lineages-over-time"
            class="my-5"
            py-3
            border-top
          >
            <div
              class="d-flex flex-wrap align-items-center justify-content-center mb-3"
            >
              <h3 class="mr-5">
                Tracked lineages over time
                <span v-if="selectedLocation">
                  in {{ selectedLocation.label }}
                </span>
              </h3>
              <button
                class="btn btn-main-outline d-flex align-items-center flex-shrink-0"
                data-toggle="modal"
                data-target="#change-mutations-modal"
              >
                Change variants
                <font-awesome-icon
                  class="ml-2 font-size-small"
                  :icon="['fas', 'sync']"
                />
              </button>
              <Warning
                class="fa-sm ml-3"
                text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>"
              />
            </div>
            <OverlayLineagePrevalence
              v-if="selectedMutations && selectedMutations.length"
              :routeTo="routeTo"
              :options="selectedMutations"
              :xmin="xmin"
              :xmax="xmax"
              :seqCounts="seqCounts"
              :locationID="loc"
              :locationName="selectedLocation.label"
              :selected="selected"
            />
          </section>

          <!-- GEOGRAPHIC CHOROPLETHS -->
          <section
            v-if="geoData && selectedLocation.admin_level === 0"
            id="geographic"
            class="my-5 py-3 border-top"
          >
            <div
              class="d-flex flex-wrap justify-content-between align-items-center"
            >
              <h3 class="m-0">
                Geographic prevalence of tracked lineages &amp; mutations
              </h3>
              <div class="d-flex align-items-center">
                <button
                  class="btn btn-main-outline d-flex align-items-center my-2 flex-shrink-0"
                  data-toggle="modal"
                  data-target="#change-mutations-modal"
                >
                  Change variants
                  <font-awesome-icon
                    class="ml-2 font-size-small"
                    :icon="['fas', 'sync']"
                  />
                </button>
                <Warning
                  class="fa-sm ml-3"
                  text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>"
                />
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-center">
              <div
                class="d-flex flex-wrap align-items-center border-top border-bottom bg-white pt-1 px-2 mt-1"
              >
                <ClassedLegend
                  :colorScale="choroColorScale"
                  :horizontal="false"
                  :label="`Est. prevalence over the last ${recentWindow} days`"
                  :countThreshold="choroCountThreshold"
                  :mutationName="null"
                />
                <div class="d-flex flex-column">
                  <ThresholdSlider
                    v-model:countThreshold="choroCountThreshold"
                    :maxCount="choroMaxCount"
                    class="mr-3"
                  />
                  <div class="d-flex align-items-center">
                    <small>Show data from last</small>
                    <input
                      v-model="recentWindow"
                      class="border p-1 mx-2"
                      :style="{
                        'border-color': '#bababa !important',
                        width: '40px',
                      }"
                      placeholder="days"
                    />
                    <small>days</small>
                  </div>
                </div>

                <!-- Histogram of sequencing counts -->
                <SequencingHistogram
                  :data="seqCountsWindowed"
                  v-if="seqCountsWindowed && !noRecentData"
                  :width="widthHist"
                  :downward="false"
                  :includeXAxis="true"
                  :margin="marginHist"
                  :mutationName="null"
                  className="sequencing-histogram"
                  :title="`Samples sequenced per day over last ${recentWindow} days`"
                  :onlyTotals="true"
                  notDetectedColor="#bab0ab"
                />
              </div>
            </div>

            <div v-if="geoData" class="d-flex flex-wrap">
              <div
                v-for="(choro, cIdx) in geoData"
                :key="cIdx"
                class="my-3"
                :class="[mediumScreen ? 'w-100' : 'w-33']"
              >
                <div v-if="choro.values.length">
                  <div
                    class="d-flex justify-content-between align-items-center mx-4"
                  >
                    <router-link
                      :to="{
                        name: 'MutationReport',
                        params: choro.params ? choro.params : {},
                        query: { ...choro.route, loc: [loc], selected: loc },
                      }"
                    >
                      <h5>{{ choro.key }}</h5>
                    </router-link>

                    <small
                      v-if="
                        choro.variantType.includes('Variant') ||
                        choro.variantType.includes('Mutation')
                      "
                      :class="{
                        VOC: choro.variantType === 'Variant of Concern',
                        VOI: choro.variantType === 'Variant of Interest',
                        VUM: choro.variantType === 'Variant under Monitoring',
                        MOC: choro.variantType === 'Mutation of Concern',
                        MOI: choro.variantType === 'Mutation of Interest',
                      }"
                    >
                      {{ choro.variantType }}
                    </small>
                  </div>
                  <ReportChoropleth
                    :report="routeTo"
                    :showCopy="false"
                    :smallMultiples="true"
                    :recentWindow="recentWindow"
                    :showLegend="false"
                    :data="choro.values"
                    :countThreshold="choroCountThreshold"
                    :fillMax="1"
                    :location="selectedLocation.label"
                    :colorScale="choroColorScale"
                    :mutationName="choro.key"
                    :widthRatio="1"
                  />
                </div>
              </div>
              <DownloadReportData
                v-if="!noRecentData"
                :data="geoData"
                figureRef="report-choropleth"
                dataType="Variant Report Prevalence over Time"
              />
            </div>

            <!-- no recent geo data -->
            <div v-if="noRecentData" class="align-self-center text-muted">
              <h4>
                No recent sequences found over the past {{ recentWindow }} days
              </h4>
              <p class="text-muted mb-0">
                Try adjusting the most recent data window:
              </p>
              <div class="d-flex">
                <div class="px-3 py-2 my-2 bg-white border-top border-bottom">
                  <small>Show data from last</small>
                  <input
                    v-model="recentWindow"
                    class="border p-1 mx-2"
                    :style="{
                      'border-color': '#bababa !important',
                      width: '40px',
                    }"
                    placeholder="days"
                  />
                  <small>days</small>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- TRACKED LINEAGES TABLE -->
        <section
          v-if="lineageTable"
          id="variants-of-concern"
          class="my-5 py-3 border-top"
        >
          <div
            class="d-flex flex-wrap align-items-center justify-content-center mb-3"
          >
            <h3 class="mr-5">
              Tracked lineages
              <span v-if="selectedLocation">
                in {{ selectedLocation.label }}
              </span>
            </h3>
            <button
              class="btn btn-main-outline d-flex align-items-center flex-shrink-0"
              data-toggle="modal"
              data-target="#change-mutations-modal"
            >
              Change variants
              <font-awesome-icon
                class="ml-2 font-size-small"
                :icon="['fas', 'sync']"
              />
            </button>
            <Warning
              class="fa-sm ml-3"
              text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>"
            />
          </div>
          <LocationTable
            :routeTo="routeTo"
            :data="lineageTable"
            :locationName="selectedLocation.label"
            :locationID="selectedLocation.id"
          />
        </section>

        <!-- METHODOLOGY -->
        <section id="methods" class="mt-3 mb-5 border-top pt-3">
          <h4>Methodology</h4>
          <ReportMethodology :dateUpdated="dateUpdated" :summary="true" />
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
  onUpdated,
  ref,
  watch,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { max } from 'd3-array';
import { format } from 'd3-format';
import { scaleOrdinal, scaleThreshold, scaleSequential } from 'd3-scale';
import { timeDay } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { schemeYlGnBu, interpolateRdPu } from 'd3-scale-chromatic';
import debounce from 'lodash/debounce';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import tippy from 'tippy.js';

import {
  getLocationReportData,
  getSequenceCount,
  getLocationMaps,
  getBasicLocationReportData,
  getLocationTable,
  findLocation,
  getBadMutations,
  findWHOLineage,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/material.css';
import { adminStore } from '@/stores/adminStore';
import { genomicsStore } from '@/stores/genomicsStore';

const ShareReport = lazyLoad('ShareReport');
const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const ReportMethodology = lazyLoad('ReportMethodology');
const Warning = lazyLoad('Warning');
const ReportAcknowledgements = lazyLoad('ReportAcknowledgements');
const ReportChoropleth = lazyLoad('ReportChoropleth');
const LineagesByLocation = lazyLoad('LineagesByLocation');
const ReportStackedBarGraph = lazyLoad('ReportStackedBarGraph');
const HorizontalCategoricalLegend = lazyLoad('HorizontalCategoricalLegend');
const LocationTable = lazyLoad('LocationTable');
const OverlayLineagePrevalence = lazyLoad('OverlayLineagePrevalence');
const VariantForm = lazyLoad('VariantForm');
const ClassedLegend = lazyLoad('ClassedLegend');
const SequencingHistogram = lazyLoad('SequencingHistogram');
const ThresholdSlider = lazyLoad('ThresholdSlider');
const MutationHeatmap = lazyLoad('MutationHeatmap');
const DownloadReportData = lazyLoad('DownloadReportData');
const GradientLegend = lazyLoad('GradientLegend');
const GenomicsCitation = lazyLoad('GenomicsCitation');

const props = defineProps({
  loc: String,
  embedded: Boolean,
  muts: [Array, String],
  pango: [Array, String],
  alias: [Array, String],
  variant: [Array, String],
  xmin: String,
  xmax: String,
  dark: {
    type: [String, Boolean],
    default: false,
  },
  routeTo: {
    type: String,
    default: 'LocationReport',
  },
  selected: {
    type: [Array, String],
    default() {
      return [];
    },
  },
});

// this.$route
const route = useRoute();
// this.$router
const router = useRouter();

// equivalent to this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

const smallScreen = ref(false);
const mediumScreen = ref(false);
const darkMode = ref(null);
const currentTime = ref(null);
const today = ref(null);
const url = ref(null);
const disclaimer = ref(
  `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
);

const basicSubscription = ref(null);
const reportSubscription = ref(null);
const choroSubscription = ref(null);
const tableSubscription = ref(null);
const countSubscription = ref(null);
// methods
const queryLocation = ref(null);
// variables
const recentWindow = ref('60');
const recentMin = ref(null);
const otherThresh = ref(0.03);
const ndayThresh = ref(5);
const dayThresh = ref(60);
const totalThresh = ref(25); // threshold for "unreliable estimate" in the table
// location info
const selectedLocation = ref(null);
const newLocation = ref(null);
// update mutations
const newMuts = ref([]);
const newPango = ref(null);
const customMutations = ref([]);
const submitCount = ref(0);
// data
const moi = ref([]);
const moc = ref([]);
const voi = ref(null);
const voc = ref(null);
const dateUpdated = ref(null);
const lastUpdated = ref(null);
const lineagesByDay = ref(null);
const mostRecentLineages = ref(null);
const noRecentData = ref(false);
const lineageTable = ref(null);
const lineageDomain = ref([]);
const totalSequences = ref(null);
const curatedLineages = ref([]);
const recentHeatmap = ref(null);
const heatmapColorScale = ref(scaleSequential(interpolateRdPu));
const mostRecentDomain = ref(null);
const geoData = ref(null);
const seqCounts = ref(null);
const widthHist = ref(300);
const marginHist = ref({
  left: 55,
  right: 55,
  top: 7,
  bottom: 25,
});
// selections
// scales
// mainly Tableau 20: https://jrnold.github.io/ggthemes/reference/tableau_color_pal.html
const colorScale = ref(null);
const choroColorDomain = ref([0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75]);
const choroColorScale = ref(null);
const choroCountThreshold = ref(25);
const choroMaxCount = ref(null);

const colorPalette = ref([
  '#bab0ab', // grey (other)
  '#4E79A7', // dk blue
  '#aecBe8', // lt blue
  '#f28e2b', // orange
  '#FFBE7D', // lt. orange
  '#59a14f', // green
  '#8CD17D', // lt. green
  '#e15759', // red
  '#FF9D9A', // lt. red
  '#499894', // teal
  '#86BCB6', // lt. teal
  '#B6992D', // dk yellow
  '#F1CE63', // yellow
  '#D37295', // dk pink
  '#FABFD2', // lt. pink,
  '#B07AA1', // dk purple
  '#D4A6C8', // lt. purple
  '#9D7660', // brown
  '#D7B5A6', // lt. brown
  '#bcbd22', // puce
  '#79706E', // grey
  '#79706E',
]);

const store = adminStore();
const { mutationAuthors, genomicsCitation } = storeToRefs(store);
const storeGenomics = genomicsStore();

const loading = computed(() => {
  return (
    storeGenomics.$state.locationLoading1 ||
    storeGenomics.$state.locationLoading2 ||
    storeGenomics.$state.locationLoading3 ||
    storeGenomics.$state.locationLoading4 ||
    storeGenomics.$state.locationLoading5
  );
});

const charMutThreshold = computed(() => {
  return format('.0%')(storeGenomics.$state.characteristicThreshold);
});

const otherThreshFormatted = computed(() => {
  return format('.0%')(otherThresh.value);
});

const title = computed(() => {
  return selectedLocation.value
    ? `${selectedLocation.value.label} Variant Report`
    : null;
});

const seqCountsWindowed = computed(() => {
  return recentMin.value && seqCounts.value
    ? seqCounts.value.filter((d) => d.dateTime >= recentMin.value)
    : null;
});

const formValid = computed(() => {
  return newMuts.value.length > 0 || newPango.value;
});

const darkModeHelper = computed(() => {
  return darkMode.value
    ? 'Switch to <b>light mode</b> to focus on similarities between lineages'
    : 'Switch to <b>dark mode</b> to emphasize mutations with low prevalence';
});
// object to store the temporary additions to the custom mutations form BEFORE submission
// should consist of label + route param (qParam) + type (alias, pango, variant, mutation)

const newVariant = computed(() => {
  let newVariantObj = null;
  if (newPango.value && newMuts.value.length) {
    newVariantObj = {
      label: `${newPango.value.name} + ${newMuts.value
        .map((d) => d.mutation)
        .join(', ')}`,
      qParam: `${newPango.value.name}|${newMuts.value
        .map((d) => d.mutation)
        .join(' AND ')}`,
      type: 'variant',
    };
  } else if (newPango.value) {
    if (newPango.value.alias) {
      newVariantObj = {
        label: newPango.value.name,
        qParam: newPango.value.name,
        type: 'alias',
      };
    } else {
      newVariantObj = {
        label: newPango.value.name,
        qParam: newPango.value.name,
        type: 'pango',
      };
    }
  } else if (newMuts.value.length) {
    newVariantObj = {
      label: newMuts.value.map((d) => d.mutation).join(', '),
      qParam: newMuts.value.map((d) => d.mutation).join(' AND '),
      type: 'mutation',
    };
  }
  return newVariantObj;
});

// parses the route information to track what custom mutations should be queryable.
const selectedMutations = computed(() => {
  let tracked = curatedLineages.value;
  // WHO Aliases
  if (props.alias) {
    const curatedQuery = findWHOLineage(props.alias);
    if (curatedQuery) {
      tracked.push(...curatedQuery);
    }
  }

  if (props.pango) {
    if (typeof props.pango == 'string') {
      tracked.push({
        type: 'pango',
        label: props.pango,
        qParam: props.pango,
        mutation_string: props.pango,
        query: `pangolin_lineage=${props.pango}`,
        variantType: 'Custom Lineages & Mutations',
        route: {
          pango: props.pango,
        },
      });
    } else {
      tracked = tracked.concat(
        props.pango.map((d) => {
          return {
            type: 'pango',
            label: d,
            qParam: d,
            mutation_string: d,
            query: `pangolin_lineage=${d}`,
            variantType: 'Custom Lineages & Mutations',
            route: {
              pango: d,
            },
          };
        }),
      );
    }
  }
  if (props.muts) {
    if (typeof props.muts == 'string') {
      const mutations = props.muts.split(' AND ');
      tracked.push({
        type: 'mutation',
        label: props.muts,
        qParam: props.muts,
        mutation_string: props.muts,
        query: `mutations=${props.muts}`,
        variantType: 'Custom Lineages & Mutations',
        route: {
          muts: mutations,
        },
      });
    } else {
      tracked = tracked.concat(
        props.muts.map((d) => {
          const mutations = d.split(' AND ');
          return {
            type: 'mutation',
            label: mutations.join(', '),
            qParam: d,
            mutation_string: d,
            query: `mutations=${d}`,
            variantType: 'Custom Lineages & Mutations',
            route: {
              muts: d.split(' AND '),
            },
          };
        }),
      );
    }
  }
  if (props.variant) {
    if (typeof props.variant == 'string') {
      const variant = props.variant.split('|');
      if (variant.length === 2) {
        tracked.push({
          type: 'variant',
          label: `${variant[0]} + ${variant[1]}`,
          qParam: props.variant,
          mutation_string: `(${variant[0]}) AND (${variant[1]})`,
          query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
          variantType: 'Custom Lineages & Mutations',
          route: {
            pango: variant[0],
            muts: variant[1],
          },
        });
      }
    } else {
      props.variant.map((d) => {
        const variant = d.split('|');
        if (variant.length === 2) {
          tracked.push({
            type: 'variant',
            label: `${variant[0]} + ${variant[1]}`,
            qParam: d,
            mutation_string: `(${variant[0]}) AND (${variant[1]})`,
            query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
            variantType: 'Custom Lineages & Mutations',
            route: {
              pango: variant[0],
              muts: variant[1],
            },
          });
        }
      });
    }
  }
  tracked = uniqBy(tracked, 'label');
  return tracked;
});

onUpdated(() => {
  tippy('.dark-mode-helper', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'material',
    allowHTML: true,
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });
});

const setDims = () => {
  mediumScreen.value = window.innerWidth < 900;
  smallScreen.value = window.innerWidth < 500;
};

const setupReport = () => {
  basicSubscription.value = getBasicLocationReportData(
    genomicsUrl,
    props.loc,
  ).subscribe((results) => {
    dateUpdated.value = results.dateUpdated.dateUpdated;
    lastUpdated.value = results.dateUpdated.lastUpdated;
    totalSequences.value = results.total;
    curatedLineages.value = results.curated;
    voc.value = results.voc;
    voi.value = results.voi;
    selectedLocation.value = results.location;
  });

  reportSubscription.value = getLocationReportData(
    genomicsUrl,
    props.loc,
    props.muts,
    props.pango,
    otherThresh.value,
    ndayThresh.value,
    dayThresh.value,
    recentWindow.value,
  ).subscribe((results) => {
    lineagesByDay.value = results.lineagesByDay;
    noRecentData.value = !(
      results.mostRecentLineages && results.mostRecentLineages.length
    );

    mostRecentLineages.value = results.mostRecentLineages;
    lineageDomain.value = results.lineageDomain;
    colorScale.value = scaleOrdinal(colorPalette.value).domain(
      lineageDomain.value,
    );
    recentMin.value = timeDay.offset(
      currentTime.value,
      -1 * recentWindow.value,
    );
    recentHeatmap.value = results.heatmap.characteristic.data;
    mostRecentDomain.value = results.heatmap.characteristic.yDomain;
  });

  updateSequenceCount();
};

const updateLocations = (selected) => {
  if (selected) {
    newLocation.value = selected;
  }
};

const submitNewLocation = () => {
  if (props.routeTo === 'GenomicsEmbedLocation') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'loc',
        loc: newLocation.value.id,
        alias: props.alias,
        pango: props.pango,
        variant: props.variant,
        muts: props.muts,
        dark: darkMode.value,
        selected: props.selected,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      query: {
        loc: newLocation.value.id,
        alias: props.alias,
        pango: props.pango,
        variant: props.variant,
        muts: props.muts,
        dark: darkMode.value,
        selected: props.selected,
      },
    });
  }
  newLocation.value = null;
};

const grabCustomMutations = () => {
  let custom = [];
  if (props.pango) {
    const pango =
      typeof props.pango == 'string'
        ? [
            {
              type: 'pango',
              label: props.pango,
              qParam: props.pango,
            },
          ]
        : props.pango.map((d) => ({
            type: 'pango',
            label: d,
            qParam: d,
          }));
    custom = custom.concat(pango);
  }
  if (props.variant) {
    let variant;
    if (typeof props.variant == 'string') {
      const label = props.variant.split('|');
      variant = [
        {
          type: 'variant',
          label: `${label[0]} + ${label[1]}`,
          qParam: props.variant,
        },
      ];
    } else {
      variant = props.variant.map((d) => {
        const label = d.split('|');
        return {
          type: 'variant',
          label: `${label[0]} + ${label[1]}`,
          qParam: d,
        };
      });
    }
    custom = custom.concat(variant);
  }
  if (props.muts) {
    const mutation =
      typeof props.muts == 'string'
        ? [
            {
              type: 'mutation',
              label: props.muts,
              qParam: props.muts,
            },
          ]
        : props.muts.map((d) => ({
            type: 'mutation',
            label: d,
            qParam: d,
          }));
    custom = custom.concat(mutation);
  }
  return custom;
};

const deleteMutation = (idx) => {
  customMutations.value.splice(idx, 1);
};

const addMutations = () => {
  if (newVariant.value) {
    customMutations.value.push(newVariant.value);
  }
  // this.customMutations.push(this.newVariant);
  customMutations.value = uniqBy(customMutations.value, 'qParam');
  submitCount.value += 1;
};

const clearMutations = () => {
  submitCount.value += 1;
  customMutations.value = [];
  props.selected = [];
};

const submitNewMutations = () => {
  if (newVariant.value) {
    customMutations.value.push(newVariant.value);
  }
  let alias = customMutations.value
    .filter((d) => d.type === 'alias')
    .map((d) => d.qParam);
  let pango = customMutations.value
    .filter((d) => d.type === 'pango')
    .map((d) => d.qParam);

  const variant = customMutations.value
    .filter((d) => d.type === 'variant')
    .map((d) => d.qParam);
  const mutation = customMutations.value
    .filter((d) => d.type === 'mutation')
    .map((d) => d.qParam);

  let selected = customMutations.value
    .map((d) => d.label)
    .concat(props.selected);

  if (newVariant.value) {
    if (typeof props.selected == 'string') {
      selected = [props.selected, newVariant.value.label];
    } else {
      selected.push(newVariant.value.label);
    }
  }

  // clear new additions
  submitCount.value += 1;

  if (props.routeTo === 'GenomicsEmbedLocation') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'loc',
        loc: props.loc,
        alias: uniq(alias),
        pango: uniq(pango),
        variant: uniq(variant),
        muts: uniq(mutation),
        dark: darkMode.value,
        selected: uniq(selected),
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      query: {
        loc: props.loc,
        alias: uniq(alias),
        pango: uniq(pango),
        variant: uniq(variant),
        muts: uniq(mutation),
        dark: darkMode.value,
        selected: uniq(selected),
      },
    });
  }
};

const routeDark = () => {
  if (props.routeTo === 'GenomicsEmbedLocation') {
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'loc',
        loc: props.loc,
        alias: props.alias,
        pango: props.pango,
        variant: props.variant,
        muts: props.muts,
        dark: darkMode.value,
        selected: props.selected,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        loc: props.loc,
        alias: props.alias,
        pango: props.pango,
        variant: props.variant,
        muts: props.muts,
        dark: darkMode.value,
        selected: props.selected,
      },
    });
  }
};

const updateWindow = () => {
  dayThresh.value = +recentWindow.value;
  setupReport();
  updateMaps();
};

const updateSequenceCount = () => {
  countSubscription.value = getSequenceCount(
    genomicsUrl,
    props.loc,
    false,
  ).subscribe((results) => {
    seqCounts.value = results;
  });
};

const updateMaps = () => {
  if (selectedLocation.value.admin_level === 0) {
    choroSubscription.value = getLocationMaps(
      genomicsUrl,
      props.loc,
      selectedMutations.value,
      recentWindow.value,
    ).subscribe((results) => {
      geoData.value = results;

      choroMaxCount.value = max(
        results.flatMap((d) => d.values),
        (d) => d.cum_total_count,
      );
    });
  }
};

const updateTable = () => {
  tableSubscription.value = getLocationTable(
    genomicsUrl,
    props.loc,
    selectedMutations.value,
    totalThresh.value,
  ).subscribe((results) => {
    lineageTable.value = results;
  });
};

// created hook in previous version
const debounceWindowChange = debounce(updateWindow, 700);
const debounceSetupReport = debounce(setupReport, 500);

watch(
  route,
  (newVal, oldVal) => {
    if (newVal.query.loc !== oldVal.query.loc) {
      newLocation.value = null;
      debounceSetupReport();
      customMutations.value = grabCustomMutations();
    } else {
      debounceSetupReport();
    }
  },
  { deep: true },
);

watch(recentWindow, () => {
  if (recentWindow.value) {
    debounceWindowChange();
  }
});

watch(
  selectedMutations,
  () => {
    customMutations.value = grabCustomMutations();
    updateMaps();
    updateTable();
  },
  { deep: true },
);

onMounted(() => {
  darkMode.value =
    props.dark === 'true' || (!!props.dark && props.dark !== 'false');

  const ofInterest = getBadMutations(true);
  moc.value = ofInterest.moc;
  moi.value = ofInterest.moi;

  queryLocation.value = findLocation;
  choroColorScale.value = scaleThreshold(
    schemeYlGnBu[choroColorDomain.value.length + 2],
  ).domain(choroColorDomain.value);

  customMutations.value = grabCustomMutations();

  const formatDate = timeFormat('%e %B %Y');
  currentTime.value = new Date();
  today.value = formatDate(currentTime.value);

  // this.$nextTick in optionsAPI
  nextTick(() => {
    // resize listener
    window.addEventListener('resize', setDims);
    setDims();

    // set URL for sharing, etc.
    const location = window.location;
    url.value =
      location.search !== ''
        ? `${location.origin}${location.pathname}${location.search}`
        : `${location.origin}${location.pathname}`;
  });

  // intial setup
  setDims();

  setupReport();
});

onUnmounted(() => {
  if (basicSubscription.value) {
    basicSubscription.value.unsubscribe();
  }

  if (reportSubscription.value) {
    reportSubscription.value.unsubscribe();
  }

  if (choroSubscription.value) {
    choroSubscription.value.unsubscribe();
  }

  if (tableSubscription.value) {
    tableSubscription.value.unsubscribe();
  }

  if (countSubscription.value) {
    countSubscription.value.unsubscribe();
  }
});
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
