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
    color: $base-grey;
    font-weight: 300;
}

#app text {
    font-family: $font-family;
    font-weight: 400;
}

.axis--x text,
.axis--y text,
.default-black {
    fill: $base-grey;
}

#outbreak-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

// buttons
button {
    line-height: 1.5em;
    font-size: 1em;
    fill: white;
    font-family: $font-family;
    margin-right: 0.25em;
    margin-left: 0.25em;
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
    background-color: $grey-90;
    color: white;
    & .remove-btn {
        color: $warning-color;
    }
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

// layout
.flex {
    display: flex;
    flex-wrap: wrap;
}

.flex-column {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.align-left {
    align-items: flex-start;
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
</style>
