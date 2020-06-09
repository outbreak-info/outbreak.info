<template>
<div class="row" style="min-height: 75vh;">
  <div class="col-sm-12 my-5">

    <div class="container text-left mb-5">
      <h1 class="text-highlight">How to cite outbreak.info</h1>
      <p>
        outbreak.info combines together data and metadata from a large number of <router-link :to="{name: 'Sources'}">data sources</router-link>. Please cite the data sources appropriately.
      </p>
      <DataUsage />
      <CiteUs class="mt-3"/>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import CiteUs from "@/components/CiteUs.vue";

export default Vue.extend({
  name: "Citation",
  components: {
    CiteUs
  }
});
</script>
