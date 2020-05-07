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
      <div v-if="data.armGroups || data.interventions">
        <TrialInterventions :data="data" />
      </div>
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

  </div>
</template>


<script>
// import {
//   timeFormat,
//   timeParse
// } from "d3";

import TrialDesign from "@/components/TrialDesign.vue";
import TrialInterventions from "@/components/TrialInterventions.vue";
import TrialEligibility from "@/components/TrialEligibility.vue";
import TrialOutcome from "@/components/TrialOutcome.vue";
import TrialEvents from "@/components/TrialEvents.vue";

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
    TrialEvents
  },
  data() {
    return {}
  }
};
</script>

<style lang="scss" scoped>
</style>
