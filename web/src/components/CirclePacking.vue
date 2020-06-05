<template>
<div class="position-relative">
  <svg :width="width" :height="height" class="circle-packing" ref="circle_packing">
    <defs></defs>
  </svg>
  <div ref="circle_tooltip" class="circle-pack-tooltip box-shadow rounded hidden position-absolute  px-3 py-2">
  </div>
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
    query: String
  },
  data() {
    return {
      colorScale: null,
      width: 420,
      height: 420,
      margin: {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10
      },
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleTime(),
      opacity: d3.scaleLinear().range([1, 0.3]),
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
    tooltipOn(d) {
      const event = d3.event;
      d3.select(this.$refs.circle_tooltip)
        .classed("hidden", false)
        .style("top", d3.event.layerY + "px")
        .style("left", d3.event.layerX + "px")
        .html(d.depth === 1 ? `Search ${d.data.name}s` : `Search ${d.data.name} ${d.parent.data.name}s`);

      this.svg
        .selectAll(".circle-group")
        .style("opacity", 0.25);

      this.svg
        .selectAll(".annotation--type")
        .style("opacity", 0.25);

      this.svg
        .select(`.${d.data.name.replace(" ", "_")}`)
        .style("opacity", 1);

      if (d.depth === 1) {
        this.svg
          .selectAll(`.${d.data.name}`)
          .style("opacity", 1);
      }

    },
    tooltipOff(d) {
      d3.select(this.$refs.circle_tooltip)
        .classed("hidden", true);

      this.svg
        .selectAll(".annotation--type")
        .style("opacity", 1);

      this.svg
        .selectAll(".circle-group")
        .style("opacity", 1);
    },
    searchResource(d) {
      if (d.depth == 1) {
        this.$router.push({
          name: "Resources",
          query: {
            q: this.query,
            filter: `@type:${d.data.name.toLowerCase()}`,
            page: "0",
            size: "10",
            sort: "-datePublished"
          }
        });
      } else {
        this.$router.push({
          name: "Resources",
          query: {
            q: this.query ? `curatedBy.name:"${d.data.term}" AND (${this.query})` : `curatedBy.name:"${d.data.term}"`,
            filter: `@type:${d.parent.data.name.toLowerCase()}`,
            page: "0",
            size: "10",
            sort: "-datePublished"
          }
        });
      }
    },
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
      this.data.children.forEach(source => {
        source.children.sort((a, b) => b.count - a.count);

        source.children.forEach((d, i) => {
          d['idx'] = i / (source.children.length - 1);
        })
      })
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
      const dataMax = d3.max(this.data.children.flatMap(d => d.children).flatMap(d => d.count));
      const textThresh = dataMax / 30;
      const typeThresh = dataMax / 40;

      const circles = this.svg
        .selectAll("circle")
        .data(this.nodes.filter(d => d.depth));


      circles.join(enter => {
        const grp = enter.append("g")
          .attr("class", d => `circle-group pointer ${d.data.name.replace(" ", "_")}`);

        grp.append("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", d => d.r)
          .attr("class", d => d.depth == 1 ? `resource-count ${d.data.name} depth${d.depth}` : `resource-count ${d.parent.data.name} depth${d.depth}`)
          .attr("id", d => `circle-${d.data.name.replace(" ", "_")}`)
          .attr("fill-opacity", d => this.opacity(d.data.idx))
          .classed("tiny", d => d.value < 100)
          .on("mouseenter", d => this.tooltipOn(d))
          .on("mouseleave", d => this.tooltipOff())
          .on("click", d => this.searchResource(d))

        // text annotation
        grp.filter(d => d.depth == 2 && d.value > textThresh).append("text")
          .attr("x", d => d.x)
          .attr("y", d => d.y)
          .append("tspan")
          .text(d => d.data.name)
          .attr("class", d => d.depth == 1 ? `annotation--source ${d.data.name} depth${d.depth}` : `annotation--source ${d.parent.data.name} depth${d.depth}`)
          .append("tspan")
          .text(d => d.value.toLocaleString())
          .attr("x", d => d.x)
          .attr("dy", "1.1em")
          .attr("class", "annotation--count")
          .on("mouseenter", d => this.tooltipOn(d))
          .on("mouseleave", d => this.tooltipOff())
          .on("click", d => this.searchResource(d));
      })


      const text = this.svg
        .selectAll(".annotation--type")
        .data(this.nodes.filter(d => d.depth == 1 && d.value > typeThresh));

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
          .attr("class", d => `annotation--type pointer ${d.data.name}`)
          .text(d => d.data.name.replace("clinicaltrial", "clinical trial"))
          .on("mouseover", d => this.tooltipOn(d))
          .on("mouseout", d => this.tooltipOff())
          .on("click", d => this.searchResource(d));
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

.website.depth1 {
    stroke: $website-color;
}

.website.depth2 {
    fill: $website-color;
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

.annotation--source {
    fill: $base-grey !important;
    pointer-events: none;
}

.annotation--type {
    text-transform: uppercase;
}

.annotation--type.publication {
    font-size: 1.15em;
    fill: darken($publication-color, 25%);
}

.annotation--type.clinicaltrial {
    font-size: 1em;
    fill: darken($clinical-trial-color, 25%);
}

.annotation--type.dataset {
    fill: darken($dataset-color, 15%);
}

.annotation--count {
    text-anchor: middle;
    dominant-baseline: central;
    font-weight: 400;
}

.circle-pack-tooltip {
    background: white;
}
</style>
