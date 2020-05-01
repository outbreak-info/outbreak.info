<template>
<div class="d-flex flex-column">
  <small class="m-0" v-for="(country, idx) in countries" :key="idx">
    {{country}}
  </small>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg">
    <g ref="countries" class="country-group"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

import geodata from "@/assets/geo/countries.json";
import * as d3 from "d3";
import {
  geoInterruptedHomolosine,
  geoInterruptedBoggs
} from "d3-geo-projection";

export default Vue.extend({
  name: "CountryMap",
  props: {
    countries: Array,
    fill: {
      type: String,
      default: "#df4ab7"
    }
  },
  components: {},
  computed: {},
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
      regions: null,
      width: 200,
      height: null
    }
  },
  mounted() {
    console.log(geodata)
    this.setupChoro();
    this.drawMetro();
  },
  methods: {
    setupChoro() {
      this.svg = d3.select(this.$refs.svg);
      this.regions = d3.select(this.$refs.countries);
      this.height = this.width*0.6;
    },
    drawMetro() {
      var path = d3.geoPath();
      var projection = geoInterruptedBoggs()
        .center([0, 0])
        .translate([this.width / 2, this.height / 2])
        .scale(this.width / 1.5 / Math.PI)

      // regional data
      d3.select("svg")
        .selectAll("path")
        .data(geodata.features)
        .join(
          enter => {
            enter
              .append("path")
              .attr("class", "region")
              .attr("id", d => d.location_id)
              // draw each region
              .attr("d", path
                .projection(projection)
              )
              .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill: "#dce4ec");
          },
          // update => update.attr("fill", d => d.fill ? d.fill : "none")
        )
    }
  }
})
</script>

<style lang="scss">
.region {
  // fill: mix($grey-40, $grey-30);
  // stroke-width: 0.5;
}
</style>
