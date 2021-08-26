<template>
<div id="streamgraph">
  <div class="d-flex justify-content-between px-3" :style="{width: width + 'px'}">
    <h5 class="m-0">Lineage prevalence over time</h5>
    <div class="d-flex justify-content-end">
      <button class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2" @click="enableZoom">
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
      </button>
      <button class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2" @click="resetZoom">
        <font-awesome-icon class="text-right" :icon="['fas', 'compress-arrows-alt']" />
      </button>
    </div>
  </div>

  <svg :width="width" :height="height" class="lineages-by-location" ref="lineages_by_location" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="stream-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g class="stream-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g ref="brush" class="brush" id="brush-zoom" :transform="`translate(${margin.left},${margin.top})`" v-if="data" :class="{hidden: !zoomAllowed}"></g>
  </svg>

  <!-- Histogram of sequencing counts -->
  <SequencingHistogram :data="seqCounts" :xInput="x" :width="width" :svgTitle="title" :margin="marginHist" :mutationName="null" className="lineages-by-location" :onlyTotals="true" notDetectedColor="#bab0ab"
    v-if="seqCounts && seqCounts.length && x" />

  <DownloadReportData :data="data" figureRef="lineages-by-location" :isVertical="true" dataType="Mutation Report Prevalence over Time" />

  <div ref="tooltip_streamgraph" class="tooltip-basic box-shadow" id="tooltip-streamgraph">
    <h5 id="lineage" class="my-1"></h5>
    <div class="d-flex align-items-center">
      Prevalence in the last {{ recentWindow }} days:
      <b id="proportion" class="ml-1"></b>
    </div>

  </div>
</div>
</template>


<script lang="js">
import Vue from "vue";

import uniq from "lodash/uniq";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSearchPlus,
  faCompressArrowsAlt
} from "@fortawesome/free-solid-svg-icons/";

library.add(faSearchPlus, faCompressArrowsAlt);

import SequencingHistogram from "@/components/SequencingHistogram.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  axisLeft,
  axisBottom,
  area,
  stack,
  stackOrderInsideOut,
  // stackOrderAscending,
  // stackOrderDescending,
  transition,
  event,
  brushX,
  extent,
  max,
  format
} from "d3";


export default Vue.extend({
  name: "LineagesByLocation",
  components: {
    SequencingHistogram,
    DownloadReportData,
    FontAwesomeIcon
  },
  props: {
    data: Array,
    recentData: Object,
    seqCounts: Array,
    recentWindow: String,
    location: String,
    recentMin: Date,
    colorScale: Function,
    setWidth: Number
  },
  computed: {
    title() {
      return (`Lineage prevalence over time in ${this.location}`)
    }
  },
  watch: {
    width: function() {
      this.updateBrush();
      this.updatePlot();
    },
    data: function() {
      this.updatePlot();
    }
  },
  data() {
    return ({
      // dimensions
      margin: {
        top: 18,
        bottom: 30,
        left: 55,
        right: 55
      },
      marginHist: {
        top: 5,
        bottom: 10,
        left: 55,
        right: 55
      },
      width: null,
      minWidth: 450,
      height: 500,
      // variables
      fillVar: "pangolin_lineage",
      // axes
      x: null,
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      area: null,
      brush: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null,
      brushRef: null,
      // controls
      zoomAllowed: false
    })
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);

      this.updateBrush();
      // set initial dimensions for the plots.
      this.debounceSetDims();
    })


    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
    this.debounceZoom = this.debounce(this.zoom, 150);
  },
  methods: {
    updateBrush() {
      // Update brush so it spans the whole of the area
      this.brush = brushX()
        .extent([
          [0, 0],
          [this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]
        ])
        .on("end", () => this.debounceZoom(event));

      this.brushRef
        .call(this.brush)
        .on("dblclick", this.resetZoom);
    },
    setDims() {
      console.log(this.setWidth)
        const svgContainer = document.getElementById('most-recent-lineages');
        let containerWidth = svgContainer ? svgContainer.offsetWidth : 500;
        const pageContainer = document.getElementById('location-report')
        let maxWidth = pageContainer ? pageContainer.offsetWidth : 500;
        const idealWidth = (maxWidth - containerWidth) * 0.95;

        this.width = this.setWidth ? this.setWidth : idealWidth < this.minWidth || idealWidth > maxWidth ? maxWidth * 0.95 : idealWidth;

      this.numXTicks = this.width < 500 ? 2 : 5;
    },
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.legend = select(this.$refs.legend);
      this.chart = select(this.$refs.chart);
      this.brushRef = select(this.$refs.brush);

      this.area = area()
        .x(d => this.x(d.data.date_time))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]));
    },
    updateScales() {
      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(extent(this.data.map(d => d.date_time)))
        .clamp(true);

      this.y = this.y
        // .range([0, this.height - this.margin.top - this.margin.bottom])
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, 1]);

      this.lineages = Object.keys(this.data[0]).filter(d => d != "date_time");

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks);

      select(this.$refs.xAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      // stacking
      this.series = stack()
        .keys(this.lineages)
        .order(stackOrderInsideOut)
        (this.data)

      select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      if (this.data && this.colorScale) {
        this.updateScales();
        this.drawPlot();
      }
    },
    tooltipOn(key) {
      const ttipShift = 20;
      // turn everything off
      this.chart
        .selectAll(".stacked-area-chart")
        .style("stroke", "#BBB")
        .style("fill-opacity", 0.2);

      selectAll(".stacked-bar-chart")
        .style("fill-opacity", 0.2);

      // turn on the selected region
      this.chart.select(`#area_${key.replace(/\./g, "-")}`)
        .style("fill-opacity", 1);

      select(`#${key.replace(/\./g, "-")}`)
        .style("fill-opacity", 1);

      const ttip = select(this.$refs.tooltip_streamgraph);

      ttip.select("#lineage")
        .text(key)

      const recentPrev = this.recentData[key];
      if (recentPrev) {
        ttip.select("#proportion")
          .text(recentPrev < 0.005 ? "< 0.5%" : format(".0%")(recentPrev))
      } else {
        ttip.select("#proportion")
          .text('Grouped into "other" category')
      }

      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipOff() {
      this.chart
        .selectAll(".stacked-area-chart")
        .style("stroke", "#555")
        .style("fill-opacity", 1);

      selectAll(".stacked-bar-chart")
        .style("fill-opacity", 1);

      select(this.$refs.tooltip_streamgraph)
        .style("display", "none");
    },
    zoom(evt) {
      // reset domain to new coords
      const selection = this.event.selection;

      if (selection) {
        const newMin = this.x.invert(selection[0]);
        const newMax = this.x.invert(selection[1]);

        this.x = scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right])
          .domain([newMin, newMax])
          .clamp(true);

        // reset the axis
        this.xAxis = axisBottom(this.x)
          .ticks(this.numXTicks);

        select(this.$refs.xAxis).call(this.xAxis);

        // move the brush
        this.brushRef.call(this.brush.move, null);
        this.zoomAllowed = false;
        this.drawPlot();
      }

    },
    resetZoom() {
      this.x = this.x.domain(extent(this.data.map(d => d.date_time)));
      this.brushRef.call(this.brush.move, null);
      this.updatePlot();
    },
    enableZoom() {
      this.zoomAllowed = true;
    },
    drawPlot() {
      const areaSelector = this.chart
        .selectAll(".stacked-area-chart")
        .data(this.series);

      areaSelector
        .join(enter => {
            const selector = enter.append("path")
              .attr("fill", ({
                key
              }) => this.colorScale(key))
              .attr("class", "stacked-area-chart")
              .attr("id", ({
                key
              }) => `area_${key.replace(/\./g, "-")}`)
              .attr("d", this.area)
              .style("stroke", "#555")
              .style("stroke-width", 0.5)
          },
          update => {
            update
              .attr("fill", ({
                key
              }) => this.colorScale(key))
              .attr("id", ({
                key
              }) => `area_${key.replace(/\./g, "-")}`)
              .attr("d", this.area);
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

      // annotation for the most recent date
      const recentSelector = this.chart
        .selectAll(".recent-date-annotation")
        .data([this.recentMin]);

      const t1 = transition().duration(500);

      recentSelector.join(
        enter => {
          const grp = enter.append("g")
            .attr("class", "recent-date-annotation");

          grp.append("line")
            .attr("class", "annotation-line")
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", 0)
            .attr("y2", this.height)
            .style("stroke", "white")
            .style("stroke-dasharray", "6,6");

          grp.append("line")
            .attr("class", "text-line")
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", 0)
            .attr("y2", -5)
            .style("stroke", "#2c3e50")

          grp.append("text")
            .attr("x", d => this.x(d))
            .attr("y", 0)
            .attr("dy", -8)
            .text(`${this.recentWindow} days`)
            .style("text-anchor", d => this.x(d) > this.width / 2 ? "end" : "start")
            .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
            .style("dominant-baseline", "text-top")
            .style("font-size", "9pt");
        },
        update => {
          update.select(".annotation-line")
            .attr("y1", 0)
            .attr("y2", this.height)
            .transition(t1)
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d));

          update.select(".text-line")
            .transition(t1)
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))

          update.select("text")
            .text(`${this.recentWindow} days`)
            .style("text-anchor", d => this.x(d) > this.width / 2 ? "end" : "start")
            .transition(t1)
            .attr("x", d => this.x(d));
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      this.chart
        .selectAll(".stacked-area-chart")
        .on("mousemove", ({
          key
        }) => this.tooltipOn(key))
        .on("mouseleave", this.tooltipOff)
    },
    debounce(fn, delay) {
      var timer = null;
      return function() {
        var context = this,
          args = arguments,
          evt = event;
        //we get the D3 event here
        clearTimeout(timer);
        timer = setTimeout(function() {
          context.event = evt;
          //and use the reference here
          fn.apply(context, args);
        }, delay);
      };
    }
  }
})
</script>

<style lang="scss">
.lineages-by-location {
    .axis--x text {
        font-size: 16pt;
    }
    .axis--y text {
        font-size: 9pt;
    }
    .stream-axis.axis--y text {
        font-size: 14pt;
    }
}
</style>
