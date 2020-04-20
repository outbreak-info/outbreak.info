<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <div class="d-flex flex-column text-left">
        <div class="Dataset">
          <!-- <StripeAccent :height="20" :width="4" className="Dataset" /> -->
          Dataset
        </div>
        <!-- title -->
        <h4 class="d-flex align-datas-center m-0 mb-2">
          {{data.name}}
        </h4>
        <!-- authors -->
        <div class="author-container d-flex flex-wrap">
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
        </div>
        <!-- Citation -->
        <small class="text-muted">
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
        <div class="keyword-container mt-2">
          <small class="keyword px-2 py-1 mt-1 mr-1" v-for="(keyword, idx) in data.keywords" :key="idx"> {{keyword}}</small>
        </div>
        <!-- source -->
        <div class="keyword-container mt-2">
          <small>Record provided by <a href="https" target="_blank" rel="noreferrer">Virological.org</a></small>
        </div>
        <!-- description -->
        <div class="mt-4" v-html="data.description">
        </div>
      </div>

    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :id="data['_id']" :doi="data.doi" :date="datePublished" :url="data.url" type="Dataset" v-if="data" />
    </div>

  </div>
</div>
</template>


<script>
import StripeAccent from "@/components/StripeAccent.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "Dataset",
  components: {
    ResourceSidebar
    // StripeAccent
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return formatDate(parseDate(dateStr));
    }
  },
  computed: {
    datePublished: function() {
      return (this.formatDate(this.data.dateModified))
    }
  },
  data() {
    return {
      showAffiliation: false,
      data:   {
          _id: "jhu",
          type: "Dataset",
          descriptionExpanded: false,
          url: "https://github.com/CSSEGISandData/COVID-19",
          description: "This is the data repository for the 2019 Novel Coronavirus Visual Dashboard operated by the Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE). Also, Supported by ESRI Living Atlas Team and the Johns Hopkins University Applied Physics Lab (JHU APL).",
          name: "Novel Coronavirus (COVID-19) Cases",
          keywords: ["epidemiology"],
          author: [{
            name: "Johns Hopkins University"
          }],
          dateCreated: "2020-01-22",
          dateModified: "2020-04-01",
          lastReviewed: "2020-04-01",
        }
    };
  }
}
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
}
</style>
