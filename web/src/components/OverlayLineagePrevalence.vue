<template>
<div>
  <div class="d-flex justify-content-center mt-2">
    <label class="b-contain m-0 mr-3" v-for="option in options" :key="option.label">
      <small>{{option.label}}</small>
      <input type="checkbox" :value="option" v-model.lazy="selectedMutations" @change="selectMutation" />
      <div class="b-input"></div>
    </label>
  </div>
  <ReportPrevalenceOverlay :data="prevalences" :epi="epi" v-if="prevalences && epi" />

</div>
</template>

<script>
import Vue from "vue";

import {
  getEpiMutationPrevalence
} from "@/api/genomics.js";
import {
  getEpiTraces
} from "@/api/epi-traces.js";
import ReportPrevalenceOverlay from "@/components/ReportPrevalenceOverlay.vue";

export default {
  name: "LocationReport",
  props: {
    options: Array,
    location: String,
    selected: Array
  },
  components: {
    ReportPrevalenceOverlay
  },
  data() {
    return ({
      // filters
      numPreselected: 3,
      selectedMutations: [],
      // data
      prevalences: null,
      epi: null
    })
  },
  mounted() {
    if (this.selected) {
      this.selectedMutations = this.options.filter(d => this.selected.includes(d.label));
    } else {
      this.selectedMutations = this.options.slice(0, this.numPreselected);
    }
    console.log("MOUNTED")
    console.log(this.options)

    this.updateData();
  },
  methods: {
    selectMutation() {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "LocationReport",
        params: {
          disableScroll: true
        },
        query: {
          division: queryParams.division,
          id: queryParams.id,
          selected: this.selectedMutations.map(d => d.label)
        }
      })
      this.updateData();
    },
    updateData() {
      this.prevalenceSubscription = getEpiMutationPrevalence(this.$genomicsurl, this.$apiurl, this.location, this.selectedMutations).subscribe(results => {
        this.epi = results.epi;
        this.prevalences = results.mutations;
      })
    }
  }
}
</script>
