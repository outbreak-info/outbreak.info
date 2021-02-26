<template>
<div>
  <p>
    All SARS-CoV sequences were downloaded from the <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">GISAID Initiative</a> on {{ updated }} and subsequently processed using <a href="https://github.com/andersen-lab/bjorn/" rel="noreferrer" target="_blank">Bjorn</a>, which relies heavily on <a href="https://github.com/lh3/minimap2/" rel="noreferrer" target="_blank">minimap2</a> and <a href="https://github.com/cov-ert/datafunk/" rel="noreferrer" target="_blank">datafunk</a>. <a :href="refSeq.url" target="_blank" rel="noreferrer">{{refSeq.name}}</a> was used as the reference sequence for alignment. PANGO lineage classification for each individual sequence was provided by GISAID. Sequences with collection dates specifying only the year were excluded, while date specifying only the year and month were assumed to have occurred on the 15th of that month.
  </p>
  <p>
    Mutation prevalence was calculated as a ratio of the count of sequences containing a given set of mutations on a day at a particular location (or in all locations) (<b>x</b>) divided by the total sequences on that data in that location
    (<b>n</b>). 95% Confidence Intervals for these prevalences were calculated according to Jeffrey's Interval:
    <span class="code" v-html="'2.5 quantile of	&beta;(x + 0.5, n - x + 0.5)'"></span> to <span class="code" v-html="'97.5 quantile of &beta;(x + 0.5, n - x + 0.5)'"></span>.
  </p>
  <p>
    Characteristic mutations for a lineage were defined as nonsynonymous substitutions or deletions that occurred in > {{charMutThreshold}} of sequences within that lineage.
  </p>
  <p>
    Dates when the lineage, variant, or mutation(s) were first and last found are based on the sample collection date, not the sequencing date or date the it was submitted to GISAID. As a result, this date may differ from when the sample was processed and sequenced, and when the data is released to the public.
  </p>
</div>
</template>

<script lang="js">
import Vue from "vue";

// --- store / Vuex ---
import {
  mapState
} from "vuex";

import {
  getDateUpdated
} from "@/api/genomics.js";

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
      charMutThreshold: "97%",
      updated: null,
      updatedSubscription: null
    }
  },
  mounted() {
    if (this.dateUpdated) {
      this.updated = this.dateUpdated;
    } else {
      this.updatedSubscription = getDateUpdated(this.$genomicsurl).subscribe(result => {
        this.updated = result.dateUpdated;
      })
    }
  },
  destroyed() {
    if (this.updatedSubscription) {
      this.updatedSubscription.unsubscribe();
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
