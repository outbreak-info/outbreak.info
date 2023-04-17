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
        <div>
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
        </div>

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
            <div v-if="selectedGenes.includes(geneData.key)">
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
            </div>
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
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
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
import { adminStore } from '@/stores/adminStore';
import { genomicsStore } from '@/stores/genomicsStore';

const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const ReportMethodology = lazyLoad('ReportMethodology');
const Warning = lazyLoad('Warning');
const ReportAcknowledgements = lazyLoad('ReportAcknowledgements');
const ShareReport = lazyLoad('ShareReport');
const MutationHeatmap = lazyLoad('MutationHeatmap');
const GradientLegend = lazyLoad('GradientLegend');
const DownloadReportData = lazyLoad('DownloadReportData');
const GenomicsCitation = lazyLoad('GenomicsCitation');

const props = defineProps({
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
    default() {
      return ['ORF1a', 'ORF1b', 'S'];
    },
  },
});

// equivalent to this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const today = ref(null);
const url = ref(null);
const darkMode = ref(null);
const disclaimer = ref(
  `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
);
const title = ref('Lineage Comparison');
const queryPangolin = ref(null);
const mutationHeatmap = ref(null);
const filteredMutationHeatmap = ref(null);
const downloadableHeatmap = ref(null);
const selectedGenes = ref([]);
const selectedPango = ref([]);
const selectedMutationQuery = ref(null);
const selectedMutationThreshold = ref(50);
const colorScale = ref(null);
const prevalenceThreshold = ref(null);
const heatmapSubscription = ref(null);
const basicSubscription = ref(null);
const lineageByMutationsSubscription = ref(null);
const lineageByLocationSubscription = ref(null);
const totalSequences = ref(null);
const lastUpdated = ref(null);
const showSnackbar = ref(false);
const snackbarText = ref(null);
const selectedLocation = ref(null);
const selectedOtherThreshold = ref(3);
const selectedNdayThreshold = ref(5);
// const selectedNdays = ref(60);
const selectedWindow = ref(60);
const queryLocation = ref(null);
const previous_voc = ref(null); // list of previously designated VOCs
const curated = ref(null); // list of currently designated VOCs -- curated lineages listed on our reports
const voc = ref([]); // full list of all VOCs, former and current, including sublineages also designated as VOCss
const voi = ref([]); // VOIs. as of 2022, not really used...
const moi = ref(null);
const moc = ref(null);
const countThreshold = ref(null);
const selectedWHO = ref(null);
const whoLineages = ref([]);
const geneOpts = ref([
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
]);
const smallScreen = ref(false);
const mediumScreen = ref(false);
const largeScreen = ref(false);

const storeAdmin = adminStore();
const { mutationAuthors, genomicsCitation } = storeToRefs(storeAdmin);
const storeGenomics = genomicsStore();

const loading = computed(() => {
  return (
    storeGenomics.$state.locationLoading1 ||
    storeGenomics.$state.locationLoading2
  );
});

const locationValid = computed(() => {
  return !!(
    selectedLocation.value &&
    selectedOtherThreshold.value &&
    selectedOtherThreshold.value >= 0 &&
    selectedWindow.value > 0
  );
});

const mutationValid = computed(() => {
  return (
    /\w+:[A-z]\d+[A-z]/.test(selectedMutationQuery.value) ||
    /\w+:DEL\d+/.test(selectedMutationQuery.value.toUpperCase())
  );
});

const darkModeHelper = computed(() => {
  return props.darkMode
    ? 'Switch to <b>light mode</b> to focus on similarities between lineages'
    : 'Switch to <b>dark mode</b> to emphasize mutations with low prevalence';
});

const checkPango = computed(() => {
  const pangos = CURATED.filter((d) => d.who_name === 'Omicron');
  if (selectedPango.value && selectedPango.value.length > 0) {
    return pangos[0].pango_descendants.some((item) =>
      selectedPango.value.includes(item),
    );
  } else {
    return false;
  }
});

// methods functions
const setDims = () => {
  mediumScreen.value = window.innerWidth < 1000;
  smallScreen.value = window.innerWidth < 500;
  largeScreen.value = window.innerWidth < 1920;
};

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

const updateGenes = () => {
  if (props.routeTo === 'GenomicsEmbed') {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        type: 'comp',
        pango: props.pango,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        pango: props.pango,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  }
  getData();
};

const changeThreshold = () => {
  if (prevalenceThreshold.value) {
    if (props.routeTo === 'GenomicsEmbed') {
      router.push({
        name: props.routeTo,
        state: {
          disableScroll: true,
        },
        query: {
          type: 'comp',
          pango: props.pango,
          gene: selectedGenes.value,
          threshold: prevalenceThreshold.value,
          nthresh: countThreshold.value,
          dark: darkMode.value,
        },
      });
    } else {
      router.push({
        name: props.routeTo,
        state: {
          disableScroll: true,
        },
        query: {
          pango: props.pango,
          gene: selectedGenes.value,
          threshold: prevalenceThreshold.value,
          nthresh: countThreshold.value,
          dark: darkMode.value,
        },
      });
    }

    getData();
  }
};

const addVOC = (lineage) => {
  if (!selectedPango.value.includes(lineage)) selectedPango.value.push(lineage);
};

const changeCountThreshold = () => {
  if (countThreshold.value) {
    if (props.routeTo === 'GenomicsEmbed') {
      router.push({
        name: props.routeTo,
        state: {
          disableScroll: true,
        },
        query: {
          type: 'comp',
          pango: props.pango,
          gene: selectedGenes.value,
          threshold: prevalenceThreshold.value,
          nthresh: countThreshold.value,
          dark: darkMode.value,
        },
      });
    } else {
      router.push({
        name: props.routeTo,
        state: {
          disableScroll: true,
        },
        query: {
          pango: props.pango,
          gene: selectedGenes.value,
          threshold: prevalenceThreshold.value,
          nthresh: countThreshold.value,
          dark: darkMode.value,
        },
      });
    }
    // reapply the filter
    filteredMutationHeatmap.value = mutationHeatmap.value.map((gene) => {
      return {
        key: gene.key,
        values: gene.values.filter(
          (d) => d.lineage_count >= countThreshold.value,
        ),
      };
    });
    selectedPango.value = uniq(
      filteredMutationHeatmap.value
        .flatMap((d) => d.values)
        .map((d) => d.pangolin_lineage),
    );
  }
};

const updateLocation = (location) => {
  selectedLocation.value = location;
};

const getData = () => {
  const ofInterest = getBadMutations(true);
  moc.value = ofInterest.moc;
  moi.value = ofInterest.moi;

  heatmapSubscription.value = getLineagesComparison(
    genomicsUrl,
    selectedPango.value,
    prevalenceThreshold.value / 100,
    false,
    selectedGenes.value,
  ).subscribe((results) => {
    prepResults(results);
  });
};

const routeDark = () => {
  if (props.routeTo === 'GenomicsEmbed') {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        type: 'comp',
        pango: props.pango,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        pango: props.pango,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  }
};

const prepResults = (results) => {
  mutationHeatmap.value = results.data;
  filteredMutationHeatmap.value = results.data.map((gene) => {
    return {
      key: gene.key,
      values: gene.values.filter(
        (d) => d.lineage_count >= countThreshold.value,
      ),
    };
  });

  downloadableHeatmap.value = results.dataFlat;
};

const addMutations = () => {
  const selMutation = selectedMutationQuery.value.replace(/\s/g, '').split(',');
  lineageByMutationsSubscription.value = getComparisonByMutations(
    genomicsUrl,
    selectedPango.value,
    prevalenceThreshold.value / 100,
    selMutation,
    selectedMutationThreshold.value / 100,
  ).subscribe((results) => {
    showSnackbar.value = true;
    snackbarText.value = `${results.data.length} lineages added`;
    setTimeout(() => {
      showSnackbar.value = false;
    }, 5000);
    const filteredMutation = results.data.filter(
      (gene) => gene.lineage_count >= countThreshold.value,
    );

    selectedPango.value = uniq(filteredMutation.map((d) => d.pangolin_lineage));

    // reset / clear
    selectedMutationQuery.value = null;
  });
};

const addLocationLineages = () => {
  lineageByLocationSubscription.value = getComparisonByLocation(
    genomicsUrl,
    selectedPango.value,
    prevalenceThreshold.value / 100,
    selectedLocation.value.id,
    selectedOtherThreshold.value / 100,
    selectedNdayThreshold.value,
    selectedWindow.value,
    selectedWindow.value,
  ).subscribe((results) => {
    showSnackbar.value = true;
    snackbarText.value = `${results.data.length} lineages added`;
    setTimeout(() => {
      showSnackbar.value = false;
    }, 5000);
    // update lineages to be the "fixed" names, to account for WHO / grouped names.
    selectedPango.value = uniq(results.data);

    // reset / clear
    selectedLocation.value = null;
  });
};

const submitNewData = () => {
  if (props.routeTo === 'GenomicsEmbed') {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        type: 'comp',
        pango: selectedPango.value,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        dark: darkMode.value,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        pango: selectedPango.value,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        dark: darkMode.value,
      },
    });
  }
  // reset / clear
  selectedWHO.value = null;
  getData();
};

const addPango = (selected) => {
  selectedPango.value.push(selected.name);
};

const clearPango = () => {
  selectedPango.value = [];
  filteredMutationHeatmap.value = null;
  downloadableHeatmap.value = null;
  if (props.routeTo === 'GenomicsEmbed') {
    router.push({
      name: props.routeTo,
      query: {
        type: 'comp',
        pango: [],
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      query: {
        pango: [],
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  }

  mutationHeatmap.value = null;
};

const deletePango = (idx) => {
  selectedPango.value.splice(idx, 1);

  if (props.routeTo === 'GenomicsEmbed') {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        type: 'comp',
        pango: selectedPango.value,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      state: {
        disableScroll: true,
      },
      query: {
        pango: selectedPango.value,
        gene: selectedGenes.value,
        threshold: prevalenceThreshold.value,
        nthresh: countThreshold.value,
        dark: darkMode.value,
      },
    });
  }
};

const debounceThreshold = debounce(changeThreshold, 250);
const debounceCountThreshold = debounce(changeCountThreshold, 250);
const debounceGenes = debounce(updateGenes, 250);

watch(countThreshold, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    debounceCountThreshold();
  }
});

watch(prevalenceThreshold, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    debounceThreshold();
  }
});

onMounted(() => {
  const formatDate = timeFormat('%e %B %Y');
  const currentTime = new Date();
  today.value = formatDate(currentTime);

  darkMode.value =
    props.dark === 'true' || (!!props.dark && props.dark !== 'false');

  prevalenceThreshold.value = +props.threshold;
  countThreshold.value = +props.nthresh;

  colorScale.value = scaleSequential(interpolateRdPu);
  selectedGenes.value =
    typeof props.gene === 'string' ? [props.gene] : props.gene;

  if (props.pango) {
    selectedPango.value =
      typeof props.pango === 'string' ? [props.pango] : props.pango;
  }

  // this.$nextTick in optionsAPI
  nextTick(() => {
    // set URL for sharing, etc.
    window.addEventListener('resize', setDims);
    setDims();
    const location = window.location;
    url.value =
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

  queryPangolin.value = findPangolin;
  queryLocation.value = findLocation;

  basicSubscription.value = getBasicComparisonReportData(genomicsUrl).subscribe(
    (results) => {
      totalSequences.value = results.total;
      lastUpdated.value = results.dateUpdated.lastUpdated;
      whoLineages.value = results.who;
      voc.value = results.voc;
      curated.value = results.current_voc;
      previous_voc.value = results.previous_voc;
    },
  );

  // only load data if lineages have been selected
  if (selectedPango.value.length) {
    getData();
  }
});

onUnmounted(() => {
  if (basicSubscription.value) {
    basicSubscription.value.unsubscribe();
  }
  if (heatmapSubscription.value) {
    heatmapSubscription.value.unsubscribe();
  }
  if (lineageByMutationsSubscription.value) {
    lineageByMutationsSubscription.value.unsubscribe();
  }
  if (lineageByLocationSubscription.value) {
    lineageByLocationSubscription.value.unsubscribe();
  }
});
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
