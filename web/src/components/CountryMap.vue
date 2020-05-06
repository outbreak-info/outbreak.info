<template>
  <div class="d-flex flex-column">
    <svg
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
      ref="svg"
    >
      <g ref="countries" class="country-group"></g>
    </svg>
    <div class="country-container d-flex">
      <small class="m-0 mr-1" v-for="(country, idx) in countries" :key="idx">
        {{ country }}<span v-if="idx < countries.length - 1">,</span>
      </small>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import GEODATA from "@/assets/geo/countries.json";
import * as d3 from "d3";
import {
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
  computed: {},
  data() {
    return {
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      // refs
      svg: null,
      regions: null,
      width: 200,
      height: null
    }
  },
  mounted() {
    console.log(GEODATA)
    this.setupChoro();
    this.drawMetro();
  },
  methods: {
    setupChoro() {
      this.svg = d3.select(this.$refs.svg);
      this.regions = d3.select(this.$refs.countries);
      this.height = this.width * 0.5;
    },
    drawMetro() {
      var path = d3.geoPath();
      var projection = geoInterruptedBoggs()
        .center([0, 0])
        .translate([this.width / 2, this.height / 2])
        .scale(this.width / 1.5 / Math.PI);

      // regional data
      this.regions
        .selectAll("path")
        .data(GEODATA.features)
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
              .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill : "#dce4ec");
          },
          update => update
          .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill : "#dce4ec")
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

.country-container {
  color: saturate($clinical-trial-color, 15%);
}
</style>
