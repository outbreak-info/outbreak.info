<template>
  <div>
    <div class="row d-flex align-items-end mt-4">
      <!-- clinical trial phase -->
      <div class="col-sm-12 d-flex align-items-center mb-2">
        <div v-if="data.studyDesign && data.studyDesign.phaseNumber">
          <TrialPhase :phases="data.studyDesign.phaseNumber" />
        </div>
        <!-- interventions -->
        <div v-if="data.studyDesign || data.armGroup" class="ml-5">
          <TrialType :design="data.studyDesign" :arms="data.interventions" />
        </div>
      </div>
    </div>

    <!-- clinical trial status -->
    <div v-if="data.studyStatus">
      <TrialStatus
        :status="data.studyStatus"
        :includeDate="true"
        :locations="data.studyLocation"
      />
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js';

import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

export default {
  name: 'ClinicalTrialSummary',
  components: {
    TrialPhase: lazyLoad('TrialPhase'),
    TrialStatus: lazyLoad('TrialStatus'),
    TrialType: lazyLoad('TrialType'),
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
