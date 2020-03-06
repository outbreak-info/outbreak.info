<template>
<div id="app">
  <!-- TEMP: BASIC HEADER -->
  <header id="outbreak-header">
    <router-link to="/" class="no-underline">outbreak.info</router-link>
    <nav id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/epidemiology">Epidemiology</router-link>
    </nav>
  </header>

  <router-view class="px-3" />

  <!-- TEMP: BASIC FOOTER -->
  <footer id="outbreak-footer">
    <div class="flex flex-space-between px-3 py-3">
      <div>
        &copy; 2020 <a href="http://sulab.org/" rel="noreferrer" target="_blank"> The Su Lab</a>
      </div>
      <a href="mailto:blog@sulab.org">blog@sulab.org</a>
    </div>

  </footer>
</div>
</template>

<style lang="scss">
// --- fonts, default colors ---
#app {
    font-family: $font-family;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: $base-grey;
}

#app text {
    font-family: $font-family;
}

.axis--x text,
.axis--y text,
.default-black {
    fill: $base-grey;
}

// --- buttons ---
button {
    line-height: 1.5em;
    font-size: 1em;
    fill: white;
    font-family: $font-family;
    margin-right: 0.25em;
    margin-left: 0.25em;
    margin-bottom: 0.25em;
    border-color: $grey-40;
    &:focus {
        outline: none !important;
    }
    &.chip {
        border-radius: 1em;
        display: flex;
        align-items: center;
        padding: 2px 8px;
        cursor: pointer;
        & .remove-btn {
            margin-left: 0.25em;
        }
    }
}

.all-selected,
button.chip:hover {
    background: $grey-80 !important;
    color: white;
    & .remove-btn {
        color: $warning-color !important;
    }
}

// --- layout ---
.flex {
    display: flex;
    flex-wrap: wrap;
}

.flex-column {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.flex-space-between {
    justify-content: space-between;
}

.align-left {
    align-items: flex-start;
    text-align: left;
}

// d3-constants
.plot-title {
    margin: 0 !important;
}

// padding
.py-3 {
    padding-top: 1rem;
    padding-bottom: 1rem;
}
.px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
.px-3 {
    padding-left: 1rem;
    padding-right: 1rem;
}

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
    position: absolute;
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
