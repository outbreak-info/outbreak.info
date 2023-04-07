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

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  design: Object,
  arms: Array,
});

const phaseWidth = ref(37);
const spacer = ref(7);
const height = ref(17);

const width = computed(() => {
  return phaseWidth.value * 5 + spacer.value * 4;
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
