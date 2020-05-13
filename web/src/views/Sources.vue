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
            <h3>Epidemiology Data</h3>
            <div
              class="epi-container"
              v-for="source in sources"
              :key="source.id"
            >
            <h5 class="m-0 mb-1">
              <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                source.name
              }}
              <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-if="source.img" />
            </a>
            </h5>
              <p v-html="source.description" class="text-justify"></p>
            </div>
          </div>

          <div class="text-left mt-5">
            <h3>Geographic Data</h3>
            <div
              class="epi-container"
              v-for="source in geoSources"
              :key="source.id"
            >
            <h5 class="m-0 mb-1">
              <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                source.name
              }}
              <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-if="source.img"/>
            </a>
            </h5>
              <p class="text-justify">
                {{ source.description }}
              </p>
            </div>
          </div>

          <div class="text-left mt-5">
            <h3 class="mb-3 border-top pt-4">Resources</h3>
            <div
              v-for="(resource, idx) in resources"
              :key="idx"
              :class="[idx === 0 ? 'mb-5' : 'my-5']"
            >
              <h4>{{ resource.category }}</h4>
              <div
                class="epi-container"
                v-for="source in resource.sources"
                :key="source.id"
              >
                <h5 class="m-0 mb-1">
                  <a :href="source.url" target="_blank" rel="noreferrer"  class="d-flex align-items-center justify-content-between">{{
                    source.name
                  }}
                  <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" height = "32" v-if="source.img" />
                </a>
                </h5>
                <p class="text-justify" v-html="source.description"></p>
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
