<template>
  <div class="mt-2">
    <!-- gender -->
    <div id="gender-eligiblity">
      Gender:
      <span class="ml-2">
        <template v-if="inclFemale || inclFemale === false">
          <font-awesome-icon
            class="bright"
            :icon="['far', 'check-square']"
            v-if="inclFemale"
          />
          <font-awesome-icon :icon="['far', 'square']" v-else />
          <font-awesome-icon
            :icon="['fas', 'venus']"
            class="ml-2 mr-4 icon-2x"
            :class="{ bright: inclFemale }"
          />
        </template>
        <template v-if="inclMale || inclMale === false">
          <font-awesome-icon
            class="bright"
            :icon="['far', 'check-square']"
            v-if="inclMale"
          />
          <font-awesome-icon :icon="['far', 'square']" v-else />
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
      <span class="text-dark" v-html="acceptedAges"></span>
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
      <div class="orange-title uppercase">
        Inclusion Criteria
      </div>
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
      <div class="orange-title uppercase">
        Exclusion Criteria
      </div>
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
    <div id="unparsed-criteria" v-if="data.criteriaText">
      <small class="text-muted">
        Think something looks off with the inclusion/exclusion criteria?
        <a @click.prevent="showCriteria = !showCriteria" href="">
          {{ showCriteria ? 'Hide criteria' : 'Show original criteria' }}
          before parsing
        </a>
        <font-awesome-icon
          :icon="['fas', 'angle-double-down']"
          class="mx-1"
          v-if="!showCriteria"
        />
        <font-awesome-icon
          :icon="['fas', 'angle-double-up']"
          class="mx-1"
          v-if="showCriteria"
        />
      </small>

      <div v-if="showCriteria">
        {{ data.criteriaText }}
      </div>
    </div>
  </div>
</template>

<script>
// import SearchLink from "@/components/SearchLink";
//
// // --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faVenus,
  faMars,
  faAngleDoubleDown,
  faAngleDoubleUp,
} from '@fortawesome/free-solid-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';

library.add(
  faCheckSquare,
  faSquare,
  faVenus,
  faMars,
  faAngleDoubleDown,
  faAngleDoubleUp,
);

export default {
  name: 'TrialEligibility',
  props: {
    data: Object,
  },
  components: {
    FontAwesomeIcon,
    // SearchLink
  },
  data() {
    return {
      showCriteria: false,
    };
  },
  computed: {
    inclMale() {
      return this.data.gender
        ? ['all', 'both', 'male'].includes(this.data.gender.toLowerCase())
        : null;
    },
    inclFemale() {
      return this.data.gender
        ? ['all', 'both', 'female'].includes(this.data.gender.toLowerCase())
        : null;
    },
    acceptedAges() {
      if (this.data.minimumAge && this.data.maximumAge) {
        return `${this.data.minimumAge} &minus; ${this.data.maximumAge}`;
      } else if (this.data.minimumAge) {
        return `${this.data.minimumAge} +`;
      } else if (this.data.maximumAge) {
        return `0 &minus; ${this.data.maximumAge}`;
      } else {
        return 'not specified';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-2x {
  font-size: 18px;
}

.bright {
  color: saturate($clinical-trial-color, 20%);
}
</style>
