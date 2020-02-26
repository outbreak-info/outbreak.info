<template>
  <EpiCurve v-bind:data="data" />
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
      countries: ["Iran", "Italy", "Japan", "South Korea", "Others"],
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

          keys.forEach(timepoint => delete d[timepoint]);

          d['data'].sort((a,b) => a.date - b.date);

          d['metadata'] = metadata;
          d['metadata']['currentCases'] = d.data.slice(-1)[0].cases;
        });



        this.data = data
          .filter(d => this.countries.includes(d.metadata.country))
          .map(d => {
            return ({
              data: d['data'],
              metadata: d['metadata']
            })
          });



        // const nested = d3.nest()
        //   .key(d => d.metadata.country)
        //   .rollup(values => {
        //
        //   })
        //   .entries(this.data);
        // console.log('nested')
        // console.log(nested)

        console.log(this.data);
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
