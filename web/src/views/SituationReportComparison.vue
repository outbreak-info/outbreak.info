<template>
<div class="my-4 mx-4 half-page text-left">
  <h1>Comparing two sets of mutations</h1>
  <div id="select-lineages">
    <!-- <div class="d-flex align-items-end mt-3 mb-5 w-100" id="mutation-1">
      <div class="w-400px mr-4">
        <TypeaheadSelect :queryFunction="queryPangolin" :selected="mutant1" @selected="updatePangolin1" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Add lineage" />
      </div>
      <div>
        <h5>
          {{ mutant1 }}
        </h5>
        <SARSMutationMap :mutationArr="mutations1" :mutationKey="mutant1" class="w-600px" />
      </div>

    </div> -->
<div id="mutation-heatmaps" class="d-flex flex-wrap">
  <div v-for="(geneData, gIdx) in mutationHeatmap" :key="gIdx">
    <h4>{{ geneData.key }}</h4>
    <MutationHeatmap :data="geneData.values" />
  </div>

</div>

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
    pango: Array,
    genes: {
      type: Array,
      default: () => ["ORF1a", "ORF1b", "S"]
    }
  },
  components: {
    // TypeaheadSelect,
    // SARSMutationMap,
    MutationHeatmap,
    // CharacteristicMutations
  },
  computed: {
    selectedPango() {
      return (["B.1.1.7", "B.1.351", "B.1.427", "B.1.429", "P.1", "B.1.525"])
    }
  },
  data() {
    return {
      queryPangolin: null,
      mutationHeatmap: null
    }
  },
  mounted() {
    this.heatmapSubscription = getLineagesComparison(this.$genomicsurl, this.selectedPango).subscribe(results => {
      this.mutationHeatmap = results;
    })

    this.queryPangolin = findPangolin;
  },
  methods: {
    updatePangolin(selected) {
      // this.mutant1 = selected.name;
      // this.getMutants1();
      // this.$router.push({
      //   name: "SituationReportComparison",
      //   query: {
      //     mutant1: selected.name,
      //     mutant2: this.mutant2
      //   }
      // })
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
