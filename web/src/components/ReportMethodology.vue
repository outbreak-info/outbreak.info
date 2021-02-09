<template>
<div>
  <p>
    All SARS-CoV sequences were downloaded from the <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">GISAID Initiative</a> on {{ dateUpdated }}, aligned to the reference sequence <a :href="refSeq.url" target="_blank"
      rel="noreferrer">{{refSeq.name}}</a> using <a href="https://github.com/lh3/minimap2/" rel="noreferrer" target="_blank">minimap2</a> and <a href="https://github.com/cov-ert/datafunk/" rel="noreferrer" target="_blank">datafunk</a>, and subsequently processed using <a href="https://github.com/andersen-lab/bjorn/" rel="noreferrer" target="_blank">Bjorn</a>. Sequences with collection dates specifying only the year were excluded, while date specifying only the year and month were assumed to have occured on the 15th of that month.
  </p>
  <p>
    Mutation prevalence was calculated as a ratio of the count of sequences containing a given set of mutations on a day at a particular location (or in all locations) (<b>x</b>) divided by the total sequences on that data in that location
    (<b>n</b>). 95% Confidence Intervals for these prevalences were calculated according to Jeffrey's Interval:
    <span class="code" v-html="'2.5 quantile of	&beta;(x + 0.5, n - x + 0.5)'"></span> to <span class="code" v-html="'97.5 quantile of &beta;(x + 0.5, n - x + 0.5)'"></span>.
  </p>
  <p>
    Characteristic mutations for a lineage were defined as nonsynonymous substitutions or deletions that occured in > {{charMutThreshold}} of sequences within that lineage.
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
  name: "ReportMethodology",
  props: {
    dateUpdated: String
  },
  computed: {
    ...mapState("genomics", ["refSeq"])
  },
  data() {
    return {
      charMutThreshold: "97%"
    }
  }
}
</script>
<style lang = "scss">
.code {
    color: $secondary-color;
    font-family: "monospace";
}
</style>
