<template>
<div class="d-flex flex-column">
  <!-- Total count filter -->
  <small>include locations with at least </small>
  <GradientLegend :maxValue="maxFormatted" :colorScale="colorScale" :label="`Est. ${ mutationName } prevalence since identification`"/>
  <svg ref="count_filter" id="count-filter" :width="width" :height="legendHeight">
    <rect x="0" y="0" width="15" height="15" :fill="filteredColor" :stroke="strokeColor" stroke-width="1"></rect>
    <text x="22" y="7" dominant-baseline="central" :fill="strokeColor" font-size="14px">sequenced &lt; {{countThresh}} samples</text>
    <text x="22" y="27" dominant-baseline="central" :fill="strokeColor" font-size="14px">no sequencing since {{mutationName}} identified</text>
    <rect x="0" y="20" width="15" height="15" :fill="nullColor" :stroke="strokeColor" stroke-width="1"></rect>
  </svg>

  <!-- choropleth -->
  <svg :width="width" :height="height" ref="choropleth" class="epi-map-svg" :name="title">
    <g ref="blank_map" class="blank-map-group"></g>
    <g ref="regions" class="region-group"></g>
    <g ref="overlay" class="overlay-map-group"></g>
  </svg>
</div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";

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
  select,
  selectAll,
  scaleSequential
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
    GradientLegend
  },
  data() {
    return {
      countThresh: 50,
      width: 800,
      height: 400,
      legendHeight: 100,
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
    countThreshold: function() {
      this.drawMap();
    }
  },
  computed: {
    maxVal() {
      return this.data ? max(this.data, d => d[this.variable]) : null;
    },
    maxFormatted() {
      return format(".0%")(this.maxVal);
    },
    minVal() {
      return this.data ? min(this.data, d => d[this.variable]) : null;
    },
    varMax() {
      return (Math.max(Math.abs(this.minVal), this.maxVal))
    },
    title() {
      return (`prevalence by ${this.geoLevel}`)
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
    this.drawMap();
  },
  methods: {
    setDims() {
      console.log("setting dims")
    },
    setupChoro() {
      console.log("settingup")
      this.svg = select(this.$refs.svg);
      this.blank = select(this.$refs.blank_map);
      this.overlay = select(this.$refs.overlay);
      this.regions = select(this.$refs.regions);
      this.ttips = select(this.$refs.choropleth_tooltip);

      this.colorScale = scaleSequential(interpolateYlGnBu);
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
      this.filteredData = cloneDeep(this.baseMap.features);
      console.log(this.data)

      this.colorScale = this.colorScale
        .domain([0, this.maxVal]);

      this.filteredData.forEach(d => {
        const filtered = this.data.filter(seq => seq.country == d.properties.NAME);
        if (filtered.length == 1) {
          const seq = filtered[0];
          d[this.variable] = seq[this.variable];
          d["fill"] = seq.cum_total_count >= this.countThreshold ? this.colorScale(d[this.variable]) : this.filteredColor;
          d["lower"] = seq.proportion_ci_lower;
          d["upper"] = seq.proportion_ci_upper;
          d["cum_lineage_count"] = seq["cum_lineage_count"];
          d["cum_total_count"] = seq["cum_total_count"];
          d["proportion_formatted"] = seq.proportion_formatted;
        }
      })
      // filter values with too few values
      // this.filteredData = this.filteredData.filter(d => d[this.thresholdVar] >= this.countThreshold);

    },
    drawMap() {
      this.setupMap();
      this.prepData();

      this.regions
        .selectAll("path")
        .data(this.filteredData)
        .join(
          enter => {
            enter
              .append("path")
              .attr("class", "region")
              .attr("id", d => d.location_id)
              // draw each region
              .attr("d", this.path
                .projection(this.projection)
              )
              .style("fill", d => d.fill ? d.fill : this.nullColor)
              .style("stroke", this.strokeColor)
              .style("stroke-width", 0.5)
            // .attr("stroke", d => this.countries.includes(d.properties.NAME) ? "white" : "none");
          },
          update => update,
          // .attr("fill", d => this.countries.includes(d.properties.NAME) ? this.fill : "#dce4ec"),
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        )

      console.log(this.filteredData);
      console.log("drawing")
    },
    mouseOn() {
      console.log("ttip on")
    },
    mouseOff() {
      console.log("ttip off")
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
