<template>
<div id="app">
  <header id="outbreak-header">
    <nav class="navbar navbar-expand-lg navbar-dark w-100 bg-grey__lighter nav-hero">
      <router-link to="/" class="navbar-brand no-underline">
        <img src="@/assets/icon-01.svg" width="30" height="30" class="d-inline-block align-top" alt="Outbreak.info" />
        outbreak.info
      </router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav" v-if="!$route.meta.hideNavigation">
        <ul class="navbar-nav nav-link">
          <!-- EPIDEMIOLOGY -->
          <li class="dropdown nav-link">
            <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Epidemiology
            </div>
            <div class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton">
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Epidemiology' }" :key="$route.fullPath" :to="{
                    name: 'Epidemiology'}">
                Compare locations over time
              </router-link>
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Maps' }" :key="$route.fullPath" :to="{
                    name: 'Maps'
                  }">Explore interactive maps</router-link>

              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Compare' }" :key="$route.fullPath" :to="{
                    name: 'Compare'
                  }">Find similar Locations</router-link>

              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Regions' }" :key="$route.fullPath" :to="{
                    name: 'Regions'
                  }">Explore regions</router-link>

              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Doubling Rates' }" :key="$route.fullPath" :to="{
                    name: 'Doubling Rates',
                    query: { location: 'USA', variable: 'confirmed' }
                  }">View doubling rates</router-link>

              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/data" :class="{ active: $route.name == 'Data' }">Access data tables
              </router-link>
            </div>
          </li>

          <!-- RESOURCES -->
          <li>
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/resources" :class="{ active: $route.name == 'Resources' }">Resources
            </router-link>
          </li>

          <!-- API -->
          <li class="nav-item">
            <a class="nav-link" href="https://api.outbreak.info/">API</a>
          </li>

          <!-- ABOUT -->
          <li class="dropdown nav-link">
            <div class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              About
            </div>
            <div class="dropdown-menu dropdown-menu-dark p-1" aria-labelledby="dropdownMenuButton">
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/about" :class="{ active: $route.name == 'About' }">About</router-link>
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/sources" :class="{ active: $route.name == 'Sources' }">Sources
              </router-link>
              <a class="nav-link" href="https://outbreak.info/blog">News</a>
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
  <footer id="outbreak-footer" class="bg-main__darker py-4">
    <div class="text-center text-muted">
      <ul>
        <li class="d-inline m-2">
          <a href="mailto:help@outbreak.info" target="_blank" class="text-light">
            Contact Us
          </a>
        </li>
        <li class="d-inline m-2">
          <router-link class="text-light" :to="{name: 'Sources'}">Data Sources</router-link>
        </li>
        <li class="d-inline m-2">
          <router-link class="text-light" :to="{name: 'Citation'}">How to Cite</router-link>
        </li>
        <li class="d-inline m-2">
          <router-link class="text-light" to="/privacy">Privacy Policy</router-link>
        </li>
        <li class="d-inline m-2">
          <router-link class="text-light" to="/terms">Terms</router-link>
        </li>
      </ul>
      <small>
        All content copyright
        <a href="http://sulab.org/" target="_blank" rel="noreferrer">
          SuLab</a>
        © <span v-text="year"></span> <br />
        All rights reserved.
      </small>
    </div>
  </footer>
</div>
</template>

<script>
export default {
  name: "App",
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

<style lang="scss" scoped>
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

.dropdown-menu-dark {
    background: $primary-color;
}

.dropdown-menu {
    line-height: 1.2em;
}
</style>
