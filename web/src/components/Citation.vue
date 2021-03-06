<template>
<div class="mb-3 text-muted" v-if="data">
  <template v-if="data['@type']">
    <StripeAccent :className="data['@type']" />
    <small :class="[data['@type'], 'resource-type', 'mr-2']">{{
      data["@type"]
    }}</small>
</template>

<template v-if="data.name">
<router-link :key="$route.path" :to="{name: 'Resource Page', params: { id: data._id } }" v-if="data._id">{{data.name}}</router-link>
<a :href="data.url" target="_blank" rel="noreferrer" v-else-if="data.url">{{data.name}}</a>
<a :href="'https://pubmed.ncbi.nlm.nih.gov/' + data.pmid" target="_blank" rel="noreferrer" v-else-if="data.pmid">{{data.name}}</a>
<a :href="'https://doi.org/' + data.doi" target="_blank" rel="noreferrer" v-else-if="data.doi">{{data.name}}</a>
<span class="text-dark" v-else>{{data.name}}</span>.&nbsp;
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

<!-- journal name -->
<span v-if="data.journalName" class="mx-1">{{data.journalName}}</span>
<span v-else-if="data.journalNameAbbrev" class="mx-1">{{data.journalNameAbbrev}}</span>

<!-- dates -->
<span class="badge bg-grey__lightest" v-if="data.dateModified">
  <font-awesome-icon class="mr-1" :icon="['far', 'clock']"/>
  updated {{ this.formatDate(data.dateModified) }}
</span>
<span v-if="data.datePublished && data.dateModified
    " class="mx-1">&bull;</span>
<span class="badge bg-grey__lightest" v-if="data.datePublished">
  <font-awesome-icon class="mr-1" :icon="['far', 'clock']" v-if="!data.dateModified"/>
  published {{ this.formatDate(data.datePublished) }}
</span>
</template>

<template v-else>
{{data.citation}}
<a :href="data.url" target="_blank" rel="noreferrer" v-if="data.url">{{data.pmid ? "PMID " + data.pmid : "link"}}</a>
<a :href="'https://pubmed.ncbi.nlm.nih.gov/' + data.pmid" target="_blank" rel="noreferrer" v-else-if="data.pmid">{{"PMID " + data.pmid}}</a>
</template>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

import StripeAccent from "@/components/StripeAccent.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";

library.add(faClock);


export default Vue.extend({
  name: "Citation",
  props: {
    data: Object
  },
  components: {
    StripeAccent,
    FontAwesomeIcon
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      if (dateStr) {
        const parsed = parseDate(dateStr);
        return parsed ? formatDate(parsed) : dateStr;
      }
      return (null)
    }
  }
})
</script>
