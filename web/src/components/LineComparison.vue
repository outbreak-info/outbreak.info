<template>
<div>
  <small class="d-block">Average daily {{label}}</small>
  <small class="d-block text-muted annotation">per 100,000 residents</small>
  <svg :width="width" :height="height" class="comparison-svg">
    <g  ref="svg" :transform="`translate(${margin.left}, ${margin.top})`">
    </g>
  </svg>
</div>
</template>


<script>
import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  line,
  format,
  max
} from "d3";

export default {
  name: "LineComparison",
  props: {
    data: Array,
    control: Array,
    xDomain: Array,
    yMax: Number,
    variable: String,
    label: String,
    colorScale: Function
  },
  data: function() {
    return {
      margin: {
        top: 8,
        right: 50,
        bottom: 5,
        left: 5
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

      // max data point
      const maxVal = max(this.data, d => d[this.variable]);
      const maxSelector = this.svg.selectAll(".max-value")
        .data(this.data.filter(d => d[this.variable] === maxVal))

      maxSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("fill", d => this.colorScale(d.location_id))
            .attr("id", d => `${d.location_id}-${this.variable}-maxValue`)
            .attr("class", "max-value");

          grp.append("line")
          .style("stroke", "#2c3e50")
          .style("stroke-dasharray", d => this.width - this.margin.left - this.margin.right - this.x(d.date) > 30 ? "3,3" : "0")
            .attr("x1", d => this.x(d.date))
            .attr("x2", this.width - this.margin.left - this.margin.right + 3.5)
            .attr("y1", d => this.y(d[this.variable]))
            .attr("y2", d => this.y(d[this.variable]));

          grp.append("text")
            .style("font-size", 12)
            .style("dominant-baseline", "central")
            .attr("dx", 7)
            .attr("x", d => this.width - this.margin.left - this.margin.right)
            .attr("y", d => this.y(d[this.variable]))
            .text(d => format(",.1f")(d[this.variable]))
        },
        update => {
          update.attr("fill", d => this.colorScale(d.location_id))
            .attr("id", d => `${d.location_id}-${this.variable}-mostRecent`)

            update.select("line")
              .attr("x1", d => this.x(d.date))
              .attr("x2", this.width - this.margin.left - this.margin.right + 3.5)
              .attr("y1", d => this.y(d[this.variable]))
              .attr("y2", d => this.y(d[this.variable]));

            update.select("text")
              .attr("x", d => this.width - this.margin.left - this.margin.right)
              .attr("y", d => this.y(d[this.variable]))
              .text(d => format(",.1f")(d[this.variable]))
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

      // region trace
      const lineSelector = this.svg.selectAll(".epi-line")
        .data([this.data])

      lineSelector.join(
        enter => {
          enter.append("path")
            .attr("class", d => `epi-line`)
            .attr("id", d => `${d[0].location_id}-${this.variable}`)
            .attr("stroke", d => this.colorScale(d[0].location_id))
            .style("fill", "none")
            .style("stroke-width", "2")
            .datum(d => d)
            .attr("d", this.line)
        },
        update => {
          update
            .attr("id", d => `${d[0].location_id}-${this.variable}`)
            .attr("stroke", d => this.colorScale(d[0].location_id))
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

      // last data point
      const endSelector = this.svg.selectAll(".mostRecent")
        .data(this.data.slice(-1))

      endSelector.join(
        enter => {
          const grp = enter.append("g")
          .attr("class", d => `mostRecent`)
          .attr("id", d => `${d.location_id}-${this.variable}-mostRecent`)
            .attr("fill", d => this.colorScale(d.location_id));

          grp.append("circle")
            .attr("r", 3)
            .attr("cx", d => this.x(d.date))
            .attr("cy", d => this.y(d[this.variable]))

          grp.append("text")
            .style("font-size", 12)
            .style("dominant-baseline", "central")
            .attr("dx", 7)
            .attr("x", d => this.x(d.date))
            .attr("y", d => this.y(d[this.variable]))
            .text(d => format(",.1f")(d[this.variable]))
        },
        update => {
          update.attr("fill", d => this.colorScale(d.location_id))
            .attr("id", d => `${d.location_id}-${this.variable}-mostRecent`)
            .select("circle")
            .attr("cx", d => this.x(d.date))
            .attr("cy", d => this.y(d[this.variable]))

            update.select("text")
            .attr("x", d => this.x(d.date))
            .attr("y", d => this.y(d[this.variable]))
            .text(d => format(",.1f")(d[this.variable]))
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
