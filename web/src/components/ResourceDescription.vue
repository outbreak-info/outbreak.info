<template>
<div class="d-flex flex-column text-left">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>


  <div :class='type.replace(/\s/g, "")'>
    <!-- <StripeAccent :height="20" :width="4" :className="type" /> -->
    {{type}} <span class="pub-type mx-2" v-if="data.publicationType && data.publicationType[0]">
      {{data.publicationType[0]}}
    </span>
  </div>
  <!-- title -->
  <h4 class="d-flex align-item-center m-0 mb-2">
    {{data.name}}
  </h4>
  <!-- authors -->
  <div class="author-container d-flex flex-wrap" v-if="data.author || data.creator">
    <template v-if="data.author">
      <div class="author" v-for="(author, idx) in data.author" :key="idx">
        <span>{{author.name ? author.name : author.givenName + " " + author.familyName}}</span>
        <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'"></span>
        <span v-if="idx == data.author.length - 2  && !data.author.length == 2" v-html="',&nbsp;and&nbsp;'"></span>
        <span v-if="idx == data.author.length - 2 && data.author.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
      </div>

      <a @click.prevent="showAffiliation=!showAffiliation" href=""><small class="text-muted ml-2">
          <span>{{showAffiliation ? 'hide affiliations' : 'view affiliations'}}</span>
          <i class="fas fa-angle-double-down mx-1" v-if="!showAffiliation"></i>
          <i class="fas fa-angle-double-up mx-1" v-if="showAffiliation"></i>
        </small>
      </a>

      <div id="author-affiliations" class="d-flex flex-column w-100" v-if="showAffiliation">
        <small v-for="(author, idx) in data.author" :key="idx" class="text-muted">
          {{author.name ? author.name : author.givenName + " " + author.familyName}}:
          <span v-for="(affiliation, idx) in author.affiliation" :key="idx">{{affiliation.name}}</span>
        </small>
      </div>
    </template>

    <template v-else-if="data.creator">
      <div class="creator" v-for="(creator, idx) in data.creator" :key="idx">
        <span>{{creator.name ? creator.name : creator.givenName + " " + creator.familyName}}</span>
        <span v-if="idx < data.creator.length - 2" v-html="',&nbsp;'"></span>
        <span v-if="idx == data.creator.length - 2  && !data.creator.length == 2" v-html="',&nbsp;and&nbsp;'"></span>
        <span v-if="idx == data.creator.length - 2 && data.creator.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
      </div>

      <a @click.prevent="showAffiliation=!showAffiliation" href=""><small class="text-muted ml-2">
          <span>{{showAffiliation ? 'hide affiliations' : 'view affiliations'}}</span>
          <i class="fas fa-angle-double-down mx-1" v-if="!showAffiliation"></i>
          <i class="fas fa-angle-double-up mx-1" v-if="showAffiliation"></i>
        </small>
      </a>

      <div id="creator-affiliations" class="d-flex flex-column w-100" v-if="showAffiliation">
        <small v-for="(creator, idx) in data.creator" :key="idx" class="text-muted">
          {{creator.name ? creator.name : creator.givenName + " " + creator.familyName}}:
          <span v-for="(affiliation, idx) in creator.affiliation" :key="idx">{{affiliation.name}}</span>
        </small>
      </div>
    </template>


  </div>
  <!-- Citation -->
  <small class="text-muted" v-if="data.dateModified || data.dateCreated || data.dataUpdated">
    <i class="far fa-clock"></i>
    <span v-if="data.dateModified"> updated {{this.formatDate(data.dateModified)}}
    </span>
    <span v-if="data.dateModified && data.datePublished">&bull;</span>
    <span v-if="data.datePublished">
      published {{this.formatDate(data.datePublished)}}
    </span>
    <span v-if="data.dateModified && data.dateCreated || data.datePublished && data.dateCreated ">&bull;</span>
    <span v-if="data.dateCreated">
      created {{this.formatDate(data.dateCreated)}}
    </span>
  </small>

  <!-- keywords -->
  <div class="keyword-container flex flex-wrap mt-2">

    <small class="keyword px-2 py-1 my-1 mr-1" v-for="(keyword, idx) in data.keywords" :key="idx" :data-tippy-info="`search ${keyword}`">
      <router-link :to='{ name: "Resources", query: {search: `"${keyword}"`} }' class="no-underline text-dark">
        {{keyword}}
      </router-link>
    </small>
  </div>
  <!-- source -->
  <div class="mt-2" v-if="data.curatedBy">
    <small>Record provided by <a :href="data.curatedBy.url" target="_blank" rel="noreferrer">{{data.curatedBy.name}}.</a>
      <router-link :to="{ name: 'Sources'}"> Learn more</router-link>
    </small>
  </div>
  <!-- description -->
  <div class="mt-4" v-html="data.abstract" v-if="data.abstract">
  </div>
  <div class="mt-4" v-html="data.description" v-else>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

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

export default Vue.extend({
  name: "ResourceDescription",
  data() {
    return ({
      showAffiliation: false,
      type: null,
      data: null
    })
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    datePublished: function() {
      return (this.formatDate(this.data.dateModified))
    }
  },
  mounted() {
    const id = this.$route.params.id;
    this.resultsSubscription = getResourceMetadata(this.$resourceurl, id).subscribe(results => {
      this.data = results;
      this.type = results["@type"];
    })

    tippy(".keyword", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.resource-type {
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.7;
}

.pub-type {
    opacity: 0.6;
}

.keyword {
    background: lighten($warning-color, 35%);
    border-radius: 5px;
    white-space: nowrap;
}

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
