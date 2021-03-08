<template>
  <div class="my-5">
    <div class="d-flex">
      <label class="b-contain m-0 mr-3" v-for="option in options" :key="option.label">
        <small>{{option.label}}</small>
        <input type="checkbox" :value="option" v-model.lazy="selectedMutations" @change="selectMutation" />
        <div class="b-input"></div>
      </label>
    </div>
    <ReportPrevalenceOverlay :data="prevalences" :epi="epi" v-if="prevalences && epi"/>

  </div>
</template>

<script>
import Vue from "vue";

import { getEpiMutationPrevalence } from "@/api/genomics.js";
import { getEpiTraces } from "@/api/epi-traces.js";
import ReportPrevalenceOverlay from "@/components/ReportPrevalenceOverlay.vue";

export default {
  name: "LocationReport",
  props: {
    options: Array,
    location: String
  },
  components: {
    ReportPrevalenceOverlay
  },
  data() {
    return({
      selectedMutations: [{"query":"pangolin_lineage=B.1.1.7"}, {"query":"pangolin_lineage=B.1"}],
      prevalences: null,
      epi: null
    })
  },
  mounted() {
    this.updateData();
  },
  methods: {
    selectMutation() {
      // console.log(this.selectedMutations);
    },
    updateData() {
      this.prevalenceSubscription = getEpiMutationPrevalence(this.$genomicsurl,this.$apiurl, this.location, this.selectedMutations).subscribe(results => {
        console.log(results)
        this.epi = results.epi;
        this.prevalences = results.mutations;
      })
    }
  }
}
</script>
