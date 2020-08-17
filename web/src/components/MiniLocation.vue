<template>
<div>
  <svg :width="width" :height="height" ref="svg" class="locator-map-svg">
    <g ref="blank_map" class="blank-map-group"></g>
    <circle :cx="coords[0]" :cy="coords[1]" :r="radius" :fill="fillColor" stroke="#2c3e50" stroke-width="0.5" v-if="coords"></circle>
  </svg>
</div>
</template>


<script>
import {
  geoEqualEarth,
  geoPath,
  select,
  selectAll,
  min
} from "d3";

import blankMap from "@/assets/geo/countries_fused_simplified.json";


export default {
  name: "MiniLocation",
  props: {
    lat: Number,
    lon: Number,
    colorScale: Function,
    id: String
  },
  data: function() {
    return {
      width: 150,
      height: 75,
      radius: 3.5,
      // refs
      map: null,
      projection: null,
      // methods
      path: geoPath(),
      // map data
      // blankMap: null
    }
  },
  computed: {
    fillColor() {
      return (this.colorScale(this.id))
    },
    coords() {
      return(this.projection ? this.projection([this.lon, this.lat]) : null)
    }
  },
  mounted() {
    this.setupMap();
  },
  methods: {
    setupMap() {
      this.map = select(this.$refs.blank_map);

      this.projection = geoEqualEarth()
        .center([18, 7]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
        .scale(1)
        .translate([this.width / 2, this.height / 2]);

      this.path = this.path.projection(this.projection);

      const bounds = this.path.bounds(blankMap),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx,
        yscale = this.height / dy,
        scale = min([xscale, yscale]);

      this.projection = this.projection
        .scale(scale);

      this.map
        .selectAll("path")
        .data(blankMap.features)
        .join(
          enter => {
            enter
              .append("path")
              .attr("class", "blank-outline")
              .style("fill", "#bababa")
              // draw each region
              .attr("d", this.path)
          })
    }
  }
}
</script>

<style lang="scss">
</style>
