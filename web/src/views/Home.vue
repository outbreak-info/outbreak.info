<template>
<div class="home flex-column align-left">
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
  <section class="flex-column align-left" id="regional-epi-curves">
    <div class="region-tooltip-plots" v-for="(region, idx) in regionDict" :key="idx">
      <CountryBarGraph :region="region.region" :id="idx" :style="{visibility: region.display ? 'visible' : 'hidden', left: region.x + 'px', top: region.y + 'px'}" class="tooltip-countries" />
    </div>
    <h3 class="plot-title">Cumulative number of COVID-19 cases by region</h3>
    <DataUpdated />
    <div class="flex">
      <EpiStacked v-bind:data="nested" v-bind:id="'all-data'" @regionSelected="handleTooltip" />
      <EpiStacked v-bind:data="noChina" v-bind:id="'no-china'" @regionSelected="handleTooltip" />
    </div>

    <DataSource />
  </section>
</div>
</template>

<script>
import EpiStacked from "@/components/EpiStacked.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";
import CountryBarGraph from "@/components/CountryBarGraph.vue";
import {
  csv,
  nest,
  timeParse,
  sum,
  isoParse
} from 'd3';
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
      if (this.data) {
        return this.nest(this.data.filter(d => d.region != 'China'));
      } else {
        return (null)
      }
    },
    nested() {
      return this.nest(this.data);
    },
    regionDict() {
      const regions = store.state.regionDict;

      // regions.forEach(d => {
      //   d['display'] = true;
      // })
      return regions;
    }
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",

      data: null
    }
  },
  methods: {
    handleTooltip(selected) {
      store.commit('setRegionTooltip', selected)
    },
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
