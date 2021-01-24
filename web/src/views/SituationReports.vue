<template>
<div class="my-5 mx-4 px-4">
  <h1 class="m-0">SARS-CoV-2 Mutation Situation Reports</h1>
  <div class="mb-1">
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="w-75 mt-2 text-left">The <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">Andersen Lab</a> at Scripps Research is tracking the prevalence of several mutations or groups of mutations (lineages) within the
        SARS-CoV-2 genome. Every day,
        we will produce a report describing the current situation, focusing on the United States.</div>
      <!-- <router-link :to="{name:'SituationReport'}" class="btn btn-main-outline mt-3">How to interpret these reports</router-link> -->

      <div class="d-flex w-75 justify-content-between">
        <div class="text-leftd-flex align-items-center my-3">
          Generated using data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
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
      <h2>{{ group.key }} Reports</h2>
      <div class="report-group mb-1" v-for="(mutation, mIdx) in group.values" :key="mIdx">
        <div v-for="(report, rIdx) in mutation.values" :key="rIdx">
          <div class="d-flex align-items-end justify-content-between w-100">
            <template v-if="rIdx === 0">
              <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name, url: report.url }}">
                <!-- <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name.replace(': ', '_').replace(':', '_').replace(' ', '_'), url: report.url }}"> -->
                <h5 class="m-0 pb-1 mutation-name">{{ mutation.key }}</h5>
              </router-link>
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
    <h2>Create custom report</h2>
    <CustomReportForm />
  </section>
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";

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
    CustomReportForm
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

$mutation-width: 130px;
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
</style>
