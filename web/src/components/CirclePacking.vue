<template>
  <div class="position-relative">
    <svg
      :width="width"
      :height="height"
      class="circle-packing"
      ref="circle_packing"
    >
      <defs></defs>
    </svg>
    <div
      ref="circle_tooltip"
      class="circle-pack-tooltip box-shadow rounded hidden position-absolute  px-3 py-2"
    ></div>
  </div>
</template>

<script>
import Vue from 'vue';

import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  event,
  pack,
  hierarchy,
  max,
} from 'd3';
// from https://observablehq.com/@d3/marimekko-chart
export default Vue.extend({
  name: 'CirclePacking',
  props: {
    data: Object,
    query: String,
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
        left: 10,
      },
      // axes
      y: scaleLinear(),
      x: scaleTime(),
      opacity: scaleLinear().range([1, 0.3]),
      // refs
      svg: null,
      svgDefs: null,
      // data
      nodes: null,
      // methods
      pack: null,
    };
  },
  watch: {
    data() {
      this.updatePlot();
    },
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  },
  methods: {
    tooltipOn(d) {
      select(this.$refs.circle_tooltip)
        .classed('hidden', false)
        .style('top', event.layerY + 'px')
        .style('left', event.layerX + 'px')
        .html(
          d.depth === 1
            ? `Search ${d.data.name}s`
            : `Search ${d.data.name} ${d.parent.data.name}s`,
        );

      this.svg.selectAll('.circle-group').style('opacity', 0.25);

      this.svg.selectAll('.annotation--type').style('opacity', 0.25);

      this.svg.select(`.${d.data.name.replace(' ', '_')}`).style('opacity', 1);

      if (d.depth === 1) {
        this.svg.selectAll(`.${d.data.name}`).style('opacity', 1);
      }
    },
    tooltipOff(d) {
      select(this.$refs.circle_tooltip).classed('hidden', true);

      this.svg.selectAll('.annotation--type').style('opacity', 1);

      this.svg.selectAll('.circle-group').style('opacity', 1);
    },
    searchResource(d) {
      if (d.depth === 1) {
        this.$router.push({
          name: 'Resources',
          query: {
            q: this.query,
            filter: `@type:${d.data.name}`,
            page: '0',
            size: '10',
            sort: '-date',
          },
        });
      } else {
        this.$router.push({
          name: 'Resources',
          query: {
            q: this.query,
            filter: `@type:${d.parent.data.name};curatedBy.name:${d.data.term}`,
            page: '0',
            size: '10',
            sort: '-date',
          },
        });
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.circle_packing);

      this.svgDefs = this.svg.select('defs');

      this.pack = pack()
        .size([
          this.width - this.margin.left - this.margin.right,
          this.height - this.margin.top - this.margin.bottom,
        ])
        .padding(3);
    },
    prepData() {
      this.data.children.forEach((source) => {
        source.children.sort((a, b) => b.count - a.count);

        source.children.forEach((d, i) => {
          d['idx'] = i / (source.children.length - 1);
        });
      });
      let root = hierarchy(this.data)
        .sum((d) => d.count)
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
      return r > 0
        ? `M${cx - r},${cy}a${r},${r} 0 1,1 ${2 * r},0a${r},${r} 0 1,1 -${2 *
            r},0`
        : null;
    },
    drawPlot() {
      const dataMax = max(
        this.data.children.flatMap((d) => d.children).flatMap((d) => d.count),
      );
      const textThresh = dataMax / 30;
      const typeThresh = dataMax / 40;

      const circles = this.svg
        .selectAll('circle')
        .data(this.nodes.filter((d) => d.depth));

      circles.join((enter) => {
        const grp = enter
          .append('g')
          .attr(
            'class',
            (d) => `circle-group pointer ${d.data.name.replace(' ', '_')}`,
          );

        grp
          .append('circle')
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y)
          .attr('r', (d) => d.r)
          .attr('class', (d) =>
            d.depth === 1
              ? `resource-count ${d.data.name} depth${d.depth}`
              : `resource-count ${d.parent.data.name} depth${d.depth}`,
          )
          .attr('id', (d) => `circle-${d.data.name.replace(' ', '_')}`)
          .attr('fill-opacity', (d) => this.opacity(d.data.idx))
          .classed('tiny', (d) => d.value < 100)
          .on('mouseenter', (d) => this.tooltipOn(d))
          .on('mouseleave', (d) => this.tooltipOff())
          .on('click', (d) => this.searchResource(d));

        // text annotation
        grp
          .filter((d) => d.depth === 2 && d.value > textThresh)
          .append('text')
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y)
          .append('tspan')
          .text((d) => d.data.name)
          .attr('class', (d) =>
            d.depth === 1
              ? `annotation--source ${d.data.name} depth${d.depth}`
              : `annotation--source ${d.parent.data.name} depth${d.depth}`,
          )
          .append('tspan')
          .text((d) => d.value.toLocaleString())
          .attr('x', (d) => d.x)
          .attr('dy', '1.1em')
          .attr('class', 'annotation--count')
          .on('mouseenter', (d) => this.tooltipOn(d))
          .on('mouseleave', (d) => this.tooltipOff())
          .on('click', (d) => this.searchResource(d));
      });

      const text = this.svg
        .selectAll('.annotation--type')
        .data(this.nodes.filter((d) => d.depth === 1 && d.value > typeThresh));

      const textPaths = this.svgDefs
        .selectAll('path')
        .data(this.nodes.filter((d) => d.depth === 1));

      textPaths.join((enter) => {
        enter
          .append('path')
          .attr('d', (d) => this.circle2Path(d.x, d.y, d.r))
          .attr('transform', (d) => `rotate(-90 ${d.x} ${d.y})`)
          .attr('id', (d, i) => `textpath${i}`);
      });

      text.join((enter) => {
        enter
          .append('text')
          .append('textPath')
          .attr('href', (d, i) => `#textpath${i}`)
          // .attr("textLength", 200)
          .attr('startOffset', '50%')
          .attr('class', (d) => `annotation--type pointer ${d.data.name}`)
          .text((d) => d.data.name.replace('ClinicalTrial', 'Clinical Trial'))
          .on('mouseover', (d) => this.tooltipOn(d))
          .on('mouseout', (d) => this.tooltipOff())
          .on('click', (d) => this.searchResource(d));
      });
    },
  },
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
  stroke-dasharray: 6, 4;
}

.tiny {
  stroke-dasharray: 1, 0 !important;
  stroke-width: 1 !important;
}

.Publication.depth1 {
  stroke: $publication-color;
}

.Publication.depth2 {
  fill: $publication-color;
}

.ClinicalTrial.depth1 {
  stroke: $clinical-trial-color;
}

.ClinicalTrial.depth2 {
  fill: $clinical-trial-color;
}

.Dataset.depth1 {
  stroke: $dataset-color;
}

.Dataset.depth2 {
  fill: $dataset-color;
}

.Protocol.depth1 {
  stroke: $protocol-color;
}

.Protocol.depth2 {
  fill: $protocol-color;
}

.Book.depth1 {
  stroke: $book-color;
}

.Book.depth2 {
  fill: $book-color;
}

.Website.depth1 {
  stroke: $website-color;
}

.Website.depth2 {
  fill: $website-color;
}

.SoftwareSourceCode.depth1 {
  stroke: $software-color;
}

.SoftwareSourceCode.depth2 {
  fill: $software-color;
}

.ComputationalTool.depth1 {
  stroke: $software-color;
}

.ComputationalTool.depth2 {
  fill: $software-color;
}

.Analysis.depth1 {
  stroke: $analysis-color;
}

.Analysis.depth2 {
  fill: $analysis-color;
}

.ImageObject.depth1 {
  stroke: $image-color;
}

.ImageObject.depth2 {
  fill: $image-color;
}

.annotation--source,
.annotation--type {
  text-anchor: middle;
  dominant-baseline: central;
  font-weight: 700;
}

.annotation--source {
  fill: $base-grey !important;
  pointer-events: none;
}

.annotation--type {
  text-transform: uppercase;
}

.annotation--type.Publication {
  font-size: 1.15em;
  fill: darken($publication-color, 25%);
}

.annotation--type.ClinicalTrial {
  font-size: 1em;
  fill: darken($clinical-trial-color, 25%);
}

.annotation--type.Dataset {
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
