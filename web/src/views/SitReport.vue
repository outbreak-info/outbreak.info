<template>
  <div class="half-page">
    <!-- <div v-html="htmlContent">
  </div> -->
    <iframe class="w-100" height="1000" :src="reportUrl" @load="load" />

    <p v-if="iframeError" class="my-5">
      Your browser does not support iframes.
      <a :href="reportUrl" target="_blank">Please view the report on GitHub</a>
      .
    </p>

    <button class="btn btn-main-outline my-5">
      <a :href="reportUrl" target="_blank">View report on GitHub</a>
    </button>
  </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
export default Vue.extend({
  name: 'SituationReport',
  data() {
    return {
      reportUrl: null,
      htmlPreface: 'https://andersen-lab.github.io/hCoV19-sitrep',
      iframeError: false,
    };
  },
  methods: {
    load(evt) {
      if (!evt.returnValue) {
        this.iframeError = true;
        console.log("Browser doesn't support iFrames");
      }
    },
  },
  mounted() {
    axios
      .get(
        'https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/curated_lineages.json',
      )
      .then((response) => {
        const report = response.data.filter(
          (d) => d.identifier == this.$route.params.mutation,
        );
        this.reportUrl = report.length == 1 ? report[0].url : null;
      });
  },
});
</script>

<style lang="scss" scoped>
.max-height {
  height: 1000px;
}
</style>
