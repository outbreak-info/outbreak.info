<template>
  <div class="mutations-by-lineage d-flex flex-column text-left">
    <h6 class="m-0">
      {{ title }}
    </h6>
    <div
      class="d-flex justify-content-between align-items-center"
      :style="{ width: width + 'px' }"
    >
      <small class="text-muted">{{ subtitle }}</small>
      <button
        v-if="otherDataArr.length"
        class="small btn btn-outline-secondary my-1 px-2 py-1"
        @click="expandOther"
      >
        {{ otherExpanded ? 'hide' : 'expand' }} other
      </button>
    </div>

    <svg
      :width="width"
      :height="height"
      class="mutations_by_lineage"
      :name="title"
    >
      <g
        ref="horizontal_bargraph"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        ref="yAxisRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="horizontal-bargraph-y pointer axis--y"
      />
      <g
        ref="xAxisRef"
        :transform="`translate(${margin.left}, ${height - margin.bottom})`"
        class="horizontal-bargraph-x axis--x"
      />
    </svg>

    <div
      class="d-flex justify-content-between align-items-center"
      :style="{ width: width + 'px' }"
    >
      <button
        v-if="otherDataArr.length"
        class="small btn btn-outline-secondary my-1 px-2 py-1 flex-shrink-0"
        @click="expandOther"
      >
        {{ otherExpanded ? 'hide' : 'expand' }} other
      </button>
      <DownloadReportData
        :data="data"
        figureRef="mutations_by_lineage"
        dataType="Mutation by Lineage"
        class="mt-3"
      />
    </div>

    <!-- TOOLTIPS -->
    <div
      id="tooltip-by-lineage"
      ref="tooltip_by_lineage"
      class="tooltip-basic box-shadow px-2"
    >
      <h5 id="lineage" />
      <p id="proportion" class="font-size-2 p-0 m-0" />
      <p id="counts" class="text-muted p-0 m-0" />

      <div
        id="other_data"
        class="d-flex flex-wrap flex-column justify-content-between"
      >
        <div v-for="(other, oIdx) in otherDataArr" :key="oIdx" class="mb-1">
          <small class="w-100 d-flex justify-content-between">
            <span>
              <b class="text-underline">{{ other.pangolin_lineage }}</b>
              :
              <span class="text-muted text-right">
                ({{ numberWithCommas(other.mutation_count) }} /
                {{ numberWithCommas(other.lineage_count) }})
              </span>
            </span>
            <b>{{ other.proportion_formatted }}</b>
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLinear, scaleBand } from 'd3-scale';
import { selectAll, select, event } from 'd3-selection';
import cloneDeep from 'lodash/cloneDeep';

import { lazyLoad } from '@/js/lazy-load';

const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  title: String,
  subtitle: String,
  lineage: String,
  mutationName: String,
  routeTo: String,
  margin: {
    type: Object,
    default: () => {
      return {
        left: 80,
        right: 30,
        top: 10,
        bottom: 25,
      };
    },
  },
  width: {
    type: Number,
    default: 450,
  },
  fill: {
    type: String,
    default: '#f2b6e2',
  },
  n: {
    type: Number,
    default: 5,
  },
});

// this.$router
const router = useRouter();
// this.$route
const route = useRoute();

const numXTicks = ref(4);
const bandwidth = ref(25);
const height = ref(null);
// refs
const svg = ref(null);
// axes
const x = ref(null);
const y = ref(null);
const xAxis = ref(null);
const yAxis = ref(null);
const otherDataArr = ref([]);
const otherExpanded = ref(false);
// variables to replace this.$refs
const tooltip_by_lineage = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);
const horizontal_bargraph = ref(null);
// missing variable in previous version
const processedData = ref(null);

const handleLineageClick = (lineage) => {
  const queryParams = route.query;

  if (props.routeTo === 'GenomicsEmbedVariant') {
    router.push({
      // name: routePath, //TODO: should check where routePath is from
      name: props.routeTo,
      query: {
        pango: lineage,
        selected: queryParams.selected,
        loc: queryParams.loc,
      },
    });
  } else {
    router.push({
      // name: routePath, //TODO: should check where routePath is from
      name: props.routeTo,
      query: {
        type: 'var',
        pango: lineage,
        selected: queryParams.selected,
        loc: queryParams.loc,
      },
    });
  }
};

const expandOther = () => {
  if (otherExpanded.value) {
    preprocessData();
    updatePlot();
  } else {
    processedData.value = cloneDeep(props.data).sort((a, b) => {
      return b.proportion - a.proportion;
    });
    updatePlot();
  }
  otherExpanded.value = !otherExpanded.value;
};

const preprocessData = () => {
  const sortedData = cloneDeep(props.data).sort((a, b) => {
    return b.proportion - a.proportion;
  });

  if (sortedData.length > 10) {
    processedData.value = sortedData.slice(0, 10);
    otherDataArr.value = sortedData.slice(10);

    const otherData = otherDataArr.value.reduce((x, y) => {
      return {
        lineage_count: x.lineage_count + y.lineage_count,
        mutation_count: x.mutation_count + y.mutation_count,
      };
    });
    processedData.value.push({
      pangolin_lineage: 'other',
      proportion: otherData.mutation_count / otherData.lineage_count,
      lineage_count: otherData.lineage_count,
      mutation_count: otherData.mutation_count,
    });
  }
};

const setupPlot = () => {
  svg.value = select(horizontal_bargraph.value);
  preprocessData();
};

const updatePlot = () => {
  updateAxes();
  drawBars();
};

const updateAxes = () => {
  const paddingInner = 0.25;
  height.value =
    processedData.value.length * bandwidth.value +
    (processedData.value.length - 1) * bandwidth.value * paddingInner +
    props.margin.top +
    props.margin.bottom;

  x.value = scaleLinear()
    .range([0, props.width - props.margin.right - props.margin.left])
    .domain([
      0,
      min([max(processedData.value.map((d) => d.proportion)) + 0.1, 1]),
    ]);

  y.value = scaleBand()
    .paddingInner(paddingInner)
    .range([0, height.value - props.margin.top - props.margin.bottom])
    .domain(processedData.value.map((d) => d.pangolin_lineage));

  yAxis.value = axisLeft(y.value).tickSizeOuter(0);

  xAxis.value = axisBottom(x.value)
    .ticks(numXTicks.value)
    .tickFormat(format('.0%'));

  select(yAxisRef.value).call(yAxis.value);
  select(xAxisRef.value).call(xAxis.value);
};

const tooltipOn = (d) => {
  const ttip = select(tooltip_by_lineage.value);
  const ttipShift = 20;

  // update text
  ttip.select('#lineage').text(d.pangolin_lineage);
  ttip
    .select('#proportion')
    .html(`<b>${d.proportion_formatted}</b> ${props.mutationName}`);
  ttip
    .select('#counts')
    .text(
      `(${format(',')(d.mutation_count)} / ${format(',')(d.lineage_count)})`,
    );

  selectAll('.rect-by-lineage').style('opacity', 0.3);

  selectAll('.lineage-annotation').style('opacity', 0.3);

  selectAll(`#${d.pangolin_lineage.replace(/\./g, '_')}`).style('opacity', 1);

  if (d.pangolin_lineage !== 'other') {
    ttip.select('#other_data').classed('hidden', true);
    ttip.select('#lineage').text(d.pangolin_lineage);
    ttip
      .select('#proportion')
      .html(`<b>${d.proportion_formatted}</b> ${props.mutationName}`);
    ttip
      .select('#counts')
      .text(
        `(${format(',')(d.mutation_count)} / ${format(',')(d.lineage_count)})`,
      );
  } else {
    ttip.select('#other_data').classed('hidden', false);
    ttip.select('#proportion').html('');
    ttip.select('#counts').text('');
  }

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipYAxisOn = (value) => {
  const d = processedData.value.filter((d) => d.pangolin_lineage === value);
  const ttip = select(tooltip_by_lineage.value);
  const ttipShift = 20;

  // update text
  selectAll('.rect-by-lineage').style('opacity', 0.3);

  selectAll('.lineage-annotation').style('opacity', 0.3);

  ttip.select('#lineage').text(value);

  if (d.length === 1 && value !== 'other') {
    ttip.select('#other_data').classed('hidden', true);
    ttip
      .select('#proportion')
      .html(`<b>${d[0].proportion_formatted}</b> ${props.mutationName}`);
    ttip
      .select('#counts')
      .text(
        `(${format(',')(d[0].mutation_count)} / ${format(',')(
          d[0].lineage_count,
        )})`,
      );

    selectAll(`#${d[0].pangolin_lineage.replace(/\./g, '_')}`).style(
      'opacity',
      1,
    );
  } else {
    ttip.select('#other_data').classed('hidden', false);
    ttip.select('#proportion').html('');
    ttip.select('#counts').text('');
  }

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOff = () => {
  select(tooltip_by_lineage.value).style('display', 'none');

  selectAll('.rect-by-lineage').style('opacity', 1);

  selectAll('.lineage-annotation').style('opacity', 1);
};

const drawBars = () => {
  const rectSelector = svg.value
    .selectAll('.rect-by-lineage')
    .data(processedData.value, (d) => d.pangolin_lineage);

  rectSelector.join(
    (enter) => {
      enter
        .append('rect')
        .attr('id', (d) => d.pangolin_lineage.replace(/\./g, '_'))
        .attr('class', 'rect-by-lineage')
        .attr('x', (d) => x.value(0))
        .attr('y', (d) => y.value(d.pangolin_lineage))
        .attr('height', (d) => y.value.bandwidth())
        .style('fill', (d) =>
          d.pangolin_lineage === props.lineage ? '#df4ab7' : props.fill,
        )
        .attr('width', (d) => x.value(d.proportion) - x.value(0));
    },
    (update) => {
      update
        .attr('x', (d) => x.value(0))
        .attr('id', (d) => d.pangolin_lineage.replace(/\./g, '_'))
        .transition()
        .duration(250)
        .attr('width', (d) => x.value(d.proportion) - x.value(0))
        .attr('y', (d) => y.value(d.pangolin_lineage))
        .attr('height', (d) => y.value.bandwidth());
    },
    (exit) => {
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      );
    },
  );

  const textSelector = svg.value
    .selectAll('.lineage-annotation')
    .data(processedData.value, (d) => d.pangolin_lineage);

  const textThresh = 25;

  textSelector.join(
    (enter) => {
      enter
        .append('text')
        .attr('class', (d) => 'lineage-annotation')
        .attr('id', (d) => d.pangolin_lineage.replace(/\./g, '_'))
        .attr('x', (d) => x.value(d.proportion))
        .attr('dx', (d) => (x.value(d.proportion) > textThresh ? -5 : 5))
        .attr('y', (d) => y.value(d.pangolin_lineage) + y.value.bandwidth() / 2)
        .text((d) => d.proportion_formatted)
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('text-anchor', (d) =>
          x.value(d.proportion) > textThresh ? 'end' : 'start',
        )
        .style('dominant-baseline', 'central')
        .style('font-size', '12px');
    },
    (update) => {
      update
        .attr('id', (d) => d.pangolin_lineage.replace(/\./g, '_'))
        .style('text-anchor', (d) =>
          x.value(d.proportion) > textThresh ? 'end' : 'start',
        )
        .text((d) => d.proportion_formatted)
        .transition()
        .duration(250)
        .attr('x', (d) => x.value(d.proportion))
        .attr('dx', (d) => (x.value(d.proportion) > textThresh ? -5 : 5))
        .attr(
          'y',
          (d) => y.value(d.pangolin_lineage) + y.value.bandwidth() / 2,
        );
    },
    (exit) => {
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      );
    },
  );

  // event listener for tooltips
  svg.value
    .selectAll('.rect-by-lineage')
    .on('mousemove', (d) => tooltipOn(d))
    .on('mouseleave', () => tooltipOff());

  // event listener for click event
  select(yAxisRef.value)
    .selectAll('text')
    .on('mousemove', (d) => tooltipYAxisOn(d))
    .on('mouseleave', () => tooltipOff())
    .on('click', (d) => handleLineageClick(d));
};

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

watch(
  () => props.data,
  () => {
    setupPlot();
    updatePlot();
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
.horizontal-bargraph-x,
.horizontal-bargraph-y {
  font-size: 16px;
}
.small {
  font-size: small;
}
</style>
