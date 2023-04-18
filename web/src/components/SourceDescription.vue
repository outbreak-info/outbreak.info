<template>
  <div>
    <div
      v-for="source in sources"
      :key="source.id"
      class="source-container mb-5"
    >
      <h5 class="m-0 mb-1 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <a
            :href="source.url"
            target="_blank"
            rel="noreferrer"
            class="d-flex align-items-center justify-content-between"
          >
            {{ source.name }}
          </a>
          <div v-if="metadata && metadata[source.api_id]" class="ml-3">
            <div
              v-if="metadata[source.api_id].dateUpdated"
              class="text-muted badge bg-grey__lightest ml-3 fa-xs"
            >
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
              Updated {{ metadata[source.api_id].dateUpdated }}
            </div>
            <template v-if="metadata[source.api_id].count">
              <!-- link to resources page -->
              <router-link
                v-if="source.query"
                :to="{
                  name: 'Resources',
                  query: { filter: 'curatedBy.name:' + source.query },
                }"
                class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1"
              >
                <font-awesome-icon class="mr-1" :icon="['far', 'file']" />
                <span v-html="metadata[source.api_id].count" />
              </router-link>

              <!-- link to genomics -->
              <router-link
                v-else-if="source.id === 'gisaid'"
                :to="{ name: 'SituationReports' }"
                class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1"
              >
                <font-awesome-icon class="mr-1" :icon="['far', 'file']" />
                <span v-html="metadata[source.api_id].count" />
              </router-link>
              <!-- link to epi -->
              <router-link
                v-else-if="source.id === 'JHU'"
                :to="{ name: 'Epidemiology' }"
                class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1"
              >
                <font-awesome-icon class="mr-1" :icon="['far', 'file']" />
                <span v-html="metadata[source.api_id].count" />
              </router-link>
            </template>
          </div>
        </div>

        <a
          :href="source.url"
          target="_blank"
          rel="noreferrer"
          class="d-flex align-items-center justify-content-between"
        >
          <img
            v-if="source.img_lg"
            class="ml-3"
            :src="`/assets/resources/${source.img_lg}`"
            :alt="source.name"
            height="32"
          />
          <img
            v-else-if="source.img"
            class="ml-3"
            :src="`/assets/resources/${source.img}`"
            :alt="source.name"
            height="32"
          />
        </a>
      </h5>
      <p class="text-justify mb-0" v-html="source.description" />

      <div class="my-2">
        <small v-if="source.license" class="d-block">
          <span class="font-weight-700">data license</span>
          :
          <a
            v-if="source.license.name"
            :href="source.license.url"
            target="_blank"
          >
            {{ source.license.name }}
          </a>
          <a
            v-else-if="source.license.url"
            :href="source.license.url"
            target="_blank"
          >
            {{ source.license.url }}
          </a>
        </small>
        <small v-if="source.citation" class="d-block">
          <span class="font-weight-700">how to cite</span>
          :
          <span v-html="source.citation" />
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sources: Array,
  metadata: Object,
});
</script>
