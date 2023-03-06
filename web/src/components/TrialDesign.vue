<template>
  <div class="mt-2">
    <!-- health condition -->
    <div v-if="data.healthCondition" id="condition">
      {{ data.healthCondition.length === 1 ? 'Condition:' : 'Conditions' }}
      <SearchLink
        :data="data.healthCondition"
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="healthCondition"
      />
    </div>

    <!-- study type -->
    <div v-if="data.studyDesign && data.studyDesign.studyType" id="study-type">
      Type:
      <SearchLink
        :data="[data.studyDesign.studyType]"
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="studyDesign.studyType"
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
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="studyDesign.designPrimaryPurpose"
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
        :includeLabel="false"
        :phases="data.studyDesign.phaseNumber"
        class="ml-2"
      />
      <SearchLink
        :data="data.studyDesign.phase"
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="studyDesign.phase"
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
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="studyDesign.designModel"
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
        tooltipLabel="trials"
        filterField="@type:ClinicalTrial"
        searchField="studyDesign.designAllocation"
      />
    </div>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

const TrialPhase = lazyLoad('TrialPhase');
const SearchLink = lazyLoad('SearchLink');

const props = defineProps({
  data: Object,
});
</script>

<style lang="scss" scoped></style>
