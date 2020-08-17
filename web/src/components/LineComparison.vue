<template>
<div>
  <small class="d-block">Averages daily {{label}}</small>
  <small class="d-block text-muted annotation">per 100,000 residents</small>
  <svg :width="width" :height="height" ref="svg" class="comparison-svg">
  </svg>
</div>
</template>


<script>
import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  line
} from "d3";

export default {
  name: "LineComparison",
  props: {
    data: Array,
    control: Array,
    xDomain: Array,
    yMax: Number,
    variable: String,
    label: String
  },
  data: function() {
    return {
      margin: {
        top: 5,
        right: 15,
        bottom: 5,
        left: 15
      },
      width: 150,
      height: 75,
      // refs
      svg: null,
      // methods
      x: scaleTime(),
      y: scaleLinear(),
      line: null
    }
  },
  watch: {
    data() {
      this.updatePlot();
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.line = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d[this.variable]));
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(this.xDomain);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, this.yMax]);
    },
    updatePlot() {
      this.updateScales();


      const controlSelector = this.svg.selectAll(".control-line")
        .data([this.control])

      controlSelector.join(
        enter => {
          enter.append("path")
            .attr("class", d => `control-line`)
            .attr("stroke", "#bababa")
            .style("fill", "none")
            .style("stroke-width", "3")
            .style("opacity", 0.6)
            .datum(d => d)
            .attr("d", this.line)
          },
          update => {
            update
              .datum(d => d)
              .attr("d", this.line)
            },
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(10)
              .style("opacity", 1e-5)
              .remove()
            )
        )


      const lineSelector = this.svg.selectAll(".epi-line")
        .data([this.data])

      lineSelector.join(
        enter => {
          enter.append("path")
            .attr("class", d => `epi-line`)
            .attr("id", d => `${d.location_id}-${this.variable}`)
            .attr("stroke", "#D13B62")
            .style("fill", "none")
            .style("stroke-width", "2")
            .datum(d => d)
            .attr("d", this.line)
          },
        update => {
          update
            .attr("id", d => `${d.location_id}-${this.variable}`)
            .datum(d => d)
            .attr("d", this.line)
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )
    }
  }
}
</script>

<style lang="scss" scoped="true">
.annotation {
  font-size: 0.7em;
  line-height: 1.1em;
}
</style>
