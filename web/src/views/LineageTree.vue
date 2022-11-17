<template>
<div>
  TREE
  <svg :width="width" :height="height" ref="tree">
    <g ref="links" transform="translate(500, 250)"></g>
    <g ref="nodes" transform="translate(500, 250)"></g>
    <g ref="labels" transform="translate(500, 250)"></g>
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
          name: "BA.5.3",
          children: [{
            name: "BA.5.3.1",
            children: []
          }, {
            name: "BA.5.3.2",
            children: []
          }, {
            name: "BA.5.3.3",
            children: []
          }, {
            name: "BA.5.3.4",
            children: []
          }, {
            name: "BA.5.3.5",
            children: []
          }]
        },
        {
          name: "BA.5.1",
          children: [{
            name: "BA.5.1.1",
            children: []
          }, {
            name: "BA.5.1.2",
            children: []
          }, {
            name: "BA.5.1.3",
            children: []
          }, {
            name: "BA.5.1.4",
            children: []
          }, {
            name: "BA.5.1.5",
            children: []
          }, {
            name: "BA.5.1.6",
            children: []
          }, {
            name: "BA.5.1.7",
            children: []
          }, {
            name: "BA.5.1.8",
            children: []
          }, {
            name: "BA.5.1.9",
            children: []
          }, {
            name: "BA.5.1.10",
            children: [{
              name: "BK.1",
              children: []
            }]
          }, {
            name: "BA.5.1.11",
            children: []
          }, {
            name: "BA.5.1.12",
            children: []
          }, {
            name: "BA.5.1.13",
            children: []
          }, {
            name: "BA.5.1.14",
            children: []
          }, {
            name: "BA.5.1.15",
            children: []
          }, {
            name: "BA.5.1.16",
            children: []
          }, {
            name: "BA.5.1.17",
            children: []
          }, {
            name: "BA.5.1.18",
            children: []
          }, {
            name: "BA.5.1.19",
            children: []
          }, {
            name: "BA.5.1.20",
            children: []
          }, {
            name: "BA.5.1.21",
            children: []
          }, {
            name: "BA.5.1.22",
            children: []
          }, {
            name: "BA.5.1.23",
            children: []
          }, {
            name: "BA.5.1.24",
            children: []
          }, {
            name: "BA.5.1.25",
            children: []
          }, {
            name: "BA.5.1.26",
            children: []
          }, {
            name: "BA.5.1.27",
            children: []
          }, {
            name: "BA.5.1.28",
            children: []
          }, {
            name: "BA.5.1.29",
            children: []
          }, {
            name: "BA.5.1.30",
            children: []
          }, {
            name: "BA.5.1.31",
            children: []
          }, ]
        },
        {
          name: "BA.5.2",
          children: [{
            name: "BA.5.2.1",
            children: []
          }, {
            name: "BA.5.2.2",
            children: []
          }, {
            name: "BA.5.2.3",
            children: []
          }, {
            name: "BA.5.2.4",
            children: []
          }, {
            name: "BA.5.2.5",
            children: []
          }, {
            name: "BA.5.2.6",
            children: []
          }, {
            name: "BA.5.2.7",
            children: []
          }, {
            name: "BA.5.2.8",
            children: []
          }, {
            name: "BA.5.2.9",
            children: []
          }, {
            name: "BA.5.2.10",
            children: []
          }, {
            name: "BA.5.2.11",
            children: []
          }, {
            name: "BA.5.2.12",
            children: []
          }, {
            name: "BA.5.2.13",
            children: []
          }, {
            name: "BA.5.2.14",
            children: []
          }, {
            name: "BA.5.2.15",
            children: []
          }, {
            name: "BA.5.2.16",
            children: []
          }, {
            name: "BA.5.2.17",
            children: []
          }, {
            name: "BA.5.2.18",
            children: []
          }, {
            name: "BA.5.2.19",
            children: []
          }, {
            name: "BA.5.2.20",
            children: []
          }, {
            name: "BA.5.2.21",
            children: []
          }, {
            name: "BA.5.2.22",
            children: []
          }, {
            name: "BA.5.2.23",
            children: []
          }, {
            name: "BA.5.2.24",
            children: []
          }, {
            name: "BA.5.2.25",
            children: []
          }, {
            name: "BA.5.2.26",
            children: []
          }, {
            name: "BA.5.2.27",
            children: []
          }, {
            name: "BA.5.2.28",
            children: []
          }, {
            name: "BA.5.2.29",
            children: []
          }, {
            name: "BA.5.2.30",
            children: []
          }, {
            name: "BA.5.2.31",
            children: []
          }, {
            name: "BA.5.2.32",
            children: []
          }, {
            name: "BA.5.2.33",
            children: []
          }, {
            name: "BA.5.2.34",
            children: []
          }, {
            name: "BA.5.2.35",
            children: []
          }, {
            name: "BA.5.2.36",
            children: []
          }, {
            name: "BA.5.2.37",
            children: []
          }, {
            name: "BA.5.2.38",
            children: []
          }, {
            name: "BA.5.2.39",
            children: []
          }, {
            name: "BA.5.2.40",
            children: []
          }, {
            name: "BA.5.2.41",
            children: []
          }, ]
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
        .force("charge", forceManyBody().strength(-150))
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
        .attr("r", d => 5 / ((d.depth + 1) / 2))

      const label = select(this.$refs.labels)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.data.name)
        .classed("hidden", d => d.depth > 1)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("fill", "red")
        // .attr("x", d => d.x)
        // .attr("y", d => d.y)

      console.log(nodes)
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

        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });
    }
  }
}
</script>

<style lang="scss">
svg {}
</style>
