<template>
<div class="home flex-column align-left">
  <div v-if=loading class="loader">
    <img src="@/assets/ripple.svg" />
  </div>

  <!-- TO BE REPLACED -->
  <section id="home-temp-header" class="flex-column align-left">
    <h1>outbreak.info</h1>
    <p>
      During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research. <b>outbreak.info</b> is a resource to aggregate all this information into a single location.
    </p>

    <p id="disclaimer">
      Disclaimer: outbreak.info is a work-in-progress. Notice a bug, know of a COVID-19 data source, or want to suggest a feature? <a href="https://github.com/SuLab/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>.
    </p>
  </section>


  <!-- EPI CURVE SUMMARIES -->
  <section class="flex-column align-left" id="regional-epi-curves" v-if="nestedData.length > 0">
    <!-- <div class="region-tooltip-plots" v-for="(region, idx) in regionDict" :key="idx">
        <CountryBarGraph :region="region.region" :id="idx" :style="{visibility: region.display ? 'visible' : 'hidden', left: region.x + 'px', top: region.y + 'px'}" class="tooltip-countries" />
      </div> -->
      <h3 class="plot-title">Cumulative number of COVID-19 cases by region</h3>
      <DataUpdated />
    <div class="flex">
      <EpiStacked v-bind:data="nestedData" v-bind:id="'all-data'" @regionSelected="handleTooltip" />
      <EpiStacked v-bind:data="noChina" v-bind:id="'no-china'" @regionSelected="handleTooltip" />
    </div>

    <DataSource />
  </section>
</div>
</template>

<script>
// @ is an alias to /src
import EpiStacked from "@/components/EpiStacked.vue";
// import CountryBarGraph from "@/components/CountryBarGraph.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";


import {
  mapState
} from 'vuex';

import {
  nestRegions
} from "@/js/importEpi";

import {
  cloneDeep
} from "lodash";

import store from "@/store";

export default {
  name: "Home",
  components: {
    EpiStacked,
    // CountryBarGraph
    DataUpdated,
    DataSource,

  },
  data() {
    return {
      // nestedData: [],
      // loading: false
    }
  },
  watch: {},
  computed: {
    ...mapState('admin', ['loading']),
    ...mapState('geo', ['regionDict']),
    ...mapState('epidata', ['cases']),
    nestedData() {
      return (nestRegions(this.cases.flatMap(d => d.data)));
    },
    noChina() {
      if (this.nestedData) {
        const data = cloneDeep(this.nestedData);
        data.forEach(d => {
          d["China"] ? delete(d["China"]) : null;
        })
        return (data)
      } else {
        return (null)
      }
    }
  },
  methods: {
    handleTooltip(selected) {
      store.commit('geo/setRegionTooltip', selected)
    }
  },
  mounted() {
    // The watching works... but doesn't stick when the route gets changed :(
    // this.$store.watch(
    //   (state, getters) => state.epidata.cases,
    //   (newValue, oldValue) => {
    //     console.log("this.changed")
    //     this.nestedData = nestRegions(newValue.flatMap(d => d.data));
    //     // console.log(this.nestedData)
    //     // return(this.nestedData)
    //   }, {deep: true}
    // )
  }
};
</script>

<style lang="scss" scoped>
.tooltip-countries {
    background: white;
    position: absolute;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.5);
    padding: 10px;
    z-index: 1000;
    pointer-events: none;
}

// @Marco delete following
h1,
p {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
    text-align: left;
}

#home-temp-header {
    margin-bottom: 0.5em;
}
</style>
