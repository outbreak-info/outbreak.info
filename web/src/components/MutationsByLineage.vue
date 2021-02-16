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

import { select, selectAll, scaleLinear, scaleBand, max, axisLeft, axisBottom, format, min } from "d3";
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
	  left: 50,
	  right: 70,
	  top: 20,
	  bottom: 20
	};
      }
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 300
    },
    fill: {
      type: String,
      default: "#cbd7e3"
    },
    n: {
      type: Number,
      default: 5
    }
  },
  watch: {
    data: function(){
      this.setupPlot();
      this.updatePlot();
    }
  },
  methods: {
    preprocessData(){
      var sortedData = cloneDeep(this.data).sort((a, b) => {
       	return b.proportion - a.proportion;
      })
      this.processedData = sortedData.slice(0, this.n);
      if(this.n < sortedData.length){
	var otherData = sortedData
	    .slice(this.n, sortedData.length)
	    .reduce((x, y) => {
	      return {
		"lineage_count": x.lineage_count + y.lineage_count,
		"mutation_count": x.mutation_count + y.mutation_count
	      }
	    });
	this.processedData.push({
	  pangolin_lineage: "Other",
	  proportion: otherData.mutation_count/otherData.lineage_count,
	  lineage_count: otherData.lineage_count,
	  mutation_count: otherData.mutation_count
	})
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
      this.preprocessData();
    },
    updatePlot: function() {
      this.updateAxes();
      this.drawBars();
    },
    updateAxes() {
      this.x = scaleLinear()
        .range([0, this.width - this.margin.right])
        .domain([0, min([max(this.processedData.map(d => d.proportion)) + 0.1, 1])]);

      this.y = scaleBand()
        .paddingInner(0.2)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map(d => d.pangolin_lineage));

      this.yAxis = axisLeft(this.y)
      .tickFormat((d) => d.toUpperCase());

      this.xAxis = axisBottom(this.x)
	.tickFormat(format(".0%"));

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
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", this.fill)
	    .transition()
	    .attr("width", d => this.x(d.proportion))
        },
	update => {
	  update.attr("x", d => 0)
            .attr("width", d => this.x(d.proportion))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
	},
	exit => {
	  exit
	    .transition()
	    .attr("width", 0)
	    .remove()
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
