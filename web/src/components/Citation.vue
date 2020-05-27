<template>
<div>
  <router-link :key="$route.path" :to="{name: 'Resource Page', params: { id: data._id } }">{{data.name}}</router-link>.
  <template v-if="data.author">
    <span class="author" v-for="(author, idx) in data.author" :key="idx" id="authors">
      <span>{{
            author.name
              ? author.name
              : author.givenName + " " + author.familyName
          }}</span>
      <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'"></span>
      <span v-if="idx >= data.author.length - 2 && data.author.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
      <span v-if="idx == data.author.length - 2 && data.author.length > 2" v-html="',&nbsp;and&nbsp;'"></span>
    </span>.
  </template>
  <span class="mx-1" v-if="data.journalName">{{data.journalName}}</span>
  <span class="badge bg-grey__lightest" v-if="data.dateModified">
    <i class="far fa-clock mr-1"></i>
    updated {{ this.formatDate(data.dateModified) }}
  </span>

  <span v-if="data.datePublished && data.dateModified
    " class="mx-1">&bull;</span>
  <span class="badge bg-grey__lightest" v-if="data.datePublished">
    <i class="far fa-clock mr-1" v-if="!data.dateModified"></i>
    published {{ this.formatDate(data.datePublished) }}
  </span>

</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default Vue.extend({
  name: "ResourceDescription",
  props: {
    data: Object
  }, methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    }
  }
})
</script>
