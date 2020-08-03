<template>
<div class="" :style="{width: width+ 'px'}" ref="dotplot_container">
  <h6 class="text-left m-0">{{sortAsc ? "Lowest" : "Highest"}}</h6>
  <small class="text-left m-0 p-0 line-height-1 d-block text-wrap mb-2 mr-2">{{title}}</small>
  <svg :width="width" :height="height" ref="dotplot_svg" class="dotplot-svg" :name="title">
    <g ref="circles" class="circles-group" :transform="`translate(${margin.left}, ${margin.top})`">
      <line :x1="x(0)" :x2="x(0)" :y1="0" :y2="height - margin.top - margin.bottom" v-if="x" stroke="black" stroke-width="0.5"></line>
    </g>
    <!-- <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="epi-axis axis--x" ref="xAxis" id="xAxis"></g> -->
    <!-- <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis" id="yAxis"></g> -->
  </svg>
</div>
</template>

<script>
import * as d3 from "d3";
import {
  cloneDeep
} from "lodash";

export default {
  name: "DotPlot",
  props: {
    data: Array,
    width: Number,
    varMax: Number,
    variable: String,
    title: String,
    sortAsc: Boolean,
    colorScale: Function
  },
  watch: {
    data: function() {
      this.drawPlot();
    }
  },
  data() {
    return {
      num2Plot: 5,
      height: 150,
      radius: 6,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      // data
      plottedData: null
    };
  },
  computed: {
    numberFormatter() {
      return(this.varMax <= 10 ? d3.format(",.1f") : d3.format(",.0f"))
    },
    domain() {
      return this.sortAsc ? [-1 * this.varMax, 0] : [0, this.varMax];
    },
    margin() {
      const locationWidth = 75;
      const otherSideWidth = 45;
      return this.sortAsc ? {
        top: 0,
        right: locationWidth,
        bottom: 30,
        left: otherSideWidth
      } : {
        top: 0,
        right: otherSideWidth,
        bottom: 30,
        left: locationWidth
      }
    }
  },
  mounted() {
    this.setupPlot();
    this.drawPlot();
  },
  methods: {
    setupPlot() {
      this.svg = d3.select(this.$refs.dotplot_svg);
      this.chart = d3.select(this.$refs.circles);
    },
    prepData() {
      // If there are undefined values, the sorting happens as strings, which is WRONG
      this.plottedData = cloneDeep(this.data.filter(d => d[this.variable]));
      if (this.sortAsc) {
        this.plottedData.sort((a, b) => +a[this.variable] - +b[this.variable]);
        this.plottedData = this.plottedData.slice(0, this.num2Plot);
      } else {
        this.plottedData.sort((a, b) => (+b[this.variable]) - (+a[this.variable]));
        this.plottedData = this.plottedData.slice(0, this.num2Plot);
      }

    },
    updateAxes() {
      this.x = d3.scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(this.domain);
      // .domain(d3.extent(this.plottedData.map(d => d[this.variable])));

      this.y = d3.scaleBand()
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.plottedData.map(d => d.location_id));

      this.xAxis = d3
        .axisBottom(this.x)
        .ticks(2)
        .tickSizeOuter(0)

      d3.select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0);

      d3.select(this.$refs.yAxis).call(this.yAxis);

    },
    mouseOn(d) {
      d3.selectAll("path.region").style("fill-opacity", 0.25);
      d3.selectAll(".circle-most-change").style("fill-opacity", 0.5);
      d3.selectAll(".line-most-change").style("fill-opacity", 0.5);
      d3.selectAll(".annotation-most-change").style("fill-opacity", 0.5);
      d3.selectAll(".location-most-change").style("fill-opacity", 0.5);
      d3.selectAll("path.state").style("stroke-opacity", 0.75);
      d3.select(`path#${d.location_id}`).style("stroke", "black").style("stroke-width", 2);
      d3.selectAll(`#${d.location_id}`).style("fill-opacity", 1);
      d3.selectAll(`.${d.location_id}`).style("fill-opacity", 1);

    },
    mouseOut() {
      d3.selectAll("path.region")
        .style("fill-opacity", 1)
        .style("stroke", "#8aa4be").style("stroke-width", 0.25);
      d3.selectAll("path.state").style("stroke-opacity", 1);
      d3.selectAll(".circle-most-change").style("fill-opacity", 1);
      d3.selectAll(".line-most-change").style("fill-opacity", 1);
      d3.selectAll(".annotation-most-change").style("fill-opacity", 1);
      d3.selectAll(".location-most-change").style("fill-opacity", 1);
    },
    drawPlot() {
      this.prepData();
      this.updateAxes();

      const t1 = d3.transition().duration(750);

      const lolliSelector = this.chart.selectAll(".lollipop")
        .data(this.plottedData, d => d.location_id);

      lolliSelector.join(
        enter => enter.append("line")
        .attr("class", d => `lollipop line-most-change ${d.location_id}`)
        .attr("id", d => `lollipop-change-${d._id}`)
        .attr("x1", d => this.x(0))
        .attr("x2", d => this.x(d[this.variable]))
        .attr("y1", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .attr("y2", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .style("stroke", "#2c3e50")
        .style("stroke-width", 0.75),

        update =>
        update
        .attr("id", d => `lollipop-change-${d._id}`)
        .attr("class", d => `lollipop line-most-change ${d.location_id}`)
        .attr("x1", d => this.x(0))
        .attr("x2", d => this.x(0))
        .call(update => update.transition(t1)
          .attr("y1", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          .attr("y2", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          .attr("x2", d => this.x(d[this.variable]))),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );


      const circleSelector = this.chart.selectAll("circle")
        .data(this.plottedData, d => d.location_id);

      circleSelector.join(
        enter => enter.append("circle")
        .attr("class", d => `circle-most-change ${d.location_id}`)
        .attr("id", d => `circle-change-${d._id}`)
        .attr("cx", d => this.x(d[this.variable]))
        .attr("cy", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .attr("r", this.radius)
        .style("fill", d => this.colorScale(d[this.variable]))
        .style("stroke", "#2c3e50")
        .style("stroke-width", 0.5)
        .on("mouseenter", d => this.mouseOn(d))
        .on("mouseleave", this.mouseOut),

        update =>
        update
        .attr("id", d => `circle-change-${d._id}`)
        .attr("class", d => `circle-most-change ${d.location_id}`)
        .attr("cx", d => this.x(0))
        .call(update => update.transition(t1)
          .style("fill", d => this.colorScale(d[this.variable]))
          .attr("cx", d => this.x(d[this.variable]))
          .attr("cy", d => this.y(d.location_id) + this.y.bandwidth() / 2)),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );

      const yAxSelector = this.chart.selectAll(".y-axis")
        .data(this.plottedData, d => d.location_id);

      // Lazy trunction of too long names
      function trimText(text, threshold) {
        if (text.length <= threshold) return text;
        return text.substr(0, threshold).concat("...");
      }

      const locationNameThresh = 9;

      yAxSelector.join(
        enter => enter.append("text")
        .attr("class", d => `location-most-change ${d.location_id} y-axis`)
        .attr("id", d => `location-change-${d._id}`)
        .attr("x", d => this.x(0))
        .attr("dx", this.sortAsc ? this.radius * 1.5 : -1.5 * this.radius)
        .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .text(d => d.state_name ? `${trimText(d.name.replace(" County", ""), locationNameThresh)}` : trimText(d.name, locationNameThresh))
        .style("text-anchor", this.sortAsc ? "start" : "end")
        .style("dominant-baseline", "middle")
        .style("font-size", "0.75em")
        .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style("fill", "#2c3e50")
        .on("mouseenter", d => this.mouseOn(d))
        .on("mouseleave", this.mouseOut),

        update =>
        update
        .attr("id", d => `location-change-${d._id}`)
        .attr("class", d => `location-most-change ${d.location_id} y-axis`)
        .text(d => d.state_name ? `${trimText(d.name.replace(" County", ""), locationNameThresh)}` : trimText(d.name, locationNameThresh))
        .call(update => update.transition(t1)
          .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );

      const annotationSelector = this.chart.selectAll(".annotation-most-change")
        .data(this.plottedData, d => d.location_id);

      annotationSelector.join(
        enter => enter.append("text")
        .attr("class", d => `annotation-most-change ${d.location_id}`)
        .attr("id", d => `annotation-change-${d._id}`)
        .attr("x", d => this.x(d[this.variable]))
        .attr("dx", this.sortAsc ? -10 : 10)
        .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .text(d => this.numberFormatter(d[this.variable]))
        .style("dominant-baseline", "central")
        .style("text-anchor", this.sortAsc ? "end" : "start")
        .style("font-size", "0.65em")
        .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style("fill", "#2c3e50"),

        update =>
        update
        .attr("id", d => `annotation-change-${d._id}`)
        .attr("class", d => `annotation-most-change ${d.location_id}`)
        .text(d => this.numberFormatter(d[this.variable]))
        .call(update => update.transition(t1)
          .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          .attr("x", d => this.x(d[this.variable]))),

        exit =>
        exit.call(exit =>
          exit
          .transition()
          .duration(10)
          .style("opacity", 1e-5)
          .remove()
        )
      );
    }
  }
}
</script>

<style lang="scss">
// .dotplot-svg .axis--y line,
// .dotplot-svg .axis--y path {
//     display: none;
// }
</style>
