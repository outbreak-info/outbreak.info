<template>
  <div id="app">
    <!-- TEMP: BASIC HEADER -->
    <header id="outbreak-header">
      <router-link to="/" class="no-underline">outbreak.info</router-link>
      <nav id="nav">
        <router-link to="/">Home</router-link> |
        <router-link
          :key="$route.fullPath"
          :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }"
          >Epidemiology</router-link
        >
        |
        <!-- <router-link to="/timelapse">Timelapse</router-link> | -->
        <router-link to="/about">About</router-link>
      </nav>
    </header>

    <router-view class="px-3" />

    <!-- TEMP: BASIC FOOTER -->
    <footer id="outbreak-footer">
      <div class="flex flex-space-between px-3 py-3">
        <div>
          &copy; 2020
          <a href="http://sulab.org/" rel="noreferrer" target="_blank">
            The Su Lab</a
          >
        </div>
        <a href="mailto:blog@sulab.org">blog@sulab.org</a>
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
    return {};
  },
  computed: {
    ...mapState("epidata", ["mostCases"]),
    mostCasesNames: function() {
      return this.mostCases.map(d => d.locationName).join(";");
    }
  },
  methods: {},
  mounted() {
    store.dispatch("epidata/loadCases");
    store.dispatch("epidata/getDateUpdated");
  }
};
</script>

<style lang="scss">
// @Marco delete all below!
#outbreak-header {
  background: $grey-30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

#outbreak-footer {
  margin-top: 0.5rem;
  background: $grey-30;
  position: fixed;
  bottom: 0;
  width: 100%;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: $primary-color;
    }
  }
}

.no-underline {
  text-decoration: none;
}
</style>
