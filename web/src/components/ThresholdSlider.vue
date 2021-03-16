<template>
<!-- MINIMUM THRESHOLD SLIDER -->
<svg ref="count_filter" id="count-filter" :width="width" :height="height" class="report-choropleth-legend my-2">
  <g transform="translate(10,8)" id="threshold-slider">
    <text x="0" y="0" dominant-baseline="central" :fill="strokeColor" font-size="14px">minimum number of total samples</text>
    <g transform="translate(0,18)">
      <line x1="0" :x2="filterWidth" y1="0" y2="0" stroke="#CCCCCC" stroke-linecap="round" stroke-width="8" />
      <line ref="selected_threshold" :x1="filterShift" :x2="filterWidth" y1="0" y2="0" :stroke="accentColor" stroke-linecap="round" stroke-width="8" />
      <circle ref="threshold_slider" :transform="`translate(${filterShift}, 0)`" cx="0" cy="0" r="8" :fill="accentColor" class="pointer" />
      <text ref="threshold_label" :transform="`translate(${filterShift}, 0)`" x="0" y="0" dy="12" font-size="14px" font-weight="700" :fill="accentColor" text-anchor="middle" dominant-baseline="hanging">{{newThreshold}}</text>
      <text :x="filterWidth" y="0" dy="12" font-size="12px" :fill="greyColor" text-anchor="end" dominant-baseline="hanging">{{maxCountFormatted}}</text>
    </g>
  </g>
</svg>
</template>

<script>
import {
  select,
  format,
  drag,
  event,
  scaleLog
} from "d3";

export default {
  name: "ThresholdSlider",
  props: {
    width: {
      type: Number,
      default: 235
    },
    filterWidth: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 50
    },
    accentColor: {
      type: String,
      default: "#df4ab7"
    },
    greyColor: {
      type: String,
      default: "#A5A5A5"
    },
    strokeColor: {
      type: String,
      default: "#2c3e50"
    },
    countThreshold: Number,
    maxCount: Number
  },
  computed: {
    filterShift() {
      return (this.xFilter ? this.xFilter(this.newThreshold) : 0)
    },
    maxCountFormatted() {
      return (this.maxCount ? format(",")(this.maxCount) : null)
    }
  },
  data() {
    return ({
      xFilter: null,
      newThreshold: null
    })
  },
  methods: {
    updateAxes() {
      this.xFilter = scaleLog()
        .range([0, this.filterWidth])
        .domain([1, this.maxCount])
        .clamp(true);
    },
    setupDrag() {
      // draggable filters
      select(this.$refs.threshold_slider)
        .call(drag()
          .on("drag", () => this.updateDrag())
          .on("end", () => this.changeFilters())
        )
    },
    updateDrag() {
      this.newThreshold = Math.round(this.xFilter.invert(event.x));
      select(this.$refs.threshold_label)
        .text(format(",")(this.newThreshold));
    },
    changeFilters() {
      this.$emit("update:countThreshold", this.newThreshold);
    }
  },
  mounted() {
    this.newThreshold = this.countThreshold;
    this.updateAxes();

    this.$nextTick(function() {
      // set up drag for threshold filter
      this.setupDrag();
    })
  }
}
</script>
