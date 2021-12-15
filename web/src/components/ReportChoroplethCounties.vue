<template>
<div class="d-flex flex-column align-items-center w-100" id="geo-counties">
  <!-- choropleth -->
  <svg :width="width" :height="height" ref="geo-counties" class="geo-counties mt-3" :subtitle="subtitle" :name="title" :class="{'hidden': noMap}" style="background: aliceblue;">
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
    <DownloadReportData :data="data" figureRef="geo-counties" dataType="Mutation Report Choropleth" />
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

import ADMIN1 from "@/assets/geo/gadm_adm1_simplified.json";
import USADATA from "@/assets/geo/US_states.json";
export default {
  name: "ReportChoropleth",
  props: {
    data: Array,
    abbloc: String,
    poly: Array,
    mutationName: String,
    report: String,
    fillMax: Number,
    location: {
      type: String,
      default: "United States"
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
      const svgContainer = document.getElementById('geo-counties');
      
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
        console.log("county in choose map");
        var country = this.location.split(",").at(-1).trim();
        //iterate and find outline of state/division
        for (var x of Object.entries(this.poly.at(0))){
            var location = x.at(1)._source.location.trim();
            if (location === "None"){
                this.locationMap = JSON.parse(x.at(1)._source.shape);
                const mapBounds = geoBounds(this.locationMap);       
                var height = mapBounds[1][0] - mapBounds[0][0];
                var width = mapBounds[1][1] - mapBounds[0][1];
                //console.log(height, width, (height/width));
                this.hwRatio = height/width;
                
                //console.log("MAP BOUNDS", mapBounds, this.hwRatio);   
                this.projection = geoAzimuthalEqualArea()
                  .center([0, 0])
                  .rotate([(mapBounds[0][0] + mapBounds[1][0]) * -0.5, (mapBounds[0][1] + mapBounds[1][1]) * -0.5])
                  .scale(1)
                  .translate([this.width / 2, this.height / 2]);
                        
            }
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
      //this.filteredData = this.locationMap.features;
    },
    prepData(){
      if (this.data && this.locationMap) {
        // Update projection / scales
        this.updateProjection();
        this.filteredData = [];
        //console.log(this.data);
        for (var x of Object.entries(this.poly.at(0))){
            const parsedGeoJson = JSON.parse(x.at(1)._source.shape);
            const l = x.at(1)._source.location.trim();
            var location = x.at(1)._source.location.replace(/\s+/g,"").trim();
            var found = false;
            //loop over property information
            for (var y of Object.entries(this.data)){
                var count_loc = y.at(1)['location_id'];
                //console.log(count_loc, location);
                if (count_loc === location){
                    found = true;
                    //console.log(count_loc, location);
                    parsedGeoJson['properties'] = {'proportion': y.at(1)['proportion']};
                    //let stringrep = count_loc.toString();
                    //parsedGeoJson['properties']['location_id'] = stringrep
                    //console.log(this.colorScale(y.at(1)['proportion']));
                    parsedGeoJson["proportion_formatted"] = y.at(1)['proportion_formatted'];
                    parsedGeoJson['fill'] = this.colorScale(y.at(1)['proportion']);
                    parsedGeoJson["id"] = l;
                    parsedGeoJson['proportion'] = y.at(1)['proportion'];
                    parsedGeoJson['cum_lineage_count'] = y.at(1)['cum_lineage_count'];
                    parsedGeoJson["cum_total_count"]= y.at(1)['cum_total_count'];
                    //console.log(parsedGeoJson);
                }
            }
            if (found === false){
                parsedGeoJson['properties'] = {'proportion': -1};
                parsedGeoJson['cum_lineage_count'] = null;
                parsedGeoJson['proportion_formatted'] = null;
                parsedGeoJson["id"] = null; 
                parsedGeoJson["cum_total_count"]=null;
            }
                   
            parsedGeoJson['lower'] = null;
            parsedGeoJson["upper"] = null; 
            parsedGeoJson['properties']['location_id'] = l;
            this.filteredData.push(JSON.parse(JSON.stringify(parsedGeoJson)));
            //console.log(this.filteredData);
            //this.filteredData.push(parsedGeoJson);
        }

       this.noMap = false;
      } else {
        this.filteredData = null;
        this.noMap = true;
      }
    },

    drawMap() {
      this.prepData();
      const basemapData = [];
      if (this.filteredData) {
        this.basemap
          .selectAll(".basemap")
          .data(this.filteredData, d => d.properties.location_id)
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
            )
            .transition(250)
            .duration(210)
            .style("fill", d => d.fill ? d.fill : this.nullColor),
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(250)
              .style("opacity", 1e-5)
              .remove()
            )
          )
        this.regions
          .selectAll(".region-fill")
          .data(this.filteredData.filter(d => d.proportion >0, d => d.properties.location_id))
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
        
        //console.log(this.filteredData);
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
        .select(`.${d.id}`)
        .style("opacity", 1)
        .style("stroke-opacity", 1);

      const ttip = select(this.$refs.tooltip_choro);
      console.log(d);
      // edit text
      ttip.select("h5").text(d.properties.location_id);
      if (d.proportion || d.proportion === -1) {
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

      //this.regions
      //  .selectAll(".zero-data")
      //  .style("opacity", 1);

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
        console.log("IN THIS ROUTE", this.abbloc, this.loc, id); 
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
