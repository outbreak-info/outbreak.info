<template>
<div class="d-flex flex-wrap my-2">
  <small class="accent mr-2" v-if="design && design.studyType">
    {{ design.studyType }}
  </small>
  <small class="text-dark mr-3" v-for="(intervention, key) in arms" :key="key">
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
    {{ intervention.name }}
  </small>
</div>
</template>

<script lang="js">
import Vue from "vue";

export default Vue.extend({
  name: "TrialType",
  props: {
    design: Object,
    arms: Array
  },
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
