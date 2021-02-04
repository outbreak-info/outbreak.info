<template>
<div class="d-flex flex-column align-items-center">
  <!-- Total count filter -->
  <div class="d-flex justify-content-around" id="choropleth-legend">
    <GradientLegend class="mr-4" :maxValue="maxFormatted" :colorScale="colorScale" :label="`Est. ${ mutationName } prevalence since identification`" />
    <svg ref="count_filter" id="count-filter" :width="width-225" :height="legendHeight" class="report-choropleth-legend">
      <rect x="0" y="0" width="15" height="15" :fill="filteredColor" :stroke="strokeColor" stroke-width="1"></rect>
      <text x="22" y="7" dominant-baseline="central" :fill="strokeColor" font-size="14px">sequenced &lt; {{countThreshold}} samples</text>
      <text x="22" y="27" dominant-baseline="central" :fill="strokeColor" font-size="14px">no sequencing since {{mutationName}} identified</text>
      <rect x="0" y="20" width="15" height="15" :fill="nullColor" :stroke="strokeColor" stroke-width="1"></rect>

      <g transform="translate(350,8)" id="threshold-slider">
        <text x="0" y="0" dominant-baseline="central" :fill="strokeColor" font-size="14px">minimum number of total samples</text>
        <g transform="translate(0,18)">
          <line x1="0" :x2="filterWidth" y1="0" y2="0" stroke="#CCCCCC" stroke-linecap="round" stroke-width="8" />
          <line ref="selected_threshold" :x1="filterShift" :x2="filterWidth" y1="0" y2="0" stroke="#df4ab7" stroke-linecap="round" stroke-width="8" />
          <circle ref="threshold_slider" :transform="`translate(${filterShift}, 0)`" cx="0" cy="0" r="8" fill="#df4ab7" class="pointer" />
          <text ref="threshold_label" :transform="`translate(${filterShift}, 0)`" x="0" y="0" dy="12" font-size="14px" font-weight="700" fill="#df4ab7" text-anchor="middle" dominant-baseline="hanging">{{countThreshold}}</text>
          <text :x="filterWidth" y="0" dy="12" font-size="12px" :fill="filteredColor" text-anchor="end" dominant-baseline="hanging">{{maxCount}}</text>
        </g>
      </g>
    </svg>
  </div>

  <!-- choropleth -->
  <svg :width="width" :height="height" ref="choropleth" class="report-choropleth" :name="title">
    <g ref="blank_map" class="blank-map-group"></g>
    <g ref="regions" class="region-group"></g>
    <g ref="overlay" class="overlay-map-group"></g>
  </svg>

  <div ref="tooltip_choro" class="tooltip-basic box-shadow" id="tooltip-choro">
    <h5 id="location-name"></h5>
    <em id="no-sequencing">No reported sequencing</em>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>
    <div id="sequencing-count"></div>
  </div>

  <DownloadReportData :data="data" figureRef="report-choropleth" />
</div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import DownloadReportData from "@/components/DownloadReportData.vue";

import {
  geoEqualEarth,
  geoAlbersUsa,
  geoPath,
  max,
  min,
  timeParse,
  timeFormat,
  format,
  event,
  transition,
  drag,
  select,
  selectAll,
  scaleSequential,
  scaleLog
} from "d3";

import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

import GradientLegend from "@/components/GradientLegend.vue";

import GEODATA from "@/assets/geo/countries.json";

export default {
  name: "ReportChoropleth",
  props: {
    data: Array,
    mutationName: String,
    adminLevel: {
      type: String,
      default: "country"
    }
  },
  components: {
    GradientLegend,
    DownloadReportData
  },
  data() {
    return {
      width: 800,
      height: 400,
      legendHeight: 50,
      filterWidth: 200,
      margin: {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2
      },
      // variables
      variable: "proportion",
      thresholdVar: "cum_total_count",
      countThreshold: 25,
      filteredColor: "#A5A5A5",
      nullColor: "#EFEFEF",
      strokeColor: "#2c3e50",
      // data
      filteredData: null,
      baseMap: null,
      projection: null,
      // refs
      svg: null,
      blank: null,
      overlay: null,
      regions: null,
      ttips: null,
      // axis -- threshold filter
      xFilter: null,
      // methods
      colorScale: null,
      path: geoPath(),
      transition1: 500
    }
  },
  watch: {
    data: function() {
      this.drawMap();
    },
  },
  computed: {
    maxVal() {
      return this.data ? max(this.data, d => d[this.variable]) : null;
    },
    maxFormatted() {
      return format(".0%")(this.maxVal);
    },
    maxCount() {
      return this.data ? format(",")(max(this.data, d => d[this.thresholdVar])) : null;
    },
    minVal() {
      return this.data ? min(this.data, d => d[this.variable]) : null;
    },
    varMax() {
      return (Math.max(Math.abs(this.minVal), this.maxVal))
    },
    title() {
      return (`${this.mutationName} prevalence by ${this.adminLevel}`)
    },
    filterShift() {
      return (this.xFilter ? this.xFilter(this.countThreshold) : 0)
    }
  },
  created: function() {
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims(false);

      // set up drag for threshold filter
      this.setupDrag();

      // event listener to hide tooltips
      document.addEventListener(
        "mousemove",
        evt => {
          if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("region")) {
            this.mouseOff();
          }
        }, {
          passive: true
        }
      );
      document.addEventListener(
        "mouseleave",
        evt => {
          if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("region")) {
            this.mouseOff();
          }
        }, {
          passive: true
        }
      );
    });

    this.setupChoro();
    this.setupMap();
    this.drawMap();
  },
  methods: {
    setDims() {
    },
    setupChoro() {
      this.svg = select(this.$refs.svg);
      this.blank = select(this.$refs.blank_map);
      this.overlay = select(this.$refs.overlay);
      this.regions = select(this.$refs.regions);
      this.ttips = select(this.$refs.choropleth_tooltip);
    },
    setupMap() {
      if (this.adminLevel === "country") {
        this.projection = geoEqualEarth()
          .center([30.05125, 11.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

        this.baseMap = GEODATA;

      } else {
        this.projection = geoAlbersUsa()
          .scale(1)
          .translate([this.width / 2, this.height / 2]);
      }

      this.path = this.path.projection(this.projection);
      // calc and set scale
      // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
      const bounds = this.path.bounds(this.baseMap),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx * 0.98,
        yscale = this.height / dy * 0.98,
        scale = min([xscale, yscale]);

      this.projection = this.projection
        .scale(scale);
    },
    prepData() {
      if (this.data) {
        this.filteredData = cloneDeep(this.baseMap.features);

        this.colorScale = scaleSequential(interpolateYlGnBu)
          .domain([0, this.maxVal]);

        this.filteredData.forEach(d => {
          const filtered = this.data.filter(seq => seq.name == d.properties.NAME);
          if (filtered.length == 1) {
            const seq = filtered[0];
            d[this.variable] = seq[this.variable];
            // filter values with too few values
            d["fill"] = seq.cum_total_count >= this.countThreshold ? this.colorScale(d[this.variable]) : this.filteredColor;
            d["lower"] = seq.proportion_ci_lower;
            d["upper"] = seq.proportion_ci_upper;
            d["cum_lineage_count"] = seq["cum_lineage_count"];
            d["cum_total_count"] = seq["cum_total_count"];
            d["proportion_formatted"] = seq.proportion_formatted;
          }
        });

        this.xFilter = scaleLog()
          .range([0, this.filterWidth])
          .domain([1, max(this.data, d => d[this.thresholdVar])])
          .clamp(true);
      }
    },
    setupDrag() {
      // draggable filters
      select(this.$refs.threshold_slider)
        .call(drag()
          .on("drag", () => this.updateDrag())
          .on("end", () => this.changeFilters())
        )
    },
    updateDrag() {
      this.countThreshold = Math.round(this.xFilter.invert(event.x));
      select(this.$refs.threshold_label)
        .text(format(",")(this.countThreshold));
    },
    changeFilters() {
      this.drawMap();
    },
    drawMap() {
      this.prepData();

      this.regions
        .selectAll("path")
        .data(this.filteredData)
        .join(
          enter => {
            enter
              .append("path")
              .attr("class", "region")
              .attr("id", d => d.properties.location_id)
              // draw each region
              .attr("d", this.path
                .projection(this.projection)
              )
              .style("fill", d => d.fill ? d.fill : this.nullColor)
              .style("stroke", this.strokeColor)
              .style("stroke-width", 0.5)
          },
          update => update
          .attr("id", d => d.properties.location_id)
          // draw each region
          .attr("d", this.path
            .projection(this.projection)
          )
          .transition()
          .duration(250)
          .style("fill", d => d.fill ? d.fill : this.nullColor),
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )
      this.regions.selectAll("path.region")
        .on("mouseenter", d => this.debounceMouseon(d))
        .on("mouseleave", this.mouseOff);
    },
    mouseOn(d) {
      const ttipShift = 15;

      // dim everything
      this.regions
        .selectAll("path")
        .style("opacity", 0.2)
        .style("stroke-opacity", 0.5);

      // turn on the location
      this.regions
        .select(`#${d.properties.location_id}`)
        .style("opacity", 1)
        .style("stroke-opacity", 1);

      const ttip = select(this.$refs.tooltip_choro);

      // edit text
      ttip.select("h5").text(d.properties.NAME);
      if (d.proportion) {
        ttip.select("#no-sequencing").classed("hidden", true);
        ttip.select("#proportion")
          .text(d.proportion_formatted)
          .classed("hidden", false);

        ttip.select("#confidence-interval")
          .text(`(95% CI: ${format(".0%")(d.lower)}-${format(".0%")(d.upper)})`)
          .classed("hidden", false);

        ttip.select("#sequencing-count")
          .text(`Number of total cases: ${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)
          .classed("hidden", false);

      } else {
        ttip.select("#no-sequencing").classed("hidden", false);
        ttip.select("#proportion").classed("hidden", true);
        ttip.select("#confidence-interval").classed("hidden", true);
        ttip.select("#sequencing-count").classed("hidden", true);
      }

      // fix location
      ttip
        .style("left", `${this.event.pageX + ttipShift}px`)
        .style("top", `${this.event.pageY + ttipShift}px`)
        .style("display", "block");
    },
    mouseOff() {
      select(this.$refs.tooltip_choro)
        .style("display", "none");

      this.regions
        .selectAll("path")
        .style("opacity", 1)
        .style("stroke-opacity", 1);

    },
    // https://stackoverflow.com/questions/43407947/how-to-throttle-function-call-on-mouse-event-with-d3-js/43448820
    // modified to save the d3. event to vue::this
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
}
</script>

<style lang="scss">
</style>
