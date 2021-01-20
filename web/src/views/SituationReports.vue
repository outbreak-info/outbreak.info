<template>
<div class="container text-left my-5 full">
  <h1 class="m-0">SARS-CoV-2 Mutation Situation Reports</h1>
  <div class="d-flex align-items-center mb-4">
    <div>
      Created by the <a>Andersen Lab</a> at Scripps Research
    </div>
    <div class="logo ml-3">
      <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">
        <img src="@/assets/anderson-logo-light.png" class="w-100" alt="Anderson Lab" />
      </a>
    </div>
  </div>
  <section id="report-list">
    <div class="mutation-group mb-5" v-for="(group, i) in reports" :key="i">
      <h2>{{ group.key }}</h2>
      <div class="report-group mb-3" v-for="(mutation, mIdx) in group.values" :key="mIdx">
        <h5 class="m-0">{{ mutation.key }}</h5>
        <ul class="d-flex flex-column m-0">
          <li v-for="(report, rIdx) in mutation.values" :key="rIdx">
            <router-link :to="{name:'SituationReport', params:{date: report.date, mutation: report.name, url: report.url }}">{{ rIdx === 0 ? `current (${report.date})` : report.date }}</router-link>
          </li>
        </ul>
      </div>
    </div>

  </section>
</div>
</template>

<script>
import Vue from "vue";

import axios from "axios";

import { nest } from "d3";

export default {
  name: "SituationReports",
  data() {
    return {
      reports: null
    }
  },
  mounted() {
    axios.get("https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/metadata.json").then(response => {
      response.data.sort((a,b) => b.date > a.date ? 1 : -1);

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
</style>
