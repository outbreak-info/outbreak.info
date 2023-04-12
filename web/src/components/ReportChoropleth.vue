<template>
  <div
    id="report-choropleth"
    class="d-flex flex-column align-items-center w-100"
  >
    <!-- choropleth -->
    <svg
      ref="choropleth"
      :width="width"
      :height="height"
      class="report-choropleth mt-3"
      :subtitle="subtitle"
      :name="title"
      :class="{ hidden: noMap }"
      style="background: aliceblue"
    >
      <defs>
        <pattern
          id="diagonalHatch"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            :style="`stroke:${strokeColor}; stroke-width:0.75`"
          />
        </pattern>
      </defs>
      <g ref="basemapRef" class="basemap-group" />
      <g ref="regionsRef" class="region-group" />
      <g ref="zero_data" class="zero-group" />
      <g ref="overlayRef" class="overlay-group" />
    </svg>

    <div
      id="tooltip-choro"
      ref="tooltip_choro"
      class="tooltip-basic box-shadow"
    >
      <h5 id="location-name" />
      <em id="no-sequencing">No reported sequencing</em>
      <div class="d-flex align-items-center">
        <b id="proportion" class="font-size-2" />
        <span id="confidence-interval" class="text-muted ml-2" />
      </div>
      <div id="sequencing-count" />
    </div>

    <div v-if="showCopy && !noMap" class="w-75">
      <DownloadReportData
        :data="data"
        figureRef="report-choropleth"
        dataType="Mutation Report Choropleth"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { min } from 'd3-array';
import { format } from 'd3-format';
import {
  geoPath,
  geoBounds,
  geoEqualEarth,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
} from 'd3-geo';
import { select } from 'd3-selection';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import ADMIN0_SIMPLE from '@/assets/geo/gadm_adm0_simplified.json';
import ADMIN0 from '@/assets/geo/gadm_adm0.json';
import USADATA from '@/assets/geo/US_states.json';
import ADMIN1 from '@/assets/geo/gadm_adm1_simplified.json';
import { lazyLoad } from '@/js/lazy-load';

const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  mutationName: String,
  report: String,
  fillMax: Number,
  location: {
    type: String,
    default: 'Worldwide',
  },
  showLegend: {
    type: Boolean,
    default: true,
  },
  showCopy: {
    type: Boolean,
    default: true,
  },
  smallMultiples: {
    type: Boolean,
    default: false,
  },
  countThreshold: Number,
  recentWindow: String,
  colorScale: Function,
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const width = ref(800);
const height = ref(400);
const margin = ref({
  top: 2,
  right: 2,
  bottom: 2,
  left: 2,
});
// variables
const variable = ref('proportion');
const filteredColor = ref('#A5A5A5');
const nullColor = ref('#EFEFEF');
const strokeColor = ref('#2c3e50');
// data
const filteredData = ref(null);
// map data
const locationMap = ref(null);
const projection = ref(null);
const hwRatio = ref(0.45);
// refs
const svg = ref(null);
const regions = ref(null);
const zeros = ref(null);
const basemap = ref(null);
const overlay = ref(null);
const ttips = ref(null);
// methods
const path = ref(geoPath());
const noMap = ref(true);
// variables instead of this.$refs
const tooltip_choro = ref(null);
const choropleth = ref(null);
const basemapRef = ref(null);
const regionsRef = ref(null);
const zero_data = ref(null);
const overlayRef = ref(null);
const choropleth_tooltip = ref(null);
// new variable to get event clientX, clientY
const x = ref(0);
const y = ref(0);

// computed variables
const title = computed(() => {
  if (props.smallMultiples) {
    return props.recentWindow
      ? `Prevalence over the last ${props.recentWindow} days in ${props.location}`
      : 'Estimated prevalence';
  }
  return props.location === 'Worldwide'
    ? `${props.mutationName} cumulative prevalence by country`
    : `${props.mutationName} cumulative prevalence in ${props.location}`;
});

const subtitle = computed(() => {
  if (props.smallMultiples) {
    return props.mutationName;
  }
  return null;
});

const setDims = () => {
  const mx = 0.8;
  const my = 0.85;
  const svgContainer = document.getElementById('report-choropleth');

  let maxSvgWidth = svgContainer ? svgContainer.offsetWidth * mx : 800;
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight * my;

  if (maxSvgWidth > maxWidth) {
    maxSvgWidth = maxWidth - 20;
  }

  const idealHeight = hwRatio.value * maxSvgWidth;
  if (idealHeight <= maxHeight) {
    height.value = idealHeight;
    width.value = maxSvgWidth;
  } else {
    height.value = maxHeight;
    width.value = height.value / hwRatio.value;
  }
};

const chooseMap = () => {
  if (props.location === 'Worldwide') {
    projection.value = geoEqualEarth()
      .center([11.05125, 7.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the ADMIN1 anyway...
      .scale(1)
      .translate([width.value / 2, height.value / 2]);

    locationMap.value = cloneDeep(ADMIN0_SIMPLE);
    // this.hwRatio = 0.45;
    // this.setDims();
  } else if (props.location === 'United States' || props.location === 'USA') {
    projection.value = geoAlbersUsa()
      .scale(1)
      .translate([width.value / 2, height.value / 2]);

    locationMap.value = cloneDeep(USADATA);
    // this.hwRatio = 0.45;
    // this.setDims();
  } else {
    locationMap.value = cloneDeep(ADMIN1[props.location]);
    const mapBounds = geoBounds(locationMap.value);

    projection.value = geoAzimuthalEqualArea()
      .center([0, 0])
      .rotate([
        (mapBounds[0][0] + mapBounds[1][0]) * -0.5,
        (mapBounds[0][1] + mapBounds[1][1]) * -0.5,
      ])
      .scale(1)
      .translate([width.value / 2, height.value / 2]);

    // const mapRatio = Math.abs(mapBounds[0][1] - mapBounds[1][1]) / Math.abs(mapBounds[0][0] - mapBounds[1][0]);
    // this.hwRatio = mapRatio;
    // this.setDims();
  }
};

const setupChoro = () => {
  svg.value = select(choropleth.value);
  basemap.value = select(basemapRef.value);
  regions.value = select(regionsRef.value);
  zeros.value = select(zero_data.value);
  overlay.value = select(overlayRef.value);
  ttips.value = select(choropleth_tooltip.value); // can't find choropleth_tooltip ref
};

const updateProjection = () => {
  projection.value = projection.value
    .scale(1)
    .translate([width.value / 2, height.value / 2]);

  path.value = path.value.projection(projection.value);
  // calc and set scale
  // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
  const bounds = path.value.bounds(locationMap.value),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    xscale = (width.value / dx) * 0.98,
    yscale = (height.value / dy) * 0.98,
    scale = min([xscale, yscale]);

  projection.value = projection.value.scale(scale);

  filteredData.value = locationMap.value.features;
};

const prepData = () => {
  if (props.data && locationMap.value) {
    // Update projection / scales
    updateProjection();

    filteredData.value.forEach((d) => {
      const filtered = props.data.filter(
        (seq) => seq.name.toLowerCase() === d.properties.NAME.toLowerCase(),
      );
      if (filtered.length > 0) {
        filtered.sort((a, b) => b.cum_total_count - a.cum_total_count);
        const seq = filtered[0];
        d[variable.value] = seq[variable.value];
        // filter values with too few values
        d['fill'] =
          seq.cum_total_count >= props.countThreshold
            ? props.colorScale(d[variable.value])
            : filteredColor.value;
        d['id'] = seq.id;
        d['lower'] = seq.proportion_ci_lower;
        d['upper'] = seq.proportion_ci_upper;
        d['cum_lineage_count'] = seq['cum_lineage_count'];
        d['cum_total_count'] = seq['cum_total_count'];
        d['proportion_formatted'] = seq.proportion_formatted;
      } else {
        d['id'] = null;
        d['fill'] = null;
        d['lower'] = null;
        d['upper'] = null;
        d['cum_lineage_count'] = null;
        d['cum_total_count'] = null;
        d['proportion_formatted'] = null;
      }
    });

    noMap.value = false;
  } else {
    filteredData.value = null;
    noMap.value = true;
  }
};

const drawMap = () => {
  prepData();

  if (filteredData.value) {
    const basemapData =
      props.location === 'Worldwide' || props.location === 'United States'
        ? []
        : ADMIN0.features.filter((d) => d.properties.NAME !== props.location);

    basemap.value
      .selectAll('.basemap')
      .data(basemapData, (d) => d.properties.location_id)
      .join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'basemap')
            .attr('id', (d) => d.properties.location_id)
            // draw each region
            .attr('d', path.value.projection(projection.value))
            .style('fill', '#FDFDFD')
            .style('stroke', '#444444')
            .style('stroke-width', 0.25);
        },
        (update) =>
          update
            .attr('id', (d) => d.properties.location_id)
            // draw each region
            .attr('d', path.value.projection(projection.value)),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

    regions.value
      .selectAll('.region-fill')
      .data(filteredData.value, (d) => d.properties.location_id)
      .join(
        (enter) => {
          enter
            .append('path')
            .attr(
              'class',
              (d) => `${d.properties.location_id} region region-fill`,
            )
            .attr('id', (d) => d.properties.location_id)
            // draw each region
            .attr('d', path.value.projection(projection.value))
            .classed('pointer', true)
            .on('click', (d) => route2Location(d.id))
            .style('fill', (d) => (d.fill ? d.fill : nullColor.value))
            .style('stroke', strokeColor.value)
            .style('stroke-width', 0.5);
        },
        (update) =>
          update
            .attr(
              'class',
              (d) => `${d.properties.location_id} region region-fill`,
            )
            .attr('id', (d) => d.properties.location_id)
            .on('click', (d) => route2Location(d.id))
            // draw each region
            .attr('d', path.value.projection(projection.value))
            .transition()
            .duration(250)
            .style('fill', (d) => (d.fill ? d.fill : nullColor.value)),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

    // highlight where the data is 0.
    regions.value
      .selectAll('.zero-data')
      .data(
        filteredData.value.filter((d) => d.proportion === 0),
        (d) => d.properties.location_id,
      )
      .join(
        (enter) => {
          enter
            .append('path')
            .attr(
              'class',
              (d) => `${d.properties.location_id} region zero-data`,
            )
            .attr('id', (d) => `${d.properties.location_id}_zero`)
            // draw each region
            .attr('d', path.value.projection(projection.value))
            .style('fill', 'url(#diagonalHatch)')
            .style('stroke', strokeColor.value)
            .style('stroke-width', 0.5);
        },
        (update) =>
          update
            .attr(
              'class',
              (d) => `${d.properties.location_id} region zero-data`,
            )
            .attr('id', (d) => `${d.properties.location_id}_zero`)
            // draw each region
            .attr('d', path.value.projection(projection.value)),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

    overlay.value
      .selectAll('.overlay')
      .data(
        ADMIN0.features.filter(
          (d) =>
            d.properties.NAME === props.location &&
            d.properties.NAME !== 'United States',
        ),
        (d) => d.properties.location_id,
      )
      .join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'overlay')
            .attr('id', (d) => d.properties.location_id)
            // draw each region
            .attr('d', path.value.projection(projection.value))
            .style('fill', 'none')
            .style('stroke', strokeColor.value)
            .style('stroke-width', 1.25);
        },
        (update) =>
          update
            .attr('id', (d) => d.properties.location_id)
            // draw each region
            .attr('d', path.value.projection(projection.value)),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

    regions.value
      .selectAll('path.region')
      .on('mouseenter', (d) => debounceMouseOn(d))
      .on('mouseleave', mouseOff);
  }
};

const mouseOn = (d) => {
  const ttipShift = 15;

  // dim everything
  regions.value
    .selectAll('.region')
    .style('opacity', 0.2)
    .style('stroke-opacity', 0.5);

  // turn on the location
  regions.value
    .select(`.${d.properties.location_id}`)
    .style('opacity', 1)
    .style('stroke-opacity', 1);

  const ttip = select(tooltip_choro.value);

  // edit text
  ttip.select('h5').text(d.properties.NAME);
  if (d.proportion || d.proportion === 0) {
    ttip.select('#no-sequencing').classed('hidden', true);
    ttip
      .select('#proportion')
      .text(`${d.proportion_formatted} ${props.mutationName}`)
      .classed('hidden', false);

    ttip

      .select('#confidence-interval')
      .text(`(95% CI: ${format('.0%')(d.lower)}-${format('.0%')(d.upper)})`)
      .classed('hidden', false);

    ttip
      .select('#sequencing-count')
      .text(
        `Number of total ${props.mutationName} cases: ${format(',')(
          d.cum_lineage_count,
        )}/${format(',')(d.cum_total_count)}`,
      )
      .classed('hidden', false);
  } else {
    ttip.select('#no-sequencing').classed('hidden', false);
    ttip.select('#proportion').classed('hidden', true);
    ttip.select('#confidence-interval').classed('hidden', true);
    ttip.select('#sequencing-count').classed('hidden', true);
  }

  // fix location: reimplemented with new variable x, y
  ttip
    .style('left', `${x.value + ttipShift}px`) // event.clientX is not working. event is always null here
    .style('top', `${y.value + ttipShift}px`) // event.clientY is not working.
    .style('display', 'block');
};

const mouseOff = () => {
  select(tooltip_choro.value).style('display', 'none');

  regions.value.selectAll('.zero-data').style('opacity', 1);

  regions.value
    .selectAll('.region')
    .style('opacity', 1)
    .style('stroke-opacity', 1);
};

const route2Location = (id) => {
  if (props.report === 'MutationReport') {
    const query = route.query;
    const params = route.params;
    let locs = query.loc
      ? typeof query.loc == 'string'
        ? [query.loc]
        : query.loc
      : [];
    locs.push(id);
    router.push({
      name: 'MutationReport',
      state: {
        disableScroll: true,
      },
      params: { alias: params.alias },
      query: {
        pango: query.pango,
        muts: query.muts,
        selected: id,
        loc: locs,
      },
    });
  } else if (props.report === 'GenomicsEmbedVariant') {
    const query = route.query;
    let locs = query.loc
      ? typeof query.loc == 'string'
        ? [query.loc]
        : query.loc
      : [];
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'var',
        alias: query.alias,
        pango: query.pango,
        muts: query.muts,
        selected: id,
        loc: locs,
      },
    });
  } else if (props.report === 'LocationReport') {
    const query = route.query;
    router.push({
      name: 'LocationReport',
      query: {
        loc: id,
        muts: query.muts,
        alias: query.alias,
        pango: query.pango,
        variant: query.variant,
        selected: query.selected,
        dark: query.dark,
        xmax: query.xmax,
        xmin: query.xmin,
      },
    });
  } else if (props.report === 'GenomicsEmbedLocation') {
    const query = route.query;
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'loc',
        loc: id,
        muts: query.muts,
        alias: query.alias,
        pango: query.pango,
        variant: query.variant,
        selected: query.selected,
        dark: query.dark,
        xmax: query.xmax,
        xmin: query.xmin,
      },
    });
  }
};

watch(
  () => props.data,
  () => {
    chooseMap();
    drawMap();
  },
  { deep: true },
); // deep option is required since props.data is array

watch(
  () => props.countThreshold,
  () => {
    drawMap();
  },
);

watch(width, () => {
  drawMap();
});

const debounceMouseOn = debounce(mouseOn, 250);
const debounceSetDims = debounce(setDims, 150);

onMounted(() => {
  nextTick(function () {
    window.addEventListener('resize', debounceSetDims);

    // this.$root.$on('update:countThreshold', (newThreshold) => {
    //   // this.countThreshold = newThreshold;
    //   // this.drawMap();
    // });

    // event listener to hide tooltips
    document.addEventListener(
      'mousemove',
      (evt) => {
        if (
          !evt.target.className ||
          !evt.target.className.baseVal ||
          !evt.target.className.baseVal.includes('region')
        ) {
          mouseOff();
        }
        // we need to get x, y value due to d3 event is always null
        if (
          evt.target.className &&
          evt.target.className.baseVal &&
          typeof evt.target.className.baseVal === 'string' &&
          evt.target.className.baseVal.includes('region')
        ) {
          x.value = evt.clientX;
          y.value = evt.clientY;
        }
      },
      {
        passive: true,
      },
    );
    document.addEventListener(
      'mouseleave',
      (evt) => {
        if (
          !evt.target.className ||
          !evt.target.className.baseVal ||
          !evt.target.className.baseVal.includes('region')
        ) {
          mouseOff();
        }
      },
      {
        passive: true,
      },
    );
  });

  chooseMap();
  // set initial dimensions for the choropleth plots.
  setDims();
  setupChoro(); // svg handles, etc.
});
</script>
