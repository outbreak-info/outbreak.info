<template>
<div id="app">
  <!-- HEADER -->
  <!-- IMPORTANT: when editing the header, make sure you edit the footer site map below too -->
  <header id="outbreak-header">
    <nav class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero">

      <router-link to="/" class="navbar-brand no-underline" v-if="!$route.meta.hideNavigation">
        <img src="@/assets/icon-01.svg" width="30" height="30" class="d-inline-block align-top" alt="Outbreak.info" />
        outbreak.info
      </router-link>

      <!-- Add hard coded link to outbreak.info for the minimalistic nav bar for embeds -->
      <a href="https://outbreak.info" class="navbar-brand no-underline" v-else>
        <img src="@/assets/icon-01.svg" width="30" height="30" class="d-inline-block align-top" alt="Outbreak.info" />
        outbreak.info
      </a>

        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav" v-if="!$route.meta.hideNavigation">
          <ul class="navbar-nav nav-link">
            <!-- EPIDEMIOLOGY -->
            <li class="dropdown px-3 nav-link">
              <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Cases &amp; Deaths
              </div>
              <div class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton">
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Epidemiology' }" :to="{
                    name: 'Epidemiology'}">
                  Compare locations over time
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Maps' }" :to="{
                    name: 'Maps'
                  }">Explore interactive maps</router-link>

                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Compare' }" :to="{
                    name: 'Compare'
                  }">Find similar locations</router-link>

                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Regions' }" :to="{
                    name: 'Regions'
                  }">Explore regions</router-link>

                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Doubling Rates' }" :to="{
                    name: 'Doubling Rates',
                    query: { location: 'USA', variable: 'confirmed' }
                  }">View doubling rates</router-link>

                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/data" :class="{ active: $route.name == 'Data' }">Access data tables
                </router-link>
              </div>
            </li>

            <!-- Genomics -->
            <li class="dropdown px-3 nav-link">
              <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Variants
              </div>
              <div class="dropdown-menu dropdown-menu-dark p-1" aria-labelledby="dropdownMenuButton">
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :to="{name: 'SituationReports'}" :class="{ active: $route.name == 'SituationReports' }">Lineage | Mutation Tracker
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :to="{name: 'LocationReports'}" :class="{ active: $route.name == 'LocationReports' }">Location Tracker
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :to="{name: 'SituationReportComparison'}" :class="{ active: $route.name == 'SituationReportComparison' }">Lineage Comparison
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :to="{name: 'SituationReportCaveats'}" :class="{ active: $route.name == 'SituationReportCaveats' }">Intrepreting Reports
                </router-link>
              </div>
            </li>

            <!-- RESOURCES -->
            <li class="dropdown px-3 nav-link">
              <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Research Library
              </div>
              <div class="dropdown-menu dropdown-menu-dark p-1" aria-labelledby="dropdownMenuButton">
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/resources" :class="{ active: $route.name == 'Resources' }">Find research
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :to="{name: 'Sources', hash: '#resources'}" :class="{ active: $route.name == 'Sources' }">Download metadata
                </router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/schema" :class="{ active: $route.name == 'Schema' }">View &amp; adapt schema
                </router-link>
              </div>
            </li>

            <!-- API -->
            <li class="nav-item">
              <a class="nav-link" href="https://api.outbreak.info/">API</a>
            </li>

            <!-- ABOUT -->
            <li class="dropdown px-3 nav-link">
              <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                About
              </div>
              <div class="dropdown-menu dropdown-menu-dark p-1" aria-labelledby="dropdownMenuButton">
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/about" :class="{ active: $route.name == 'About' }">About</router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/sources" :class="{ active: $route.name == 'Sources' }">Data sources</router-link>
                <a class="nav-link" href="https://blog.outbreak.info">Blog</a>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/faq" :class="{ active: $route.name == 'Faq' }">FAQ</router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/latest" :class="{ active: $route.name == 'Latest' }">Latest changes</router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Citation' }" :to="{name: 'Citation'}">How to cite</router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Videos' }" :to="{name: 'Videos'}">Video demos</router-link>
                <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Press' }" :to="{name: 'Press'}">In the media</router-link>
              </div>
            </li>

          </ul>
        </div>
    </nav>
  </header>
  <transition name="fade">
    <router-view class="main" />
  </transition>


  <!-- FOOTER -->
  <footer id="outbreak-footer" class="bg-main__darker pt-4" v-if="!$route.meta.hideNavigation">
    <!-- sitemap -->
    <div class="w-100 d-flex justify-content-between text-left text-muted row border-bottom navbar-dark m-0 px-3 pb-3" id="footer-sitemap">
      <!-- epi group -->
      <div class="text-light px-4 footer-section">
        <div class="navbar-footer-title">COVID-19 Cases &amp; Deaths</div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :class="{ active: $route.name == 'Epidemiology' }" :to="{
                  name: 'Epidemiology',
                }">
              Compare locations over time
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :class="{ active: $route.name == 'Maps' }" :to="{
                  name: 'Maps',
                }">Explore interactive maps</router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :class="{ active: $route.name == 'Compare' }" :to="{
                  name: 'Compare',
                }">Find similar locations</router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :class="{ active: $route.name == 'Regions' }" :to="{
                  name: 'Regions',
                }">Explore regions</router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :class="{ active: $route.name == 'Doubling Rates' }" :to="{
                  name: 'Doubling Rates',
                  query: { location: 'USA', variable: 'confirmed' },
                }">View doubling rates</router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/data" :class="{ active: $route.name == 'Data' }">Access data tables
            </router-link>
          </li>
        </ul>
      </div>

      <!-- genomics group -->
      <div class="text-light px-4 footer-section">
        <div class="navbar-footer-title">Variants</div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :to="{ name: 'SituationReports' }" :class="{ active: $route.name == 'SituationReports' }">Lineage | Mutation Tracker
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :to="{ name: 'LocationReports' }" :class="{ active: $route.name == 'LocationReports' }">Location Tracker
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :to="{ name: 'SituationReportComparison' }" :class="{ active: $route.name == 'SituationReportComparison' }">Lineage Comparison
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :to="{ name: 'SituationReportCaveats' }" :class="{ active: $route.name == 'SituationReportCaveats' }">Interpreting Reports
            </router-link>
          </li>
        </ul>
      </div>

      <!-- resources group -->
      <div class="text-light px-4 footer-section">
        <div class="navbar-footer-title">Research Library</div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/resources" :class="{ active: $route.name == 'Resources' }">Find research
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" :to="{ name: 'Sources', hash: '#resources' }" :class="{ active: $route.name == 'Sources' }">Download metadata
            </router-link>
          </li>
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/schema" :class="{ active: $route.name == 'Schema' }">View &amp; adapt schema
            </router-link>
          </li>
        </ul>
      </div>

      <!-- about group -->
      <div class="text-light px-4 footer-section">
        <div class="navbar-footer-title">About</div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/about" :class="{ active: $route.name == 'About' }">About us</router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/sources" :class="{ active: $route.name == 'Sources' }">Data sources
            </router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <a class="nav-link p-0" href="https://blog.outbreak.info">Blog</a>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/faq" :class="{ active: $route.name == 'FAQ' }">FAQ</router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link p-0" to="/latest" :class="{ active: $route.name == 'Latest' }">Latest changes</router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link class="nav-link p-0" :to="{ name: 'Citation' }">How to cite</router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link class="nav-link p-0" :to="{ name: 'Videos' }">Video demos</router-link>
          </li>

          <li class="nav-item px-0 py-1">
            <router-link class="nav-link p-0" :to="{ name: 'Press' }">In the media</router-link>
          </li>
        </ul>
      </div>

      <!-- contact us group -->
      <div class="text-light px-4 footer-section">
        <div class="navbar-footer-title">Contact us</div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item px-0 py-1">
            <a href="mailto:help@outbreak.info" target="_blank" class="nav-link p-0">
              help@outbreak.info
            </a>
          </li>

          <li class="nav-item px-0 py-1">
            <a class="nav-link p-0" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
          </li>
          <EmailSubscription :isFooter="true" />
        </ul>
      </div>
    </div>

    <!-- LOGO FOOTER -->
    <Logos class="bg-grey" />

    <div class="
          row
          m-0
          bg-main__darker
          d-flex
          justify-content-center
          align-items-center
          py-1
        " id="terms">
      <div class="d-flex text-light xsmall">
        <ul class="m-0">
          <li class="d-inline m-3">
            <router-link class="text-light" :to="{ name: 'Citation' }">How to Cite</router-link>
          </li>
          <li class="d-inline m-3">
            <router-link class="text-light" to="/privacy">Privacy Policy</router-link>
          </li>
          <li class="d-inline m-3">
            <router-link class="text-light" to="/terms">Terms</router-link>
          </li>
          <li class="d-inline m-3">
            All content copyright
            <a href="http://sulab.org/" target="_blank" rel="noreferrer" class="mx-1 white-underline">
              SuLab</a>
            &copy; <span v-text="year"></span>
          </li>
          <li class="d-inline m-3">All rights reserved</li>
        </ul>
      </div>
    </div>
  </footer>
</div>
</template>

<script>
import Logos from "@/components/Logos.vue";
import EmailSubscription from "@/components/EmailSubscription.vue";

export default {
  name: "App",
  components: {
    Logos,
    EmailSubscription
  },
  data() {
    return {
      year: ""
    };
  },
  mounted() {
    var self = this;
    var currentTime = new Date();
    self.year = currentTime.getFullYear();
  }
}
</script>

<style lang="scss">
@import "./styles/global.scss";

.navbar-collapse.collapsing {
    -webkit-transition: height 0s;
    -moz-transition: height 0s;
    -ms-transition: height 0s;
    -o-transition: height 0s;
    transition: height 0s;
}

.dropdown-menu-dark {
    background: $primary-color;
}

.dropdown-menu {
    line-height: 1.2em;
}

.navbar-footer {
    font-size: small;
}

.navbar-footer-title {
    font-size: medium;
    margin-top: 15px;
}
@media (max-width: 667px) {
    .navbar-footer-title {
        line-height: 1.2rem;
        font-size: medium;
        margin-top: 15px;
    }
}
.navbar-footer {
    font-size: small;
}
@media (max-width: 667px) {
    .navbar-footer {
        line-height: 0.95rem;
    }
}
.footer-section {
    width: 255px;
}
@media (max-width: 667px) {
    .footer-section {
        width: 170px;
    }
}

.navbar-footer .nav-link {
    color: rgba(255,255,255, 0.7) !important;
}
</style>
