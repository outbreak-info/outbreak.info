<template>
  <div class="container text-left my-5">
    <h1 class="m-0">
      SARS-CoV-2 (hCov-19) Mutation Situation Methodology
    </h1>
    <section id="methodology" class="">
      <ReportMethodology class="w-75" />
    </section>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import ReportMethodology from "@/components/ReportMethodology";

export default {
  name: "SituationReportMethodology",
  components: {
  ReportMethodology
  }
}
</script>
