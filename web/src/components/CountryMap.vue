<template>
<div class="d-flex flex-column">
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg">
    <g ref="countries" class="country-group"></g>
  </svg>
  <div class="country-container d-flex flex-wrap" v-if="showNames">
    <small class="m-0 mr-1" v-for="(country, idx) in countries" :key="idx">
      {{ country }}<span v-if="idx < countries.length - 1">,</span>
    </small>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import GEODATA from "@/assets/geo/countries.json";
import {
  select,
  geoPath,
  geoEqualEarth,
  min
} from "d3";

export default Vue.extend({
  name: "CountryMap",
  props: {
    countries: Array,
    width: {
      type: Number,
      default: 200
    },
    fill: {
      type: String,
      default: "#df4ab7"
    },
    showNames: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    countries: function() {
      this.drawMetro();
    }
  },
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
      height: null
    }
  },
  mounted() {
    this.setupChoro();
    this.drawMetro();
  },
  methods: {
    setupChoro() {
      this.svg = select(this.$refs.svg);
      this.regions = select(this.$refs.countries);
      this.height = this.width * 0.5;
    },
    drawMetro() {
      var path = geoPath();
      var projection = geoEqualEarth()
        .center([15, 12]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
        .translate([this.width / 2, this.height / 2])
        .scale(this.width / 1.45 / Math.PI);

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
              .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill : "#dce4ec")
              .attr("stroke", d => this.countries.includes(d.properties.NAME) ? "white" : "none");
          },
          update => update
          .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill : "#dce4ec"),
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )
    }
  }
})
</script>

<style lang="scss">
.region {
    // fill: mix($grey-40, $grey-30);
    stroke-width: 0.5;
}

.country-container {
    color: saturate($clinical-trial-color, 15%);
}
</style>
