<template>
<div>
  <table class="mx-auto">
    <thead>
      <tr>
        <th rowspan="2" class="border-bottom">
          lineage
        </th>
        <th class="text-center padded border-bottom border-secondary" colspan="2">
          lineage found
        </th>
        <th>
        </th>
        <th class="text-center padded border-bottom border-secondary" colspan="2">
          when found<sup>**</sup>
        </th>
      </tr>
      <tr class="border-bottom">
        <th class="text-center padded">
          total
        </th>
        <th class="text-center padded">
          cumulative prevalence<sup>*</sup>
        </th>
        <th>

        </th>
        <th class="text-center padded">
          first
        </th>
        <th class="text-center padded">
          last
        </th>
      </tr>
    </thead>
    <tbody v-for="(lineageGroup, gIdx) in data" :key="gIdx">
      <tr class="padding" v-if="gIdx > 0">
        <td>

        </td>
      </tr>
      <tr class="border-top border-bottom" :class="{ 'custom': lineageGroup.key.includes('Custom'), 'voc': lineageGroup.key == 'Variant of Concern',  'moc': lineageGroup.key == 'Mutation of Concern',  'moi': lineageGroup.key == 'Mutation of Interest', 'voi': lineageGroup.key == 'Variant of Interest'}">
        <td colspan="6" :class="{ 'voc': lineageGroup.key == 'Variant of Concern',  'moc': lineageGroup.key == 'Mutation of Concern',  'moi': lineageGroup.key == 'Mutation of Interest',  'voi': lineageGroup.key == 'Variant of Interest'}">
          {{lineageGroup.key}}
          <!-- <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" v-if="lineageGroup.key.includes('Custom')" /> -->
        </td>

      </tr>
      <tr class="checkbook" v-for="(lineage, lIdx) in lineageGroup.values" :key="lIdx">
        <td>
          <router-link :to="{name: 'MutationReport', query: lineage.route }">
            {{ lineage.label }}
          </router-link>
        </td>
        <td>
          {{ lineage.lineage_count_formatted }}
        </td>
        <td :class="{'text-muted' : lineage.proportion_formatted == 'not detected'}">
          {{ lineage.proportion_formatted }}
        <td class="spacer">

        </td>
        <td>
          {{ lineage.first_detected }}
        </td>
        <td>
          {{ lineage.last_detected }}
        </td>
      </tr>
    </tbody>
  </table>

  <div class="line-height-1 w-50 mx-auto my-1">
    <small><em><sup>*</sup> Apparent cumulative prevalence is the ratio of the sequences containing the lineage or mutation(s) to all sequences collected since the identification of lineage or mutation(s) in that location.</em> </small>
    <small class="ml-2"><em><sup>**</sup> Dates are based on the sample collection date</em> </small>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import Warning from "@/components/Warning.vue";

// // --- font awesome --
// import {
//   FontAwesomeIcon
// } from "@fortawesome/vue-fontawesome";
// import {
//   library
// } from "@fortawesome/fontawesome-svg-core";
// import {
//   faSync
// } from "@fortawesome/free-solid-svg-icons/faSync";
//
// library.add(faSync);

export default {
  name: "LocationTable",
  props: {
    data: Array,
    locationID: String
  }
}
</script>


<style lang="scss" scoped>
th.padded {
    padding: 0.25rem 0.25rem 0.5rem;
}

.padding td {
    padding: 0.25rem 0.25rem 0.5rem;
}

.checkbook td,
.custom td,
.padding,
.voc,
.voi, .moc, .moi {
    padding: 0.5rem;
    text-align: center;
}

.checkbook:nth-child(2n+1) {
    background: lighten($base-grey,70%);
}
</style>
