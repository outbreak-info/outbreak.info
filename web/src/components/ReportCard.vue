<template>
<div>
  <!-- NAME -->
  <div class="d-flex justify-content-between align-items-center" id="mutation-name">
    <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
      <h3 class="m-0 pb-1 mr-3 underline-hover"><b>{{ report.mutation_name }}</b></h3>
    </router-link>
    <small v-if="report.location_first_identified"><em>first identified in <b>{{ report.location_first_identified }}</b></em></small>

    <div class="d-flex flex-column align-items-center">
      <router-link :to="{ hash: '#voc', params: {} }" class="tracked-variant-badge voc-logo pointer" v-if="report.variantType == 'Variant of Concern'" data-tippy-info="Show outbreak.info Variants of Concern">
        <img src="@/assets/icon-01.svg" class="variant-logo" />
        <span class="ml-2">VOC</span>
      </router-link>
      <router-link :to="{ hash: '#voi', params: {} }" class="tracked-variant-badge voi-logo pointer" v-if="report.variantType == 'Variant of Interest'" data-tippy-info="Show outbreak.info Variants of Interest">
        <img src="@/assets/icon-01.svg" class="variant-logo" />
        <span class="ml-2">VOI</span>
      </router-link>
      <small>{{ report.dateModified }}
      </small>
    </div>
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

  <!-- VOC / VOIs badges -->

  <div class="d-flex flex-wrap align-items-center mt-2 pt-3 border-top">
    <div v-for="(curated, cIdx) in report.classifications" :key="cIdx">
      <div class="d-flex flex-column align-items-center mr-3">
        <div class="tracked-variant-badge" :class="[
		     curated.variantType == 'VOC' ? 'voc-logo' : 'voi-logo',
		     ]">
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

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "ReportCard",
  props: {
    report: Object
  },
  mounted() {
        tippy(".voc-logo", {
          content: "Loading...",
          maxWidth: "200px",
          placement: "bottom",
          animation: "fade",
          theme: "light",
          onShow(instance) {
            let info = instance.reference.dataset.tippyInfo;
            instance.setContent(info);
          }
        });
        tippy(".voi-logo", {
          content: "Loading...",
          maxWidth: "200px",
          placement: "bottom",
          animation: "fade",
          theme: "light",
          onShow(instance) {
            let info = instance.reference.dataset.tippyInfo;
            instance.setContent(info);
          }
        });
  }
}
  </script>

  <style lang="scss">
  $voc-height: 20px;

  .variant-logo {
      height: $voc-height;
  }

  .variant-logo-large {
      height: $voc-height * 1.25;
  }

  .tracked-variant-badge {
      color: white;
      font-weight: 700;
      font-size: $voc-height * 0.75;
      display: flex;
      align-items: center;
      padding: 0.25rem 0.5rem 0.25rem 0.35rem;
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
