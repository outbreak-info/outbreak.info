<template>
  <div>
    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
        style="min-height: 70vh;"
      >
        <div class="container half-page">
          <h1>About</h1>
          <img
            src="@/assets/logo-full-01.svg"
            alt="Outbreak.info"
            class="w-50 mb-5"
          />
          <p class="text-left focustext">
            In response to the current outbreak of SARS-CoV-2 (the virus that
            causes COVID-19), researchers worldwide have been generating and
            openly sharing data, publications, reagents, code, protocols, and
            more. Broad sharing of these research resources improves the speed
            and efficiency of science. Unfortunately, there are no uniform
            standards and repositories for collecting all this information in
            one place.
          </p>
          <p class="text-left focustext">
            <b>Outbreak.info</b> focuses on aggregating all SARS-CoV-2 /
            COVID-19 information into a single site. We focus on making the
            metadata about these resources more standardized, on creating web
            interfaces to make the resources more findable, and on a few focused
            data integration efforts to make data more usable.
          </p>

          <p class="focustext text-left">
            <router-link :to="{ name: 'Sources' }" class="text-left"
              >Learn more about our data sources</router-link
            >
          </p>

          <p class="focustext text-left">
            <router-link :to="{ name: 'Latest' }" class="text-left"
              >View latest changes</router-link
            >
          </p>
        </div>
      </div>

      <Logos class="col-sm-12 bg-grey p-0" />
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

<script lang="js">
import Vue from "vue";

import Logos from "@/components/Logos.vue";

export default Vue.extend({
  name: "About",
  components: {
    Logos
  }
});
</script>
