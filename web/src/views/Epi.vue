<template>
<div class="home">
  <div v-for="group, idx in data" v-bind:key="idx">
  <EpiCurve v-bind:country="group.metadata.country" v-bind:data="group.data" />
</div>
</div>
</template>

<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";

import * as d3 from 'd3';

export default {
  name: "Epidemiology",
  components: {
    EpiCurve
  },
  data() {
    return {
      mymsg: "",
      countries: ["Iran"],
      data: null
    }
  },
  methods: {
    getData: function() {
      console.log("grabbing the data")
      d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv").then(data => {
        const parseDate = d3.timeParse("%m/%d/%y");
        console.log(data)


        data.forEach(d => {
          const metadata = {
            'province': d['Province/State'],
            'country': d['Country/Region'],
            lat: d["Lat"],
            lon: d["Long"]
          };
          delete d['Province/State'];
          delete d['Country/Region'];
          delete d['Lat'];
          delete d['Long'];
          const keys = Object.keys(d);

          d['data'] = keys.map(timepoint => {
            return ({
              "date_string": timepoint,
              "date": parseDate(timepoint),
              "cases": +d[timepoint]
            })
          })
          d['metadata'] = metadata;
        });

        this.data = data.filter(d => this.countries.includes(d.metadata.country))
          .map(d => {
            return ({
              data: d['data'],
              metadata: d['metadata']
            })
          });

        console.log(this.data);
      });
    }
  },
  mounted() {
    console.log("hi epi!")
    this.getData();
  }
};
</script>
