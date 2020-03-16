<template>
  <div>
    <div class="row m-0">
      <div class="col-sm-12 bg-light  d-flex justify-content-center align-items-center" style="min-height: 70vh;">
        <div class="container half-page">
          <h1>About</h1>
          <img src="@/assets/logo-full-01.svg" alt="Outbreak.info" class="w-75 mb-5"/>
          <p class="text-left focustext">
            During outbreaks of emerging diseases such as COVID-19, efficiently
            collecting, sharing, and integrating data is critical to scientific
            research.
          </p>
          <p class="text-left focustext">
            <b>outbreak.info</b> is a project from the
            <a href="http://sulab.org/" rel="noreferrer" target="_blank">Su lab</a>
            at
            <a href="scripps.edu" rel="noreferrer" target="_blank"
              >Scripps Research</a
            >
            to aggregate all this information into a single location.
          </p>
        </div>
      </div>
      <Logos class="col-sm-12 bg-grey"/>
      <div class="col-sm-12 jumbotron rounded-0 bg-grey__darker mb-0">
        <h4 class="text-light m-2">
          Notice a bug, know of a COVID-19 data source, or want to suggest a
          feature?
          <svg viewBox="0 0 100 3">
            <line x1="0" y1="0" x2="100" stroke="#D13B62" />
          </svg>
          <a
            class="btn btn-outline-light mt-5"
            href="https://github.com/SuLab/outbreak.info/issues"
            rel="noreferrer"
            target="_blank"
            >Submit an issue on Github</a
          >
        </h4>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import Logos from "@/components/Logos.vue";

export default Vue.extend({
  name: "About",
  components: {
    Logos
  }
});
</script>
