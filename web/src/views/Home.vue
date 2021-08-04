<template>
<div class="home flex-column text-left d-flex">
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>
  <!-- INTRO -->
  <section>
    <div class="row m-0">
      <div class="col-sm-12 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1">
        <div class="d-flex flex-column w-100 align-items-center my-2">
          <img src="@/assets/logo-full-white-01.svg" alt="Outbreak.info" class="w-20" />
          <p class="text-light my-1">
            a standardized, open-source database of COVID-19 resources and epidemiology data
          </p>
        </div>
      </div>
    </div>
  </section>


  <!-- SEARCH  -->
  <section class="d-flex justify-content-center align-items-center mb-4 text-light">
    <div class="row m-0 w-100 d-flex justify-content-center">

      <!-- EPI INTRO -->
      <div class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between epi-intro">
        <div class="mb-3">
          <router-link :to="{name: 'Epidemiology'}" class="text-light">
            <h3 class="my-3">COVID-19 Cases &amp; Deaths</h3>
          </router-link>

          <div id="sBar-text" class="form-text d-block mb-3 text-light-highlight line-height-1">View COVID-19 trends by region, country, state/province, U.S.
            metropolitan area, or U.S. county</div>
        </div>

        <div>
          <SearchBar routeTo="/epidemiology?" placeholder="Search location" class="w-100" :darkMode="false"></SearchBar>
          <small id="sBar-example" class="form-text d-block text-left ml-5">
            <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link :to="{name: 'Epidemiology', query: {location: 'BRA'}} " class="text-light">Brazil
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>

            <span class="mr-3">
              <router-link :to="{name: 'Epidemiology', query: {location: 'CITY_US-NY_NYC'}} " class="text-light">New York City
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>

            <router-link :to="{name: 'Epidemiology', query: {location: 'METRO_28140'}} " class="text-light">Kansas City metro area
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </small>
        </div>
      </div>

      <!-- VARIANTS -->
      <div class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between variants-intro">
        <div class="mb-3">
          <router-link :to="{name: 'SituationReports'}" class="text-light">
            <h3 class="my-3">Variants</h3>
          </router-link>

          <div id="resourceBar-text" class="form-text d-block text-light-highlight line-height-1">Explore SARS-CoV-2 lineage, variant, and mutation situation reports</div>
        </div>

        <div id="search-lineage">
          <form autocomplete="off" class="w-100" id="search-lineage-input">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-grey text-muted border-0" id="sb">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect :isStandalone="false" class="form-control border" :queryFunction="queryPangolin" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Search PANGO lineage" />
            </div>
          </form>
          <small id="sBar-example-variant-lineage" class="form-text d-block text-left ml-5"> <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link :to="{name: 'MutationReport', query: {pango: 'B.1.617.2'}} " class="text-light">B.1.617.2 / Delta
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'MutationReport', query: {muts: ['S:T19R','S:DEL157/158','S:L452R','S:T478K','S:P681R','S:D950N']}} " class="text-light">Delta+ variants
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'MutationReport', query: {pango: 'B.1.1.7', selected:'GBR'}} " class="text-light">B.1.1.7 / Alpha
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
          </small>
        </div>

        <div id="search-variant-location" class="mt-3">
          <form autocomplete="off" class="w-100" id="search-variant-location-input">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-grey text-muted border-0" id="sb">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect :isStandalone="false" class="form-control border" :queryFunction="queryLocation" @selected="submitLocation" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location"
                totalLabel="total sequences" />
            </div>
          </form>
          <small id="sBar-example-variant-location" class="form-text d-block text-left ml-5"> <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link :to="{name: 'LocationReport', query: {loc: 'USA'}} " class="text-light">USA
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'LocationReport', query: {loc: 'GBR'}} " class="text-light">U.K.
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'LocationReport', query: {loc: 'USA_US-NY'}} " class="text-light">New York
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'LocationReport', query: {loc: 'USA_US-CA_06073'}} " class="text-light">San Diego
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
          </small>
        </div>

      </div>

      <!-- resources -->
      <div class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between resources-intro">
        <div class="mb-3">
          <router-link :to="{name: 'Resource Summary'}" class="text-light">
            <h3 class="my-3">
              Research Library</h3>
          </router-link>

          <div id="resourceBar-text" class="form-text d-block mb-3 text-light-highlight line-height-1">Find COVID-19 and SARS-CoV-2 publications, clinical trials, datasets, protocols, and more</div>
        </div>

        <div>
          <form autocomplete="off" class="w-100" id="search-resources">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-grey text-muted border-0" id="sb">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <input id="resourceBar" class="form-control border" placeholder="Search resources" aria-label="search" aria-describedby="sb" type="text" v-model="searchQuery" @keydown.enter.prevent="submitSearch" />
            </div>
          </form>
          <small id="sBar-example" class="form-text d-block  text-left ml-5"> <span class="mr-2">Try:</span>

            <span class="mr-3">
              <router-link :to="{name: 'Resources', query: {q: 'E484K'}} " class="text-light">E484K
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'Resources', query: {q: 'Moderna'}} " class="text-light">Moderna
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link :to="{name: 'Resources', query: {q: 'remdesivir'}} " class="text-light">remdesivir
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <router-link :to="{name: 'NIAID'} " class="text-light">NIAID-funded
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </small>
        </div>
      </div>

    </div>
  </section>

  <!-- INTRO + VIDEO -->
  <div class="col-sm-12 d-flex justify-content-center align-items-center p-0 bg-grey__lightest">
    <div class="row d-flex align-items-center p-3">
      <div class="col-sm-12 col-lg-6 d-flex flex-column align-items-center justify-content-center px-4 larger">
        <p>
          Outbreak.info is a project from the <a href="http://sulab.org/" target="_blank">Su</a>, <a href="https://wulab.io/" target="_blank">Wu</a>, and <a href="https://andersen-lab.com/" target="_blank">Andersen</a> labs at Scripps Research to
          unify COVID-19 and SARS-CoV-2 epidemiology and genomic data, published research, and other resources.
        </p>

        <p>Researchers, health officials, and the public can track the pandemic using data on cases, deaths, and genomic variants, and stay updated on related research through interactive visualizations, a searchable library, and downloadable raw
          data.
        </p>
      </div>

      <div class="col-sm-12 col-lg-6">
        <video class="w-100 mb-3" controls @play="videoClick">
          <source src="@/assets/home/outbreak_video_v3.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>

  <div id="features" class="d-flex flex-wrap align-items-center justify-content-center py-5 my-5">
    <button class="btn btn-main-outline m-4" data-toggle="collapse" href="#collapsedFeatures">
      What can I do with outbreak.info?
    </button>
    <router-link :to="{ name: 'Sources' }" class="no-underline m-4">
      <button class="btn btn-main-outline">
        Where do we get our data?
      </button>
    </router-link>

    <router-link :to="{ name: 'Latest' }" class="no-underline m-4">
      <button class="btn btn-main-outline">
        What's new at outbreak.info?
      </button>
    </router-link>

    <router-link :to="{ name: 'About', hash: '#jobs' }" class="no-underline m-4">
      <button class="btn btn-main">We're hiring!</button>
    </router-link>
  </div>

  <div class="collapse" id="collapsedFeatures">
    <h1 class="text-center">What can I do with outbreak.info?</h1>

    <!-- EPI EXAMPLES -->
    <section id="epi-examples" class="container my-3">
      <h3 class="mb-1">Explore cases &amp; deaths</h3>
      <p class="text-muted">
        Track how reported COVID-19 cases and deaths are changing over time, how they compare between locations, and where locations have similar case loads.
      </p>
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
            <router-link :to="{name: 'Data'}" class="text-dark h-100 d-flex flex-column">
              <h5 class="text-uppercase">View tables</h5>
              <div class="h-100 d-flex flex-column justify-content-center">
                <img src="@/assets/home/data_table.png" alt="Outbreak.info doubling rates" class="w-100" />
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- GENOMICS -->
    <section id="epi-examples" class="container my-3">
      <h3 class="mb-1">View SARS-CoV-2 Variant Reports</h3>
      <p class="text-muted">
        SARS-CoV-2 variants have been shown to have increased transmissibility, virulence, and/or decreased efficacy of vaccines and therapeutics and have been associated with resurgences of COVID-19 cases and deaths across the world. Our Variant
        Reports are <b>real-time surveillance reports</b> to track the prevalence of these variants or any arbitrary combination of mutations to understand how they're changing.
      </p>
      <div class="row">
        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <router-link :to="{name: 'SituationReports'}" class="text-dark d-flex flex-column justify-content-between">
              <h5 class="text-uppercase">Track Variants of Concern &amp; Interest</h5>
            </router-link>
            <div class="h-100 d-flex flex-column justify-content-center">
              <router-link :to="{name: 'SituationReports'}" class="text-dark d-flex flex-column justify-content-between">
                <img src="@/assets/home/b117_sitrep.png" alt="B.1.1.7 Report" class="w-100" />
              </router-link>
              <a data-toggle="collapse" href="#lineage-report-questions" aria-expanded="false" aria-controls="lineage-report-questions" role="button" class="line-height-1 mt-3 mb-0">What questions can I answer with Lineage | Mutation Tracker
                Reports?</a>
              <ul class="collapse text-highlight fa-sm line-height-1 mt-2" id="lineage-report-questions">
                <li class="mb-2">
                  How many sequences of a lineage /set of mutations have been detected?
                </li>
                <li class="mb-2">
                  What mutations are characteristic of a lineage?
                </li>
                <li class="mb-2">
                  How is its prevalence changing?
                </li>
                <li class="mb-2">
                  Where is the lineage / set of mutations prominent?
                </li>
                <li class="mb-2">
                  What is known about the lineage / mutations in the literature?
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <router-link :to="{name: 'SituationReports', hash:'#custom-report'}" class="text-dark d-flex flex-column justify-content-between">
              <h5 class="text-uppercase">Create custom lineage and/or mutation reports</h5>
            </router-link>
            <CustomReportForm :minimalistic="true" />
          </div>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <router-link :to="{name: 'LocationReports'}" class="text-dark d-flex flex-column justify-content-between">
              <h5 class="text-uppercase">Discover lineages within a location</h5>
            </router-link>
            <div class="h-100 d-flex flex-column justify-content-start">
              <router-link :to="{name: 'LocationReports'}" class="text-dark d-flex flex-column justify-content-between">
                <img src="@/assets/home/usa_locrep.png" alt="USA Mutation Report" class="w-100" />
              </router-link>

              <a data-toggle="collapse" href="#location-report-questions" aria-expanded="false" aria-controls="location-report-questions" role="button" class="line-height-1 mt-3 mb-0">What questions can I answer with Location Tracker
                Reports?</a>
              <ul class="collapse text-highlight fa-sm line-height-1 mt-2" id="location-report-questions">
                <li class="mb-2">
                  What are the most prevalent lineages in a location recently?
                </li>
                <li class="mb-2">
                  What mutations are contained within these lineages?
                </li>
                <li class="mb-2">
                  What Variants of Concern / Interest have been detected here?
                </li>
                <li class="mb-2">
                  Where are the Variants of Concern / Interest most prevalent within the location?
                </li>
                <li class="mb-2">
                  How do the prevalence of lineages or sets of mutations over time compare to daily reported cases?
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <router-link :to="{name: 'SituationReportComparison'}" class="text-dark d-flex flex-column justify-content-between">
              <h5 class="text-uppercase">Compare PANGO Lineages</h5>
              </router-link>
              <div class="h-100 d-flex flex-column justify-content-center">
                <router-link :to="{name: 'SituationReportComparison'}" class="text-dark d-flex flex-column justify-content-between">
                <img src="@/assets/home/p1_b1351_comparison.png" alt="P.1 / B.1.351 Comparison" class="w-100" />
                </router-link>
                <a data-toggle="collapse" href="#compare-lineage-questions" aria-expanded="false" aria-controls="compare-lineage-questions" role="button" class="line-height-1 mt-3 mb-0">What questions can I answer with the Lineage Comparison Tool?</a>

                <ul class="collapse text-highlight fa-sm line-height-1 mt-2" id="compare-lineage-questions">
                  <li class="mb-2">
                    What mutations are shared between lineages?
                  </li>
                  <li class="mb-2">
                    How prevalent are Mutations of Interest with lineages?
                  </li>
                  <li class="mb-2">
                    Which lineages contain a particular mutation like S:E484K?
                  </li>
                  <li class="mb-2">
                    Which lineages are prominent in a location recently?
                  </li>
                </ul>
              </div>

          </div>
        </div>
      </div>
    </section>

    <!-- RESOURCE EXAMPLES -->
    <section id="resource-examples" class="container my-3">
      <h3 class="mb-1">Search COVID-19 research library</h3>
      <p class="text-muted">
        Keeping track of rapidly changing COVID-19 research is a daunting task. We assembled a searchable library of COVID-19 and SARS-CoV-2 publications, datasets, clinical trials, protocols, and more, updated daily.
      </p>
      <div class="row d-flex flex-wrap">

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <router-link :to="{name: 'Resources'}" class="text-dark h-100 d-flex flex-column justify-content-between">
              <h5 class="text-uppercase">Search Resource Library</h5>
              <img src="@/assets/home/resources_search.png" alt="Search Outbreak.info resources" class="w-100 mb-3" />
            </router-link>
          </div>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <h5 class="text-uppercase">Download metadata</h5>
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
              <h5 class="text-uppercase">View &amp; adapt schema</h5>
              <div class="h-100 d-flex align-items-center">
                <img src="@/assets/home/schema_example.png" alt="Outbreak.info schema" class="w-100" />
              </div>
            </router-link>
          </div>
        </div>

      </div>
    </section>

    <!-- ACCESS DATA -->
    <section id="epi-examples" class="container my-3">
      <h3 class="mb-1">Access data</h3>
      <p class="text-muted">
        All the data we aggregate and standardized can be accessed through our API and R package.
      </p>
      <div class="row">
        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <a href="https://api.outbreak.info/try/covid19" target="_blank" rel="noreferrer">
              <h5 class="text-dark">API</h5>
              <img src="@/assets/home/api.png" alt="Outbreak.info" class="w-100 mb-3" />
            </a>
          </div>
        </div>

        <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
          <div class="w-100 p-3 card">
            <a href="https://github.com/outbreak-info/R-outbreak-info" target="_blank" rel="noreferrer">
              <h5 class="text-dark">R package</h5>
              <img src="@/assets/home/R_package.png" alt="Outbreak.info" class="w-100" />
            </a>
          </div>
        </div>
      </div>
    </section>


  </div>


  <section class="d-flex flex-column justify-content-center align-items-left bg-grag-grey text-light px-3 pt-2 mb-5">
    <div class="d-flex justify-content-center align-items-center px-5 py-3">
      <div class="d-flex w-100 justify-content-between">
        <div>
          <h4 class="at-a-glance-header m-0">At a glance</h4>
          <p class="mb-0">
            View the three locations with the largest increase in COVID-19 cases in the
            past day, or select your own locations
          </p>
        </div>
      </div>
      <button class="btn btn-main-outline flex-shrink-0 router-link no-underline bg-white" @click="summaryDeletable = !summaryDeletable">
        {{ summaryDeletable ? "done" : "change locations" }}
      </button>
    </div>

    <div class="row d-flex justify-content-center">
      <GlanceSummary v-for="(location, idx) in glanceSummaries" :key="idx" class="d-flex mx-2 mb-3" :data="location" :idx="location.location_id" :deletable="summaryDeletable" @removed="removeSummary" />

      <div class="d-flex mx-2 py-3 px-3 flex-column align-items-center box-shadow add-items bg-grag-main" v-if="summaryDeletable">
        <h6>Add locations</h6>
        <SearchBar @location="addSummary" class="search-bar"></SearchBar>
      </div>
    </div>
  </section>

</div>
</template>
<script>
// @ is an alias to /src
// import Vue from "vue";
import SearchBar from "@/components/SearchBar.vue";
import CustomReportForm from "@/components/CustomReportForm";
import TypeaheadSelect from "@/components/TypeaheadSelect";
import GlanceSummary from "@/components/GlanceSummary";
import {
  getGlanceSummary
} from "@/api/genomics.js";
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

import {
  findPangolin,
  findLocation
} from "@/api/genomics.js";

export default {
  name: "Home",
  components: {
    SearchBar,
    GlanceSummary,
    FontAwesomeIcon,
    CustomReportForm,
    TypeaheadSelect
  },
  data() {
    return {
      searchQuery: "",
      glanceLocations: [],
      glanceSummaries: [],
      summaryDeletable: false,
      dataSubscription: null,
      queryPangolin: null,
      queryLocation: null
    };
  },
  computed: {
    ...mapState("admin", ["loading"])
  },
  methods: {
    videoClick() {
      this.$gtag.event("video_play", {
        'event_category': `video_play`,
        'event_label': `outbreak.info homepage overview`
      })
    },
    submitLocation(selected) {
      this.$router.push({
        name: "LocationReport",
        query: {
          loc: selected.id
        }
      })
    },
    submitSearch() {
      this.$router.push({
        name: "Resources",
        query: {
          q: this.searchQuery
        }
      });
    },
    updatePangolin(selected) {
      this.$router.push({
        name: "MutationReport",
        query: {
          pango: selected.name
        }
      });
    },
    removeSummary: function(idx) {
      this.glanceLocations = this.glanceLocations.filter((d, i) => d !== idx);
      Vue.$cookies.set("custom_locations", this.glanceLocations);
      if (this.glanceLocations.length > 0) {
        this.updatedSubscription = getGlanceSummary(
          this.$apiurl, this.$genomicsurl,
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
        this.$apiurl, this.$genomicsurl,
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

    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;

    this.dataSubscription = getGlanceSummary(
      this.$apiurl, this.$genomicsurl,
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
    background: #507192;
    border-left: 3px solid white;
}

.variants-intro {
    background: $secondary-color;
    border-left: 3px solid white;
}

.epi-intro {
    background: $primary-color;

}

@media (max-width:767px) {
    .epi-intro {
        border: none !important;
    }
    .variants-intro {
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

.w-20 {
    width: 20% !important;
}

.larger {
    font-size: x-large;
}
</style>
