<template>
<div class="d-flex flex-wrap my-2">
  <div class="accent mr-2" v-if="design && design.studyType">
    {{ design.studyType }}
  </div>
  <div class="text-dark mr-3" v-for="(intervention, key) in arms" :key="key">
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
    {{ intervention.name }}
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPills, faDna, faVirus, faMortarPestle, faNotesMedical, faTabletAlt, faVial, faCapsules, faUserNurse, faRadiation
} from "@fortawesome/free-solid-svg-icons";

library.add(faPills, faDna, faVirus, faMortarPestle, faNotesMedical, faTabletAlt, faVial, faCapsules, faUserNurse, faRadiation);

export default Vue.extend({
  name: "TrialType",
  props: {
    design: Object,
    arms: Array
  },
  components: { FontAwesomeIcon },
  data() {
    return {
      phaseWidth: 37,
      triangleWidth: 10,
      allPhases: [1, 2, 3, 4],
      spacer: 7,
      height: 17
    };
  },
  watch: {},
  computed: {
    width() {
      return (this.phaseWidth * 5 + this.spacer * 4)
    }
  },
  methods: {},
});
</script>

<style lang="scss" scoped>
.accent {
    font-weight: 700;
    color: darken($clinical-trial-color, 15%);
}

.bright {
    color: saturate($clinical-trial-color, 20%);
}
</style>
