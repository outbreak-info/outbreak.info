<template>
<div>
  <div class="source-container mb-5 " v-for="source in sources" :key="source.id">
    <h5 class="m-0 mb-1 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <a :href="source.url" target="_blank" rel="noreferrer" class="d-flex align-items-center justify-content-between">
          {{ source.name }}
        </a>
        <div class="ml-3" v-if="metadata && metadata[source.api_id]">
          <div class="text-muted badge bg-grey__lightest ml-3 fa-xs" v-if="metadata[source.api_id].dateUpdated">
            <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ metadata[source.api_id].dateUpdated }}
          </div>
          <template v-if="metadata[source.api_id].count">
            <!-- link to resources page -->
            <router-link :to="{name: 'Resources', query: {filter: 'curatedBy.name:' + source.query}}" class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1" v-if="source.query">
              <font-awesome-icon class="mr-1" :icon="['far', 'file']" /> <span v-html="metadata[source.api_id].count"></span>
            </router-link>

            <!-- link to genomics -->
            <router-link :to="{name: 'SituationReports'}" class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1" v-else-if="source.id == 'gisaid'">
              <font-awesome-icon class="mr-1" :icon="['far', 'file']" /> <span v-html="metadata[source.api_id].count"></span>
            </router-link>
            <!-- link to epi -->
            <router-link :to="{name: 'Epidemiology'}" class="text-muted badge bg-grey__lightest ml-3 fa-xs mt-1" v-else-if="source.id == 'JHU'">
              <font-awesome-icon class="mr-1" :icon="['far', 'file']" /> <span v-html="metadata[source.api_id].count"></span>
            </router-link>
          </template>
        </div>
      </div>

      <a :href="source.url" target="_blank" rel="noreferrer" class="d-flex align-items-center justify-content-between">
        <img class="ml-3" :src="require(`@/assets/resources/${source.img_lg}`)" :alt="source.name" width="auto" height="32" v-if="source.img_lg" />
        <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" width="auto" height="32" v-else-if="source.img" />
      </a>
    </h5>
    <p v-html="source.description" class="text-justify mb-0"></p>

    <div class="my-2">


      <small v-if="source.license" class="d-block">
        <span class="font-weight-700">data license</span>: <a :href="source.license.url" v-if="source.license.name" target="_blank">{{source.license.name}}</a><a :href="source.license.url" v-else-if="source.license.url"
          target="_blank">{{source.license.url}}</a>
      </small>
      <small v-if="source.citation" class="d-block">
        <span class="font-weight-700">how to cite</span>: <span v-html="source.citation"></span>
      </small>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons/faClock";
import {
  faFile
} from "@fortawesome/free-regular-svg-icons/faFile";

library.add(faClock, faFile);

export default Vue.extend({
  name: "SourceDescription",
  components: {
    FontAwesomeIcon
  },
  props: {
    sources: Array,
    metadata: Object
  }
});
</script>
