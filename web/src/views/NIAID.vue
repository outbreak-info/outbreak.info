<template>
<div class="my-5 mx-4">
  <h1>NIAID-related resources</h1>
  <p class="text-muted">
    Find resources with authors or funding from the National Institute of Allergy and Infectious Diseases
  </p>
  <router-link :to="{name: 'Resources', query: {q: queryString}}">View search results</router-link>

  <div class="d-flex justify-content-between">
    <div class="d-flex flex-column">
      <h3 v-if="counts" class="text-highlight m-0 mt-3">{{counts.total}} resources</h3>
      <CirclePacking class="circle-packing" :data="counts.sources" :query="queryString" v-if="counts" />
    </div>
    <div class="d-flex flex-column">
      <ResourceTimeline :data="dates" v-if="dates"/>
    </div>
  </div>

</div>
</template>


<script>
import {
  getQuerySummaries,
  getSourceCounts
} from "@/api/resources.js";

import CirclePacking from "@/components/CirclePacking.vue";
import ResourceTimeline from "@/components/ResourceTimeline.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import * as d3 from "d3";

export default {
  name: "NIAID",
  components: {
    CirclePacking,
    ResourceTimeline
  },
  mounted() {
    this.resultSubscription = getQuerySummaries(this.query, this.$resourceurl).subscribe(results => {
      console.log(results)
      this.results = results;
      this.dates = results[0].facets.datePublished.terms;

      const keys = results[0]["hits"].flatMap(d => d.keywords)
      const keywords = d3.nest()
        .key(d => d ? d.toLowerCase() : "unknown")
        .rollup(values => values.length)
        .entries(keys)
        .sort((a, b) => b.value - a.value);

      console.log(keywords);
      const authors = d3.nest()
        .key(d => d ? d : "unknown")
        .rollup(values => values.length)
        .entries(results[0]["hits"].flatMap(d => d.author).flatMap(d => d.name ? d.name : (d.givenName ? `${d.givenName} ${d.familyName}` : "unknown")))
        .sort((a, b) => b.value - a.value);

      console.log(authors);
      const affiliation = d3.nest()
        .key(d => d ? d : "unknown")
        .rollup(values => values.length)
        .entries(results[0]["hits"].flatMap(d => d.author).flatMap(d => d.affiliation ? d.affiliation : "unknown").flatMap(d => d.name))
        .sort((a, b) => b.value - a.value);

      console.log(affiliation);
    });

    this.countSubscription = getSourceCounts(this.$resourceurl, this.queryString).subscribe(results => {
      console.log(results)
      this.counts = results;
    });
  },
  beforeDestroy() {
    this.resultSubscription.unsubscribe();
    this.countSubscription.unsubscribe();
  },
  computed: {
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
