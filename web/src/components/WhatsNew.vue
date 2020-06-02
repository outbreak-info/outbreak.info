<template>
<div class="row m-0 w-100 text-left">
  <div class="col-sm-12 text-highlight d-flex justify-content-between align-items-center mb-2">
    <h5 class="text-uppercase">What's new</h5>
  </div>

  <div class="col-sm-6 col-md-3 col-sm-6 pr-4  d-flex flex-column" v-if="newPubs">
    <h6 class="Publication">Publications</h6>
    <NewList :data="newPubs" />
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:publication'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all publications</router-link>
  </div>

  <div class="col-sm-6 col-md-3 col-sm-6 pr-4 d-flex flex-column" v-if="newTrials">
    <h6 class="ClinicalTrial">Clinical Trials</h6>
    <NewList :data="newTrials" />
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:clinicaltrial'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all clinical trials</router-link>
  </div>

  <div class="col-sm-6 col-md-3 pr-4 d-flex flex-column" v-if="newDatasets">
    <h6 class="Dataset">Datasets</h6>
    <NewList :data="newDatasets" />
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:dataset'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all datasets</router-link>
  </div>

  <div class="col-sm-6 col-md-3 pr-4 d-flex flex-column" v-if="newProtocols">
    <h6 class="Protocol">Protocols</h6>
    <NewList :data="newProtocols" />
    <router-link :to="{name: 'Resources', query:{q: query, filter: '@type:protocol'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all protoocols</router-link>
  </div>
</div>
</template>


<script>
import {
  getMostRecentGroup
} from "@/api/resources.js";

import NewList from "@/components/NewList.vue";

export default {
  name: "WhatsNew",
  props: {
    query: String,
    numResults: {
      type: Number,
      default: 5
    }
  },
  components: {
    NewList
  },
  data() {
    return ({
      newPubs: [],
      newDatasets: [],
      newTrials: [],
      newProtocols: [],
      recentSubscription: null
    })
  },
  mounted() {
    this.recentSubscription = getMostRecentGroup(this.$resourceurl, this.query, "-datePublished", this.numResults).subscribe(results => {
      // console.log(results)
      this.newPubs = results["publication"];
      this.newDatasets = results["dataset"];
      this.newTrials = results["clinicaltrial"];
      this.newProtocols = results["protocol"];
    });
  },
  beforeDestroy() {
    this.recentSubscription.unsubscribe();
  }
}
</script>

<style lang="scss" scoped>
</style>
