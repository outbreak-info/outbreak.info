<template>
<div>
  <!-- <div v-html="htmlContent">
  </div> -->
  <iframe class="w-100" height="1000" :src="reportUrl" />
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

    axios.get("https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/metadata.json").then(response => {
      console.log(response.data)
      const report = response.data.filter(d => d.name == this.$route.params.mutation).sort((a, b) => a.date > b.date ? -1 : 1)[0];
      console.log(this.$route.params.mutation)
      console.log(report)
      const url = report.url.split("/");
      this.reportUrl = `${this.htmlPreface}/${url.slice(-1)[0]}`;
    })

  }
})
</script>

<style lang="scss" scoped>
.max-height {
  height: 1000px;
}
</style?
