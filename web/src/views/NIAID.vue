<template>
<div class="my-5 mx-4">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>


  <h1>NIAID-related resources</h1>
  <p class="text-muted mb-0">
    Find NIAID-related resources, including sources with authors or funding from the National Institute of Allergy and Infectious Diseases
  </p>
  <p class="text-muted font-italic m-0">
    <small>
      Note: only resources which explicitly specify the affiliation of authors or funding sources will be listed.
    </small>
  </p>
  <router-link :to="{name: 'Resources', query: {q: queryString}}" class="btn btn-main-outline router-link no-underline mt-5 mb-3 align-self-center">
    View all results
  </router-link>

  <div class="d-flex justify-content-between align-items-center flex-wrap">
    <div class="d-flex flex-column align-items-center">
      <h3 v-if="counts" class="text-highlight m-0">{{counts.total}} resources</h3>
      <small class="text-muted badge bg-grey__lightest" v-if="counts && counts.dateModified"><i class="far fa-clock"></i> Updated {{ counts.dateModified }}
      </small>

      <CirclePacking class="circle-packing" :data="counts.sources" :query="queryString" v-if="counts" />
    </div>
    <HorizontalBargraph :data="authors" title="Top authors" v-if="authors" />
    <HorizontalBargraph :data="affiliations" title="Author affiliations" v-if="affiliations" />
    <div class="d-flex flex-column">
      <ResourceTimeline :data="dates" v-if="dates" />
    </div>
  </div>
  <WhatsNew :query="queryString" />
</div>
</template>


<script>
import {
  getQuerySummaries,
  getSourceSummary
} from "@/api/resources.js";

import {
  mapState
} from "vuex";


import WhatsNew from "@/components/WhatsNew.vue";
import CirclePacking from "@/components/CirclePacking.vue";
import HorizontalBargraph from "@/components/HorizontalBargraph.vue";
import ResourceTimeline from "@/components/ResourceTimeline.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import * as d3 from "d3";

export default {
  name: "NIAID",
  components: {
    WhatsNew,
    CirclePacking,
    HorizontalBargraph,
    ResourceTimeline
  },
  mounted() {
    this.resultSubscription = getQuerySummaries(this.query, this.$resourceurl).subscribe(results => {
      console.log(results)
      this.results = results;
      this.dates = results[0].facets.date.terms;

      // const keys = results[0]["hits"].flatMap(d => d.keywords)
      // const keywords = d3.nest()
      //   .key(d => d ? d.toLowerCase() : "unknown")
      //   .rollup(values => values.length)
      //   .entries(keys)
      //   .sort((a, b) => b.value - a.value);
      //
      // console.log(keywords);

      this.authors = d3.nest()
        .key(d => d ? d : "unknown")
        .rollup(values => values.length)
        .entries(results[0]["hits"].flatMap(d => d.author).flatMap(d => d.name ? d.name : (d.givenName ? `${d.givenName} ${d.familyName}` : "unknown")))
        .sort((a, b) => b.value - a.value);

      this.affiliations = d3.nest()
        .key(d => d ? d : "unknown")
        .rollup(values => values.length)
        .entries(results[0]["hits"].flatMap(d => d.author).flatMap(d => d.affiliation ? d.affiliation : "unknown").flatMap(d => d.name))
        .sort((a, b) => b.value - a.value);
    });

    this.countSubscription = getSourceSummary(this.$resourceurl, this.queryString).subscribe(results => {
      console.log(results)
      this.counts = results;
    });
  },
  beforeDestroy() {
    this.resultSubscription.unsubscribe();
    this.countSubscription.unsubscribe();
  },
  computed: {
    ...mapState("admin", ["loading"]),
    types: function() {
      return this.results ? this.results.flatMap(d => d.types) : null;
    },
    queryString: function() {
      return this.query.map(d => `"${d.terms.join('" "')}"`)[0];
    }
  },
  data() {
    return {
      resultSubscription: null,
      countSubscription: null,
      counts: null,
      results: null,
      dates: null,
      authors: null,
      affiliations: null,
      query: [{
        terms: ["NIAID", "National Institute of Allergy and Infectious Diseases"]
        // 'sponsor.name:"national institute of allergy and infectious diseases (niaid)"']
        // funding: "Division of Intramural Research, National Institute of Allergy and Infectious Diseases (Division of Intramural Research of the NIAID)", "National Institute of Allergy and Infectious Disease of the National Institutes of Health", "U.S. Department of Health &amp; Human Services | NIH | National Institute of Allergy and Infectious Diseases (NIAID)"
        // "funding.funder.name:NIAID NIH HHS,National Institutes of Health/National Institute Of Allergy and Infectious Diseases (NIH/NIAID)"]
      }]
    }
  }
}
</script>


<style lang="scss" scoped>
.circle-packing {
    margin-top: -50px;
    margin-bottom: -50px;
  }
    </style>
