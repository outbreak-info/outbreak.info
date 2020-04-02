<template>
<div class="source my-3">
  <small>Source:
    <span v-for="(source, idx) in sources" :key="idx">
      <a :href="source.dataSourceUrl" target="_blank" rel="noreferrer">{{ source.dataSourceName}} {{source.scope}}</a>
      <span v-if="idx < sources.length-1">; </span>
    </span>, updated every day</small>
</div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DataSource",
  props: {},
  data() {
    return {
      sources: [{
          id: "JHU",
          dataSourceName: "Johns Hopkins University Center for Systems Science and Engineering",
          scope: "(non-U.S. data)",
          dataSourceUrl: "https://github.com/CSSEGISandData/COVID-19"
        },
        {
          id: "NYT",
          dataSourceName: "The New York Times",
          scope: "(U.S. data)",
          dataSourceUrl: "https://github.com/nytimes/covid-19-data"
        }
      ]
    };
  },
  watch: {},
  methods: {}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
