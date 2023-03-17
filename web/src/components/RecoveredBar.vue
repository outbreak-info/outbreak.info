<template>
  <div class="recovered-bar-plot">
    <svg class="recovered-bars" :width="width + 6" :height="height + 6">
      <g transform="translate(3,3)">
        <rect
          :width="width"
          :height="height"
          :x="0"
          :y="0"
          class="total-cases"
        ></rect>
        <rect
          :width="recoveredWidth"
          :height="height"
          :x="0"
          :y="0"
          class="recovered-cases"
        ></rect>
        <rect
          :width="deadWidth"
          :height="height"
          :x="width - deadWidth"
          :y="0"
          class="dead-cases"
        ></rect>
        <rect
          :width="width"
          :height="height"
          :x="0"
          :y="0"
          class="total-cases-outline"
        ></rect>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { scaleLinear } from 'd3-scale';

const props = defineProps({
  data: Object,
  color: String,
});

const width = ref(50);
const height = ref(15);
const x = ref(null);

const recoveredWidth = computed(() => {
  if (x.value) {
    return x.value(props.data.recovered);
  }
  return null;
});

const deadWidth = computed(() => {
  if (x.value) {
    return x.value(props.data.dead);
  }
  return null;
});

const updateAxes = () => {
  x.value = scaleLinear()
    .range([0, width.value])
    .domain([0, props.data.confirmed]);
};

watch(
  () => props.data,
  () => {
    updateAxes();
  },
  { deep: true },
);

onMounted(() => {
  updateAxes();
});
</script>

<style lang="scss">
.total-cases {
  fill: $grey-40;
}

.total-cases-outline {
  fill: none;
  stroke: $base-grey;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}

.dead-cases {
  fill: #5a5a5a;
}

.recovered-cases {
  fill: $link-color;
}
</style>
