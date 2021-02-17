<template>
<div class="my-4 mx-4 half-page text-left">
  <h1>Comparing two sets of mutations</h1>
  <div id="select-lineages">
    <div class="d-flex align-items-end mt-3 mb-5 w-100" id="mutation-1">
      <div class="w-400px mr-4">
        <TypeaheadSelect :queryFunction="queryPangolin" :selected="mutant1" @selected="updatePangolin1" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select lineage 1" />
      </div>
      <div>
        <h5>
          {{ mutant1 }}
        </h5>
        <SARSMutationMap :mutationArr="mutations1" :mutationKey="mutant1" class="w-600px" />
      </div>
      <CharacteristicMutations :mutationName="mutant1" :mutations="mutations1" :definitionLabel="mutant1" class="" />
    </div>

    <div class="d-flex align-items-end mt-3 mb-5 w-100" id="mutation-2">
      <div class="w-400px mr-4">
        <TypeaheadSelect :queryFunction="queryPangolin" :selected="mutant2" @selected="updatePangolin2" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select lineage 2" />
      </div>
      <div>
        <h5>
          {{ mutant2 }}
        </h5>
        <SARSMutationMap :mutationArr="mutations2" :mutationKey="mutant2" class="w-600px" />
      </div>
      <CharacteristicMutations :mutationName="mutant2" :mutations="mutations2" :definitionLabel="mutant2" class="" />
    </div>

<MutationHeatmap :data="mutationHeatmap"/>
  </div>
</div>
</template>

<script>
import Vue from "vue";
import {
  findPangolin,
  getCharacteristicMutations,
  getLineagesComparison
} from "@/api/genomics.js";

import MutationHeatmap from "@/components/MutationHeatmap.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import CharacteristicMutations from "@/components/CharacteristicMutations.vue";


export default {
  name: "SituationReportsDemo",
  props: {
    pango: Array
  },
  components: {
    TypeaheadSelect,
    SARSMutationMap,
    MutationHeatmap,
    CharacteristicMutations
  },
  computed: {
    selectedPango() {
      return (["B.1.1.7", "B.1.351", "B.1.429", "P.1", "B.1.525"])
    }
  },
  data() {
    return {
      mutant1: null,
      mutant2: null,
      mutations1: null,
      mutations2: null,
      queryPangolin: null,
      mutation1Subscription: null,
      mutation2Subscription: null,
      mutationHeatmap: null
    }
  },
  mounted() {
    console.log(this.$route)
    console.log(this.pango)
    getLineagesComparison(this.$genomicsurl, this.selectedPango).subscribe(results => {
      this.mutationHeatmap = results;
    })

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
          console.log(this.mutations1)
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
      this.mutant1 = selected.name;
      this.getMutants1();
      this.$router.push({
        name: "SituationReportComparison",
        query: {
          mutant1: selected.name,
          mutant2: this.mutant2
        }
      })
    },
    updatePangolin2(selected) {
      this.mutant2 = selected.name;
      this.getMutants2();
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
.w-600px {
    width: 600px;
}
</style>
