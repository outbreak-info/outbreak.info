<template>
  <div
    id="report-cum-totals"
    class="d-flex flex-column align-items-center w-100"
  >
    <div class="">
      <div class="d-flex align-items-center justify-content-end">
        <router-link
          v-if="location !== 'Worldwide'"
          class="mr-3 btn btn-sec"
          :to="{ name: 'LocationReport', query: { loc: location } }"
        >
          View {{ locationName }} report
        </router-link>
        <button
          class="btn btn-main-outline px-2 py-1 mr-3"
          @click="includeNotDetected = !includeNotDetected"
        >
          <small>{{ includeNotDetected ? 'hide' : 'show' }} not detected</small>
        </button>
        <div class="d-flex align-items-center justify-content-end">
          sort by
          <select v-model="sortVar" class="ml-2">
            <option value="proportion">prevalence</option>
            <option value="cum_total_count">total sequenced</option>
            <option value="country">name</option>
          </select>
        </div>
      </div>

      <div
        class="d-flex flex-wrap"
        :class="[stacked ? 'justify-content-center' : 'justify-content-center']"
      >
        <div class="d-flex flex-column" :class="{ 'mr-5': !stacked }">
          <h5 class="my-5 my-sm-4 my-md-2">
            <b>Prevalence by location</b>
          </h5>

          <!-- LEGEND -->
          <div
            class="d-flex align-items-center justify-content-between height-fixed"
          >
            <!-- scale bar with gradient -->
            <ClassedLegend
              :colorScale="colorScale"
              :horizontal="false"
              :includeNulls="false"
              :label="label"
              :countThreshold="25"
              :mutationName="mutationName"
              nullColor="#EFEFEF"
              filteredColor="#A5A5A5"
              strokeColor="#2c3e50"
              maxCount="maxEstFormatted"
            />

            <div class="d-flex align-items-center">
              <svg id="legend" width="15" height="15" class="mr-2">
                <line x1="0" x2="15" y1="8" y2="8" class="ci-legend" />
              </svg>
              <small class="text-muted">95% confidence interval</small>
            </div>
          </div>

          <!-- LEFT: DOTPLOT -->
          <div v-if="y && !y.domain().length" class="fa-lg text-muted mt-3">
            No {{ mutationName }} detected
          </div>

          <svg
            ref="svg_dot"
            :width="width"
            :height="height + margin.bottom + margin.top"
            class="dotplot-prevalence prevalence-by-location"
            :name="title"
          >
            <!-- <svg :width="width" :height="height + margin.bottom + margin.top" class="dotplot-prevalence prevalence-by-location" ref="svg_dot" :name="title" :subtitle="subtitle"> -->
            <defs>
              <filter id="dropshadow" filterUnits="userSpaceOnUse">
                <feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" />
                <feFlood
                  flood-color="#222222"
                  flood-opacity="0.5"
                  result="offsetColor"
                />
                <feGaussianBlur
                  result="blurOut"
                  in="offOut"
                  stdDeviation="1.5"
                />
                <feComposite
                  in="offsetColor"
                  in2="offsetBlur"
                  operator="in"
                  result="offsetBlur"
                />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <!-- :hidden="!data.length" not working -->
            <g
              id="dot-axis-top"
              ref="xAxisRef"
              :transform="`translate(${margin.left}, ${25})`"
              class="prevalence-axis axis--x"
              :class="{ hidden: !data.length }"
            />
            <g
              id="dot-axis-bottom"
              ref="xAxis2Ref"
              :transform="`translate(${margin.left}, ${
                height + margin.top + 5
              })`"
              class="prevalence-axis axis--x"
              :class="{ hidden: !data.length }"
            />
            <g
              ref="yAxisRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
              class="prevalence-location-axis prevalence-axis axis--y"
            />
            <g
              id="dotplot"
              ref="dotplotRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
            />
          </svg>
        </div>

        <!-- RIGHT: BARPLOT -->
        <div class="d-flex flex-column">
          <h5 class="my-5 my-sm-4 my-md-2">
            <b>Number of samples sequenced</b>
          </h5>

          <div class="d-flex flex-column height-fixed">
            <div class="d-flex align-items-center">
              <div
                class="rect-legend mr-2"
                :style="{ background: accentColor }"
              />
              <small class="text-muted">
                {{ mutationName }}-positive samples
              </small>
            </div>

            <div class="d-flex align-items-center">
              <div
                class="rect-legend mr-2"
                :style="{ background: baseColor }"
              />
              <small class="text-muted">all sequenced samples</small>
            </div>
          </div>

          <div v-if="y && !y.domain().length" class="fa-lg text-muted mt-3">
            No {{ mutationName }} detected
          </div>

          <svg
            ref="svg_count"
            :width="barWidth"
            :height="height + margin.bottom + margin.top"
            class="sequencing-count prevalence-by-location"
            :name="title"
          >
            <g
              id="bar-axis-top"
              ref="xAxisBarRef"
              :transform="`translate(${margin.left}, ${25})`"
              class="count-axis axis--x"
              :class="{ hidden: !data.length }"
            />
            <g
              id="bar-axis-top"
              ref="xAxisBar2Ref"
              :transform="`translate(${margin.left}, ${
                height + margin.top + 5
              })`"
              class="count-axis axis--x"
              :class="{ hidden: !data.length }"
            />
            <g
              ref="yAxisBarRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
              class="prevalence-location-axis count-axis axis--y"
            />
            <g
              id="bargraph"
              ref="bargraphRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
            />
          </svg>
        </div>
      </div>
    </div>

    <div
      id="tooltip_chart"
      ref="tooltip_chart"
      class="tooltip-basic box-shadow"
    >
      <h5 id="location-name" />
      <em id="no-sequencing">No reported sequencing</em>
      <div class="d-flex align-items-center">
        <b id="proportion" class="font-size-2" />
        <span id="confidence-interval" class="text-muted ml-2" />
      </div>
      <div id="sequencing-count" />
    </div>

    <DownloadReportData
      :data="data"
      figureRef="prevalence-by-location"
      class="mt-2"
      dataType="Mutation Prevelance by Location Dot Plot"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
import { max } from 'd3-array';
import { axisTop, axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { select, event } from 'd3-selection';
import { scaleLinear, scaleLog, scaleBand } from 'd3-scale';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import { lazyLoad } from '@/js/lazy-load';

const ClassedLegend = lazyLoad('ClassedLegend');
const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  mutationName: String,
  label: String,
  location: String,
  locationName: String,
  colorScale: Function,
});

const margin = ref({
  top: 35,
  right: 15,
  rightBar: 25,
  bottom: 30,
  left: 270,
});
const maxWidth = ref(1100);
const width = ref(600);
const height = ref(100);
const bandHeight = ref(18);
const barWidth = ref(500);
const circleR = ref(8);
const ciStrokeWidth = ref(7);
const accentColor = ref('#df4ab7');
const baseColor = ref('#f6cceb');
const stacked = ref(false);
const includeNotDetected = ref(false);
// data
const plottedData = ref(null);
// refs
const dotplot = ref(null);
const bargraph = ref(null);
// variables
const yVariable = ref('name');
const yIdentifier = ref('location_id');
const sortVar = ref('proportion');
const maxEst = ref(null);
// scales
const xDot = ref(null);
const xBar = ref(null);
const y = ref(null);
const xDotAxis = ref(null);
const xDotAxis2 = ref(null);
const xBarAxis = ref(null);
const xBarAxis2 = ref(null);
const yAxis = ref(null);
const numXTicks = ref(4);
// this.$refs
const tooltip_chart = ref(null);
const dotplotRef = ref(null);
const bargraphRef = ref(null);
const xAxisRef = ref(null);
const xAxis2Ref = ref(null);
const xAxisBarRef = ref(null);
const xAxisBar2Ref = ref(null);
const yAxisRef = ref(null);
const yAxisBarRef = ref(null);

// computed variables
const title = computed(() => {
  return props.location === 'Worldwide'
    ? `Cumulative ${props.mutationName} prevalence by country`
    : `Cumulative ${props.mutationName} prevalence in ${props.location}`;
});

const setDims = () => {
  const mx = 0.9;
  const svgContainer = document.getElementById('report-cum-totals');
  const barRatio = 0.4;
  const minBarWidth = 350;

  const maxScreenWidth = window.innerWidth;
  maxWidth.value = svgContainer ? svgContainer.offsetWidth * mx : 800;
  if (maxWidth.value > maxScreenWidth) {
    maxWidth.value = maxScreenWidth - 20;
    numXTicks.value = 2;
  }
  barWidth.value = barRatio * maxWidth.value;
  if (barWidth.value <= minBarWidth) {
    barWidth.value = maxWidth.value;
    width.value = maxWidth.value;
    stacked.value = true;
  } else {
    width.value = maxWidth.value * (1 - barRatio) * 0.9;
    stacked.value = false;
  }
  // this.numXTicks = this.width > minBarWidth ? 4 : 2;
};

const tooltipOn = (d) => {
  const ttipShift = 15;

  // dim everything
  dotplot.value.selectAll('.dot-group').style('opacity', 0.2);

  bargraph.value.selectAll('.bar-group').style('opacity', 0.2);

  // turn on the location
  dotplot.value.select(`.${d.location_id}`).style('opacity', 1);

  bargraph.value.select(`.${d.location_id}`).style('opacity', 1);

  const ttip = select(tooltip_chart.value);

  // edit text
  ttip.select('h5').text(d.name);
  ttip.select('#no-sequencing').classed('hidden', true);
  ttip
    .select('#proportion')
    .text(d.proportion_formatted)
    .classed('hidden', false);

  ttip
    .select('#confidence-interval')
    .text(
      `(95% CI: ${format('.0%')(d.proportion_ci_lower)}-${format('.0%')(
        d.proportion_ci_upper,
      )})`,
    )
    .classed('hidden', false);

  ttip
    .select('#sequencing-count')
    .text(
      `Number of total cases: ${format(',')(d.cum_lineage_count)}/${format(',')(
        d.cum_total_count,
      )}`,
    );

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOff = () => {
  select(tooltip_chart.value).style('display', 'none');

  dotplot.value.selectAll('.dot-group').style('opacity', 1);

  bargraph.value.selectAll('.bar-group').style('opacity', 1);
};

const setupPlot = () => {
  dotplot.value = select(dotplotRef.value);
  bargraph.value = select(bargraphRef.value);

  y.value = scaleBand().paddingInner(0.25).paddingOuter(0.15);
};

const updateScales = () => {
  // resize the canvas to cover the length of the data.
  height.value =
    plottedData.value.length * bandHeight.value * (1 + y.value.paddingInner());

  xDot.value = scaleLinear()
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain([0, max(plottedData.value, (d) => d.proportion_ci_upper)]);

  xBar.value = scaleLog()
    .range([0, barWidth.value - margin.value.left - margin.value.rightBar])
    .domain([1, max(plottedData.value, (d) => d.cum_total_count)]);

  y.value = y.value
    .range([0, height.value])
    .domain(plottedData.value.map((d) => d[yVariable.value]));

  xDotAxis.value = axisTop(xDot.value)
    .ticks(numXTicks.value)
    .tickFormat(format('.0%'));

  xDotAxis2.value = axisBottom(xDot.value)
    .ticks(numXTicks.value)
    .tickFormat(format('.0%'));

  select(xAxisRef.value).call(xDotAxis.value);
  select(xAxis2Ref.value).call(xDotAxis2.value);

  xBarAxis.value = axisTop(xBar.value)
    .tickFormat((d, i) => {
      const log = Math.log10(d);
      return Math.abs(Math.round(log) - log) < 1e-6 ? format('.0s')(d) : '';
    })
    .ticks(2)
    .tickSizeOuter(0);

  xBarAxis2.value = axisBottom(xBar.value)
    .tickFormat((d, i) => {
      const log = Math.log10(d);
      return Math.abs(Math.round(log) - log) < 1e-6 ? format('.0s')(d) : '';
    })
    .ticks(2)
    .tickSizeOuter(0);

  select(xAxisBarRef.value).call(xBarAxis.value);
  select(xAxisBar2Ref.value).call(xBarAxis2.value);

  yAxis.value = axisLeft(y.value);

  select(yAxisRef.value).call(yAxis.value);
  select(yAxisBarRef.value).call(yAxis.value);

  // color scale
  maxEst.value = max(plottedData.value, (d) => d.proportion);
};

const updatePlot = () => {
  if (props.data) {
    // ensure the data is sorted in the proper order
    // Create a copy so Vue doesn't flip out.
    plottedData.value = cloneDeep(props.data);

    if (!includeNotDetected.value) {
      plottedData.value = plottedData.value.filter((d) => d.proportion);
    }

    if (sortVar.value === 'country') {
      // asc
      plottedData.value.sort((a, b) =>
        a[sortVar.value] < b[sortVar.value] ? -1 : 1,
      );
    } else {
      // desc
      plottedData.value.sort((a, b) =>
        b[sortVar.value] < a[sortVar.value] ? -1 : 1,
      );
    }

    updateScales();

    const t1 = transition().duration(1500);
    const annotThresh = 0.15;

    const barSelector = bargraph.value
      .selectAll('.bar-group')
      .data(plottedData.value, (d) => d.location_id);

    barSelector.join(
      (enter) => {
        const grp = enter
          .append('g')
          .attr(
            'class',
            (d, i) => `bar-group bar-group${i} ${d[yIdentifier.value]}`,
          );

        grp
          .append('rect')
          .attr('class', 'seq-count')
          .attr('x', xBar.value(1))
          .attr('width', (d) => xBar.value(d.cum_total_count) - xBar.value(1))
          .attr('y', (d) => y.value(d[yVariable.value]))
          .attr('height', y.value.bandwidth())
          .style('fill', baseColor.value);

        grp
          .append('rect')
          .attr('class', 'mutation-count')
          .attr('x', xBar.value(1))
          .attr(
            'width',
            (d) =>
              (xBar.value(d.cum_total_count) - xBar.value(1)) * d.proportion,
          )
          .attr('y', (d) => y.value(d[yVariable.value]))
          .attr('height', y.value.bandwidth())
          .style('fill', accentColor.value);

        grp
          .append('text')
          .attr('class', 'count-annotation')
          .attr('x', (d) => xBar.value(d.cum_total_count))
          .attr('dx', (d) =>
            xBar.value(d.cum_total_count) < barWidth.value * annotThresh
              ? 4
              : -4,
          )
          .attr(
            'y',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          )
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('fill', '#777')
          .style('font-size', '9pt')
          .style('dominant-baseline', 'central')
          .style('text-anchor', (d) =>
            xBar.value(d.cum_total_count) < barWidth.value * annotThresh
              ? 'start'
              : 'end',
          )
          .text(
            (d) =>
              `${format(',')(d.cum_lineage_count)}/${format(',')(
                d.cum_total_count,
              )}`,
          );
      },
      (update) => {
        update.attr('class', (d) => `bar-group ${d[yIdentifier.value]}`);
        // !!!!! UPDATES MUST BE SELECT, NOT SELECT ALL
        // h/t to https://observablehq.com/@thetylerwolf/day-18-join-enter-update-exit for pointing me in right direction
        update
          .select('.seq-count')
          .attr('x', xBar.value(1))
          .attr('width', (d) => xBar.value(d.cum_total_count) - xBar.value(1))
          .attr('height', y.value.bandwidth())
          .transition(t1)
          .attr('y', (d) => y.value(d[yVariable.value]));

        update
          .select('.mutation-count')
          .attr('x', xBar.value(1))
          .attr(
            'width',
            (d) =>
              (xBar.value(d.cum_total_count) - xBar.value(1)) * d.proportion,
          )
          .attr('height', y.value.bandwidth())
          .transition(t1)
          .attr('y', (d) => y.value(d[yVariable.value]));

        update
          .select('.count-annotation')
          .attr('x', (d) => xBar.value(d.cum_total_count))
          .attr('dx', (d) =>
            xBar.value(d.cum_total_count) < barWidth.value * annotThresh
              ? 4
              : -4,
          )
          .style('text-anchor', (d) =>
            xBar.value(d.cum_total_count) < barWidth.value * annotThresh
              ? 'start'
              : 'end',
          )
          .text(
            (d) =>
              `${format(',')(d.cum_lineage_count)}/${format(',')(
                d.cum_total_count,
              )}`,
          )
          .transition(t1)
          .attr(
            'y',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          );
      },
    );

    const checkbookSpacing = 5;
    // CHECKBOOK DIVISIONS FOR ORIENTATION
    if (props.data.length > checkbookSpacing * 1.5) {
      const checkbookSelector = dotplot.value
        .selectAll('.checkbook')
        .data(plottedData.value.filter((d, i) => !(i % checkbookSpacing)));

      const checkbookSelector2 = bargraph.value
        .selectAll('.checkbook')
        .data(plottedData.value.filter((d, i) => !(i % checkbookSpacing)));

      checkbookSelector.join(
        (enter) => {
          enter
            .append('line')
            .attr('class', 'checkbook')
            .style('stroke', '#222')
            .style('stroke-width', 0.35)
            .attr('transform', `translate(${-1 * margin.value.left},${0})`)
            .attr('x1', 0)
            .attr('x2', width.value)
            .attr(
              'y1',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            )
            .attr(
              'y2',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            );
        },
        (update) =>
          update
            .attr('x2', width.value)
            .attr('transform', `translate(${-1 * margin.value.left},${0})`)
            .attr(
              'y1',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            )
            .attr(
              'y2',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            ),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

      checkbookSelector2.join(
        (enter) => {
          enter
            .append('line')
            .attr('class', 'checkbook')
            .style('stroke', '#222')
            .style('stroke-width', 0.35)
            .attr('transform', `translate(${-1 * margin.value.left},${0})`)
            .attr('x1', 0)
            .attr('x2', barWidth.value)
            .attr(
              'y1',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            )
            .attr(
              'y2',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            );
        },
        (update) =>
          update
            .attr('transform', `translate(${-1 * margin.value.left},${0})`)
            .attr('x1', 0)
            .attr('x2', barWidth.value)
            .attr(
              'y1',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            )
            .attr(
              'y2',
              (d) =>
                y.value(d[yVariable.value]) -
                y.value.paddingInner() * y.value.step() * 0.5,
            ),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );
    }

    const dotSelector = dotplot.value
      .selectAll('.dot-group')
      .data(plottedData.value, (d) => d.location_id);

    dotSelector.join(
      (enter) => {
        const grp = enter
          .append('g')
          .attr('class', (d) => `dot-group ${d[yIdentifier.value]}`);

        grp
          .append('line')
          .attr('class', 'dot-ci confidence-interval')
          .attr('x1', (d) => xDot.value(d.proportion_ci_lower))
          .attr('x2', (d) => xDot.value(d.proportion_ci_upper))
          .attr(
            'y1',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          )
          .attr(
            'y2',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          )
          .style('stroke', '#CCCCCC')
          .style('stroke-width', ciStrokeWidth.value)
          // .style("opacity", 0)
          // .transition(t1)
          // .delay(400)
          .style('opacity', 0.5);

        grp
          .append('circle')
          .attr('class', 'dot-circle point-estimate')
          .attr(
            'cy',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          )
          .attr('r', circleR.value)
          .style('stroke', '#2c3e50')
          .style('stroke-width', 0.25)
          // .style("filter", "url(#dropshadow)")
          .style('fill', (d) => props.colorScale(d.proportion))
          .transition(t1)
          .attr('cx', (d) => xDot.value(d.proportion));
      },
      (update) => {
        update.attr('class', (d) => `dot-group ${d[yIdentifier.value]}`);

        update
          .select('.dot-circle')
          .transition(t1)
          .attr('cx', (d) => xDot.value(d.proportion))
          .style('fill', (d) => props.colorScale(d.proportion))
          .attr(
            'cy',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          );

        update
          .select('.dot-ci')
          .attr('x1', (d) => xDot.value(d.proportion_ci_lower))
          .attr('x2', (d) => xDot.value(d.proportion_ci_upper))
          .transition(t1)
          .attr(
            'y1',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          )
          .attr(
            'y2',
            (d) => y.value(d[yVariable.value]) + y.value.bandwidth() / 2,
          );
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );

    bargraph.value
      .selectAll('.bar-group')
      .on('mousemove', (d) => tooltipOn(d))
      .on('mouseleave', () => tooltipOff());

    dotplot.value
      .selectAll('.dot-group')
      .on('mousemove', (d) => tooltipOn(d))
      .on('mouseleave', () => tooltipOff());
  }
};

watch(width, () => {
  updatePlot();
});

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

watch(sortVar, () => {
  updatePlot();
});

watch(includeNotDetected, () => {
  updatePlot();
});

const debounceSetDims = debounce(setDims, 150);

onMounted(() => {
  nextTick(() => {
    window.addEventListener('resize', setDims);
  });

  // set initial dimensions for the plots.
  setDims();

  setupPlot();
  updatePlot();
});

onUnmounted(() => {
  window.removeEventListener('resize', setDims);
});
</script>

<style lang="scss">
.prevalence-location-axis {
  font-size: 16px;
}

.prevalence-location-axis.axis--y g.tick line,
.prevalence-location-axis.axis--y path {
  display: none;
}

.dotplot-prevalence,
.sequencing-count {
  background: white;
}

.count-axis line {
  // stroke: #aaa;
  // stroke-width: 0.25;
}
.height-fixed {
  // border: 1px solid $base-grey;
  background: white;
  padding: 0.5rem;
  margin-bottom: 0.5rem;

  height: 50px !important;
}

.circle-legend {
  stroke: #2c3e50;
  stroke-width: 0.25;
  fill: #bbb;
}

.ci-legend {
  stroke: #cccccc;
  stroke-width: 7;
  opacity: 0.5;
}

.rect-legend {
  width: 15px;
  height: 15px;
}
</style>
