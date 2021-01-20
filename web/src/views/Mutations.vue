<template>
<div class="container my-5">
  <div v-html="testHtml"></div>
  <h1 class="text-left">
    SARS-CoV-2 mutation viewer
  </h1>
  <p class="text-muted text-left">
    View mutation frequency over time for SARS-CoV-2 sequences deposited in the <a href="https://www.gisaid.org/" target="_blank" rel="noreferrer">GISAID Initiative</a>. <b>Please note that this is a biased sample:</b> since only a fraction of the
    COVID-19
    cases have been
    sequenced, this analysis is not a representation of the true mutation frequency.
  </p>

  <section id="search">
    <div class="my-3">
    <h5 class="text-left">Nucleotide mutations or amino acid changes</h5>
    <div class="row  d-flex align-items-center">
      <div class="input-group col-sm-6 col-md-4">
        <div class="input-group-prepend">
          <span class="input-group-text bg-grey text-muted border-0" id="sb">
            <font-awesome-icon :icon="['fas', 'search']" />
          </span>
        </div>
        <input id="resourceBar" class="form-control border" placeholder="Search mutations" aria-label="search" aria-describedby="sb" type="text" v-model="searchQuery" @keydown.enter.prevent="submitSearch" />
      </div>

      <div class="col-sm-6 col-md-8 d-flex align-items-start">
        <div class="btn btn-main ml-3 p-0">
          <div class="d-flex flex-column align-items-center">
            <small class="w-100 border-bottom">ORF1ab</small>
            <div class="px-1 font-weight-bold">T1001I</div>
          </div>
        </div>

        <div class="btn btn-main ml-3 p-0">
          <div class="d-flex flex-column align-items-center">
            <small class="w-100 border-bottom">S</small>
            <div class="px-1 font-weight-bold">N501Y</div>
          </div>
        </div>
        <div class="btn btn-main ml-3 p-0">
          <div class="d-flex flex-column align-items-center">
            <small class="w-100 border-bottom">S</small>
            <div class="px-1 font-weight-bold">P681H</div>
          </div>
        </div>
      </div>
    </div>
    </div>

<div class="my-3">
    <h5 class="text-left m-0">Phylogenetic lineages</h5>
    <p class="text-left text-helper text-muted m-0">Based on <a href="https://cov-lineages.org/pangolin.html" target="_blank" rel="noreferrer">Pangolin assignments</a></p>
    <div class="row  d-flex align-items-center">
      <div class="input-group col-sm-6 col-md-4">
        <div class="input-group-prepend">
          <span class="input-group-text bg-grey text-muted border-0" id="sb">
            <font-awesome-icon :icon="['fas', 'search']" />
          </span>
        </div>
        <input id="resourceBar" class="form-control border" placeholder="Search lineages" aria-label="search" aria-describedby="sb" type="text" v-model="searchQuery" @keydown.enter.prevent="submitSearch" />
      </div>

      <div class="col-sm-6 col-md-8 d-flex align-items-start">
        <div class="btn btn-main ml-3 p-0 font-weight-bold px-2 py-2">
          B.1.1.7
        </div>

        <div class="btn btn-main ml-3 p-0 font-weight-bold px-2 py-2">
          B.1.351
        </div>
        <div class="btn btn-main ml-3 p-0 font-weight-bold px-2 py-2">
          P.1
        </div>

      </div>
    </div>
    </div>

  </section>

  <section id="mutations-by-gene">
    <h3 class="text-left mt-5">Mutations by gene</h3>
    <div>all</div><img src="@/assets/test_mut_freq.png" class="w-100" />
    <div>non-synonymous</div><img src="@/assets/test_nonsyn.png"  class="w-100" />
  </section>
</div>
</template>

<script>
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
  faSpinner,
  faAngleDoubleRight,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner, faAngleDoubleRight, faSearch);

export default {
  name: "Home",
  components: {
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
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
</style>
