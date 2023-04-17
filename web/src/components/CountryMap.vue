<template>
  <div class="d-flex flex-column">
    <svg
      ref="svgRef"
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
    >
      <g ref="countriesRef" class="country-group" />
    </svg>
    <div v-if="showNames" class="country-container d-flex flex-wrap">
      <small v-for="(country, idx) in countries" :key="idx" class="m-0 mr-1">
        {{ country }}
        <span v-if="idx < countries.length - 1">,</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { geoPath, geoEqualEarth } from 'd3-geo';
import { select } from 'd3-selection';

import GEODATA from '@/assets/geo/countries_ne.json';
import GADM from '@/assets/geo/gadm_adm0_simplified.json';

const props = defineProps({
  countries: Array,
  mapSource: {
    type: String,
    default: 'NE',
  },
  width: {
    type: Number,
    default: 200,
  },
  fill: {
    type: String,
    default: '#df4ab7',
  },
  showNames: {
    type: Boolean,
    default: true,
  },
});

const margin = ref({
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
});
const height = ref(null);
// refs
const svg = ref(null);
const regions = ref(null);
// variables to replace this.$refs
const svgRef = ref(null);
const countriesRef = ref(null);
// missing variables in previous version
const baseMap = ref(null);

const setupChoro = () => {
  svg.value = select(svgRef.value);
  regions.value = select(countriesRef.value);
  height.value = props.width * 0.5;

  baseMap.value = props.mapSource === 'GADM' ? GADM.features : GEODATA.features;
};

const drawMetro = () => {
  const path = geoPath();
  const projection = geoEqualEarth()
    .center([15, 12]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
    .translate([props.width / 2, height.value / 2])
    .scale(props.width / 1.45 / Math.PI);

  // regional data
  regions.value
    .selectAll('path')
    .data(baseMap.value)
    .join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'region')
          .attr('id', (d) => d.location_id)
          // draw each region
          .attr('d', path.projection(projection))
          .attr('fill', (d) =>
            props.countries.includes(d.properties.NAME)
              ? props.fill
              : '#dce4ec',
          )
          .attr('stroke', (d) =>
            props.countries.includes(d.properties.NAME) ? 'white' : 'none',
          );
      },
      (update) =>
        update
          .attr('fill', (d) =>
            props.countries.includes(d.properties.NAME)
              ? props.fill
              : '#dce4ec',
          )
          .attr('d', path.projection(projection)),
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );
};

watch(
  () => props.countries,
  () => {
    drawMetro();
  },
  { deep: true },
);

watch(
  () => props.width,
  () => {
    height.value = props.width * 0.5;
    drawMetro();
  },
);

onMounted(() => {
  setupChoro();
  drawMetro();
});
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
