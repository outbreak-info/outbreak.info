<template>
  <div class="home flex-column text-left d-flex">
    <!-- INTRO -->
    <section>
      <div class="row m-0">
        <div
          class="col-sm-12 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1"
        >
          <div class="d-flex flex-column w-100 align-items-center my-2">
            <img
              src="@/assets/logo-full-white-01.svg"
              alt="Outbreak.info"
              class="w-20"
            />
            <p class="text-light my-1 mx-3">
              Tools to explore COVID-19 and SARS-CoV-2 data with variant
              surveillance reports, data on cases and deaths, and a
              standardized, searchable research library
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SEARCH  -->
    <section
      class="d-flex justify-content-center align-items-center mb-4 text-light"
    >
      <div class="row m-0 w-100 d-flex justify-content-center">
        <!-- EPI INTRO -->
        <div
          class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between epi-intro"
        >
          <div class="mb-3">
            <router-link :to="{ name: 'Epidemiology' }" class="text-light">
              <h3 class="my-3">COVID-19 Cases &amp; Deaths</h3>
            </router-link>

            <div
              id="sBar-text"
              class="form-text d-block mb-3 text-light-highlight line-height-1"
            >
              View COVID-19 trends by region, country, state/province, U.S.
              metropolitan area, or U.S. county
            </div>
          </div>

          <div>
            <SearchBar
              routeTo="/epidemiology?"
              placeholder="Search location"
              class="w-100"
              :darkMode="false"
            />
            <small id="sBar-example" class="form-text d-block text-left ml-5">
              <span class="mr-2">Try:</span>
              <span class="mr-3">
                <router-link
                  :to="{ name: 'Epidemiology', query: { location: 'BRA' } }"
                  class="text-light"
                >
                  Brazil

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>

              <span class="mr-3">
                <router-link
                  :to="{
                    name: 'Epidemiology',
                    query: { location: 'USA_US-CA' },
                  }"
                  class="text-light"
                >
                  California

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>

              <router-link
                :to="{
                  name: 'Epidemiology',
                  query: { location: 'USA_US-KS-28140' },
                }"
                class="text-light"
              >
                Kansas City metro area

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </small>
          </div>
        </div>

        <!-- VARIANTS -->
        <div
          class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between variants-intro"
        >
          <div class="mb-3">
            <div
              class="d-flex align-items-center justify-content-between text-light"
            >
              <router-link
                :to="{ name: 'SituationReports' }"
                class="text-light"
              >
                <h3 class="my-3">Variants</h3>
              </router-link>
              <small class="ml-2">
                enabled by data from
                <a
                  href="https://www.gisaid.org/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <img
                    src="@/assets/resources/gisaid.png"
                    class="gisaid-small ml-2"
                    alt="GISAID Initiative"
                  />
                </a>
              </small>
            </div>

            <div
              id="resourceBar-text"
              class="form-text d-block text-light-highlight line-height-1"
            >
              Explore SARS-CoV-2 lineage, variant, and mutation situation
              reports
            </div>
          </div>

          <div id="search-lineage">
            <form id="search-lineage-input" autocomplete="off" class="w-100">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span
                    id="sb-lineage"
                    class="input-group-text bg-grey text-muted border-0"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
                <TypeaheadSelect
                  :isStandalone="false"
                  class="form-control border"
                  :queryFunction="queryPangolin"
                  :apiUrl="$genomicsurl"
                  :removeOnSelect="true"
                  placeholder="Search PANGO lineage"
                  @selected="updatePangolin"
                />
              </div>
            </form>
            <small
              id="sBar-example-variant-lineage"
              class="form-text d-block text-left ml-5"
            >
              <span class="mr-2">Try:</span>
              <span
                class="mr-3"
                v-for="(example, gIdx) in genomicsExamples"
                :key="gIdx"
              >
                <template v-if="example.who_name">
                  <router-link
                    :to="{
                      name: 'MutationReport',
                      params: { alias: example.who_name },
                    }"
                    class="text-light"
                  >
                    {{ example.short_name }}
                    <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                  </router-link>
                </template>
                <template v-else>
                  <router-link
                    :to="{
                      name: 'MutationReport',
                      query: { pango: example.pangolin_lineage },
                    }"
                    class="text-light"
                  >
                    {{ example.short_name }}
                    <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                  </router-link>
                </template>
              </span>
            </small>
          </div>

          <div id="search-variant-location" class="mt-3">
            <form
              id="search-variant-location-input"
              autocomplete="off"
              class="w-100"
            >
              <div class="input-group">
                <div class="input-group-prepend">
                  <span
                    id="sb-variant"
                    class="input-group-text bg-grey text-muted border-0"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
                <TypeaheadSelect
                  :isStandalone="false"
                  class="form-control border"
                  :queryFunction="queryLocation"
                  :apiUrl="$genomicsurl"
                  labelVariable="label"
                  :removeOnSelect="false"
                  placeholder="Select location"
                  totalLabel="total sequences"
                  @selected="submitLocation"
                />
              </div>
            </form>
            <small
              id="sBar-example-variant-location"
              class="form-text d-block text-left ml-5"
            >
              <span class="mr-2">Try:</span>
              <span class="mr-3">
                <router-link
                  :to="{ name: 'LocationReport', query: { loc: 'USA' } }"
                  class="text-light"
                >
                  USA

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
              <span class="mr-3">
                <router-link
                  :to="{ name: 'LocationReport', query: { loc: 'GBR' } }"
                  class="text-light"
                >
                  U.K.

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
              <span class="mr-3">
                <router-link
                  :to="{ name: 'LocationReport', query: { loc: 'USA_US-NY' } }"
                  class="text-light"
                >
                  New York

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
              <span class="mr-3">
                <router-link
                  :to="{
                    name: 'LocationReport',
                    query: { loc: 'USA_US-CA_06073' },
                  }"
                  class="text-light"
                >
                  San Diego

                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
            </small>
          </div>
        </div>

        <!-- resources -->
        <div
          class="col-sm-12 col-md-4 px-5 py-3 d-flex flex-column justify-content-between resources-intro"
        >
          <div class="mb-3">
            <router-link :to="{ name: 'Resource Summary' }" class="text-light">
              <h3 class="my-3">Research Library</h3>
            </router-link>

            <div
              id="resourceBar-text"
              class="form-text d-block mb-3 text-light-highlight line-height-1"
            >
              Find COVID-19 and SARS-CoV-2 publications, clinical trials,
              datasets, protocols, and more
            </div>
          </div>

          <div>
            <form id="search-resources" autocomplete="off" class="w-100">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span
                    id="sb-resources"
                    class="input-group-text bg-grey text-muted border-0"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
                <input
                  id="resourceBar"
                  v-model="searchQuery"
                  class="form-control border"
                  placeholder="Search resources"
                  aria-label="search resources"
                  aria-describedby="sb"
                  type="text"
                  @keydown.enter.prevent="submitSearch"
                />
              </div>
            </form>
            <small id="sBar-example" class="form-text d-block text-left ml-5">
              <span class="mr-2">Try:</span>

              <span
                class="mr-3"
                v-for="(resource, rId) in resourceExamples"
                :key="rId"
              >
                <router-link
                  :to="{ name: resource.route, query: { q: resource.query } }"
                  class="text-light"
                >
                  {{ resource.label }}
                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
            </small>
          </div>
        </div>
      </div>
    </section>

    <!-- INTRO + VIDEO -->
    <div class="col-sm-12 p-0 bg-grey__lightest">
      <div class="d-flex p-3">
        <div
          class="mx-lg-5 mx-sm-0 d-flex flex-column align-items-center justify-content-center px-4 large"
        >
          <p>
            Outbreak.info is a project from the
            <a
              href="https://www.scripps.edu/faculty/hughes/"
              rel="noreferrer"
              target="_blank"
              aria-label="scripps edu hughes"
            >
              Hughes
            </a>
            ,
            <a href="http://sulab.org/" target="_blank" aria-label="sulab">
              Su
            </a>
            ,
            <a href="https://wulab.io/" target="_blank" aria-label="wulab">
              Wu
            </a>
            , and

            <a
              href="https://andersen-lab.com/"
              target="_blank"
              aria-label="andersen-lab"
            >
              Andersen
            </a>
            labs at Scripps Research to unify COVID-19 and SARS-CoV-2
            epidemiology and genomic data, published research, and other
            resources.
          </p>

          <p>
            Researchers, health officials, and the public can track the pandemic
            using data on cases, deaths, and genomic variants, and stay updated
            on related research through interactive visualizations, a searchable
            library, and downloadable raw data.
          </p>
        </div>
      </div>
    </div>

    <div
      id="features"
      class="d-flex flex-wrap align-items-center justify-content-center py-5 my-5"
    >
      <button
        class="btn btn-main-outline m-4"
        data-toggle="collapse"
        href="#collapsedFeatures"
      >
        What can I do with outbreak.info?
      </button>
      <router-link :to="{ name: 'Sources' }" class="no-underline m-4">
        <button class="btn btn-main-outline">Where do we get our data?</button>
      </router-link>

      <router-link :to="{ name: 'Latest' }" class="no-underline m-4">
        <button class="btn btn-main-outline">
          What's new at outbreak.info?
        </button>
      </router-link>

      <router-link
        :to="{ name: 'About', hash: '#jobs' }"
        class="no-underline m-4"
      >
        <button class="btn btn-main">We're hiring!</button>
      </router-link>
    </div>

    <div id="collapsedFeatures" class="collapse">
      <h1 class="text-center">What can I do with outbreak.info?</h1>

      <!-- EPI EXAMPLES -->
      <section id="epi-examples" class="container my-3">
        <h3 class="mb-1">Explore cases &amp; deaths</h3>
        <p class="text-muted">
          Track how reported COVID-19 cases and deaths are changing over time,
          how they compare between locations, and where locations have similar
          case loads.
        </p>
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Epidemiology' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">Compare locations over time</h5>
                <img
                  src="@/assets/home/epi_example.svg"
                  alt="Outbreak.info epidemiology data over time"
                  class="w-100"
                />
              </router-link>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Maps' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">View by geography</h5>
                <img
                  src="@/assets/home/map_example.svg"
                  alt="Outbreak.info U.S. epidemiology data by metro area"
                  class="w-100"
                />
              </router-link>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Compare' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">Find similar regions</h5>
                <img
                  src="@/assets/home/compare_example.png"
                  alt="Outbreak.info compare regions"
                  class="w-100"
                />
              </router-link>
            </div>
          </div>

          <!-- EPI CURVE SUMMARIES -->
          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <section id="regional-epi-curves" class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Regions' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">Explore regions</h5>
                <div class="h-100 d-flex flex-column justify-content-center">
                  <img
                    src="@/assets/home/regions_example.svg"
                    alt="Outbreak.info regional data"
                    class="w-100"
                  />
                </div>
              </router-link>
            </section>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Data' }"
                class="text-dark h-100 d-flex flex-column"
              >
                <h5 class="text-uppercase">View tables</h5>
                <div class="h-100 d-flex flex-column justify-content-center">
                  <img
                    src="@/assets/home/data_table.png"
                    alt="Outbreak.info doubling rates"
                    class="w-100"
                  />
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
          SARS-CoV-2 variants have been shown to have increased
          transmissibility, virulence, and/or decreased efficacy of vaccines and
          therapeutics and have been associated with resurgences of COVID-19
          cases and deaths across the world. Our Variant Reports are
          <b>real-time surveillance reports</b>
          to track the prevalence of these variants or any arbitrary combination
          of mutations to understand how they're changing.
        </p>
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'SituationReports' }"
                class="text-dark d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">
                  Track Variants of Concern &amp; Interest
                </h5>
              </router-link>
              <div class="h-100 d-flex flex-column justify-content-center">
                <router-link
                  :to="{ name: 'SituationReports' }"
                  class="text-dark d-flex flex-column justify-content-between"
                >
                  <img
                    src="@/assets/home/b117_sitrep.png"
                    alt="B.1.1.7 Report"
                    class="w-100"
                  />
                </router-link>
                <a
                  data-toggle="collapse"
                  href="#lineage-report-questions"
                  aria-expanded="false"
                  aria-controls="lineage-report-questions"
                  role="button"
                  class="line-height-1 mt-3 mb-0"
                >
                  What questions can I answer with Lineage | Mutation Tracker
                  Reports?
                </a>

                <ul
                  id="lineage-report-questions"
                  class="collapse text-highlight fa-sm line-height-1 mt-2"
                >
                  <li class="mb-2">
                    How many sequences of a lineage /set of mutations have been
                    detected?
                  </li>
                  <li class="mb-2">
                    What mutations are characteristic of a lineage?
                  </li>
                  <li class="mb-2">How is its prevalence changing?</li>
                  <li class="mb-2">
                    Where is the lineage / set of mutations prominent?
                  </li>
                  <li class="mb-2">
                    What is known about the lineage / mutations in the
                    literature?
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'SituationReports', hash: '#custom-report' }"
                class="text-dark d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">
                  Create custom lineage and/or mutation reports
                </h5>
              </router-link>
              <CustomReportForm :minimalistic="true" />
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'LocationReports' }"
                class="text-dark d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">
                  Discover lineages within a location
                </h5>
              </router-link>
              <div class="h-100 d-flex flex-column justify-content-start">
                <router-link
                  :to="{ name: 'LocationReports' }"
                  class="text-dark d-flex flex-column justify-content-between"
                >
                  <img
                    src="@/assets/home/usa_locrep.png"
                    alt="USA Mutation Report"
                    class="w-100"
                  />
                </router-link>

                <a
                  data-toggle="collapse"
                  href="#location-report-questions"
                  aria-expanded="false"
                  aria-controls="location-report-questions"
                  role="button"
                  class="line-height-1 mt-3 mb-0"
                >
                  What questions can I answer with Location Tracker Reports?
                </a>

                <ul
                  id="location-report-questions"
                  class="collapse text-highlight fa-sm line-height-1 mt-2"
                >
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
                    Where are the Variants of Concern / Interest most prevalent
                    within the location?
                  </li>
                  <li class="mb-2">
                    How do the prevalence of lineages or sets of mutations over
                    time compare to daily reported cases?
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'SituationReportComparison' }"
                class="text-dark d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">Compare PANGO Lineages</h5>
              </router-link>
              <div class="h-100 d-flex flex-column justify-content-center">
                <router-link
                  :to="{ name: 'SituationReportComparison' }"
                  class="text-dark d-flex flex-column justify-content-between"
                >
                  <img
                    src="@/assets/home/p1_b1351_comparison.png"
                    alt="P.1 / B.1.351 Comparison"
                    class="w-100"
                  />
                </router-link>
                <a
                  data-toggle="collapse"
                  href="#compare-lineage-questions"
                  aria-expanded="false"
                  aria-controls="compare-lineage-questions"
                  role="button"
                  class="line-height-1 mt-3 mb-0"
                >
                  What questions can I answer with the Lineage Comparison Tool?
                </a>

                <ul
                  id="compare-lineage-questions"
                  class="collapse text-highlight fa-sm line-height-1 mt-2"
                >
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
          Keeping track of rapidly changing COVID-19 research is a daunting
          task. We assembled a searchable library of COVID-19 and SARS-CoV-2
          publications, datasets, clinical trials, protocols, and more, updated
          daily.
        </p>
        <div class="row d-flex flex-wrap">
          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Resources' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">Search Resource Library</h5>
                <img
                  src="@/assets/home/resources_search.png"
                  alt="Search Outbreak.info resources"
                  class="w-100 mb-3"
                />
              </router-link>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <h5 class="text-uppercase">Download metadata</h5>
              <a
                href="https://api.outbreak.info/try/resources"
                target="_blank"
                rel="noreferrer"
              >
                <h6>API</h6>
                <img
                  src="@/assets/home/api_resources.png"
                  alt="Outbreak.info"
                  class="w-100 mb-3"
                />
              </a>
              <router-link :to="{ name: 'Sources', hash: '#resources' }">
                <h6>.tsv files</h6>
                <img
                  src="@/assets/home/download_data.png"
                  alt="Download Outbreak.info metadata"
                  class="w-100 mb-3"
                />
              </router-link>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <router-link
                :to="{ name: 'Schema' }"
                class="text-dark h-100 d-flex flex-column justify-content-between"
              >
                <h5 class="text-uppercase">View &amp; adapt schema</h5>
                <div class="h-100 d-flex align-items-center">
                  <img
                    src="@/assets/home/schema_example.png"
                    alt="Outbreak.info schema"
                    class="w-100"
                  />
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
          All the data we aggregate and standardized can be accessed through our
          API and R package.
        </p>
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <a
                href="https://api.outbreak.info/try/covid19"
                target="_blank"
                rel="noreferrer"
              >
                <h5 class="text-dark">API</h5>
                <img
                  src="@/assets/home/api.png"
                  alt="Outbreak.info"
                  class="w-100 mb-3"
                />
              </a>
            </div>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
            <div class="w-100 p-3 card">
              <a
                href="https://github.com/outbreak-info/R-outbreak-info"
                target="_blank"
                rel="noreferrer"
              >
                <h5 class="text-dark">R package</h5>
                <img
                  src="@/assets/home/R_package.png"
                  alt="Outbreak.info"
                  class="w-100"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { findPangolin, findLocation } from '@/api/genomics.js';
import RESOURCEEXAMPLES from '@/assets/examples/resources_examples.json';
import GENOMICSEXAMPLES from '@/assets/examples/genomics_examples.json';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const SearchBar = lazyLoad('SearchBar');
const CustomReportForm = lazyLoad('CustomReportForm');
const TypeaheadSelect = lazyLoad('TypeaheadSelect');

const store = adminStore();
const { loading } = storeToRefs(store);

// instead of this.$router
const router = useRouter();

const searchQuery = ref('');
const queryPangolin = ref(null);
const queryLocation = ref(null);
const resourceExamples = ref([]);
const genomicsExamples = ref([]);

onMounted(() => {
  resourceExamples.value = RESOURCEEXAMPLES;
  genomicsExamples.value = GENOMICSEXAMPLES;

  queryPangolin.value = findPangolin;
  queryLocation.value = findLocation;

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

const submitLocation = (selected) => {
  router.push({
    name: 'LocationReport',
    query: {
      loc: selected.id,
    },
  });
};

const submitSearch = () => {
  router.push({
    name: 'Resources',
    query: {
      q: searchQuery.value,
    },
  });
};

const updatePangolin = (selected) => {
  if (selected.alias) {
    router.push({
      name: 'MutationReport',
      params: {
        alias: selected.name.toLowerCase(),
      },
    });
  } else {
    router.push({
      name: 'MutationReport',
      query: {
        pango: selected.name,
      },
    });
  }
};
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

@media (max-width: 767px) {
  .epi-intro {
    border: none !important;
  }
  .variants-intro {
    border: none !important;
  }
  .resources-intro {
    border: none !important;
  }
}
.mb-px-5 {
  padding-left: 3rem;
  padding-right: 3rem;
}
@media (max-width: 500px) {
  .mb-px-5 {
    padding-left: 0;
    padding-right: 0;
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
