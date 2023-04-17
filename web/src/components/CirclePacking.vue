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
      class="circle-pack-tooltip box-shadow rounded hidden position-absolute px-3 py-2"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { max } from 'd3-array';
import { pack, hierarchy } from 'd3-hierarchy';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, event } from 'd3-selection';

const props = defineProps({
  data: Object,
  query: String,
});

// instead of this.$router
const router = useRouter();

const colorScale = ref(null);
const width = ref(420);
const height = ref(420);
const margin = ref({
  top: 10,
  bottom: 10,
  right: 10,
  left: 10,
});
// axes
const x = ref(scaleLinear());
const y = ref(scaleTime());
const opacity = ref(scaleLinear().range([1, 0.3]));
// refs
const svg = ref(null);
const svgDefs = ref(null);
// data
const nodes = ref(null);
// methods * previous name: pack - should be named differently with pack method in d3 hierarchy
const packF = ref(null);
// variables instead of this.$refs
const circle_tooltip = ref(null);
const circle_packing = ref(null);

const tooltipOn = (d) => {
  select(circle_tooltip.value)
    .classed('hidden', false)
    .style('top', event.layerY + 'px')
    .style('left', event.layerX + 'px')
    .html(
      d.depth === 1
        ? `Search ${d.data.name}s`
        : `Search ${d.data.name} ${d.parent.data.name}s`,
    );

  svg.value.selectAll('.circle-group').style('opacity', 0.25);

  svg.value.selectAll('.annotation--type').style('opacity', 0.25);

  svg.value.select(`.${d.data.name.replace(' ', '_')}`).style('opacity', 1);

  if (d.depth === 1) {
    svg.value.selectAll(`.${d.data.name}`).style('opacity', 1);
  }
};

const tooltipOff = (d) => {
  select(circle_tooltip.value).classed('hidden', true);

  svg.value.selectAll('.annotation--type').style('opacity', 1);

  svg.value.selectAll('.circle-group').style('opacity', 1);
};

const searchResource = (d) => {
  if (d.depth === 1) {
    router.push({
      name: 'Resources',
      query: {
        q: props.query,
        filter: `@type:${d.data.name}`,
        page: '0',
        size: '10',
        sort: '-date',
      },
    });
  } else {
    router.push({
      name: 'Resources',
      query: {
        q: props.query,
        filter: `@type:${d.parent.data.name};curatedBy.name:${d.data.term}`,
        page: '0',
        size: '10',
        sort: '-date',
      },
    });
  }
};

const setupPlot = () => {
  svg.value = select(circle_packing.value);

  svgDefs.value = svg.value.select('defs');

  packF.value = pack()
    .size([
      width.value - margin.value.left - margin.value.right,
      height.value - margin.value.top - margin.value.bottom,
    ])
    .padding(3);
};

const prepData = () => {
  props.data.children.forEach((source) => {
    source.children.sort((a, b) => b.count - a.count);

    source.children.forEach((d, i) => {
      d['idx'] = i / (source.children.length - 1);
    });
  });
  let root = hierarchy(props.data)
    .sum((d) => d.count)
    .sort(function (a, b) {
      return b.value - a.value;
    });

  nodes.value = packF.value(root).descendants();
};

const updatePlot = () => {
  if (props.data) {
    prepData();
    drawPlot();
  }
};

const circle2Path = (cx, cy, r) => {
  r = r - 10;
  return r > 0
    ? `M${cx - r},${cy}a${r},${r} 0 1,1 ${2 * r},0a${r},${r} 0 1,1 -${2 * r},0`
    : null;
};

const drawPlot = () => {
  const dataMax = max(
    props.data.children.flatMap((d) => d.children).flatMap((d) => d.count),
  );
  const textThresh = dataMax / 30;
  const typeThresh = dataMax / 40;

  const circles = svg.value
    .selectAll('circle')
    .data(nodes.value.filter((d) => d.depth));

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
      .attr('fill-opacity', (d) => opacity.value(d.data.idx))
      .classed('tiny', (d) => d.value < 100)
      .on('mouseenter', (d) => tooltipOn(d))
      .on('mouseleave', (d) => tooltipOff())
      .on('click', (d) => searchResource(d));

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
      .on('mouseenter', (d) => tooltipOn(d))
      .on('mouseleave', (d) => tooltipOff())
      .on('click', (d) => searchResource(d));
  });

  const text = svg.value
    .selectAll('.annotation--type')
    .data(nodes.value.filter((d) => d.depth === 1 && d.value > typeThresh));

  const textPaths = svgDefs.value
    .selectAll('path')
    .data(nodes.value.filter((d) => d.depth === 1));

  textPaths.join((enter) => {
    enter
      .append('path')
      .attr('d', (d) => circle2Path(d.x, d.y, d.r))
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
      .on('mouseover', (d) => tooltipOn(d))
      .on('mouseout', (d) => tooltipOff())
      .on('click', (d) => searchResource(d));
  });
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
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
