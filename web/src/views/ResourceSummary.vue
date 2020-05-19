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
        more discoverable. <router-link :to="{path: 'sources', hash: 'resources'}"> Learn about our data sources</router-link>
      </p>
    </div>
  </div>

  <div class="d-flex">


    <div id="resource-counts" class="d-flex ml-3 flex-column align-items-center" v-if="counts.total">
      <h3 class="text-left text-highlight">{{counts.total}} resources</h3>
      <small class="text-muted badge bg-grey__lightest" v-if="counts.dateModified"><i class="far fa-clock"></i> Updated {{ counts.dateModified }}
      </small>

      <CirclePacking class="circle-packing" :data="counts.sources" />
    </div>

    <div class="w-100 mb-3 d-flex flex-column">
      <!-- search bar -->
      <!-- <div class="col-sm-12 col-md-8"> -->
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
      <!-- </div> -->

      <!-- results listing -->
      <table v-if="counts.sources" class="text-left" id="source-counts">
        <div v-for="(item, idx) in counts.sources.children" :key="idx">
          <tr class="text-muted text-uppercase">
            <td :class="item.name + ' p-0 pt-3'"  colspan="2">
              {{item.name}}
            </td>
          </tr>
          <tr v-for="(child, iChild) in item.children" :key="iChild">
            <td class="p-0 source-name">
              <small>{{child.name == child.term || child.name == "Zenodo" ? child.name : `${child.term} (${child.name})`}}</small>
            </td>
            <td class="p-0">
              <small>{{child.count.toLocaleString()}}</small>
            </td>
          </tr>

        </div>
      </table>
    </div>
  </div>

  <div class="row m-0 w-100">
    <NewResources :newData="newData" class="col-sm-12" />
  </div>

</div>
</template>

<script>
import {
  getMostRecent,
  getSourceSummary
} from "@/api/resources.js";

import NewResources from "@/components/NewResources.vue";
import CirclePacking from "@/components/CirclePacking.vue";

export default {
  name: "ResourceSummary",
  components: {
    NewResources,
    CirclePacking
  },
  data() {
    return {
      recentSubscription: null,
      newData: [],
      counts: [],
      searchInput: null
    }
  },
  methods: {
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
    this.recentSubscription = getMostRecent(this.$resourceurl, "__all__", "-datePublished", 5).subscribe(results => {
      this.newData = results;
    });

    this.countSubscription = getSourceSummary(this.$resourceurl).subscribe(results => {
      console.log(results)
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
    margin-top: -70px;
}

#source-counts td {
  line-height: 0.9em;
}

.source-name {
  width: 135px;
}
</style>
