<template>
<div>
  <div class="bg-main__darker mutation-banner border-top py-4">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 mutation-header font-weight-bold">Lineage <span class="mx-2">|</span> Mutation Tracker</h1>
  </div>

  <div class="my-2 mx-4 px-4">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- Header info -->
    <div class="mb-1">
      <img src="@/assets/sars-virus.svg" alt="map" class="bg-image" />
      <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex w-75 justify-content-around align-items-center">
          <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2 gisaid-text">
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img src="@/assets/resources/gisaid.png" class="gisaid-lg ml-2" alt="GISAID Initiative" />
            </a>
          </div>
        </div>

        <!-- Select custom reports -->
        <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19) variants with lineage and mutation reports, updated
          daily.
          Access curated reports below, or create your own <a href="#custom-report">custom reports</a> with any combination of lineages and/or mutations.
        </div>
        <div class="d-flex align-items-center justify-content-between my-2">
          <div id="date-updated" class="mr-2">
            <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
            </small>
          </div>
          <div id="sequence-count" class="ml-2 mr-5 text-muted" v-if="total">
            with <span class="text-highlight">{{total}} sequences</span>  from GISAID
          </div>
        </div>

        <div class="d-flex flex-column text-left font-size-large bg-white border-top border-bottom p-2">
          <div class="d-flex flex-wrap">
            View:
            <router-link class="mx-3" :to="{ hash: '#voc' }">Variants of Concern</router-link>

            <div class="d-flex flex-column mx-3">
              <router-link :to="{ hash: '#voi' }" class="">Variants of Interest</router-link>
              <div class="text-muted text-size-xs mt-n1">a.k.a. Variants Under Investigation</div>
            </div>

            <router-link class="mx-3" :to="{ hash: '#moc' }">Mutations of Concern</router-link>

            <router-link class="mx-3" :to="{ hash: '#moi' }">Mutations of Interest</router-link>
          </div>
          <div class="d-flex justify-content-center mt-3 fa-sm">
            <button class="btn btn-grey-outline" data-toggle="collapse" href="#filter-classifiers">
              Filter reports
            </button>
          </div>

          <div id="filter-classifiers" class="mt-3 collapse">
            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">VOC classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                <span>{{curator.label}}</span>
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOC" @change="filterVOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">VOI classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                <span>{{curator.label}}</span>
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOI" @change="filterVOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">MOC classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0">
                <img :src="require(`@/assets/icon-01.svg`)" class="variant-logo mr-1" />
                <span>outbreak.info</span>
                <input type="checkbox" id="outbreak.info" value="outbreak" v-model.lazy="selectedMOC" @change="filterMOC()" />
                <div class="b-input"></div>
              </label>
            </div>

            <div class="d-flex flex-wrap align-items-center my-3">
              <small class="text-muted mr-2">MOI classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0">
                <img :src="require(`@/assets/icon-01.svg`)" class="variant-logo mr-1" />
                <span>outbreak.info</span>
                <input type="checkbox" id="outbreak.info" value="outbreak" v-model.lazy="selectedMOI" @change="filterMOC()" />
                <div class="b-input"></div>
              </label>
            </div>
          </div>
          <div class="d-flex flex-column border-top mt-3 pt-2 w-100">
            <div class="align-self-center my-3">
              <div class="btn btn-main" data-toggle="collapse" href="#custom-report" aria-expanded="false">Select my own lineage and/or mutation(s)</div>
            </div>

            <section id="custom-report" class="collapse text-left">
              <CustomReportForm />
            </section>
          </div>
        </div>
      </div>

    </div>

    <section id="report-list" class="text-left">
      <!-- lineage groups -->
      <div class="lineage-group my-10" v-for="(group, i) in filteredReports" :key="i" :id="group.id + '-reports'">
        <template v-if="group.id != 'deescalated'">
          <div class="d-flex justify-content-between">
            <h2 class="mb-0" :id="group.id">{{ group.key | capitalize }} Reports</h2>
            <div class="d-flex align-items-center text-sec" v-if="i === 0">
              <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
              <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
            </div>
          </div>

          <small>
            <div class="line-height-1">
              <span class="text-highlight d-inline" v-html="getReportType(group.key)"></span>
              <a class='ml-2 d-inline' href='https://outbreak.info/situation-reports/caveats#variant'>Read more</a>
            </div>
          </small>


          <template v-if="group.values.length">
            <!-- filter to hide VOCs / VOIs -->
            <div class="d-flex flex-wrap align-items-center ml-3 my-3 border-top border-bottom bg-white py-2 justify-content-center" v-if="group.id != 'vum'">
              <small class="text-muted mr-2">include {{group.id.toUpperCase()}}s classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0" v-for="(curator, idx) in curatorOpts" :key="idx">
                <img :src="require(`@/assets/${curator.src}`)" class="variant-logo mr-1" />
                <span>{{curator.label}}</span>
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOC" @change="filterVOC()" v-if="group.id == 'voc'" />
                <input type="checkbox" :id="curator.label" :value="curator.id" v-model.lazy="selectedVOI" @change="filterVOC()" v-if="group.id == 'voi'" />
                <div class="b-input"></div>
              </label>
              <button class="btn btn-grey-outline py-1 m-0" @click="clearFilters">clear</button>
            </div>

            <!-- LINEAGE TABLE -->
            <table class="bg-white my-2 st-rep-table">
              <thead class="text-uppercase bg-dark text-light">
                <tr class="border-bottom border-white">
                  <!-- table header -->
                  <th>
                    <div class="d-flex align-items-center">
                      variant
                      <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
                        <div class="input-group">
                          <input :id="'sBar' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                          <div class="input-group-prepend">
                            <span class="input-group-text text-muted border-0" id="sb">
                              <font-awesome-icon :icon="['fas', 'search']" />
                            </span>
                          </div>
                        </div>
                      </form>
                    </div>
                  </th>
                  <th>
                    classifications
                  </th>
                  <th>
                    first identified
                  </th>
                  <th>
                    total
                  </th>
                  <th>
                    S-gene Mutations<sup>*</sup>
                  </th>
                </tr>
              </thead>

              <!-- table body -->
              <tbody>
                <template v-for="(report, rIdx) in group.values">
                  <tr :key="rIdx" class="border-bottom" :class="{checkbook : rIdx%2-1}" :id="report.identifier">
                    <!-- name + synonyms -->
                    <td class="pt-2  border-bottom">
                      <!-- WHO reports -->
                      <template v-if="report.who_name">
                        <!-- WHO named lineage -->
                        <router-link :to="{name:'MutationReport', params: {alias: report.who_name.toLowerCase()}, query: {loc: report.loc, selected: report.selected} }" class="no-underline">
                          <h3 class="m-0 font-weight-bold border-bottom pb-1 mb-2" :id="anchorLink(report.who_name)">{{ report.label }}</h3>
                        </router-link>
                      </template>

                      <!-- multiple sublineages, unnamed -->
                      <router-link :to="{name:'MutationReport', params: {alias: report.label.toLowerCase()}, query: {loc: report.loc, selected: report.selected} }" class="no-underline" v-else-if="report.pango_sublineages.length">
                        <h3 class="m-0 font-weight-bold border-bottom pb-1 mb-2" :id="anchorLink(report.label)">{{ report.label }}</h3>
                      </router-link>

                      <!-- single lineage -->
                      <router-link :to="{name:'MutationReport', query: {pango: report.pangolin_lineage, loc: report.loc, selected: report.selected} }" class="no-underline" v-else>
                        <h3 class="m-0 font-weight-bold border-bottom pb-1 mb-2" :id="anchorLink(report.pangolin_lineage)">{{ report.pangolin_lineage }}</h3>
                      </router-link>

                      <!-- list of parent / sublineages -->
                      <div class="sublineages text-muted border-bottom pb-2 mb-2" v-if="report.pango_descendants.length > 1  || report.who_name">
                        <template v-if="report.pangolin_lineage">
                          <div v-if="Array.isArray(report.pangolin_lineage)" class="d-flex">
                            <h4 class="m-0 parent-lineage" :id="anchorLink(parentLineage)" v-for="(parentLineage, pIdx) in report.pangolin_lineage" :key="pIdx">
                              <router-link :to="{name:'MutationReport', query: {pango: parentLineage, loc: report.loc, selected: report.selected }}" class="font-weight-bold no-underline">
                                {{parentLineage}}
                              </router-link>
                              <span class="mx-1" v-if="pIdx < report.pangolin_lineage.length - 1">&bull;</span>
                            </h4>
                          </div>
                          <h4 class="m-0 parent-lineage" :id="anchorLink(report.pangolin_lineage)" v-else>
                            <router-link :to="{name:'MutationReport', query: {pango: report.pangolin_lineage, loc: report.loc, selected: report.selected }}" class="font-weight-bold no-underline">
                              {{report.pangolin_lineage}}
                            </router-link>
                          </h4>
                        </template>

                        <div v-if="report.pango_sublineages.length">
                          <h5 class="sublineage d-flex flex-wrap">
                            <span class="mr-2">Sublineages: </span>
                            <template v-if="report.showSublineages">
                              <span v-for="(sublineage, sIdx) in report.pango_sublineages" :key="sIdx" :id="anchorLink(sublineage)">
                                <router-link :to="{name:'MutationReport', query: {pango: sublineage, loc: report.loc, selected: report.selected }}" class="font-weight-bold no-underline" :id="anchorLink(sublineage)">{{sublineage}}</router-link>
                                <span class="mx-1" v-if="sIdx < report.pango_sublineages.length - 1">&bull;</span>
                              </span>
                            </template>
                            <template v-else>
                              <span v-for="(sublineage, sIdx) in report.pango_sublineages.slice(0, sublineageMax)" :key="sIdx" :id="anchorLink(sublineage)">
                                <router-link :to="{name:'MutationReport', query: {pango: sublineage, loc: report.loc, selected: report.selected }}" class="font-weight-bold no-underline" :id="anchorLink(sublineage)">{{sublineage}}</router-link>
                                <span class="mx-1" v-if="sIdx < report.pango_sublineages.length - 1">&bull;</span>
                                <span class="mx-1 opacity-75" v-if="sIdx == sublineageMax -1 && sIdx != report.pango_sublineages.length - 1">and
                                  <span class="font-weight-bold">{{report.pango_sublineages.length - sublineageMax}}</span> more
                                  <small>
                                    <a @click="viewSublineages(report)" class="link">view all</a>
                                  </small>
                                </span>
                              </span>
                            </template>
                          </h5>
                        </div>
                        <!-- DELTA WARNING! -->
                        <div style='max-width: 470px;' class="mb-2" v-if="report.who_name == 'Delta'">
                          <Warning text="Classifications of Delta lineages are in flux. <a href='https://outbreak.info/situation-reports/caveats#delta' class='text-light text-underline'>(read more)</a>" />
                        </div>
                        <!-- OMICRON WARNING! -->
                        <div style='max-width: 470px;' class="mb-2" v-if="report.who_name == 'Omicron'">
                          <Warning text="Classifications of Omicron lineages are in flux. <a href='https://outbreak.info/situation-reports/caveats#delta' class='text-light text-underline'>(read more)</a>" />
                        </div>
                      </div>

                      <!-- synonyms -->
                      <small class="d-flex flex-column text-muted">
                        <div v-if="report.who_name">
                          WHO: <span class="font-weight-bold">{{report.who_name}}</span>
                        </div>
                        <div v-if="report.phe_name">
                          PHE: <span class="font-weight-bold">{{report.phe_name}}</span>
                        </div>
                        <div v-if="report.nextstrain_clade">
                          Nextstrain: <span class="font-weight-bold">{{report.nextstrain_clade}}</span>
                        </div>
                        <div v-if="report.gisaid_clade">
                          GISAID: <span class="font-weight-bold">{{report.gisaid_clade}}</span>
                        </div>
                        <div class="text-highlight d-flex flex-wrap" v-if="report.related">
                          <span class="mr-1">related:</span>
                          <span v-for="(related, rIdx) in report.related" :key="rIdx">
                            <router-link :to="{hash: anchorLink(related)}" class="font-weight-bold">{{related}}</router-link>
                            <span class="mx-1" v-if="rIdx < report.related.length - 1">&bull;</span>
                          </span>
                        </div>
                      </small>

                    </td>

                    <!-- classifications -->
                    <td>
                      <table class="bordered">
                        <thead>
                          <tr class="fa-xs">
                            <th></th>
                            <th v-for="(curator, cIdx) in curatorOpts" :key="cIdx +'table'">
                              <img :src="require(`@/assets/${curator.src}`)" class="variant-logo" />
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr v-for="(variant, vIdx) in variantTypes" :key="vIdx">
                            <th>
                              <span :class="'tracked-variant-badge ' + variant.id + '-logo'" :data-tippy-info="variant.label">{{variant.id}}</span>
                              <!-- <span :class="'tracked-variant-badge ' + variant.id + '-logo'" :data-tippy-info="`<b>${variant.label}</b><div class='fa-sm line-height-1'>${variant.def}</div>`">{{variant.id}}</span> -->
                            </th>

                            <td v-for="(curator, cIdx) in curatorOpts" :key="cIdx +'td'" :class="[report.classificationTable[variant.id] && report.classificationTable[variant.id][curator.id] ? variant.id + '-bg' : 'no-classification']">
                              <div v-if="report.classificationTable[variant.id]" class="border-inset">
                                <small class="line-height-1 tracked-variant-report" v-if="report.classificationTable[variant.id][curator.id] && report.classificationTable[variant.id][curator.id].label"
                                  :data-tippy-info="report.classificationTable[variant.id][curator.id].ttip" v-html="report.classificationTable[variant.id][curator.id].label"></small>
                              </div>

                            </td>
                          </tr>

                        </tbody>

                      </table>
                    </td>

                    <!-- location found -->
                    <td class="text-center line-height-1">
                      {{ report.location_first_identified }}
                    </td>

                    <td class="text-center">
                      {{report.lineage_count}}
                    </td>

                    <!-- s-gene mutations heatmap -->
                    <td>
                      <div class="d-flex flex-column align-items-center">
                        <MutationHeatmap :data="report.mutations" :dark="false" gene="S" :yDomain="report.mutationsYDomain" :moc="curatedMOC" :moi="curatedMOI" v-if="report.mutations.length" />
                        <div class="d-flex">
                          <router-link class="text-muted" :to="{name:'SituationReportComparison', query: { pango: report.who_name, sub: true } }" v-if="report.mutations.length && report.who_name">
                            <small v-if="report.pango_sublineages.length">Compare {{report.who_name}} sublineages
                            </small>
                            <small v-else>Explore all genes
                            </small>
                          </router-link>
                          <router-link class="text-muted" :to="{name:'SituationReportComparison', query: { pango: report.char_muts_query } }" v-else-if="report.mutations.length">
                            <small v-if="report.pango_sublineages.length">Compare {{report.pangolin_lineage}} sublineages
                            </small>
                            <small v-else>Explore all genes
                            </small>
                          </router-link>
                        </div>

                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>

            </table>

            <div class="mt-2">

              <div class="mt-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="border-bottom pb-2">
                    <sup class="text-muted mr-1">*</sup>
                    <small class="text-muted line-height-1">S-gene mutations appearing in at least {{charMutThreshold}} of sequences <router-link :to="{name: 'SituationReportMethodology', hash: '#characteristic'}" target="_blank">(read more)
                      </router-link>. For lineages with few sequences, the {{charMutThreshold}} threshold may not identify all the mutations specific to that lineage, and as more sequences are found, the characteristic mutations may change. For
                      applications like reagent design which require stringent accuracy, we recommend downloading the consensus sequences from <a href="https://www.gisaid.org/" target="_blank">GISAID</a>.
                    </small>
                  </div>
                  <div v-for="(variant, vIdx) in variantTypes" :key="vIdx" class="line-height-1 my-2">
                    <small><b>{{variant.label}}</b> (<span class="text-underline">{{variant.id}}</span>): <span v-html="variant.def"></span></small>
                  </div>
                </div>


                <DownloadReportData :fullWidth="false" :data="group.values" dataType="Curated Variant List" reportType="curated-list" :downloadLabel="`${group.id} list`" :numSvgs="1000" class="mt-3" />
              </div>
            </div>
          </template>

          <div class="d-flex align-items-center my-3" v-else>
            <h5 class="text-muted m-0">No {{group.key}} reports found</h5>
            <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
              <div class="input-group">
                <input :id="'sBar-clear' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                <div class="input-group-prepend">
                  <span class="input-group-text text-muted border-0" id="sb">
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
              </div>
            </form>

            <button class="btn btn-grey-outline py-1 m-0 ml-4" @click="clearFilters">clear filters</button>
          </div>
        </template>
        <div v-else id="de-escalated">
          <h4>De-escalated Variants</h4>
          <small class="text-muted line-height-sm">These former VOCs and/or VOIs have been de-escalated by public health agencies based on at least one the following criteria: (1) the variant is no longer circulating, (2) the variant has been
            circulating
            for a long
            time without any impact on the
            overall epidemiological situation, (3) scientific evidence demonstrates that the variant is not associated with any concerning properties.</small>

          <div class="d-flex flex-wrap mt-3 p-3 bg-white border-top border-bottom">
            <div v-for="(report, r2Idx) in group.values" :key="r2Idx" class="m-0 mr-5 font-weight-bold">
              <!-- WHO reports -->
              <template v-if="report.who_name">
                <!-- with sublineages -->
                <router-link :to="{name:'MutationReport', params: {alias: report.who_name.toLowerCase()}, query: {loc: report.loc, selected: report.selected} }" class="no-underline">
                  <h5 class="m-0" :id="anchorLink(report.who_name)">{{ report.label }}/{{Array.isArray(report.pangolin_lineage) ? report.pangolin_lineage.join(" & ") : report.pangolin_lineage}}</h5>
                </router-link>
              </template>

              <!-- multiple sublineages, unnamed -->
              <router-link :to="{name:'MutationReport', params: {alias: report.label.toLowerCase()}, query: {loc: report.loc, selected: report.selected} }" class="no-underline" v-else-if="report.pango_sublineages.length">
                <h5 class="m-0" :id="anchorLink(report.label)">{{ report.label }}</h5>
              </router-link>

              <!-- single lineage -->
              <router-link :to="{name:'MutationReport', query: {pango: report.pangolin_lineage, loc: report.loc, selected: report.selected} }" class="no-underline" v-else>
                <h5 class="m-0" :id="anchorLink(report.pangolin_lineage)">{{ report.pangolin_lineage }}</h5>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <template v-if="!filteredMutations.length">
        <h2 id="moc">Mutation of Concern &amp; Interest Reports</h2>
        <button id="moi" class="btn btn-main" @click="getCuratedMutations">show mutation reports</button>
      </template>

      <template v-else>
        <!-- mutation groups -->
        <div class="mutation-group my-10" v-for="(group, i) in filteredMutations" :key="'mutation' + i" :id="group.id + '-reports'">
          <div class="d-flex justify-content-between">
            <h2 class="mb-0" :id="group.id">{{ group.key | capitalize }} Reports</h2>
          </div>
          <small>
            <div class="line-height-1">
              <span class="text-highlight d-inline" v-html="getReportType(group.key)"></span>
              <a class='ml-2 d-inline' href='https://outbreak.info/situation-reports/caveats#variant'>Read more</a>
            </div>
          </small>

          <template v-if="group.values.length">
            <div class="d-flex flex-wrap align-items-center ml-3 my-3 border-top border-bottom bg-white py-2 justify-content-center">
              <small class="text-muted mr-2">include {{group.id.toUpperCase()}}s classified by:</small>
              <label class="b-contain d-flex align-items-center pr-4 m-0">
                <img :src="require(`@/assets/icon-01.svg`)" class="variant-logo mr-1" />
                <span>outbreak.info</span>
                <input type="checkbox" id="outbreak.info" value="outbreak" v-if="group.id == 'moc'" v-model.lazy="selectedMOC" @change="filterMOC()" />
                <input type="checkbox" id="outbreak.info" value="outbreak" v-if="group.id == 'moi'" v-model.lazy="selectedMOI" @change="filterMOC()" />
                <div class="b-input"></div>
              </label>
              <button class="btn btn-grey-outline py-1 m-0" @click="clearFilters">clear</button>
            </div>

            <table class="bg-white mt-2 w-100">
              <thead class="text-uppercase bg-dark text-light">
                <tr class="border-bottom border-white">
                  <th>
                    <div class="d-flex align-items-center">
                      mutation
                      <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
                        <div class="input-group">
                          <input :id="'sBar-mutation' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                          <div class="input-group-prepend">
                            <span class="input-group-text text-muted border-0" id="sb">
                              <font-awesome-icon :icon="['fas', 'search']" />
                            </span>
                          </div>
                        </div>
                      </form>
                    </div>
                  </th>
                  <th>
                    prominent in <sup>**</sup>
                  </th>
                  <th>
                    total found
                  </th>
                  <th>
                    protein structures
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-for="(report, rIdx) in group.values">
                  <tr :key="rIdx" :class="{checkbook : rIdx%2-1}" :id="report.identifier">

                    <!-- name + synonyms -->
                    <td class="pt-2">
                      <router-link :to="{name:'MutationReport', query: {muts: report.mutation_name} }" class="no-underline">
                        <h3 class="m-0"><b>{{ report.mutation_name }}</b></h3>
                      </router-link>
                    </td>

                    <td>
                      <div class="d-flex flex-wrap">
                        <router-link class="btn btn-grey-outline p-0 m-1 d-flex" :to="{name: 'MutationReport', query:{pango: lineage}}" v-for="(lineage, lIdx) in report.lineages" :key="lIdx">
                          <div class="mx-1">
                            {{lineage}}
                          </div>
                          <div class="VOC-badge" v-if="curatedVOC.includes(lineage.toLowerCase())">VOC</div>
                          <div class="VOI-badge" v-if="curatedVOI.includes(lineage.toLowerCase())">VOI</div>
                        </router-link>
                      </div>
                    </td>

                    <td>
                      {{ report.lineage_count }}
                    </td>

                    <td>
                      <a :href="report.aquaria" v-if="report.aquaria" target="_blank" class="line-height-1 d-flex">

                        {{report.mutation_name}} 3D structures
                        <img src="@/assets/resources/aquaria.svg" style="width: 35px" class="ml-2"/>
""                      </a>
                    </td>
                  </tr>

                </template>
              </tbody>
            </table>

            <div class="mt-2 d-flex justify-content-between align-items-center">
              <div class="flex-shrink-0">
                <sup class="text-muted mr-1">**</sup>
                <small class="text-muted">Lineages with the mutation in at least {{charMutThreshold}} of sequences
                </small>
              </div>

              <DownloadReportData :data="group.values" dataType="Curated Mutation List" reportType="curated-list" :downloadLabel="`${group.id} list`" :numSvgs="1000" class="mt-3" />
            </div>
          </template>
          <div class="d-flex align-items-center my-3" v-else>
            <h5 class="text-muted m-0">No {{group.key}} reports found</h5>
            <form autocomplete="off" class="ml-3 fa-sm" @submit.prevent="onEnter" style="width:250px">
              <div class="input-group">
                <input :id="'sBar-clear-mut' + i" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" @input="debounceSearch" />
                <div class="input-group-prepend">
                  <span class="input-group-text text-muted border-0" id="sb">
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
              </div>
            </form>

            <button class="btn btn-grey-outline py-1 m-0 ml-4" @click="clearFilters">clear filters</button>
          </div>

        </div>
      </template>
    </section>

    <ReportAcknowledgements class="border-top pt-3" />
  </div>
</div>
</template>

<script>
import Vue from "vue";

// import ReportLogos from "@/components/ReportLogos.vue";
import ReportCard from "@/components/ReportCard.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import MutationHeatmap from "@/components/MutationHeatmap.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";
import Warning from "@/components/Warning.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";


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
  faSpinner,
  faInfoCircle,
  faSearch,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faInfoCircle, faSearch, faExclamationCircle);

import {
  mapState
} from "vuex";

import store from "@/store";

import {
  format
} from "d3";

import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";

import {
  getReportList,
  getSequenceCount,
  getCuratedMutations,
  getBadMutations
} from "@/api/genomics.js";

export default {
  name: "SituationReports",
  props: {
    voc: [Array, String],
    voi: [Array, String],
    moc: [Array, String],
    moi: [Array, String],
    name: String
  },
  components: {
    DownloadReportData,
    CustomReportForm,
    ReportAcknowledgements,
    FontAwesomeIcon,
    MutationHeatmap,
    Warning
  },
  computed: {
    ...mapState("admin", ["reportloading"]),
    ...mapState("genomics", ["characteristicThreshold"]),
    charMutThreshold() {
      return (format(".0%")(this.characteristicThreshold))
    }
  },
  methods: {
    clearFilters() {
      this.selectedVOC = [];
      this.selectedVOI = [];
      this.selectedMOC = [];
      this.selectedMOI = [];
      this.searchInput = null;
      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: true
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      })
    },
    getReportType(group) {
      const vfiltered = this.variantTypes.filter(d => d.label == group);
      const mfiltered = this.mutationTypes.filter(d => d.label == group);
      if (vfiltered.length == 1) {
        return (vfiltered[0].def)
      }
      if (mfiltered.length == 1) {
        return (mfiltered[0].def)
      }
      return (null)
    },
    filterVOC(disableScroll = true) {
      // cleanup empty values
      if (!this.selectedVOC[0]) {
        this.selectedVOC = [];
      }
      if (!this.selectedVOI[0]) {
        this.selectedVOI = [];
      }

      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: disableScroll
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      });
    },
    filterMOC(disableScroll = true) {
      // cleanup empty values
      if (!this.selectedMOC[0]) {
        this.selectedMOC = [];
      }
      if (!this.selectedMOI[0]) {
        this.selectedMOI = [];
      }

      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: disableScroll
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      });
    },
    route2Filtered(org, type) {
      if (type == "VOC") {
        this.selectedVOC = [org];
        this.selectedVOI = [];
        this.selectedMOC = [];
        this.selectedMOI = [];
      }
      if (type == "VOI" || type == "VUI") {
        this.selectedVOI = [org];
        this.selectedVOC = [];
        this.selectedMOC = [];
        this.selectedMOI = [];
      }

      this.filterVOC(false);
    },
    route2OutbreakClass(anchorID) {
      // clear anything that's selected
      this.clearFilters();
      this.$router.push({
        name: "SituationReports",
        query: {},
        hash: `#${anchorID}`
      })
    },
    filterName() {
      this.filterReports();

      this.$router.push({
        name: "SituationReports",
        params: {
          disableScroll: true
        },
        query: {
          voc: this.selectedVOC,
          voi: this.selectedVOI,
          moc: this.selectedMOC,
          moi: this.selectedMOI,
          name: this.searchInput
        }
      })
    },
    filterReports() {
      this.filteredReports = cloneDeep(this.reports);
      this.filteredMutations = cloneDeep(this.mutationReports);

      if (this.selectedVOC.length || this.selectedVOI.length || this.searchInput) {
        // filter the selected VOC/VOI reports
        this.filteredReports.forEach(group => {
          let filtered = [];
          group.values.forEach(report => {
            // FILTER OUTBREAK CLASSIFICATIONS
            if (report.variantType == "Variant of Concern" && this.selectedVOC.includes("outbreak") ||
              report.variantType == "Variant of Interest" && this.selectedVOI.includes("outbreak")) {
              // Filter by outbreak VOC/VOI + name
              if (this.searchInput) {
                if (report.searchTerms.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase()))) {
                  filtered.push(report);
                }
              } else {
                // just add the outbreak VOC/VOI
                filtered.push(report)
              }

              // FILTER BY CLASSICATIONS
            } else if (report.classifications && (this.selectedVOC.length || this.selectedVOI.length)) {
              // filter name filters
              if (this.searchInput) {
                if (report.searchTerms.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase())) &&
                  (report.classifications.filter(x => x.variantType == "VOC" && this.selectedVOC.includes(x.author)).length ||
                    report.classifications.filter(x => (x.variantType == "VOI" || x.variantType == "VUI") &&
                      this.selectedVOI.includes(x.author)).length)) {
                  filtered.push(report);
                }
              } else {
                // filter only the classifications
                if (report.classifications.filter(x => x.variantType == "VOC" &&
                    this.selectedVOC.includes(x.author)).length ||
                  report.classifications.filter(x => (x.variantType == "VOI" || x.variantType == "VUI") && this.selectedVOI
                    .includes(x
                      .author))
                  .length) {
                  filtered.push(report);
                }
              }
            } else {
              // no report classifications; just filter by name
              if (report.searchTerms.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase()))) {
                filtered.push(report);
              }
            }
          })

          group.values = filtered;
        })
      }

      // filter mutation reports
      if (this.selectedMOC.length || this.selectedMOI.length || this.searchInput) {
        if (this.searchInput) {
          this.filteredMutations.forEach(group => {
            let mutFiltered = [];
            group.values.forEach(report => {
              if (report.mutation_name.toLowerCase().includes(this.searchInput.toLowerCase()) || report.lineages.some(x => x.toLowerCase().includes(this.searchInput.toLowerCase()))) {
                mutFiltered.push(report);
              }
            })
            group.values = mutFiltered;

            if (this.selectedMOC.length || this.selectedMOI.length) {
              // filter MOC
              if (!this.selectedMOC.includes("outbreak")) {
                if (group.key == "Mutation of Concern") {
                  group.values = [];
                }
              }

              // filter MOI
              if (!this.selectedMOI.includes("outbreak")) {
                if (group.key == "Mutation of Interest") {
                  group.values = [];
                }
              }
            }
          })
        } else {
          this.filteredMutations.forEach(group => {
            // filter MOC
            if (!this.selectedMOC.includes("outbreak")) {
              if (group.key == "Mutation of Concern") {
                group.values = [];
              }
            }

            // filter MOI
            if (!this.selectedMOI.includes("outbreak")) {
              if (group.key == "Mutation of Interest") {
                group.values = [];
              }
            }
          })
        }
      }

      // MOC || MOI selected but not VOC / VOI
      if ((this.selectedMOC.length || this.selectedMOI.length) && !this.selectedVOC.length && !this.selectedVOI.length) {
        this.filteredReports.forEach(group => {
          group.values = [];
        })
      }

      // VOC || VOI selected but not MOC / MOI
      if ((this.selectedVOC.length || this.selectedVOI.length) && !this.selectedMOC.length && !this.selectedMOI.length) {
        this.filteredMutations.forEach(group => {
          group.values = [];
        })
      }
    },
    viewSublineages(report) {
      report.showSublineages = true;
    },
    anchorLink(link) {
      return (link.replace(/\./g, "_"))
    },
    getCuratedMutations() {
      store.commit("admin/setReportLoading", true);
      this.curatedMutationsSubscription = getCuratedMutations(this.$genomicsurl, this.characteristicThreshold).subscribe(results => {
        this.curatedVOC = this.reports.filter(d => d.id === "voc")[0]["values"].flatMap(d => d.pango_descendants).map(d => d.toLowerCase())
        this.curatedVOI = this.reports.filter(d => d.id === "voi")[0]["values"].flatMap(d => d.pango_descendants).map(d => d.toLowerCase());
        this.mutationReports = results;
        store.commit("admin/setReportLoading", false);
        this.filterReports();
      })
    }
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      curatedSubscription: null,
      totalSubscription: null,
      lastUpdated: null,
      total: null,
      reports: null,
      mutationReports: [],
      filteredReports: null,
      filteredMutations: [],
      sublineageMax: 5,
      variantTypes: [{
          id: "VOC",
          label: "Variant of Concern",
          def: "Variants with increased transmissibility, virulence, and/or decreased diagnostic, therapeutic, or vaccine efficacy"
        },
        {
          id: "VOI",
          label: "Variant of Interest",
          def: "Variants with mutations suspected or confirmed to cause a change in transmissibility, virulence, or diagnostic / therapeutic / vaccine efficacy, <span class='text-underline'>plus</span> community transmission, a cluster of cases, or detection in multiple countries"
        },
        {
          id: "VUM",
          label: "Variant Under Monitoring",
          def: "Variants with mutations suspected to cause a change in transmissibility, virulence, or diagnostic / therapeutic / vaccine efficacy"
        },
        {
          id: "de-escalated",
          label: "De-escalated Variant",
          def: "These former VOCs and/or VOIs have been de-escalated by public health agencies based on at least one the following criteria: (1) the variant is no longer circulating, (2) the variant has been circulating for a long time without any impact on the overall epidemiological situation, (3) scientific evidence demonstrates that the variant is not associated with any concerning properties"
        }
      ],
      mutationTypes: [{
          id: "MOC",
          label: "Mutation of Concern",
          def: "Mutations with evidence of increasing transmissibility or virulence or decreasing therapeutic/vaccine efficacy. <span class='text-underline'>However</span>, the phenotype of a variant depends on <b>all</b> its mutations, not any one particular mutation."
        },
        {
          id: "MOI",
          label: "Mutation of Interest",
          def: "Mutations suspected of causing a change in transmissibility, virulence, or therapeutic/vaccine efficacy. <span class='text-underline'>However</span>, the phenotype of a variant depends on <b>all</b> its mutations, not any one particular mutation."
        }
      ],
      curatedVOC: null,
      curatedVOI: null,
      curatedMOC: null,
      curatedMOI: null,
      curatorOpts: [{
          id: "outbreak",
          label: "outbreak.info",
          src: "icon-01.svg"
        }, {
          id: "CDC",
          label: "CDC",
          src: "resources/cdc-logo.svg"
        }, {
          id: "ECDC",
          label: "ECDC",
          src: "resources/ecdc-logo.png"
        },
        {
          id: "PHE",
          label: "Public Health England",
          src: "resources/PHE-logo-square.png"
        }, {
          id: "WHO",
          label: "WHO",
          src: "resources/who-emblem.svg"
        }
      ],
      searchInput: "",
      selectedVOC: [],
      selectedVOI: [],
      selectedMOC: [],
      selectedMOI: []
    }
  },
  mounted() {
    this.selectedVOC = this.voc ? typeof(this.voc) == "string" ? [this.voc] : this.voc : [];
    this.selectedVOI = this.voi ? typeof(this.voi) == "string" ? [this.voi] : this.voi : [];
    this.selectedMOC = this.moc ? typeof(this.moc) == "string" ? [this.moc] : this.moc : [];
    this.selectedMOI = this.moi ? typeof(this.moi) == "string" ? [this.moi] : this.moi : [];
    this.searchInput = this.name;

    const ofInterest = getBadMutations(true);
    this.curatedMOC = ofInterest.moc;
    this.curatedMOI = ofInterest.moi;

    this.curatedSubscription = getReportList(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      this.reports = results.md;
      this.filterReports();
    })

    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, true).subscribe(total => {
      this.total = total;
    })

  },
  created: function() {
    this.debounceSearch = debounce(this.filterName, 250);
  },
  updated() {
    tippy(".tracked-variant-badge", {
      content: "Loading...",
      maxWidth: "250px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      allowHTML: true,
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy(".tracked-variant-report", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      allowHTML: true,
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  },
  beforeDestroyed() {
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }

    if (this.curatedMutationsSubscription) {
      this.curatedMutationsSubscription.unsubscribe();
    }

    if (this.totalSubscription) {
      this.totalSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

$mutation-width: 275px;
.mutation-name {
    flex: 0 0 $mutation-width;
    width: $mutation-width;
    // flex-basis: $mutation-width !important;
    // flex-grow: 0 !important;
    // flex-shrink: 0 !important;
    // width: $mutation-width;
}

.mutation-map {
    min-width: 0;
}

.bg-image {
    width: 16%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: -1;
}

.font-size-large {
    font-size: large;
}

td {
    padding: 0.5rem 0.75rem;
}

th {
    padding: 0.25rem 0.5rem;
    font-weight: 400;
    text-align: center;
}

.checkbook {
    background: lighten($base-grey,70%);
}

$voc-height: 20px;

.variant-logo {
    height: $voc-height;
}

.tracked-variant-badge {
    color: white;
    font-weight: 700;
    font-size: $voc-height * 0.75;
    display: flex;
    align-items: center;
    justify-content: center;
    height: $voc-height;
    line-height: $voc-height;
    padding: 0 0.25rem;
    text-align: center;
    border-radius: 0.25rem;
}

.MOC-logo,
.VOC-logo {
    // border: 2px solid $publication-color;
    // color: $publication-color;
    background: $publication-color;
}

.VOC-bg {
    background: lighten($publication-color, 33%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $publication-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.MOI-logo,
.VOI-logo,
.VUI-logo {
    background: $website-color;
    // border: 2px solid $website-color;
    // color: $website-color;
    // border-left: 4px solid lighten($website-color, 23%);
}

.VOC-badge,
.VOI-badge {
    color: white;
    border-radius: 0 3px 3px 0;
    padding: 0 0.25rem;
}

.VOC-badge {
    background: $publication-color;
    border-left: 4px solid lighten($publication-color, 20%);
}

.VOI-badge {
    background: $website-color;
    border-left: 4px solid lighten($website-color, 23%);
}

.VOI-bg {
    background: lighten($website-color, 37%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $website-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

$vum-color: #edc949;
.VUM-logo {
    background: lighten($vum-color, 20%);
    color: darken($vum-color, 20%);
    // border-left: 4px solid lighten($vum-color, 0%);
}

.VUM-bg {
    background: lighten($vum-color, 33%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $vum-color !important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

$de-escalated: #bab0ab;
.de-escalated-logo {
    background: lighten($de-escalated, 18%);
    color: darken($de-escalated, 20%);
    height: 2.5rem;
}

.de-escalated-bg {
    background: lighten($de-escalated, 23%);
    padding: 0 !important;
    & .border-inset {
        border-left: 4px solid $de-escalated!important;
        padding: 0 0.25rem 0 0.5rem;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.none-logo {
    background: #DDD;
    color: #888;
    height: $voc-height;
    border-left: 4px solid #BBB;
    padding: 0 0.25rem;
    font-weight: 400;
}

.variant-logo-large {
    height: $voc-height * 1.0;
    font-size: $voc-height * 1.0 * 0.75;
}

.text-size-xs {
    font-size: x-small;
}

.opacity-0 {
    opacity: 0;
}

.bordered td,
.bordered th {
    padding: 0.25rem 0.5rem;
    text-align: center;
    line-height: 1em;
}

.bordered td {
    border: 1px solid #dee2e6;
    width: 95px;
    height: 10px;
}

.my-10 {
    margin-bottom: 6rem;
    margin-top: 6rem;
}

.sublineages {
    max-width: 500px;
}

.opacity-75 {
  opacity: 0.75 !important;
}
.st-rep-table{
  display: block;
  overflow-x: auto;
    width: 100%;
}
</style>
