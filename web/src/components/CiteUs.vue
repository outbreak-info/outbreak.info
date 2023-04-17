<template>
  <div>
    <h5 id="citing">Please cite the authors and curators of the data:</h5>

    <div id="outbreakinfo-citation" class="mb-2 py-3 border-top border-bottom">
      <div class="my-32">
        <h5 class="m-0 mb-1">outbreak.info Genomics Reports</h5>
        <span v-html="genomicsCitation" />
      </div>

      <div class="my-3">
        <h5 class="m-0 mb-1">outbreak.info Research Library</h5>
        <span v-html="resourcesCitation" />
      </div>

      <small class="d-block mt-2">
        <span class="font-weight-700">data license</span>
        : All data and content that our team creates is covered by the
        <a
          href="https://creativecommons.org/publicdomain/zero/1.0/"
          target="_blank"
          rel="noreferrer"
        >
          Creative Commons CC0 Waiver
        </a>
        , which states that you can copy, modify, distribute and perform the
        work, even for commercial purposes, all without asking permission.
        However, consistent with scientific norms, we ask that you cite
        <router-link to="/">outbreak.info</router-link>
        in any tools or publications that use
        <router-link to="/">outbreak.info</router-link>
        .
      </small>
    </div>

    <div id="epi-citation" class="mb-2 py-3 border-bottom">
      <h6 class="m-0">COVID-19 Cases &amp; Deaths data</h6>
      <div
        v-for="(source, eIdx) in sources"
        :key="eIdx"
        class="mb-4 line-height-1"
      >
        <span class="text-highlight">{{ source.scope }}:</span>
        <span v-html="source.citation" />
        <small v-if="source.license" class="d-block mt-1">
          <span class="font-weight-700">data license</span>
          :
          <a
            v-if="source.license.name"
            :href="source.license.url"
            target="_blank"
          >
            {{ source.license.name }}
          </a>
          <a v-else-if="source.license.url" :href="source.license.url">
            {{ source.license.url }}
          </a>
        </small>
      </div>
    </div>

    <div id="genomics-citation" class="mb-2 py-3 border-bottom">
      <h6 class="m-0">Genomic data</h6>
      <div v-for="(source, gIdx) in genomicSources" :key="gIdx">
        <span class="text-highlight">{{ source.name }}:</span>
        <span v-html="source.citation" />
        <small v-if="source.license" class="d-block mt-1">
          <span class="font-weight-700">data license</span>
          :
          <a
            v-if="source.license.name"
            :href="source.license.url"
            target="_blank"
          >
            {{ source.license.name }}
          </a>
          <a v-else-if="source.license.url" :href="source.license.url">
            {{ source.license.url }}
          </a>
        </small>
      </div>
    </div>

    <div id="resources-citation" class="mb-2 py-3 border-bottom">
      <h6 class="m-0">Research Library</h6>
      <div v-for="(sourceGroup, rIdx) in resources" :key="rIdx">
        <div
          v-for="(source, sIdx) in sourceGroup.sources"
          :key="sIdx"
          class="mb-4 line-height-1"
        >
          <span class="text-highlight">{{ source.name }}:</span>
          <span v-html="source.citation" />
          <small v-if="source.license" class="d-block mt-1">
            <span class="font-weight-700">data license</span>
            :
            <a
              v-if="source.license.name"
              :href="source.license.url"
              target="_blank"
            >
              {{ source.license.name }}
            </a>
            <a v-else-if="source.license.url" :href="source.license.url">
              {{ source.license.url }}
            </a>
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { adminStore } from '@/stores/adminStore';

const store = adminStore();

const {
  genomicsCitation,
  resourcesCitation,
  sources,
  geoSources,
  resources,
  genomicSources,
} = storeToRefs(store);
</script>
