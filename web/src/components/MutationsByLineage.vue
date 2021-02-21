<template>
<div class="mutations-by-lineage d-flex flex-column text-left">
  <h6 class="m-0">{{title}}</h6>
  <small class="text-muted">{{subtitle}}</small>
  <svg :width="width" :height="height">
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="horizontal_bargraph"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-y pointer axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxis"></g>
  </svg>
</div>
</template>

<script>
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  max,
  axisLeft,
  axisBottom,
  format,
  min
} from "d3";
import cloneDeep from "lodash/cloneDeep";

export default Vue.extend({
  name: "MutationsByLineage",
  props: {
    data: Array,
    title: String,
    subtitle: String,
    lineage: String,
    margin: {
      type: Object,
      default: function() {
        return {
          left: 70,
          right: 30,
          top: 10,
          bottom: 25
        };
      }
    },
    width: {
      type: Number,
      default: 400
    },
    fill: {
      type: String,
      default: "#f2b6e2"
    },
    n: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      numXTicks: 4,
      bandwidth: 25,
      height: null
    }
  },
  watch: {
    data: function() {
      this.setupPlot();
      this.updatePlot();
    }
  },
  methods: {
    handleLineageClick(lineage) {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          country: queryParams.country,
          division: queryParams.division,
          pango: lineage,
          selected: queryParams.selected,
          selectedType: queryParams.selectedType
        }
      })
    },
    preprocessData() {
      var sortedData = cloneDeep(this.data).sort((a, b) => {
        return b.proportion - a.proportion;
      })
      this.processedData = sortedData.slice(0, this.n);
      if (this.n < sortedData.length) {
        var otherData = sortedData
          .slice(this.n, sortedData.length)
          .reduce((x, y) => {
            return {
              "lineage_count": x.lineage_count + y.lineage_count,
              "mutation_count": x.mutation_count + y.mutation_count
            }
          });
        this.processedData.push({
          pangolin_lineage: "other",
          proportion: otherData.mutation_count / otherData.lineage_count,
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
      const paddingInner = 0.25;
      this.height = this.processedData.length * this.bandwidth * (1 + paddingInner);

      this.x = scaleLinear()
        .range([0, this.width - this.margin.right - this.margin.left])
        .domain([0, min([max(this.processedData.map(d => d.proportion)) + 0.1, 1])]);

      this.y = scaleBand()
        .paddingInner(paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map(d => d.pangolin_lineage));

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0);

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.xAxis).call(this.xAxis);
    },
    drawBars() {
      const rectSelector =
        this.svg
        .selectAll("rect")
        .data(this.processedData, d => d.pangolin_lineage);

      rectSelector.join(
        enter => {
          enter.append("rect")
            .attr("x", d => this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", d => d.pangolin_lineage == this.lineage ? "#df4ab7" : this.fill)
            .attr("width", d => this.x(d.proportion) - this.x(0))
        },
        update => {
          update.attr("x", d => this.x(0))
            .transition().duration(250)
            .attr("width", d => this.x(d.proportion) - this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
        },
        exit => {
          exit
            .transition()
            .attr("width", 0)
            .remove()
        }
      );

      const textSelector =
        this.svg
        .selectAll("text")
        .data(this.processedData, d => d.pangolin_lineage);

      rectSelector.join(
        enter => {
          enter.append("text")
            .attr("x", d => this.x(d.proportion))
            .attr("dx", d => this.x(d.proportion) > 30 ? -5 : 25)
            .attr("y", d => this.y(d.pangolin_lineage) + this.y.bandwidth()/2)
            .text(d => d.proportion_formatted)
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "12px")
        },
        update => {
          update
            .attr("x", d => this.x(d.proportion))
            .attr("dx", d => this.x(d.proportion) > 30 ? -5 : 25)
            .attr("y", d => this.y(d.pangolin_lineage))
            .text(d => d.proportion_formatted)
        },
        exit => {
          exit
            .transition()
            .attr("width", 0)
            .remove()
        }
      );

      select(this.$refs.yAxis)
        .selectAll("text")
        .on("click", d => this.handleLineageClick(d));
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
</script>

<style lang="scss">
.horizontal-bargraph-x,
.horizontal-bargraph-y {
    font-size: 16px;
}
</style>
