<template>
  <div
    :id="`region-graphs-${id}`"
    ref="countryBars"
    class="country-bar-graph flex-column align-left"
  >
    <h4 class="plot-title">
      Current total COVID-19 {{ variable }} in
      <span class="region-name" @click="handleClick">{{ region }}</span>
    </h4>

    <svg
      :width="`${
        width +
        margin.left +
        margin.right +
        sparkWidth +
        newCasesWidth +
        4 * margin.gap
      }`"
      :height="`${height + margin.top + margin.bottom}`"
      class="region-country-counts"
    >
      <g
        id="case-counts"
        :transform="`translate(${margin.left},${margin.top})`"
      />
    </svg>

    <div class="btn-links">
      <!-- <router-link v-if="isOverflow" :to="{ name: '', params: {} }">view all countries</router-link>> -->

      <button
        class="btn-item click-affordance py-1"
        :style="{ background: lightColor }"
        @click="handleClick"
      >
        view cases over time
      </button>
      <button class="btn-item btn btn-main m-2" @click="closeWindow">
        <font-awesome-icon :icon="['far', 'window-close']" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  inject,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
  onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router';
import { axisRight } from 'd3-axis';
import { max, extent } from 'd3-array';
import { scaleLinear, scaleBand, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { area } from 'd3-shape';
import { transition } from 'd3-transition';

import { getCountryData } from '@/api/region-summary.js';
import { colorsStore } from '@/stores/colorsStore';

const props = defineProps({
  region: String,
  variable: String,
  id: Number,
});

// define emits - same as this.$emit
const emit = defineEmits(['regionSelected']);

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

// global router variable - equivalent with this.$router
const router = useRouter();

const store = colorsStore();

const width = ref(250);
const sparkWidth = ref(75);
const newCasesWidth = ref(45);
const margin = ref({
  top: 20,
  right: 100,
  bottom: 10,
  left: 100,
  gap: 10,
});
const innerPadding = ref(0.25);
const height = ref(0);
const data = ref(null);
const barHeight = ref(15);
const isOverflow = ref(false);
//axes
const x = ref(scaleLinear().range([250, 0]));
const y = ref(scaleBand().paddingInner(0.25));
const xSpark = ref(scaleTime().range([0, 75]));
const xAxis = ref(null);
const yAxis = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
// methods
const lineF = ref(null);
// missing variables in previous version
const changeDataSubscription = ref(null);
const dataSubscription = ref(null);

const lightColor = computed(() => {
  const scale = store.getRegionColor;
  return scale(props.region, 0.85);
});

dataSubscription.value = getCountryData(
  apiUrl,
  props.region,
  props.variable,
).subscribe((response) => {
  data.value = response;
});

const colorScale = (idx) => {
  const scale = store.getRegionColorPalette;
  return scale(props.region, data.value.length, idx);
};

const handleClick = () => {
  emit('regionSelected', {
    region: 'all',
  });

  router.push({
    path: 'epidemiology',
    query: {
      location: data.value.map((d) => d.location_id).join(';'),
    },
  });
};

const routeToLoc = (location_name) => {
  const location = data.value.filter((d) => d.name === location_name);
  const location_id = location ? location[0].location_id : null;

  if (location_id) {
    emit('regionSelected', {
      region: 'all',
    });

    router.push({
      path: 'epidemiology',
      query: {
        location: location_id,
      },
    });
  }
};

const clickClose = (evt) => {
  if (evt && evt.target) {
    const classID = evt.target.className.baseVal;
    if (
      !classID ||
      (classID !== 'region-country-counts' &&
        classID !== 'legend-name' &&
        !classID.includes('stacked-area-chart'))
    ) {
      closeWindow();
    }
  }
};

const closeWindow = () => {
  emit('regionSelected', {
    region: props.region,
    display: false,
    displayMore: false,
  });
};

const updateData = () => {
  changeDataSubscription.value = getCountryData(
    apiUrl,
    props.region,
    props.variable,
  ).subscribe((response) => {
    data.value = response;
  });
};

const getHeight = () => {
  const idealHeight =
    barHeight.value * data.value.length +
    (data.value.length - 2) * innerPadding.value;
  if (idealHeight > window.innerHeight * 0.8) {
    height.value = window.innerHeight * 0.8;
    const num2Plot = Math.floor(
      (height.value - 2 * innerPadding.value) /
        (barHeight.value + innerPadding.value),
    );
    data.value = data.value.slice(-num2Plot);
    isOverflow.value = true;
  } else {
    height.value = idealHeight;
  }
};

const updatePlot = () => {
  if (data.value) {
    getHeight();
    updateScales();
    prepData();
    drawPlot();
  }
};

const setupPlot = () => {
  svg.value = select(`#region-graphs-${props.id}`).select(
    'svg.region-country-counts',
  );
  chart.value = svg.value.select('#case-counts');

  svg.value
    .append('g')
    .attr('class', 'bar-axis axis--y')
    .attr(
      'transform',
      `translate(${
        margin.value.left + width.value + margin.value.right - 10
      }, ${margin.value.top})`,
    );

  lineF.value = area()
    .x((d) => xSpark.value(d.date))
    .y0((d) => d.y0)
    .y1((d) => d.y);
};

const prepData = () => {
  data.value.forEach((d) => {
    // renamed as yV since y is already declared
    const yV = scaleLinear()
      .range([y.value.bandwidth() * 0.8, 0])
      .domain([0, max(d.data.map((d) => d[props.variable]))]);

    d.data.forEach((datum) => {
      datum['y'] = yV(datum[props.variable]);
      datum['y0'] = yV(0);
    });
  });
};

const updateScales = () => {
  x.value = x.value.domain([0, max(data.value, (d) => d[props.variable])]);

  y.value = y.value
    .range([height.value, 0])
    .domain(data.value.map((d) => d.name));

  xSpark.value = xSpark.value.domain(
    extent(data.value.flatMap((d) => d.data).map((d) => d.date)),
  );

  yAxis.value = axisRight(y.value);

  svg.value.select('.axis--y').call(yAxis.value);
  svg.value
    .select('.axis--y')
    .selectAll('text')
    .on('click', (d) => routeToLoc(d));
};

const drawPlot = () => {
  const t1 = transition().duration(1000);

  // --- group ---
  const grpSelector = chart.value
    .selectAll('.country-count-group')
    .data(data.value);

  // exit
  grpSelector.exit().remove();

  // enter
  const grpEnter = grpSelector
    .enter()
    .append('g')
    .attr('class', 'country-count-group');

  // merge
  grpSelector
    .merge(grpEnter)
    .attr('id', (d) => `${d.name}`)
    // .attr("class", d => `${this.region}`)
    .style('fill', (d, i) => colorScale(i))
    .style('stroke', (d, i) => colorScale(i));

  // --- bars ---
  const barSelector = grpSelector.select('.country-count');
  barSelector.exit().remove();

  const barEnter = grpEnter.append('rect').attr('class', 'country-count');

  // merge
  barSelector
    .merge(barEnter)
    // .attr("width", 0)
    .attr('height', y.value.bandwidth())
    .attr('y', (d) => y.value(d.name))
    .style('fill', (d, i) => colorScale(i))
    // .attr("x", d => this.x(0))
    // .transition(t1)
    .attr('width', (d) => x.value(0) - x.value(d[props.variable]))
    .attr('x', (d) => x.value(d[props.variable]));

  // --- text ---
  const textSelector = grpSelector.select('.annotation--country-count');

  textSelector.exit().remove();

  const textEnter = grpEnter
    .append('text')
    .attr('class', 'annotation--country-count');

  // merge
  textSelector
    .merge(textEnter)
    .attr('x', (d) => x.value(d[props.variable]))
    .attr('dx', '-0.5em')
    .attr('y', (d) => y.value(d.name) + y.value.bandwidth() / 2)
    .style('font-size', y.value.bandwidth())
    .text((d) => (d[props.variable] ? d[props.variable].toLocaleString() : ''));

  // --- sparklines ---
  chart.value
    .append('text')
    .attr('class', 'subtitle')
    .attr(
      'x',
      width.value +
        margin.value.gap +
        margin.value.right +
        sparkWidth.value / 2,
    )
    .attr('y', -5)
    .text('over time');

  const sparkSelector = grpSelector.select('.sparkline');

  const sparkEnter = grpEnter
    .append('path')
    .attr(
      'transform',
      (d) =>
        `translate(${
          width.value + margin.value.gap + margin.value.right
        }, ${y.value(d.name)})`,
    )
    .attr('class', 'sparkline');

  // merge
  sparkSelector
    .merge(sparkEnter)
    .datum((d) => d.data)
    .join('path')
    .attr('d', lineF.value);

  // --- number of new cases ---
  chart.value
    .append('text')
    .attr('class', 'subtitle')
    .attr(
      'x',
      width.value +
        margin.value.gap * 3 +
        margin.value.right +
        sparkWidth.value +
        newCasesWidth.value / 2,
    )
    .attr('y', -5)
    .text('new today');

  const newCasesSelector = grpSelector.select('.new-cases');

  newCasesSelector.exit().remove();

  const newCasesEnter = grpEnter
    .append('text')
    .attr(
      'transform',
      (d) =>
        `translate(${
          width.value +
          margin.value.gap * 3 +
          margin.value.right +
          sparkWidth.value
        }, ${0})`,
    )
    .attr('x', 5)
    .attr('y', (d) => y.value(d.name) + y.value.bandwidth() / 2)
    .attr('class', 'new-cases')
    .style('font-size', y.value.bandwidth());

  // merge
  newCasesSelector
    .merge(newCasesEnter)
    .text((d) =>
      d[`${props.variable}_numIncrease`]
        ? d[`${props.variable}_numIncrease`].toLocaleString()
        : '',
    );
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

watch(
  () => props.variable,
  () => {
    updateData();
  },
);

onMounted(() => {
  setupPlot();
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener(
      'click',
      () => {
        clickClose();
      },
      { passive: true },
    );

    document.addEventListener(
      'keyup',
      (evt) => {
        if (evt.keyCode === 27) {
          closeWindow();
        }
      },
      { passive: true },
    );
  });
});

onBeforeUnmount(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }

  if (changeDataSubscription.value) {
    changeDataSubscription.value.unsubscribe();
  }
});

onUnmounted(() => {
  window.removeEventListener('click', clickClose);
  document.removeEventListener('keyup', closeWindow);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.country-bar-graph .axis--y path,
.country-bar-graph .tick line {
  display: none;
}

.country-bar-graph .axis--y text {
  text-anchor: end;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.region-name {
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.bar-axis {
  font-size: 14px;
}

.annotation--country-count,
.new-cases {
  dominant-baseline: central;
  stroke: none;
  font-weight: 700 !important;
}

.annotation--country-count {
  text-anchor: end;
}

.sparkline {
  // stroke-width: 0.1;
  stroke: none;
  stroke-linecap: round;
}

.subtitle {
  text-anchor: middle;
  font-size: 0.7em;
  opacity: 0.7;
  dominant-baseline: ideographic;
}

rect.country-count {
  shape-rendering: crispedges;
}

.btn-item:first-child {
  margin-right: auto;
  margin-left: auto;
}
.btn-item:last-child {
  margin-left: auto;
}

.btn-links {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.btn-item {
  display: flex;
  margin: 1px;
  padding: 5px;
}
</style>
