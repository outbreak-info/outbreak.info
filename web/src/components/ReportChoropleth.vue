<template>
<div class="d-flex flex-column align-items-center w-100" id="report-choropleth">
  <!-- choropleth -->
  <svg :width="width" :height="height" ref="choropleth" class="report-choropleth mt-3" :subtitle="subtitle" :name="title" :class="{'hidden': noMap}" style="background: aliceblue;">
    <defs>
      <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:${strokeColor}; stroke-width:0.75`" />
      </pattern>
    </defs>
    <g ref="basemap" class="basemap-group"></g>
    <g ref="regions" class="region-group"></g>
    <g ref="zero_data" class="zero-group"></g>
    <g ref="overlay" class="overlay-group"></g>
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

  <div class="w-75" v-if="showCopy && !noMap">
    <DownloadReportData :data="data" figureRef="report-choropleth" dataType="Mutation Report Choropleth" />
  </div>

</div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import DownloadReportData from "@/components/DownloadReportData.vue";

import {
  geoEqualEarth,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoPath,
  geoBounds,
  max,
  min,
  timeParse,
  timeFormat,
  format,
  event,
  transition,
  select,
  selectAll
} from "d3";

import ADMIN0_SIMPLE from "@/assets/geo/gadm_adm0_simplified.json";
import ADMIN0 from "@/assets/geo/gadm_adm0.json";
import USADATA from "@/assets/geo/US_states.json";
import ADMIN1 from "@/assets/geo/gadm_adm1_simplified.json";

export default {
  name: "ReportChoropleth",
  props: {
    data: Array,
    mutationName: String,
    report: String,
    fillMax: Number,
    location: {
      type: String,
      default: "Worldwide"
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showCopy: {
      type: Boolean,
      default: true
    },
    smallMultiples: {
      type: Boolean,
      default: false
    },
    countThreshold: Number,
    recentWindow: String,
    colorScale: Function
  },
  components: {
    DownloadReportData
  },
  data() {
    return {
      width: 800,
      height: 400,
      margin: {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2
      },
      // variables
      variable: "proportion",
      thresholdVar: "cum_total_count",
      filteredColor: "#A5A5A5",
      nullColor: "#EFEFEF",
      strokeColor: "#2c3e50",
      // data
      filteredData: null,
      // map data
      locationMap: null,
      projection: null,
      hwRatio: 0.45,
      // refs
      svg: null,
      regions: null,
      zeros: null,
      basemap: null,
      overlay: null,
      ttips: null,
      // methods
      path: geoPath(),
      transition1: 500,
      noMap: true
    }
  },
  watch: {
    data: function() {
      this.chooseMap();
      this.drawMap();
    },
    countThreshold: function() {
      this.drawMap();
    },
    width: function() {
      this.drawMap();
    }
  },
  computed: {
    maxVal() {
      return this.data ? (this.fillMax ? this.fillMax : max(this.data, d => d[this.variable])) : null;
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
      if (this.smallMultiples) {
        return (this.recentWindow ? `Prevalence over the last ${this.recentWindow} days in ${this.location}` : "Estimated prevalence")
      }
      return (this.location == "Worldwide" ? `${this.mutationName} cumulative prevalence by country` : `${this.mutationName} cumulative prevalence in ${this.location}`)
    },
    subtitle() {
      if (this.smallMultiples) {
        return (this.mutationName)
      }
      return (null)
    }
  },
  created: function() {
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);

      this.$root.$on("update:countThreshold", newThreshold => {
        // this.countThreshold = newThreshold;
        // this.drawMap();
      });

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

    this.chooseMap();
    // set initial dimensions for the choropleth plots.
    this.setDims();
    this.setupChoro(); // svg handles, etc.
  },
  methods: {
    setDims() {
      const mx = 0.8;
      const my = 0.85;
      const svgContainer = document.getElementById('report-choropleth');

      let maxSvgWidth = svgContainer ? svgContainer.offsetWidth * mx : 800;
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight * my;

      if (maxSvgWidth > maxWidth) {
        maxSvgWidth = maxWidth - 20;
      }

      const idealHeight = this.hwRatio * maxSvgWidth;
      if (idealHeight <= maxHeight) {
        this.height = idealHeight;
        this.width = maxSvgWidth;
      } else {
        this.height = maxHeight;
        this.width = this.height / this.hwRatio;
      }
    },
    chooseMap() {
      if (this.location === "Worldwide") {
        this.projection = geoEqualEarth()
          .center([11.05125, 7.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the ADMIN1 anyway...
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

        this.locationMap = cloneDeep(ADMIN0_SIMPLE);
        // this.hwRatio = 0.45;
        // this.setDims();
      } else if (this.location === "United States" || this.location === "USA") {
        this.projection = geoAlbersUsa()
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

        this.locationMap = cloneDeep(USADATA);
        // this.hwRatio = 0.45;
        // this.setDims();
      } else {
        this.locationMap = cloneDeep(ADMIN1[this.location]);
        const mapBounds = geoBounds(this.locationMap);

        this.projection = geoAzimuthalEqualArea()
          .center([0, 0])
          .rotate([(mapBounds[0][0] + mapBounds[1][0]) * -0.5, (mapBounds[0][1] + mapBounds[1][1]) * -0.5])
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

        // const mapRatio = Math.abs(mapBounds[0][1] - mapBounds[1][1]) / Math.abs(mapBounds[0][0] - mapBounds[1][0]);
        // this.hwRatio = mapRatio;
        // this.setDims();
      }
    },
    setupChoro() {
      this.svg = select(this.$refs.svg);
      this.basemap = select(this.$refs.basemap);
      this.regions = select(this.$refs.regions);
      this.zeros = select(this.$refs.zero_data);
      this.overlay = select(this.$refs.overlay);
      this.ttips = select(this.$refs.choropleth_tooltip);
    },
    formatPct(pct) {
      return (format(".0%")(pct))
    },
    updateProjection() {
      this.projection = this.projection
        .scale(1)
        .translate([this.width / 2, this.height / 2]);

      this.path = this.path.projection(this.projection);
      // calc and set scale
      // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
      const bounds = this.path.bounds(this.locationMap),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx * 0.98,
        yscale = this.height / dy * 0.98,
        scale = min([xscale, yscale]);

      this.projection = this.projection
        .scale(scale);

      this.filteredData = this.locationMap.features;
    },
    prepData() {
      if (this.data && this.locationMap) {
        // Update projection / scales
        this.updateProjection();

        this.filteredData.forEach(d => {
          const filtered = this.data.filter(seq => seq.name.toLowerCase() == d.properties.NAME.toLowerCase());
          if (filtered.length > 0) {
            filtered.sort((a,b) => b.cum_total_count - a.cum_total_count)
            const seq = filtered[0];
            d[this.variable] = seq[this.variable];
            // filter values with too few values
            d["fill"] = seq.cum_total_count >= this.countThreshold ? this.colorScale(d[this.variable]) : this.filteredColor;
            d["id"] = seq.id;
            d["lower"] = seq.proportion_ci_lower;
            d["upper"] = seq.proportion_ci_upper;
            d["cum_lineage_count"] = seq["cum_lineage_count"];
            d["cum_total_count"] = seq["cum_total_count"];
            d["proportion_formatted"] = seq.proportion_formatted;
          } else {
            d["id"] = null;
            d["fill"] = null;
            d["lower"] = null
            d["upper"] = null
            d["cum_lineage_count"] = null;
            d["cum_total_count"] = null;
            d["proportion_formatted"] = null;
          }
        });

        this.noMap = false;
      } else {
        this.filteredData = null;
        this.noMap = true;
      }
    },
    drawMap() {
      this.prepData();

      if (this.filteredData) {
        const basemapData = this.location == "Worldwide" || this.location == "United States" ? [] : ADMIN0.features.filter(d => d.properties.NAME != this.location);

        this.basemap
          .selectAll(".basemap")
          .data(basemapData, d => d.properties.location_id)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "basemap")
                .attr("id", d => d.properties.location_id)
                // draw each region
                .attr("d", this.path
                  .projection(this.projection)
                )
                .style("fill", "#FDFDFD")
                .style("stroke", "#444444")
                .style("stroke-width", 0.25)
            },
            update => update
            .attr("id", d => d.properties.location_id)
            // draw each region
            .attr("d", this.path
              .projection(this.projection)
            ),
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(10)
              .style("opacity", 1e-5)
              .remove()
            )
          )

        this.regions
          .selectAll(".region-fill")
          .data(this.filteredData, d => d.properties.location_id)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", d => `${d.properties.location_id} region region-fill`)
                .attr("id", d => d.properties.location_id)
                // draw each region
                .attr("d", this.path
                  .projection(this.projection)
                )
                .classed("pointer", true)
                .on("click", d => this.route2Location(d.id))
                .style("fill", d => d.fill ? d.fill : this.nullColor)
                .style("stroke", this.strokeColor)
                .style("stroke-width", 0.5)
            },
            update => update
            .attr("class", d => `${d.properties.location_id} region region-fill`)
            .attr("id", d => d.properties.location_id)
            .on("click", d => this.route2Location(d.id))
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

        // highlight where the data is 0.
        this.regions
          .selectAll(".zero-data")
          .data(this.filteredData.filter(d => d.proportion === 0), d => d.properties.location_id)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", d => `${d.properties.location_id} region zero-data`)
                .attr("id", d => `${d.properties.location_id}_zero`)
                // draw each region
                .attr("d", this.path
                  .projection(this.projection)
                )
                .style("fill", "url(#diagonalHatch)")
                .style("stroke", this.strokeColor)
                .style("stroke-width", 0.5)
            },
            update => update
            .attr("class", d => `${d.properties.location_id} region zero-data`)
            .attr("id", d => `${d.properties.location_id}_zero`)
            // draw each region
            .attr("d", this.path
              .projection(this.projection)
            ),
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(10)
              .style("opacity", 1e-5)
              .remove()
            )
          )

        this.overlay
          .selectAll(".overlay")
          .data(ADMIN0.features.filter(d => d.properties.NAME == this.location && d.properties.NAME != "United States"), d => d.properties.location_id)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "overlay")
                .attr("id", d => d.properties.location_id)
                // draw each region
                .attr("d", this.path
                  .projection(this.projection)
                )
                .style("fill", "none")
                .style("stroke", this.strokeColor)
                .style("stroke-width", 1.25)
            },
            update => update
            .attr("id", d => d.properties.location_id)
            // draw each region
            .attr("d", this.path
              .projection(this.projection)
            ),
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

        this.regions.selectAll("path.region")
          .on("mouseenter", d => this.debounceMouseon(d))
          .on("mouseleave", this.mouseOff);
      }
    },
    mouseOn(d) {
      const ttipShift = 15;

      // dim everything
      this.regions
        .selectAll(".region")
        .style("opacity", 0.2)
        .style("stroke-opacity", 0.5);

      // turn on the location
      this.regions
        .select(`.${d.properties.location_id}`)
        .style("opacity", 1)
        .style("stroke-opacity", 1);

      const ttip = select(this.$refs.tooltip_choro);

      // edit text
      ttip.select("h5").text(d.properties.NAME);
      if (d.proportion || d.proportion === 0) {
        ttip.select("#no-sequencing").classed("hidden", true);
        ttip.select("#proportion")
          .text(`${d.proportion_formatted} ${this.mutationName}`)
          .classed("hidden", false);

        ttip.select("#confidence-interval")
          .text(`(95% CI: ${format(".0%")(d.lower)}-${format(".0%")(d.upper)})`)
          .classed("hidden", false);

        ttip.select("#sequencing-count")
          .text(`Number of total ${this.mutationName} cases: ${format(",")(d.cum_lineage_count)}/${format(",")(d.cum_total_count)}`)
          .classed("hidden", false);

      } else {
        ttip.select("#no-sequencing").classed("hidden", false);
        ttip.select("#proportion").classed("hidden", true);
        ttip.select("#confidence-interval").classed("hidden", true);
        ttip.select("#sequencing-count").classed("hidden", true);
      }

      // fix location
      ttip
        .style("left", `${this.event.clientX + ttipShift}px`)
        .style("top", `${this.event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    mouseOff() {
      select(this.$refs.tooltip_choro)
        .style("display", "none");

      this.regions
        .selectAll(".zero-data")
        .style("opacity", 1);

      this.regions
        .selectAll(".region")
        .style("opacity", 1)
        .style("stroke-opacity", 1);

    },
    route2Location(id) {
      if (this.report == "variant") {
        const query = this.$route.query;
        const params = this.$route.params;
        let locs = query.loc ? (typeof(query.loc) == "string" ? [query.loc] : query.loc) : [];
        locs.push(id);
        this.$router.push({
          name: "MutationReport",
          params: {
            disableScroll: true,
            alias: params.alias
          },
          query: {
            pango: query.pango,
            muts: query.muts,
            selected: id,
            loc: locs
          }
        })
      } else if (this.report == "location") {
        const query = this.$route.query;
        this.$router.push({
          name: "LocationReport",
          query: {
            loc: id,
            muts: query.muts,
            alias: query.alias,
            pango: query.pango,
            variant: query.variant,
            selected: query.selected,
            dark: query.dark,
            xmax: query.xmax,
            xmin: query.xmin
          }
        })
      }
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
