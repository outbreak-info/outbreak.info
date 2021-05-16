<template>
<div>
  <!-- NAME -->
  <div class="d-flex justify-content-between" id="mutation-name">
    <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
      <h4 class="m-0 pb-1 mr-3 underline-hover"><b>{{ report.mutation_name }}</b></h4>
    </router-link>
    <small v-if="report.location_first_identified"><em>first identified in <b>{{ report.location_first_identified }}</b></em></small>

    <!-- <div class="VOC" v-if="report.variantType == 'Variant of Concern'">Variant of Concern</div>
    <div class="VOI" v-if="report.variantType == 'Variant of Interest'">Variant of Interest</div>
    <div class="MOC" v-if="report.variantType == 'Mutation of Concern'">Mutation of Concern</div>
    <div class="MOI" v-if="report.variantType == 'Mutation of Interest'">Mutation of Interest</div> -->
  </div>
  <p v-if="report.lineages && report.lineages.length" class="text-muted">
    prominent in<router-link :to="{name:'MutationReport', query:{ pango: lineage }}" v-for="(lineage, lIdx) in report.lineages" :key="lIdx">
      <button class="btn btn-main-outline py-0 px-1"><small>{{ lineage }}</small>
      </button>
    </router-link>
  </p>
  <!-- DESCRIPTION -->
  <div class="d-flex flex-column text-dark">
    <small v-if="report.mutation_synonyms && report.mutation_synonyms.length"><span>a.k.a. </span>
      <span v-for="(synonym, sIdx) in report.mutation_synonyms" :key="sIdx">
        <b>{{ synonym }}</b>
        <span v-if="sIdx < report.mutation_synonyms.length - 1">, </span></span>
    </small>
  </div>

  <!-- VOC / VOIs -->
  <div class="d-flex flex-wrap align-items-center mt-3">
    <div class="d-flex flex-column align-items-center">
      <div class="tracked-variant-badge voc-logo" v-if="report.variantType == 'Variant of Concern'">
        <img src="@/assets/icon-01.svg" class="variant-logo" />
        <span class="ml-2">VOC</span>
      </div>
      <small>{{ report.dateModified }}
      </small>
    </div>

    <div v-for="(curated, cIdx) in report.classifications" :key="cIdx">
      <div class="d-flex flex-column align-items-center ml-3">
        <div class="tracked-variant-badge voc-logo">
          <img src="@/assets/resources/cdc-logo.svg" class="variant-logo" v-if="curated.author == 'CDC'" />
          <img src="@/assets/resources/PHE-logo-square.png" class="variant-logo" v-if="curated.author == 'PHE'" />
          <img src="@/assets/resources/who-emblem.png" class="variant-logo bg-white" v-if="curated.author == 'WHO'" />
	  <img src="@/assets/resources/ecdc-logo.png" class="variant-logo bg-white" v-if="curated.author == 'ECDC'" />
          <span class="ml-2">{{curated.variantType}}</span>
        </div>
        <small>
          <a target="_blank" v-if="curated.dateModified && curated.url" :href="curated.url">{{curated.dateModified}}</a>
          <a target="_blank" v-else-if="curated.url" :href="curated.url">report</a>
          <span v-else>{{ curated.dateModified }}</span>
        </small>
      </div>
    </div>
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

  <style lang="scss">
  $voc-height: 25px;

  .variant-logo {
      height: $voc-height;
  }

  .tracked-variant-badge {
      color: white;
      font-weight: 700;
      font-size: $voc-height * 0.75;
      display: flex;
      align-items: center;
      padding: 0.25rem 0.5rem 0.25rem 0.25rem;
      border-radius: 0.25rem;
  }

  .voc-logo {
      // border: 2px solid $publication-color;
      // color: $publication-color;
      background: $publication-color;
  }

  .voi-logo {
      background: $website-color;
      // border: 2px solid $website-color;
      // color: $website-color;
  }
  </style>
