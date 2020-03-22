<template>
  <div class="bargraph-group" :id="`bargraph-${id}-${variable}`">
    <svg :width="width" :height="height" class="epi-bargraph" ref="svg"></svg>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from "d3";

export default Vue.extend({
  name: "Bargraph",
  props: {
    data: Array,
    width: Number,
    height: Number,
    variable: String,
    id: String,
    color: String
  },
  data() {
    return {
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleBand().paddingInner(0.1),
      // refs
      chart: null
    };
  },
  watch: {
    data: function() {
      this.updatePlot()
    }
  },
  methods: {
    setupPlot() {
      this.svg = d3.select(`#bargraph-${this.id}-${this.variable}`).select("svg.epi-bargraph");
      this.chart = this.svg.select("#case-counts");

      this.chart = this.svg.append("g").attr("class", "bargraph");

    },
    updatePlot() {
      if (this.data && this.data[0] && this.width && this.height) {
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width])
        .domain(this.data.map(d => d.date));

      this.y = this.y
        .range([this.height,0])
        .domain([0, d3.max(this.data, d => d[this.variable])]);
    },
    drawPlot() {
      const barSelector = this.chart.selectAll(".bargraph").data(this.data);

      barSelector
        .join(
          enter => enter.append("rect")
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())
          .attr("y", d => this.y(d[this.variable]))
          .attr("height", d => this.y(0) - this.y(d[this.variable]))
          .attr("fill", this.color),
          
          update => update
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())
          .attr("y", d => this.y(d[this.variable]))
          .attr("height", d => this.y(0) - this.y(d[this.variable])),

          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
svg{
}
</style>
