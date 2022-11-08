<template>
  <div>
    <div class="mb-3" v-for="(item, idx) in data" :key="idx">
      <span class="opacity-40 font-weight-700 mr-2" v-if="item.date">
        {{ format(item.date) }}
      </span>
      <router-link
        :to="{ name: 'Resource Page', params: { id: item._id } }"
        v-if="item.name"
      >
        {{ item.name }}
      </router-link>
      <template v-if="item.author && item.author.length">
        [{{
          item.author[0].name
            ? item.author[0].name
            : item.author[0].givenName + ' ' + item.author[0].familyName
        }}
        <span v-if="item.author.length > 1">et al.]</span>
        <span v-else>]</span>
      </template>
      <template v-else-if="item.creator && item.creator.length">
        [{{
          item.creator[0].name
            ? item.creator[0].name
            : item.creator[0].givenName + ' ' + item.creator[0].familyName
        }}
        <span v-if="item.creator.length > 1">et al.]</span>
        <span v-else>]</span>
      </template>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default Vue.extend({
  name: "NewList",
  props: {
    data: Array
  },
  methods: {
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return parsed ? timeFormat("%d %B %Y")(parsed) : null;
    }
  }
})
</script>
