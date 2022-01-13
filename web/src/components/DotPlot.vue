<template>
<div :style="{width: width+ 'px'}" ref="dotplot_container">
  <h6 class="text-left m-0">{{sortAsc ? "Lowest" : "Highest"}}</h6>
  <small class="text-left m-0 p-0 line-height-1 d-block text-wrap mb-2 mr-2">{{title}}</small>
  <svg :width="width" :height="height" ref="dotplot_svg" class="epi-map-svg epi-map-dotplot dotplot-svg" :subtitle="fullTitle">
    <g :transform="`translate(${margin.left}, ${margin.top})`">
      <line :x1="x(0)" :x2="x(0)" :y1="0" :y2="height - margin.top - margin.bottom" v-if="x && x(0) >= 0" stroke="black" stroke-width="0.5"></line>
      <g ref="circles" class="circles-group">
      </g>
    </g>
  </svg>
</div>
</template>

<script>
import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  format,
  transition,
} from "d3";
import cloneDeep from "lodash/cloneDeep";

export default {
  name: "DotPlot",
  props: {
    data: Array,
    width: Number,
    varMax: Number,
    variable: String,
    title: String,
    sortAsc: Boolean,
    rightAlign: Boolean,
    colorScale: Function,
    transition1: Number,
    animate: Boolean
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
      // refs
      svg: null,
      chart: null,
      // data
      plottedData: null
    };
  },
  computed: {
    fullTitle: function() {
      return (this.sortAsc ? "Lowest" : "Highest")
    },
    numberFormatter() {
      return (this.varMax <= 10 ? format(",.1f") : format(",.0f"))
    },
    domain() {
      return this.rightAlign ? [-1 * this.varMax, 0] : [0, this.varMax];
    },
    margin() {
      const locationWidth = 75;
      const otherSideWidth = 45;
      return this.rightAlign ? {
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
      this.svg = select(this.$refs.dotplot_svg);
      this.chart = select(this.$refs.circles);
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
      this.x = scaleLinear()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(this.domain);

      this.y = scaleBand()
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.plottedData.map(d => d.location_id));
    },
    mouseOn(d) {
      selectAll("path.region").style("fill-opacity", 0.25);
      selectAll(".circle-most-change").style("fill-opacity", 0.5);
      selectAll(".line-most-change").style("fill-opacity", 0.5);
      selectAll(".annotation-most-change").style("fill-opacity", 0.5);
      selectAll(".location-most-change").style("fill-opacity", 0.5);
      selectAll("path.state").style("stroke-opacity", 0.75);
      select(`path#${d.location_id}`).style("stroke", "black").style("stroke-width", 2);
      selectAll(`#${d.location_id}`).style("fill-opacity", 1);
      selectAll(`.${d.location_id}`).style("fill-opacity", 1);

    },
    mouseOut() {
      selectAll("path.region")
        .style("fill-opacity", 1)
        .style("stroke", "#8aa4be").style("stroke-width", 0.25);
      selectAll("path.state").style("stroke-opacity", 1);
      selectAll(".circle-most-change").style("fill-opacity", 1);
      selectAll(".line-most-change").style("fill-opacity", 1);
      selectAll(".annotation-most-change").style("fill-opacity", 1);
      selectAll(".location-most-change").style("fill-opacity", 1);
    },
    drawPlot() {
      this.prepData();
      this.updateAxes();

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
        .call(update => {
          if (this.animate) {
            update.transition().duration(this.transition1)
              .attr("y1", d => this.y(d.location_id) + this.y.bandwidth() / 2)
              .attr("y2", d => this.y(d.location_id) + this.y.bandwidth() / 2)
              .attr("x2", d => this.x(d[this.variable]))
          } else {
            update
              .attr("y1", d => this.y(d.location_id) + this.y.bandwidth() / 2)
              .attr("y2", d => this.y(d.location_id) + this.y.bandwidth() / 2)
              .attr("x2", d => this.x(d[this.variable]))
          }

        }),
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
        .call(update => {
          if (this.animate) {
            update.transition().duration(this.transition1)
              .style("fill", d => this.colorScale(d[this.variable]))
              .attr("cx", d => this.x(d[this.variable]))
              .attr("cy", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          } else {
            update
              .style("fill", d => this.colorScale(d[this.variable]))
              .attr("cx", d => this.x(d[this.variable]))
              .attr("cy", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          }
        }),

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

      const locationNameThresh = 8;

      yAxSelector.join(
        enter => enter.append("text")
        .attr("class", d => `location-most-change ${d.location_id} y-axis`)
        .attr("id", d => `location-change-${d._id}`)
        .attr("x", d => this.x(0))
        .attr("dx", d => d.rightAlign ? this.radius * 1.5 : -1.5 * this.radius)
        .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .text(d => d.admin1 ? `${trimText(d.name.replace(" County", ""), locationNameThresh)}` : trimText(d.name, locationNameThresh))
        .style("text-anchor", d => d.rightAlign ? "start" : "end")
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
        .text(d => d.admin1 ? `${trimText(d.name.replace(" County", ""), locationNameThresh)}` : trimText(d.name, locationNameThresh))
        .call(update => {
          if(this.animate) {
            update.transition().duration(this.transition1)
            .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          } else {
            update
            .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
          }
          }),

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
        .attr("dx", d => d.rightAlign ? -10 : 10)
        .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
        .text(d => this.numberFormatter(d[this.variable]))
        .style("dominant-baseline", "central")
        .style("text-anchor", d => d.rightAlign ? "end" : "start")
        .style("font-size", "0.65em")
        .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style("fill", "#2c3e50"),

        update =>
        update
        .attr("id", d => `annotation-change-${d._id}`)
        .attr("class", d => `annotation-most-change ${d.location_id}`)
        .text(d => this.numberFormatter(d[this.variable]))
        .call(update => {
          if(this.animate) {
            update.transition().duration(this.transition1)
            .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
            .attr("x", d => this.x(d[this.variable]))
          } else {
            update
            .attr("y", d => this.y(d.location_id) + this.y.bandwidth() / 2)
            .attr("x", d => this.x(d[this.variable]))
          }
        }),

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
