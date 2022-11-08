<template>
  <div>
    <svg :width="width" :height="height" ref="svg" class="locator-map-svg">
      <defs>
        <filter id="shadow">
          <feDropShadow
            dx="0.6"
            dy="0.5"
            flood-color="#2c3e50"
            stdDeviation="0.2"
          />
        </filter>
      </defs>

      <g ref="blank_map" class="blank-map-group"></g>
      <circle
        :cx="coords[0]"
        :cy="coords[1]"
        :r="radius"
        :fill="fillColor"
        stroke="#2c3e50"
        stroke-width="0.5"
        filter="url(#shadow)"
        v-if="coords"
      ></circle>
    </svg>
  </div>
</template>

<script>
import {
  geoEqualEarth,
  geoAlbersUsa,
  geoPath,
  select,
  selectAll,
  min,
} from 'd3';

import worldMap from '@/assets/geo/countries_fused_simplified.json';
import usMap from '@/assets/geo/US_states.json';

export default {
  name: 'MiniLocation',
  props: {
    lat: Number,
    lon: Number,
    colorScale: Function,
    partOfUSA: Boolean,
    id: String,
  },
  data() {
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
      blankMap: null,
    };
  },
  computed: {
    fillColor() {
      return this.colorScale(this.id);
    },
    coords() {
      return this.projection ? this.projection([this.lon, this.lat]) : null;
    },
  },
  watch: {
    lat() {
      this.setupMap();
    },
  },
  mounted() {
    this.setupMap();
  },
  methods: {
    setupMap() {
      this.map = select(this.$refs.blank_map);

      if (this.partOfUSA) {
        this.blankMap = usMap;

        this.projection = geoAlbersUsa()
          .scale(1)
          .translate([this.width / 2, this.height / 2]);
      } else {
        this.blankMap = worldMap;

        this.projection = geoEqualEarth()
          .center([18, 7]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
          .scale(1)
          .translate([this.width / 2, this.height / 2]);
      }

      this.path = this.path.projection(this.projection);

      const bounds = this.path.bounds(this.blankMap),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx,
        yscale = this.height / dy,
        scale = min([xscale, yscale]);

      this.projection = this.projection.scale(scale);

      this.map
        .selectAll('path')
        .data(this.blankMap.features)
        .join(
          (enter) => {
            enter
              .append('path')
              .attr('class', 'blank-outline')
              .style('fill', '#d6d6d6')
              .style('stroke', '#2c3e50')
              .style('stroke-width', 0.2)
              // draw each region
              .attr('d', this.path);
          },
          (update) => update.attr('d', this.path),
          (exit) =>
            exit.call((exit) =>
              exit
                .transition()
                .style('opacity', 1e-5)
                .remove(),
            ),
        );
    },
  },
};
</script>

<style lang="scss"></style>
