<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5" style="min-height: 70vh;">
      <div class="container half-page">
        <h1>About</h1>
        <img class="w-50 mb-5" src="@/assets/logo-full-01.svg" alt="Outbreak.info" />
        <p class="text-left focustext py-2">In response to the current outbreak of SARS-CoV-2 (the virus that causes COVID-19), researchers worldwide have been generating and openly sharing data, publications, reagents, code, protocols, and more.
          Broad sharing of these resources improves the speed and efficiency of science. Unfortunately, there are no uniform standards and repositories for collecting all this information in one place.</p>
        <p class="text-left focustext pt-2"><strong>Outbreak.info</strong> aggregates data across scientific sources, providing tools to meet three major aims:</p>
        <ul class="focustext text-left ">
          <li class="large">Track trends in COVID-19 cases and deaths</li>
          <li class="large">Track daily developments in SARS-CoV-2 variants</li>
          <li class="large">Integrate publications, preprints, clinical trials, datasets, protocols, and other resources into one searchable library of COVID-19 research</li>
        </ul>
        <div class="text-left focustext ml-4">
          <router-link :to="{name: 'Epidemiology'}"><h4 class="mb-0">COVID-19 Cases &amp; Deaths</h4></router-link>
          <p>Outbreak.info serves as a data integration tool to make COVID-19 data more usable. The platform tracks case and death trends around the world and across states/counties with interactive maps, location comparison tools, data tables, and more.
          </p>

          <router-link :to="{name: 'SituationReports'}"><h4 class="mb-0">SARS-CoV-2 Variants</h4></router-link>
          <p>Outbreak.info collects and visualizes genomic data from the <a href="https://www.gisaid.org/" target="_blank">GISAID Initiative</a>. With over {{ gisaidCount }} million SARS-CoV-2 sequences uploaded to GISAID, Outbreak.info makes this data more accessible, providing daily surveillance reports about lineages and mutations, countries,
            states, and counties.</p>

          <router-link :to="{name: 'Resource Summary'}"><h4 class="mb-0">Research Library</h4></router-link>
          <p>Outbreak.info aggregates SARS-CoV-2 and COVID-19 information into a single site to increase their findability and reusability. The platform standardizes the metadata describing these resources, providing a web interface to easily search
            over {{ resourceCount }} resources.</p>
        </div>

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
        <h4 class="mb-4">Outbreak.info team</h4>
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
        <h4 class="mb-4">Open positions</h4>
        <div class="d-flex justify-content-center">
          <div class="card w-30 py-2 px-4 text-left mr-4">
            <div class="border-bottom pt-3 pb-1 mb-2">
              <h5>Front-end Developer</h5><span class="vc_sep_holder vc_sep_holder_r"><span class="vc_sep_line"></span></span>
            </div>
            <div class="wpb_text_column wpb_content_element ">
              <div class="wpb_wrapper">
                <p>We are looking for a <strong>Front-end Developer</strong> to build interfaces to explore, visualize, and analyze biomedical data, including current data from the ongoing COVID-19 pandemic. Current projects include <a
                    href="https://outbreak.info" target="_blank" rel="noopener">outbreak.info</a> and the <a href="http://data.cvisb.org/" target="_blank" rel="noopener">Center for Viral Systems Biology Data Portal</a>.</p>
                <p>For further details, please contact <a href="mailto:lhughes@scripps.edu">lhughes@scripps.edu</a>.</p>
                <p>Read more and apply <a href="https://www.scripps.edu/careers/?gnk=job&gni=8a78859e789e32c30178a3c4765d45b8" target="_blank" rel="noopener noreferrer">here</a>. Qualification: BSc or equivalent.</p>
              </div>
            </div>
          </div>

          <div class="card w-30 py-2 px-4 text-left mr-4">
            <div class="border-bottom pt-3 pb-1 mb-2">
              <h5>Research Programmer</h5><span class="vc_sep_holder vc_sep_holder_r"><span class="vc_sep_line"></span></span>
            </div>
            <div class="wpb_text_column wpb_content_element ">
              <div class="wpb_wrapper">
                <p>We are looking for a <strong>Research Programmer</strong> to build tools and analysis pipelines to process viral sequencing data including current data from the ongoing COVID-19 pandemic. Current tools and pipelines, including <a
                    href="https://github.com/andersen-lab/ivar" target="_blank" rel="noopener">iVar</a> and <a href="https://outbreak.info" target="_blank" rel="noopener">outbreak.info</a>, can be seen on
                  our <a href="https://github.com/andersen-lab/" target="_blank" rel="noopener">Github account</a>.</p>
                <p>For further details, please contact <a href="mailto:gkarthik@scripps.edu">gkarthik@scripps.edu</a>.</p>
                <p>Read more and apply <a href="https://www.scripps.edu/careers/?gnk=job&amp;gni=8a78879f7823d1090178240894ba01f1" target="_blank" rel="noopener noreferrer">here</a>. Qualification: BSc or equivalent.</p>
              </div>
            </div>
          </div>

          <div class="card w-30 py-2 px-4 text-left mr-4">
            <div class="border-bottom pt-3 pb-1 mb-2">
              <h5>Postdoctoral Associate</h5><span class="vc_sep_holder vc_sep_holder_r"><span class="vc_sep_line"></span></span>
            </div>
            <div class="wpb_text_column wpb_content_element ">
              <div class="wpb_wrapper">
                <p>The <a href="https://andersen-lab.com/">Andersen lab</a> is looking for a <strong>computational Postdoctoral Associate</strong> interested in phylogenetics and data science of emerging outbreaks. Together with a large group of
                  collaborators we recently created outbreak.info, which has become a major resource for genomic, epidemiological, clinical, and article data for outbreak response. Our <a href="https://github.com/andersen-lab/">tools</a> are being
                  widely used by public health departments and labs across the world to process sequencing data and gain up-to-date information on the COVID-19 pandemic. We are looking for a dedicated individual who is interested in developing new
                  tools and investigating more basic principles of how viruses - and their variants - emerge, evolve, and spread. The initial focus will be on SARS-CoV-2, however, we expect the role to expand significantly beyond that.</p>

                <p>Read more and apply <a href="https://www.scripps.edu/careers/?gnk=job&gni=8a78859e789e32c30178d2084c3b0b63" target="_blank" rel="noopener noreferrer">here</a>. Qualification: Ph.D. in computational biology, computer science,
                  mathematics, physics, or equivalent.</p>
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

import { getResourceTotal } from "@/api/resources.js";
import { getSequenceCount } from "@/api/genomics.js";


export default Vue.extend({
  name: "About",
  computed: {
    ...mapState("admin", ["funding", "team"])
  },
  components: {
    FontAwesomeIcon
  },
  data() {
    return({
    resourceCount: null,
    gisaidCount: null,
    resourceSubscription: null,
    genomicsSubscription: null
    })
  },
  mounted() {
    let twitterScript = document.createElement('script');
    twitterScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
    document.head.appendChild(twitterScript);

    // get totals from the API
    this.resourceSubscription = getResourceTotal(this.$resourceurl).subscribe(total => {
      this.resourceCount = total.floor;
    })
    this.genomicsSubscription = getSequenceCount(this.$genomicsurl, null, true, true).subscribe(total => {
      this.gisaidCount = total;
    })
  },
  destroyed() {
    if(this.resourceSubscription) {
      this.resourceSubscription.unsubscribe();
    }
    if(this.genomicsSubscription) {
      this.genomicsSubscription.unsubscribe();
    }
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

.large {
  font-size: large;
}
</style>
