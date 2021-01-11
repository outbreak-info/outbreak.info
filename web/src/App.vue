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
                  }">Find similar locations</router-link>

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
              <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/sources" :class="{ active: $route.name == 'Sources' }">Data sources
              </router-link>
              <a class="nav-link" href="https://outbreak.info/blog">Blog</a>
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
  <footer id="outbreak-footer" class="bg-main__darker pt-4">
    <div class="d-flex justify-content-between text-left text-muted row border-bottom navbar-dark px-3 pb-3" id="footer-links">
      <div class="text-light px-4">
        <div>
          Epidemiology
        </div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Epidemiology' }" :key="$route.fullPath" :to="{
                  name: 'Epidemiology'}">
              Compare locations over time
            </router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Maps' }" :key="$route.fullPath" :to="{
                  name: 'Maps'
                }">Explore interactive maps</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Compare' }" :key="$route.fullPath" :to="{
                  name: 'Compare'
                }">Find similar locations</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Regions' }" :key="$route.fullPath" :to="{
                  name: 'Regions'
                }">Explore regions</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Doubling Rates' }" :key="$route.fullPath" :to="{
                  name: 'Doubling Rates',
                  query: { location: 'USA', variable: 'confirmed' }
                }">View doubling rates</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/data" :class="{ active: $route.name == 'Data' }">Access data tables
            </router-link>
          </li>
        </ul>
      </div>

      <div class="text-light px-4">
        <div>
          Resources
        </div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-item">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Epidemiology' }" :key="$route.fullPath" :to="{
                  name: 'Epidemiology'}">
              Compare locations over time
            </router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Maps' }" :key="$route.fullPath" :to="{
                  name: 'Maps'
                }">Explore interactive maps</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Compare' }" :key="$route.fullPath" :to="{
                  name: 'Compare'
                }">Find similar locations</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Regions' }" :key="$route.fullPath" :to="{
                  name: 'Regions'
                }">Explore regions</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" :class="{ active: $route.name == 'Doubling Rates' }" :key="$route.fullPath" :to="{
                  name: 'Doubling Rates',
                  query: { location: 'USA', variable: 'confirmed' }
                }">View doubling rates</router-link>
          </li>
          <li class="nav-item p-0">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/data" :class="{ active: $route.name == 'Data' }">Access data tables
            </router-link>
          </li>
        </ul>
      </div>

      <div class="text-light px-4">
        <div>
          About
        </div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-link">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/about" :class="{ active: $route.name == 'About' }">About us</router-link>
          </li>

          <li class="nav-link">
            <router-link data-toggle="collapse" data-target=".navbar-collapse" class="nav-link" to="/sources" :class="{ active: $route.name == 'Sources' }">Data sources
            </router-link>
          </li>

          <li class="nav-link">
            <a class="nav-link" href="https://outbreak.info/blog">Blog</a>
          </li>

          <li class="nav-link">
            <router-link class="nav-link" :to="{name: 'Citation'}">How to cite</router-link>
          </li>

          <li class="nav-link">
            <router-link class="nav-link" :to="{name: 'Videos'}">Video demos</router-link>
          </li>
        </ul>
      </div>

      <div class="text-light px-4">
        <div>
          Contact us
        </div>
        <ul class="navbar-nav navbar-footer">
          <li class="nav-link">
            <a href="mailto:help@outbreak.info" target="_blank" class="nav-link">
              help@outbreak.info
            </a>
          </li>

          <li class="nav-link">
            <a class="nav-link" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
          </li>
        </ul>
      </div>





    </div>
    <Logos class="bg-grey" />
  </footer>
</div>
</template>

<script>
import Logos from "@/components/Logos.vue";

export default {
  name: "App",
  components: {
    Logos
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

.navbar-footer {
    font-size: small;
}
</style>
