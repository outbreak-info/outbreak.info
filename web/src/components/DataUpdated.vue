<template>
<small class="date-updated">updated {{ lastUpdated }} ago</small>
</template>

<script lang="ts">
import Vue from "vue";
import axios from 'axios';
import {
  isoParse
} from 'd3';

export default Vue.extend({
  name: "DataUpdated",
  props: {},
  data() {
    return {
      ghAPI: "https://api.github.com/repos/",
      filePath: "CSSEGISandData/COVID-19/commits?path=csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      dateUpdated: null,
      lastUpdated: null
    }
  },
  watch: {},
  mounted() {
    this.getDateUpdated();
  },
  methods: {
    getDateUpdated() {
      const apiUrl = `${this.ghAPI}${this.filePath}&page=1&per_page=1`;
      axios.get(apiUrl).then((response) => {
        console.log(response.data)
        this.dateUpdated = isoParse(response.data[0].commit.author.date);
        const updatedDiff = (new Date() - this.dateUpdated) / (60 * 60 * 1000);

        if (updatedDiff < 1) {
          this.lastUpdated = `${Math.round(updatedDiff*60)}m`
        } else {
          this.lastUpdated = `${Math.round(updatedDiff)}h`
        }


      })
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.date-updated {
    color: $grey-60;
}
</style>
