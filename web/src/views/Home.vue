<template>
<div class="home">
  <EpiStacked v-bind:data="data" />
</div>
</template>

<script>
import EpiStacked from "@/components/EpiStacked.vue";
import * as d3 from 'd3';

export default {
  name: "Home",
  components: {
    EpiStacked
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      countries: ["Iran", "Italy", "Japan", "South Korea", "Others"],
      data: null,
      regionDict: [{
          region: "Asia",
          countries: ["Mainland China", "Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
            "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India"
          ]
        },
        {
          region: "North America",
          countries: ["US", "Canada", ]
        },
        {
          region: "South America",
          countries: ["Brazil"]
        },
        {
          region: "Europe",
          countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland"]
        },
        {
          region: "Africa",
          countries: ["Algeria", ]
        },
        {
          region: "Diamond Princess Cruise",
          countries: ["Others", ]
        },
        {
          region: "Middle East",
          countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", ]
        },
        {
          region: "Australia/Oceania",
          countries: ["Australia", ]
        }
      ]

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
      d3.csv(this.dataUrl).then(data => {
        const parseDate = d3.timeParse("%m/%d/%y");
        const parseD3Date = d3.timeParse();
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
        data = data
          .map(d => {
            return ({
              data: d['data'],
              currentCases: d.data.slice(-1)[0].cases,
              country: d.metadata.country,
              province: d.metadata.province,
              region: this.getRegion(d.metadata.country)
            })
          });


        // nest one: group into regions
        const regionNest = d3.nest()
          .key(d => d.region)
          .rollup(values => values.flatMap(d => d.data))
          .entries(data);

        this.data = regionNest.map(region => {

          const nested = d3.nest()
            .key(d => d.date)
            .rollup(values => d3.sum(values, d => d.cases))
            .entries(region.value)
            .sort((a, b) => a.key - b.key);

          nested.forEach(d => d.key = d3.isoParse(d.key))

          return ({
            region: region.key,
            data: nested,
            currentCases: nested.slice(-1)[0].value
          })
        })

        // sort date data by number of current cases
        this.data.sort((a, b) => b.currentCases - a.currentCases);

        console.log(this.data);
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
