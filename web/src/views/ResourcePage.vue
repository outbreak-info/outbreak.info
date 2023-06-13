<template>
  <div class="d-flex py-2 m-2">
    <!-- loading -->
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <div v-if="data" class="row w-100 m-0">
      <div class="col-sm-12 text-left">
        <!-- mini-nav for resource types -->
        <section class="d-flex justify-content-end w-100 bg-grey__lighter my-4">
          <div class="row d-flex justify-content-center w-100">
            <nav class="navbar navbar-expand-lg navbar-dark">
              <ul class="navbar-nav">
                <li
                  v-for="(anchor, idx) in anchorsArr"
                  :key="idx"
                  class="nav-item text-light mr-4"
                >
                  <router-link
                    class="nav-link no-underline p-0"
                    :to="`#${anchor.replace(' ', '_')}`"
                    exact-active-class="resource-anchor-color"
                  >
                    {{ anchor }}
                  </router-link>
                </li>
              </ul>
            </nav>
          </div>
        </section>

        <!-- type label -->
        <div v-if="type" :class="type.replace(/\s/g, '')">
          <!-- <StripeAccent :height="20" :width="4" :className="type" /> -->
          {{ type }}
          <span
            v-if="data.publicationType && data.publicationType[0]"
            class="pub-type mx-3"
          >
            <template v-if="Array.isArray(data.publicationType)">
              <span v-for="(pub, idx) in data.publicationType" :key="idx">
                {{ pub }}
                <span v-if="idx < data.publicationType.length - 1" class="mx-2">
                  &bull;
                </span>
              </span>
            </template>
            <template v-else>{{ data.publicationType }}</template>
          </span>
        </div>
      </div>

      <div class="col-md-9 my-3 pr-5">
        <!-- description -->
        <ResourceDescription
          :data="data"
          :type="type"
          class="border-bottom pb-3"
        />

        <!-- special clinical trials description -->
        <ClinicalTrialDescription
          v-if="type === 'ClinicalTrial'"
          :data="data"
        />

        <div class="mr-5">
          <!-- downloads -->
          <div
            v-if="anchorsArr.includes('downloads')"
            id="downloads"
            class="text-left border-bottom text-muted py-3 my-3"
          >
            <h6 class="m-0">Downloads</h6>
            <ul v-if="data.distribution" id="download-list">
              <li v-for="(item, idx) in data.distribution" :key="idx">
                <a :href="item.contentUrl" target="_blank" rel="noreferrer">
                  {{ item.name ? item.name : item.contentUrl }}
                </a>
              </li>
            </ul>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>

          <!-- funding info -->
          <div
            v-if="anchorsArr.includes('funder')"
            id="funder"
            class="text-left border-bottom text-muted py-3 mb-3"
          >
            <h6 class="m-0">Funder</h6>
            <div v-if="data.funding || data.funder">
              <div v-if="data.funding">
                <ul>
                  <template v-if="Array.isArray(data.funding)">
                    <li
                      v-for="(funding, idx) in data.funding"
                      :key="idx"
                      class="mb-3"
                    >
                      <template v-if="Array.isArray(funding.funder)">
                        <div v-for="(funder, idx) in funding.funder" :key="idx">
                          <b v-if="funder.name">{{ funder.name }}</b>
                          <span v-if="funder.name && funding.identifier">
                            :&nbsp;
                          </span>
                          <span v-if="funding.identifier">
                            {{ funding.identifier }}
                          </span>
                          <span v-if="funder.role">({{ funder.role }})</span>
                        </div>
                      </template>

                      <template v-else>
                        <div class="m-0">
                          <b v-if="funding.funder && funding.funder.name">
                            {{ funding.funder.name }}
                          </b>

                          <span
                            v-if="
                              funding.funder &&
                              funding.funder.name &&
                              funding.identifier
                            "
                          >
                            :&nbsp;
                          </span>
                          <span v-if="funding.identifier">
                            {{ funding.identifier }}
                          </span>
                          <span v-if="funding.funder && funding.funder.role">
                            ({{ funding.funder.role }})
                          </span>
                        </div>
                      </template>
                      <div v-if="funding.description" class="line-height-1">
                        {{ funding.description }}
                      </div>
                    </li>
                  </template>
                  <template v-else>
                    <li class="mb-3">
                      <template v-if="Array.isArray(data.funding.funder)">
                        <div
                          v-for="(funder, idx) in data.funding.funder"
                          :key="idx"
                        >
                          <b v-if="funder.name">{{ funder.name }}</b>
                          <span v-if="funder.name && data.funding.identifier">
                            :&nbsp;
                          </span>
                          <span v-if="data.funding.identifier">
                            {{ data.funding.identifier }}
                          </span>
                          <span v-if="funder.role">({{ funder.role }})</span>
                        </div>
                      </template>

                      <template v-else>
                        <div class="m-0">
                          <b
                            v-if="
                              data.funding.funder && data.funding.funder.name
                            "
                          >
                            {{ data.funding.funder.name }}
                          </b>

                          <span
                            v-if="
                              data.funding.funder &&
                              data.funding.funder.name &&
                              data.funding.identifier
                            "
                          >
                            :&nbsp;
                          </span>
                          <span v-if="data.funding.identifier">
                            {{ data.funding.identifier }}
                          </span>

                          <span
                            v-if="
                              data.funding.funder && data.funding.funder.role
                            "
                          >
                            ({{ data.funding.funder.role }})
                          </span>
                        </div>
                      </template>
                      <div
                        v-if="data.funding.description"
                        class="line-height-1"
                      >
                        {{ data.funding.description }}
                      </div>
                    </li>
                  </template>
                </ul>
              </div>
              <template v-if="data.funder">
                <template v-if="Array.isArray(data.funder)">
                  <ul>
                    <li
                      v-for="(funder, idx) in data.funder"
                      :key="idx"
                      class="mb-3"
                    >
                      <b v-if="funder.name">{{ funder.name }}</b>
                      <span v-if="funder.name && funder.identifier">
                        :&nbsp;
                      </span>
                      <span v-if="funder.identifier">
                        {{ funder.identifier }}
                      </span>
                      <span v-if="funder.role">({{ funder.role }})</span>
                    </li>
                  </ul>
                </template>

                <template v-else>
                  <ul>
                    <li>
                      <b v-if="funder.name">{{ funder.name }}</b>
                      <span v-if="funder.name && funder.identifier">
                        :&nbsp;
                      </span>
                      <span v-if="funder.identifier">
                        {{ funder.identifier }}
                      </span>
                      <span v-if="funder.role">({{ funder.role }})</span>
                    </li>
                  </ul>
                </template>
              </template>
            </div>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>

          <!-- corrections -->
          <div
            v-if="anchorsArr.includes('corrections')"
            id="corrections"
            class="text-left border-bottom text-muted py-1 my-3"
          >
            <h6 class="m-0">Corrections</h6>
            <ul v-if="data.correction" id="correction-list">
              <li v-for="(item, idx) in data.correction" :key="idx">
                {{ item.correctionType[0].toUpperCase()
                }}{{ item.correctionType.slice(1) }}:
                {{ item.identifier.toUpperCase() }}
                <small>
                  <router-link
                    :to="{
                      name: 'Resource Page',
                      params: { id: item.identifier },
                    }"
                    class="btn btn-sec ml-3 mb-3"
                  >
                    View record on outbreak.info
                  </router-link>
                </small>
                <small>
                  <a
                    target="_blank"
                    :href="item.url"
                    class="btn btn-sec ml-3 mb-3"
                  >
                    View record on source
                  </a>
                </small>
              </li>
            </ul>
            <div v-else>
              <small>none</small>
            </div>
          </div>

          <!-- license -->
          <div
            v-if="anchorsArr.includes('license')"
            id="license"
            class="text-left border-bottom text-muted pb-3 mb-3"
          >
            <h6 class="m-0">License</h6>
            <div v-if="data.license">
              <a
                v-if="data.license.startsWith('http')"
                :href="data.license"
                target="_blank"
              >
                {{ data.license }}
              </a>
              <span v-else v-html="data.license" />
            </div>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>

          <!-- based on -->
          <div
            v-if="anchorsArr.includes('based on')"
            id="based_on"
            class="text-left border-bottom text-muted pb-3 mb-3"
          >
            <h6 class="m-0 mb-2">Based on</h6>
            <div v-if="data.isBasedOn && data.isBasedOn.length">
              <ResourceCitation
                v-for="(item, idx) in data.isBasedOn"
                :key="idx"
                :data="item"
              />
            </div>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>

          <!-- cited by -->
          <div
            v-if="anchorsArr.includes('cited by')"
            id="cited_by"
            class="text-left border-bottom text-muted pb-3 mb-3"
          >
            <h6 class="m-0 mb-2">Cited by</h6>
            <div v-if="data.citedBy && data.citedBy.length">
              <ResourceCitation
                v-for="(item, idx) in data.citedBy"
                :key="idx"
                :data="item"
              />
            </div>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>

          <!-- related -->
          <div
            v-if="anchorsArr.includes('related')"
            id="related"
            class="text-left border-bottom text-muted pb-3 mb-3"
          >
            <h6 class="m-0 mb-2">Related resources</h6>
            <div v-if="data.relatedTo && data.relatedTo.length">
              <ResourceCitation
                v-for="(item, idx) in data.relatedTo"
                :key="idx"
                :data="item"
              />
            </div>
            <div v-else>
              <small>not specified</small>
            </div>
          </div>
        </div>
      </div>
      <!-- RIGHT SIDE -->
      <div class="col-md-3 my-3">
        <ResourceSidebar
          v-if="data"
          :data="data"
          :date="dateModified"
          :type="data['@type']"
        />
      </div>
    </div>
    <div v-else class="min-height">
      Sorry, data on {{ id }} is not found. Let us know at
      <a
        :href="`mailto:help@outbreak.info?subject=Missing metadata for id ${id}`"
        target="_blank"
      >
        help@outbreak.info
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { timeFormat, timeParse } from 'd3-time-format';

import { getResourceMetadata } from '@/api/resources.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { useSeoMeta } from 'unhead';

const ResourceDescription = lazyLoad('ResourceDescription');
const ResourceSidebar = lazyLoad('ResourceSidebar');
const ClinicalTrialDescription = lazyLoad('ClinicalTrialDescription');
const ResourceCitation = lazyLoad('ResourceCitation');

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const store = adminStore();
const { loading } = storeToRefs(store);

// instead of this.$route
const route = useRoute();

const type = ref(null);
const data = ref(null);
const id = ref(null);
const dateModified = ref(null);
const anchors = ref({
  default: [
    'authors',
    'description',
    'downloads',
    'license',
    'funder',
    'based on',
    'cited by',
    'related',
  ],
  Publication: [
    'authors',
    'description',
    'funder',
    'corrections',
    'based on',
    'cited by',
    'related',
  ],
  ClinicalTrial: [
    'authors',
    'description',
    'design',
    'interventions',
    'eligibility',
    'outcome',
    'status',
    'funder',
    'publications',
    'based on',
    'related',
  ],
});
const resultsSubscription = ref(null);

const maxDescriptionLength = 160;
const researchPageMetadata = ref(null);

const anchorsArr = computed(() => {
  if (Object.keys(anchors.value).includes(type.value)) {
    return anchors.value[type.value];
  }
  return anchors.value['default'];
});

const formatDate = (dateStr) => {
  const parseDate = timeParse('%Y-%m-%d');
  const formatDate = timeFormat('%d %B %Y');
  return dateStr ? formatDate(parseDate(dateStr)) : null;
};

const getData = (id) => {
  resultsSubscription.value = getResourceMetadata(resourceUrl, id).subscribe(
    (results) => {
      data.value = results;
      if (data.value) {
        type.value = data.value['@type'];
        dateModified.value = formatDate(data.value.date);
        addMetadata(data.value);
      } else {
        type.value = null;
        dateModified.value = null;
      }
    },
  );
};

const addMetadata = (resource) => {
  const title = resource.name;

  const description = 'description' in resource ? resource.description : 'abstract' in resource ? resource.abstract : resource.name;

  const strippedDescription = description.replace(/(<([^>]+)>)/gi, "");

  const truncatedDescription = strippedDescription.length > maxDescriptionLength ? `${strippedDescription.substring(0, maxDescriptionLength)}…` : strippedDescription;

  researchPageMetadata.value = {
    title: title,
    description: truncatedDescription,
    ogTitle: title,
    ogDescription: truncatedDescription,
    twitterTitle: title,
    twitterDescription: truncatedDescription,
    keywords: '',
  }

  useSeoMeta(researchPageMetadata.value);
}

onMounted(() => {
  id.value = route.params.id;
  getData(id.value);
});

onUnmounted(() => {
  if (resultsSubscription.value) {
    resultsSubscription.value.unsubscribe();
  }
});

watch(
  () => route.params,
  (newRoute, oldRoute) => {
    if (newRoute) {
      id.value = newRoute.id;
      getData(newRoute.id);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.pub-type {
  opacity: 0.6;
}

.helper {
  line-height: 1.2em;
}
.resource-anchor-color {
  color: rgba(255, 255, 255, 0.5);
}

.section-header {
  text-transform: uppercase;
}
.min-height {
  min-height: 72vh;
}
</style>
