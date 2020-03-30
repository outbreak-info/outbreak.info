<template>
<div class="bargraph-group d-flex flex-column" :id="`bargraph-${id}-${variable}`">
  <h4 v-if="title">{{title}}</h4>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-bargraph" ref="svg">
    <g :transform="`translate(${margin.left}, ${height + margin.top + 2})`" class="epi-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left},${margin.top})`" id="case-counts" class="bargraph" ref="case_counts"></g>
  </svg>
  <div class="tooltip p-2">
    <h6 class="country-name m-0"></h6>
    <p class="date m-0"></p>
    <p class="count m-0"></p>
  </div>
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
    color: String,
    title: String,
    includeAxis: {
      type: Boolean,
      default: false
    },
    includeTooltips: {
      type: Boolean,
      default: false
    },
    fixedYMax: {
      type: Number,
      default: null
    },
    fixedXLim: {
      type: Array,
      default: null
    },
    animate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      margin: {
        top: 5,
        bottom: 30,
        left: 65,
        right: 15
      },
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleBand().paddingInner(0.1),
      numYTicks: 6,
      // refs
      chart: null
    };
  },
  watch: {
    data: function() {
      this.updatePlot()
    },
    variable: function() {
      this.updatePlot()
    },
    fixedYMax: function() {
      this.updatePlot()
    },
    width: function() {
      this.updatePlot()
    },
    height: function() {
      this.updatePlot()
    }
  },
  methods: {
    setupPlot() {
      this.svg = d3.select(`#bargraph-${this.id}-${this.variable}`).select("svg.epi-bargraph");
      this.chart = this.svg.select("#case-counts");
    },
    updatePlot() {
      if (this.data && this.data[0] && this.width && this.height) {
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {
      const range = this.fixedXLim ? this.fixedXLim : d3.extent(this.data, d => d.date);

      this.x = this.x
        .range([0, this.width])
        .domain(d3.timeDay.range(range[0], d3.timeDay.offset(range[1],1)));

        // console.log(d3.range(d3.extent(this.data, d => d.date)[0], d3.extent(this.data, d => d.date)[1]))

      const yMax = this.fixedYMax ? this.fixedYMax : d3.max(this.data, d => d[this.variable]);

      this.y = this.y
        .range([this.height, 0])
        .domain([0, yMax]);

      if (this.includeAxis) {
        this.xAxis = d3.axisBottom(this.x)
          .tickSizeOuter(0)
          .tickValues(this.x.domain().filter(function(d, i) {
            return !(i % 14)
          }))
          .tickFormat(d3.timeFormat("%d %b"));

        d3.select(this.$refs.xAxis).call(this.xAxis);

        this.yAxis = d3.axisLeft(this.y)
          .ticks(this.numYTicks)
          .tickSizeOuter(0);

        d3.select(this.$refs.yAxis).call(this.yAxis);
      }
    },
    drawPlot() {
      const t1 = d3.transition().duration(500);
      const barSelector = this.chart.selectAll(".bargraph").data(this.data);

      barSelector
        .join(
          enter => enter.append("rect")
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("id", d => d._id)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())
          .attr("y", d => this.y(0))
          .attr("height", 0)
          .attr("fill", this.color)
          .call(update => this.animate ? update.transition(t1).delay((d, i) => i * 20)
            .attr("y", d => this.y(d[this.variable]))
            .attr("height", d => this.y(0) - this.y(d[this.variable])) :
            update.attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(0) - this.y(d[this.variable]))
          ),

          update => update
          .attr("class", d => `bargraph ${d.location_id}-${this.variable}`)
          .attr("id", d => d._id)
          .attr("x", d => this.x(d.date))
          .attr("width", this.x.bandwidth())

          .call(update => this.animate ? update.transition(t1)
            .attr("y", d => this.y(d[this.variable]))
            .attr("height", d => this.y(0) - this.y(d[this.variable])) :
            update.attr("y", d => this.y(d[this.variable]))
              .attr("height", d => this.y(0) - this.y(d[this.variable]))
          ),

          exit => exit.call(exit => exit.transition().duration(10).style("opacity", 1e-5).remove())
        )

      if (this.includeTooltips) {
        this.chart.selectAll("rect")
          .on("mouseenter", d => this.mouseOn(d))
          .on("mouseleave", this.mouseOff);
      }
    },
    mouseOn(d) {
      const ttip = d3.selectAll(".tooltip")
        .style("top", d3.event.y + "px")
        .style("left", d3.event.x + "px")
        .style("opacity", 1);

      this.chart.selectAll("rect").style("opacity", 0.5);
      this.chart.selectAll(`#${d._id}`).style("opacity", 1);

      ttip.select(".country-name").text(d.name);
      ttip.select(".date").text(d3.timeFormat("%d %b %Y")(d.date));
      ttip.select(".count").text(d[this.variable].toLocaleString());
    },
    mouseOff() {
      d3.selectAll(".tooltip")
        // .style("opacity", 0);
      //
      this.chart.selectAll("rect").style("opacity", 1);
    }
  },
  mounted() {
    if(!this.includeAxis) {
      this.margin = {top: 0, bottom: 0, left: 0, right: 0};
    }

    this.setupPlot();
    this.updatePlot();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffff70;
    opacity: 0;
}
</style>
