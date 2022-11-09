<template>
  <div class="d-flex flex-wrap my-2">
    <div v-if="design && design.studyType" class="accent mr-2">
      {{ design.studyType }}
    </div>
    <div v-for="(intervention, key) in arms" :key="key" class="text-dark mr-3">
      <font-awesome-icon
        v-if="intervention.category === 'drug'"
        class="bright"
        :icon="['fas', 'pills']"
      />
      <!-- <i class="fas fa-prescription-bottle bright" v-if="intervention.category == 'drug'" /> -->
      <font-awesome-icon
        v-if="intervention.category === 'genetic'"
        class="bright"
        :icon="['fas', 'dna']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'biological'"
        class="bright"
        :icon="['fas', 'virus']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'combination product'"
        class="bright"
        :icon="['fas', 'mortar-pestle']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'behavioral'"
        class="bright"
        :icon="['fas', 'notes-medical']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'device'"
        class="bright"
        :icon="['fas', 'tablet-alt']"
      />
      <!-- <i class="fas fa-laptop-medical bright" v-if="intervention.category == 'device'" /> -->
      <font-awesome-icon
        v-if="intervention.category === 'diagnostic test'"
        class="bright"
        :icon="['fas', 'vial']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'dietary supplement'"
        class="bright"
        :icon="['fas', 'capsules']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'procedure'"
        class="bright"
        :icon="['fas', 'user-nurse']"
      />
      <font-awesome-icon
        v-if="intervention.category === 'radiation'"
        class="bright"
        :icon="['fas', 'radiation']"
      />
      {{ intervention.name }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
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
  faRadiation,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faPills,
  faDna,
  faVirus,
  faMortarPestle,
  faNotesMedical,
  faTabletAlt,
  faVial,
  faCapsules,
  faUserNurse,
  faRadiation,
);

export default Vue.extend({
  name: 'TrialType',
  components: { FontAwesomeIcon },
  props: {
    design: Object,
    arms: Array,
  },
  data() {
    return {
      phaseWidth: 37,
      triangleWidth: 10,
      allPhases: [1, 2, 3, 4],
      spacer: 7,
      height: 17,
    };
  },
  computed: {
    width() {
      return this.phaseWidth * 5 + this.spacer * 4;
    },
  },
  watch: {},
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
