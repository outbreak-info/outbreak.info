<template>
<div>
  <!-- health condition -->
  <div id="condition" v-if="data.healthCondition">
    {{data.healthCondition.length == 1 ? "Condition:" : "Conditions"}}
    <SearchLink :data="data.studyDesign.healthCondition" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.healthCondition" />

  </div>

  <!-- study type -->
  <div id="study-type" v-if="data.studyDesign && data.studyDesign.studyType">
    Type:
    <SearchLink :data="[data.studyDesign.studyType]" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.studyType" />
  </div>

  <!-- study type -->
  <div id="study-purpose" v-if="data.studyDesign && data.studyDesign.designPrimaryPurpose">
    Primary Purpose:
    <SearchLink :data="[data.studyDesign.designPrimaryPurpose]" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.designPrimaryPurpose" />
  </div>

  <!-- phase -->
  <div id="study-phase" v-if="data.studyDesign && data.studyDesign.phase" class="d-flex flex-wrap align-items-center">
    Phase:
    <TrialPhase :includeLabel="false" :phases="data.studyDesign.phaseNumber" class="ml-2" />
    <SearchLink :data="data.studyDesign.phase" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.phase" />
  </div>


  <!-- model -->
  <div id="study-model" v-if="data.studyDesign && data.studyDesign.designModel">
    Model:
    <SearchLink :data="data.studyDesign.designModel" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.designModel" />
  </div>

  <!-- allocation -->
  <div id="study-allocation" v-if="data.studyDesign && data.studyDesign.designAllocation">
    Participant Allocation:
    <SearchLink :data="[data.studyDesign.designAllocation]" tooltipLabel="trials" filterField="@type:ClinicalTrial" searchField="data.studyDesign.designAllocation" />
  </div>

</div>
</template>

<script>
// import {
//   timeFormat,
//   timeParse
// } from "d3";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import TrialPhase from "@/components/TrialPhase.vue";
import SearchLink from "@/components/SearchLink.vue";

export default {
  name: "TrialDesign",
  props: {
    data: Object
  },
  components: {
    TrialPhase,
    SearchLink
  },
  data() {
    return {}
  }
};
</script>

<style lang="scss" scoped>
</style>
