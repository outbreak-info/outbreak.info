<template>
<div v-if="newData">
  <div class="d-flex flex-column mr-5 px-2">
    <small class="text-uppercase text-left">
      New resources in the last week:
    </small>
    <div class="d-flex">
      <router-link class="large pr-4" :to="{
            name: 'Resources',
            query: { q: searchInput, sort: '-date', filter: '@type:Publication' }
          }">{{publicationCount}} {{ publicationCount === 1 ? "publication" : "publications"}}</router-link>
      <router-link class="large pr-4" :to="{
            name: 'Resources',
            query: { q: searchInput, sort: '-date', filter: '@type:ClinicalTrial' }
          }">{{trialCount}} {{ trialCount === 1 ? "clinical trial" : "clinical trials"}}</router-link>
      <router-link class="large pr-4" :to="{
            name: 'Resources',
            query: { q: searchInput, sort: '-date', filter: '@type:Protocol' }
          }">{{datasetCount}} {{ datasetCount === 1 ? "dataset" : "datasets"}}</router-link>
      <router-link class="large pr-4" :to="{
            name: 'Resources',
            query: { q: searchInput, sort: '-date', filter: '@type:Protocol' }
          }">{{protocolCount}} {{ protocolCount === 1 ? "protocol" : "protocols"}}</router-link>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "NewResources",
  props: {
    newData: Array,
    searchInput: String
  },
  computed: {
    publicationCount() {
      return(1)
    },
    trialCount() {
      return(0)
    },
    datasetCount() {
      return(10)
    },
    protocolCount() {
      return(1)
    }
  }
}
</script>

<style lang="scss" scoped>
// table
.resource-type {
    font-size: 1em;
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.7;
}

td.resource-type {
    min-width: 175px;
}

.resource-date {
    width: 80px;
}

.resource-affiliation {
    // width: 150px;
}

#whats-new td {
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    font-size: 0.9em;
    line-height: 1em;
}

.large {
    font-size: large;
}
</style>
