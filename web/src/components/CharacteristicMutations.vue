<template>
<div>
  <h4 class="">{{ definitionLabel }}</h4>

  <SARSMutationMap :mutationKey="mutationName" :mutationArr="mutations" class="mb-3" />

  <div class="d-flex align-items-center ml-2 mr-3">
    <button class="btn btn-main-outline btn-mut router-link px-1 collapsed" data-toggle="collapse" href="#mutation-table" aria-expanded="false" aria-controls="mutation-table">
      <small><span class="if-collapsed">View</span>
        <span class="if-not-collapsed">Hide</span>
        mutation table</small>
    </button>
    <DownloadReportData :data="mutations" figureRef="mutation-map" dataType="Mutation Map" />
  </div>


  <div class="collapse ml-2" id="mutation-table">
    <MutationTable :mutations="mutations" />
  </div>
</div>
</template>

<script>
import Vue from "vue";

import SARSMutationMap from "@/components/SARSMutationMap.vue";
import MutationTable from "@/components/MutationTable.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

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
    DownloadReportData
  }
}
</script>

<style lang="scss">
[data-toggle="collapse"] {
    &.collapsed .if-not-collapsed {
        display: none;
    }
    &:not(.collapsed) .if-collapsed {
        display: none;
    }
}

.btn-mut {
    flex-basis: 210px;
    line-height: 1 !important;
}
</style>
