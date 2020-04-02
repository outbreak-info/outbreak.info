<template>
<div class="source my-3">
  <small>Source:
    <span v-for="(source, idx) in sources" :key="idx">
      <a :href="source.url" target="_blank" rel="noreferrer">{{ source.name}} {{source.scope}}</a>
      <span v-if="idx < sources.length-1">; </span>
    </span>, updated every day</small>
</div>
</template>

<script lang="ts">
import Vue from "vue";

import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "DataSource",
  props: {},
  computed: {
    ...mapState("admin", ["sources"]),
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
