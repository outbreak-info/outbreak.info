<template>
<div class="home flex-column text-left d-flex">
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']"/>
  </div>
  <!-- INTRO -->
  <section>
    <div class="row m-0">
      <div class="col-sm-12 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1">
        <img src="@/assets/logo-full-white-01.svg" alt="Outbreak.info" class="w-25" />
      </div>
    </div>
  </section>

  <div class="col-sm-12 d-flex justify-content-center align-items-center p-0 bg-grey__lightest hero">
    <div class="container p-3">
      <p class="focustext">
        During outbreaks of emerging diseases such as COVID-19,
        efficiently collecting, sharing, and integrating data is critical
        to scientific research.
      </p>
      <p class="text-dark h-100 focustext font-weight-bold">
        <b class="text-highlight">outbreak.info</b> is a resource to
        aggregate all this information into a single location.
      </p>
      <p class="m-0">
        <router-link :to="{ name: 'Latest' }">View latest changes</router-link>
      </p>
    </div>
  </div>

  <!-- SEARCH  -->
  <section class="d-flex justify-content-center align-items-center mb-4 text-light">
    <div class="row m-0 w-100 d-flex justify-content-center">
      <div class="col-sm-12 col-md-6 px-5 py-3 d-flex flex-column justify-content-between resources-intro">
        <h3 class="mt-2">
          Resources</h3>

        <div id="resourceBar-text" class="form-text d-block mb-3 text-light-highlight line-height-1">Find COVID-19 and SARS-CoV-2 publications, clinical trials, datasets, protocols, and more</div>
        <!-- <p class="text-muted">
          Keeping track of all the data and publications on COVID-19 and SARS-CoV-2 is a job in itself, requiring searching many different repositories and websites. outbreak.info combines the metadata from heterogeneous sources, creating one unified
          platform to find publications, clinical trials, datasets, protocols, and more.
        </p> -->

        <video class="w-100 mb-3" controls>
          <source src="@/assets/home/resources_demo.mp4" type="video/mp4">
          <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
          Your browser does not support the video tag.
        </video>

        <!-- <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" vector-effect="non-scaling-stroke" stroke="#D13B62" stroke-width="5" />
        </svg> -->

        <div>
          <form autocomplete="off" class="w-100">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-grey text-muted border-0" id="sb"><font-awesome-icon :icon="['fas', 'search']"/></span>
              </div>
              <input id="resourceBar" class="form-control border" placeholder="Search resources" aria-label="search" aria-describedby="sb" type="text" v-model="searchQuery" @keydown.enter.prevent="submitSearch" />
            </div>
          </form>
          <small id="sBar-example" class="form-text d-block  text-left ml-5"> <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link :to="{name: 'Resources', query: {q: 'remdesivir'}} " class="text-light">
                remdesivir
                <font-awesome-icon :icon="['fas', 'angle-double-right']"/>
              </router-link>
            </span>
            <router-link :to="{name: 'NIAID'} " class="text-light">
              NIAID-related
              <font-awesome-icon :icon="['fas', 'angle-double-right']"/>
            </router-link>
          </small>
        </div>


        <router-link :to='{ path: "/", hash: "#resource-examples" }'>
          <button class="btn btn-main-outline w-100 px-2 py-1 mt-3" :style="{background: 'white'}">
            What can I do with resources?
          </button>
        </router-link>
      </div>


      <!-- EPI INTRO -->
      <div class="col-sm-12 col-md-6 px-5 py-3 d-flex flex-column  justify-content-between epi-intro">
        <h3 class="mt-2">
          Epidemiology</h3>


        <div id="sBar-text" class="form-text d-block mb-3 text-light-highlight line-height-1">View COVID-19 trends by region, country, state/province, U.S.
          metropolitan area, or U.S. county</div>

        <!-- <p class="text-muted">
          Explore and download epidemiological data on confirmed cases, deaths, hospitalizations, and testing. Compare between locations to visualize how the pandemic has varied over time and geography.
        </p> -->

        <video class="w-100 mb-3" controls>
          <!-- <video class="w-100 mb-3" autoplay loop muted> -->
          <source src="@/assets/home/epi_demo.mp4" type="video/mp4">
          <!-- <source src="@/assets/home/epi_demo.ogv" type="video/ogg"> -->
          Your browser does not support the video tag.
        </video>

        <div>
          <SearchBar routeTo="/epidemiology?" placeholder="Search locations" class="w-100" :darkMode="false"></SearchBar>
          <small id="sBar-example" class="form-text d-block text-left ml-5">
            <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link :to="{name: 'Epidemiology', query: {location: 'BRA'}} " class="text-light">Brazil
                <font-awesome-icon :icon="['fas', 'angle-double-right']"/>
              </router-link>
            </span>
            <router-link :to="{name: 'Epidemiology', query: {location: 'METRO_28140'}} " class="text-light">Kansas City metro area <font-awesome-icon :icon="['fas', 'angle-double-right']"/>
            </router-link>
          </small>
        </div>

        <router-link :to='{ path: "/", hash: "#epi-examples" }' class="text-light">
          <button class="btn btn-main-outline px-2 py-1 mt-3 w-100" :style="{background: 'white'}">What can I do with epi data?</button>
        </router-link>

      </div>
    </div>
  </section>

  <!-- RESOURCE EXAMPLES -->
  <section id="resource-examples" class="container my-5">
    <h3>Search for COVID-19 resources</h3>
    <div class="row d-flex flex-wrap">

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Resources'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Search by Keyword</h5>
            <video class="w-100" controls>
              <source src="@/assets/home/query_example.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Resources'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Search by resource type</h5>
            <video class="w-100" controls>
              <source src="@/assets/home/type_example.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Resources'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Search by resource provider</h5>
            <video class="w-100" controls>
              <source src="@/assets/home/source_example.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Resources'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Download search results</h5>
            <div class="h-100 d-flex align-items-center">
              <video class="w-100" controls>
                <source src="@/assets/home/download_example.mp4" type="video/mp4">
                <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
                Your browser does not support the video tag.
              </video>
            </div>
          </router-link>
        </div>
      </div>


      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Download resource metadata</h5>
          <a href="https://api.outbreak.info/try/resources" target="_blank" rel="noreferrer">
            <h6>API</h6>
            <img src="@/assets/home/api_resources.png" alt="Outbreak.info" class="w-100 mb-3" />
          </a>
          <router-link :to="{name: 'Sources', hash: '#resources'}">
            <h6>.tsv files</h6>
            <img src="@/assets/home/download_data.png" alt="Download Outbreak.info metadata" class="w-100 mb-3" />
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Schema'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">View & adapt schema</h5>
            <div class="h-100 d-flex align-items-center">
              <img src="@/assets/home/schema_example.png" alt="Outbreak.info schema" class="w-100" />
            </div>
          </router-link>
        </div>
      </div>

    </div>
  </section>

  <!-- EPI EXAMPLES -->
  <section id="epi-examples" class="container my-5">
    <h3>Explore epidemiology data</h3>
    <div class="row">
      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Epidemiology'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Compare locations over time</h5>
            <img src="@/assets/home/epi_example.svg" alt="Outbreak.info epidemiology data over time" class="w-100" />
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Maps'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">View by geography</h5>
            <img src="@/assets/home/map_example.svg" alt="Outbreak.info U.S. epidemiology data by metro area" class="w-100" />
          </router-link>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Compare'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Find similar regions</h5>
            <img src="@/assets/home/compare_example.png" alt="Outbreak.info compare regions" class="w-100" />
          </router-link>
        </div>
      </div>

      <!-- EPI CURVE SUMMARIES -->
      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <section class="w-100 p-3 card" id="regional-epi-curves">
          <router-link :to="{name: 'Regions'}" class="text-dark h-100 d-flex flex-column justify-content-between">
            <h5 class="text-uppercase">Explore regions</h5>
            <div class="h-100 d-flex flex-column justify-content-center">
              <img src="@/assets/home/regions_example.svg" alt="Outbreak.info regional data" class="w-100" />
            </div>
          </router-link>
        </section>
      </div>


      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <router-link :to="{name: 'Doubling Rates'}" class="text-dark h-100 d-flex flex-column">
            <h5 class="text-uppercase">View doubling rates</h5>
            <div class="h-100 d-flex flex-column justify-content-center">
              <img src="@/assets/home/doubling_example.svg" alt="Outbreak.info doubling rates" class="w-100" />
            </div>

          </router-link>
        </div>

      </div>
      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Access data</h5>
          <a href="https://api.outbreak.info/try/covid19" target="_blank" rel="noreferrer">
            <h6>API</h6>
            <img src="@/assets/home/api.png" alt="Outbreak.info" class="w-100 mb-3" />
          </a>

          <a href="https://github.com/outbreak-info/R-outbreak-info" target="_blank" rel="noreferrer">
            <h6>R package</h6>
            <img src="@/assets/home/r.png" alt="Outbreak.info" class="w-100" />
          </a>

        </div>
      </div>


    </div>
  </section>


  <section class="d-flex flex-column justify-content-center align-items-left bg-grag-grey text-light px-3 pt-2 mb-5">
    <div class="d-flex justify-content-center align-items-center mb-2">
      <div>
        <h5 class="at-a-glance-header m-0">At a glance</h5>
        <p class="ml-3 mb-0">
          View the three locations with the largest increase in cases in the
          past day, or select your own locations
        </p>
        <button class="btn btn-main-outline router-link no-underline bg-white" @click="summaryDeletable = !summaryDeletable">
          {{ summaryDeletable ? "done" : "change locations" }}
        </button>
      </div>
    </div>

    <div class="row d-flex justify-content-center">
      <GlanceSummary v-for="(location, idx) in glanceSummaries" :key="idx" class="d-flex mx-2 mb-3" :data="location" :idx="location.location_id" :deletable="summaryDeletable" @removed="removeSummary" />

      <div class="d-flex mx-2 py-3 px-3 flex-column align-items-center box-shadow add-items bg-grag-main" v-if="summaryDeletable">
        <h6>Add locations</h6>
        <SearchBar @location="addSummary" class="search-bar"></SearchBar>
      </div>
    </div>
  </section>

  <section class="container">
    <p class="focustext">
      Notice a bug, know of a COVID-19 data source, or want to suggest a
      feature?
    </p>
    <p class="text-center">
      <a class="btn btn-main m-5" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
    </p>
  </section>
  <Logos class="bg-grey" />
</div>
</template>
<script>
// @ is an alias to /src
// import Vue from "vue";
import SearchBar from "@/components/SearchBar.vue";
import Logos from "@/components/Logos.vue";
import GlanceSummary from "@/components/GlanceSummary";
import {
  getGlanceSummary
} from "@/api/epi-basics.js";
import Vue from "vue";
import {
  mapState
} from "vuex";

import store from "@/store";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner, faAngleDoubleRight, faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner, faAngleDoubleRight, faSearch);

export default {
  name: "Home",
  components: {
    SearchBar,
    Logos,
    GlanceSummary,
    FontAwesomeIcon
  },
  data() {
    return {
      searchQuery: "",
      glanceLocations: [],
      glanceSummaries: [],
      summaryDeletable: false,
      dataSubscription: null
    };
  },
  computed: {
    ...mapState("admin", ["loading"])
  },
  methods: {
    submitSearch() {
      this.$router.push({
        name: "Resources",
        query: {
          q: this.searchQuery
        }
      });
    },
    removeSummary: function(idx) {
      this.glanceLocations = this.glanceLocations.filter((d, i) => d !== idx);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
      if (this.glanceLocations.length > 0) {
        this.updatedSubscription = getGlanceSummary(
          this.$apiurl,
          this.glanceLocations
        ).subscribe(d => {
          this.glanceSummaries = this.sortSummaries(d);
        });
      } else {
        this.glanceSummaries = [];
      }
    },
    addSummary: function(location_id) {
      this.glanceLocations = this.glanceLocations.concat(location_id);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
      this.updatedSubscription = getGlanceSummary(
        this.$apiurl,
        this.glanceLocations
      ).subscribe(d => {
        this.glanceSummaries = this.sortSummaries(d);
      });
    },
    sortSummaries(data) {
      if (this.glanceLocations && this.glanceLocations.length > 0) {
        data.sort(
          (a, b) =>
          this.glanceLocations.indexOf(a.location_id) -
          this.glanceLocations.indexOf(b.location_id)
        );
      }
      return data;
    }
  },
  destroyed() {
    this.dataSubscription.unsubscribe();
    if (this.updatedSubscription) {
      this.updatedSubscription.unsubscribe();
    }
  },
  mounted() {
    const locations = Vue.$cookies.get("custom_locations");
    this.glanceLocations = locations ? locations.split(",") : [];

    this.dataSubscription = getGlanceSummary(
      this.$apiurl,
      this.glanceLocations
    ).subscribe(d => {
      this.glanceSummaries = this.sortSummaries(d);
      this.glanceLocations = d.map(d => d.location_id);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
    });
  }
}
</script>

<style lang="scss" scoped>
.resources-intro {
    background: $primary-color;
}

.epi-intro {
    background: $secondary-color;
    border-left: 3px solid white;
}

@media (max-width:767px) {
    .epi-intro {
        border: none !important;
    }
}

.text-light-highlight {
    color: #d5d5d5 !important;
}

.at-a-glance-header {
    text-transform: uppercase;
}
.search-bar {
    width: 250px;
}

.add-items {
    height: 120px;
}
</style>
