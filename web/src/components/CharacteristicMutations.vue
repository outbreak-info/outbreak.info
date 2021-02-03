<template>
<div>

  <h4 class="">{{ definitionLabel }}</h4>

  <small class="">
    <button class="btn btn-main-outline py-1 collapsed" data-toggle="collapse" href="#mutation-table" aria-expanded="false" aria-controls="mutation-table">
      <span class="if-collapsed">View</span>
      <span class="if-not-collapsed">Hide</span>
      mutation table
    </button>
  </small>

  <!-- <small class="ml-2 my-1"><a @click="downloadMutations" href="">Download mutation list</a></small> -->

  <SARSMutationMap :mutationKey="mutationName" :mutationArr="mutations" />

  <div class="collapse ml-2" id="mutation-table">
    <MutationTable :mutations="mutations" />
  </div>
</div>
</template>

<script>
import Vue from "vue";

import SARSMutationMap from "@/components/SARSMutationMap.vue";
import MutationTable from "@/components/MutationTable.vue";

export default {
  name: "CharacteristicMutations",
  props: {
    mutations: Array,
    definitionLabel: String,
    mutationName: String
  },
  components: {
    SARSMutationMap,
    MutationTable,
  }
}
</script>
