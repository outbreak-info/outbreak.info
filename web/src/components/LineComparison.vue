<template>
  <div>
    <small class="d-block">Average daily {{ label }}</small>
    <small class="d-block text-muted annotation">per 100,000 residents</small>
    <svg :width="width" :height="height" class="comparison-svg">
      <g
        ref="svgRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
      ></g>
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { max } from 'd3-array';
import { format } from 'd3-format';
import { forceY, forceCollide, forceSimulation } from 'd3-force';
import { scaleTime, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import debounce from 'lodash/debounce';

const props = defineProps({
  data: Array,
  control: Array,
  xDomain: Array,
  yMax: Number,
  variable: String,
  label: String,
  colorScale: Function,
});

const margin = ref({
  top: 8,
  right: 35,
  bottom: 5,
  left: 5,
});
const width = ref(150);
const height = ref(75);
// refs
const svg = ref(null);
// variables to replace this.$refs
const svgRef = ref(null);
// methods
const x = ref(scaleTime());
const y = ref(scaleLinear());
const lineF = ref(null); // renamed as lineF; already exist line function in d3 -> avoid duplicated name

const setupPlot = () => {
  svg.value = select(svgRef.value);
  lineF.value = line()
    .x((d) => x.value(d.date))
    .y((d) => y.value(d[props.variable]));
};

const updateScales = () => {
  x.value = x.value
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain(props.xDomain);

  y.value = y.value
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .domain([0, props.yMax]);
};

const updatePlot = () => {
  updateScales();

  const controlSelector = svg.value
    .selectAll('.control-line')
    .data([props.control]);

  controlSelector.join(
    (enter) => {
      enter
        .append('path')
        .attr('class', (d) => `control-line`)
        .attr('stroke', '#bababa')
        .style('fill', 'none')
        .style('stroke-width', '3')
        .style('opacity', 0.6)
        .datum((d) => d)
        .attr('d', lineF.value);
    },
    (update) => {
      update.datum((d) => d).attr('d', lineF.value);
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  // max data point
  const maxVal = max(props.data, (d) => d[props.variable]);
  // slice -1 to make sure if there are duplicate values, return the latest one.
  const maxObj = props.data
    .filter((d) => d[props.variable] === maxVal)
    .slice(-1);

  const maxSelector = svg.value.selectAll('.max-value').data(maxObj);

  maxSelector.join(
    (enter) => {
      const grp = enter
        .append('g')
        .attr('fill', (d) => props.colorScale(d.location_id))
        .attr('id', (d) => `${d.location_id}-${props.variable}-maxValue`)
        .attr('class', 'max-value');

      grp
        .append('line')
        .style('stroke', '#2c3e50')
        .style('stroke-dasharray', (d) =>
          width.value -
            margin.value.left -
            margin.value.right -
            x.value(d.date) >
          30
            ? '3,3'
            : '0',
        )
        .attr('x1', (d) => x.value(d.date))
        .attr('x2', width.value - margin.value.left - margin.value.right + 3.5)
        .attr('y1', (d) => y.value(d[props.variable]))
        .attr('y2', (d) => y.value(d[props.variable]));
    },
    (update) => {
      update
        .attr('fill', (d) => props.colorScale(d.location_id))
        .attr('id', (d) => `${d.location_id}-${props.variable}-mostRecent`);

      update
        .select('line')
        .style('stroke-dasharray', (d) =>
          width.value -
            margin.value.left -
            margin.value.right -
            x.value(d.date) >
          30
            ? '3,3'
            : '0',
        )
        .attr('x1', (d) => x.value(d.date))
        .attr('x2', width.value - margin.value.left - margin.value.right + 3.5)
        .attr('y1', (d) => y.value(d[props.variable]))
        .attr('y2', (d) => y.value(d[props.variable]));
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  // region trace
  const lineSelector = svg.value.selectAll('.epi-line').data([props.data]);

  lineSelector.join(
    (enter) => {
      enter
        .append('path')
        .attr('class', (d) => `epi-line`)
        .attr('id', (d) => `${d[0].location_id}-${props.variable}`)
        .attr('stroke', (d) => props.colorScale(d[0].location_id))
        .style('fill', 'none')
        .style('stroke-width', '2')
        .datum((d) => d)
        .attr('d', lineF.value);
    },
    (update) => {
      update
        .attr('id', (d) => `${d[0].location_id}-${props.variable}`)
        .attr('stroke', (d) => props.colorScale(d[0].location_id))
        .datum((d) => d)
        .attr('d', lineF.value);
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  // last data point
  const mostRecent = props.data.slice(-1);
  const endSelector = svg.value.selectAll('.mostRecent').data(mostRecent);

  endSelector.join(
    (enter) => {
      const grp = enter
        .append('g')
        .attr('class', (d) => `mostRecent`)
        .attr('id', (d) => `${d.location_id}-${props.variable}-mostRecent`)
        .attr('fill', (d) => props.colorScale(d.location_id));

      grp
        .append('circle')
        .attr('r', 3)
        .attr('cx', (d) => x.value(d.date))
        .attr('cy', (d) => y.value(d[props.variable]));
    },
    (update) => {
      update
        .attr('fill', (d) => props.colorScale(d.location_id))
        .attr('id', (d) => `${d.location_id}-${props.variable}-mostRecent`)
        .select('circle')
        .attr('cx', (d) => x.value(d.date))
        .attr('cy', (d) => y.value(d[props.variable]));
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );

  // text annotations
  const textValues = mostRecent.concat(maxObj);

  // using force direction to make sure they don't overlap.
  // based off https://bl.ocks.org/wdickerson/bd654e61f536dcef3736f41e0ad87786
  const labelHeight = 13;
  // Create nodes of the text labels for force direction
  textValues.forEach((d) => {
    d['fx'] = 0;
    d['targetY'] = y.value(d[props.variable]);
  });

  // Define a custom force
  const forceClamp = (min, max) => {
    let nodes;
    const force = () => {
      nodes.forEach((n) => {
        if (n.y > max) n.y = max;
        if (n.y < min) n.y = min;
      });
    };
    force.initialize = (_) => (nodes = _);
    return force;
  };

  // Set up the force simulation
  const force = forceSimulation()
    .nodes(textValues)
    .force('collide', forceCollide(labelHeight / 2).strength(0.1))
    .force('y', forceY((d) => d.targetY).strength(1))
    .force(
      'clamp',
      forceClamp(0, height.value - margin.value.top - margin.value.bottom),
    )
    .stop();

  // Execute the simulation
  for (let i = 0; i < 300; i++) force.tick();

  const textSelector = svg.value.selectAll('.text-annotation').data(textValues);

  textSelector.join(
    (enter) => {
      enter
        .append('text')
        .attr('class', (d) => `text-annotation`)
        .attr('id', (d) => `${d.location_id}-${props.variable}-${d.date}`)
        .attr('fill', (d) => props.colorScale(d.location_id))
        .style('font-size', 12)
        .style('dominant-baseline', 'central')
        .attr('dx', 7)
        .attr('x', width.value - margin.value.left - margin.value.right)
        .attr('y', (d) => d.y)
        .text((d) => format(',.1f')(d[props.variable]));
    },
    (update) => {
      update
        .attr('x', width.value - margin.value.left - margin.value.right)
        .attr('y', (d) => d.y)
        .text((d) => format(',.1f')(d[props.variable]));
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );
};

const debounceUpdatePlot = debounce(updatePlot, 250);

watch(
  () => props.data,
  () => {
    debounceUpdatePlot();
  },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss" scoped>
.annotation {
  font-size: 0.7em;
  line-height: 1.1em;
}
</style>
