<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5">
      <div class="container half-page">
        <h1>Contributing Data Resources</h1>
        <p class="text-left">
          Outbreak.info currently contains {{types.length}} types of resources:
          <span v-for="(type, idx) in types" :key="idx">
            <router-link :to="{ name: type.link}">{{type.label}}</router-link>
            <span v-if="idx < types.length - 2">, </span>
            <span v-if="idx == types.length - 2">, and </span>
          </span>.
          <router-link :to="{ name: 'Sources'}" class="text-left">Learn more about our data sources</router-link>.
        </p>
        <p class="text-left">
          Since are resources come from so many different sources, we ensure that their
          metadata (a description of what's contained within the data source) complies to common schema to promote finadbility and interoperabilty.
          Each resource's schema is based on schemas developed by <a href="https://schema.org" target="_blank" rel="noreferrer">schema.org</a>, a project which provides web standards to describe different types of data.
          <a href="https://discovery.biothings.io/view/outbreak" target="_blank" rel="noreferrer">View our schemas</a>.
        </p>

      </div>
    </div>

  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "Contributing",
  components: {},
  computed: {
    ...mapState("admin", ["resources"]),
  },
  data() {
    return ({
      types: [{
          label: "Analyses",
          link: "Analysis"
        },
        {
          label: "Clinical Trials",
          link: "ClinicalTrial"
        },
        {
          label: "Datasets",
          link: "Dataset"
        },
        {
          label: "Protocols",
          link: "Protocol"
        },
        {
          label: "Publications",
          link: "Publication"
        },
      ]
    })
  }
});
</script>
