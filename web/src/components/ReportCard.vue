<template>
<div>
  <!-- NAME -->
  <div class="d-flex justify-content-between" id="mutation-name">
    <h4 class="m-0 pb-1 mr-3 underline-hover"><b>{{ report.mutation_name }}</b></h4>

    <div class="VOC" v-if="report.variantType == 'Variant of Concern'">Variant of Concern</div>
    <div class="VOI" v-if="report.variantType == 'Variant of Interest'">Variant of Interest</div>
    <div class="MOC" v-if="report.variantType == 'Mutation of Concern'">Mutation of Concern</div>
    <div class="MOI" v-if="report.variantType == 'Mutation of Interest'">Mutation of Interest</div>
  </div>
  <p v-if="report.lineages && report.lineages.length" class="text-muted">
    prominent in<router-link :to="{name:'MutationReport', query:{ pango: lineage }}" v-for="(lineage, lIdx) in report.lineages" :key="lIdx">
      <button class="btn btn-main-outline py-0 px-1"><small>{{ lineage }}</small>
      </button>
    </router-link>
  </p>
  <!-- DESCRIPTION -->
  <div class="d-flex flex-column text-dark">
    <small v-if="report.location_first_identified"><em>first identified in {{ report.location_first_identified }}</em></small>
    <small v-if="report.mutation_synonyms && report.mutation_synonyms.length"><span>a.k.a. </span>
      <span v-for="(synonym, sIdx) in report.mutation_synonyms" :key="sIdx">
        <b>{{ synonym }}</b>
        <span v-if="sIdx < report.mutation_synonyms.length - 1">, </span></span>
    </small>
  </div>


</div>
</template>


<script>
import Vue from "vue";

export default {
  name: "ReportCard",
  props: {
    report: Object
  }
}
  </script>
