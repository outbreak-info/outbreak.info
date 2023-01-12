<template>
  <div id="app">
    <!-- HEADER -->
    <!-- IMPORTANT: when editing the header, make sure you edit the footer site map below too -->
    <header id="outbreak-header">
      <nav
        v-if="!$route.meta.includeGISAIDLogo"
        class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero"
        data-cy="navigation"
      >
        <router-link
          v-if="!$route.meta.hideNavigation"
          to="/"
          class="navbar-brand no-underline"
        >
          <img
            src="@/assets/icon-01.svg"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt="Outbreak.info"
          />
          outbreak.info
        </router-link>

        <!-- Add hard coded link to outbreak.info for the minimalistic nav bar for embeds -->
        <div
          v-else-if="!$route.meta.includeGISAIDLogo"
          class="d-flex w-100 align-items-center justify-content-between"
        >
          <a href="https://outbreak.info" class="navbar-brand no-underline">
            <img
              src="@/assets/icon-01.svg"
              width="30"
              height="30"
              class="d-inline-block align-top"
              alt="Outbreak.info"
            />
            outbreak.info
          </a>
        </div>

        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          data-cy="navigation-toggle-button"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div
          v-if="!$route.meta.hideNavigation"
          id="navbarNav"
          class="collapse navbar-collapse"
        >
          <ul class="navbar-nav nav-link" data-cy="nav-link">
            <!-- EPIDEMIOLOGY -->
            <li class="dropdown px-3 nav-link" data-cy="nav-epidemiology">
              <div
                id="dropdownMenuButtonCasesDeaths"
                class="dropdown-toggle"
                type="button"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                data-cy="case-deaths"
              >
                Cases &amp; Deaths
              </div>
              <div
                class="dropdown-menu dropdown-menu-dark"
                aria-labelledby="dropdownMenuButtonCasesDeaths"
                data-cy="epidemiology-dropdown"
              >
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Epidemiology' }"
                  :to="{
                    name: 'Epidemiology',
                  }"
                  data-cy="item-epidemiology"
                >
                  Compare locations over time
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Maps' }"
                  :to="{
                    name: 'Maps',
                  }"
                  data-cy="item-maps"
                >
                  Explore interactive maps
                </router-link>

                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Compare' }"
                  :to="{
                    name: 'Compare',
                  }"
                  data-cy="item-compare"
                >
                  Find similar locations
                </router-link>

                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Regions' }"
                  :to="{
                    name: 'Regions',
                  }"
                  data-cy="item-regions"
                >
                  Explore regions
                </router-link>

                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/data"
                  :class="{ active: $route.name === 'Data' }"
                  data-cy="item-access-datatable"
                >
                  Access data tables
                </router-link>
              </div>
            </li>

            <!-- Genomics -->
            <li class="dropdown px-3 nav-link" data-cy="nav-genomics">
              <div
                id="dropdownMenuButtonVariants"
                class="dropdown-toggle"
                type="button"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                data-cy="variants"
              >
                Variants
              </div>
              <div
                class="dropdown-menu dropdown-menu-dark p-1"
                aria-labelledby="dropdownMenuButtonVariants"
                data-cy="genomics-dropdown"
              >
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :to="{ name: 'SituationReports' }"
                  :class="{ active: $route.name === 'SituationReports' }"
                  data-cy="item-situation-reports"
                >
                  Lineage | Mutation Tracker
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :to="{ name: 'LocationReports' }"
                  :class="{ active: $route.name === 'LocationReports' }"
                  data-cy="item-location-reports"
                >
                  Location Tracker
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :to="{ name: 'SituationReportComparison' }"
                  :class="{
                    active: $route.name === 'SituationReportComparison',
                  }"
                  data-cy="item-situation-report-comparison"
                >
                  Lineage Comparison
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :to="{ name: 'SituationReportCaveats' }"
                  :class="{ active: $route.name === 'SituationReportCaveats' }"
                  data-cy="item-interpreting-reports"
                >
                  Interpreting Reports
                </router-link>
              </div>
            </li>

            <!-- RESOURCES -->
            <li class="dropdown px-3 nav-link" data-cy="nav-resources">
              <div
                id="dropdownMenuButtonResearchLibrary"
                class="dropdown-toggle"
                type="button"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                data-cy="research-library"
              >
                Research Library
              </div>
              <div
                class="dropdown-menu dropdown-menu-dark p-1"
                aria-labelledby="dropdownMenuButtonResearchLibrary"
                data-cy="resources-dropdown"
              >
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/resources"
                  :class="{ active: $route.name === 'Resources' }"
                  data-cy="item-find-research"
                >
                  Find research
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :to="{ name: 'Sources', hash: '#resources' }"
                  :class="{ active: $route.name === 'Sources' }"
                  data-cy="item-download-metadata"
                >
                  Download metadata
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/schema"
                  :class="{ active: $route.name === 'Schema' }"
                  data-cy="item-schema"
                >
                  View &amp; adapt schema
                </router-link>
              </div>
            </li>

            <!-- API -->
            <li class="nav-item" data-cy="nav-api">
              <a
                class="nav-link"
                href="https://api.outbreak.info/"
                data-cy="item-outbreak-api"
              >
                API
              </a>
            </li>

            <!-- ABOUT -->
            <li class="dropdown px-3 nav-link" data-cy="nav-about">
              <div
                id="dropdownMenuButtonAbout"
                class="dropdown-toggle"
                type="button"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                data-cy="outbreak-about"
              >
                About
              </div>
              <div
                class="dropdown-menu dropdown-menu-dark p-1"
                aria-labelledby="dropdownMenuButtonAbout"
                data-cy="about-dropdown"
              >
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/about"
                  :class="{ active: $route.name === 'About' }"
                  data-cy="item-about"
                >
                  About
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/sources"
                  :class="{ active: $route.name === 'Sources' }"
                  data-cy="item-data-sources"
                >
                  Data sources
                </router-link>
                <a
                  class="nav-link"
                  href="https://blog.outbreak.info"
                  data-cy="item-blog"
                >
                  Blog
                </a>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/faq"
                  :class="{ active: $route.name === 'Faq' }"
                  data-cy="item-faq"
                >
                  FAQ
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  to="/latest"
                  :class="{ active: $route.name === 'Latest' }"
                  data-cy="item-latest-changes"
                >
                  Latest changes
                </router-link>
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Citation' }"
                  :to="{ name: 'Citation' }"
                  data-cy="item-cite"
                >
                  How to cite
                </router-link>
                <!-- <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Videos' }" :to="{name: 'Videos'}">Video demos</router-link> -->
                <router-link
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                  class="nav-link"
                  :class="{ active: $route.name === 'Press' }"
                  :to="{ name: 'Press' }"
                  data-cy="item-media"
                >
                  In the media
                </router-link>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <!-- NOTICES -->
    <section
      id="notices"
      class="bg-highlight py-2 px-3 text-light text-center fa-sm"
      data-cy="notice-section"
    >
      <b class="mr-1" data-cy="notice-text">
        The outbreak.info
        <a
          href="https://api.outbreak.info/"
          class="text-light"
          target="_blank"
          data-cy="outbreak-api"
        >
          API
        </a>

        &amp;
        <a
          href="https://outbreak-info.github.io/R-outbreak-info/"
          class="text-light"
          target="_blank"
          aria-label="outbreak-info-github"
          data-cy="r-package"
        >
          R package
        </a>
        is now live!
      </b>

      Access all SARS-CoV-2 variant data, Research Library metadata, and cases
      &amp; deaths data from outbreak.info.
      <a
        href="https://www.scripps.edu/news-and-events/press-room/2022/20220606-hughes-gisaid.html"
        target="_blank"
        class="mx-3 text-light"
        aria-label="scripps edu"
      >
        Learn more
      </a>
    </section>

    <transition name="fade">
      <router-view class="main" />
    </transition>

    <!-- FOOTER -->
    <footer v-if="!$route.meta.hideNavigation" id="outbreak-footer">
      <!-- sitemap -->
      <div
        id="footer-sitemap"
        class="bg-main__darker w-100 d-flex justify-content-between text-left text-muted row border-bottom navbar-dark m-0 px-3 pb-3 pt-4"
        data-cy="footer"
      >
        <!-- epi group -->
        <div
          class="text-light px-4 footer-section"
          data-cy="footer-section-epi"
        >
          <div class="navbar-footer-title" data-cy="epi-title">
            COVID-19 Cases &amp; Deaths
          </div>
          <ul class="navbar-nav navbar-footer" data-cy="footer-nav-epi">
            <li class="nav-item px-0 py-1" data-cy="epi-group-epidemiology">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :class="{ active: $route.name === 'Epidemiology' }"
                :to="{
                  name: 'Epidemiology',
                }"
                data-cy="footer-item-epidemiology"
              >
                Compare locations over time
              </router-link>
            </li>
            <li class="nav-item px-0 py-1" data-cy="epi-group-maps">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :class="{ active: $route.name === 'Maps' }"
                :to="{
                  name: 'Maps',
                }"
                data-cy="footer-item-maps"
              >
                Explore interactive maps
              </router-link>
            </li>
            <li class="nav-item px-0 py-1" data-cy="epi-group-compare">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :class="{ active: $route.name === 'Compare' }"
                :to="{
                  name: 'Compare',
                }"
                data-cy="footer-item-compare"
              >
                Find similar locations
              </router-link>
            </li>
            <li class="nav-item px-0 py-1" data-cy="epi-group-regions">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :class="{ active: $route.name === 'Regions' }"
                :to="{
                  name: 'Regions',
                }"
                data-cy="footer-item-regions"
              >
                Explore regions
              </router-link>
            </li>
            <li class="nav-item px-0 py-1" data-cy="epi-group-datatable">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/data"
                :class="{ active: $route.name === 'Data' }"
                data-cy="footer-item-datatable"
              >
                Access data tables
              </router-link>
            </li>
          </ul>
        </div>

        <!-- genomics group -->
        <div
          class="text-light px-4 footer-section"
          data-cy="footer-section-genomics"
        >
          <div class="navbar-footer-title" data-cy="genomics-title">
            Variants
          </div>
          <ul class="navbar-nav navbar-footer" data-cy="footer-nav-genomics">
            <li
              class="nav-item px-0 py-1"
              data-cy="genomics-group-situation-reports"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :to="{ name: 'SituationReports' }"
                :class="{ active: $route.name === 'SituationReports' }"
                data-cy="footer-item-situation-reports"
              >
                Lineage | Mutation Tracker
              </router-link>
            </li>
            <li
              class="nav-item px-0 py-1"
              data-cy="genomics-group-location-reports"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :to="{ name: 'LocationReports' }"
                :class="{ active: $route.name === 'LocationReports' }"
                data-cy="footer-item-location-reports"
              >
                Location Tracker
              </router-link>
            </li>
            <li
              class="nav-item px-0 py-1"
              data-cy="genomics-group-lineage-compare"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :to="{ name: 'SituationReportComparison' }"
                :class="{ active: $route.name === 'SituationReportComparison' }"
                data-cy="footer-item-lineage-comparison"
              >
                Lineage Comparison
              </router-link>
            </li>
            <li
              class="nav-item px-0 py-1"
              data-cy="genomics-group-interpreting-reports"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :to="{ name: 'SituationReportCaveats' }"
                :class="{ active: $route.name === 'SituationReportCaveats' }"
                data-cy="foot-item-interpreting-reports"
              >
                Interpreting Reports
              </router-link>
            </li>
          </ul>
        </div>

        <!-- resources group -->
        <div
          class="text-light px-4 footer-section"
          data-cy="footer-section-resources"
        >
          <div class="navbar-footer-title" data-cy="resources-title">
            Research Library
          </div>
          <ul class="navbar-nav navbar-footer" data-cy="footer-nav-resources">
            <li
              class="nav-item px-0 py-1"
              data-cy="resources-group-find-research"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/resources"
                :class="{ active: $route.name === 'Resources' }"
                data-cy="footer-item-find-research"
              >
                Find research
              </router-link>
            </li>
            <li
              class="nav-item px-0 py-1"
              data-cy="resources-group-download-metadata"
            >
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                :to="{ name: 'Sources', hash: '#resources' }"
                :class="{ active: $route.name === 'Sources' }"
                data-cy="footer-item-download-metadata"
              >
                Download metadata
              </router-link>
            </li>
            <li class="nav-item px-0 py-1" data-cy="resources-group-schema">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/schema"
                :class="{ active: $route.name === 'Schema' }"
                data-cy="footer-item-schema"
              >
                View &amp; adapt schema
              </router-link>
            </li>
          </ul>
        </div>

        <!-- about group -->
        <div
          class="text-light px-4 footer-section"
          data-cy="footer-section-about"
        >
          <div class="navbar-footer-title" data-cy="about-title">About</div>
          <ul class="navbar-nav navbar-footer" data-cy="footer-nav-about">
            <li class="nav-item px-0 py-1" data-cy="about-group-about-us">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/about"
                :class="{ active: $route.name === 'About' }"
                data-cy="footer-item-about-us"
              >
                About us
              </router-link>
            </li>

            <li class="nav-item px-0 py-1" data-cy="about-group-data-sources">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/sources"
                :class="{ active: $route.name === 'Sources' }"
                data-cy="footer-item-data-sources"
              >
                Data sources
              </router-link>
            </li>

            <li class="nav-item px-0 py-1" data-cy="about-group-blog">
              <a
                class="nav-link p-0"
                href="https://blog.outbreak.info"
                data-cy="footer-item-blog"
              >
                Blog
              </a>
            </li>

            <li class="nav-item px-0 py-1" data-cy="about-group-faq">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/faq"
                :class="{ active: $route.name === 'FAQ' }"
                data-cy="footer-item-faq"
              >
                FAQ
              </router-link>
            </li>

            <li class="nav-item px-0 py-1" data-cy="about-group-latest-changes">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link p-0"
                to="/latest"
                :class="{ active: $route.name === 'Latest' }"
                data-cy="footer-item-latest-changes"
              >
                Latest changes
              </router-link>
            </li>

            <li class="nav-item px-0 py-1" data-cy="about-group-cite">
              <router-link
                class="nav-link p-0"
                :to="{ name: 'Citation' }"
                data-cy="footer-item-cite"
              >
                How to cite
              </router-link>
            </li>

            <!-- <li class="nav-item px-0 py-1">
            <router-link class="nav-link p-0" :to="{ name: 'Videos' }">Video demos</router-link>
          </li> -->

            <li class="nav-item px-0 py-1" data-cy="about-group-media">
              <router-link
                class="nav-link p-0"
                :to="{ name: 'Press' }"
                data-cy="footer-item-media"
              >
                In the media
              </router-link>
            </li>
          </ul>
        </div>

        <!-- contact us group -->
        <div
          class="text-light px-4 footer-section"
          data-cy="footer-section-contact-us"
        >
          <div class="navbar-footer-title" data-cy="contact-us-title">
            Contact us
          </div>
          <ul class="navbar-nav navbar-footer" data-cy="footer-nav-contact-us">
            <li class="nav-item px-0 py-1" data-cy="contact-us-help">
              <a
                href="mailto:help@outbreak.info"
                target="_blank"
                class="nav-link p-0"
                data-cy="item-help-link"
              >
                help@outbreak.info
              </a>
            </li>

            <li class="nav-item px-0 py-1" data-cy="contact-us-submit-issue">
              <a
                class="nav-link p-0"
                href="https://github.com/outbreak-info/outbreak.info/issues"
                rel="noreferrer"
                target="_blank"
                data-cy="item-submit-issue-github"
              >
                Submit an issue on Github
              </a>
            </li>
            <EmailSubscription :isFooter="true" />
          </ul>
        </div>
      </div>

      <!-- LOGO FOOTER -->
      <Logos />

      <div
        id="terms"
        class="row m-0 d-flex justify-content-center align-items-center py-1"
        data-cy="footer-section-bottom"
      >
        <div class="d-flex text-light x-small" data-cy="bottom-wrapper">
          <ul class="m-0" data-cy="footer-nav-terms">
            <li class="d-inline m-3" data-cy="bottom-cite">
              <router-link
                class="text-light"
                :to="{ name: 'Citation' }"
                data-cy="bottom-item-cite"
              >
                How to Cite
              </router-link>
            </li>
            <li class="d-inline m-3" data-cy="bottom-github">
              <a
                href="https://github.com/outbreak-info"
                target="_blank"
                class="text-light"
                data-cy="bottom-item-github"
              >
                GitHub

                <font-awesome-icon :icon="['fab', 'github']" class="mx-1" />
              </a>
            </li>
            <li class="d-inline m-3" data-cy="bottom-privacy">
              <router-link
                class="text-light"
                to="/privacy"
                data-cy="bottom-item-privacy"
              >
                Privacy Policy
              </router-link>
            </li>
            <li class="d-inline m-3" data-cy="bottom-terms">
              <router-link
                class="text-light"
                to="/terms"
                data-cy="bottom-item-terms"
              >
                Terms
              </router-link>
            </li>
            <li class="d-inline m-3" data-cy="bottom-copyright">
              All content copyright
              <a
                href="https://scripps.edu/faculty/hughes"
                target="_blank"
                rel="noreferrer"
                class="mx-1 white-underline"
                data-cy="bottom-item-hughes"
              >
                Hughes lab
              </a>
              &copy;
              <span v-text="year" />
            </li>
            <li class="d-inline m-3" data-cy="bottom-reserved">
              All rights reserved
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { lazyLoad } from '@/js/lazy-load';
import Logos from '@/components/Logos';

export default {
  name: 'App',
  components: {
    EmailSubscription: lazyLoad('EmailSubscription'),
    Logos,
  },
  data() {
    return {
      year: '',
    };
  },
  mounted() {
    const self = this;
    const currentTime = new Date();
    self.year = currentTime.getFullYear();
  },
};
</script>

<style lang="scss">
@import './styles/global.scss';

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
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>
