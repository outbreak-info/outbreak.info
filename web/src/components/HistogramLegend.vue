<template>
<div>
  <div :style="{width: width+ 'px'}">
  <div class="text-left line-height-1 mb-1">
    {{variableLabel}}
  </div>
  <small class="d-block text-left text-muted line-height-1 mb-1" v-if="minVal || maxVal || minVal === 0 || maxVal === 0">
    filtered <span v-html="filterString"></span> {{variableLabel}}
  </small>
  </div>
  <svg class="epi-map-svg epi-map-legend" name="" :width="width" :height="height + margin.top + margin.bottom*2 + 15" ref="legend_svg">
    <g class="legend-bars" ref="legend_bars" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g class="axis axis--x" ref="axis_x" :transform="`translate(${margin.left},${height + margin.top})`"></g>
    <g class="legend" :transform="`translate(${margin.left},${height + margin.bottom + margin.top})`">
      <rect x="0" y="0" :width="item.width" height="10" :fill="item.fill" :id="`legendrect${idx}`" :transform="`translate(${item.x0}, 0)`" v-for="(item, idx) in legendColors" :key="idx">
      </rect>
      <rect x="0" y="0" :width="width - margin.left - margin.right" height="10" stroke="black" fill="none" :stroke-width="0.5"></rect>
    </g>
    <g class="slider-handle pointer" :transform="`translate(${margin.left},${height + margin.bottom + margin.top + 17})`" v-if="x">
      <g stroke="#686868" fill="#d6d6d6" stroke-width="0.5">
        <line :x1="x(selectedMin)" :x2="x(selectedMax)" :y1="4.1" :y2="4.1" stroke="#d6d6d6" stroke-width="4.5"/>
        <polygon id="slider_left" ref="slider_left" :transform="`translate(${x(selectedMin)},0)`" points="4.1,10.3 0.1,10.3 0.1,-1.8 1.1,-1.8 4.1,-1.8 8.1,4.1 "/>
        <polygon ref="slider_right" :transform="`translate(${x(selectedMax) - 8},0)`" points="0.1,4.1 4.1,-1.8 7.1,-1.8 8.1,-1.8 8.1,10.3 4.1,10.3 "/>
      </g>
      <g transform="translate(0,13)" dominant-baseline="hanging" font-size="8" font-family="'DM Sans', Avenir, Helvetica, Arial, sans-serif;" text-anchor="start">
        <text :x="x(selectedMin)" :y="0">{{selectedMin}}</text>
        <text :x="x(selectedMax)" :y="0">{{selectedMax}}</text>
      </g>
    </g>
  </svg>
</div>
</template>


<script>
import * as d3 from "d3";
import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

export default {
  name: "HistogramLegend",
  props: {
    data: Array,
    variable: String,
    variableLabel: String,
    minVal: Number,
    maxVal: Number,
    colorScale: Function,
    width: Number
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    variable: function() {
      this.selectedMin = Math.floor(this.domain[0]);
      this.selectedMax = Math.ceil(this.domain[1]);
      this.updatePlot();
    }
  },
  data() {
    return {
      height: 100,
      margin: {
        top: 5,
        bottom: 25,
        left: 25,
        right: 25
      },
      selectedMin: null,
      selectedMax: null,
      // axes
      x: null,
      y: null,
      xAxis: null,
      legendColors: null,
      // binned data
      bins: null,
      numBins: 50,
      // refs
      chart: null,
      xAxisRef: null
    };
  },
  computed: {
    domain() {
      return d3.extent(this.colorScale.domain());
    },
    precision() {
      console.log(this.domain[1] - this.domain[0])
      return(this.domain[1] - this.domain[0] <= 20 ? 10 : 1);
    },
    filterString() {
      if((this.minVal || this.minVal === 0) && (this.maxVal || this.maxVal === 0)) {
      return(`${this.minVal} &mdash; ${this.maxVal}`)
    } else if((this.minVal || this.minVal === 0)) {
      return(`&ge; ${this.minVal}`)
    } else if((this.maxVal || this.maxVal === 0)) {
      return(`&le; ${this.maxVal}`)
    } else {
      return(null)
    }
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
    console.log(this.precision)
    this.selectedMin = this.minVal ? this.minVal : Math.floor((this.domain[0] + Number.EPSILON) * this.precision) / this.precision;
    this.selectedMax = this.maxVal ? this.maxVal : Math.ceil((this.domain[1] + Number.EPSILON) * this.precision) / this.precision;

    this.$nextTick(() => this.setupDrag())
  },
  methods: {
    setupPlot: function() {
      this.chart = d3.select(this.$refs.legend_bars);
      this.xAxisRef = d3.select(this.$refs.x_axis);
    },
    updateAxes: function() {
      // x-axis
      this.x = d3.scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(this.domain)
        .clamp(true);

      this.xAxis = d3.axisBottom(this.x).tickSizeOuter(0).ticks(5).tickPadding(100);
      this.xAxisRef.call(this.xAxis);

      // legend gradient
      this.legendColors = this.colorScale.range()
        .map((color, i) => {
          return ({
            fill: color,
            width: this.x(this.colorScale.domain()[i + 1]) - this.x(this.colorScale.domain()[i]),
            x0: this.x(this.colorScale.domain()[i])
          })

        })

      d3.selectAll(".axis").call(this.xAxis);

      // calculate bins
      this.bins = d3.histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(this.numBins))(this.data.map(d => d[this.variable]));

      // pre-calc if the data should be selected or not
      this.bins.forEach(d => {
        if ((this.minVal || this.minVal === 0) && (this.maxVal || this.maxVal === 0)) {
          d["selected"] = d.x0 >= this.minVal && d.x1 <= this.maxVal;
        } else if (this.minVal || this.minVal === 0) {
          d["selected"] = d.x0 >= this.minVal;
        } else if (this.maxVal || this.maxVal === 0) {
          d["selected"] = d.x1 <= this.maxVal;
        } else {
          d["selected"] = true;
        }
      })


      // y-axis
      this.y = d3.scaleLinear()
        .range([this.height, 0])
        .domain([0, d3.max(this.bins, d => d.length)]);
    },
    setupDrag() {
      // draggable filters
      d3.select(this.$refs.slider_left)
        .call(d3.drag()
          .on("drag", () => this.updateDrag("left"))
          .on("end", () => this.updateFilters())
        )
      d3.select(this.$refs.slider_right)
        .call(d3.drag()
          .on("drag", () => this.updateDrag("right"))
          .on("end", () => this.updateFilters())
        )
    },
    updateDrag(side) {
      const newVal = this.x.invert(d3.event.x);
      if(side == "left") {
        this.selectedMin = Math.floor((newVal + Number.EPSILON) * this.precision) / this.precision;
      } else {
        // this.selectedMin = this.selectedMax;
        this.selectedMax = Math.ceil((newVal + Number.EPSILON) * this.precision) / this.precision;
      }
    },
    updateFilters() {
      const route = this.$route.query;
      console.log(route)
      this.$router.push({
        path: "maps",
        query: {
          location: route.location,
          admin_level: route.admin_level,
          variable: route.variable,
          sort: route.sort,
          date: route.date,
          min: String(this.selectedMin),
          max: String(this.selectedMax)
        }
      });
    },
    updatePlot: function() {
      if (this.data && this.colorScale) {
        this.updateAxes();

        this.chart
          .selectAll("rect")
          .data(this.bins)
          .join(
            enter => {
              enter.append("rect")
                .attr("class", "histogram-bar")
                .attr("fill", d => this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : "none")
                .attr("opacity", d => d.selected ? 1 : 0.25)
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            },
            update => {
              update
                .attr("fill", d => this.colorScale ? this.colorScale((d.x0 + d.x1) / 2) : "none")
                .attr("opacity", d => d.selected ? 1 : 0.25)
                .attr("x", d => this.x(d.x0) + 1)
                .attr("width", d => Math.max(0, this.x(d.x1) - this.x(d.x0) - 1))
                .attr("y", d => this.y(d.length))
                .attr("height", d => this.y(0) - this.y(d.length))
            }
          )
      }
    }
  }
}
</script>

<style lang="scss">
.histogram-bar {
    stroke: $base-grey;
    stroke-width: 0.5;
    shape-rendering: crispedges;
}
</style>
