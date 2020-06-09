<template>
  <div class="source my-3">
    <small
      >Source:
      <span v-for="(source, idx) in filteredSources" :key="idx">
        <a :href="source.url" target="_blank" rel="noreferrer"
          >{{ source.name }} <span v-if="source.scope">({{ source.scope }})</span></a
        >
        <span v-if="idx < filteredSources.length - 1">; </span> </span
      >, updated daily.
      <router-link :to="{ name: 'Sources' }">Read more</router-link>
    </small>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { mapState } from "vuex";

export default Vue.extend({
  name: "DataSource",
  props: {
    ids: Array
  },
  computed: {
    ...mapState("admin", ["sources"]),
    filteredSources() {
      if (this.ids && this.ids.length) {
        return this.sources.filter(d => this.ids.includes(d.id));
      } else {
        return this.sources;
      }
    }
  },
  data() {
    return {};
  },
  watch: {},
  methods: {}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
