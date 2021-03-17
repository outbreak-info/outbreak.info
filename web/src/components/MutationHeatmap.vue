<template>
<div>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg" class="mutation-heatmap">
    <defs>
      <pattern id="diagonalHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:${strokeColor}; stroke-width:0.75`" />
      </pattern>
    </defs>
    <g ref="xAxisTop" class="axis axis--x" :transform="`translate(${this.margin.left}, ${this.margin.top - 5})`"></g>
    <g ref="xAxisBottom" class="axis axis--x" :transform="`translate(${this.margin.left}, ${this.margin.top + this.height + 5})`"></g>
    <g ref="yAxisLeft" class="axis axis--y" :transform="`translate(${this.margin.left - 5}, ${this.margin.top})`"></g>
    <g ref="yAxisRight" class="axis axis--y" :transform="`translate(${this.margin.left + this.width + 5}, ${this.margin.top})`"></g>
    <g ref="heatmapBase" id="heatmap-base" :transform="`translate(${this.margin.left}, ${this.margin.top})`"></g>
    <g ref="heatmap" id="heatmap" :transform="`translate(${this.margin.left}, ${this.margin.top})`"></g>
  </svg>

  <!-- TOOLTIPS -->
  <div ref="tooltip_heatmap" class="tooltip-basic tooltip-dark box-shadow" id="tooltip-prevalence">
    <div class="d-flex border-bottom align-items-center">
      <div class="d-flex">
        <h5 id="mutation"></h5>
        <div class="fa-sm font-weight-bold" id="mutationOfInterest"></div>
      </div>
      <span class="mx-2 text-muted">in</span>
      <div class="d-flex">
        <h5 id="lineage"></h5>
        <div class="fa-sm font-weight-bold" id="lineageOfInterest"></div>
      </div>
    </div>
    <div class="d-flex align-items-center pt-2" id="prevalence">
      <div id="value" class="fa-lg"></div> <small class="ml-2 text-muted">of all sequences</small>
    </div>
    <div id="not-detected" class="text-muted">
      not detected
    </div>

  </div>
</div>
</template>


<script lang="js">
import Vue from "vue";

import {
  cloneDeep,
  uniq
} from "lodash";

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  select,
  selectAll,
  scaleBand,
  axisLeft,
  axisRight,
  axisBottom,
  axisTop,
  transition,
  max,
  format,
  event
} from "d3";


import chroma from "chroma-js";

export default Vue.extend({
  name: "MutationHeatmap",
  props: {
    data: Array,
    moc: {
      type: Array,
      default: () => []
    },
    moi: {
      type: Array,
      default: () => []
    },
    voi: {
      type: Array,
      default: () => []
    },
    voc: {
      type: Array,
      default: () => []
    },
    bandWidth: {
      type: Number,
      default: 25
    },
    xVar: {
      type: String,
      default: "mutation_simplified"
    },
    yVar: {
      type: String,
      default: "pangolin_lineage"
    },
    yDomain: Array
  },
  watch: {
    data() {
      this.updatePlot();
    }
  },
  data() {
    return {
      margin: {
        top: 72,
        right: 85,
        bottom: 72,
        left: 85
      },
      // UI
      sortVar: "codon_num",
      // constants
      rx: 4,
      strokeColor: "#AAA",
      concernColor: "#fb5759",
      interestColor: "#feb56c",
      concernColorDark: "#e15759",
      interestColorDark: "#f28e2c",
      defaultColor: "#efefef",
      // scales
      x: scaleBand(),
      y: scaleBand(),
      paddingInner: 0.1,
      xAxisTop: null,
      xAxisBottom: null,
      yAxisLeft: null,
      yAxisRight: null,
      width: null,
      height: null,
      colorScale: interpolateRdPu,
      // references
      svg: null,
      heatmap: null,
      heatmapBase: null,
      // data
      base: null,
      plottedData: null,
      xDomain: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    setupDims() {

    },
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.heatmap = select(this.$refs.heatmap);
      this.heatmapBase = select(this.$refs.heatmapBase);
    },
    updateScales() {
      this.x = scaleBand()
        .paddingInner(this.paddingInner)
        .domain(this.plottedData.map(d => d[this.xVar]));

      this.xDomain = this.x.domain();

      this.width = this.xDomain.length * this.bandWidth;
      this.x.range([0, this.width]);


      this.y = scaleBand()
        .paddingInner(this.paddingInner)
        .domain(this.yDomain);

      this.height = this.yDomain.length * this.bandWidth;
      this.y.range([0, this.height]);

      this.xAxisBottom = axisBottom(this.x).tickSizeOuter(0);
      select(this.$refs.xAxisBottom).call(this.xAxisBottom);

      this.yAxisLeft = axisLeft(this.y).tickSizeOuter(0);
      select(this.$refs.yAxisLeft).call(this.yAxisLeft);

      this.xAxisTop = axisTop(this.x).tickSizeOuter(0);
      select(this.$refs.xAxisTop).call(this.xAxisTop);

      this.yAxisRight = axisRight(this.y).tickSizeOuter(0);
      select(this.$refs.yAxisRight).call(this.yAxisRight);

      this.base = this.xDomain.map(x => {
        return this.yDomain.map(y => {
          const obj = {};
          obj[this.xVar] = x;
          obj[this.yVar] = y;
          obj["id"] = `base_${x}-${y.replace(/\./g, "_")}`;
          return (obj)
        })
      }).flatMap(d => d)
    },
    prepData() {
      this.plottedData = cloneDeep(this.data);
      this.plottedData.sort((a, b) => a.codon_num - b.codon_num)
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
        this.updateScales();
        this.drawPlot();
      }
    },
    tooltipOn(d) {
      const ttipShift = 10;
      const ttip = select(this.$refs.tooltip_heatmap);

      // turn off the rest
      this.svg
        .selectAll("rect")
        .style("fill-opacity", 0.2);

      this.svg.select(`#${d.id}`)
        .style("fill-opacity", 1)
        .style("stroke-width", 1.5)

      // update text
      ttip
        .select("#lineage")
        .text(d.pangolin_lineage)

      ttip
        .select("#lineageOfInterest")
        .html(this.voc.includes(d.pangolin_lineage) ? "<sup>*</sup> VOC" : this.voi.includes(d.pangolin_lineage) ? "<sup>*</sup> VOI" : "")
        .style("color", this.voc.includes(d.pangolin_lineage) ? this.concernColorDark : this.voi.includes(d.pangolin_lineage) ? this.interestColorDark : this.defaultColor)

      ttip
        .select("#mutation")
        .text(d.mutation_simplified)

      ttip
        .select("#mutationOfInterest")
        .html(this.moc.includes(d.mutation_simplified) ? "<sup>*</sup> MOC" : this.moi.includes(d.mutation_simplified) ? "<sup>*</sup> MOI" : "")
        .style("color", this.moc.includes(d.mutation_simplified) ? this.concernColorDark : this.moi.includes(d.mutation_simplified) ? this.interestColorDark : this.defaultColor)

      if (d.prevalence) {
        ttip
          .select("#value")
          .text(d.prevalence < 0.0005 ? "< 0.1%" : format(".1%")(d.prevalence));

        ttip
          .select("#prevalence")
          .classed("hidden", false)

        ttip
          .select("#not-detected")
          .classed("hidden", true);
      } else {
        ttip
          .select("#prevalence")
          .classed("hidden", true)
        ttip
          .select("#not-detected")
          .classed("hidden", false)
      }
      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipOff() {
      this.svg.selectAll("rect")
        .style("stroke-width", 0.5)
        .style("fill-opacity", 1);

      select(this.$refs.tooltip_heatmap)
        .style("display", "none");
    },
    drawPlot() {

      // base: no values
      const heatmapBaseSelector = this.heatmapBase
        .selectAll(".heatmap-base")
        .data(this.base);

      heatmapBaseSelector.join(
        enter => {
          enter
            .append("rect")
            .attr("class", "heatmap-base")
            .attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", "url(#diagonalHatch)")
            .style("stroke", "#888")
            .style("stroke-width", 0.5)
            .style("rx", this.rx)
        },
        update => {
          update.attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      // heatmap
      const heatmapSelector = this.heatmap
        .selectAll(".heatmap")
        .data(this.plottedData, d => d.id);

      heatmapSelector.join(
        enter => {
          enter
            .append("rect")
            .attr("class", "heatmap")
            .attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
            // .attr("transform", d => d[this.yVar]  == "average" ? "translate(0,10)" : "translate(0,0)")
            .style("stroke", "#888")
            .style("stroke-width", 0.5)
            .style("rx", this.rx)
        },
        update => {
          update.attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      // turn on tooltips
      this.svg
        .selectAll("rect")
        .on("mousemove", d => this.tooltipOn(d))
        .on("mouseleave", () => this.tooltipOff());

      // rotate and color axes :(
      select(this.$refs.xAxisTop)
        .selectAll("text")
        .attr("y", 0)
        .attr("dx", 6)
        .attr("dy", "-0.75em")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "start")
        .style("fill", d => this.moc.includes(d) ? this.concernColor : this.moi.includes(d) ? this.interestColor : this.defaultColor);

      select(this.$refs.xAxisBottom)
        .selectAll("text")
        .attr("y", 0)
        .attr("dx", 6)
        .attr("dy", "1.25em")
        .attr("transform", "rotate(35)")
        .style("text-anchor", "start")
        .style("fill", d => this.moc.includes(d) ? this.concernColor : this.moi.includes(d) ? this.interestColor : this.defaultColor);

      select(this.$refs.yAxisLeft)
        .selectAll("text")
        .style("fill", d => this.voc.includes(d) ? this.concernColor : this.voi.includes(d) ? this.interestColor : this.defaultColor);

      select(this.$refs.yAxisRight)
        .selectAll("text")
        .style("fill", d => this.voc.includes(d) ? this.concernColor : this.voi.includes(d) ? this.interestColor : this.defaultColor);

    }
  }
})
</script>

<style lang = "scss">
.mutation-heatmap {
    background: #343a40!important;
}
.mutation-heatmap .axis--x text,
.mutation-heatmap .axis--y text {
    fill: #efefef;
    /* fill: #555; */
}

.mutation-heatmap .axis--x text {
    font-size: 12px;
}

.mutation-heatmap .axis--y text {
    font-size: 18px;
}

.mutation-heatmap .axis path {
    display: none;
}

.mutation-heatmap .axis--y line {
    display: none;
}
.mutation-heatmap .axis line {
    stroke: #efefef;
}
.tooltip-dark {
    background: #ffffffeb !important;
}
</style>
