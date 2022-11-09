<template>
  <div class="mt-2">
    <!-- health condition -->
    <div v-if="data.healthCondition" id="condition">
      {{ data.healthCondition.length === 1 ? 'Condition:' : 'Conditions' }}
      <SearchLink
        :data="data.healthCondition"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="healthCondition"
      />
    </div>

    <!-- study type -->
    <div v-if="data.studyDesign && data.studyDesign.studyType" id="study-type">
      Type:
      <SearchLink
        :data="[data.studyDesign.studyType]"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="studyDesign.studyType"
      />
    </div>

    <!-- study type -->
    <div
      v-if="data.studyDesign && data.studyDesign.designPrimaryPurpose"
      id="study-purpose"
    >
      Primary Purpose:
      <SearchLink
        :data="[data.studyDesign.designPrimaryPurpose]"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="studyDesign.designPrimaryPurpose"
      />
    </div>

    <!-- phase -->
    <div
      v-if="data.studyDesign && data.studyDesign.phase"
      id="study-phase"
      class="d-flex flex-wrap align-items-center"
    >
      Phase:
      <TrialPhase
        :include-label="false"
        :phases="data.studyDesign.phaseNumber"
        class="ml-2"
      />
      <SearchLink
        :data="data.studyDesign.phase"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="studyDesign.phase"
      />
    </div>

    <!-- model -->
    <div
      v-if="data.studyDesign && data.studyDesign.designModel"
      id="study-model"
    >
      Model:
      <SearchLink
        :data="data.studyDesign.designModel"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="studyDesign.designModel"
      />
    </div>

    <!-- allocation -->
    <div
      v-if="data.studyDesign && data.studyDesign.designAllocation"
      id="study-allocation"
    >
      Participant Allocation:
      <SearchLink
        :data="[data.studyDesign.designAllocation]"
        tooltip-label="trials"
        filter-field="@type:ClinicalTrial"
        search-field="studyDesign.designAllocation"
      />
    </div>
  </div>
</template>

<script>
// import {
//   timeFormat,
//   timeParse
// } from "d3";

import tippy from 'tippy.js';
import 'tippy.js/themes/light.css';

import TrialPhase from '@/components/TrialPhase.vue';
import SearchLink from '@/components/SearchLink.vue';

export default {
  name: 'TrialDesign',
  components: {
    TrialPhase,
    SearchLink,
  },
  props: {
    data: Object,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped></style>
