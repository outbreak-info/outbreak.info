<template>
  <div v-if="data" class="mb-3 text-muted">
    <template v-if="data['@type']">
      <StripeAccent :className="data['@type']" />
      <small :class="[data['@type'], 'resource-type', 'mr-2']">
        {{ data['@type'] }}
      </small>
    </template>

    <template v-if="data.name">
      <router-link
        v-if="data._id"
        :key="$route.path"
        :to="{ name: 'Resource Page', params: { id: data._id } }"
      >
        {{ data.name }}
      </router-link>
      <a v-else-if="data.url" :href="data.url" target="_blank" rel="noreferrer">
        {{ data.name }}
      </a>
      <a
        v-else-if="data.pmid"
        :href="'https://pubmed.ncbi.nlm.nih.gov/' + data.pmid"
        target="_blank"
        rel="noreferrer"
      >
        {{ data.name }}
      </a>
      <a
        v-else-if="data.doi"
        :href="'https://doi.org/' + data.doi"
        target="_blank"
        rel="noreferrer"
      >
        {{ data.name }}
      </a>
      <span v-else class="text-dark">{{ data.name }}</span>
      .&nbsp;
      <template v-if="data.author">
        <span
          v-for="(author, idx) in data.author"
          id="authors"
          :key="idx"
          class="author"
        >
          <span>
            {{
              author.name
                ? author.name
                : author.givenName + ' ' + author.familyName
            }}
          </span>
          <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'" />
          <span
            v-if="idx >= data.author.length - 2 && data.author.length === 2"
            v-html="'&nbsp;and&nbsp;'"
          />
          <span
            v-if="idx === data.author.length - 2 && data.author.length > 2"
            v-html="',&nbsp;and&nbsp;'"
          />
        </span>
        .
      </template>

      <!-- journal name -->
      <span v-if="data.journalName" class="mx-1">{{ data.journalName }}</span>
      <span v-else-if="data.journalNameAbbrev" class="mx-1">
        {{ data.journalNameAbbrev }}
      </span>

      <!-- dates -->
      <span v-if="data.dateModified" class="badge bg-grey__lightest">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
        updated {{ formatDate(data.dateModified) }}
      </span>
      <span v-if="data.datePublished && data.dateModified" class="mx-1">
        &bull;
      </span>
      <span v-if="data.datePublished" class="badge bg-grey__lightest">
        <font-awesome-icon
          v-if="!data.dateModified"
          class="mr-1"
          :icon="['far', 'clock']"
        />
        published {{ formatDate(data.datePublished) }}
      </span>
    </template>

    <template v-else>
      {{ data.citation }}
      <a v-if="data.url" :href="data.url" target="_blank" rel="noreferrer">
        {{ data.pmid ? 'PMID ' + data.pmid : 'link' }}
      </a>
      <a
        v-else-if="data.pmid"
        :href="'https://pubmed.ncbi.nlm.nih.gov/' + data.pmid"
        target="_blank"
        rel="noreferrer"
      >
        {{ 'PMID ' + data.pmid }}
      </a>
    </template>
  </div>
</template>

<script setup>
import { timeFormat, timeParse } from 'd3-time-format';

import { lazyLoad } from '@/js/lazy-load';

const StripeAccent = lazyLoad('StripeAccent');

const props = defineProps({
  data: Object,
});

const formatDate = (dateStr) => {
  const parseDate = timeParse('%Y-%m-%d');
  const formatDate = timeFormat('%d %B %Y');
  if (dateStr) {
    const parsed = parseDate(dateStr);
    return parsed ? formatDate(parsed) : dateStr;
  }
  return null;
};
</script>
