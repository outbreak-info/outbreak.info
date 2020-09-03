<template>
<div class="donut-group d-flex flex-column" :id="`donut-${id}`">
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="date-histogram">
    <g :transform="`translate(${this.margin.left},${this.margin.top})`" ref="hist"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
  </svg>
  <svg :hidden="!filterable" :width="width + margin.left + margin.right" height="38">
    <g class="slider-handle pointer" v-if="x" :transform="`translate(${this.margin.left},${5})`">
      <g stroke="#686868" fill="#d6d6d6" stroke-width="0.5">
        <line ref="slider_line" :x1="sliderLeft" :x2="sliderRight" :y1="4.1" :y2="4.1" stroke="#d6d6d6" stroke-width="4.5" />
        <polygon id="slider_left" :transform="`translate(${sliderLeft},0)`" ref="slider_left" points="4.1,10.3 0.1,10.3 0.1,-1.8 1.1,-1.8 4.1,-1.8 8.1,4.1 " />
        <polygon ref="slider_right" :transform="`translate(${sliderRight - 8},0)`" points="0.1,4.1 4.1,-1.8 7.1,-1.8 8.1,-1.8 8.1,10.3 4.1,10.3 " />
      </g>
      <g transform="translate(0,13)" dominant-baseline="hanging" font-size="8" font-family="'DM Sans', Avenir, Helvetica, Arial, sans-serif;" text-anchor="start">
        <text :x="x(selectedMin)" :y="0">&gt; {{formatLimit(selectedMin)}}</text>
        <text :x="x(selectedMax)" :y="10" text-anchor="end">&lt; {{formatLimit(selectedMax)}}</text>
      </g>
    </g>
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
  axisBottom,
  nest,
  max,
  sum,
  extent,
  timeWeek,
  isoParse,
  timeFormat,
  drag,
  event
} from "d3";

export default Vue.extend({
  name: "DateHistogram",
  props: {
    data: Array,
    id: String,
    minVal: Date,
    maxVal: Date,
    filterable: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 125
    },
    height: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      margin: {
        top: 5,
        bottom: 25,
        left: 15,
        right: 15
      },
      // data
      bins: null,
      // axes,
      x: null,
      y: null,
      xAxis: null,
      // filters
      selectedMin: null,
      selectedMax: null,
      // refs
      svg: null,
      xAxisRef: null
      // methods
    };
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    minVal: {
      immediate: true,
      handler(newMin, oldMin) {
        this.updateFilterLimits();
      }
    },
    maxVal: {
      immediate: true,
      handler(newMax, oldMax) {
        this.updateFilterLimits();
      }
    }
  },
  computed: {
    sliderRight() {
      return ((this.x && this.selectedMax) ? this.x(this.selectedMax) : 8);
    },
    sliderLeft() {
      return ((this.x && this.selectedMin) ? this.x(this.selectedMin) : 0);
    }
  },
  methods: {
    formatLimit(val) {
      return (timeFormat("%d %b %Y")(val));
    },
    updateFilterLimits: function() {
      this.selectedMin = new Date(2020, 3, 1);
      // selectedMax: new Date(2020,8,1),this.minVal ;
      this.selectedMax = new Date(2020, 6, 1)
    },
    setupPlot() {
      this.svg = select(this.$refs.hist);
      this.xAxisRef = select(this.$refs.x_axis);
    },
    updatePlot() {
      if (this.data && this.data[0] && this.width) {
        this.updateAxes();
        this.drawPlot();
      }
    },
    updateAxes: function() {
      const dateRange = extent(this.data, d => d.date);

      // x-axis
      // Add 1 week pad on either side of the histogram to pad the ends
      this.x = scaleTime()
        .range([0, this.width])
        .domain([timeWeek.offset(dateRange[0], -1), timeWeek.offset(dateRange[1], 1)]);


      this.xAxis = axisBottom(this.x).tickSizeOuter(0).ticks(4);
      this.xAxisRef.call(this.xAxis);

      selectAll(".axis").call(this.xAxis);

      // calculate bins
      // rolled up to every week
      this.bins = nest()
        .key(d => timeWeek(d.date))
        .rollup(values => sum(values, d => d.count))
        .entries(this.data)

      // gotta reconvert dates from strings
      this.bins.forEach(d => {
        d["date"] = isoParse(d.key)
      })

      // // y-axis
      this.y = scaleLinear()
        .range([this.height, 0])
        .domain([0, max(this.bins, d => d.value)]);

    },
    changeFilters() {
      console.log("fitlers")
    },
    setupDrag() {
      // draggable filters
      select(this.$refs.slider_left)
        .call(drag()
          .on("drag", () => this.updateDrag("left"))
          .on("end", () => this.changeFilters())
        )
      select(this.$refs.slider_right)
        .call(drag()
          .on("drag", () => this.updateDrag("right"))
          .on("end", () => this.changeFilters())
        )
    },
    updateDrag(side) {
      const newVal = this.x.invert(event.x);
      if (side == "left") {
        this.selectedMin = newVal;
        select(this.$refs.slider_left)
          .attr("transform", `translate(${this.x(this.selectedMin)},0)`);

      } else {
        this.selectedMax = newVal;

        select(this.$refs.slider_right)
          .attr("transform", `translate(${this.x(this.selectedMax) - 8},0)`);
      }

          // selectAll(".date-histogram")
          // .style("fill", d => d.date <= this.selectedMax && d.date >= this.selectedMin ? "#66c2a5" : "#bababa")
    },
    drawPlot() {
      const barSelector = this.svg
        .selectAll("rect")
        .data(this.bins);

      barSelector.join(enter => {
          enter.append("rect")
            .attr("class", "histogram-bar")
            .style("fill", d => d.date <= this.selectedMax && d.date >= this.selectedMin ? "#66c2a5" : "#bababa")
            // .attr("opacity", d => d.selected ? 1 : 0.25)
            .attr("x", d => this.x(d.date))
            .attr("width", d => (this.x(timeWeek.offset(d.date, 1)) - this.x(d.date)) * 0.9)
            .attr("y", d => this.y(d.value))
            .attr("height", d => this.y(0) - this.y(d.value))
        },
        update => update
        .style("fill", d => d.date <= this.selectedMax && d.date >= this.selectedMin ? "#66c2a5" : "#bababa")
        .attr("x", d => this.x(d.date))
        .attr("width", d => (this.x(timeWeek.offset(d.date, 1)) - this.x(d.date)) * 0.9)
        .attr("y", d => this.y(d.value))
        .attr("height", d => this.y(0) - this.y(d.value)))
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();

    this.$nextTick(() => this.setupDrag())
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
</style>
