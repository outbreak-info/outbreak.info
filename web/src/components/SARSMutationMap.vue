<template>
  <div id="mutation-map" ref="svg_wrapper" class="">
    <svg
      ref="svgRef"
      :width="width"
      :height="height"
      :class="[copyable ? 'mutation-map' : 'mutation_map']"
      :name="`${mutationKey} characteristic mutations`"
    >
      <g id="gene-map-group" ref="gene_map">
        <g id="gene-group" ref="genesRef" class="genes" />
        <!-- <g ref="nucleotide_axis" class="axis axis--x"></g> -->
        <g
          id="substitution-group"
          ref="substitutions"
          class="mutations substitutions"
        />
        <g id="deletion-group" ref="deletions" class="mutations deletions" />
        <g v-if="mutationArr" id="brush-zoom" ref="brushRef" class="brush" />
      </g>
    </svg>

    <div
      id="tooltip-mutation"
      ref="tooltip_mutation"
      class="tooltip box-shadow"
    >
      <h5 />
    </div>
    <div id="tooltip-gene" ref="tooltip_gene" class="tooltip box-shadow">
      <h5 />
      <div id="gene-mutations" class="m-0 mb-2">
        <h6 class="m-0">Mutations</h6>
        <em id="no-substitutions">none</em>
        <ul id="mutation-list" class="m-0" />
      </div>
      <div id="gene-deletions">
        <h6 class="m-0">Deletions</h6>
        <em id="no-deletions">none</em>
        <ul id="deletion-list" class="m-0" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import chroma from 'chroma-js';
import { max } from 'd3-array';
import { brushX } from 'd3-brush';
import { forceCollide, forceSimulation, forceX } from 'd3-force';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { select, selectAll, event } from 'd3-selection';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';

import NT_MAP from '@/assets/genomics/sarscov2_NC045512_genes_nt.json';

const props = defineProps({
  mutationKey: String,
  copyable: {
    type: Boolean,
    default: false,
  },
  lineageMutations: Array,
  additionalMutations: Array,
  setWidth: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: 90,
  },
});

const margin = ref({
  top: 4,
  right: 25,
  bottom: 2,
  left: 15,
});
const maxWidth = ref(null);
const geneHeight = ref(25);
const mutationHeight = ref(55);
const aaCircleR = ref(9);
const geneDisplayThresh = ref(35);
// data
const ntMapArr = ref(null);
const mutationArr = ref(null);
const mutations = ref(null);
const deletions = ref(null);
// refs
const svg = ref(null);
const genes = ref(null);
const brush = ref(null);
const substitutionRef = ref(null);
const deletionRef = ref(null);
// scales
const x = ref(scaleLinear());
const geneColorScale = ref(null);
const colorDomain = ref([
  '#bab0ab', // lt grey -- UTRs
  '#1f77b4', // dk blue
  '#aec7e8', // lt blue
  '#f28e2c', // orange
  '#e15759', // red
  '#9edae5', // teal
  '#59a14f', // green
  '#edc949', // yellow
  '#9467bd', // purple
  '#ff9da7', // pink
  '#8c564b', // brown
  '#555555', // grey
  '#bcbd22', // puce
  '#bab0ab',
]);
const xAxis = ref(null);
// variables to replace this.$refs
const svgRef = ref(null);
const gene_map = ref(null);
const substitutions = ref(null);
const svg_wrapper = ref(null);
const brushRef = ref(null);
const genesRef = ref(null);
const tooltip_gene = ref(null);
const tooltip_mutation = ref(null);

// computed variables
const width = computed(() => {
  return props.setWidth ? props.setWidth : maxWidth.value;
});

const getMutation = (mut) => {
  return mut.mutation.toLowerCase();
};

const setupMutationArr = () => {
  if (!props.lineageMutations && props.additionalMutations)
    mutationArr.value = cloneDeep(props.additionalMutations);
  else if (props.lineageMutations && props.additionalMutations) {
    mutationArr.value = cloneDeep(props.lineageMutations);
    mutationArr.value.push(...props.additionalMutations);
  } else if (props.lineageMutations) {
    mutationArr.value = cloneDeep(props.lineageMutations);
  } else {
    mutationArr.value = null;
  }
  // remove duplicates, introduced by custom mutations on top of a lineage
  mutationArr.value = uniqBy(mutationArr.value, getMutation);
};

const setupPlot = () => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setDims);

    // set initial dimensions for the plots.
    setDims();
  });

  svg.value = select(svgRef.value);
  select(gene_map.value).attr(
    'transform',
    `translate(${margin.value.left},${margin.value.top})`,
  );

  genes.value = select(genesRef.value).attr(
    'transform',
    `translate(0,${mutationHeight.value})`,
  );

  substitutionRef.value = select(substitutions.value).attr(
    'transform',
    `translate(0,22)`,
  );

  deletionRef.value = select(deletions.value).attr(
    'transform',
    `translate(0,22)`,
  );
};

const setDims = () => {
  const wrapper = select(svg_wrapper.value).node();
  maxWidth.value = wrapper ? wrapper.offsetWidth : 1000;

  select(brushRef.value).on('mousemove', () => tooltipOn(x.value));
  select(brushRef.value).on('mouseleave', tooltipOff);
};

const updatePlot = () => {
  if (!width.value) {
    setDims();
  }
  updateScales();
  drawPlot();
};

const updateScales = () => {
  x.value = x.value
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain([0, max(ntMapArr.value, (d) => d.end)]);

  // Update brush so it spans the whole of the area
  brush.value = brushX()
    .extent([
      [0, 0],
      [
        width.value - margin.value.left - margin.value.right,
        props.height - margin.value.top - margin.value.bottom,
      ],
    ])
    .on('end', zoom);

  select(brushRef.value).call(brush.value).on('dblclick', resetAxis);
};

const tooltipOn = () => {
  const ttipXOffset = 35;
  const ttipYOffset = 125;
  if (mutationArr.value && mutationArr.value.length) {
    // Tooltip activation is a bit complicated, since I want to be able to zoom as well into the gene map.
    // That has to have a rect on top of everything which detects the pointer events.
    // So, splitting that rect into two halves; upper half is the mutation groups; lower half is the gene itself
    if (event.offsetY < mutationHeight.value) {
      const maxDiff = 25; // maximum allowable difference in pixels between the location of the symbol and the cursor
      // UPPER HALF: mutations and deletions
      let muts = cloneDeep(mutationArr.value);
      muts.forEach((d) => {
        d['tooltipDiff'] = Math.abs(event.offsetX - d.x);
      });
      muts.sort((a, b) => a.tooltipDiff - b.tooltipDiff);

      muts = muts.filter((d) => d.tooltipDiff <= maxDiff);

      const selectedMut = muts.length ? muts[0] : null;

      if (selectedMut) {
        // turn off mutations / other ttip
        svg.value.selectAll('.substitution').style('opacity', 0.3);

        svg.value.selectAll('.deletion').style('opacity', 0.3);

        select(tooltip_gene.value).style('display', 'none');

        // turn on selected mutations
        svg.value
          .selectAll(`#mutation_${selectedMut.gene}${selectedMut.codon_num}`)
          .style('opacity', 1);

        // tooltip on
        let ttip = select(tooltip_mutation.value);
        // edit text
        const ttipText =
          selectedMut.type === 'deletion'
            ? `<b>${selectedMut.mutation.split(':')[1]}</b> | ${
                props.mutationKey
              } | ${selectedMut.gene} gene`
            : `<b>${selectedMut.ref_aa}${selectedMut.codon_num}${selectedMut.alt_aa}</b> | ${props.mutationKey} | ${selectedMut.gene} gene`;
        ttip
          .select('h5')
          .style('color', geneColorScale.value(selectedMut.gene))
          .html(ttipText);

        ttip
          .style('left', `${event.offsetX + ttipXOffset}px`)
          .style('top', `${event.offsetY + ttipYOffset}px`)
          .style('border-color', geneColorScale.value(selectedMut.gene))
          .style(
            'background',
            chroma(geneColorScale.value(selectedMut.gene)).luminance(0.8),
          )
          .style('display', 'block');
      }
    } else {
      // LOWER HALF: gene map
      const selectedX = x.value.invert(event.offsetX);
      const selectedGenes = ntMapArr.value.filter(
        (d) => d.start <= selectedX && d.end >= selectedX,
      );

      if (selectedGenes.length === 1) {
        const selectedGene = selectedGenes[0].gene;

        const selectedMutations = mutationArr.value.filter(
          (d) => d.gene === selectedGene,
        );
        const selectedSubstitutions = selectedMutations.filter(
          (d) => d.type === 'substitution',
        );
        const selectedDeletions = selectedMutations.filter(
          (d) => d.type === 'deletion',
        );

        // turn genes off
        select(tooltip_mutation.value).style('display', 'none');

        svg.value.selectAll('.gene').style('opacity', 0.3);

        svg.value.selectAll('.substitution').style('opacity', 0.3);

        svg.value.selectAll('.deletion').style('opacity', 0.3);

        // turn selected gene on
        svg.value.selectAll(`.gene_${selectedGene}`).style('opacity', 1);

        // tooltip on
        let ttip = select(tooltip_gene.value);
        // edit text
        ttip
          .select('h5')
          .style('color', geneColorScale.value(selectedGene))
          .text(`${props.mutationKey} | ${selectedGene} gene`);

        if (selectedSubstitutions.length) {
          ttip.select('#no-substitutions').classed('hidden', true);
        } else {
          ttip.select('#no-substitutions').classed('hidden', false);
        }

        if (selectedDeletions.length) {
          ttip.select('#no-deletions').classed('hidden', true);
        } else {
          ttip.select('#no-deletions').classed('hidden', false);
        }

        const mutList = ttip
          .select('ul#mutation-list')
          .selectAll('li')
          .data(selectedSubstitutions);
        mutList.join(
          (enter) => {
            enter
              .append('li')
              .text((d) => `${d.ref_aa}${d.codon_num}${d.alt_aa}`);
          },
          (update) => {
            update.text((d) => `${d.ref_aa}${d.codon_num}${d.alt_aa}`);
          },
          (exit) =>
            exit.call((exit) =>
              exit.transition().duration(10).style('opacity', 1e-5).remove(),
            ),
        );

        const delList = ttip
          .select('ul#deletion-list')
          .selectAll('li')
          .data(selectedDeletions);
        delList.join(
          (enter) => {
            enter.append('li').text((d) => `${d.mutation.split(':')[1]}`);
          },
          (update) => {
            update.text((d) => `${d.mutation.split(':')[1]}`);
          },
          (exit) =>
            exit.call((exit) =>
              exit.transition().duration(10).style('opacity', 1e-5).remove(),
            ),
        );

        ttip
          .style('left', `${event.offsetX + ttipXOffset}px`)
          .style('top', `${event.offsetY + ttipYOffset}px`)
          .style('border-color', geneColorScale.value(selectedGene))
          .style(
            'background',
            chroma(geneColorScale.value(selectedGene)).luminance(0.8),
          )
          .style('display', 'block');
      }
    }
  }
};

const tooltipOff = () => {
  selectAll('.substitution').style('opacity', 1);

  selectAll('.deletion').style('opacity', 1);

  selectAll('.gene').style('opacity', 1);

  select(tooltip_mutation.value).style('display', 'none');
  select(tooltip_gene.value).style('display', 'none');
};

const zoom = () => {
  // reset domain to new coords
  const selection = event.selection;
  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);
    x.value = x.value.domain([newMin, newMax]);
    // update axis for tooltip rollover
    select('.brush').on('mousemove', () => tooltipOn());
    svg.value.select('.brush').call(brush.value.move, null);
    drawPlot();
  }
};

const resetAxis = () => {
  x.value = x.value.domain([0, max(ntMapArr.value, (d) => d.end)]);
  drawPlot();
};

const prepData = () => {
  if (mutationArr.value && mutationArr.value.length) {
    // 1) Convert amino acid coordinates into nucleotide coordinates
    // 2) Set up force direction to shift labels if they overlap

    // convert aa --> nucleotide coords
    mutationArr.value.forEach((d) => {
      const gene = NT_MAP[d.gene];
      const gene_offset = gene ? gene.start : 0;
      // calculating center of the nucleotide
      d['pos_nt'] = d.pos ? d.pos : (d.codon_num - 1) * 3 + gene_offset + 1;

      // set up for force direction
      d['fy'] = 0;
      d['targetX'] = x.value(d.pos_nt);
    });

    // Add force direction to avoid overlap
    // Define a custom force
    const forceClamp = (min, max) => {
      let nodes;
      const force = () => {
        nodes.forEach((n) => {
          if (n.x > max) n.x = max;
          if (n.x < min) n.x = min;
        });
      };
      force.initialize = (_) => (nodes = _);
      return force;
    };

    // Set up the force simulation
    const force = forceSimulation()
      .nodes(mutationArr.value)
      .force('collide', forceCollide(aaCircleR.value + 1.5).strength(0.1))
      .force('x', forceX((d) => d.targetX).strength(1))
      // clamp within bounds of the axes. Gets weird when you're zooming in.
      // .force("clamp", forceClamp(0, this.width - this.margin.left - this.margin.right))
      .stop();

    // Execute the simulation
    for (let i = 0; i < 300; i++) force.tick();

    // Tag if it moved:
    mutationArr.value.forEach((d) => {
      d['adjustedX'] = Math.abs(d.vx) > 1e-6;
    });
  }
};

const drawPlot = () => {
  if (mutationArr.value && mutationArr.value.length) {
    const t1 = transition().duration(1500);

    prepData();

    // --- GENE MAP: constant for all maps ---
    let geneSelector = genes.value.selectAll('.gene').data(ntMapArr.value);

    geneSelector.join(
      (enter) => {
        let geneGrp = enter
          .append('g')
          .attr('id', (d) => `gene_${d.gene}`)
          .attr('class', (d) => `gene gene_${d.gene}`);

        geneGrp
          .append('rect')
          .attr('x', (d) => x.value(d.start))
          .attr('width', (d) => x.value(d.end) - x.value(d.start))
          .attr('y', 0)
          .attr('height', geneHeight.value)
          .style('fill-opacity', 0.4)
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('stroke-width', 0.5)
          .style('shape-rendering', 'crispedges');

        geneGrp
          .append('text')
          .attr('x', (d) => (x.value(d.end) + x.value(d.start)) / 2)
          .attr('y', (geneHeight.value + 1) / 2)
          .attr('class', 'gene-name')
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('dominant-baseline', 'central')
          .style('text-anchor', 'middle')
          .text((d) =>
            x.value(d.end) - x.value(d.start) > geneDisplayThresh.value
              ? d.gene
              : '',
          );
      },
      (update) => {
        update
          .attr('id', (d) => `gene_${d.gene}`)
          .attr('class', (d) => `gene gene_${d.gene}`);

        update
          .select('rect')
          .transition(t1)
          .attr('x', (d) => x.value(d.start))
          .attr('width', (d) => x.value(d.end) - x.value(d.start))
          .style('fill', (d) => geneColorScale.value(d.gene));

        update
          .select('text')
          .text((d) =>
            x.value(d.end) - x.value(d.start) > geneDisplayThresh.value
              ? d.gene
              : '',
          )
          .transition(t1)
          .attr('x', (d) => (x.value(d.end) + x.value(d.start)) / 2)
          .style('opacity', (d) =>
            x.value(d.end) - x.value(d.start) > geneDisplayThresh.value ? 1 : 0,
          );
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );

    // --- SUBSTITUTIONS ---
    let substitutionSelector = substitutionRef.value
      .selectAll('.substitution')
      .data(mutationArr.value.filter((d) => d.type === 'substitution'));

    const labelY = aaCircleR.value * 2 + 7;
    const shiftedLabelY = aaCircleR.value + 3;
    const circleAdjY = -aaCircleR.value + 4;

    substitutionSelector.join(
      (enter) => {
        let mutGrp = enter
          .append('g')
          .attr('class', (d) => `substitution gene_${d.gene}`)
          .attr('id', (d) => `mutation_${d.gene}${d.codon_num}`);

        // leader lines
        mutGrp
          .append('path')
          .attr('class', 'substitution-leader')
          .attr(
            'd',
            (d) =>
              `M ${d.targetX} ${labelY} V ${
                (labelY + shiftedLabelY) * 0.45
              } H ${d.x} V ${shiftedLabelY}`,
          )
          .classed('hidden', (d) => !d.adjustedX)
          .attr('transform', 'translate(0, 5)')
          .style('stroke', '#8aa4be')
          .style('stroke-width', 1)
          .style('shape-rendering', 'crispedged')
          .style('fill', 'none');

        mutGrp
          .append('circle')
          .attr('class', 'leader-terminus')
          .attr('cx', (d) => d.targetX)
          .attr('cy', (d) => labelY)
          .attr('r', 1.8)
          .classed('hidden', (d) => !d.adjustedX)
          .attr('transform', 'translate(0, 5)')
          .style('fill', '#3e5871')
          .style('stroke', 'none');

        // circles for mutations
        mutGrp
          .append('circle')
          .attr('class', 'substitution-circle')
          .attr('r', aaCircleR.value)
          .attr('cy', (d) => (d.adjustedX ? circleAdjY : aaCircleR.value))
          .attr('cx', (d) => d.x)
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('stroke', (d) => geneColorScale.value(d.gene))
          .style('stroke-width', 0.75)
          .style('fill-opacity', 0.8);

        // position locations
        mutGrp
          .append('text')
          .attr('class', 'substitution-text substitution-location')
          .attr('y', (d) => (d.adjustedX ? shiftedLabelY : labelY))
          .attr('x', (d) => d.x)
          .text((d) => d.codon_num)
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('font-size', '0.6rem')
          .style('dominant-baseline', 'central')
          .style('text-anchor', 'middle');
        ('');
        // amino acid change text
        mutGrp
          .append('text')
          .attr('class', 'substitution-text substitution-change')
          .attr('x', (d) => d.x)
          .attr('y', (d) => (d.adjustedX ? circleAdjY : aaCircleR.value))
          .style('font-weight', 600)
          .style('fill', 'white')
          .style('font-family', (d) =>
            d.alt_aa === '_' || d.alt_aa === '*'
              ? "'DM Sans', Avenir, Helvetica, Arial, 'Font Awesome 5 Free', sans-serif"
              : "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('font-size', '0.85rem')
          .style('dominant-baseline', 'central')
          .style('text-anchor', 'middle')
          .text((d) =>
            d.alt_aa === '_' || d.alt_aa === '*' ? '\uf28d' : d.alt_aa,
          );
      },
      (update) => {
        update
          .attr('class', (d) => `substitution gene_${d.gene}`)
          .attr('id', (d) => `mutation_${d.gene}${d.codon_num}`);

        // leader lines
        update
          .select('.substitution-leader')
          .classed('hidden', (d) => !d.adjustedX)
          .transition(t1)
          .attr(
            'd',
            (d) =>
              `M ${d.targetX} ${labelY} V ${
                (labelY + shiftedLabelY) * 0.45
              } H ${d.x} V ${shiftedLabelY}`,
          );

        update
          .select('.leader-terminus')
          .transition(t1)
          .attr('cx', (d) => d.targetX)
          .attr('cy', (d) => labelY)
          .style('opacity', (d) => (d.adjustedX ? 1 : 0));

        // circles for mutations
        update
          .select('.substitution-circle')
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('stroke', (d) => geneColorScale.value(d.gene))

          .transition(t1)
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => (d.adjustedX ? circleAdjY : aaCircleR.value));

        // text: mutation codon position
        update
          .select('.substitution-location')
          .text((d) => d.codon_num)
          .transition(t1)
          .attr('x', (d) => d.x)
          .attr('y', (d) => (d.adjustedX ? shiftedLabelY : labelY))
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          );

        // text: amino acid change
        update
          .select('.substitution-change')
          .style('font-family', (d) =>
            d.alt_aa === '_' || d.alt_aa === '*'
              ? "'DM Sans', Avenir, Helvetica, Arial, 'Font Awesome 5 Free', sans-serif"
              : "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .text((d) =>
            d.alt_aa === '_' || d.alt_aa === '*' ? '\uf28d' : d.alt_aa,
          )
          .transition(t1)
          .attr('x', (d) => d.x)
          .attr('y', (d) => (d.adjustedX ? circleAdjY : aaCircleR.value));
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );

    // DELETIONS
    const rectY = aaCircleR.value - 0.75 * aaCircleR.value;
    const rectAdjY = circleAdjY - 0.75 * aaCircleR.value;

    let deletionSelector = deletionRef.value
      .selectAll('.deletion')
      .data(mutationArr.value.filter((d) => d.type === 'deletion'));

    deletionSelector.join(
      (enter) => {
        let mutGrp = enter
          .append('g')
          .attr('class', (d) => `deletion gene_${d.gene}`)
          .attr('id', (d) => `mutation_${d.gene}${d.codon_num}`);

        // leader lines
        mutGrp
          .append('path')
          .attr('class', 'deletion-leader')
          .attr(
            'd',
            (d) =>
              `M ${d.targetX} ${labelY} V ${
                (labelY + shiftedLabelY) * 0.45
              } H ${d.x} V ${shiftedLabelY}`,
          )
          .classed('hidden', (d) => !d.adjustedX)
          .attr('transform', 'translate(0, 5)')
          .style('stroke', '#8aa4be')
          .style('stroke-width', 1)
          .style('shape-rendering', 'crispedged')
          .style('fill', 'none');

        mutGrp
          .append('circle')
          .attr('class', 'deletion-leader-terminus')
          .attr('cx', (d) => d.targetX)
          .attr('cy', (d) => labelY)
          .attr('r', 1.8)
          .classed('hidden', (d) => !d.adjustedX)
          .attr('transform', 'translate(0, 5)')
          .style('fill', '#3e5871')
          .style('stroke', 'none');

        // del rectangle
        mutGrp
          .append('rect')
          .attr('class', 'deletion-rect')
          .attr('x', (d) => d.x)
          .attr(
            'width',
            (d) => x.value(d.pos_nt + d.change_length_nt) - x.value(d.pos_nt),
          )
          .attr('y', (d) => (d.adjustedX ? rectAdjY : rectY))
          .attr('height', aaCircleR.value * 1.5)
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('stroke', (d) => geneColorScale.value(d.gene));

        // del symbol
        mutGrp
          .append('text')
          .attr('class', 'deletion-text del-symbol')
          .attr('y', (d) => (d.adjustedX ? rectAdjY : rectY))
          .attr('dy', -9)
          .attr('x', (d) =>
            d.adjustedX
              ? d.x
              : x.value((d.pos_nt * 2 + d.change_length_nt) / 2),
          )
          .style('font-weight', 600)
          .style('text-anchor', 'middle')
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('font-size', '0.85rem')
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('dominant-baseline', 'central')
          .style('text-anchor', 'middle')
          .text((d) => '\u0394');

        // position locations
        mutGrp
          .append('text')
          .attr('class', 'deletion-text deletion-location')
          .attr('y', (d) => (d.adjustedX ? shiftedLabelY : labelY))
          .attr('x', (d) =>
            d.adjustedX
              ? d.x
              : x.value((d.pos_nt * 2 + d.change_length_nt) / 2),
          )
          .text(
            (d) => `${d.codon_num}:${d.codon_num + d.change_length_nt / 3 - 1}`,
          )
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('dominant-baseline', 'central')
          .style('text-anchor', 'middle')
          .style('font-size', '0.6rem');
      },
      (update) => {
        update
          .attr('class', (d) => `deletion gene_${d.gene}`)
          .attr('id', (d) => `mutation_${d.gene}${d.codon_num}`);

        // leader lines
        update
          .select('.deletion-leader')
          .classed('hidden', (d) => !d.adjustedX)
          .transition(t1)
          .attr(
            'd',
            (d) =>
              `M ${d.targetX} ${labelY} V ${
                (labelY + shiftedLabelY) * 0.45
              } H ${d.x} V ${shiftedLabelY}`,
          );

        update
          .select('.deletion-leader-terminus')
          .classed('hidden', (d) => !d.adjustedX)
          .transition(t1)
          .attr('cx', (d) => d.targetX)
          .attr('cy', (d) => labelY);

        // del rectangle
        update
          .select('.deletion-rect')
          .style('fill', (d) => geneColorScale.value(d.gene))
          .style('stroke', (d) => geneColorScale.value(d.gene))
          .transition(t1)
          .attr('x', (d) => d.x)
          .attr('y', (d) => (d.adjustedX ? rectAdjY : rectY))
          .attr(
            'width',
            (d) => x.value(d.pos_nt + d.change_length_nt) - x.value(d.pos_nt),
          );

        // del symbol
        update
          .select('.del-symbol')
          .text((d) => '\u0394')
          .transition(t1)
          .attr('x', (d) =>
            d.adjustedX
              ? d.x
              : x.value((d.pos_nt * 2 + d.change_length_nt) / 2),
          )
          .attr('y', (d) => (d.adjustedX ? rectAdjY : rectY));

        // position locations
        update
          .select('.deletion-location')
          .text(
            (d) => `${d.codon_num}:${d.codon_num + d.change_length_nt / 3 - 1}`,
          )
          .transition(t1)
          .attr('x', (d) =>
            d.adjustedX
              ? d.x
              : x.value((d.pos_nt * 2 + d.change_length_nt) / 2),
          )
          .attr('y', (d) => (d.adjustedX ? shiftedLabelY : labelY));
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );
  }
};

watch(width, () => {
  updatePlot();
});

watch(
  () => props.lineageMutations,
  (newVal, oldVal) => {
    if (newVal) {
      setupMutationArr();
      updatePlot();
    }
  },
);

watch(
  () => props.additionalMutations,
  (newVal, oldVal) => {
    if (newVal) {
      setupMutationArr();
      updatePlot();
    }
  },
);

onMounted(() => {
  // convert object of nucleotides into an array
  ntMapArr.value = Object.entries(NT_MAP).map((d) => {
    return {
      gene: d[0],
      start: d[1].start,
      end: d[1].end,
    };
  });

  let geneNames = ntMapArr.value
    .sort((a, b) => a.start - b.start)
    .map((d) => d.gene);

  geneColorScale.value = scaleOrdinal(colorDomain.value).domain(geneNames);

  setupMutationArr();
  setupPlot();
});

onUnmounted(() => {
  window.removeEventListener('resize', setDims);
});
</script>

<style lang="scss">
.gene rect {
  stroke: $base-grey;
}

#tooltip-gene,
#tooltip-mutation {
  background-color: #fff;
  padding: 7px;
  border: 1px solid;
  border-radius: 3px;
  opacity: 0.95;
  position: absolute;
  display: none;
}
</style>
