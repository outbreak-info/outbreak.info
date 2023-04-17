<template>
  <div class="overflow-auto" :class="{ 'w-75': isOverflow }">
    <svg
      ref="svgRef"
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
      class="mutation-heatmap"
      name="Mutations by lineage"
      :subtitle="gene"
      :style="{ background: bgColor }"
    >
      <defs>
        <pattern
          id="diagonalHatchDark"
          width="5"
          height="5"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            :style="`stroke:${strokeColor}; stroke-width:0.75`"
          />
        </pattern>
        <pattern
          id="diagonalHatchLight"
          width="7"
          height="7"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <rect x="-2" y="-2" width="10" height="10" fill="#efefef" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="25"
            :style="`stroke:#CCC; stroke-width:4`"
          />
        </pattern>
      </defs>
      <g
        ref="xAxisTopRef"
        class="axis axis--x"
        :transform="`translate(${margin.left}, ${margin.top - 5})`"
      />
      <g
        ref="xAxisBottomRef"
        class="axis axis--x"
        :transform="`translate(${margin.left}, ${margin.top + height + 5})`"
      />
      <g
        id="heatmap-base"
        ref="heatmapBaseRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        id="heatmap"
        ref="heatmapRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
    </svg>

    <!-- TOOLTIPS -->
    <div
      id="tooltip-prevalence"
      ref="tooltip_heatmap"
      class="tooltip-basic tooltip-dark box-shadow"
    >
      <div class="d-flex border-bottom align-items-center">
        <div class="d-flex">
          <h5 id="mutation" />
          <div id="mutationOfInterest" class="fa-sm font-weight-bold" />
        </div>
        <span class="mx-2 text-muted">in</span>
        <div class="d-flex">
          <h5 id="lineage" />
          <div id="lineageOfInterest" class="fa-sm font-weight-bold" />
        </div>
      </div>
      <div id="prevalence" class="d-flex align-items-center pt-2">
        <div id="value" class="fa-lg" />
        <small class="ml-2 text-muted">of all sequences</small>
      </div>
      <div id="count" />
      <div id="not-detected" class="text-muted">not detected</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { axisBottom, axisTop } from 'd3-axis';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { selectAll, select, event } from 'd3-selection';
import { scaleBand } from 'd3-scale';
import { interpolateRdPu } from 'd3-scale-chromatic';
import cloneDeep from 'lodash/cloneDeep';
import tippy from 'tippy.js';
import 'tippy.js/themes/light.css';

const props = defineProps({
  data: Array,
  gene: String,
  locationID: String,
  dark: {
    type: Boolean,
    default: false,
  },
  moc: {
    type: Array,
    default: () => [],
  },
  moi: {
    type: Array,
    default: () => [],
  },
  voi: {
    type: Array,
    default: () => [],
  },
  voc: {
    type: Array,
    default: () => [],
  },
  bandWidth: {
    type: Number,
    default: 25,
  },
  xVar: {
    type: String,
    default: 'mutation_simplified',
  },
  yVar: {
    type: String,
    default: 'pangolin_lineage',
  },
  routeTo: {
    type: String,
    default: 'MutationReport',
  },
  yDomain: Array,
  onlyTopAxis: {
    type: Boolean,
    default: false,
  },
});

// this.$router
const router = useRouter();

const margin = ref({
  top: 72,
  right: 325,
  bottom: 72,
  left: 250,
});
const isOverflow = ref(false);
// UI
const sortVar = ref('codon_um');
// constants
const rx = ref(4);
const strokeColor = ref('#AAA');
const concernColor = ref('#fb5759');
const interestColor = ref('#feb56c');
const concernColorDark = ref('#e15759');
const interestColorDark = ref('#f28e2c');
const lineageWarningThreshold = ref(1000);
// scales
const x = ref(scaleBand());
const y = ref(scaleBand());
const paddingInner = ref(0.1);
const xAxisTop = ref(null);
const xAxisBottom = ref(null);
const width = ref(null);
const height = ref(null);
const colorScale = ref(interpolateRdPu);
// references
const svg = ref(null);
const heatmap = ref(null);
const heatmapBase = ref(null);
// data
const base = ref(null);
const plottedData = ref(null);
const xDomain = ref(null);
// variables to replace this.$refs
const svgRef = ref(null);
const heatmapRef = ref(null);
const heatmapBaseRef = ref(null);
const xAxisTopRef = ref(null);
const xAxisBottomRef = ref(null);
const tooltip_heatmap = ref(null);

const bgColor = computed(() => {
  return props.dark ? '#343a40' : 'none';
});

const textColor = computed(() => {
  return props.dark ? '#efefef' : '#555555';
});

const routeToName = computed(() => {
  return props.routeTo.includes('GenomicsEmbed')
    ? 'GenomicsEmbed'
    : 'MutationReport';
});

const setupPlot = () => {
  if (props.onlyTopAxis) {
    margin.value.top = 62;
    margin.value.left = 5;
    margin.value.right = 27;
    margin.value.bottom = 5;
  }

  svg.value = select(svgRef.value);
  heatmap.value = select(heatmapRef.value);
  heatmapBase.value = select(heatmapBaseRef.value);
};

const updateScales = () => {
  x.value = scaleBand()
    .paddingInner(paddingInner.value)
    .domain(plottedData.value.map((d) => d[props.xVar]));

  xDomain.value = x.value.domain();

  width.value = xDomain.value.length * props.bandWidth;
  isOverflow.value = width.value > 0.95 * window.innerWidth;
  x.value.range([0, width.value]);

  y.value = scaleBand().paddingInner(paddingInner.value).domain(props.yDomain);

  height.value = props.yDomain.length * props.bandWidth;
  y.value.range([0, height.value]);

  if (!props.onlyTopAxis) {
    xAxisBottom.value = axisBottom(x.value).tickSizeOuter(0);
    select(xAxisBottomRef.value).call(xAxisBottom.value);
  }

  xAxisTop.value = axisTop(x.value).tickSizeOuter(0);
  select(xAxisTopRef.value).call(xAxisTop.value);

  base.value = xDomain.value
    .map((x) => {
      return props.yDomain.map((y) => {
        const obj = {};
        obj[props.xVar] = x;
        obj[props.yVar] = y;
        obj['id'] = `base_${cleanSelectors(x)}-${cleanSelectors(y)}`;
        return obj;
      });
    })
    .flatMap((d) => d);
};

const cleanSelectors = (id) => {
  return id
    .replace(/:/g, '_')
    .replace(/\//g, '_')
    .replace(/\*\s\[/g, '_')
    .replace(/\s\(/g, '_')
    .replace(/\)\]/g, '_')
    .replace(/\s\+\s/g, '--')
    .replace(/:/g, '_')
    .replace(/\*/g, 'stop')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\./g, '-')
    .replace(/\s/g, '_');
};

const prepData = () => {
  plottedData.value = cloneDeep(props.data);
  plottedData.value.sort((a, b) => a.codon_num - b.codon_num);
};

const updatePlot = () => {
  if (props.data) {
    prepData();
    updateScales();
    drawPlot();
  }
};

const tooltipOn = (d) => {
  const ttipShift = 10;
  const ttip = select(tooltip_heatmap.value);

  // turn off the rest
  svg.value.selectAll('rect').style('fill-opacity', 0.2);

  svg.value
    .select(`#${d.id}`)
    .style('fill-opacity', 1)
    .style('stroke-width', 1.5);

  // update text
  ttip.select('#lineage').text(d.pangolin_lineage);

  ttip
    .select('#lineageOfInterest')
    .html(
      props.voc.includes(d.pangolin_lineage)
        ? '<sup>*</sup> VOC'
        : props.voi.includes(d.pangolin_lineage)
        ? '<sup>*</sup> VOI'
        : '',
    )
    .style(
      'color',
      props.voc.includes(d.pangolin_lineage)
        ? concernColorDark.value
        : props.voi.includes(d.pangolin_lineage)
        ? interestColorDark.value
        : textColor.value,
    );

  ttip.select('#mutation').text(d.mutation_simplified);

  ttip
    .select('#mutationOfInterest')
    .html(
      props.moc.includes(d.mutation_simplified)
        ? '<sup>*</sup> MOC'
        : props.moi.includes(d.mutation_simplified)
        ? '<sup>*</sup> MOI'
        : '',
    )
    .style(
      'color',
      props.moc.includes(d.mutation_simplified)
        ? concernColorDark.value
        : props.moi.includes(d.mutation_simplified)
        ? interestColorDark.value
        : textColor.value,
    );

  if (d.prevalence) {
    ttip
      .select('#value')
      .text(d.prevalence < 0.0005 ? '< 0.1%' : format('.1%')(d.prevalence));

    ttip
      .select('#count')
      .text(
        `(${format(',')(d.mutation_count)} / ${format(',')(d.lineage_count)})`,
      );

    ttip.select('#prevalence').classed('hidden', false);

    ttip.select('#count').classed('hidden', false);

    ttip.select('#not-detected').classed('hidden', true);
  } else {
    ttip.select('#prevalence').classed('hidden', true);

    ttip.select('#count').classed('hidden', true);

    ttip.select('#not-detected').classed('hidden', false);
  }
  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOff = () => {
  svg.value
    .selectAll('rect')
    .style('stroke-width', 0.5)
    .style('fill-opacity', 1);

  select(tooltip_heatmap.value).style('display', 'none');
};

const highlightRow = (d) => {
  svg.value.selectAll('.y-axis-right').style('opacity', 0.2);
  svg.value.selectAll('.y-axis-left').style('opacity', 0.2);

  svg.value.selectAll('rect').style('fill-opacity', 0.2);

  svg.value
    .selectAll(`.${cleanSelectors(d)}`)
    .style('fill-opacity', 1)
    .style('opacity', 1);
};

const highlightColumn = (d) => {
  select(xAxisBottomRef.value).selectAll('text').style('opacity', 0.2);

  select(xAxisTopRef.value).selectAll('text').style('opacity', 0.2);

  svg.value.selectAll('rect').style('fill-opacity', 0.2);

  svg.value
    .selectAll(`.${cleanSelectors(d)}`)
    .style('fill-opacity', 1)
    .style('opacity', 1);
};

const highlightOff = (d) => {
  select(xAxisBottomRef.value).selectAll('text').style('opacity', 1);

  select(xAxisTopRef.value).selectAll('text').style('opacity', 1);

  svg.value.selectAll('.y-axis-left').style('opacity', 1);

  svg.value.selectAll('.y-axis-right').style('opacity', 1);

  svg.value.selectAll('rect').style('fill-opacity', 1);
};

const route2Lineage = (pango, is_alias) => {
  if (is_alias) {
    if (routeToName.value === 'GenomicsEmbed') {
      router.push({
        name: routeToName.value,
        query: {
          alias: pango,
          loc: props.locationID,
          selected: props.locationID,
        },
      });
    } else {
      router.push({
        name: routeToName.value,
        params: {
          alias: pango.toLowerCase(),
        },
        query: {
          loc: props.locationID,
          selected: props.locationID,
        },
      });
    }
  } else {
    router.push({
      name: routeToName.value,
      query: {
        loc: props.locationID,
        pango: pango,
        selected: props.locationID,
      },
    });
  }
};

const route2LineageMutation = (d) => {
  if (d.is_alias) {
    router.push({
      name: routeToName.value,
      params: {
        alias: d[props.yVar].toLowerCase(),
      },
      query: {
        loc: props.locationID,
        muts: d.mutation,
        selected: props.locationID,
      },
    });
  } else {
    router.push({
      name: routeToName.value,
      query: {
        loc: props.locationID,
        pango: d[props.yVar],
        muts: d.mutation,
        selected: props.locationID,
      },
    });
  }
};

const route2Mutation = (mut) => {
  router.push({
    name: routeToName.value,
    query: {
      loc: props.locationID,
      muts: `${props.gene}:${mut}`,
      selected: props.locationID,
    },
  });
};

const drawPlot = () => {
  // base: no values
  const heatmapBaseSelector = heatmapBase.value
    .selectAll('.heatmap-base')
    .data(base.value);

  heatmapBaseSelector.join(
    (enter) => {
      enter
        .append('rect')
        .attr('class', 'heatmap-base')
        .attr('id', (d) => d.id)
        .attr('x', (d) => x.value(d[props.xVar]))
        .attr('width', x.value.bandwidth())
        .attr('y', (d) => y.value(d[props.yVar]))
        .attr('height', y.value.bandwidth())
        .style(
          'fill',
          props.dark ? 'url(#diagonalHatchDark)' : 'url(#diagonalHatchLight)',
        )
        .style('stroke', '#888')
        .style('stroke-width', 0.5)
        .style('rx', rx.value);
    },
    (update) => {
      update
        .attr('id', (d) => d.id)
        .attr('x', (d) => x.value(d[props.xVar]))
        .attr('width', x.value.bandwidth())
        .attr('y', (d) => y.value(d[props.yVar]))
        .attr('height', y.value.bandwidth())
        .transition()
        .duration(250)
        .style('fill-opacity', 0)
        .transition()
        .duration(250)
        .style('fill-opacity', 1)
        .style(
          'fill',
          props.dark ? 'url(#diagonalHatchDark)' : 'url(#diagonalHatchLight)',
        );
    },
    (exit) =>
      exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
  );

  // heatmap
  const heatmapSelector = heatmap.value
    .selectAll('.heatmap')
    .data(plottedData.value, (d) => d.id);

  heatmapSelector.join(
    (enter) => {
      enter
        .append('rect')
        .attr(
          'class',
          (d) =>
            `heatmap pointer ${cleanSelectors(d[props.xVar])} ${cleanSelectors(
              d[props.yVar],
            )}`,
        )
        .attr('id', (d) => d.id)
        .attr('x', (d) => x.value(d[props.xVar]))
        .attr('width', x.value.bandwidth())
        .attr('y', (d) => y.value(d[props.yVar]))
        .attr('height', y.value.bandwidth())
        .style('fill', (d) => colorScale.value(d.prevalence))
        // .attr("transform", d => d[this.yVar]  == "average" ? "translate(0,10)" : "translate(0,0)")
        .style('stroke', '#888')
        .style('stroke-width', 0.5)
        .style('rx', rx.value);
    },
    (update) => {
      update
        .attr('id', (d) => d.id)
        .attr(
          'class',
          (d) =>
            `heatmap pointer ${cleanSelectors(d[props.xVar])} ${cleanSelectors(
              d[props.yVar],
            )}`,
        )
        .attr('x', (d) => x.value(d[props.xVar]))
        .attr('width', x.value.bandwidth())
        .attr('y', (d) => y.value(d[props.yVar]))
        .attr('height', y.value.bandwidth())
        .style('fill', (d) => colorScale.value(d.prevalence));
    },
    (exit) =>
      exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
  );

  const yDomainFull = nest()
    .key((d) => d[props.yVar])
    .rollup((values) => {
      return {
        is_alias: values[0].is_alias,
        count: values[0].lineage_count,
      };
    })
    .entries(props.data)
    .map((d) => {
      return {
        key: d.key,
        value: d.value.count,
        is_alias: d.value.is_alias,
      };
    });

  if (!props.onlyTopAxis) {
    const yAxisRightSelector = heatmap.value
      .selectAll('.y-axis-right')
      .data(yDomainFull, (d) => d.key);

    yAxisRightSelector.join(
      (enter) => {
        const grp = enter
          .append('text')
          .attr('class', (d) => `y-axis-right ${cleanSelectors(d.key)}`)
          .attr('x', width.value)
          .attr('y', (d) => y.value(d.key) + y.value.bandwidth() / 2)
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('fill', textColor.value)
          .style('dominant-baseline', 'central')
          .on('mouseover', (d) => highlightRow(d.key))
          .on('mouseout', highlightOff);

        grp
          .append('tspan')
          .attr('class', 'y-axis-lineage')
          .classed('hover-underline', 'true')
          .classed('pointer', 'true')
          .style('fill', (d) =>
            props.voc.includes(d.key)
              ? props.dark
                ? concernColor.value
                : concernColorDark.value
              : props.voi.includes(d.key)
              ? props.dark
                ? interestColor.value
                : interestColorDark.value
              : textColor.value,
          )
          .style('font-size', 18)
          .attr('dx', 10)
          .text((d) => d.key)
          .on('click', (d) => route2Lineage(d.key, d.is_alias));

        grp
          .append('tspan')
          .attr('class', 'y-axis-count')
          // .attr("x", this.width + this.margin.right)
          // .style("text-anchor", "end")
          .style('font-size', 14)
          .style('fill', props.dark ? '#d2d2d2' : '#999')
          .attr('dx', 7)
          // .attr("dx", -5)
          .text((d, i) =>
            i === 0
              ? `(${format(',')(d.value)} seqs)`
              : `(${format(',')(d.value)})`,
          );

        grp
          .append('tspan')
          .attr('class', 'fa fa-exclamation-circle')
          .attr('font-family', 'FontAwesome')
          .attr('dx', 7)
          .attr(
            'data-tippy-info',
            (d) =>
              `<span class='text-underline'>Warning</span>: currently, there are only <b>${d.value} sequences</b> reported for <b>${d.key}</b>. The characteristic mutations for ${d.key} may change as more sequences are reported. <a href='https://outbreak.info/situation-reports/methods#characteristic'>(read more)</a>`,
          )
          .classed('hidden', (d) => d.value >= lineageWarningThreshold.value)
          .classed('low-count', (d) => d.value < lineageWarningThreshold.value)
          .style('font-size', 14)
          .style('fill', '#D13B62')
          .text('\uf06a');
      },
      (update) => {
        update
          .attr('class', (d) => `y-axis-right ${cleanSelectors(d.key)}`)
          .attr('x', width.value)
          .attr('y', (d) => y.value(d.key) + y.value.bandwidth() / 2);

        update
          .select('.y-axis-lineage')
          .text((d) => d.key)
          .style('fill', (d) =>
            props.voc.includes(d.key)
              ? props.dark
                ? concernColor.value
                : concernColorDark.value
              : props.voi.includes(d.key)
              ? props.dark
                ? interestColor.value
                : interestColorDark.value
              : textColor.value,
          );

        update
          .select('.y-axis-count')
          .style('fill', props.dark ? '#d2d2d2' : '#999')
          .text((d, i) =>
            i === 0
              ? `(${format(',')(d.value)} seqs)`
              : `(${format(',')(d.value)})`,
          );

        update
          .select('.fa-exclamation-circle')
          .classed('hidden', (d) => d.value >= lineageWarningThreshold.value)
          .classed('low-count', (d) => d.value < lineageWarningThreshold.value);
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    const yAxisLeftSelector = heatmap.value
      .selectAll('.y-axis-left')
      .data(yDomainFull, (d) => d.key);

    yAxisLeftSelector.join(
      (enter) => {
        const grp = enter
          .append('text')
          .attr('class', (d) => `y-axis-left ${cleanSelectors(d.key)}`)
          .attr('x', 0)
          .attr('y', (d) => y.value(d.key) + y.value.bandwidth() / 2)
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('fill', textColor.value)
          .style('text-anchor', 'end')
          .style('dominant-baseline', 'central')
          .on('mouseover', (d) => highlightRow(d.key))
          .on('mouseout', highlightOff);

        grp
          .append('tspan')
          .attr('class', 'y-axis-lineage')
          .classed('hover-underline', 'true')
          .classed('pointer', 'true')
          .style('fill', (d) =>
            props.voc.includes(d.key)
              ? props.dark
                ? concernColor.value
                : concernColorDark.value
              : props.voi.includes(d.key)
              ? props.dark
                ? interestColor.value
                : interestColorDark.value
              : textColor.value,
          )
          .style('font-size', 18)
          .attr('dx', -10)
          .text((d) => d.key)
          .on('click', (d) => route2Lineage(d.key, d.is_alias));
      },
      (update) => {
        update
          .attr('class', (d) => `y-axis-left ${cleanSelectors(d.key)}`)
          .attr('y', (d) => y.value(d.key) + y.value.bandwidth() / 2);

        update
          .select('.y-axis-lineage')
          .text((d) => d.key)
          .style('fill', (d) =>
            props.voc.includes(d.key)
              ? props.dark
                ? concernColor.value
                : concernColorDark.value
              : props.voi.includes(d.key)
              ? props.dark
                ? interestColor.value
                : interestColorDark.value
              : textColor.value,
          );
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );
  }

  // turn on tooltips
  svg.value
    .selectAll('rect')
    .on('click', (d) => route2LineageMutation(d))
    .on('mousemove', (d) => tooltipOn(d))
    .on('mouseleave', () => tooltipOff());

  // stylize the axis lines
  selectAll('.mutation-heatmap')
    .selectAll('.axis line')
    .style('stroke', textColor.value);

  // rotate and color axes :(
  select(xAxisTopRef.value)
    .selectAll('text')
    .attr('y', 0)
    .attr('dx', 6)
    .attr('dy', '-0.75em')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'start')
    .style('fill', (d) =>
      props.moc.includes(d)
        ? props.dark
          ? concernColor.value
          : concernColorDark.value
        : props.moi.includes(d)
        ? props.dark
          ? interestColor.value
          : interestColorDark.value
        : textColor.value,
    )
    .attr('class', (d) => `hover-underline pointer ${cleanSelectors(d)}`)
    .on('click', (d) => route2Mutation(d))
    .on('mouseover', (d) => highlightColumn(d))
    .on('mouseout', highlightOff);

  select(xAxisBottomRef.value)
    .selectAll('text')
    .attr('y', 0)
    .attr('dx', 6)
    .attr('dy', '1.25em')
    .attr('transform', 'rotate(35)')
    .style('text-anchor', 'start')
    .style('fill', (d) =>
      props.moc.includes(d)
        ? props.dark
          ? concernColor.value
          : concernColorDark.value
        : props.moi.includes(d)
        ? props.dark
          ? interestColor.value
          : interestColorDark.value
        : textColor.value,
    )
    .attr('class', (d) => `hover-underline pointer ${cleanSelectors(d)}`)
    .on('click', (d) => route2Mutation(d))
    .on('mouseover', (d) => highlightColumn(d))
    .on('mouseout', highlightOff);
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

watch(
  () => props.dark,
  () => {
    updatePlot();
  },
);

onMounted(() => {
  setupPlot();
  updatePlot();
  // this.$nextTick in optionsAPI
  nextTick(() => {
    tippy(svg.value.selectAll('.low-count').nodes(), {
      content: 'Loading...',
      maxWidth: '200px',
      placement: 'bottom',
      animation: 'fade',
      theme: 'light',
      allowHTML: true,
      interactive: true,
      appendTo: document.body,
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      },
    });
  });
});
</script>

<style lang="scss">
.mutation-heatmap .axis--x text,
.mutation-heatmap .axis--y text {
  /* fill: #efefef; */
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

.tooltip-dark {
  background: #ffffffeb !important;
}
</style>
