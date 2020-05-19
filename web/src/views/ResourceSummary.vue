<template>
<div>


  <div class="row m-0" id="resource-overview">
    <div class="col-sm-12 bg-light text-left justify-content-center align-items-center my-5">
      <h2 class="">Finding resources is hard</h2>
      <p>
        During the COVID-19 epidemic, researchers from around the world have not only been working around the clock to better understand the disease and the virus that causes it, but they are also sharing this knowledge at an unprecented speed. This
        openness allows research to happen much more quickly.
      </p>
      <p>
        However, it can be challenging for researchers and the public to keep up-to-date on this large and constantly changing set of knowledge.
      </p>
      <p>
        We're developing a searchable index of datasets, publications, and clinical trials that tries to make sense of all this information. By standardizing the information that describes these resources, outbreak.info makes COVID-19 information
        more discoverable. <router-link :to = "{path: 'sources', hash: 'resources'}"> Learn about our data sources</router-link>
      </p>
    </div>
  </div>


  <div class="row m-0 w-100 mb-3">
    <!-- search bar -->
    <div class="col-sm-12 col-md-8">
      <div class="py-3">
        <form autocomplete="off" class="m-auto" @submit.prevent="onEnter">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb"><i class="fas fa-search"></i></span>
            </div>
            <input id="sBar" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="searchInput" />
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="row m-0 w-100">
    <NewResources :newData="newData" class="col-sm-12"/>
  </div>

</div>
</template>

<script>
import {
  getMostRecent
} from "@/api/resources.js";

import NewResources from "@/components/NewResources.vue";

export default {
  name: "ResourceSummary",
  components: {
    NewResources
  },
  data() {
    return {
      recentSubscription: null,
      newData: [],
      searchInput: null
    }
  },
  methods: {
    onEnter() {
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput
        }
      });
    }
  },
  mounted() {
    this.recentSubscription = getMostRecent(this.$resourceurl, "__all__", "-datePublished", 5).subscribe(results => {
      console.log(results)
      this.newData = results;
    });
  },
  beforeDestroy() {
    this.recentSubscription.unsubscribe();
  }
}
</script>
