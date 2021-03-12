<template>
<div :class="{'d-flex' : horizontal}">
  <!-- CATEGORICAL LEGEND -->
  <div>
    <div class="text-muted">
      {{label}}
    </div>
    <div class="d-flex flex-wrap" v-if="colorScale">
      <svg :width="35" :height="rectWidth + 15" class="categorical-rect my-1" style="margin-right: 15px;">
        <g transform="translate(2,2)">
          <rect :width="rectWidth" :height="rectWidth" x="0" y="0" :fill="colorScale(0)" :stroke="strokeColor" stroke-width="1"></rect>
          <text :x="0" :y="rectWidth" dy="5" dominant-baseline="hanging" text-anchor="start" :fill="strokeColor" font-size="10px">0-{{colorDomain[1]*100}}</text>
        </g>
      </svg>

      <svg :width="35" :height="rectWidth + 15" v-for="(color, i) in colorDomain" :key="i" class="categorical-rect my-1" style="margin-right: 15px;">
        <g transform="translate(2,2)">
          <rect :width="rectWidth" :height="rectWidth" x="0" y="0" :fill="colorScale(color)" :stroke="strokeColor" stroke-width="1"></rect>
          <text :x="0" :y="rectWidth" dy="5" dominant-baseline="hanging" text-anchor="start" :fill="strokeColor" font-size="10px" v-if="i < colorDomain.length - 1">{{color*100}}-{{colorDomain[i+1]*100}}</text>
          <text :x="0" :y="rectWidth" dy="5" dominant-baseline="hanging" text-anchor="start" :fill="strokeColor" font-size="10px" v-if="i == colorDomain.length - 1">{{color*100}}-100%</text>
        </g>
      </svg>
    </div>
  </div>

  <!-- WEIRDO LEGEND -->
  <svg ref="count_filter" id="count-filter" :width="280" :height="67" class="report-choropleth-legend mx-3 my-2" role="legend" v-if="includeNulls">
    <defs>
      <pattern id="diagonalHatchLegend" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:${strokeColor}; stroke-width:1.75`" />
      </pattern>
    </defs>

    <g transform="translate(1,1)">
      <rect x="0" y="40" :width="rectWidth" :height="rectWidth" :fill="filteredColor" :stroke="strokeColor" stroke-width="1"></rect>
      <rect x="0" y="20" :width="rectWidth" :height="rectWidth" fill="url(#diagonalHatchLegend)" :stroke="strokeColor" stroke-width="1"></rect>
      <rect x="0" y="0" :width="rectWidth" :height="rectWidth" :fill="nullColor" :stroke="strokeColor" stroke-width="1"></rect>

      <text style='font-family:"DM Sans", Avenir, Helvetica, Arial, sans-serif;' x="22" y="40" dy="7" dominant-baseline="central" :fill="strokeColor" font-size="14px">sequenced &lt; {{countThreshold}} samples</text>
      <text style='font-family:"DM Sans", Avenir, Helvetica, Arial, sans-serif;' x="22" y="20" dy="7" dominant-baseline="central" :fill="strokeColor" font-size="14px">{{ mutationName }} not detected</text>
      <text style='font-family:"DM Sans", Avenir, Helvetica, Arial, sans-serif;' x="22" y="0" dy="7" dominant-baseline="central" :fill="strokeColor" font-size="14px">no sequencing</text>
    </g>
  </svg>

  <!-- MINIMUM THRESHOLD SLIDER -->
  <!-- <svg ref="count_filter" id="count-filter" :width="230" :height="legendHeight" class="report-choropleth-legend my-2">
    <g transform="translate(10,8)" id="threshold-slider">
      <text x="0" y="0" dominant-baseline="central" :fill="strokeColor" font-size="14px">minimum number of total samples</text>
      <g transform="translate(0,18)">
        <line x1="0" :x2="filterWidth" y1="0" y2="0" stroke="#CCCCCC" stroke-linecap="round" stroke-width="8" />
        <line ref="selected_threshold" :x1="filterShift" :x2="filterWidth" y1="0" y2="0" stroke="#df4ab7" stroke-linecap="round" stroke-width="8" />
        <circle ref="threshold_slider" :transform="`translate(${filterShift}, 0)`" cx="0" cy="0" r="8" fill="#df4ab7" class="pointer" />
        <text ref="threshold_label" :transform="`translate(${filterShift}, 0)`" x="0" y="0" dy="12" font-size="14px" font-weight="700" fill="#df4ab7" text-anchor="middle" dominant-baseline="hanging">{{countThreshold}}</text>
        <text :x="filterWidth" y="0" dy="12" font-size="12px" :fill="filteredColor" text-anchor="end" dominant-baseline="hanging">{{maxCount}}</text>
      </g>
    </g>
  </svg> -->
</div>
</template>

<script>
import {
  select,
  selectAll
} from "d3";

export default {
  name: "ClassedLegend",
  props: {
    colorScale: Function,
    strokeColor: String,
    filteredColor: String,
    nullColor: String,
    label: String,
    mutationName: String,
    maxCount: String,
    countThreshold: Number,
    horizontal: {
      type: Boolean,
      default: true
    },
    includeNulls: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return ({
      filterWidth: 200,
      rectWidth: 15,
      colorDomain: []
    })
  },
  watch: {
    colorScale: {
      immediate: true,
      handler(newVal, oldVal) {
        this.updateColorLegend();
      }
    }
  },
  mounted() {},
  methods: {
    updateColorLegend() {
      if (this.colorScale) {
        this.colorDomain = this.colorScale.domain();
        selectAll(".categorical-rect").each(function() {
          const bbox = this.getBBox();
          select(this)
            .attr("width", bbox.width + 1 < 18 ? 18 : bbox.width + 1)

          select(this)
            .select("rect")
            .attr("x", (bbox.width + 1 - 15) / 2)

        })

      }

    }
  }
}
</script>
