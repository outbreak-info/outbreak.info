<template>
<div class="mutations-by-lineage d-flex flex-column text-left">
  <h6 class="m-0">{{title}}</h6>
  <small class="text-muted">{{subtitle}}</small>
  <svg :width="width" :height="height">
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="horizontal_bargraph"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-y axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxis"></g>
  </svg>
</div>
</template>

<script>
import Vue from "vue";

import { select, selectAll, scaleLinear, scaleBand, max, axisLeft, axisBottom } from "d3";
import cloneDeep from "lodash/cloneDeep";

export default Vue.extend({
  name: "MutationsByLineage",
  props: {
    data: Array,
    title: String,
    subtitle: String,
    margin: {
      type: Object,
      default: function(){
	return {
	  left: 40,
	  right: 20,
	  top: 20,
	  bottom: 20
	};
      }
    },
    width: {
      type: Number,
      default: 250
    },
    height: {
      type: Number,
      default: 250
    },
    num2Show: {
      type: Number,
      default: 15
    },
    fill: {
      type: String,
      default: "#cbd7e3"
    }
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
      this.processedData = this.data.sort((a, b) => {
       	return b.proportion - a.proportion;
      });
    },
    updatePlot: function() {
      this.updateAxes();
      this.drawBars();
    },
    updateAxes() {
      this.x = scaleLinear()
        .range([0, this.width - this.margin.right])
        .domain([0, max(this.processedData.map(d => d.proportion))]);

      this.y = scaleBand()
        .paddingInner(0.2)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map(d => d.pangolin_lineage));

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0);

      this.xAxis = axisBottom(this.x)
        .tickSizeOuter(0);

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.xAxis).call(this.xAxis);
    },
    drawBars() {
      const rectSelector =
        this.svg
        .selectAll("rect")
        .data(this.processedData);

      rectSelector.join(
        enter => {
          enter.append("rect")
            .attr("x", d => 0)
            .attr("width", d => this.x(d.proportion))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", this.fill)
        }
      )
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
</script>

<style lang="scss">

</style>
