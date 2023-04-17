<template>
  <div v-if="newData">
    <div
      class="text-highlight d-flex justify-content-between align-items-center mb-2"
    >
      <h5>WHAT'S NEW</h5>
    </div>

    <table id="whats-new">
      <tbody>
        <tr v-for="(item, idx) in newData" :key="idx" class="new-item">
          <td class="resource-type d-flex align-items-center">
            <router-link
              :to="{ name: 'Resource Page', params: { id: item._id } }"
              class="no-underline m-0"
              :class="item['@type']"
            >
              <StripeAccent :className="item['@type']" />

              {{ item['@type'] }}
            </router-link>
          </td>
          <td class="resource-name text-left" valign="top">
            <router-link
              :to="{ name: 'Resource Page', params: { id: item._id } }"
              class="no-underline m-0 text-dark"
            >
              {{ item.name }}
            </router-link>
          </td>
          <td class="resource-affiliation text-left text-muted" valign="top">
            <template v-if="item.author && item.author.length">
              {{
                item.author[0].name
                  ? item.author[0].name
                  : item.author[0].givenName + ' ' + item.author[0].familyName
              }}
              <span v-if="item.author.length > 1">et al.</span>
            </template>
            <template v-else-if="item.creator && item.creator.length">
              {{
                item.creator[0].name
                  ? item.creator[0].name
                  : item.creator[0].givenName + ' ' + item.creator[0].familyName
              }}
              <span v-if="item.creator.length > 1">et al.</span>
            </template>
          </td>
          <td class="resource-date" valign="top">
            <span v-if="item.date">{{ format(item.date) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { timeFormat, timeParse } from 'd3-time-format';

import { lazyLoad } from '@/js/lazy-load';

const StripeAccent = lazyLoad('StripeAccent');

const props = defineProps({
  newData: Array,
});

const format = (dateStr) => {
  const parsed = timeParse('%Y-%m-%d')(dateStr);
  return parsed ? timeFormat('%d %B')(parsed) : null;
};
</script>

<style lang="scss" scoped>
// table
.resource-type {
  font-size: 1em;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.7;
}

td.resource-type {
  min-width: 175px;
}

.resource-date {
  width: 80px;
}

.resource-affiliation {
  // width: 150px;
}

#whats-new td {
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 10px;
  font-size: 0.9em;
  line-height: 1em;
}
</style>
