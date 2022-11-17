<template>
<div>
  TREE
  <svg :width="width" :height="height" ref="tree">
    <g ref="links" transform="translate(500, 250)"></g>
    <g ref="nodes" transform="translate(500, 250)"></g>
  </svg>

</div>
</template>

<script>
import {
  select,
  selectAll,
  hierarchy,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY
} from 'd3';

import LINEAGES from "@/assets/genomics/lineages.json";

export default {
  name: 'LineageTree',
  props: {},
  components: {},
  data() {
    return {
      width: 1000,
      height: 500,
      lineages: [],
    }
  },
  mounted() {
    // this.lineages = LINEAGES;
    this.lineages = {
      name: "BA.5",
      children: [{
          name: "BA.5.1",
          children: []
        },
        {
          name: "BA.5.2",
          children: []
        }
      ]
    }
    this.prepData();
    console.log(this.lineages)
  },
  methods: {
    prepData() {
      // create hierarchical representation
      const root = hierarchy(this.lineages);
      const links = root.links();
      const nodes = root.descendants();

      // create force-directed tree layout
      const simulation = forceSimulation(nodes)
        .force("link", forceLink(links).id((d) => d.id).distance(0).strength(1))
        .force("charge", forceManyBody().strength(-50))
        .force("x", forceX())
        .force("y", forceY());


      const link = select(this.$refs.links)
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line");

      const node = select(this.$refs.nodes)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("fill", d => d.children ? null : "#000")
        .attr("stroke", d => d.children ? null : "#fff")
        .attr("r", 3.5)
        // .call(drag(simulation));

      // run the force direction
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
    }
  }
}
</script>

<style lang="scss">
svg {
  background: yellow
}
</style>
