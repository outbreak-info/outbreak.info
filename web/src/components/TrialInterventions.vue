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
            <font-awesome-icon class="bright" :icon="['fas', 'pills']" v-if="intervention.category == 'drug'" />
            <!-- <i class="fas fa-prescription-bottle bright" v-if="intervention.category == 'drug'" /> -->
            <font-awesome-icon class="bright" :icon="['fas', 'dna']" v-if="intervention.category == 'genetic'" />
            <font-awesome-icon class="bright" :icon="['fas', 'virus']" v-if="intervention.category == 'biological'" />
            <font-awesome-icon class="bright" :icon="['fas', 'mortar-pestle']" v-if="intervention.category == 'combination product'" />
            <font-awesome-icon class="bright" :icon="['fas', 'notes-medical']" v-if="intervention.category == 'behavioral'" />
            <font-awesome-icon class="bright" :icon="['fas', 'tablet-alt']" v-if="intervention.category == 'device'" />
            <!-- <i class="fas fa-laptop-medical bright" v-if="intervention.category == 'device'" /> -->
            <font-awesome-icon class="bright" :icon="['fas', 'vial']" v-if="intervention.category == 'diagnostic test'" />
            <font-awesome-icon class="bright" :icon="['fas', 'capsules']" v-if="intervention.category == 'dietary supplement'" />
            <font-awesome-icon class="bright" :icon="['fas', 'user-nurse']" v-if="intervention.category == 'procedure'" />
            <font-awesome-icon class="bright" :icon="['fas', 'radiation']" v-if="intervention.category == 'radiation'" />
            <SearchLink :data="[intervention.name]" filterField="@type:ClinicalTrial" tooltipLabel="trials" class="bright ml-1" />
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


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPills,
  faDna,
  faVirus,
  faMortarPestle,
  faNotesMedical,
  faTabletAlt,
  faVial,
  faCapsules,
  faUserNurse,
  faRadiation
} from "@fortawesome/free-solid-svg-icons";

library.add(faPills, faDna, faVirus, faMortarPestle, faNotesMedical, faTabletAlt, faVial, faCapsules, faUserNurse, faRadiation);

export default {
  name: "TrialInterventions",
  props: {
    data: Object
  },
  components: {
    TrialType,
    SearchLink,
    FontAwesomeIcon
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
