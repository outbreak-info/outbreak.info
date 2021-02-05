<template>
<div class="my-4 mx-4 half-page text-left">
  <h1>Comparing two sets of mutations</h1>
  <div id="select-lineages">
    <div class="d-flex align-items-center my-2 w-100">
      <div class="w-400px mr-4">
        <TypeaheadSelect :queryFunction="queryPangolin" :selected="mutant1" @selected="updatePangolin1" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select lineage 1" />
      </div>

      <SARSMutationMap :mutationArr="mutations1" :mutationKey="mutant1" class="flex-1" />
    </div>
    <div class="d-flex align-items-center my-2 w-100">
      <div class="w-400px mr-4">
        <TypeaheadSelect class="mr-4" :queryFunction="queryPangolin" :selected="mutant2" @selected="updatePangolin2" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select lineage 2" />
      </div>
      <div class="mutation-map flex-grow-1 px-2">
        <SARSMutationMap :mutationArr="mutations2" :mutationKey="mutant2" />
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";
import {
  findPangolin,
  getCharacteristicMutations
} from "@/api/genomics.js";

import SARSMutationMap from "@/components/SARSMutationMap.vue";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";


export default {
  name: "SituationReportsDemo",
  components: {
    TypeaheadSelect,
    SARSMutationMap
  },
  data() {
    return {
      mutant1: null,
      mutant2: null,
      mutations1: null,
      mutations2: null,
      queryPangolin: null,
      mutation1Subscription: null,
      mutation2Subscription: null
    }
  },
  mounted() {
    this.mutant1 = this.$route.query.mutant1;
    this.mutant2 = this.$route.query.mutant2;

    this.getMutants1();
    this.getMutants2();

    this.queryPangolin = findPangolin;
  },
  methods: {
    getMutants1() {
      if (this.mutant1) {
        this.mutation1Subscription = getCharacteristicMutations(this.$genomicsurl, this.mutant1).subscribe(muts => {
          this.mutations1 = muts;
        })
      }
    },
    getMutants2() {
      if (this.mutant2) {
        this.mutation2Subscription = getCharacteristicMutations(this.$genomicsurl, this.mutant2).subscribe(muts => {
          this.mutations2 = muts;
        })
      }
    },
    updatePangolin1(selected) {
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          mutant1: selected.name,
          mutant2: this.mutant2
        }
      })
    },
    updatePangolin2(selected) {
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          mutant1: this.mutant1,
          mutant2: selected.name
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.w-400px {
    width: 200px;
}
</style>
