<template>
<div class="my-5 mx-4">
  <h1 class="m-0">SARS-CoV-2 Mutation Situation Reports</h1>
  <div class="mb-1">
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="w-75 mt-2 text-left">The <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">Andersen Lab</a> at Scripps Research is tracking the prevalence of several mutations or groups of mutations (lineages) within the
        SARS-CoV-2 genome. Every day,
        we will produce a report describing the current situation, focusing on the United States.</div>
      <!-- <router-link :to="{name:'SituationReport'}" class="btn btn-main-outline mt-3">How to interpret these reports</router-link> -->


      <div class="text-left w-75 d-flex align-items-center my-3">
        Generated using data from
        <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/gisaid.png" class="gisaid ml-1" alt="GISAID" />
        </a>
      </div>
    </div>

    <div class="logo-group d-flex align-items-center justify-content-center border-top border-bottom w-100 py-1 my-3">
      <div class="logo mr-4">
        <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">
          <img src="@/assets/anderson-logo-light.png" class="w-100" alt="Anderson Lab" />
        </a>
      </div>

      <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
        <a href="https://cvisb.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/cvisb-logo-light.png" class="w-100" alt="CVISB" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://globalhealth.scripps.edu/" rel="noreferrer" target="_blank">
          <img src="@/assets/global-logo-light.png" class="w-100" alt="SDCGH" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://searchcovid.info/" rel="noreferrer" target="_blank">
          <img src="@/assets/search-logo.png" class="w-100" alt="SEARCH Alliance" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://outbreak.info/" rel="noreferrer" target="_blank">
          <img src="@/assets/logo-full-01.svg" class="w-100" alt="outbreak.info" />
        </a>
      </div>
    </div>
    <div class="d-flex flex-column justify-content-center align-items-center">
      <router-link :to="{name:'SituationReportCaveats'}" class="btn btn-main-outline">How to interpret these reports</router-link>
    </div>


  </div>
  <section id="report-list" class="text-left">
    <div class="mutation-group mb-5" v-for="(group, i) in reports" :key="i">
      <h2>{{ group.key }} Reports</h2>
      <div class="report-group mb-3" v-for="(mutation, mIdx) in group.values" :key="mIdx">
        <div v-for="(report, rIdx) in mutation.values" :key="rIdx">
          <template v-if="rIdx === 0">
            <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name, url: report.url }}">
              <!-- <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name.replace(': ', '_').replace(':', '_').replace(' ', '_'), url: report.url }}"> -->
              <h5 class="m-0">{{ mutation.key }}</h5>
            </router-link>
            <SARSMutationMap :mutationKey="mutation.key"/>
            <router-link :to='{name:"Resources", query:{q: `"${report.name}"`}}' class="ml-3" v-if="report.name === 'B.1.1.7'">
              <small>View {{report.name}} resources</small>
            </router-link>
          </template>
        </div>
        <!-- <span @click="showAll(mutation.key)">view older</span> -->
      </div>
    </div>

  </section>
</div>
</template>

<script>
import Vue from "vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";

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
    SARSMutationMap
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
</style>
