<template>
<div>
  <!-- header -->
  <section class="d-flex flex-column justify-content-center align-items-center pt-3">
    <a href="https://api.outbreak.info/" alt="outbreak.info API" class="position-relative">
      <img src="@/assets/back-api.png" class="w-100" alt="outbreak-api" />
      <p class="pt-1 m-0 align-items-center position-absolute text-overlay">Access all data in our API</p>
    </a>
  </section>

  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5">
      <div class="container half-page">
        <div class="d-flex align-items-center justify-content-between mb-5">
          <h1>Data Sources</h1>
          <router-link class="btn btn-main" :to="{ name: 'Contributing' }">Contribute data</router-link>
        </div>

        <div class="text-left">
          <h3 id="epidemiology">COVID-19 Cases &amp; Deaths Data</h3>
          <SourceDescription :sources="sources" />
        </div>

        <div class="text-left mt-5">
          <h3 id="geographic" class="pt-4 border-top">Genomic Data</h3>
          <SourceDescription :sources="genomicSources" />
        </div>

        <div class="text-left mt-5">
          <h3 id="geographic" class="pt-4 border-top">Geographic Data</h3>
          <SourceDescription :sources="geoSources" />
        </div>

        <div class="text-left mt-5">
          <div class="mb-3 pt-4 border-top d-flex justify-content-between align-items-center">
            <h3 id="resources" class="">Resources</h3>
            <DownloadData downloadLabel="all resources" type="resources" query="__all__" :api="$resourceurl" />
          </div>

          <div v-for="(resource, idx) in resources" :key="idx" :class="[idx === 0 ? 'mb-5' : 'my-5']">
            <div class="d-flex justify-content-between align-items-center my-2">
              <h4 :id="resource.id">{{ resource.category }}</h4>
              <DownloadData :downloadLabel="`all ${resource.category}`" type="resources" :query="`@type:${resource.id}`" :api="$resourceurl" />
            </div>



            <SourceDescription :sources="resource.sources" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

import SourceDescription from "@/components/SourceDescription.vue";
import DownloadData from "@/components/DownloadData.vue";

export default Vue.extend({
  name: "Sources",
  components: {
    SourceDescription,
    DownloadData
  },
  computed: {
    ...mapState("admin", ["sources", "geoSources", "genomicSources", "resources"])
  }
});
</script>

<style lang="scss" scoped>
.text-overlay {
  bottom: 10px;
  right: 10px;
  color: white;
  font-size: 1.25em;
}
</style>
