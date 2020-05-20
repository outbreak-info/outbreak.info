<template>
<div>

  <div class="d-flex justify-content-center align-items-center my-3" id="resource-overview">
    <div class="ml-3 text-left ">
      <h2 class="">Finding resources is hard</h2>
      <p>
        During the COVID-19 epidemic, researchers from around the world have not only been working around the clock to better understand the disease and the virus that causes it, but they are also sharing this knowledge at an unprecedented speed.
        This
        openness allows research to happen much more quickly.
      </p>
      <p>
        However, it can be challenging for researchers and the public to keep up-to-date on this large and constantly changing set of knowledge.
      </p>
      <p>
        We're developing a searchable index of datasets, publications, and clinical trials that tries to make sense of all this information. By standardizing the information that describes these resources, outbreak.info makes COVID-19 information
        more discoverable. <router-link :to="{path: 'sources', hash: 'resources'}"> Learn about our data sources</router-link>
      </p>
    </div>

    <div id="resource-counts" class="d-flex ml-3 flex-column align-items-center" v-if="counts.total">
      <h3 class="text-left text-highlight">{{counts.total}} resources</h3>
      <small class="text-muted badge bg-grey__lightest" v-if="counts.dateModified"><i class="far fa-clock"></i> Updated {{ counts.dateModified }}
      </small>

      <CirclePacking class="circle-packing" :data="counts.sources" />
    </div>
  </div>

  <div class="d-flex">
    <div class="w-100 mx-5 d-flex flex-column justify-content-between">
      <!-- search bar -->
      <div class="col-sm-12 col-md-8">
      <div class="pb-4">
        <form autocomplete="off" class="m-auto" @submit.prevent="onEnter">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb"><i class="fas fa-search"></i></span>
            </div>
            <input id="sBar" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" />
          </div>
        </form>
        <div class="d-flex mt-1">
          <span class="mr-2">Try:</span>
          <span class="mr-3 d-flex align-items-center" v-for="(demo, idx) in demos" :key="idx">
            <router-link :to="{name: 'Resources', query: {q: demo.query}} ">
              {{demo.label}}
              <i class="fas fa-angle-double-right"></i>
            </router-link>

          </span>
        </div>
      </div>

    </div>
  </div>
  </div>

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
      <router-link :to="{name: 'Resources', query:{filter: '@type:Publication'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all publications</router-link>
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
      <router-link :to="{name: 'Resources', query:{filter: '@type:ClinicalTrial'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all clinical trials</router-link>
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
      <router-link :to="{name: 'Resources', query:{filter: '@type:Dataset'}}" class="btn btn-main-outline router-link no-underline m-3 align-self-center">View all datasets</router-link>
    </div>
  </div>

</div>
</template>

<script>
import {
  getMostRecentGroup,
  getSourceSummary
} from "@/api/resources.js";

// import NewResources from "@/components/NewResources.vue";
import CirclePacking from "@/components/CirclePacking.vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "ResourceSummary",
  components: {
    // NewResources,
    CirclePacking
  },
  data() {
    return {
      demos: [{
        label: "remdesivir",
        query: "remdesivir"
      }, {
        label: "antibodies",
        query: "antibodies"
      }, {
        label: "x-ray diffraction",
        query: '"x-ray diffraction"'
      }],
      recentSubscription: null,
      newPubs: [],
      newDatasets: [],
      newTrials: [],
      counts: [],
      searchInput: null
    }
  },
  methods: {
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return timeFormat("%d %B %Y")(parsed);
    },
    onEnter() {
      this.$router.push({
        name: "Resources",
        query: {
          q: this.searchInput
        }
      });
    }
  },
  mounted() {
    this.recentSubscription = getMostRecentGroup(this.$resourceurl, "-datePublished", 5).subscribe(results => {
      console.log(results)
      this.newPubs = results["publication"];
      this.newDatasets = results["dataset"];
      this.newTrials = results["clinicaltrial"];
    });

    this.countSubscription = getSourceSummary(this.$resourceurl).subscribe(results => {
      this.counts = results;
    });
  },
  beforeDestroy() {
    this.recentSubscription.unsubscribe();
    this.countSubscription.unsubscribe();
  }
}
</script>

<style lang="scss" scoped>
.circle-packing {
    margin-top: -50px;
    margin-bottom: -50px;
}

.sources {
    background: white;
}

#source-counts div {
    line-height: 0.9em;
}

.source-name {
    width: 135px;
}

.opacity-40 {
    opacity: 0.4;
}
</style>
