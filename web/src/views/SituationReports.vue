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
    <!-- lineage or mutation -->
    <div class="mutation-group mb-5" v-for="(group, i) in reports" :key="i" id="report-group">
      <h2 class="mb-0">{{ group.key | capitalize }} Reports</h2>
      <small class="text-highlight">{{group.key.toLowerCase() == "lineage" ? "sequences classified as a particular Pangolin lineage" : "sequences with a particular mutation(s)" }}</small>

      <!-- report cards (heh) -->
      <div class="row mt-3">
        <div class="col-sm-12 col-md-6 col-lg-6 mb-3 d-flex report-group" v-for="(report, rIdx) in group.values" :key="rIdx" id="mutation-report">
          <div class="w-100 p-3 card">
            <!-- NAME -->
            <div class="d-flex justify-content-between" id="mutation-name">
              <router-link :to="{name:'SituationReport', params:{ mutation: report.identifier }}">
                <h5 class="m-0 pb-1 mr-3"><b>{{ report.mutation_name }}</b></h5>
              </router-link>
              <div class="VOC" v-if="report.variantType == 'Variant of Concern'">Variant of Concern</div>
              <div class="VOI" v-if="report.variantType == 'Variant of Interest'">Variant of Interest</div>
            </div>
            <!-- DESCRIPTION -->
            <small v-if="report.location_first_identified"><em>first identified in {{ report.location_first_identified }}</em></small>
            <small v-if="report.mutation_synonyms"><span>a.k.a. </span>
              <span v-for="(synonym, sIdx) in report.mutation_synonyms" :key="sIdx">
                <b>{{ synonym }}</b>
                <span v-if="sIdx < report.mutation_synonyms.length - 1">, </span></span>
            </small>

            <!-- LINK TO RESOURCES -->
            <router-link :to='{name:"Resources", query:{q: `"${report.mutation_name}"`}}' v-if="report.mutation_name === 'B.1.1.7'">
              <small>View {{report.mutation_name}} resources</small>
            </router-link>

            <!-- MUTATION MAP / DEFINITION -->
            <div class="mutation-map flex-grow-1 px-2">
              <SARSMutationMap :mutationKey="report.mutation_name" />
            </div>
          </div>
        </div>
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
      // reminder: must be the raw verison of the file
      curatedFile: "https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/curated_mutations.json",
      reports: null
    }
  },
  mounted() {
    axios.get(this.curatedFile).then(response => {
      response.data = orderBy(response.data, ["reportType", "variantType", "mutation_name"]);

      this.reports = nest()
        .key(d => d.reportType)
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

.VOC,
.VOI {
    padding: 0.35rem;
    border-radius: 0.25rem;
    border-style: solid;
    border-width: 1px;
    line-height: 1;
    flex-shrink: 0;
    font-size: small;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    // font-weight: 700;
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
