<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5" style="min-height: 70vh;">
      <div class="container half-page">
        <h1>About</h1>
        <img src="@/assets/logo-full-01.svg" alt="Outbreak.info" class="w-50 mb-5" />
        <p class="text-left focustext py-2">
          In response to the current outbreak of SARS-CoV-2 (the virus that
          causes COVID-19), researchers worldwide have been generating and
          openly sharing data, publications, reagents, code, protocols, and
          more. Broad sharing of these research resources improves the speed
          and efficiency of science. Unfortunately, there are no uniform
          standards and repositories for collecting all this information in
          one place.
        </p>
        <p class="text-left focustext py-2">
          <b>Outbreak.info</b> aggregates SARS-CoV-2 and COVID-19 information into a single site to increase their findability and reusability. We standardize the metadata describing these resources, providing a web interface to easily search over
          100,000 resources. The platform also serves as a data integration tool that makes COVID-19 data more usable.
        </p>
        <p class="text-left focustext py-2">
          We also are tracking developments about new SARS-CoV-2 mutations and epidemiological trends, offering key insights and daily reports.
        </p>

        <p class="text-left focustext mty-5 py-4 border-top">
          Outbreak.info is a project from the <a href="http://sulab.org/" rel="noreferrer" target="_blank">Su</a>, <a href="http://wulab.io/" rel="noreferrer" target="_blank">Wu</a>, and <a href="https://andersen-lab.com/" rel="noreferrer"
            target="_blank">Andersen</a> labs at Scripps Research and is supported <span class="my-4" v-if="funding">by the <span v-for="(grant, idx) in funding" :key="idx">
              <span v-if="grant.funder.name">{{ grant.funder.name }}</span> ({{ grant.identifier }})<span v-if="idx < funding.length - 2">, </span>
              <span v-if="idx == funding.length - 2">, and </span>
            </span>.</span>
        </p>

        <button class="btn btn-main-outline mx-3">
          <router-link :to="{ name: 'Sources' }" class="text-left">data sources</router-link>
        </button>

        <button class="btn btn-main-outline mx-3">
          <router-link :to="{ name: 'Latest' }" class="text-left">latest changes</router-link>
        </button>

        <button class="btn btn-main-outline mx-3">
          <a href="https://github.com/outbreak-info" target="_blank">Code</a>
        </button>
      </div>
    </div>

    <!-- TEAM -->
    <div class="bg-light d-flex justify-content-center align-items-center">
      <div class="bg-light d-flex flex-column justify-content-center align-items-center w-75 border-top py-5">
        <h3 class="mb-4">Outbreak.info team</h3>
        <div class="d-flex flex-wrap">
          <div v-for="(person, idx) in team" :key="idx" class="team-member d-flex flex-column align-items-center mx-5 my-3">
            <img :src="require(`@/assets/team/${person.img}`)" class="profile-pic text-" />
            <span class="mt-1">{{person.name}}</span>
            <div class="d-flex">

              <a :href="`mailto:${person.email}`" target="_blank" v-if="person.email" class="mr-2">
                <font-awesome-icon :icon="['fas', 'at']" />
              </a>
              <a :href="person.twitter" target="_blank" v-if="person.twitter" class="mr-2">
                <font-awesome-icon :icon="['fab', 'twitter']" />
              </a>
              <a :href="person.linkedin" target="_blank" v-if="person.linkedin" class="mr-2">
                <font-awesome-icon :icon="['fab', 'linkedin-in']" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-light d-flex justify-content-center align-items-center">
      <div class="bg-light d-flex flex-column justify-content-center align-items-center w-75 border-top pt-3 pb-5" id="jobs">
        <h3>Open positions</h3>
        <div class="d-flex align-items-center">
          <div class="card w-30 py-2 px-4 text-left">
            <div class="border-bottom pt-3 pb-1 mb-2">
              <h5>Research Programmer</h5><span class="vc_sep_holder vc_sep_holder_r"><span class="vc_sep_line"></span></span>
            </div>
            <div class="wpb_text_column wpb_content_element ">
              <div class="wpb_wrapper">
                <p>We are looking for a <strong>Research Programmer</strong> to build tools and analysis pipelines to process viral sequencing data including current data from the ongoing COVID-19 pandemic. Current tools and pipelines, including iVar
                  (<a href="https://github.com/andersen-lab/ivar" target="_blank" rel="noopener">https://github.com/andersen-lab/ivar</a>) and <a href="https://outbreak.info" target="_blank" rel="noopener">https://outbreak.info</a>, can be seen on
                  our
                  Github account at <a href="https://github.com/andersen-lab/" target="_blank" rel="noopener">https://github.com/andersen-lab/</a>.</p>
                <p>For further details please contact <a href="mailto:gkarthik@scripps.edu">gkarthik@scripps.edu</a>.</p>
                <p>Read more and apply <a href="https://www.scripps.edu/careers/?gnk=job&amp;gni=8a78879f7823d1090178240894ba01f1" target="_blank" rel="noopener noreferrer">here</a>. Qualification: BSc or equivalent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center w-100 border-top py-5 mx-auto">
      <a class="twitter-timeline" data-width="500" data-height="400" href="https://twitter.com/DiseaseOutbreak?ref_src=twsrc%5Etfw">Tweets by DiseaseOutbreak</a>
    </div>


    <div class="col-sm-12 jumbotron rounded-0 bg-grey__darker mb-0">
      <h4 class="text-light m-2">
        Notice a bug, know of a COVID-19 data source, or want to suggest a
        feature?
        <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" stroke="#D13B62" />
        </svg>
        <a class="btn btn-outline-light mt-5" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
      </h4>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faAt
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faLinkedinIn
} from "@fortawesome/free-brands-svg-icons";

library.add(faAt, faTwitter, faLinkedinIn);


export default Vue.extend({
  name: "About",
  computed: {
    ...mapState("admin", ["funding", "team"])
  },
  components: {
    FontAwesomeIcon
  },
  mounted() {
    let twitterScript = document.createElement('script')
    twitterScript.setAttribute("src", "https://platform.twitter.com/widgets.js")
    document.head.appendChild(twitterScript)
  }
});
</script>

<style lang="scss">
.team-member {
    flex-basis: 15%;
}

.profile-pic {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: contain;
}

.w-30 {
    width: 30% !important;
}
</style>
