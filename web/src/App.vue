<template>
  <div id="app">
    <header id="outbreak-header">
      <nav class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero">
        <router-link to="/" class="navbar-brand no-underline">
          <img src="@/assets/icon-01.svg" width="30" height="30" class="d-inline-block align-top" alt="Outbreak.info">
          outbreak.info
        </router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item active">
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/" :class='{"active":$route.name == "Home"}'>Home </router-link>
            </li>
            <li class="nav-item">
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/about" :class='{"active":$route.name == "About"}'>About</router-link>
            </li>
            <li class="nav-item">
              <router-link
                data-toggle="collapse" data-target=".navbar-collapse"
                class="nav-link" :class='{"active":$route.name == "Epidemiology"}'
                :key="$route.fullPath"
                :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }"
                >Epidemiology</router-link
              >
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <transition name="fade">
      <router-view class="main"/>
    </transition>
    <!-- TEMP: BASIC FOOTER -->
    <footer id="outbreak-footer" class="bg-main__darker py-4">
      <div class="text-center text-muted">
        <ul>
          <li class="d-inline m-2">
            <a href="mailto:blog@sulab.org" target="_blank" class="text-light">
              Contact Us
            </a>
          </li>
        </ul>
        <small>
          All content copyright <a href="http://sulab.org/" target="_blank" rel="noreferrer"> SuLab</a> © <span v-text="year"></span> <br /> All rights reserved.
        </small>
      </div>
    </footer>
  </div>
</template>

<script>
import store from "@/store";

import { mapState } from "vuex";

export default {
  name: "App",
  data() {
    return {
      year:''
    };
  },
  computed: {
    ...mapState("epidata", ["mostCases"]),
    mostCasesNames: function() {
      return this.mostCases.map(d => d.locationName).join(";");
    }
  },
  methods: {},
  mounted() {
    var self = this;
    var currentTime = new Date()
    self.year = currentTime.getFullYear()
    store.dispatch("epidata/loadCases");
    store.dispatch("epidata/getDateUpdated");
  }
};
</script>

<style lang="scss">
.no-underline {
  text-decoration: none;
}

.warning {
  background: red;
  color: white;
  width: 100%;
  margin-bottom: 10px;

}
</style>
