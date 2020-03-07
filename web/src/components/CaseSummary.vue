<template>
<p class="case-summary">
  {{currentDate ? `As of ${currentDate}` : "Currently"}},
  there are <span class="current-total">{{ currentTotalCases.toLocaleString() }}</span> confirmed COVID-19 cases worldwide,
  with the most heavily hit areas including
  <span v-for="(country, idx) in mostCases" :key="idx">
    <router-link :to="{ name: 'Epidemiology', query: {location: country.placeName} }" class="hardest-hit">{{ country.placeName }}</router-link>
    <span v-if="idx < mostCases.length - 1">{{idx === mostCases.length - 2 ? ", and " : ", "}}</span></span>.
  In the last day, {{ firstCases }} countries have announced their first cases,
  and Y countries have reported more than z new cases.
  <router-link to="/epidemiology">Explore how case counts are changing in regions, countries, and subnational locations</router-link>
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
    ...mapState('epidata', ['mostRecentDate', 'currentTotalCases', 'firstCases', 'mostCases']),
    currentDate() {
      const formatDate = timeFormat("%e %B %Y");
      let lastUpdated = null;
      if (this.mostRecentDate) {
        lastUpdated = formatDate(this.mostRecentDate);
      }
      return (lastUpdated);
    },
  },
  methods: {}
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.current-total {
    color: $primary-color;
    font-weight: 700;
}

.hardest-hit {
  color: $primary-color;
  border-bottom: $primary-color 1px dotted;
  text-decoration: none;
}

</style>
