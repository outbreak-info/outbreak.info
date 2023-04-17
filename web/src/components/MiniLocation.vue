<template>
  <div>
    <svg ref="svg" :width="width" :height="height" class="locator-map-svg">
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

      <g ref="blank_map" class="blank-map-group" />
      <circle
        v-if="coords"
        :cx="coords[0]"
        :cy="coords[1]"
        :r="radius"
        :fill="fillColor"
        stroke="#2c3e50"
        stroke-width="0.5"
        filter="url(#shadow)"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { min } from 'd3-array';
import { geoPath, geoAlbersUsa, geoEqualEarth } from 'd3-geo';
import { select } from 'd3-selection';

import worldMap from '@/assets/geo/countries_fused_simplified.json';
import usMap from '@/assets/geo/US_states.json';

const props = defineProps({
  lat: Number,
  lon: Number,
  colorScale: Function,
  partOfUSA: Boolean,
  id: String,
});

const width = ref(150);
const height = ref(75);
const radius = ref(3.5);
// refs
const map = ref(null);
const projection = ref(null);
// methods
const path = ref(geoPath());
const blankMap = ref(null);
// this.$refs
const blank_map = ref(null);

const fillColor = computed(() => {
  return props.colorScale(props.id);
});

const coords = computed(() => {
  return projection.value ? projection.value([props.lon, props.lat]) : null;
});

const setupMap = () => {
  map.value = select(blank_map.value);

  if (props.partOfUSA) {
    blankMap.value = usMap;

    projection.value = geoAlbersUsa()
      .scale(1)
      .translate([width.value / 2, height.value / 2]);
  } else {
    blankMap.value = worldMap;

    projection.value = geoEqualEarth()
      .center([18, 7]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
      .scale(1)
      .translate([width.value / 2, height.value / 2]);
  }

  path.value = path.value.projection(projection.value);

  const bounds = path.value.bounds(blankMap.value),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    xscale = width.value / dx,
    yscale = height.value / dy,
    scale = min([xscale, yscale]);

  projection.value = projection.value.scale(scale);

  map.value
    .selectAll('path')
    .data(blankMap.value.features)
    .join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'blank-outline')
          .style('fill', '#d6d6d6')
          .style('stroke', '#2c3e50')
          .style('stroke-width', 0.2)
          // draw each region
          .attr('d', path.value);
      },
      (update) => update.attr('d', path.value),
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );
};

watch(
  () => props.lat,
  () => {
    setupMap();
  },
);

onMounted(() => {
  setupMap();
});
</script>

<style lang="scss"></style>
