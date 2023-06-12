<template>
  <div>
    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
        style="min-height: 70vh"
      >
        <div class="container half-page">
          <h1>About</h1>
          <img
            class="w-50 mb-5"
            src="@/assets/logo-full-01.svg"
            alt="Outbreak.info"
          />
          <p class="text-left focustext py-2">
            In response to the current outbreak of SARS-CoV-2 (the virus that
            causes COVID-19), researchers worldwide have been generating and
            openly sharing data, publications, reagents, code, protocols, and
            more. Broad sharing of these resources improves the speed and
            efficiency of science. Unfortunately, there are no uniform standards
            and repositories for collecting all this information in one place.
          </p>
          <p class="text-left focustext pt-2">
            <strong>Outbreak.info</strong>
            aggregates data across scientific sources, providing tools to meet
            three major aims:
          </p>
          <ul class="focustext text-left">
            <li class="large">
              Track daily developments in SARS-CoV-2 variants
            </li>
            <li class="large">
              Integrate publications, preprints, clinical trials, datasets,
              protocols, and other resources into one searchable library of
              COVID-19 research
            </li>
            <li class="large">Track trends in COVID-19 cases and deaths</li>
          </ul>
          <div class="text-left focustext ml-4">
            <router-link :to="{ name: 'SituationReports' }">
              <h4 class="mb-0">SARS-CoV-2 Variants</h4>
            </router-link>
            <p>
              Outbreak.info collects and visualizes genomic data from the
              <a href="https://www.gisaid.org/" target="_blank">
                GISAID Initiative
              </a>
              . With over {{ gisaidCount }} million SARS-CoV-2 sequences
              uploaded to GISAID, Outbreak.info makes this data more accessible,
              providing daily surveillance reports about lineages and mutations,
              countries, states, and counties.
            </p>

            <router-link :to="{ name: 'Resource Summary' }">
              <h4 class="mb-0">Research Library</h4>
            </router-link>
            <p>
              Outbreak.info aggregates SARS-CoV-2 and COVID-19 information into
              a single site to increase their findability and reusability. The
              platform standardizes the metadata describing these resources,
              providing a web interface to easily search over
              {{ resourceCount }} resources.
            </p>

            <router-link :to="{ name: 'Epidemiology' }">
              <h4 class="mb-0">COVID-19 Cases &amp; Deaths</h4>
            </router-link>
            <p>
              Outbreak.info serves as a data integration tool to make COVID-19
              data more usable. The platform tracks case and death trends around
              the world and across states/counties with interactive maps,
              location comparison tools, data tables, and more.
            </p>
          </div>

          <p class="text-left focustext mty-5 py-4 border-top">
            Outbreak.info is a project from the
            <a
              href="https://www.scripps.edu/faculty/hughes/"
              rel="noreferrer"
              target="_blank"
            >
              Hughes
            </a>
            ,
            <a href="http://sulab.org/" rel="noreferrer" target="_blank">Su</a>
            ,
            <a href="http://wulab.io/" rel="noreferrer" target="_blank">Wu</a>
            , and
            <a
              href="https://andersen-lab.com/"
              rel="noreferrer"
              target="_blank"
            >
              Andersen
            </a>
            labs at Scripps Research and is supported
            <span v-if="funding" class="my-4">
              by the
              <span v-for="(grant, idx) in funding" :key="idx">
                <span v-if="grant.funder.name">{{ grant.funder.name }}</span>
                ({{ grant.identifier }})
                <span v-if="idx < funding.length - 2">,</span>
                <span v-if="idx === funding.length - 2">, and</span>
              </span>
              .
            </span>
          </p>

          <div
            class="d-flex flex-wrap align-items-center justify-content-center"
          >
            <button class="btn btn-main-outline mx-3">
              <router-link :to="{ name: 'Sources' }" class="text-left">
                data sources
              </router-link>
            </button>

            <button class="btn btn-main-outline mx-3">
              <router-link :to="{ name: 'Latest' }" class="text-left">
                latest changes
              </router-link>
            </button>

            <button class="btn btn-main-outline mx-3">
              <a href="https://github.com/outbreak-info" target="_blank">
                Code
              </a>
            </button>

            <div id="subscribe" class="mx-3">
              <EmailSubscription />
            </div>
          </div>
        </div>
      </div>

      <!-- TEAM -->
      <div class="bg-light d-flex justify-content-center align-items-center">
        <div
          class="bg-light d-flex flex-column justify-content-center align-items-center w-75 border-top py-5"
        >
          <h4 class="mb-4">Outbreak.info team</h4>
          <div class="d-flex flex-wrap">
            <div
              v-for="(person, idx) in team"
              :key="idx"
              class="team-member d-flex flex-column align-items-center mx-5 my-3"
            >
              <img
                :src="`/assets/team/${person.img}`"
                class="profile-pic text-"
                :alt="person.name"
              />
              <span class="mt-1">{{ person.name }}</span>
              <div class="d-flex">
                <a
                  v-if="person.email"
                  :href="`mailto:${person.email}`"
                  target="_blank"
                  class="mr-2"
                >
                  <font-awesome-icon :icon="['fas', 'at']" />
                </a>
                <a
                  v-if="person.twitter"
                  :href="person.twitter"
                  target="_blank"
                  class="mr-2"
                >
                  <font-awesome-icon :icon="['fab', 'twitter']" />
                </a>
                <a
                  v-if="person.linkedin"
                  :href="person.linkedin"
                  target="_blank"
                  class="mr-2"
                >
                  <font-awesome-icon :icon="['fab', 'linkedin-in']" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMER TEAM -->
      <div
        class="bg-light d-flex justify-content-center align-items-center w-100"
      >
        <div
          class="bg-light d-flex flex-column justify-content-center align-items-center w-75 border-top py-5"
        >
          <h5 class="mb-4">Former team members</h5>
          <div class="d-flex flex-wrap">
            <div
              v-for="(person, idx) in formerTeam"
              :key="idx"
              class="team-member d-flex flex-column align-items-center mx-5 my-3"
            >
              <span class="mt-1">{{ person.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-light d-flex justify-content-center align-items-center">
        <div id="jobs" class="bg-light border-top pt-3 pb-5">
          <h4 class="mb-4">Open positions</h4>
          <Jobs />
        </div>
      </div>

      <div class="d-flex justify-content-center w-100 border-top py-5 mx-auto">
        <a
          class="twitter-timeline"
          data-width="500"
          data-height="400"
          href="https://twitter.com/DiseaseOutbreak?ref_src=twsrc%5Etfw"
        >
          Tweets by DiseaseOutbreak
        </a>
      </div>

      <div class="col-sm-12 jumbotron rounded-0 bg-grey__darker mb-0">
        <h4 class="text-light m-2">
          Notice a bug, know of a COVID-19 data source, or want to suggest a
          feature?
          <svg viewBox="0 0 100 3">
            <line x1="0" y1="0" x2="100" stroke="#D13B62" />
          </svg>
          <a
            class="btn btn-outline-light mt-5"
            href="https://github.com/outbreak-info/outbreak.info/issues"
            rel="noreferrer"
            target="_blank"
          >
            Submit an issue on Github
          </a>
        </h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { getResourceTotal } from '@/api/resources.js';
import { getSequenceCount } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const Jobs = lazyLoad('Jobs');
const EmailSubscription = lazyLoad('EmailSubscription');

const resourceCount = ref(null);
const gisaidCount = ref(null);
const resourceSubscription = ref(null);
const genomicsSubscription = ref(null);

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

const store = adminStore(); // importing only required store
const { funding, team, formerTeam } = storeToRefs(store); // admin store state variables needed in this component

onMounted(() => {
  let twitterScript = document.createElement('script');
  twitterScript.setAttribute('src', 'https://platform.twitter.com/widgets.js');
  document.head.appendChild(twitterScript);

  // get totals from the API
  resourceSubscription.value = getResourceTotal(resourceUrl).subscribe(
    (total) => {
      resourceCount.value = total.floor;
    },
  );
  genomicsSubscription.value = getSequenceCount(
    genomicsUrl,
    null,
    true,
    true,
  ).subscribe((total) => {
    gisaidCount.value = total;
  });

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onUnmounted(() => {
  if (resourceSubscription.value) {
    resourceSubscription.value.unsubscribe();
  }
  if (genomicsSubscription.value) {
    genomicsSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss">
.team-member {
  flex-basis: 15%;
}

.profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: contain;
}

.w-30 {
  width: 30% !important;
}

.large {
  font-size: large;
}
</style>
