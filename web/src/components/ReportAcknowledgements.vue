<template>
<div class="text-left my-4">
  <small>
    <div>
      We would like to thank the GISAID Initiative and are grateful to all of the data contributors, i.e.the Authors, the Originating laboratories responsible for obtaining the specimens, and the Submitting laboratories for generating the genetic
      sequence andmetadata and sharing via the GISAID Initiative, on which this research is based. GISAID data provided on this website are subject to GISAID’s <a href="https://www.gisaid.org/registration/terms-of-use/" target="_blank">Terms and
        Conditions</a>.
    </div>
    <div class="my-2">
      Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy: GISAID’s innovative contribution to global health. <em>Global Challenges</em>, 1:33-46. DOI: <a href="http://dx.doi.org/10.1002/gch2.1018"
        target="_blank">10.1002/gch2.1018</a> PMCID: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/" target="_blank">31565258</a>
    </div>
    <div class="my-4" v-if="funding">
      This work was supported by the <span v-for="(grant, idx) in funding" :key="idx">
        <span v-if="grant.funder.name">{{ grant.funder.name }}</span> ({{ grant.identifier }})<span v-if="idx < funding.length - 2">, </span>
        <span v-if="idx == funding.length - 2">, and </span>
      </span>.
    </div>
  </small>
</div>
</template>


<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "ReportAcknowledgements",
  computed: {
    ...mapState("admin", ["funding"])
  }
})
</script>
