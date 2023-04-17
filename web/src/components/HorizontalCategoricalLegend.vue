<template>
  <div class="d-flex flex-wrap">
    <svg
      v-for="(value, vIdx) in legendValues"
      :key="vIdx"
      :width="82"
      :height="legendRectWidth + 2"
      class="categorical-legend mr-2 mb-2"
    >
      <rect
        :width="legendRectWidth"
        :height="legendRectWidth"
        :fill="value.fill"
      />
      <text
        x="0"
        :y="legendRectWidth / 2"
        :dx="legendRectWidth + 5"
        style="dominant-baseline: central"
      >
        {{ value.label }}
      </text>
    </svg>
    <svg :height="legendRectWidth + 2" class="categorical-legend mr-2 mb-2">
      <defs>
        <pattern
          id="diagonalHatchLight"
          width="7"
          height="7"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <rect x="-2" y="-2" width="10" height="10" fill="#efefef" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="25"
            :style="`stroke:#CCC; stroke-width:4`"
          />
        </pattern>
      </defs>

      <rect
        :width="legendRectWidth"
        :height="legendRectWidth"
        fill="url(#diagonalHatchLight)"
      />
      <rect
        :width="legendRectWidth"
        :height="legendRectWidth"
        stroke="#555"
        stroke-width="0.5"
        fill="none"
      />
      <text
        x="0"
        :y="legendRectWidth / 2"
        :dx="legendRectWidth + 5"
        style="dominant-baseline: central"
      >
        No data
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  values: Array,
  colorScale: Function,
  legendRectWidth: {
    type: Number,
    default: 15,
  },
});

const legendValues = computed(() => {
  if (props.colorScale) {
    return props.values.map((d) => {
      return {
        fill: props.colorScale(d),
        label: d,
      };
    });
  } else {
    return null;
  }
});
</script>
