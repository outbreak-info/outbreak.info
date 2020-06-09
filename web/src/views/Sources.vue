<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5">
      <div class="container half-page">
        <div class="d-flex align-items-center justify-content-between mb-5">
          <h1>Data Sources</h1>
          <router-link class="btn btn-main" :to="{ name: 'Contributing' }">Contribute data</router-link>
        </div>

        <div class="text-left">
          <h3 id="epidemiology">Epidemiology Data</h3>
          <SourceDescription :sources="sources" />
        </div>

        <div class="text-left mt-5">
          <h3 id="geographic">Geographic Data</h3>
          <SourceDescription :sources="geoSources" />
        </div>

        <div class="text-left mt-5">
          <h3 id="resources" class="mb-3 border-top pt-4">Resources</h3>
          <div v-for="(resource, idx) in resources" :key="idx" :class="[idx === 0 ? 'mb-5' : 'my-5']">
            <h4>{{ resource.category }}</h4>
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

export default Vue.extend({
  name: "Sources",
  components: {
    SourceDescription
  },
  computed: {
    ...mapState("admin", ["sources", "geoSources", "resources"])
  }
});
</script>
