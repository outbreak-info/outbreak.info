<template>
  <div style="overflow-x: auto">
    <table class="mx-auto">
      <thead>
        <tr>
          <th rowspan="2" class="border-bottom">lineage</th>
          <th
            class="text-center padded border-bottom border-secondary"
            colspan="2"
          >
            lineage found
          </th>
          <th />
          <th
            class="text-center padded border-bottom border-secondary"
            colspan="2"
          >
            when found
            <sup>**</sup>
          </th>
        </tr>
        <tr class="border-bottom">
          <th class="text-center padded">total</th>
          <th class="text-center padded">
            cumulative prevalence
            <sup>*</sup>
          </th>
          <th />
          <th class="text-center padded">first</th>
          <th class="text-center padded">last</th>
        </tr>
      </thead>
      <tbody v-for="(lineageGroup, gIdx) in data" :key="gIdx">
        <tr v-if="gIdx > 0" class="padding">
          <td />
        </tr>
        <tr
          class="border-top border-bottom"
          :class="{
            custom: lineageGroup.key.includes('Custom'),
            voc: lineageGroup.key === 'Variant of Concern',
            moc: lineageGroup.key === 'Mutation of Concern',
            vum: lineageGroup.key === 'Variant under Monitoring',
            moi: lineageGroup.key === 'Mutation of Interest',
            voi: lineageGroup.key === 'Variant of Interest',
          }"
        >
          <td
            colspan="6"
            :class="{
              voc: lineageGroup.key === 'Variant of Concern',
              moc: lineageGroup.key === 'Mutation of Concern',
              moi: lineageGroup.key === 'Mutation of Interest',
              vum: lineageGroup.key === 'Variant under Monitoring',
              voi: lineageGroup.key === 'Variant of Interest',
            }"
          >
            {{ lineageGroup.key }}
            <!-- <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" v-if="lineageGroup.key.includes('Custom')" /> -->
          </td>
        </tr>
        <tr
          v-for="(lineage, lIdx) in lineageGroup.values"
          :key="lIdx"
          class="checkbook"
        >
          <td class="text-left line-height-1">
            <router-link
              v-if="
                routeTo === 'GenomicsEmbedLocation' &&
                lineage.params &&
                lineage.params.alias
              "
              class="variant-table"
              :to="{
                name: 'GenomicsEmbed',
                query: {
                  type: 'var',
                  alias: lineage.params.alias,
                  selected: lineage.route.selected,
                  pango: lineage.route.pango,
                  muts: lineage.route.muts,
                },
              }"
              :data-tippy-info="lineage.tooltip"
            >
              {{ lineage.label }}
            </router-link>
            <router-link
              v-else-if="routeTo === 'GenomicsEmbedLocation'"
              class="variant-table"
              :to="{
                name: 'GenomicsEmbed',
                params: lineage.params,
                query: {
                  type: 'var',
                  selected: lineage.route.selected,
                  pango: lineage.route.pango,
                  muts: lineage.route.muts,
                },
              }"
              :data-tippy-info="lineage.tooltip"
            >
              {{ lineage.label }}
            </router-link>
            <router-link
              v-else
              class="variant-table"
              :to="{
                name: 'MutationReport',
                params: lineage.params ? lineage.params : {},
                query: transformQuery(lineage.route),
              }"
              :data-tippy-info="lineage.tooltip"
            >
              {{ lineage.label }}
            </router-link>
          </td>
          <td>
            {{ lineage.lineage_count_formatted }}
          </td>
          <td
            :class="{
              'text-muted':
                lineage.proportion_formatted === 'no estimate' ||
                lineage.proportion_formatted === 'not detected',
            }"
          >
            <span
              :class="{
                'no-estimate': lineage.proportion_formatted === 'no estimate',
              }"
              :data-tippy-info="`Prevalence estimates are unreliable since only ${
                lineage.total_count
              } ${
                lineage.total_count === 1 ? 'sample has' : 'samples have'
              } been sequenced since ${
                lineage.label
              } detection in ${locationName}`"
            >
              {{ lineage.proportion_formatted }}
            </span>
          </td>

          <td class="spacer" />
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
      <small>
        <em>
          <sup>*</sup>
          Apparent cumulative prevalence is the ratio of the sequences
          containing the lineage or mutation(s) to all sequences collected since
          the identification of lineage or mutation(s) in that location.
        </em>
      </small>
      <small class="ml-2">
        <em>
          <sup>**</sup>
          Dates are based on the sample collection date
        </em>
      </small>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { isArray } from 'lodash/lang';
import tippy from 'tippy.js';

import 'tippy.js/themes/light.css';

const props = defineProps({
  data: Array,
  locationID: String,
  locationName: String,
  routeTo: {
    type: String,
    default: 'MutationReport',
  },
});

const transformQuery = (query) => {
  if (typeof query.pango === 'string') {
    return query;
  } else if (isArray(query.pango)) {
    let tempQuery = query;
    tempQuery.pango = tempQuery.pango[0];
    return tempQuery;
  }
};

onMounted(() => {
  tippy('.variant-table', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'light',
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });

  tippy('.variant-expand', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'light',
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });

  tippy('.no-estimate', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'light',
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });
});
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
.voi,
.vum {
  padding: 0.5rem;
  text-align: center;
}

.checkbook:nth-child(2n + 1) {
  background: lighten($base-grey, 70%);
}
</style>
