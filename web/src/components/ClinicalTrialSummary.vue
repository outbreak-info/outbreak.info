<template>
<div>
  <div class="row d-flex align-items-end">


  <!-- clinical trial phase -->
  <div v-if="data.studyDesign && data.studyDesign.phaseNumber" class="col-sm-3">
    <TrialPhase :phases="data.studyDesign.phaseNumber" />
  </div>
  <!-- interventions -->
  <div v-if="data.studyDesign || data.armGroup" class="col-sm-9 mb-1">
    <TrialType :design="data.studyDesign" :arms="data.armGroup" />
  </div>
</div>

  <!-- clinical trial status -->
  <div v-if="data.studyStatus">
    <TrialStatus :status="data.studyStatus" :locations="data.studyLocation" />
  </div>

</div>
</template>

<script>
// import {
//   timeFormat,
//   timeParse
// } from "d3";

import TrialPhase from "@/components/TrialPhase.vue";
import TrialStatus from "@/components/TrialStatus.vue";
import TrialType from "@/components/TrialType.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "ClinicalTrialSummary",
  props: {
    data: Object
  },
  components: {
    TrialPhase,
    TrialStatus,
    TrialType,
  },

  mounted() {
    console.log(this.data)
  },

  data() {
    return {}
  }
};
</script>

<style lang="scss" scoped>
</style>
