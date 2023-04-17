<template>
  <div ref="dotplot_container" :style="{ width: width + 'px' }">
    <h6 class="text-left m-0">
      {{ sortAsc ? 'Lowest' : 'Highest' }}
    </h6>
    <small class="text-left m-0 p-0 line-height-1 d-block text-wrap mb-2 mr-2">
      {{ title }}
    </small>
    <svg
      ref="dotplot_svg"
      :width="width"
      :height="height"
      class="epi-map-svg epi-map-dotplot dotplot-svg"
      :subtitle="fullTitle"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <line
          v-if="x && x(0) >= 0"
          :x1="x(0)"
          :x2="x(0)"
          :y1="0"
          :y2="height - margin.top - margin.bottom"
          stroke="black"
          stroke-width="0.5"
        />
        <g ref="circles" class="circles-group" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { select, selectAll } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { format } from 'd3-format';
import cloneDeep from 'lodash/cloneDeep';

const props = defineProps({
  data: Array,
  width: Number,
  varMax: Number,
  variable: String,
  title: String,
  sortAsc: Boolean,
  rightAlign: Boolean,
  colorScale: Function,
  transition1: Number,
  animate: Boolean,
});

const num2Plot = ref(5);
const height = ref(150);
const radius = ref(6);
// axes
const x = ref(null);
const y = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
// data
const plottedData = ref(null);
// variables to replace this.$refs
const dotplot_svg = ref(null);
const circles = ref(null);

const fullTitle = computed(() => {
  return props.sortAsc ? 'Lowest' : 'Highest';
});

const numberFormatter = computed(() => {
  return props.varMax <= 10 ? format(',.1f') : format(',.0f');
});

const domain = computed(() => {
  return props.rightAlign ? [-1 * props.varMax, 0] : [0, props.varMax];
});

const margin = computed(() => {
  const locationWidth = 75;
  const otherSideWidth = 45;
  return props.rightAlign
    ? {
        top: 0,
        right: locationWidth,
        bottom: 30,
        left: otherSideWidth,
      }
    : {
        top: 0,
        right: otherSideWidth,
        bottom: 30,
        left: locationWidth,
      };
});

const setupPlot = () => {
  svg.value = select(dotplot_svg.value);
  chart.value = select(circles.value);
};

const prepData = () => {
  // If there are undefined values, the sorting happens as strings, which is WRONG
  plottedData.value = cloneDeep(props.data.filter((d) => d[props.variable]));
  if (props.sortAsc) {
    plottedData.value.sort((a, b) => +a[props.variable] - +b[props.variable]);
    plottedData.value = plottedData.value.slice(0, num2Plot.value);
  } else {
    plottedData.value.sort((a, b) => +b[props.variable] - +a[props.variable]);
    plottedData.value = plottedData.value.slice(0, num2Plot.value);
  }
};

const updateAxes = () => {
  x.value = scaleLinear()
    .range([0, props.width - margin.value.left - margin.value.right])
    .domain(domain.value);

  y.value = scaleBand()
    .range([0, height.value - margin.value.top - margin.value.bottom])
    .domain(plottedData.value.map((d) => d.location_id));
};

const mouseOn = (d) => {
  selectAll('path.region').style('fill-opacity', 0.25);
  selectAll('.circle-most-change').style('fill-opacity', 0.5);
  selectAll('.line-most-change').style('fill-opacity', 0.5);
  selectAll('.annotation-most-change').style('fill-opacity', 0.5);
  selectAll('.location-most-change').style('fill-opacity', 0.5);
  selectAll('path.state').style('stroke-opacity', 0.75);
  select(`path#${d.location_id}`)
    .style('stroke', 'black')
    .style('stroke-width', 2);
  selectAll(`#${d.location_id}`).style('fill-opacity', 1);
  selectAll(`.${d.location_id}`).style('fill-opacity', 1);
};

const mouseOut = () => {
  selectAll('path.region')
    .style('fill-opacity', 1)
    .style('stroke', '#8aa4be')
    .style('stroke-width', 0.25);
  selectAll('path.state').style('stroke-opacity', 1);
  selectAll('.circle-most-change').style('fill-opacity', 1);
  selectAll('.line-most-change').style('fill-opacity', 1);
  selectAll('.annotation-most-change').style('fill-opacity', 1);
  selectAll('.location-most-change').style('fill-opacity', 1);
};

const drawPlot = () => {
  prepData();
  updateAxes();

  const lolliSelector = chart.value
    .selectAll('.lollipop')
    .data(plottedData.value, (d) => d.location_id);

  lolliSelector.join(
    (enter) =>
      enter
        .append('line')
        .attr('class', (d) => `lollipop line-most-change ${d.location_id}`)
        .attr('id', (d) => `lollipop-change-${d._id}`)
        .attr('x1', (d) => x.value(0))
        .attr('x2', (d) => x.value(d[props.variable]))
        .attr('y1', (d) => y.value(d.location_id) + y.value.bandwidth() / 2)
        .attr('y2', (d) => y.value(d.location_id) + y.value.bandwidth() / 2)
        .style('stroke', '#2c3e50')
        .style('stroke-width', 0.75),

    (update) =>
      update
        .attr('id', (d) => `lollipop-change-${d._id}`)
        .attr('class', (d) => `lollipop line-most-change ${d.location_id}`)
        .call((update) => {
          if (props.animate) {
            update
              .transition()
              .duration(props.transition1)
              .attr(
                'y1',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr(
                'y2',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr('x2', (d) => x.value(d[props.variable]));
          } else {
            update
              .attr(
                'y1',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr(
                'y2',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr('x2', (d) => x.value(d[props.variable]));
          }
        }),
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  const circleSelector = chart.value
    .selectAll('circle')
    .data(plottedData.value, (d) => d.location_id);

  circleSelector.join(
    (enter) =>
      enter
        .append('circle')
        .attr('class', (d) => `circle-most-change ${d.location_id}`)
        .attr('id', (d) => `circle-change-${d._id}`)
        .attr('cx', (d) => x.value(d[props.variable]))
        .attr('cy', (d) => y.value(d.location_id) + y.value.bandwidth() / 2)
        .attr('r', radius.value)
        .style('fill', (d) => props.colorScale(d[props.variable]))
        .style('stroke', '#2c3e50')
        .style('stroke-width', 0.5)
        .on('mouseenter', (d) => mouseOn(d))
        .on('mouseleave', mouseOut),

    (update) =>
      update
        .attr('id', (d) => `circle-change-${d._id}`)
        .attr('class', (d) => `circle-most-change ${d.location_id}`)
        .call((update) => {
          if (props.animate) {
            update
              .transition()
              .duration(props.transition1)
              .style('fill', (d) => props.colorScale(d[props.variable]))
              .attr('cx', (d) => x.value(d[props.variable]))
              .attr(
                'cy',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              );
          } else {
            update
              .style('fill', (d) => props.colorScale(d[props.variable]))
              .attr('cx', (d) => x.value(d[props.variable]))
              .attr(
                'cy',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              );
          }
        }),

    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  const yAxSelector = chart.value
    .selectAll('.y-axis')
    .data(plottedData.value, (d) => d.location_id);

  // Lazy trunction of too long names
  const trimText = (text, threshold) => {
    if (text.length <= threshold) return text;
    return text.substr(0, threshold).concat('...');
  };

  const locationNameThresh = 8;

  yAxSelector.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', (d) => `location-most-change ${d.location_id} y-axis`)
        .attr('id', (d) => `location-change-${d._id}`)
        .attr('x', (d) => x.value(0))
        .attr('dx', (d) =>
          d.rightAlign ? radius.value * 1.5 : -1.5 * radius.value,
        )
        .attr('y', (d) => y.value(d.location_id) + y.value.bandwidth() / 2)
        .text((d) =>
          d.admin1
            ? `${trimText(d.name.replace(' County', ''), locationNameThresh)}`
            : trimText(d.name, locationNameThresh),
        )
        .style('text-anchor', (d) => (d.rightAlign ? 'start' : 'end'))
        .style('dominant-baseline', 'middle')
        .style('font-size', '0.75em')
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('fill', '#2c3e50')
        .on('mouseenter', (d) => mouseOn(d))
        .on('mouseleave', mouseOut),

    (update) =>
      update
        .attr('id', (d) => `location-change-${d._id}`)
        .attr('class', (d) => `location-most-change ${d.location_id} y-axis`)
        .text((d) =>
          d.admin1
            ? `${trimText(d.name.replace(' County', ''), locationNameThresh)}`
            : trimText(d.name, locationNameThresh),
        )
        .call((update) => {
          if (props.animate) {
            update
              .transition()
              .duration(props.transition1)
              .attr(
                'y',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              );
          } else {
            update.attr(
              'y',
              (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
            );
          }
        }),
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  const annotationSelector = chart.value
    .selectAll('.annotation-most-change')
    .data(plottedData.value, (d) => d.location_id);

  annotationSelector.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', (d) => `annotation-most-change ${d.location_id}`)
        .attr('id', (d) => `annotation-change-${d._id}`)
        .attr('x', (d) => x.value(d[props.variable]))
        .attr('dx', (d) => (d.rightAlign ? -10 : 10))
        .attr('y', (d) => y.value(d.location_id) + y.value.bandwidth() / 2)
        .text((d) => numberFormatter.value(d[props.variable]))
        .style('dominant-baseline', 'central')
        .style('text-anchor', (d) => (d.rightAlign ? 'end' : 'start'))
        .style('font-size', '0.65em')
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('fill', '#2c3e50'),

    (update) =>
      update
        .attr('id', (d) => `annotation-change-${d._id}`)
        .attr('class', (d) => `annotation-most-change ${d.location_id}`)
        .text((d) => numberFormatter.value(d[props.variable]))
        .call((update) => {
          if (props.animate) {
            update
              .transition()
              .duration(props.transition1)
              .attr(
                'y',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr('x', (d) => x.value(d[props.variable]));
          } else {
            update
              .attr(
                'y',
                (d) => y.value(d.location_id) + y.value.bandwidth() / 2,
              )
              .attr('x', (d) => x.value(d[props.variable]));
          }
        }),

    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );
};

watch(
  () => props.data,
  () => {
    drawPlot();
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  drawPlot();
});
</script>
