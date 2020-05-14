<template>
<div class="mt-2">
  <!-- gender -->
  <div id="gender-eligiblity">
    Gender:
    <span class="ml-2">

      <i class="far fa-check-square bright" v-if="inclFemale"></i>
      <i class="far fa-square" v-else></i>
      <i class="fas fa-venus ml-2 mr-4 icon-2x" :class="{'bright': inclFemale}"></i>


      <i class="far fa-check-square bright" v-if="inclMale"></i>
      <i class="far fa-square" v-else></i>
      <i class="fas fa-mars ml-2 icon-2x" :class="{'bright': inclMale}"></i>
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
      {{data.healthyVolunteers ? "yes" : (data.healthyVolunteers === false ? "no" : "not specified")}}
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
          {{criterion}}
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
          {{criterion}}
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
      <a @click.prevent="showCriteria = !showCriteria" href="">{{
            showCriteria ? "Hide criteria" : "Show original criteria"
          }} before parsing </a>
      <i class="fas fa-angle-double-down mx-1" v-if="!showCriteria"></i>
      <i class="fas fa-angle-double-up mx-1" v-if="showCriteria"></i>
    </small>

    <div v-if="showCriteria">
      {{data.criteriaText}}
    </div>
  </div>
</div>
</template>

<script>
// import SearchLink from "@/components/SearchLink";

export default {
  name: "TrialEligibility",
  props: {
    data: Object
  },
  components: {
    // SearchLink
  },
  data() {
    return {
      showCriteria: false
    }
  },
  computed: {
    inclMale() {
      return ["all", "both", "male"].includes(this.data.gender.toLowerCase());
    },
    inclFemale() {
      return ["all", "both", "female"].includes(this.data.gender.toLowerCase());
    },
    acceptedAges() {
      if (this.data.minimumAge && this.data.maximumAge) {
        return `${this.data.minimumAge} &minus; ${this.data.maximumAge}`;
      } else if (this.data.minimumAge) {
        return `${this.data.minimumAge} +`;
      } else if (this.data.maximumAge) {
        return `0 &minus; ${this.data.maximumAge}`;
      } else {
        return "not specified";
      }
    }
  }
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
