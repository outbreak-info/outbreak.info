<template>
<div>
  <!-- SUMMARY VERSION -->
  <div v-if="summary">
    <p>
      All SARS-CoV sequences are downloaded from the <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">GISAID Initiative</a> daily and subsequently processed using <a href="https://github.com/andersen-lab/bjorn/" rel="noreferrer"
        target="_blank">Bjorn</a>, which relies heavily on <a href="https://github.com/lh3/minimap2/" rel="noreferrer" target="_blank">minimap2</a> and <a href="https://github.com/cov-ert/datafunk/" rel="noreferrer" target="_blank">datafunk</a>. <router-link :to="{name: 'SituationReportMethodology'}">View full methods</router-link>
    </p>
  </div>

  <!-- FULL VERSION -->
  <div v-else>
    <div class="d-flex mt-2 mb-3">
      <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} (methods)
      </small>
      <small class="text-muted badge bg-grey__lightest mt-1 ml-3" v-if="lastUpdated">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ updated }} (data)
      </small>
    </div>

    <section class="border-top py-2">
      <h2>Sequencing data</h2>
      <h4 id="pipeline">Sequence alignment</h4>
      <p>
        All SARS-CoV sequences are downloaded from the <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">GISAID Initiative</a> daily and subsequently processed using <a href="https://github.com/andersen-lab/bjorn/" rel="noreferrer"
          target="_blank">Bjorn</a>, which relies heavily on <a href="https://github.com/lh3/minimap2/" rel="noreferrer" target="_blank">minimap2</a> and <a href="https://github.com/cov-ert/datafunk/" rel="noreferrer" target="_blank">datafunk</a>. <a
          :href="refSeq.url" target="_blank" rel="noreferrer">{{refSeq.name}}</a> was used as the reference sequence for alignment.
      </p>

      <h4 id="filters">Data processing</h4>
      <ul>
        <li>
          Sequences with collection dates specifying only the year or dates in the future were excluded, while date specifying only the year and month were assumed to have occurred on the 15th of that month.
        </li>
        <li>
          Sequences with lengths &le; 20,000 base pairs were removed from the analysis.
        </li>
      </ul>


      <h4 id="prevalence">Prevalence calculation</h4>
      <p>
        Mutation prevalence was calculated as a ratio of the count of sequences containing a given set of mutations on a day at a particular location (or in all locations) (<b>x</b>) divided by the total sequences on that data in that location
        (<b>n</b>). 95% Confidence Intervals for these prevalences were calculated according to Jeffrey's Interval:
        <span class="code" v-html="'2.5 quantile of	&beta;(x + 0.5, n - x + 0.5)'"></span> to <span class="code" v-html="'97.5 quantile of &beta;(x + 0.5, n - x + 0.5)'"></span>.
      </p>

      <h4 id="dates">Date reporting</h4>
      <p>
        Dates when the lineage, variant, or mutation(s) were first and last found are based on the sample collection date, not the sequencing date or date the it was submitted to GISAID. As a result, this date may differ from when the sample was
        processed and sequenced, and when the data is released to the public.
      </p>
    </section>

    <section class="border-top border-bottom py-2">
      <h2>Lineages</h2>
      <h4 id="lineages">Lineage assignment</h4>
      <p>
        PANGO lineage classification for each individual sequence was provided by GISAID.
      </p>

      <h4 id="characteristic">Characteristic mutations of a lineage</h4>

      <p>
        Characteristic mutations for a lineage were defined as nonsynonymous substitutions or deletions that occurred in > {{charMutThreshold}} of sequences within that lineage.
      </p>
    </section>


    <Warning class="mt-2" :text="disclaimer" />
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons/faClock";

library.add(faClock);

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
    dateUpdated: String,
    summary: {
      type: Boolean,
      default: false
    }
  },
  components: {
    FontAwesomeIcon
  },
  computed: {
    ...mapState("genomics", ["refSeq"])
  },
  data() {
    return {
      lastUpdated: "15 March 2021",
      charMutThreshold: "97%",
      disclaimer: "SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>",
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
