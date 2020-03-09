<template>
<p class="case-summary">
  {{currentDate ? `As of ${currentDate}` : "Currently"}},
  there are <span class="bold-accent">{{ currentTotalCases.toLocaleString() }}</span> confirmed COVID-19 cases
  in <span class="bold-accent">{{ numCountries }} countries</span> worldwide,
  with the most heavily hit areas including
  <span v-for="(country, idx) in mostCases" :key="idx">
    <router-link :to="{ name: 'Epidemiology', query: {location: country.locationName} }" class="hardest-hit">{{ country.locationName }}</router-link>
    <span v-if="idx < mostCases.length - 1">{{idx === mostCases.length - 2 ? ", and " : ", "}}</span>
  </span>.
  In the last day, <span v-if="firstCases.length > 0">
    <router-link :to="{ name: 'Epidemiology', query: { location: newCountries } }" class="accent new-cases">{{ firstCases.length }} countries</router-link>
      have announced their <span class="accent">first cases</span>, and </span>
  <router-link :to="{ name: 'Epidemiology', query: { location: changingCountries } }" class="accent rapidly-growing">{{countriesAboveThresholdCount}} countries</router-link> have reported more than <span class="accent">{{caseThreshold}} new cases</span>.
  <router-link :to="{ name: 'Epidemiology', query: { location: mostCasesNames } }">Explore how case counts are changing in regions, countries, and subnational locations</router-link>
</p>
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapState
} from 'vuex';

import {
  timeFormat
} from "d3";

export default Vue.extend({
  name: "CaseSumamry",
  props: {},
  data() {
    return {}
  },
  watch: {},
  computed: {
    ...mapState('epidata', ['mostRecentDate', 'currentTotalCases', 'firstCases', 'mostCases', 'numCountries', 'caseThreshold', 'countriesAboveThreshold']),
    currentDate() {
      const formatDate = timeFormat("%e %B %Y");
      let lastUpdated = null;
      if (this.mostRecentDate) {
        lastUpdated = formatDate(this.mostRecentDate);
      }
      return (lastUpdated);
    },
    countriesAboveThresholdCount() {
      return(this.countriesAboveThreshold.length)
    },
    changingCountries() {
      return(this.countriesAboveThreshold.map(d => d.locationName).join(";"))
    },
    newCountries() {
      return(this.firstCases.map(d => d.locationName).join(";"))
    },
    mostCasesNames: function() {
      return(this.mostCases.map(d => d.locationName).join(";"))
    }
  },
  methods: {}
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.bold-accent {
    color: $primary-color;
    font-weight: 700;
}

.accent {
    color: $primary-color;
}

.hardest-hit, .rapidly-growing, .new-cases {
    color: $primary-color;
    border-bottom: $primary-color 1px dotted;
    text-decoration: none;
}
</style>
