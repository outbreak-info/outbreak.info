<template>
  <div>
  <!-- <div v-html="htmlContent">
  </div> -->
  <iframe class="w-100" height="1000" :src="reportUrl"/>
  </div>
</template>

<script>
import axios from "axios";
import Vue from "vue";
export default Vue.extend({
  name: "SituationReport",
  data() {
    return {
      reportUrl: null,
      htmlPreface: "https://andersen-lab.github.io/hCoV19-sitrep",
    };
  },
  mounted() {
    const url = this.$route.params.url.split("/");
    console.log(url)
    this.reportUrl = `${this.htmlPreface}/${url.slice(-1)[0]}`;
  }
})
</script>

<style lang="scss" scoped>
.max-height {
  height: 1000px;
}
</style?
