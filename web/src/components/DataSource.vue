<template>
  <div class="source my-3">
    <small
      >Source:
      <a :href="dataSourceUrl" target="_blank" rel="noreferrer">{{
        dataSourceName
      }}</a
      >, updated usually every day</small
    >
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DataSource",
  props: {},
  data() {
    return {
      dataSourceName:
        "Johns Hopkins University Center for Systems Science and Engineering",
      dataSourceUrl: "https://github.com/CSSEGISandData/COVID-19"
    };
  },
  watch: {},
  methods: {}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
