<template>
  <div class="row" style="min-height: 75vh;">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">How to cite outbreak.info</h1>
        <DataUsage />
        <CiteUs class="mt-3" />
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import CiteUs from "@/components/CiteUs.vue";
import DataUsage from "@/components/DataUsage.vue";

export default Vue.extend({
  name: "Citation",
  components: {
    CiteUs, DataUsage
  }
});
</script>
