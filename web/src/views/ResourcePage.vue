<template>
<div class="d-flex py-2 m-2">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <div class="row w-100 m-0" v-if="data">
    <div class="col-sm-12 text-left">
      <div :class="type.replace(/\s/g, '')" v-if="type">
        <!-- <StripeAccent :height="20" :width="4" :className="type" /> -->
        {{ type }}
        <span class="pub-type mx-2" v-if="data.publicationType && data.publicationType[0]">
          {{ data.publicationType[0] }}
        </span>
      </div>
      <!-- title -->
      <h4 class="d-flex align-item-center m-0 mb-2">
        {{ data.name }}
      </h4>

      <!-- mini-nav for resource types -->
      <section class="d-flex justify-content-end w-100 bg-sec">
        <div class="row d-flex justify-content-center w-100">
          <nav class="navbar navbar-expand-lg navbar-dark">
            <ul class="navbar-nav">
              <li class="nav-item text-light mr-4" v-for="(anchor, idx) in anchorsArr" :key="idx">
                <router-link class="nav-link no-underline p-0" :to="`#${anchor}`">
                  {{ anchor }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>

    <div class="col-md-9 my-3">
      <!-- description -->
      <ResourceDescription :data="data" :type="type" />

      <!-- special clinical trials description -->
      <ClinicalTrialDescription :data="data" v-if="type == 'ClinicalTrial'" />

      <div class="mr-5">
        <!-- downloads -->
        <div id="downloads" class="text-left border-top border-bottom text-muted py-3 my-3">
          <h6 class="m-0">Downloads</h6>
          <ul v-if="data.distribution" id="download-list">
            <li v-for="(item, idx) in data.distribution" :key="idx">
              <a :href="item.contentUrl" target="_blank" rel="noreferrer">
                {{ item.name ? item.name : item.contentUrl }}
              </a>
            </li>
          </ul>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- license -->
        <div id="license" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0">License</h6>
          <div v-if="data.license">
            <a v-if="data.license.startsWith('http')" :href="data.license" target="_blank">{{ data.license }}
            </a>
            <span v-else v-html="data.license"></span>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- funding info -->
        <div id="funder" class="text-left border-bottom text-muted pb-3 mb-3">
          <h6 class="m-0">Funder</h6>
          <div v-if="data.funding || data.funder">
            <span v-if="data.funding">{{ data.funding }}</span>
            <span v-if="data.funder">{{ data.funder }}</span>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>
      </div>
    </div>
    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :data="data" :date="dateModified" :type="data['@type']" v-if="data" />
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

import {
  mapState
} from "vuex";

import {
  getResourceMetadata
} from "@/api/resources.js";

import ResourceDescription from "@/components/ResourceDescription.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";
import ClinicalTrialDescription from "@/components/ClinicalTrialDescription.vue";

export default Vue.extend({
  name: "ResourcePage",
  components: {
    ResourceDescription,
    ResourceSidebar,
    ClinicalTrialDescription
  },
  data() {
    return ({
      type: null,
      data: null,
      anchors: {
        default: ["authors", "description", "downloads", "license", "funder"],
        ClinicalTrial: ["authors", "sponsor", "description", "design", "interventions", "eligibility", "outcome", "status"]
      }
    })
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    }
  },
  metaInfo() {
    const metadata = this.data ? this.data : null;
    return {
      script: [{
        type: 'application/ld+json',
        json: metadata
      }],
      meta: [{
        title: 'description',
        name: 'description',
        content: 'my standard description',
      }]
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    anchorsArr() {
      if (Object.keys(this.anchors).includes(this.type)) {
        return (this.anchors[this.type])
      }
      return (this.anchors["default"])
    }
  },
  mounted() {
    const id = this.$route.params.id;

    this.resultsSubscription = getResourceMetadata(this.$resourceurl, id).subscribe(results => {
      this.data = results;
      this.type = results["@type"];
      this.dateModified = this.formatDate(this.data.date);
    })
  }
});
</script>

<style lang="scss" scoped>
.pub-type {
    opacity: 0.6;
}

.helper {
    line-height: 1.2em;
}

.section-header {
    text-transform: uppercase;
}
</style>
