<template>
  <div v-if="data" class="d-flex flex-column text-left">
    <!-- title -->
    <h3 class="d-flex align-item-center m-0 mb-4">
      <span v-if="retractionText" class="font-weight-bold text-highlight mr-2">
        RETRACTED:
      </span>
      <b>{{ data.name }}</b>
    </h3>

    <!-- retraction notice -->
    <div v-if="retractionText">
      <Warning
        :animate="true"
        class="w-100 mb-2 fa-lg"
        :text="retractionText"
      />
    </div>

    <!-- authors -->
    <div
      v-if="data.author || data.creator"
      class="author-container d-flex flex-wrap align-items-center my-2"
    >
      <template v-if="data.author && (data.author.length || data.author.name)">
        <template v-if="Array.isArray(data.author)">
          <div
            v-for="(author, idx) in data.author"
            id="authors"
            :key="'author2' + idx"
            class="author font-weight-bold fa-lg line-height-1"
          >
            <span>
              {{
                author.name
                  ? author.name
                  : author.givenName
                  ? author.givenName + ' ' + author.familyName
                  : ''
              }}
            </span>
            <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'" />
            <span
              v-if="idx === data.author.length - 2 && data.author.length === 2"
              v-html="'&nbsp;and&nbsp;'"
            />
            <span
              v-if="idx === data.author.length - 2 && data.author.length > 2"
              v-html="',&nbsp;and&nbsp;'"
            />
          </div>
        </template>
        <div
          v-else
          id="authors"
          class="author font-weight-bold fa-lg line-height-1"
        >
          <span>
            {{
              data.author.name
                ? data.author.name
                : data.author.givenName
                ? data.author.givenName + ' ' + data.author.familyName
                : ''
            }}
          </span>
        </div>

        <a href="" @click.prevent="showAffiliation = !showAffiliation">
          <small class="text-muted ml-2">
            <span>
              {{ showAffiliation ? 'hide affiliations' : 'view affiliations' }}
            </span>
            <font-awesome-icon
              v-if="!showAffiliation"
              :icon="['fas', 'angle-double-down']"
              class="mx-1"
            />
            <font-awesome-icon
              v-if="showAffiliation"
              :icon="['fas', 'angle-double-up']"
              class="mx-1"
            />
          </small>
        </a>

        <div
          v-if="showAffiliation && Array.isArray(data.author)"
          id="author-affiliations"
          class="d-flex flex-column w-100 mb-3"
        >
          <small
            v-for="(author, idx) in data.author"
            :key="'author3' + idx"
            class="text-muted"
          >
            <b>
              {{
                author.name
                  ? author.name
                  : author.givenName
                  ? author.givenName + ' ' + author.familyName
                  : ''
              }}
            </b>
            :
            <template v-if="!author.affiliation">N/A</template>
            <template v-else-if="Array.isArray(author.affiliation)">
              <span
                v-for="(affiliation, idx) in author.affiliation"
                :key="'author' + idx"
              >
                {{ affiliation.name }}
              </span>
            </template>
            <template v-else>
              <span>{{ author.affiliation.name }}</span>
            </template>
          </small>
        </div>

        <div
          v-else-if="showAffiliation"
          id="author-affiliations"
          class="d-flex flex-column w-100 mb-3"
        >
          <small class="text-muted">
            <b>
              {{
                data.author.name
                  ? data.author.name
                  : data.author.givenName
                  ? data.author.givenName + ' ' + data.author.familyName
                  : ''
              }}
            </b>
            :
            <template v-if="Array.isArray(data.author.affiliation)">
              <span
                v-for="(affiliation, idx) in data.author.affiliation"
                :key="'affiliation' + idx"
              >
                {{ affiliation.name }}
              </span>
            </template>
            <template v-else>
              <span>{{ data.author.affiliation.name }}</span>
            </template>
          </small>
        </div>
      </template>

      <template v-else-if="data.creator">
        <div
          v-for="(creator, idx) in data.creator"
          id="authors"
          :key="'creator' + idx"
          class="creator"
        >
          <span>
            {{
              creator.name
                ? creator.name
                : creator.givenName
                ? creator.givenName + ' ' + creator.familyName
                : ''
            }}
          </span>
          <span v-if="idx < data.creator.length - 2" v-html="',&nbsp;'" />
          <span
            v-if="idx === data.creator.length - 2 && !data.creator.length === 2"
            v-html="',&nbsp;and&nbsp;'"
          />
          <span
            v-if="idx === data.creator.length - 2 && data.creator.length === 2"
            v-html="'&nbsp;and&nbsp;'"
          />
        </div>

        <a href="" @click.prevent="showAffiliation = !showAffiliation">
          <small class="text-muted ml-2">
            <span>
              {{ showAffiliation ? 'hide affiliations' : 'view affiliations' }}
            </span>
            <font-awesome-icon
              v-if="!showAffiliation"
              :icon="['fas', 'angle-double-down']"
              class="mx-1"
            />
            <font-awesome-icon
              v-if="showAffiliation"
              :icon="['fas', 'angle-double-up']"
              class="mx-1"
            />
          </small>
        </a>

        <div
          v-if="showAffiliation"
          id="creator-affiliations"
          class="d-flex flex-column w-100 mb-3"
        >
          <small
            v-for="(creator, idx) in data.creator"
            :key="'affiliation2' + idx"
            class="text-muted"
          >
            <b>
              {{
                creator.name
                  ? creator.name
                  : creator.givenName
                  ? creator.givenName + ' ' + creator.familyName
                  : ''
              }}
            </b>
            :
            <template v-if="Array.isArray(creator.affiliation)">
              <span
                v-for="(affiliation, idx) in creator.affiliation"
                :key="'affiliation3' + idx"
              >
                {{ affiliation.name }}
              </span>
            </template>
            <template v-else>
              <span>{{ creator.affiliation }}</span>
            </template>
          </small>
        </div>
      </template>
    </div>
    <div v-if="data.sponsor" id="sponsor" class="sponsor text-muted">
      sponsored by
      <span v-for="(sponsor, idx) in data.sponsor" :key="idx">
        {{ sponsor.name }}
        <!-- <span v-if="sponsor.role"> ({{sponsor.role}})</span> -->
        <span v-if="idx < data.sponsor.length - 1">,&nbsp;</span>
      </span>
    </div>

    <!-- mini-citation -->
    <div
      v-if="data['@type'] && data['@type'] === 'Publication'"
      class="text-muted fa-lg line-height-1 mb-4"
    >
      <span v-if="data.journalName" class="font-italic">
        {{ data.journalName }}
      </span>
      <span v-else-if="data.journalAbbreviation" class="font-italic">
        {{ data.journalAbbreviation }}
      </span>
      <span v-if="data.volumeNumber">, volume {{ data.volumeNumber }}</span>
      <span v-if="data.issueNumber">, issue {{ data.issueNumber }}</span>
    </div>

    <!-- dates -->
    <div id="dates">
      <div
        v-if="
          data.dateModified ||
          data.dateCreated ||
          data.dataUpdated ||
          data.datePublished ||
          data.curatedBy.curationDate ||
          data.curatedBy.versionDate
        "
        class="text-muted"
      >
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

        <span
          v-if="data.dateCreated && (data.datePublished || data.dateModified)"
          class="mx-1"
        >
          &bull;
        </span>

        <span v-if="data.dateCreated" class="badge bg-grey__lightest">
          <font-awesome-icon
            v-if="!data.datePublished && !data.dateModified"
            class="mr-1"
            :icon="['far', 'clock']"
          />
          created {{ formatDate(data.dateCreated) }}
        </span>

        <span
          v-if="
            data.curatedBy &&
            data.curatedBy.versionDate &&
            (data.dateCreated || data.datePublished || data.dateModified)
          "
          class="mx-1"
        >
          &bull;
        </span>
        <span
          v-if="data.curatedBy && data.curatedBy.versionDate"
          class="badge bg-grey__lightest"
        >
          version {{ formatDate(data.curatedBy.versionDate) }}
        </span>

        <span
          v-if="
            data.curatedBy &&
            data.curatedBy.curationDate &&
            (data.dateCreated ||
              data.datePublished ||
              data.dateModified ||
              data.curatedBy.versionDate)
          "
          class="mx-1"
        >
          &bull;
        </span>
        <span
          v-if="data.curatedBy && data.curatedBy.curationDate"
          class="badge bg-grey__lightest"
        >
          accessed {{ formatDate(data.curatedBy.curationDate) }}
        </span>
      </div>
    </div>

    <!-- source -->
    <div v-if="data.curatedBy" class="mt-1 mb-1">
      <small>
        Record provided by
        <a :href="data.curatedBy.url" target="_blank" rel="noreferrer">
          {{ data.curatedBy.name }}
          <img
            v-if="getLogo(data.curatedBy.name)"
            :src="`/assets/resources/${getLogo(data.curatedBy.name)}`"
            :alt="data.curatedBy.name"
            height="25"
            class="ml-1 mr-4"
          />
        </a>
        <router-link
          :to="{ name: 'Sources' }"
          aria-label="Learn more about data sources"
        >
          Learn more
        </router-link>
      </small>
    </div>

    <ClinicalTrialSummary v-if="type === 'ClinicalTrial'" :data="data" />

    <!-- topics -->
    <div class="keyword-container flex flex-wrap align-items-center mt-4">
      <template v-if="data.topicCategory">
        <span class="text-muted mr-2">Topics:</span>
        <template v-if="Array.isArray(data.topicCategory)">
          <small
            v-for="(topic, idx) in data.topicCategory"
            :key="idx"
            class="topic px-2 py-1 mb-1 mr-1"
            :data-tippy-info="`search ${topic}`"
          >
            <router-link
              :to="{
                name: 'Resources',
                query: { q: `&quot;${topic}&quot;` },
              }"
              class="no-underline"
            >
              {{ topic }}
            </router-link>
          </small>
        </template>

        <small
          v-else-if="data.topicCategory.name"
          class="topic uppercase px-2 py-1 mb-1 mr-1"
          :data-tippy-info="`search ${data.topicCategory.name}`"
        >
          <router-link
            :to="{
              name: 'Resources',
              query: { q: `&quot;${data.topicCategory.name}&quot;` },
            }"
            class="no-underline"
          >
            {{ data.topicCategory.name }}
          </router-link>
        </small>

        <small
          v-else
          class="topic uppercase px-2 py-1 mb-1 mr-1"
          :data-tippy-info="`search ${data.topicCategory}`"
        >
          <router-link
            :to="{
              name: 'Resources',
              query: { q: `&quot;${data.topicCategory}&quot;` },
            }"
            class="no-underline"
          >
            {{ data.topicCategory }}
          </router-link>
        </small>
      </template>
    </div>

    <!-- keywords -->
    <div v-if="data.keywords" class="keyword-container flex flex-wrap mt-2">
      <span class="text-muted mr-2">Keywords:</span>
      <div
        v-for="(keyword, idx) in data.keywords"
        :key="'keyword' + idx"
        class="mb-1 mr-1"
      >
        <small
          v-if="keyword !== ''"
          class="keyword px-2 py-1"
          :data-tippy-info="`search ${keyword}`"
        >
          <router-link
            :to="{
              name: 'Resources',
              query: { q: `&quot;${keyword}&quot;` },
            }"
            class="no-underline text-dark"
          >
            {{ keyword }}
          </router-link>
        </small>
      </div>
    </div>

    <!-- description -->
    <div id="description" class="mt-5">
      <div v-if="data.description" v-html="data.description" />
      <div v-else-if="data.abstract" v-html="data.abstract" />
      <div v-else>
        <h6 class="m-0 text-muted">Description</h6>
        <small class="text-muted">not provided</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { timeFormat, timeParse } from 'd3-time-format';
import tippy from 'tippy.js';

import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

import 'tippy.js/themes/light.css';

const ClinicalTrialSummary = lazyLoad('ClinicalTrialSummary');
const Warning = lazyLoad('Warning');

const props = defineProps({
  data: Object,
  type: String,
});

// this.$route
const route = useRoute();

const store = adminStore();
const { loading, resources } = storeToRefs(store);

let showAffiliation = ref(false);

const retractionText = computed(() => {
  if (
    props.data.correction &&
    props.data.correction.some((d) => d.correctionType === 'retraction in')
  ) {
    const retraction = props.data.correction.filter(
      (d) => d.correctionType === 'retraction in',
    );
    const retractionLink = retraction.map(
      (d) =>
        `<a class="text-white" href="${d.url}" target="_blank">Retraction Notice </a>`,
    );
    return `This ${props.data['@type']} has been retracted. <span class="ml-3">View ${retractionLink}</span>`;
  }
  if (
    props.data.correction &&
    props.data.correction.some((d) => d.correctionType === 'retraction of')
  ) {
    const retraction = props.data.correction.filter(
      (d) => d.correctionType === 'retraction of',
    );
    const retractionLink = retraction.map(
      (d) =>
        `<a class="text-white" href="${
          d.url
        }" target="_blank">${d.identifier.toUpperCase()} </a>`,
    );
    return `Retraction of ${retractionLink}`;
  }
  if (
    props.data.publicationType &&
    props.data.publicationType.includes('Retracted Publication')
  ) {
    return `This ${props.data['@type']} has been retracted.`;
  } else {
    return null;
  }
});

onMounted(() => {
  tippy('.topic', {
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

  tippy('.keyword', {
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

const getLogo = (curator) => {
  const source = store.$state.resources
    .flatMap((d) => d.sources)
    .filter(
      (d) =>
        d.id === curator.toLowerCase() ||
        d.name.toLowerCase() === curator.toLowerCase(),
    );
  return source.length === 1 ? source[0].img : null;
};

const formatDate = (dateStr) => {
  const parseDate = timeParse('%Y-%m-%d');
  const strictIsoParse = timeParse('%Y-%m-%dT%H:%M:%S.%f');
  const formatDate = timeFormat('%d %B %Y');
  if (dateStr) {
    let parsed = parseDate(dateStr);
    if (parsed) {
      return formatDate(parsed);
    } else {
      parsed = strictIsoParse(dateStr);
      return parsed ? formatDate(parsed) : null;
    }
  } else {
    return null;
  }
};
</script>

<style lang="scss" scoped>
.resource-type {
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.7;
}

.pub-type {
  opacity: 0.6;
}

.topic {
  background: $warning-color;
  color: white;
  border-radius: 5px;
  white-space: nowrap;
  & a {
    color: white;
  }
}

.keyword-container {
  display: flex;
  min-width: 0;
}

.keyword {
  background: lighten($warning-color, 35%);
  border-radius: 5px;
  white-space: nowrap;
}

.pub-type {
  opacity: 0.6;
}

.helper {
  line-height: 1.2em;
}

.section-header {
  text-transform: uppercase;
}
</style>
