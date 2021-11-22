<template>
<div class="mr-5">
  <!-- design -->
  <div id="design" class="text-left border-top border-bottom text-muted py-3 my-3">
    <h6 class="m-0">Study Design</h6>
    <div v-if="data.studyDesign">
      <TrialDesign :data="data" />
    </div>
    <div v-else>
      <small>not specified</small>
    </div>
  </div>

  <!-- interventions -->
  <div id="interventions" class="text-left border-bottom text-muted pb-3 mb-3">
    <h6 class="m-0">Interventions</h6>
    <div v-if="data.armGroup || data.interventions">
      <TrialInterventions :data="data" />
    </div>
    <div v-else-if="data.interventionText">
      {{data.interventionText}}</div>
    <div v-else>
      <small>not specified</small>
    </div>
  </div>

  <!-- eligibility -->
  <div id="eligibility" class="text-left border-bottom text-muted pb-3 mb-3">
    <h6 class="m-0">Eligibility</h6>
    <div v-if="data.eligibilityCriteria">
      <TrialEligibility :data="data.eligibilityCriteria" />
    </div>
    <div v-else>
      <small>not specified</small>
    </div>
  </div>

  <!-- outcome -->
  <div id="outcome" class="text-left border-bottom text-muted pb-3 mb-3">
    <h6 class="m-0">Outcome</h6>
    <div v-if="data.outcome">
      <TrialOutcome :data="data.outcome" />
    </div>
    <div v-else>
      <small>not specified</small>
    </div>
  </div>

  <!-- status -->
  <div id="status" class="text-left border-bottom text-muted pb-3 mb-3">
    <h6 class="m-0">Status</h6>
    <div v-if="data.studyStatus || data.studyEvent">
      <TrialEvents :data="data" />
    </div>
    <div v-else>
      <small>not specified</small>
    </div>
  </div>

  <!-- publications -->
  <div id="publications" class="text-left border-bottom text-muted pb-3 mb-3">
    <h6 class="m-0 mb-2">Publications</h6>
    <div v-if="(data.citedBy && data.citedBy.length) || citations">
      <template v-if="data.citedBy">
        <div v-for="(citation, idx) in data.citedBy" :key="idx+'by'"  class="text-dark">
          <Citation :data="citation"/>
        </div>
      </template>
      <template v-if="citations">
        <div v-for="(citation, idx) in citations" :key="idx"  class="text-dark">
          <Citation :data="citation"/>
        </div>
      </template>
    </div>
    <div v-else>
      <small>not found</small>
    </div>
  </div>

</div>
</template>


<script>
import { getCTPublications, getResourceMetadata } from "@/api/resources.js";

import TrialDesign from "@/components/TrialDesign.vue";
import TrialInterventions from "@/components/TrialInterventions.vue";
import TrialEligibility from "@/components/TrialEligibility.vue";
import TrialOutcome from "@/components/TrialOutcome.vue";
import TrialEvents from "@/components/TrialEvents.vue";
import Citation from "@/components/Citation.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "ClinicalTrialDescription",
  props: {
    data: Object
  },
  components: {
    TrialDesign,
    TrialInterventions,
    TrialEligibility,
    TrialOutcome,
    TrialEvents,
    Citation
  },
  data() {
    return {
      citations: null,
      citationSubscription: null
    }
  },
  mounted() {
    this.citationSubscription = getCTPublications(this.$resourceurl, this.data["_id"]).subscribe(citations => {
      this.citations = citations.length ? citations : null;
    });
  },
  beforeDestroy() {
    this.citationSubscription.unsubscribe();
  }
};
</script>

<style lang="scss" scoped>
</style>
