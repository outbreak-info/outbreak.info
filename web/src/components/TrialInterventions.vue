<template>
  <div>
    <!-- intervention overview -->
    <div v-if="data.studyDesign || data.armGroup" class="mb-3">
      <TrialType :design="data.studyDesign" :arms="data.interventions" />
    </div>

    <!-- arms -->
    <div v-if="data.armGroup" id="study-arms">
      <div v-for="(arm, idx) in data.armGroup" :key="idx" class="mb-4">
        <!-- name -->
        <div class="uppercase orange-title">
          Arm {{ idx + 1 }}: {{ arm.name }}
        </div>
        <div class="">
          <!-- role -->
          <div class="">
            Role:
            <span v-if="arm.role" class="text-dark">{{ arm.role }}</span>
            <span v-else><small>not specified</small></span>
          </div>

          <!-- description -->
          <div
            v-if="arm.description"
            class="text-dark mt-2 mb-1"
            v-html="arm.description"
          />

          <!-- interventions -->
          <div
            v-for="(intervention, iIdx) in arm.intervention"
            :key="iIdx"
            class="ml-4"
          >
            <small class="uppercase bright">
              <span class="mr-2">Intervention {{ iIdx + 1 }}:</span>
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
              <SearchLink
                :data="[intervention.name]"
                filterField="@type:ClinicalTrial"
                tooltipLabel="trials"
                class="bright ml-1"
              />
            </small>
            <!-- intervention type -->
            <div v-if="intervention.category">
              Category:
              <span class="text-dark">{{ intervention.category }}</span>
            </div>
            <!-- intervention description -->
            <div
              v-if="intervention.description"
              class="text-dark mb-1"
              v-html="intervention.description"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const TrialType = lazyLoad('TrialType');
const SearchLink = lazyLoad('SearchLink');

const props = defineProps({
  data: Object,
});
</script>

<style lang="scss" scoped>
.bright {
  color: saturate($clinical-trial-color, 20%);
}
</style>
