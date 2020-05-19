<template>
<div>
  <svg :width="width" :height="height" class="circle-packing" ref="circle_packing">
    <defs></defs>
  </svg>
</div>
</template>


<script lang="js">
import Vue from "vue";

import * as d3 from "d3";
// from https://observablehq.com/@d3/marimekko-chart
export default Vue.extend({
  name: "CirclePacking",
  props: {
    data: Object,
  },
  data() {
    return {
      colorScale: null,
      width: 550,
      height: 550,
      margin: {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
      },
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleTime(),
      // refs
      svg: null,
      svgDefs: null,
      // data
      nodes: null,
      // methods
      pack: null
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
        .select(this.$refs.circle_packing);

      this.svgDefs = this.svg
        .select("defs");

      this.pack = d3.pack()
        .size([this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom])
        .padding(3);
    },
    prepData() {
      let root = d3.hierarchy(this.data)
        .sum(d => d.count)
        .sort(function(a, b) {
          return b.value - a.value;
        });

      this.nodes = this.pack(root).descendants();
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
        this.drawPlot();
      }
    },
    circle2Path(cx, cy, r) {
      r = r - 10;
      return (r > 0 ? `M${cx-r},${cy}a${r},${r} 0 1,1 ${2*r},0a${r},${r} 0 1,1 -${2*r},0` : null)
    },
    drawPlot() {
      const textThresh = 500;

      const circles = this.svg
        .selectAll("circle")
        .data(this.nodes.filter(d => d.depth));

      circles.join(enter => {
        const grp = enter.append("g");
        grp.append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("class", d => d.depth == 1 ? `resource-count ${d.data.name} depth${d.depth}` : `resource-count ${d.parent.data.name} depth${d.depth}`)
        .classed("tiny", d => d.value < 100)
          grp.filter(d => d.depth == 2 && d.value > textThresh).append("text")
          .attr("x", d => d.x)
          .attr("y", d => d.y)
          .append("tspan")
          .text(d => d.data.name)
          .attr("class", "annotation--source")
          .append("tspan")
          .text(d => d.value.toLocaleString())
          .attr("x", d => d.x)
          .attr("dy", "1.1em")
          .attr("class", "annotation--count")
      })


      const text = this.svg
        .selectAll(".annotation--type")
        .data(this.nodes.filter(d => d.depth == 1));

      const textPaths = this.svgDefs
        .selectAll("path")
        .data(this.nodes.filter(d => d.depth == 1));

      textPaths.join(enter => {
        enter.append("path")
          .attr("d", d => this.circle2Path(d.x, d.y, d.r))
          .attr("transform", d => `rotate(-90 ${d.x} ${d.y})`)
          .attr("id", (d, i) => `textpath${i}`);
      })

      text.join(enter => {
        enter.append("text")
          .append("textPath")
          .attr("href", (d, i) => `#textpath${i}`)
          // .attr("textLength", 200)
          .attr("startOffset", "50%")
          .attr("class", d => `annotation--type ${d.data.name}`)
          .text(d => d.data.name.replace("clinicaltrial", "clinical trial"))

        // .attr("x", d => d.x)
        // .attr("y", d => d.y)
        // .append("tspan")


        // .append("tspan")
        // .text(d => d.value.toLocaleString())
        // .attr("x", d => d.x)
        // .attr("dy", "1.1em")
        // .attr("class", "annotation--count")
      })

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
.resource-count {
    fill: $other-color;
}

.depth1 {
    fill: none !important;
    stroke: $other-color;
    stroke-width: 1;
    stroke-dasharray: 6,4;
}

.tiny {
    stroke-dasharray: 1,0 !important;
    stroke-width: 1 !important;
}

.publication.depth1 {
    stroke: $publication-color;
}

.publication.depth2 {
    fill: $publication-color;
}

.clinicaltrial.depth1 {
    stroke: $clinical-trial-color;
}

.clinicaltrial.depth2 {
    fill: $clinical-trial-color;
}

.dataset.depth1 {
    stroke: $dataset-color;
}

.dataset.depth2 {
    fill: $dataset-color;
}

.protocol.depth1 {
    stroke: $protocol-color;
}

.protocol.depth2 {
    fill: $protocol-color;
}

.book.depth1 {
    stroke: $book-color;
}

.book.depth2 {
    fill: $book-color;
}

.softwaresourcecode.depth1 {
    stroke: $software-color;
}

.softwaresourcecode.depth2 {
    fill: $software-color;
}
.analysis.depth1 {
    stroke: $analysis-color;
}

.analysis.depth2 {
    fill: $analysis-color;
}

.annotation--source,
.annotation--type {
    text-anchor: middle;
    dominant-baseline: central;
    font-weight: 500;
}

.annotation--type {
    text-transform: uppercase;
}

.annotation--type.publication {
    font-size: 1.15em;
    fill: darken($publication-color, 25%);
}

.annotation--type.clinicaltrial {
    font-size: 1.15em;
    fill: darken($clinical-trial-color, 25%);
}


.annotation--type.dataset {
    fill: darken($dataset-color, 25%);
}

.annotation--count {
    text-anchor: middle;
    dominant-baseline: central;
    font-weight: 400;
}


</style>
