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
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                :key="$route.fullPath"
                :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }"
                >Epidemiology</router-link
              >
            </li>
          </ul>
        </div>
        <!-- <form class="pull-right d-none d-md-block">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-sec border-0" id="basic-addon1"><i class="fas fa-search"></i></span>
            </div>
            <input type="text" class="form-control border-0 bg-grey text-light" placeholder="Search" aria-label="Username" aria-describedby="basic-addon1">
          </div>
        </form> -->
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
