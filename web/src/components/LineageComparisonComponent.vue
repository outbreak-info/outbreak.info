<template>
  <div>
    <div class="my-2 mx-4 half-page text-left">
      <!-- LOADING -->
      <div v-if="loading" class="loader">
        <font-awesome-icon
          class="fa-pulse fa-4x text-highlight"
          :icon="['fas', 'spinner']"
        />
      </div>

      <p class="snackbar snackbar-accent" :class="{ show: showSnackbar }">
        {{ snackbarText }}
      </p>

      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div v-if="!embedded" class="d-flex align-items-center">
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div
        v-if="!embedded"
        class="d-flex flex-column text-light comparison-banner py-3"
        :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
      >
        <h3 class="m-0 mt-n1 text-grey">
          SARS-CoV-2 (hCoV-19) Mutation Reports
        </h3>
        <div
          class="d-flex flex-wrap justify-content-between align-items-center"
        >
          <div class="d-flex flex-column align-items-start">
            <div class="d-flex align-items-end">
              <div class="d-flex flex-wrap align-items-center">
                <h1 class="m-0 font-weight-bold comparison-header">
                  Lineage Comparison
                </h1>
                <button
                  class="btn py-1 px-2 mx-4 my-1 btn-grey flex-shrink-0"
                  data-toggle="collapse"
                  data-target="#select-lineages"
                >
                  <font-awesome-icon
                    class="m-0 mr-2 font-size-small"
                    :icon="['fas', 'sync']"
                  />
                  change lineages
                </button>
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
              <div v-if="totalSequences" class="text-grey font-size-2 ml-5">
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
              <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
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

      <!-- Simplified embedded version -->
      <div
        v-else
        class="d-flex flex-column text-light comparison-banner py-3"
        :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']"
      >
        <div
          class="d-flex flex-wrap justify-content-between align-items-center"
        >
          <div class="d-flex flex-column align-items-start">
            <div class="d-flex align-items-center">
              <h1 class="m-0 font-weight-bold comparison-header">
                Lineage Comparison
              </h1>
              <a
                href="https://outbreak.info"
                class="ml-3 navbar-brand no-underline text-light"
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
              <div v-if="totalSequences" class="text-grey font-size-2 ml-3">
                with
                <span class="text-light">{{ totalSequences }} sequences</span>
                from GISAID
              </div>
            </div>

            <div class="d-flex align-items-center bright-hyperlink my-1">
              <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
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

      <!-- <div class="d-flex flex-wrap align-items-center">
      <h1 class="mr-3">Lineage comparison</h1>
      <div class="d-flex flex-wrap">
        <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(lineage, lIdx) in selectedPango" :key="lIdx" @click="deletePango(lIdx)">
          <span>{{lineage}}</span>
          <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
        </button>
      </div>
    </div> -->

      <div class="my-3 p-2 bg-white border-top border-bottom">
        <template>
          <div class="d-flex justify-content-between mt-1 mb-2">
            <div class="d-flex">
              <h4>Selected lineages</h4>
              <button
                role="button"
                class="btn btn-accent d-flex align-items-center py-2 px-2 mx-3 line-height-1"
                @click="submitNewData()"
                data-toggle="collapse"
                data-target="#select-lineages"
              >
                create report
              </button>
            </div>
            <!-- CHANGE LINEAGES -->
            <button
              class="btn py-1 px-2 ml-5 my-2 btn-sec flex-shrink-0"
              data-toggle="collapse"
              data-target="#select-lineages"
              @click="scrollToTop"
            >
              <font-awesome-icon
                class="m-0 mr-2 fa-xs"
                :icon="['fas', 'sync']"
              />
              <span class="fa-xs">change lineages</span>
            </button>
          </div>
          <div class="d-flex flex-wrap align-items-center">
            <button
              v-for="(lineage, lIdx) in selectedPango"
              :key="lIdx"
              role="button"
              class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1"
              @click="deletePango(lIdx)"
            >
              <span>{{ lineage }}</span>
              <font-awesome-icon
                class="ml-1"
                :icon="['far', 'times-circle']"
                :style="{ 'font-size': '0.85em', opacity: '0.6' }"
              />
            </button>

            <button
              role="button"
              class="btn chip btn-main d-flex align-items-center py-1 px-2 mx-3 line-height-1"
              @click="clearPango()"
              v-if="selectedPango.length"
            >
              clear lineages
            </button>
            <p v-else class="text-muted">
              <i>none selected</i>
            </p>
          </div>
        </template>

        <div
          class="border-top pt-3 my-3 mb-1 collapse show"
          id="select-lineages"
        >
          <h4 class="mb-3">Add lineages</h4>
          <div class="d-flex flex-wrap justify-content-between">
            <div
              class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3"
            >
              <h6 class="d-flex align-items-center">
                <div class="mr-2 circle">1</div>
                <span class="mr-1">Variants of Concern</span>
              </h6>
              <div class="line-height-1" style="width: 200px">
                <div class="fa-sm mb-2 ml-2">
                  &gt;&gt; Click to add specific VOCs
                </div>
              </div>
              <div class="d-flex flex-column">
                Current Variants of Concern
                <div class="d-flex flex-wrap align-items-center">
                  <button
                    class="ml-2 mt-2 px-2 py-2 btn btn-outline-secondary fa-sm"
                    v-for="(lineage, vIdx) in curated"
                    :key="vIdx"
                    @click="addVOC(lineage)"
                  >
                    {{ lineage }}
                  </button>
                </div>
              </div>

              <div class="d-flex flex-column mt-3">
                Previously Circulating Variants of Concern
                <div class="d-flex flex-wrap align-items-center">
                  <button
                    class="ml-2 mt-2 px-2 py-2 btn btn-outline-secondary fa-sm"
                    v-for="(lineage, pIdx) in previous_voc"
                    :key="pIdx"
                    @click="addVOC(lineage)"
                  >
                    {{ lineage }}
                  </button>
                </div>
              </div>
            </div>

            <div
              class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3"
            >
              <h6 class="d-flex align-items-center">
                <div class="mr-2 circle">2</div>
                <span class="mr-1" />
                <a
                  href="https://cov-lineages.org/lineage_list.html"
                  target="_blank"
                >
                  WHO VOC/VOI sublineages
                </a>
              </h6>
              <div class="line-height-1" style="width: 200px">
                <div class="fa-sm mt-2 ml-2">
                  &gt;&gt; Add all lineages associated with a WHO VOC / VOI
                </div>
              </div>

              <div
                class="d-flex flex-wrap align-items-center mt-3 justify-content-center"
              >
                <select v-model="selectedWHO" @change="addVOC(selectedWHO)">
                  <option
                    v-for="(who, wIdx) in whoLineages"
                    :key="wIdx"
                    class="ml-2 px-2 py-1 btn btn-sec fa-sm text-no-transform"
                  >
                    {{ who }}
                  </option>
                </select>
              </div>
            </div>

            <div
              class="d-flex flex-column mr-5 bg-grey__lightest p-2 rounded mb-3"
            >
              <h6 class="d-flex align-items-center">
                <div class="mr-2 circle">3</div>
                <span class="mr-1">By</span>
                <a
                  href="https://cov-lineages.org/lineage_list.html"
                  target="_blank"
                >
                  PANGO lineage
                </a>
              </h6>
              <div class="line-height-1" style="width: 200px">
                <div class="fa-sm mt-2 ml-2">
                  &gt;&gt; Add a specific lineage
                </div>
              </div>
              <div class="d-flex h-100 align-items-center">
                <div style="width: 170px" class="align-self-middle">
                  <TypeaheadSelect
                    :queryFunction="queryPangolin"
                    :apiUrl="$genomicsurl"
                    :removeOnSelect="true"
                    placeholder="Add lineage"
                    @selected="addPango"
                  />
                </div>
              </div>
            </div>

            <div class="mr-5 mb-3 bg-grey__lightest p-2 rounded mb-3">
              <h6 class="d-flex align-items-center p-0 m-0">
                <div class="mr-2 circle">4</div>
                Containing a mutation(s)
              </h6>

              <div class="d-flex flex-column">
                <div class="d-flex flex-column">
                  <label
                    for="add-mutation"
                    class="fa-sm mt-2 ml-2"
                    style="width: 300px"
                  >
                    &gt;&gt; Find lineages with mutation(s)
                    <span v-if="selectedMutationQuery">
                      {{ selectedMutationQuery }}
                    </span>
                    at &ge; {{ selectedMutationThreshold }}% prevalence
                  </label>
                  <div class="d-flex align-items-center">
                    <textarea
                      id="add-mutation"
                      v-model="selectedMutationQuery"
                      class="form-control border"
                      style="width: 200px"
                      placeholder="S:E484K, ORF1a:DEL3675/3677"
                    />

                    <span class="ml-2 mr-3">@ &ge;</span>
                    <div class="d-flex flex-column">
                      <small class="text-muted">min. prevalence</small>
                      <span
                        class="percent-sign border border-radius-1 bg-white py-1"
                      >
                        <input
                          v-model="selectedMutationThreshold"
                          type="number"
                          min="0"
                          max="100"
                          class="flex-grow-0 px-2"
                          style="width: 60px"
                          placeholder="0-100"
                        />
                        <span class="mr-1">%</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="selectedMutationQuery && !mutationValid"
                  id="warnings"
                  style="width: 400px"
                >
                  <div class="warning">Please check the mutation format:</div>
                  <ul class="warning">
                    <li>
                      Add the gene before the mutation, like
                      <b>"S:N501Y"</b>
                    </li>
                    <li>
                      Substitutions should be "{gene}:{original amino
                      acid}{codon number}{new amino acid}" like
                      <b>"S:E484K"</b>
                    </li>
                    <li>
                      Deletions should be "{gene}:DEL{start codon}/{end codon}"
                      like
                      <b>"ORF1a:DEL3675/3677"</b>
                    </li>
                    <li>
                      Separate mutations with commas like
                      <b>"S:E484K,S:N501Y"</b>
                    </li>
                  </ul>
                </div>

                <!-- select btns -->
                <small>
                  <div
                    v-if="selectedMutationQuery"
                    class="d-flex align-items-center justify-content-between my-3"
                    style="width: 250px"
                  >
                    <button
                      class="ml-2 px-2 py-1 btn btn-sec fa-sm"
                      :disabled="!mutationValid"
                      @click="addMutations()"
                    >
                      <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />
                      Lookup {{ selectedMutationQuery }}-containing lineages
                    </button>
                  </div>
                </small>
              </div>
            </div>

            <div class="mr-5 mb-3 bg-grey__lightest p-2 rounded mb-3">
              <h6 class="d-flex align-items-center p-0 m-0">
                <div class="mr-2 circle">5</div>
                Prevalent in a location
              </h6>
              <div class="d-flex">
                <div class="d-flex flex-column" style="width: 250px">
                  <label
                    for="add-mutation"
                    class="fa-sm line-height-1 mt-2 ml-2"
                  >
                    &gt;&gt; Find lineages with &gt;
                    {{ selectedOtherThreshold }}% total prevalence in the last
                    {{ selectedWindow }} days
                    <span v-if="selectedLocation">
                      in {{ selectedLocation.label }}
                    </span>
                  </label>
                  <TypeaheadSelect
                    :queryFunction="queryLocation"
                    :selectedValue="selectedLocation"
                    :apiUrl="$genomicsurl"
                    labelVariable="label"
                    :removeOnSelect="false"
                    placeholder="Select location"
                    totalLabel="total sequences"
                    @selected="updateLocation"
                  />
                </div>
                <div class="d-flex flex-column ml-3">
                  <div class="d-flex flex-column">
                    <small class="text-muted">min. prevalence</small>
                    <span
                      class="percent-sign border border-radius-1 bg-white py-1"
                    >
                      <input
                        v-model="selectedOtherThreshold"
                        type="number"
                        min="0"
                        max="100"
                        class="flex-grow-0 px-2"
                        style="width: 60px"
                        placeholder="0-100"
                      />
                      <span class="mr-1">%</span>
                    </span>
                  </div>
                  <div class="d-flex flex-column">
                    <small class="text-muted">over the last</small>
                    <span
                      class="percent-sign border border-radius-1 bg-white py-1"
                    >
                      <input
                        v-model="selectedWindow"
                        type="number"
                        min="0"
                        max="1000"
                        class="flex-grow-0 px-2"
                        style="width: 60px"
                        placeholder="num. days"
                      />
                      <span class="mr-1">days</span>
                    </span>
                  </div>
                </div>
              </div>

              <small>
                <div
                  v-if="locationValid"
                  class="d-flex align-items-center justify-content-between my-3"
                  style="width: 400px"
                >
                  <button
                    class="ml-2 px-2 py-1 btn btn-sec fa-sm"
                    @click="addLocationLineages()"
                  >
                    <font-awesome-icon class="mr-2" :icon="['fas', 'plus']" />
                    Lookup lineages in {{ selectedLocation.label }}
                  </button>
                </div>

                <div
                  v-else-if="selectedLocation"
                  class="warning"
                  style="width: 400px"
                >
                  <p
                    v-if="
                      !selectedOtherThreshold || !(selectedOtherThreshold >= 0)
                    "
                    class="warning"
                  >
                    Specify a minimum prevalence (
                    <b>3%</b>
                    by default)
                  </p>
                  <p v-if="!(selectedWindow > 0)" class="warning">
                    Specify a time window (over the last
                    <b>60</b>
                    days by default)
                  </p>
                </div>
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- LOOP OVER MUTATION HEATMAPS -->
      <div id="mutation-heatmaps" class="mt-1" v-if="filteredMutationHeatmap">
        <!-- ADJUST PARAMS -->
        <div
          class="d-flex w-100 flex-column bg-white border-top border-bottom py-1 mb-3"
          :class="{ 'flex-wrap': smallScreen }"
        >
          <div
            class="d-flex flex-wrap justify-content-between align-items-center"
            :class="{ 'flex-wrap': smallScreen }"
          >
            <div
              class="dark-mode-helper"
              :data-tippy-info="darkModeHelper"
              style="margin-left: 90px"
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

            <!-- CHECKBOX TO SELECT GENES -->
            <div
              id="select-genes"
              class="d-flex align-items-center justify-content-between ml-3"
            >
              <small class="text-muted text-right mx-2 line-height-1">
                include genes:
              </small>
              <div class="d-flex flex-wrap">
                <label
                  v-for="(gene, idx) in geneOpts"
                  :key="idx"
                  class="b-contain pr-3"
                >
                  <span>{{ gene }}</span>
                  <input
                    :id="gene"
                    v-model.lazy="selectedGenes"
                    type="checkbox"
                    :value="gene"
                    @change="debounceGenes"
                  />
                  <div class="b-input" />
                </label>
              </div>
            </div>

            <div class="d-flex" style="margin-right: 90px">
              <!-- MIN MUTATION % -->
              <div class="d-flex flex-column ml-3">
                <small class="text-muted line-height-1" style="width: 100px">
                  Min. mutation prevalence
                </small>
                <div class="mt-2">
                  <span
                    class="percent-sign border border-radius-1 bg-white py-1"
                  >
                    <input
                      v-model="prevalenceThreshold"
                      type="number"
                      min="0"
                      max="100"
                      class="flex-grow-0 px-2"
                      style="width: 42px"
                    />
                    <span class="mr-1">%</span>
                  </span>
                </div>
              </div>

              <!-- MIN LINEAGE COUNT -->
              <div class="d-flex flex-column ml-3">
                <small class="text-muted line-height-1" style="width: 100px">
                  Min. sequences per lineage
                </small>
                <div class="mt-2">
                  <input
                    v-model="countThreshold"
                    type="number"
                    min="1"
                    class="flex-grow-0 px-2 border border-radius-1"
                    style="width: 85px"
                  />
                </div>
              </div>

              <!-- CHANGE LINEAGES -->
              <button
                class="btn py-1 px-2 ml-5 my-2 btn-sec flex-shrink-0"
                data-toggle="collapse"
                data-target="#select-lineages"
                @click="scrollToTop"
              >
                <font-awesome-icon
                  class="m-0 mr-2 fa-xs"
                  :icon="['fas', 'sync']"
                />
                <span class="fa-xs">change lineages</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TITLE -->
        <div class="d-flex flex-wrap justify-content-between">
          <div
            class="d-flex align-items-center"
            :class="{ 'flex-wrap': mediumScreen }"
          >
            <div class="d-flex flex-column">
              <div class="d-flex align-items-center">
                <h2 class="m-0">Mutation prevalence across lineages</h2>
              </div>
              <div class="d-flex flex-wrap">
                <p class="text-muted line-height-1 m-0 my-1">
                  Mutations with > {{ prevalenceThreshold }}% prevalence in at
                  least one lineage.
                </p>
                <p
                  v-if="countThreshold > 1"
                  class="text-muted font-weight-bold line-height-1 m-0 my-1 ml-2"
                >
                  Lineages with fewer than
                  {{ countThreshold.toLocaleString() }} sequences have been
                  removed.
                </p>
              </div>
            </div>
          </div>

          <!-- LEGEND -->
          <div
            id="legend"
            class="d-flex px-2 py-1 my-2"
            :class="{ 'bg-dark': darkMode }"
          >
            <GradientLegend
              maxValue="100%"
              :colorScale="colorScale"
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
            <div class="d-flex justify-content-center align-items-center ml-3">
              <span
                class="mr-3 line-height-1 fa-sm flex-shrink-1 text-center w-75px"
                style="color: #fb5759"
              >
                Variant / Mutation of Concern
              </span>
              <span
                class="line-height-1 fa-sm flex-shrink-1 text-center w-75px"
                style="color: #feb56c"
              >
                Variant / Mutation of Interest
              </span>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap">
          <div
            v-for="(geneData, gIdx) in filteredMutationHeatmap"
            :key="gIdx"
            class="mr-4 mb-2"
            :class="{
              'horiz-scroll': largeScreen && checkPango,
            }"
          >
            <template v-if="selectedGenes.includes(geneData.key)">
              <h4 class="m-0 text-dark">
                {{ geneData.key }}
              </h4>

              <!-- OMICRON INSERTION WARNING -->
              <Warning
                v-if="checkPango"
                text="<p>Most Omicron sequences also contain a <b>3 amino acid insertion (EPE) at position 214 in the Spike</b> protein.</p> outbreak.info currently only reports substitution and deletion changes, due to the computational challenges with identifying insertions in 5+ million sequences every day. We’re working towards incorporating insertions into our data processing pipeline, and we encourage you to refer back to the sequence data available on GISAID for more information about these insertions."
                class="fa-sm mt-1 mb-2"
                :align_left="true"
              />

              <MutationHeatmap
                :data="geneData.values"
                :yDomain="selectedPango"
                :gene="geneData.key"
                :voc="voc"
                :voi="voi"
                :moc="moc"
                :moi="moi"
                :dark="darkMode"
                :routeTo="routeTo"
              />
            </template>
          </div>
        </div>
        <DownloadReportData
          class="mt-3"
          :data="downloadableHeatmap"
          figureRef="mutation-heatmap"
          dataType="Mutation Report Heatmap"
          :darkMode="darkMode"
        />
      </div>
    </div>
    <div class="mx-5 text-left">
      <!-- METHODOLOGY -->
      <section id="methods" class="mt-3 mb-5 border-top pt-3">
        <h4>Methodology</h4>
        <ReportMethodology :dateUpdated="lastUpdated" :summary="true" />
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
</template>

<script>
import { mapState } from 'vuex';
import { scaleSequential } from 'd3-scale';
import { interpolateRdPu } from 'd3-scale-chromatic';
import { timeFormat } from 'd3-time-format';
import debounce from 'lodash/debounce';
import uniq from 'lodash/uniq';
import tippy from 'tippy.js';

import {
  findPangolin,
  findLocation,
  getBasicComparisonReportData,
  getLineagesComparison,
  getComparisonByMutations,
  getComparisonByLocation,
  getBadMutations,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';
import CURATED from '@/assets/genomics/curated_lineages.json';

import 'tippy.js/themes/light.css';

export default {
  name: 'LineageComparisonComponent',
  components: {
    TypeaheadSelect: lazyLoad('TypeaheadSelect'),
    ReportMethodology: lazyLoad('ReportMethodology'),
    Warning: lazyLoad('Warning'),
    ReportAcknowledgements: lazyLoad('ReportAcknowledgements'),
    ShareReport: lazyLoad('ShareReport'),
    MutationHeatmap: lazyLoad('MutationHeatmap'),
    GradientLegend: lazyLoad('GradientLegend'),
    DownloadReportData: lazyLoad('DownloadReportData'),
    GenomicsCitation: lazyLoad('GenomicsCitation'),
  },
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
    routeTo: {
      type: String,
      default: 'SituationReportComparison',
    },
    pango: [Array, String],
    threshold: {
      type: [Number, String],
      default: 75,
    },
    nthresh: {
      type: [Number, String],
      default: 1,
    },
    dark: {
      type: [String, Boolean],
      default: false,
    },
    gene: {
      type: [Array, String],
      default: () => ['ORF1a', 'ORF1b', 'S'],
    },
  },
  data() {
    return {
      today: null,
      url: null,
      darkMode: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      title: 'Lineage Comparison',
      queryPangolin: null,
      mutationHeatmap: null,
      filteredMutationHeatmap: null,
      downloadableHeatmap: null,
      selectedGenes: [],
      selectedPango: [],
      selectedMutationQuery: null,
      selectedMutationThreshold: 50,
      colorScale: null,
      prevalenceThreshold: null,
      heatmapSubscription: null,
      basicSubscription: null,
      lineageByMutationsSubscription: null,
      lineageByLocationSubscription: null,
      totalSequences: null,
      lastUpdated: null,
      showSnackbar: false,
      snackbarText: null,
      selectedLocation: null,
      selectedOtherThreshold: 3,
      selectedNdayThreshold: 5,
      // selectedNdays: 60,
      selectedWindow: 60,
      queryLocation: null,
      previous_voc: null, // list of previously designated VOCs
      curated: null, // list of currently designated VOCs -- curated lineages listed on our reports
      voc: [], // full list of all VOCs, former and current, including sublineages also designated as VOCss
      voi: [], // VOIs. as of 2022, not really used...
      moi: null,
      moc: null,
      countThreshold: null,
      selectedWHO: null,
      whoLineages: [],
      geneOpts: [
        'ORF1a',
        'ORF1b',
        'S',
        'ORF3a',
        'E',
        'M',
        'ORF6',
        'ORF7a',
        'ORF7b',
        'ORF8',
        'N',
        'ORF10',
      ],
      smallScreen: false,
      mediumScreen: false,
      largeScreen: false,
    };
  },
  computed: {
    ...mapState('admin', ['mutationAuthors', 'genomicsCitation']),
    ...mapState('genomics', ['locationLoading1', 'locationLoading2']),
    loading() {
      return this.locationLoading1 || this.locationLoading2;
    },
    locationValid() {
      return !!(
        this.selectedLocation &&
        this.selectedOtherThreshold &&
        this.selectedOtherThreshold >= 0 &&
        this.selectedWindow > 0
      );
    },
    mutationValid() {
      return (
        /\w+:[A-z]\d+[A-z]/.test(this.selectedMutationQuery) ||
        /\w+:DEL\d+/.test(this.selectedMutationQuery.toUpperCase())
      );
    },
    darkModeHelper() {
      return this.darkMode
        ? 'Switch to <b>light mode</b> to focus on similarities between lineages'
        : 'Switch to <b>dark mode</b> to emphasize mutations with low prevalence';
    },
    checkPango() {
      const pangos = CURATED.filter((d) => d.who_name === 'Omicron');
      if (this.selectedPango && this.selectedPango.length > 0) {
        return pangos[0].pango_descendants.some((item) =>
          this.selectedPango.includes(item),
        );
      } else {
        return false;
      }
    },
  },
  watch: {
    countThreshold(newVal, oldVal) {
      if (oldVal && newVal !== oldVal) {
        this.debounceCountThreshold();
      }
    },
    prevalenceThreshold(newVal, oldVal) {
      if (oldVal && newVal !== oldVal) {
        this.debounceThreshold();
      }
    },
  },
  mounted() {
    const formatDate = timeFormat('%e %B %Y');
    this.currentTime = new Date();
    this.today = formatDate(this.currentTime);

    this.darkMode =
      this.dark === 'true' || (!!this.dark && this.dark !== 'false');

    this.prevalenceThreshold = +this.threshold;
    this.countThreshold = +this.nthresh;

    this.colorScale = scaleSequential(interpolateRdPu);
    this.selectedGenes =
      typeof this.gene === 'string' ? [this.gene] : this.gene;

    if (this.pango) {
      this.selectedPango =
        typeof this.pango === 'string' ? [this.pango] : this.pango;
    }

    this.$nextTick(() => {
      // set URL for sharing, etc.
      window.addEventListener('resize', this.setDims);
      this.setDims();
      const location = window.location;
      this.url =
        location.search !== ''
          ? `${location.origin}${location.pathname}${location.search}`
          : `${location.origin}${location.pathname}`;

      tippy('.dark-mode-helper', {
        content: 'Loading...',
        maxWidth: '200px',
        placement: 'right',
        animation: 'fade',
        theme: 'light',
        allowHTML: true,
        onShow(instance) {
          let info = instance.reference.dataset.tippyInfo;
          instance.setContent(info);
        },
      });
    });

    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;

    this.basicSubscription = getBasicComparisonReportData(
      this.$genomicsurl,
    ).subscribe((results) => {
      this.totalSequences = results.total;
      this.lastUpdated = results.dateUpdated.lastUpdated;
      this.whoLineages = results.who;
      this.voc = results.voc;
      this.curated = results.current_voc;
      this.previous_voc = results.previous_voc;
    });

    // only load data if lineages have been selected
    if (this.selectedPango.length) {
      this.getData();
    }
  },
  created() {
    this.debounceThreshold = debounce(this.changeThreshold, 250);
    this.debounceCountThreshold = debounce(this.changeCountThreshold, 250);
    this.debounceGenes = debounce(this.updateGenes, 250);
  },
  destroyed() {
    if (this.basicSubscription) {
      this.basicSubscription.unsubscribe();
    }
    if (this.heatmapSubscription) {
      this.heatmapSubscription.unsubscribe();
    }
    if (this.lineageByMutationsSubscription) {
      this.lineageByMutationsSubscription.unsubscribe();
    }
    if (this.lineageByLocationSubscription) {
      this.lineageByLocationSubscription.unsubscribe();
    }
  },
  methods: {
    setDims() {
      this.mediumScreen = window.innerWidth < 1000;
      this.smallScreen = window.innerWidth < 500;
      this.largeScreen = window.innerWidth < 1920;
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    updateGenes() {
      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            type: 'comp',
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      }
      this.getData();
    },
    changeThreshold() {
      if (this.prevalenceThreshold) {
        if (this.routeTo === 'GenomicsEmbed') {
          this.$router.push({
            name: this.routeTo,
            params: {
              disableScroll: true,
            },
            query: {
              type: 'comp',
              pango: this.pango,
              gene: this.selectedGenes,
              threshold: this.prevalenceThreshold,
              nthresh: this.countThreshold,
              dark: this.darkMode,
            },
          });
        } else {
          this.$router.push({
            name: this.routeTo,
            params: {
              disableScroll: true,
            },
            query: {
              pango: this.pango,
              gene: this.selectedGenes,
              threshold: this.prevalenceThreshold,
              nthresh: this.countThreshold,
              dark: this.darkMode,
            },
          });
        }

        this.getData();
      }
    },
    addVOC(lineage) {
      if (!this.selectedPango.includes(lineage))
        this.selectedPango.push(lineage);
    },
    changeCountThreshold() {
      if (this.countThreshold) {
        if (this.routeTo === 'GenomicsEmbed') {
          this.$router.push({
            name: this.routeTo,
            params: {
              disableScroll: true,
            },
            query: {
              type: 'comp',
              pango: this.pango,
              gene: this.selectedGenes,
              threshold: this.prevalenceThreshold,
              nthresh: this.countThreshold,
              dark: this.darkMode,
            },
          });
        } else {
          this.$router.push({
            name: this.routeTo,
            params: {
              disableScroll: true,
            },
            query: {
              pango: this.pango,
              gene: this.selectedGenes,
              threshold: this.prevalenceThreshold,
              nthresh: this.countThreshold,
              dark: this.darkMode,
            },
          });
        }
        // reapply the filter
        this.filteredMutationHeatmap = this.mutationHeatmap.map((gene) => {
          return {
            key: gene.key,
            values: gene.values.filter(
              (d) => d.lineage_count >= this.countThreshold,
            ),
          };
        });
        this.selectedPango = uniq(
          this.filteredMutationHeatmap
            .flatMap((d) => d.values)
            .map((d) => d.pangolin_lineage),
        );
      }
    },
    updateLocation(location) {
      this.selectedLocation = location;
    },
    getData() {
      const ofInterest = getBadMutations(true);
      this.moc = ofInterest.moc;
      this.moi = ofInterest.moi;

      this.heatmapSubscription = getLineagesComparison(
        this.$genomicsurl,
        this.selectedPango,
        this.prevalenceThreshold / 100,
        false,
        this.selectedGenes,
      ).subscribe((results) => {
        this.prepResults(results);
      });
    },
    routeDark() {
      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            type: 'comp',
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            pango: this.pango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      }
    },
    prepResults(results) {
      this.mutationHeatmap = results.data;
      this.filteredMutationHeatmap = results.data.map((gene) => {
        return {
          key: gene.key,
          values: gene.values.filter(
            (d) => d.lineage_count >= this.countThreshold,
          ),
        };
      });

      this.downloadableHeatmap = results.dataFlat;
    },
    addMutations() {
      const selMutation = this.selectedMutationQuery
        .replace(/\s/g, '')
        .split(',');
      this.lineageByMutationsSubscription = getComparisonByMutations(
        this.$genomicsurl,
        this.selectedPango,
        this.prevalenceThreshold / 100,
        selMutation,
        this.selectedMutationThreshold / 100,
      ).subscribe((results) => {
        this.showSnackbar = true;
        this.snackbarText = `${results.data.length} lineages added`;
        setTimeout(() => {
          this.showSnackbar = false;
        }, 5000);
        const filteredMutation = results.data.filter(
          (gene) => gene.lineage_count >= this.countThreshold,
        );

        this.selectedPango = uniq(
          filteredMutation.map((d) => d.pangolin_lineage),
        );

        // reset / clear
        this.selectedMutationQuery = null;
      });
    },
    addLocationLineages() {
      this.lineageByLocationSubscription = getComparisonByLocation(
        this.$genomicsurl,
        this.selectedPango,
        this.prevalenceThreshold / 100,
        this.selectedLocation.id,
        this.selectedOtherThreshold / 100,
        this.selectedNdayThreshold,
        this.selectedWindow,
        this.selectedWindow,
      ).subscribe((results) => {
        this.showSnackbar = true;
        this.snackbarText = `${results.data.length} lineages added`;
        setTimeout(() => {
          this.showSnackbar = false;
        }, 5000);
        // update lineages to be the "fixed" names, to account for WHO / grouped names.
        this.selectedPango = uniq(results.data);

        // reset / clear
        this.selectedLocation = null;
      });
    },
    clearAddMutations() {
      this.selectedPango = [];
      this.addMutations();
    },
    clearAddLocationLineages() {
      this.selectedPango = [];
      this.addLocationLineages();
    },
    addWHO(clearPrevious = false) {
      // set new values
      if (clearPrevious) {
        this.selectedPango = [this.selectedWHO];
      } else {
        this.selectedPango.push(this.selectedWHO);
      }

      this.showSnackbar = true;
      this.snackbarText = `${this.selectedWHO} lineages added`;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 5000);

      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            type: 'comp',
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            dark: this.darkMode,
          },
        });
      }
      // reset / clear
      this.selectedWHO = null;
      this.getData();
    },
    submitNewData() {
      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            type: 'comp',
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            dark: this.darkMode,
          },
        });
      }
      // reset / clear
      this.selectedWHO = null;
      this.getData();
    },
    addPango(selected) {
      this.selectedPango.push(selected.name);
    },
    clearPango() {
      this.selectedPango = [];
      this.filteredMutationHeatmap = null;
      this.downloadableHeatmap = null;
      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          query: {
            type: 'comp',
            pango: [],
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          query: {
            pango: [],
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      }

      this.mutationHeatmap = null;
    },
    deletePango(idx) {
      this.selectedPango.splice(idx, 1);

      if (this.routeTo === 'GenomicsEmbed') {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            type: 'comp',
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      } else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            pango: this.selectedPango,
            gene: this.selectedGenes,
            threshold: this.prevalenceThreshold,
            nthresh: this.countThreshold,
            dark: this.darkMode,
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.w-400px {
  width: 200px;
}
.w-600px {
  width: 600px;
}

.w-75px {
  width: 75px;
}

$circle-width: 1.35em;
$circle-width-sm: 1.1em;
.circle {
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  text-align: center;
  display: flex;
  flex-shrink: 0 !important;
  color: white;
  background: $secondary-color;
  font-size: calc(#{$circle-width} * 0.9);
  width: $circle-width;
  height: $circle-width;
}

.circle-sm {
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  text-align: center;
  display: flex;
  flex-shrink: 0 !important;
  color: white;

  font-size: calc(#{$circle-width} * 0.9);
  background: $secondary-color;
  width: $circle-width-sm;
  height: $circle-width-sm;
}

.border-radius-1 {
  border-radius: 0.25rem;
}

.percent-sign input {
  border: none;
  padding: 0;
  outline: none;
}

.warning {
  color: $warning-color;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

.horiz-scroll {
  overflow-x: scroll;
}
</style>
