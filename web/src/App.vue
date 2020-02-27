<template>
<div id="app">
  <header id="outbreak-header">
    outbreak.info
    <nav id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/epidemiology">Epidemiology</router-link>
    </nav>
  </header>


  <router-view />
</div>
</template>

<style lang="scss">
#app {
    font-family: $font-family;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: $standard-text;
}

#app text {
    font-family: $font-family;
    fill: $standard-text;
}

#outbreak-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
</style>
