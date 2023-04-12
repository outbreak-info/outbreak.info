<template>
  <div id="dateSlider" class="d-flex flex-column">
    {{ formattedDate }}
    <div class="d-flex align-items-start">
      <div class="d-flex">
        <div
          class="btn btn-main-outline px-2 py-1"
          style="font-size: 0.85em"
          :class="{ disabled: hideBack7 }"
          @click="changeDate(-7)"
        >
          <font-awesome-icon :icon="['fas', 'fast-backward']" />
        </div>
        <div
          class="btn btn-main-outline ml-1 px-2 py-1 d-flex align-items-center"
          style="font-size: 0.7em"
          :class="{ disabled: hideBack1 }"
          @click="changeDate(-1)"
        >
          <font-awesome-icon :icon="['fas', 'step-backward']" />
        </div>
      </div>
      <svg
        :width="width + margin.left + margin.bottom"
        :height="height + radius + margin.bottom + margin.top"
        class="mr-3 ml-3"
      >
        <rect
          id="slider"
          x="0"
          y="0"
          :width="width + margin.left + margin.right"
          :height="height"
          :transform="`translate(0, ${radius})`"
        />
        <circle
          id="slider-date"
          ref="drag_circle"
          fill="#D13B62"
          :transform="`translate(${margin.left}, ${height / 2 + radius})`"
          :cx="xDate"
          :cy="0"
          :r="radius"
        />
        <g
          ref="xAxisRef"
          :transform="`translate(${margin.left}, ${height + margin.top})`"
          class="slider-axis axis--x"
        />
      </svg>
      <div class="d-flex">
        <div
          class="btn btn-main-outline mr-1 px-2 py-1 d-flex align-items-center"
          :class="{ disabled: hideForward1 }"
          style="font-size: 0.7em"
          @click="changeDate(1)"
        >
          <font-awesome-icon :icon="['fas', 'step-forward']" />
        </div>
        <div
          class="btn btn-main-outline px-2 py-1"
          style="font-size: 0.85em"
          :class="{ disabled: hideForward7 }"
          @click="changeDate(7)"
        >
          <font-awesome-icon :icon="['fas', 'fast-forward']" />
        </div>
      </div>

      <div
        class="btn btn-main-outline px-2 py-1 ml-2"
        style="font-size: 0.85em"
        @click="play()"
      >
        <font-awesome-icon v-if="isPlaying" :icon="['fas', 'pause']" />
        <font-awesome-icon v-else :icon="['fas', 'play']" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// can import gtag event only, but already event from d3-selection
import * as gtag from 'vue-gtag';
import { axisBottom } from 'd3-axis';
import { drag } from 'd3-drag';
import { timeParse, timeFormat } from 'd3-time-format';
import { select, event } from 'd3-selection';
import { timeDay } from 'd3-time';
import { scaleTime } from 'd3-scale';

const props = defineProps({
  min: Date,
  max: Date,
  date: String,
  adminLevel: String,
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const width = ref(150);
const margin = ref({
  left: 10,
  right: 10,
  top: 10,
  bottom: 20,
});
const height = ref(6);
const radius = ref(7);
const selectedDate = ref(null);
const minDate = ref(new Date('2020-01-22 0:0'));
const xDate = ref(null);
const x = ref(null);
const xAxis = ref(null);
const isPlaying = ref(false);
// below variables to replace this.$refs
const drag_circle = ref(null);
const xAxisRef = ref(null);

const hideBack7 = computed(() => {
  return (selectedDate.value - minDate.value) / (1000 * 60 * 60 * 24) < 7;
});

const hideBack1 = computed(() => {
  return (selectedDate.value - minDate.value) / (1000 * 60 * 60 * 24) < 1;
});

const hideForward7 = computed(() => {
  return (props.max - selectedDate.value) / (1000 * 60 * 60 * 24) < 7;
});

const hideForward1 = computed(() => {
  return (props.max - selectedDate.value) / (1000 * 60 * 60 * 24) < 1;
});

const formattedDate = computed(() => {
  return formatDate(selectedDate.value, '%d %B %Y');
});

const play = () => {
  isPlaying.value = !isPlaying.value;

  const dayGap = props.adminLevel === '0' || props.adminLevel === '1' ? 3 : 7; // parameter for how many days between

  if ((props.max - selectedDate.value) / (1000 * 60 * 60 * 24) < dayGap) {
    selectedDate.value = minDate.value;
  }

  if (isPlaying.value) {
    gtag.event('map_play', {
      event_category: `map_play`,
      event_label: `playing map starting from [${route.fullPath}])`,
    });

    start(dayGap);
  }
};

const start = (dayGap) => {
  if (
    timeDay.offset(selectedDate.value, dayGap) <= props.max &&
    isPlaying.value
  ) {
    setTimeout(() => {
      changeDate(dayGap, false);
      start(dayGap);
    }, 500);
  } else {
    isPlaying.value = false;
  }
};

const changeDate = (dayShift, animate = true) => {
  selectedDate.value = timeDay.offset(selectedDate.value, dayShift);
  // update dot position
  select(drag_circle.value).attr('cx', x.value(selectedDate.value));

  const routeObj = route.query;
  router.replace({
    path: 'maps',
    name: 'Maps',
    state: {
      disableScroll: true,
    },
    query: {
      location: routeObj.location,
      admin_level: routeObj.admin_level,
      variable: routeObj.variable,
      date: formatDate(selectedDate.value),
      min: routeObj.min,
      max: routeObj.max,
      animate: animate,
    },
  });
};

const parseDate = (dateStr, format = '%Y-%m-%d') => {
  return timeParse(format)(dateStr);
};

const formatDate = (dateNum, format = '%Y-%m-%d') => {
  return timeFormat(format)(dateNum);
};

const setupDrag = () => {
  select('#slider-date').call(
    drag()
      // .on("start", this.dragstarted)
      .on('drag', dragged)
      .on('end', dragended),
  );
};

const dragCallback = () => {
  return (
    drag()
      // .on("start", this.dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  );
};

const dragged = (d) => {
  // update position of circle
  const newX = event.x < 0 ? 0 : event.x > width.value ? width.value : event.x;
  select(drag_circle.value).attr('cx', newX);
  // update date displayed
  selectedDate.value = x.value.invert(event.x);
};

const dragended = (d) => {
  selectedDate.value = x.value.invert(event.x);

  const routeObj = route.query;
  router.push({
    path: 'maps',
    query: {
      location: routeObj.location,
      admin_level: routeObj.admin_level,
      variable: routeObj.variable,
      date: formatDate(selectedDate.value),
      min: routeObj.min,
      max: routeObj.max,
    },
  });
};

const updateAxis = () => {
  x.value = scaleTime()
    .clamp(true)
    .range([0, width.value])
    .domain([props.min, props.max]);

  xAxis.value = axisBottom(x.value).ticks(2).tickSizeOuter(0);

  select(xAxisRef.value).call(xAxis.value);

  selectedDate.value = parseDate(props.date);

  // update dot position
  select(drag_circle.value).attr('cx', x.value(selectedDate.value));

  xDate.value = x.value(selectedDate.value);
};

onMounted(() => {
  updateAxis();
  setupDrag();
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#slider {
  fill: #bababa;
  rx: 3;
  ry: 3;
}

#slider-date {
  cursor: ew-resize;
}

.slider-axis path {
  display: none;
}
</style>
