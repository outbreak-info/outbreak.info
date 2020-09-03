<template>
<div>
  <h5 id="citing">Please cite the authors and curators of the data:</h5>

  <div id="outbreakinfo-citation" class="mb-2 py-3 border-top border-bottom">
    <h6 class="m-0">outbreak.info</h6>
    <p class="m-0">
      {{outbreak.authors}} <i>outbreak.info</i>. Available online: <a href="https://outbreak.info/" target="_blank">https://outbreak.info/</a> (2020)
    </p>
    <small class="d-block">
      <span class="font-weight-500">data license</span>: <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0</a>
    </small>

  </div>

  <div id="epi-citation" class="mb-2 py-3 border-bottom">
    <h6 class="m-0">Epidemiology data</h6>
    <div v-for="(source, eIdx) in sources" :key="eIdx" class="mb-4 line-height-1">
      <span class="text-highlight">{{source.scope}}:</span> <span v-html="source.citation"></span>
      <small v-if="source.license" class="d-block  mt-1">
        <span class="font-weight-500">data license</span>: <a :href="source.license.url" v-if="source.license.name" target="_blank">{{source.license.name}}</a><a :href="source.license.url" v-else-if="source.license.url">{{source.license.url}}</a>
      </small>
    </div>
  </div>

  <div id="epi-citation" class="mb-2 py-3 border-bottom">
    <h6 class="m-0">Resources</h6>
    <div v-for="(sourceGroup, rIdx) in resources" :key="rIdx">
      <div v-for="(source, sIdx) in sourceGroup.sources" :key="sIdx"  class="mb-4  line-height-1">
      <span class="text-highlight">{{source.name}}:</span> <span v-html="source.citation"></span>
      <small v-if="source.license" class="d-block mt-1">
        <span class="font-weight-500">data license</span>: <a :href="source.license.url" v-if="source.license.name" target="_blank">{{source.license.name}}</a><a :href="source.license.url" v-else-if="source.license.url">{{source.license.url}}</a>
      </small>
      </div>
    </div>
  </div>

</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "CiteUs",
  components: {},
  computed: {
    ...mapState("admin", ["outbreak", "sources", "geoSources", "resources"])
  }
});
</script>
