<template>
<div id="app">
  <!-- HEADER -->
  <!-- IMPORTANT: when editing the header, make sure you edit the footer site map below too -->
  <header id="outbreak-header">
    <nav class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero">
      <router-link to="/" class="navbar-brand no-underline">
        <img src="@/assets/icon-01.svg" width="30" height="30" class="d-inline-block align-top" alt="Outbreak.info" />
        outbreak.info | {{localBuildName}}
      </router-link>
      <button class="navbar-toggler" type="button" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
 
        <ul class="navbar-nav nav-link ms-auto">
          <!-- Genomics -->
              <router-link class="nav-item nav-link" :to="{name: 'SituationReports'}" :class="{ active: $route.name == 'SituationReports' }">Lineage | Mutation Tracker
              </router-link>
              <router-link class="nav-item nav-link" :to="{name: 'LocationReports'}" :class="{ active: $route.name == 'LocationReports' }">Location Tracker
              </router-link>
              <router-link class="nav-item nav-link" :to="{name: 'SituationReportComparison'}" :class="{ active: $route.name == 'SituationReportComparison' }">Lineage Comparison
              </router-link>
              <router-link class="nav-link" :to="{name: 'SituationReportCaveats'}" :class="{ active: $route.name == 'SituationReportCaveats' }">Intrepreting Reports
              </router-link>
              <router-link class="nav-item nav-link" :to="{name: 'About'}" :class="{ active: $route.name == 'About' }">About
              </router-link>
              <a class="nav-item nav-link" href="https://outbreak.info/">View Global Data at Outbreak.info</a> 
        </ul>
    </nav>
  </header>
  <transition name="fade">
    <router-view class="main" />
  </transition>


  <!-- FOOTER -->
  <footer id="outbreak-footer" class="bg-main__darker pt-4">
    <!-- sitemap -->
    <div class="w-100 d-flex justify-content-between text-left text-muted row border-bottom navbar-dark m-0 px-3 pb-3" id="footer-sitemap">
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
import json from "@/localConfig.json";
export default {
  name: "App",
  components: {
    Logos,
  },
  data() {
    return {
      year: "",
      localConfig: json
    };
  },
  mounted() {
    
    var self = this;
    var currentTime = new Date();
    self.year = currentTime.getFullYear();
    this.localBuildName = json['local-build-name']  
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
