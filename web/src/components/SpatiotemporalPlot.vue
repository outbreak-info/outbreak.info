<template>
  <div class="timelapse flex-column align-left">
    <svg
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
      class="timelapse"
    >
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        id="timelapse"
      ></g>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from "d3";
import { interpolateYlGnBu } from "d3-scale-chromatic";
import {
  geoWinkel3,
  geoInterruptedHomolosine,
  geoInterruptedBoggs
} from "d3-geo-projection";

const width = 700;
const height = 400;
const radius = 4;
const margin = {
  top: 25,
  right: 25,
  bottom: 25,
  left: 25
};
const transitionDuration = 3500;

export default Vue.extend({
  name: "SpatiotemporalPlot",
  components: {},
  props: {
    data: Array
  },
  data() {
    return {
      width,
      height,
      margin,
      radius,
      transitionDuration,

      // data
      logData: null,
      currentDate: "03-08-20",

      // axes
      projection: geoInterruptedHomolosine()
        .center([0, 0])
        .translate([width / 2, height / 2])
        .scale(width / 1.3 / Math.PI),
      x: d3.scaleLinear().range([0, width]),
      y: d3.scaleLinear().range([height, 0]),
      colorScale: null,
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      plottedData: null
    };
  },
  watch: {
    data: function() {
      this.updatePlot();
    }
  },
  mounted() {
    this.prepData();
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    prepData: function() {
      this.data.forEach(location => {
        location.data.forEach(d => {
          d["firstAppearance"] = location.firstDate === d.date;
        });
      });

      this.flatData = this.data.flatMap(d => d.data);

      this.plottedData = this.flatData.filter(d => d.date_string == "03-08-20");
      console.log(this.plottedData);
    },
    updatePlot: function() {
      if (this.data) {
        this.prepData();
        this.updateScales();
        this.drawDots();
      }
    },
    setupPlot: function() {
      this.svg = d3.select("svg.timelapse");
      this.chart = d3.select("#timelapse");

      this.svg
        .append("g")
        .attr("class", "epi-axis axis--x")
        .attr(
          "transform",
          `translate(${this.margin.left}, ${this.margin.top + this.height})`
        );

      this.svg
        .append("g")
        .attr("class", "epi-axis axis--y")
        .attr(
          "transform",
          `translate(${this.margin.left}, ${this.margin.top})`
        );
    },
    updateScales: function() {
      this.x = this.x.domain(d3.extent(this.plottedData.map(d => d.lon)));
      this.y = this.y.domain(d3.extent(this.plottedData.map(d => d.lat)));

      this.colorScale = function(value) {
        const scale = d3
          .scaleSequential(interpolateYlGnBu)

          .domain([1, Math.log10(d3.max(this.flatData, d => d.cases))]);
        return value ? scale(Math.log10(value)) : "white";
      };
    },
    drawDots: function() {
      const t1 = d3.transition().duration(this.transitionDuration);
      // --- create groups for each region ---
      const regionGroups = this.chart
        .selectAll(".centroid")
        .data(
          this.flatData
            .filter(d => d.date_string == this.currentDate)
            .filter(d => d.cases)
        );

      // -- exit --
      regionGroups.exit().remove();

      // -- enter --
      const regionsEnter = regionGroups
        .enter()
        .append("circle")
        .attr("class", "centroid")
        .attr("r", this.radius);

      regionGroups
        .merge(regionsEnter)
        .attr("id", d => d.id)
        .attr("fill", d => this.colorScale(d.cases))
        .attr("cx", d => this.projection(d.coord)[0])
        .attr("cy", d => this.projection(d.coord)[1]);

      const textSelector = this.chart
        .selectAll(".annotation--new-country")
        .data(
          this.flatData
            .filter(d => d.date_string == this.currentDate)
            .filter(d => d.cases && d.firstAppearance)
        );

      // -- exit --
      textSelector.exit().remove();

      // -- enter --
      const textEnter = textSelector
        .enter()
        .append("text")
        .attr("class", "annotation--new-country")
        .attr("dx", 5)
        .attr("dy", 5);

      textSelector
        .merge(textEnter)
        .attr("id", d => d.id)
        .attr("x", d => this.projection(d.coord)[0])
        .attr("y", d => this.projection(d.coord)[1])
        .text(d => d.id.replace(/_/g, " "));
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.timelapse svg {
  // background: aliceblue;
}

.centroid {
  stroke: $grey-90;
  stroke-width: 0.75;
  opacity: 0.75;
}
.annotation--new-country {
  dominant-baseline: central;
}
</style>
