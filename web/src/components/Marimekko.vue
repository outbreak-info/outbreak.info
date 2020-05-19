<template><div>
  <svg :width="width" :height="height" class="marimekko">
    <defs>
      <marker
        id="arrow-start"
        markerWidth="6"
        markerHeight="4"
        refX="1"
        refY="2"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M4,4 L1,2 L4,0" class="mari-arrowhead" />
      </marker>
      <marker
        id="arrow-end"
        markerWidth="6"
        markerHeight="4"
        refX="3"
        refY="2"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,4 L3,2 L0,0" class="mari-arrowhead" />
      </marker>
      <!-- <marker
        id="arrow-end"
        markerWidth="13"
        markerHeight="10"
        refX="13"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M5,0 L12,5 L5,10" class="mari-arrowhead" />
      </marker> -->
    </defs>
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="marimekko"></g>
  </svg>
</div></template>

<script lang="js">
import Vue from "vue";

import * as d3 from "d3";
// from https://observablehq.com/@d3/marimekko-chart
export default Vue.extend({
  name: "Marimekko",
  props: {
    // data: Array,
    // width: Number,
    // height: Number,
    // variable: String,
    // id: String,
    // color: String
  },
  data() {
    return {
      data: [{
          x: "hydroxychloroquine",
          y: "Clinical Trial",
          value: 238
        },
        {
          x: "hydroxychloroquine",
          y: "Publication",
          value: 124
        }, {
          x: "azithromycin",
          y: "Publication",
          value: 25
        }, {
          x: "azithromycin",
          y: "Clinical Trial",
          value: 76
        }, {
          x: "tocilizumab",
          y: "Clinical Trial",
          value: 68
        }, {
          x: "tocilizumab",
          y: "Publication",
          value: 29
        }, {
          x: "lopinavir/ritonavir",
          y: "Publication",
          value: 19
        }, {
          x: "lopinavir/ritonavir",
          y: "Clinical Trial",
          value: 67
        }, {
          x: "convalescent plasma",
          y: "Clinical Trial",
          value: 80
        }, {
          x: "convalescent plasma",
          y: "Publication",
          value: 30
        }
      ],
      root: null,
      colorScale: null,
      width: 850,
      height: 400,
      margin: {
        top: 75,
        bottom: 10,
        right: 10,
        left: 10
      },
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleTime(),
      // refs
      svg: null,
      // methods
      area: null
    };
  },
  watch: {
    data: function() {
      this.updatePlot();
    }
  },
  methods: {
    setupPlot() {
      this.svg = d3
        .select(this.$refs.marimekko);

      this.colorScale = d3.scaleOrdinal()
        .range(["#a53888", "#e15759"])
        .domain(["Clinical Trial", "Publication"]);
    },
    prepData() {

      const hierarchy = (d3.hierarchy({
            values: d3.nest()
              .key(d => d.x)
              .key(d => d.y)
              .entries(this.data)
          },
          d => d.values
        ).sum(d => d.value))
        .each(d => {
          d.x0 += this.margin.left;
          d.x1 += this.margin.left;
          d.y0 += this.margin.top;
          d.y1 += this.margin.top;
        });

      console.log(hierarchy)
      hierarchy.children.sort((a, b) => a.key > b.key ? -1 : 1);

      this.root = d3.treemap()
        .round(true)
        .tile(d3.treemapSliceDice)
        .size([
          this.width - this.margin.left - this.margin.right,
          this.height - this.margin.top - this.margin.bottom
        ])(hierarchy.sum(d => d.value)
          .sort((a, b) => b.value - a.value));
    },
    updatePlot() {
      if (this.data && this.data[0]) {
        this.prepData();
        this.updateScales();
        this.drawPlot();
      }
    },
    updateScales() {},
    drawPlot() {

      const format = d => d.toLocaleString()
      const node = this.svg.selectAll(".marimekko")
        .data(this.root.descendants().sort((a, b) => b.depth - a.depth).filter(d => d.depth == 1 || d.depth == 2))
        .join("g")
        .attr("id", d => `${d.data.values[0].x}-${d.data.values[0].y}-${d.depth}`)
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

      console.log(this.root.descendants())
      const column = node.filter(d => d.depth === 1);

      const cell = node.filter(d => d.depth === 2);
      // tree maps: level 2
      cell.append("rect")
        .attr("stroke", d => this.colorScale(d.data.key))
        .attr("fill", d => this.colorScale(d.data.key))
        .attr("opacity", 0.35)
        .attr("width", d => d.x1 - d.x0 - 1)
        .attr("height", d => d.y1 - d.y0 - 1);

      cell.append("text")
        .attr("x", 3)
        .attr("y", "1.1em")
        .attr("fill", d => this.colorScale(d.data.key))
        .text(d => d.data.key);

      cell.append("text")
        .attr("x", 3)
        .attr("y", "2.3em")
        .text(d => format(d.value));

      // column labels
      column.append("text")
        .attr("x", 3)
        .attr("y", "-3em")
        .style("font-weight", "bold")
        .text(d => d.data.key);

      column.append("text")
        .attr("x", 3)
        .attr("y", "-1.8em")
        .text((d, i) => i ? format(d.value) : format(d.value) + " results");

      column.append("line")
        .attr("x1", -0.5)
        .attr("x2", -0.5)
        .attr("y1", -this.margin.top)
        .attr("y2", d => d.y1 - d.y0)
        .attr("stroke", "white")
        .attr("class", "marimekko-divider");

      column.append("line")
        .attr("x1", d => 5)
        .attr("x2", d => d.x1 - d.x0 - 1 -5)
        .attr("y1", -10)
        .attr("y2", -10)
        .attr("marker-end", "url(#arrow-end)")
        .attr("marker-start", "url(#arrow-start)")
        .attr("stroke", "#bbb")
        .attr("stroke-width", "1.5");
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
.marimekko-divider {
    stroke-width: 1.5;
}

.mari-arrow,
.mari-arrowhead {
    stroke: #bbb;
    fill: none;
    stroke-width: 1;
}
</style>
