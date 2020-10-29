<template>
<div>
  <div class="source-container mb-5 " v-for="source in sources" :key="source.id">
    <h5 class="m-0 mb-1">
      <a :href="source.url" target="_blank" rel="noreferrer" class="d-flex align-items-center justify-content-between">{{
      source.name
    }}
        <img class="ml-3" :src="require(`@/assets/resources/${source.img_lg}`)" :alt="source.name" width="auto" height="32" v-if="source.img_lg" />
        <img class="ml-3" :src="require(`@/assets/resources/${source.img}`)" :alt="source.name" width="auto" height="32" v-else-if="source.img" />
      </a>
    </h5>
    <p v-html="source.description" class="text-justify mb-0"></p>

<div class="my-2">


    <small v-if="source.license" class="d-block">
      <span class="font-weight-700">data license</span>: <a :href="source.license.url" v-if="source.license.name" target="_blank">{{source.license.name}}</a><a :href="source.license.url" v-else-if="source.license.url" target="_blank">{{source.license.url}}</a>
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

export default Vue.extend({
  name: "SourceDescription",
  props: {
    sources: Array
  }
});
</script>
