<template>
  <div class="source my-3 d-flex align-items-center">
    <small
      >Source:
      <span v-for="(source, idx) in filteredSources" :key="idx">
        <a :href="source.url" target="_blank" rel="noreferrer"
          >{{ source.name }} <span v-if="source.scope">({{ source.scope }})</span></a
        >
        <span v-if="idx < filteredSources.length - 1">; </span> </span
      >, updated daily.
      <router-link :to="{ name: 'Sources' }" class="mx-2">Read more</router-link>
    </small>

    <!-- date updated -->
    <DataUpdated />
    <i class="far fa-copy btn ml-3 btn-main-outline" @click="copyPng"></i>
    <DownloadData class="ml-3" id="download-btn" v-if="data" :type="dataType" :figureRef="figureRef" :data="data" :sourceString="sourceString" />

  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { mapState } from "vuex";
import { getPng } from "@/js/get_png.js";
import DownloadData from "@/components/DownloadData.vue";
import DataUpdated from "@/components/DataUpdated.vue";

export default Vue.extend({
  name: "DataSource",
  props: {
    ids: Array,
    data: Array,
    dataType: String,
    figureRef: String
  },
  components: {
    DownloadData,
    DataUpdated
  },
  computed: {
    ...mapState("admin", ["sources"]),
    filteredSources() {
      if (this.ids && this.ids.length) {
        return this.sources.filter(d => this.ids.includes(d.id));
      } else {
        return this.sources;
      }
    },
    sourceString() {
      return(this.filteredSources.map(d => d.scope ? `${d.name} (${d.scope})` : `${d.name}`).join("; ") + ", updated daily")
    }
  },
  data() {
    return {};
  },
  watch: {},
  methods: {
    copyPng(){
      console.log("png");
    const x =  getPng("epi-map-svg");
    console.log(x)
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
