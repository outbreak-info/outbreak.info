<template>
<div>
  <!-- intervention overview -->
  <div v-if="data.studyDesign || data.armGroup" class="mb-3">
    <TrialType :design="data.studyDesign" :arms="data.interventions" />
  </div>

  <!-- arms -->
  <div id="study-arms" v-if="data.armGroup">
    <div v-for="(arm, idx) in data.armGroup" :key="idx" class="mb-4">
      <!-- name -->
      <div class="uppercase orange-title">Arm {{idx + 1}}: {{arm.name}}</div>
      <div class="">

      <!-- role -->
      <div class="">
        Role: <span class="text-dark" v-if="arm.role">{{arm.role}}</span>
        <span v-else><small>not specified</small></span>
      </div>

      <!-- description -->
      <div v-if="arm.description" v-html="arm.description" class="text-dark mt-2 mb-1">
      </div>

      <!-- interventions -->
      <div v-for="(intervention, iIdx) in arm.intervention" :key="iIdx" class="ml-4">
        <small class="uppercase bright">
          <span class="mr-2">Intervention {{iIdx + 1}}:</span>
          <i class="fas fa-pills bright" v-if="intervention.category == 'drug'"></i>
          <!-- <i class="fas fa-prescription-bottle bright" v-if="intervention.category == 'drug'"></i> -->
          <i class="fas fa-dna bright" v-if="intervention.category == 'genetic'"></i>
          <i class="fas fa-virus bright" v-if="intervention.category == 'biological'"></i>
          <i class="fas fa-mortar-pestle bright" v-if="intervention.category == 'combination product'"></i>
          <i class="fas fa-notes-medical bright" v-if="intervention.category == 'behavioral'"></i>
          <i class="fas fa-tablet-alt bright" v-if="intervention.category == 'device'"></i>
          <!-- <i class="fas fa-laptop-medical bright" v-if="intervention.category == 'device'"></i> -->
          <i class="fas fa-vial bright" v-if="intervention.category == 'diagnostic test'"></i>
          <i class="fas fa-capsules bright" v-if="intervention.category == 'dietary supplement'"></i>
          <i class="fas fa-user-nurse bright" v-if="intervention.category == 'procedure'"></i>
          <i class="fas fa-radiation bright" v-if="intervention.category == 'radiation'"></i>
          <SearchLink :data="[intervention.name]" filterField="@type:ClinicalTrial" tooltipLabel="trials" class="bright ml-1"/>
        </small>
        <!-- intervention type -->
        <div v-if="intervention.category">
          Category: <span class="text-dark">{{intervention.category}}</span>
        </div>
        <!-- intervention description -->
        <div v-if="intervention.description" v-html="intervention.description" class="text-dark mb-1">
        </div>
      </div>

      </div>
    </div>
  </div>
</div>
</template>

<script>
import TrialType from "@/components/TrialType.vue";
import SearchLink from "@/components/SearchLink.vue";

export default {
  name: "TrialInterventions",
  props: {
    data: Object
  },
  components: {
    TrialType,
    SearchLink
  },
  data() {
    return {}
  }
};
</script>

<style lang="scss" scoped>

.bright {
    color: saturate($clinical-trial-color, 20%);
}
</style>
