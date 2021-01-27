<template>
<div class="my-5 mx-4 px-4">
  <h1 class="m-0">SARS-CoV-2 Mutation Situation Reports</h1>
  <div class="mb-1">
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="w-75 mt-2 text-left">The <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">Andersen Lab</a> at Scripps Research is tracking the prevalence of several lineages or sets of mutations within the
        SARS-CoV-2 genome. Every day,
        we will produce a report describing the current situation, focusing on the United States.</div>
      <!-- <router-link :to="{name:'SituationReport'}" class="btn btn-main-outline mt-3">How to interpret these reports</router-link> -->

      <div class="d-flex w-75 justify-content-between">
        <div class="text-leftd-flex align-items-center my-3">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
          </a>
        </div>
        <router-link :to="{ hash: '#custom-report' }"><button class="btn btn-main">Create custom report</button></router-link>
      </div>
    </div>
    <ReportLogos />

    <div class="d-flex flex-column justify-content-center align-items-center">
      <router-link :to="{name:'SituationReportCaveats'}" class="btn btn-main-outline">How to interpret these reports</router-link>
    </div>


  </div>
  <section id="report-list" class="text-left">
    <div class="mutation-group mb-5" v-for="(group, i) in reports" :key="i">
      <h2 class="mb-0">{{ group.key }} Reports</h2>
      <small class="text-highlight">{{group.key == "Lineage" ? "sequences classified as a particular Pangolin lineage" : "sequences with a particular mutation(s)" }}</small>
      <div class="report-group mb-1 card col-sm-4" v-for="(mutation, mIdx) in group.values" :key="mIdx">
        <div v-for="(report, rIdx) in mutation.values" :key="rIdx">
          <div class="d-flex align-items-end justify-content-between w-100">
            <template v-if="rIdx === 0">
              <div class="d-flex flex-column mr-3 mutation-name">
                <div class="d-flex align-items-center">
                  <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name, url: report.url }}">
                    <h5 class="m-0 pb-1 mr-3"><b>{{ mutation.key }}</b></h5>
                  </router-link>
                  <div class="VOC" v-if="mIdx < 3">Variant of Concern</div>
                  <div class="VOI" v-if="mIdx >= 3">Variant of Interest</div>
                </div>

                <small>a.k.a.: </small>
                <small><em>first identified in</em></small>
              </div>

              <div class="mutation-map flex-grow-1">
                <SARSMutationMap :mutationKey="mutation.key" />
              </div>
            </template>
          </div>
          <router-link :to='{name:"Resources", query:{q: `"${report.name}"`}}' class="ml-3" v-if="rIdx === 0 && report.name === 'B.1.1.7'">
            <small>View {{report.name}} resources</small>
          </router-link>
        </div>

        <!-- <span @click="showAll(mutation.key)">view older</span> -->
      </div>
    </div>
  </section>

  <section id="custom-report" class="text-left">
    <h2 class="m-0 p-0">Create custom report</h2>
    <CustomReportForm />
  </section>

  <ReportAcknowledgements />
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";

import axios from "axios";

import {
  nest
} from "d3";

import {
  orderBy
} from "lodash";

export default {
  name: "SituationReports",
  components: {
    ReportLogos,
    SARSMutationMap,
    CustomReportForm,
    ReportAcknowledgements
  },
  data() {
    return {
      reports: null,
      maxReports: 2
    }
  },
  mounted() {
    axios.get("https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/metadata.json").then(response => {
      // response.data.sort((a,b) => (b.type > a.type ? -1 : 1) || (b.name > a.name ? -1 : 1) || b.date > a.date ? 1 : -1);
      response.data = orderBy(response.data, ["lineage", "name", "date"], ["asc", "asc", "desc"])

      this.reports = nest()
        .key(d => d.type)
        .key(d => d.name)
        .entries(response.data);
    })
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
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

.VOC, .VOI {
    padding: 0.35rem;
    border-radius: 0.25rem;
    border-style: solid;
    border-width: 1px;
    line-height: 1;
    flex-shrink: 0;
    font-size: small;
    font-weight: 700;
}


.VOC {
  background: lighten($publication-color, 35%);
  color: $publication-color;
  border-color: $publication-color;
}

.VOI {
  background: lighten($website-color, 40%);
  color: $website-color;
  border-color: $website-color;
}
</style>
