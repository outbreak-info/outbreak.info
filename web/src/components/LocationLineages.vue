<template>
<div>
  Lineage prevalence over time
  <svg :width="width" :height="height" class="prevalence-curve" ref="svg" :name="title">
    <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yAxis"></g>
    <g ref="chart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";
import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  max,
  mean,
  format,
  line,
  area,
  transition,
  nest,
  parseTime
} from "d3";
export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    mutationName: String,
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 500
    }
  },
  computed: {
    title() {
      return ("Prevalence over time")
    }
  },
  data() {
    return {
      margin: {
        top: 10,
        bottom: 40,
        left: 55,
        right: 55
      },
      // data
      nestedData: null,
      // scales
      colorScale: scaleOrdinal(
        ["#bab0ab", // lt grey -- UTRs
          "#1f77b4", // dk blue
          "#aec7e8", // lt blue
          "#f28e2c", // orange
          "#e15759", // red
          "#9edae5", // teal
          "#59a14f", // green
          "#edc949", // yellow
          "#9467bd", // purple
          "#ff9da7", // pink
          "#8c564b", // brown
          "#555555", // grey
          "#bcbd22", // puce
        ]),
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.chart);
    },
    prepData() {
      this.nestedData = nest()
        .key(d => d.date)
        .entries(this.data);

      console.log(this.nestedData)

      const maxFreq = nest()
        .key(d => d.lineage)
        .rollup(values => mean(values.sort((a,b) => b.proportion - a.proportion).slice(10), d => d.proportion))
        .entries(this.data);

const lineageThresh = 0.05;
        const lineages = maxFreq.filter(d => d.value > lineageThresh).map(d => d.key);

        console.log(maxFreq)
        console.log(lineages)
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
      }
    }
  }
})
</script>
