<template>
<div class="home">
  <!-- <EpiStacked v-bind:data="data" /> -->
  <EpiStacked v-bind:data="nested" />
  <!-- <EpiStacked v-bind:data="noChina" /> -->

</div>
</template>

<script>
import EpiStacked from "@/components/EpiStacked.vue";
import * as d3 from 'd3';

export default {
  name: "Home",
  components: {
    EpiStacked,
  },
  computed: {
    noChina() {
      return this.nest(this.data.filter(d => d.region != 'China'));
    },
    nested() {
      return this.nest(this.data);
    }
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      countries: ["Iran", "Italy", "Japan", "South Korea", "Others"],
      data: null,
      regionDict: [{
          region: "Asia (outside China)",
          countries: ["Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
            "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India"
          ]
        },
        {
          region: "China",
          countries: ["Mainland China", ]
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
          countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland", "Greece", "Georgia", "North Macedonia", "Norway",
            "Romania"
          ]
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
          countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", "Pakistan"]
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
        data.forEach(areaData => areaData.data.forEach(d => {
          d['country'] = areaData.metadata.country;
          d['province'] = areaData.metadata.province;
          d['region'] = this.getRegion(areaData.metadata.country);
        }))

        this.data = data.flatMap(d => d.data).filter(d => d.region != "China");

      });
    },
    nest: function(data) {
      if (data) {
        // nest by date
        const regionNest = d3.nest()
          .key(d => d.date)
          .key(d => d.region)
          .rollup(values => d3.sum(values, d => d.cases))
          .entries(data);

        const nested = regionNest.map(d => {
          const obj = {};
          obj['date'] = d3.isoParse(d.key);

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
