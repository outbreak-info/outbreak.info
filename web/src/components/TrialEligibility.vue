<template>
  <div class="mt-2">
    <!-- gender -->
    <div id="gender-eligiblity">
      Gender:
      <span class="ml-2">
        <template v-if="inclFemale || inclFemale === false">
          <font-awesome-icon
            v-if="inclFemale"
            class="bright"
            :icon="['far', 'check-square']"
          />
          <font-awesome-icon v-else :icon="['far', 'square']" />
          <font-awesome-icon
            :icon="['fas', 'venus']"
            class="ml-2 mr-4 icon-2x"
            :class="{ bright: inclFemale }"
          />
        </template>
        <template v-if="inclMale || inclMale === false">
          <font-awesome-icon
            v-if="inclMale"
            class="bright"
            :icon="['far', 'check-square']"
          />
          <font-awesome-icon v-else :icon="['far', 'square']" />
          <font-awesome-icon
            :icon="['fas', 'mars']"
            class="ml-2 mr-4 icon-2x"
            :class="{ bright: inclMale }"
          />
        </template>
      </span>
    </div>

    <!-- age -->
    <div id="age-eligiblity">
      Age:
      <span class="text-dark" v-html="acceptedAges" />
    </div>

    <!-- healthy volunteers -->
    <div id="healthy-eligiblity">
      <!-- <div id="healthy-eligiblity" v-if="data.healthyVolunteers || data.healthyVolunteers === false"> -->
      Allows healthy volunteers:
      <span class="text-dark">
        {{
          data.healthyVolunteers
            ? 'yes'
            : data.healthyVolunteers === false
            ? 'no'
            : 'not specified'
        }}
      </span>
    </div>

    <!-- inclusionCriteria -->
    <div id="inclusion-eligiblity" class="mt-2">
      <div class="orange-title uppercase">Inclusion Criteria</div>
      <div v-if="data.inclusionCriteria && data.inclusionCriteria.length">
        <ul class="text-dark">
          <li v-for="(criterion, idx) in data.inclusionCriteria" :key="idx">
            {{ criterion }}
          </li>
        </ul>
      </div>
      <div v-else>
        <small>not specified</small>
      </div>
    </div>

    <!-- exclusionCriteria -->
    <div id="exclusion-eligiblity" class="mt-2">
      <div class="orange-title uppercase">Exclusion Criteria</div>
      <div v-if="data.exclusionCriteria && data.exclusionCriteria.length">
        <ul class="text-dark">
          <li v-for="(criterion, idx) in data.exclusionCriteria" :key="idx">
            {{ criterion }}
          </li>
        </ul>
      </div>
      <div v-else>
        <small>not specified</small>
      </div>
    </div>
    <div v-if="data.criteriaText" id="unparsed-criteria">
      <small class="text-muted">
        Think something looks off with the inclusion/exclusion criteria?
        <a href="" @click.prevent="showCriteria = !showCriteria">
          {{ showCriteria ? 'Hide criteria' : 'Show original criteria' }}
          before parsing
        </a>
        <font-awesome-icon
          v-if="!showCriteria"
          :icon="['fas', 'angle-double-down']"
          class="mx-1"
        />
        <font-awesome-icon
          v-if="showCriteria"
          :icon="['fas', 'angle-double-up']"
          class="mx-1"
        />
      </small>

      <div v-if="showCriteria">
        {{ data.criteriaText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  data: Object,
});

let showCriteria = ref(false);

const inclMale = computed(() => {
  return props.data.gender
    ? ['all', 'both', 'male'].includes(props.data.gender.toLowerCase())
    : null;
});

const inclFemale = computed(() => {
  return props.data.gender
    ? ['all', 'both', 'female'].includes(props.data.gender.toLowerCase())
    : null;
});

const acceptedAges = computed(() => {
  if (props.data.minimumAge && props.data.maximumAge) {
    return `${props.data.minimumAge} &minus; ${props.data.maximumAge}`;
  } else if (props.data.minimumAge) {
    return `${props.data.minimumAge} +`;
  } else if (props.data.maximumAge) {
    return `0 &minus; ${props.data.maximumAge}`;
  } else {
    return 'not specified';
  }
});
</script>

<style lang="scss" scoped>
.icon-2x {
  font-size: 18px;
}

.bright {
  color: saturate($clinical-trial-color, 20%);
}
</style>
