<template>
  <div id="sublineage-totals" class="mt-4">
    <div class="d-flex align-items-center">
      <h5 class="m-0">Lineage breakdown of {{ title }}</h5>
      <button
        class="btn btn-main-outline d-flex align-items-center my-2 px-2 ml-2"
        data-toggle="modal"
        data-target="#change-selected-location"
      >
        <font-awesome-icon class="fa-sm" :icon="['fas', 'sync']" />
      </button>
    </div>

    <p class="text-muted m-0">
      There are
      <b>{{ data.length }}</b>
      <a>Pango lineages</a>
      currently associated with the {{ lineageName }} variant:
    </p>

    <svg
      ref="svgRef"
      :width="width"
      :height="height"
      class="sublineage_counts"
      :name="title"
    >
      <defs>
        <marker
          id="arrow-sublineage"
          markerWidth="13"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M5,0 L12,5 L5,10"
            class="swoopy-arrowhead-sublineage"
            :stroke="fill"
            fill="none"
          />
        </marker>
      </defs>
      <g
        ref="horizontal_bargraph"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        ref="yAxisRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="horizontal-bargraph-y pointer axis--y"
      />
      <g class="swoopy-arrow-group">
        <path
          id="switch-btn-swoopy-arrow"
          class="swoopy-arrow"
          marker-end="url(#arrow-sublineage)"
          :d="swoopyPosition"
          :stroke="fill"
          fill="none"
        />
        <text
          :x="width - margin.right - 10"
          :y="height - margin.top"
          text-anchor="end"
          :fill="fill"
        >
          all {{ lineageName }} lineages
        </text>
      </g>
    </svg>

    <div class="d-flex align-items-center mt-3">
      <button
        id="zeros-filtered"
        class="btn btn-main-outline m-0 btn-sublineages mr-3"
        @click="showZeros"
      >
        <small v-if="showZero">
          {{ hideZeros ? 'show' : 'hide' }} lineages with zero sequences
        </small>

        <small v-else>
          {{ showAll ? 'show top 10 lineages' : 'show all lineages' }}
        </small>
      </button>

      <DownloadReportData
        :data="data"
        figureRef="sublineage_counts"
        dataType="Sublineage breakdown"
        :fullWidth="false"
      />
    </div>

    <div
      v-if="areZerosFiltered || (!areZerosFiltered && !hideZeros)"
      class="text-muted mt-2 line-height-sm"
    >
      <small>
        <font-awesome-icon class="mr-1" :icon="['far', 'question-circle']" />
        Lineages may show zero sequences immediately after the
        <a
          href="https://www.pango.network/how-does-the-system-work/genome-designation-versus-assignation/"
          target="_blank"
        >
          Pango network designates a new lineage
        </a>
        since lineage assignment models used by
        <a
          href="https://cov-lineages.org/resources/pangolin.html"
          target="_blank"
        >
          Pangolin
        </a>
        have to be retrained, followed by sequence classification with the
        updated models.
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sum } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { scaleLinear, scaleBand } from 'd3-scale';
import { select, selectAll } from 'd3-selection';
import cloneDeep from 'lodash/cloneDeep';

import { lazyLoad } from '@/js/lazy-load';

const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  lineageName: String,
  location: String,
  routeTo: String,
  margin: {
    type: Object,
    default: () => {
      return {
        left: 80,
        right: 100,
        top: 10,
        bottom: 45,
      };
    },
  },
  width: {
    type: Number,
    default: 500,
  },
  fill: {
    type: String,
    default: '#f28e2c',
  },
});

// instead of this.$router
const router = useRouter();
// instead of this.$route
const route = useRoute();

const numXTicks = ref(4);
const bandwidth = ref(25);
const height = ref(null);
const hideZeros = ref(true);
const areZerosFiltered = ref(false);
// variables
const yVar = ref('mutation_string');
// refs
const svg = ref(null);
const svgRef = ref(null);
// axes
const x = ref(null);
const y = ref(null);

const combinedTotal = ref(null);
const yAxis = ref(null);
const showAll = ref(false);
const showZero = ref(false);
const processedData = ref(null);
const horizontal_bargraph = ref(null);
const yAxisRef = ref(null);

const geographicName = computed(() => {
  return props.location === 'Worldwide'
    ? 'globally'
    : props.location
    ? `in ${props.location}`
    : null;
});

const title = computed(() => {
  return geographicName.value
    ? `${props.lineageName} ${geographicName.value}`
    : props.lineageName;
});

const swoopyPosition = computed(() => {
  return `M ${props.width - props.margin.left - 20} ${
    height.value - props.margin.top - 5
  } c 0 0, 15 0, 0 -25`;
});

const handleLineageClick = (lineage) => {
  const queryParams = route.query;
  if (props.routeTo === 'GenomicsEmbedVariant') {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        country: queryParams.country,
        division: queryParams.division,
        pango: lineage,
        selected: queryParams.selected,
        selectedType: queryParams.selectedType,
      },
    });
  } else {
    router.push({
      name: props.routeTo,
      query: {
        country: queryParams.country,
        division: queryParams.division,
        pango: lineage,
        selected: queryParams.selected,
        selectedType: queryParams.selectedType,
      },
    });
  }
};

const preprocessData = () => {
  processedData.value = cloneDeep(props.data);
  if (hideZeros.value) {
    processedData.value = processedData.value.filter((d) => d.lineage_count);
    areZerosFiltered.value = props.data.length !== processedData.value.length;
  } else {
    areZerosFiltered.value = false;
  }

  processedData.value.sort((a, b) => {
    return b.lineage_count - a.lineage_count;
  });

  if (processedData.value.length > 10) {
    if (!showAll.value) {
      processedData.value = processedData.value.slice(0, 10);
    }
  } else {
    showZero.value = true;
  }
};

const setupPlot = () => {
  svg.value = select(horizontal_bargraph.value);
  preprocessData();
};

const updateAxes = () => {
  const paddingInner = 0.25;
  height.value =
    processedData.value.length * bandwidth.value +
    (processedData.value.length - 1) * bandwidth.value * paddingInner +
    props.margin.top +
    props.margin.bottom;

  const originData = cloneDeep(props.data);
  combinedTotal.value = sum(originData, (d) => d.lineage_count);

  x.value = scaleLinear()
    .range([0, props.width - props.margin.right - props.margin.left])
    .domain([0, combinedTotal.value]);

  y.value = scaleBand()
    .paddingInner(paddingInner)
    .range([0, height.value - props.margin.top - props.margin.bottom])
    .domain(processedData.value.map((d) => d[yVar.value]));

  yAxis.value = axisLeft(y.value).tickSizeOuter(0);

  select(yAxisRef.value).call(yAxis.value);
};

const tooltipOn = (d) => {
  if (d) {
    svg.value.selectAll('.lineage-group').style('opacity', 0.3);

    select(yAxisRef.value).selectAll('text').style('opacity', 0.3);

    // eslint-disable-next-line no-prototype-builtins
    if (d.hasOwnProperty(yVar.value)) {
      select(yAxisRef.value)
        .selectAll('text')
        .filter((axis_label) => axis_label === d[yVar.value])
        .style('opacity', 1);
    }
    svg.value.select(`#${d.id}`).style('opacity', 1);
  }
};

const tooltipOff = () => {
  svg.value.selectAll('.lineage-group').style('opacity', 1);

  select(yAxisRef.value).selectAll('text').style('opacity', 1);
};

const drawBars = () => {
  const rectSelector = svg.value
    .selectAll('.lineage-group')
    .data(processedData.value, (d) => d[yVar.value]);

  rectSelector.join(
    (enter) => {
      const grp = enter
        .append('g')
        .attr('class', 'lineage-group')
        .attr('id', (d) => d.id);

      grp
        .append('rect')
        .attr('class', 'variant-total')
        .attr('x', (d) => x.value(0))
        .attr('y', (d) => y.value(d[yVar.value]))
        .attr('height', (d) => y.value.bandwidth())
        .style('fill', props.fill)
        .style('fill-opacity', 0.05)
        .style('stroke', props.fill)
        .attr('width', x.value(combinedTotal.value) - x.value(0));

      grp
        .append('rect')
        .attr('class', 'rect-by-lineage')
        .attr('x', (d) => x.value(0))
        .attr('y', (d) => y.value(d[yVar.value]))
        .attr('height', (d) => y.value.bandwidth())
        .style('fill', props.fill)
        .attr('width', (d) => x.value(d.lineage_count) - x.value(0));

      grp
        .append('text')
        .attr('class', 'lineage-count-annotation')
        .attr('x', (d) => props.width - props.margin.left - props.margin.right)
        .attr('dx', 10)
        .attr('y', (d) => y.value(d[yVar.value]) + y.value.bandwidth() / 2)
        .text((d) => d.lineage_count_formatted)
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('fill', props.fill)
        .style('font-weight', 700)
        .style('dominant-baseline', 'central');
    },
    (update) => {
      update.attr('id', (d) => d.id + props.location);

      update
        .select('.variant-total')
        .attr('y', (d) => y.value(d[yVar.value]))
        .attr('height', (d) => y.value.bandwidth())
        .attr('width', x.value(combinedTotal.value) - x.value(0));

      update
        .select('.rect-by-lineage')
        .attr('x', (d) => x.value(0))
        .transition()
        .duration(250)
        .attr('width', (d) => x.value(d.lineage_count) - x.value(0))
        .attr('y', (d) => y.value(d[yVar.value]))
        .attr('height', (d) => y.value.bandwidth());

      update
        .select('.lineage-count-annotation')
        .transition()
        .duration(250)
        .attr('y', (d) => y.value(d[yVar.value]) + y.value.bandwidth() / 2)
        .text((d) => d.lineage_count_formatted);
    },
    (exit) => {
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      );
    },
  );

  // event listener for click event
  select(yAxisRef.value)
    .selectAll('text')
    .classed('pointer', true)
    .on('click', (d) => handleLineageClick(d));

  selectAll('.lineage-group')
    .classed('pointer', true)
    .on('mousemove', (d) => tooltipOn(d))
    .on('mouseleave', () => tooltipOff())
    .on('click', (d) => handleLineageClick(d[yVar.value]));
};

const updatePlot = () => {
  updateAxes();
  drawBars();
};

const showZeros = () => {
  if (showZero.value) {
    hideZeros.value = !hideZeros.value;
  }
  showAll.value = !showAll.value;
  preprocessData();
  updatePlot();
};

watch(
  () => props.data,
  () => {
    preprocessData();
    updatePlot();
  },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
.horizontal-bargraph-y {
  font-size: 16px;
}

.horizontal-bargraph-y path {
  display: none;
}

.horizontal-bargraph-y line {
  stroke: #888;
}

.btn-sublineages {
  line-height: 1 !important;
}
</style>
