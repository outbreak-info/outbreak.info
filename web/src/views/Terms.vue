<template>
  <div class="row" style="min-height: 75vh;">
    <div class="col-sm-12 my-5">

    <div class="container text-left mb-5">
      <h1 class="text-highlight">Terms of Use</h1>
      <h4>Disclaimer</h4>
      <p>
        Every effort has been made to ensure the accuracy and completeness of
        the information and data provided on this website. However,
        <a href="https://www.scripps.edu/" target="_blank" rel="noreferrer"
          >Scripps Research</a
        >
        makes no warranties, expressed or implied, regarding errors or omissions
        and assume no legal liability or responsibility for loss or damage
        resulting from the use or misuse of information contained within.
        Scripps Research reserves the right to revise the data pursuant to
        further analysis and review.
      </p>
    </div>

    <DataUsage class="container text-left"/>
    <CiteUs class="container text-left mt-5"/>
  </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";
import DataUsage from "@/components/DataUsage.vue";
import CiteUs from "@/components/CiteUs.vue";

export default Vue.extend({
  name: "Terms",
  components: {
    DataUsage,
    CiteUs
  }
});
</script>
