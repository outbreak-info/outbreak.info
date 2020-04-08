<template>
  <div id="app">
    <header id="outbreak-header">
      <nav
        class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero"
      >
        <router-link to="/" class="navbar-brand no-underline">
          <img
            src="@/assets/icon-01.svg"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt="Outbreak.info"
          />
          outbreak.info
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav" v-if="!$route.meta.hideNavigation">
          <ul class="navbar-nav">

            <li class="nav-item">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link"
                :class="{ active: $route.name == 'Epidemiology' }"
                :key="$route.fullPath"
                :to="{
                  name: 'Epidemiology',
                  query: { location: mostCasesNames }
                }"
                >Epidemiology</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link"
                :class="{ active: $route.name == 'Doubling Rates' }"
                :key="$route.fullPath"
                :to="{
                  name: 'Doubling Rates',
                  query: { location: 'USA', variable: 'confirmed' }
                }"
                >Doubling Rates</router-link
              >
            </li>

            <li class="nav-item">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link"
                to="/data"
                :class="{ active: $route.name == 'Data' }"
                >Data
              </router-link>
            </li>

            <li class="nav-item">
              <router-link
                data-toggle="collapse"
                data-target=".navbar-collapse"
                class="nav-link"
                to="/about"
                :class="{ active: $route.name == 'About' }"
                >About</router-link
              >
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <transition name="fade">
      <router-view class="main" />
    </transition>
    <!-- FOOTER -->
    <footer id="outbreak-footer" class="bg-main__darker py-4">
      <div class="text-center text-muted">
        <ul>
          <li class="d-inline m-2">
            <a href="mailto:blog@sulab.org" target="_blank" class="text-light">
              Contact Us
            </a>
          </li>
          <li class="d-inline m-2">
            <router-link
              class="text-light"
              to="/privacy"
              >Privacy Policy</router-link
            >
          </li>
          <li class="d-inline m-2">
            <router-link
              class="text-light"
              to="/terms"
              >Terms</router-link
            >
          </li>
        </ul>
        <small>
          All content copyright
          <a href="http://sulab.org/" target="_blank" rel="noreferrer">
            SuLab</a
          >
          © <span v-text="year"></span> <br />
          All rights reserved.
        </small>
      </div>
    </footer>
  </div>
</template>

<script>
import store from "@/store";

import { mapState } from "vuex";
import { getLocations, getMostCases } from "@/api/epi-basics.js"

export default {
  name: "App",
  data() {
    return {
      year: ""
    };
  },
  computed: {
    ...mapState("epidata", ["mostCases"]),
    mostCasesNames: function() {
      return this.mostCases.map(d => d.location_id).join(";");
    }
  },
  methods: {},
  mounted() {
    var self = this;
    var currentTime = new Date();
    self.year = currentTime.getFullYear();
  },
  subscriptions() {
    return {
      placeNames$: getLocations(this.$apiurl),
      mostCases$: getMostCases(this.$apiurl)
    }
  }
};
</script>

<style lang="scss">
.no-underline {
  text-decoration: none;
}

.navbar-collapse.collapsing {
  -webkit-transition: height 0s;
  -moz-transition: height 0s;
  -ms-transition: height 0s;
  -o-transition: height 0s;
  transition: height 0s;

}
</style>
