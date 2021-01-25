<template>
<div>
  <p class="m-0">
    All SARS-CoV sequences were downloaded from the <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">GISAID Initiative</a> on {{ dateUpdated }} and aligned to reference sequence <a :href="refSeq.url" target="_blank"
      rel="noreferrer">{{refSeq.name}}</a>.
  </p>
</div>
</template>

<script lang="js">
import Vue from "vue";

// --- store / Vuex ---
import {
  mapState
} from "vuex";

export default {
  name: "SituationReports",

  computed: {
    ...mapState("genomics", ["refSeq"])
  }
}
</script>
