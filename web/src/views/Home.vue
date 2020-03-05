<template>
<div class="home flex-column align-left">
  <CountryBarGraph :region="'Australia/Oceania'" />
  <h3 class="plot-title">Cumulative number of COVID-19 cases by region</h3>
  <DataUpdated />
  <div class="flex">
    <EpiStacked v-bind:data="nested" v-bind:id="'all-data'" />
    <EpiStacked v-bind:data="noChina" v-bind:id="'no-china'"  />
  </div>

  <DataSource />
</div>
</template>

<script>
import EpiStacked from "@/components/EpiStacked.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";
import CountryBarGraph from "@/components/CountryBarGraph.vue";
import { csv, nest, timeParse, sum, isoParse } from 'd3';
import store from "@/store";

export default {
  name: "Home",
  components: {
    EpiStacked,
    DataUpdated,
    DataSource,
    CountryBarGraph
  },
  computed: {
    noChina() {
      if(this.data) {
        return this.nest(this.data.filter(d => d.region != 'China'));
      } else {
        return (null)
      }
    },
    nested() {
      return this.nest(this.data);
    },
    regionDict() {
      return store.state.regionDict;
    }
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",

      data: null
    }
  },
  methods: {
    getRegion: function(country) {
      const region = this.regionDict.filter(d => d.countries.includes(country));

      if (region.length === 1) {
        return (region[0].region)
      }
    },
    getData: function() {
      csv(this.dataUrl).then(data => {
        const parseDate = timeParse("%m/%d/%y");
        const parseD3Date = timeParse();
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

          d['data'].sort((a, b) => a.date - b.date);

          d['metadata'] = metadata;
          d['metadata']['currentCases'] = d.data.slice(-1)[0].cases;
        });


        // pull out the relevant variables
        data.forEach(areaData => areaData.data.forEach(d => {
          d['country'] = areaData.metadata.country;
          d['province'] = areaData.metadata.province;
          d['region'] = this.getRegion(areaData.metadata.country);
        }))

        this.data = data.flatMap(d => d.data);

      });
    },
    nest: function(data) {
      if (data) {
        // nest by date
        const regionNest = nest()
          .key(d => d.date)
          .key(d => d.region)
          .rollup(values => sum(values, d => d.cases))
          .entries(data);

        const nested = regionNest.map(d => {
          const obj = {};
          obj['date'] = isoParse(d.key);

          d.values.forEach(value => {
            obj[value.key] = value.value;
          })

          return (obj)
        })
        return (nested);
      }

    }
  },
  mounted() {
    this.getData();
  }
};
</script>
