<template>
<div>
  <h1>variable: {{variable}}</h1>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg">
    <g ref="regions" class="region-group"></g>
    <g ref="states" class="state-group"></g>
  </svg>
  <HistogramLegend :data="data" :variable="variable" :colorScale="colorScale" />
</div>
</template>

<script>
import geodata from "@/assets/geo/US_metro.json";
import usstates from "@/assets/geo/US_states.json";
import * as d3 from "d3";

import HistogramLegend from "@/components/HistogramLegend.vue"

export default {
  name: "Choropleth",
  components: {
    HistogramLegend
  },
  props: {
    data: Array,
    variable: String,
    colorScale: Function,
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 350
    }
  },
  watch: {
    data: function() {
      this.drawMetro();
    }
  },
  data() {
    return {
      margin: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 25
      },
      // refs
      svg: null,
      states: null,
      regions: null
    };
  },
  computed: {},
  mounted() {
    console.log(geodata)
    console.log(this.data)
    this.setupChoro();
    this.drawMetro();
  },
  methods: {
    setupChoro() {
      this.svg = d3.select(this.$refs.svg);
      this.states = d3.select(this.$refs.states);
      this.regions = d3.select(this.$refs.regions);
    },
    drawMetro() {
      if (this.data) {

        this.data.forEach(d => {
          const id = d.location_id.replace("METRO_", "");
          const idx = geodata.features.findIndex(polygon => polygon.properties.GEOID === id);
          if (idx > -1) {
            geodata.features[idx]["fill"] = d.fill;

          }
        })


        var path = d3.geoPath();
        var projection = d3.geoAlbersUsa()
          .scale(700)
          .translate([this.width / 2 + 10, this.height / 2]);

        this.regions
          .selectAll("path")
          .data(geodata.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "region")
                // draw each region
                .attr("d", path
                  .projection(projection)
                )
                .attr("fill", d => d.fill ? d.fill : "none");
            },
            update => update.attr("fill", d => d.fill ? d.fill : "none")
          )

        this.states
          .selectAll("path")
          .data(usstates.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "state")
                // draw each region
                .attr("d", path
                  .projection(projection)
                )
            }
          )
      }
    }

  }
};
</script>

<style lang="scss">
// svg {
//     background: aliceblue;
// }

.region {
    stroke: $grey-60;
    stroke-width: 0.5;
}

.region:hover {
    stroke: $base-grey;
    stroke-width: 1.5;
}

.state {
    fill: none;
    stroke: $grey-90;
    stroke-width: 0.5;
}
</style>
