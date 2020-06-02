<template>
<div class="row m-0 w-100 text-left">
  <div class="col-sm-12 text-highlight d-flex justify-content-between align-items-center mb-2">
    <h5 class="text-uppercase">What's new</h5>
  </div>

  <div class="col-md-4 col-sm-6 pr-3  d-flex flex-column" v-if="newPubs">
    <h6 class="Publication">Publications</h6>
    <div class="mb-3" v-for="(item, idx) in newPubs" :key="idx">
      <span class="opacity-40 font-weight-700 mr-2">{{format(item.datePublished)}}</span>
      <router-link :to="{ name: 'Resource Page', params: { id: item._id } }" class="">{{item.name}}</router-link>
      <template v-if="item.author">
        [{{
          item.author[0].name
            ? item.author[0].name
            : item.author[0].givenName +
              " " +
              item.author[0].familyName}}<span v-if="item.author.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
      <template v-else-if="item.creator">
        [{{
          item.creator[0].name
            ? item.creator[0].name
            : item.creator[0].givenName +
              " " +
              item.creator[0].familyName
        }}<span v-if="item.creator.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
    </div>
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:Publication'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all publications</router-link>
  </div>

  <div class="col-md-4 col-sm-6 pr-3 d-flex flex-column" v-if="newTrials">
    <h6 class="ClinicalTrial">Clinical Trials</h6>
    <div class="mb-3" v-for="(item, idx) in newTrials" :key="idx">
      <span class="opacity-40 font-weight-700 mr-2">{{format(item.datePublished)}}</span>
      <router-link :to="{ name: 'Resource Page', params: { id: item._id } }" v-if="item.name">{{item.name}}</router-link>
      <template v-if="item.author && item.author.length">
        [{{
          item.author[0].name
            ? item.author[0].name
            : item.author[0].givenName +
              " " +
              item.author[0].familyName}}<span v-if="item.author.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
      <template v-else-if="item.creator && item.creator.length">
        [{{
          item.creator[0].name
            ? item.creator[0].name
            : item.creator[0].givenName +
              " " +
              item.creator[0].familyName
        }}<span v-if="item.creator.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
    </div>
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:ClinicalTrial'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all clinical trials</router-link>
  </div>

  <div class="col-md-4 pr-3 d-flex flex-column" v-if="newDatasets">
    <h6 class="Dataset">Datasets</h6>
    <div class="mb-3" v-for="(item, idx) in newDatasets" :key="idx">
      <span class="opacity-40 font-weight-700 mr-2">{{format(item.datePublished)}}</span>
      <router-link :to="{ name: 'Resource Page', params: { id: item._id } }" class="">{{item.name}}</router-link>
      <template v-if="item.author && item.author.length">
        [{{
          item.author[0].name
            ? item.author[0].name
            : item.author[0].givenName +
              " " +
              item.author[0].familyName}}<span v-if="item.author.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
      <template v-else-if="item.creator && item.creator.length">
        [{{
          item.creator[0].name
            ? item.creator[0].name
            : item.creator[0].givenName +
              " " +
              item.creator[0].familyName
        }}<span v-if="item.creator.length > 1"> et al.]</span>
        <span v-else>]</span>
      </template>
    </div>
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:Dataset'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all datasets</router-link>
  </div>
</div>
</template>


<script>
import {
  getMostRecentGroup
} from "@/api/resources.js";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "WhatsNew",
  props: {
    query: String,
    numResults: {
      type: Number,
      default: 5
    }
  },
  data() {
    return({
      newPubs: [],
      newDatasets: [],
      newTrials: [],
      recentSubscription: null
    })
  },
  mounted() {
    this.recentSubscription = getMostRecentGroup(this.$resourceurl, this.query, "-datePublished", this.numResults).subscribe(results => {
      // console.log(results)
      this.newPubs = results["publication"];
      this.newDatasets = results["dataset"];
      this.newTrials = results["clinicaltrial"];
    });
  },
  beforeDestroy() {
    this.recentSubscription.unsubscribe();
  },
  methods: {
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return timeFormat("%d %B %Y")(parsed);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
