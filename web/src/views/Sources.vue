<template>
  <div>
    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
      >
        <div class="container half-page">
          <div class="d-flex align-items-center justify-content-between mb-5">
            <h1>Data Sources</h1>
            <router-link class="btn btn-main" :to="{ name: 'Contributing' }"
              >Contribute data</router-link
            >
          </div>

          <div class="text-left">
            <h3 id="epidemiology">Epidemiology Data</h3>
            <div
              class="epi-container"
              v-for="source in sources"
              :key="source.id"
            >
            <h5 class="m-0 mb-1">
              <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                source.name
              }}
              <img class="ml-3" :src="require(`@/assets/resources/${source.img_lg}`)" :alt="source.name" height = "32" v-if="source.img_lg" />
              <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-else-if="source.img" />
            </a>
            </h5>
              <p v-html="source.description" class="text-justify mb-4"></p>
            </div>
          </div>

          <div class="text-left mt-5">
            <h3 id="geographic">Geographic Data</h3>
            <div
              class="epi-container"
              v-for="source in geoSources"
              :key="source.id"
            >
            <h5 class="m-0 mb-1">
              <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                source.name
              }}
              <img class="ml-3" :src="require(`@/assets/resources/${source.img_lg}`)" :alt="source.name" height = "32" v-if="source.img_lg" />
              <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-else-if="source.img" />
            </a>
            </h5>
              <p class="text-justify mb-4">
                {{ source.description }}
              </p>
            </div>
          </div>

          <div class="text-left mt-5">
            <h3 id="resources" class="mb-3 border-top pt-4">Resources</h3>
            <div
              v-for="(resource, idx) in resources"
              :key="idx"
              :class="[idx === 0 ? 'mb-5' : 'my-5']"
            >
              <h4>{{ resource.category }}</h4>
              <div
                class="resources-container"
                v-for="source in resource.sources"
                :key="source.id"
              >
                <h5 class="m-0 mb-1">
                  <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                    source.name
                  }}
                  <img class="ml-3" :src="require(`@/assets/resources/${source.img_lg}`)" :alt="source.name" height = "32" v-if="source.img_lg" />
                  <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-else-if="source.img" />
                </a>
                </h5>
                <p class="text-justify mb-4" v-html="source.description"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { mapState } from "vuex";

export default Vue.extend({
  name: "Sources",
  components: {},
  computed: {
    ...mapState("admin", ["sources", "geoSources", "resources"])
  }
});
</script>
