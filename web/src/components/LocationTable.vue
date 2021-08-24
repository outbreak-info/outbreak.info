<template>
<div style="overflow-x:auto;">
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
      <tr class="border-top border-bottom"
        :class="{ 'custom': lineageGroup.key.includes('Custom'), 'voc': lineageGroup.key == 'Variant of Concern',  'moc': lineageGroup.key == 'Mutation of Concern',  'moi': lineageGroup.key == 'Mutation of Interest', 'voi': lineageGroup.key == 'Variant of Interest'}">
        <td colspan="6" :class="{ 'voc': lineageGroup.key == 'Variant of Concern',  'moc': lineageGroup.key == 'Mutation of Concern',  'moi': lineageGroup.key == 'Mutation of Interest',  'voi': lineageGroup.key == 'Variant of Interest'}">
          {{lineageGroup.key}}
          <!-- <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" v-if="lineageGroup.key.includes('Custom')" /> -->
        </td>

      </tr>
      <tr class="checkbook" v-for="(lineage, lIdx) in lineageGroup.values" :key="lIdx">
        <td class="text-left line-height-1">
          <router-link class="variant-table" :to="{name: 'MutationReport', params: lineage.params, query: lineage.route }" :data-tippy-info="lineage.tooltip">
            {{ lineage.label }}
          </router-link>
          <small class="text-muted pointer variant-expand" :data-tippy-info="`show ${lineage.label} sublineages`" @click="showSublineages(lineage)">
            <font-awesome-icon class="fa-sm ml-1" :icon="['far', 'plus-square']" />
          </small>
        </td>
        <td>
          {{ lineage.lineage_count_formatted }}
        </td>
        <td :class="{'text-muted' : lineage.proportion_formatted == 'no estimate' || lineage.proportion_formatted == 'not detected'}">
          <span :class="{'no-estimate' : lineage.proportion_formatted == 'no estimate'}"
            :data-tippy-info="`Prevalence estimates are unreliable since only ${lineage.total_count} ${lineage.total_count === 1 ? 'sample has' : 'samples have'} been sequenced since ${lineage.label} detection in ${locationName}`">{{ lineage.proportion_formatted }}</span>
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

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPlusSquare
} from "@fortawesome/free-regular-svg-icons/faPlusSquare";

library.add(faPlusSquare);

export default {
  name: "LocationTable",
  components: {
    FontAwesomeIcon
  },
  props: {
    data: Array,
    locationID: String,
    locationName: String
  },
  mounted() {
    tippy(".variant-table", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy(".variant-expand", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy(".no-estimate", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  },
  methods: {
    showSublineages(lineage) {
      console.log(lineage)
    }
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
.moc,
.moi,
.padding,
.voc,
.voi {
    padding: 0.5rem;
    text-align: center;
}

.checkbook:nth-child(2n+1) {
    background: lighten($base-grey,70%);
}
</style>
