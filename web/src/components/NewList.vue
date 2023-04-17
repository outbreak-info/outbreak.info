<template>
  <div>
    <div v-for="(item, idx) in data" :key="idx" class="mb-3">
      <span v-if="item.date" class="opacity-40 font-weight-700 mr-2">
        {{ format(item.date) }}
      </span>
      <router-link
        v-if="item.name"
        :to="{ name: 'Resource Page', params: { id: item._id } }"
      >
        {{ item.name }}
      </router-link>
      <div v-if="item.author && item.author.length">
        [{{
          item.author[0].name
            ? item.author[0].name
            : item.author[0].givenName + ' ' + item.author[0].familyName
        }}
        <span v-if="item.author.length > 1">et al.]</span>
        <span v-else>]</span>
      </div>
      <div v-else-if="item.creator && item.creator.length">
        [{{
          item.creator[0].name
            ? item.creator[0].name
            : item.creator[0].givenName + ' ' + item.creator[0].familyName
        }}
        <span v-if="item.creator.length > 1">et al.]</span>
        <span v-else>]</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { timeFormat, timeParse } from 'd3-time-format';

const props = defineProps({
  data: Array,
});

function format(dateStr) {
  const parsed = timeParse('%Y-%m-%d')(dateStr);
  return parsed ? timeFormat('%d %B %Y')(parsed) : null;
}
</script>
