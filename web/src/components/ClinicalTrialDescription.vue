<template>
  <div class="mr-5">
    <!-- design -->
    <div
      id="design"
      class="text-left border-top border-bottom text-muted py-3 my-3"
    >
      <h6 class="m-0">Study Design</h6>
      <div v-if="data.studyDesign">
        <TrialDesign :data="data" />
      </div>
      <div v-else>
        <small>not specified</small>
      </div>
    </div>

    <!-- interventions -->
    <div
      id="interventions"
      class="text-left border-bottom text-muted pb-3 mb-3"
    >
      <h6 class="m-0">Interventions</h6>
      <div v-if="data.armGroup || data.interventions">
        <TrialInterventions :data="data" />
      </div>
      <div v-else-if="data.interventionText">
        {{ data.interventionText }}
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

    <!-- publications -->
    <div id="publications" class="text-left border-bottom text-muted pb-3 mb-3">
      <h6 class="m-0 mb-2">Publications</h6>
      <div v-if="(data.citedBy && data.citedBy.length) || citations">
        <template v-if="data.citedBy">
          <div
            v-for="(citation, idx) in data.citedBy"
            :key="idx + 'by'"
            class="text-dark"
          >
            <ResourceCitation :data="citation" />
          </div>
        </template>
        <template v-if="citations">
          <div
            v-for="(citation, idx) in citations"
            :key="idx"
            class="text-dark"
          >
            <ResourceCitation :data="citation" />
          </div>
        </template>
      </div>
      <div v-else>
        <small>not found</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { getCTPublications } from '@/api/resources.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

const TrialDesign = lazyLoad('TrialDesign');
const TrialInterventions = lazyLoad('TrialInterventions');
const TrialEligibility = lazyLoad('TrialEligibility');
const TrialOutcome = lazyLoad('TrialOutcome');
const TrialEvents = lazyLoad('TrialEvents');
const ResourceCitation = lazyLoad('ResourceCitation');

const props = defineProps({
  data: Object,
});

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const citations = ref(null);
const citationSubscription = ref(null);

onMounted(() => {
  citationSubscription.value = getCTPublications(
    resourceUrl,
    props.data['_id'],
  ).subscribe((citationResponse) => {
    citations.value = citationResponse.length ? citationResponse : null;
  });
});

onBeforeUnmount(() => {
  if (citationSubscription.value) {
    citationSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped></style>
