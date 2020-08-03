<template>
<div class="d-flex flex-wrap justify-content-center align-items-center" ref="map_container" id="map_container">
  <svg :width="width" :height="height" ref="svg" class="epi-map-svg" :name="title">
    <g ref="regions" class="region-group"></g>
    <g ref="states" class="state-group"></g>
  </svg>
  <div class="tooltip choropleth-tooltip box-shadow p-2" ref="choropleth_tooltip">
    <h6 class="country-name m-0"></h6>
    <p class="value m-0"></p>
    <small class="m-0 text-right d-block mb-2" v-if='variable.includes("_rolling")'>(average over last 4 days)</small>

    <template v-if="timeTrace">
      <small class="m-0 mt-3">new cases per day</small>
      <Bargraph :data="timeTrace" :date1="date1" :include2Week="isDiff" :variableObj="{ value: 'confirmed_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
      <small class="m-0">new deaths per day</small>
      <Bargraph :data="timeTrace" :date1="date1" :include2Week="isDiff" :variableObj="{ value: 'dead_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
</template>
  </div>
  <div class="d-flex flex-column">
    <HistogramLegend class="ml-2" :data="data" :minVal="selectedMin" :maxVal="selectedMax" :width="widthLegend" :variable="variable" :variableLabel="variableLabel" :colorScale="colorScale" v-if="this.data && this.data.length"/>
    <div class="d-flex justify-content-between mt-4">
      <DotPlot :data="filteredData" :variable="variable" :colorScale="colorScale" :sortAsc="false" :title="variableLabel" :width="widthLegend/2-5" :rightAlign="rightAlignDesc" :varMax="varMax"/>
      <DotPlot :data="filteredData" :variable="variable" :colorScale="colorScale" :sortAsc="true"  :title="variableLabel" :width="widthLegend/2-5" :rightAlign="rightAlignAsc" :varMax="varMax"/>
    </div>
    <DataUpdated />
  </div>

</div>
</template>

<script>
import countries from "@/assets/geo/countries.json";
import counties from "@/assets/geo/US_counties.json";
import metros from "@/assets/geo/US_metro.json";
import usstates from "@/assets/geo/US_states.json";
import {
  cloneDeep
} from "lodash";
import * as d3 from "d3";

import HistogramLegend from "@/components/HistogramLegend.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import Bargraph from "@/components/Bargraph.vue";
import DotPlot from "@/components/DotPlot.vue";
import {
  getSparklineTraces
} from "@/api/epi-traces.js";

import store from "@/store";

export default {
  name: "Choropleth",
  components: {
    HistogramLegend,
    DataUpdated,
    Bargraph,
    DotPlot
  },
  props: {
    data: Array,
    variable: String,
    selectedMin: Number,
    selectedMax: Number,
    date1: String,
    variableLabel: String,
    colorScale: Function,
    adminLevel: String
  },
  watch: {
    data: function() {
      this.drawMap();
    }
  },
  data() {
    return {
      width: 0,
      height: 350,
      widthLegend: 350,
      margin: {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2
      },
      scale: 1,
      // data
      regionData: null,
      projection: null,
      timeTrace: null,
      // refs
      svg: null,
      states: null,
      regions: null,
      event: null,
      // methods
      path: d3.geoPath()
    };
  },
  computed: {
    filteredData() {
      var filtered = cloneDeep(this.data);

      if (this.selectedMin || this.selectedMin === 0) {
        filtered = filtered.filter(d => d[this.variable] >= this.selectedMin);
      }
      if (this.selectedMax || this.selectedMax === 0) {
        filtered = filtered.filter(d => d[this.variable] <= this.selectedMax);
      }
      return (filtered);
    },
    varMax() {
      const maxVal = d3.max(this.filteredData, d => d[this.variable]);
      const minVal = d3.min(this.filteredData, d => d[this.variable]);
      return (Math.max(Math.abs(minVal), maxVal))
    },
    rightAlignAsc() {
      const minVal = d3.min(this.filteredData, d => d[this.variable]);
      return(minVal < -1)
    },
    rightAlignDesc() {
      const maxVal = d3.max(this.filteredData, d => d[this.variable]);
      return(maxVal < -1)
    },
    isDiff() {
      return (this.variable.includes("_14days_ago_diff"))
    },
    title() {
      const date = d3.timeParse("%Y-%m-%d")(this.date1)
      return (this.date1 ? `${this.variableLabel} as of ${d3.timeFormat("%d %B %Y")(date)}` : this.variableLabel)
    }
  },
  created: function() {
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims();

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
  },
  beforeDestroy() {
    if (this.dataSubscritpion) {
      this.dataSubscription.unsubscribe();
    }
  },
  methods: {
    setDims() {
      const whRatio = 1.72; // based on the
      const selector = this.$refs.map_container;
      const marginLegend = 25;
      const selectorsProportion = 1;

      if (selector) {
        const dims = selector.getBoundingClientRect();

        this.width = dims.width >= 800 ? dims.width - marginLegend - this.widthLegend : dims.width;
        this.widthLegend = dims.width >= 225 ? this.widthLegend : dims.width; // make legend smaller on small screens

        const idealHeight = this.width / whRatio;
        if (idealHeight < window.innerHeight * selectorsProportion) {
          this.height = idealHeight * selectorsProportion;
        } else {
          this.height = window.innerHeight * selectorsProportion;
          this.width = this.height * whRatio - marginLegend - this.widthLegend;
        }

        // Set scale and projection for the map
        this.drawMap();
      }
    },
    setupChoro() {
      this.svg = d3.select(this.$refs.svg);
      this.states = d3.select(this.$refs.states);
      this.regions = d3.select(this.$refs.regions);
      this.ttips = d3.select(this.$refs.choropleth_tooltip);
    },
    setupMap() {
      if (this.adminLevel == "0") {
        this.regionData = countries;
      } else if (this.adminLevel == "1") {
        this.regionData = usstates;
      } else if (this.adminLevel == "1.5") {
        this.regionData = metros;
      } else if (this.adminLevel == "2") {
        this.regionData = counties;
      } else {
        this.regionData = [];
      }

      if (this.adminLevel === "0") {
        this.projection = d3.geoEqualEarth()
          .center([30.05125, 11.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

      } else {
        this.projection = d3.geoAlbersUsa()
          .scale(1)
          .translate([this.width / 2, this.height / 2]);
      }

      this.path = this.path.projection(this.projection);
      // calc and set scale
      // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
      const bounds = this.path.bounds(this.regionData),
        // llbounds = d3.geoBounds(this.regionData),
        // minLon = llbounds[0][0],
        // minLat = llbounds[0][1],
        // maxLon = llbounds[1][0],
        // maxLat = llbounds[1][1],
        // center = [d3.mean([minLon, maxLon]), d3.mean([minLat, maxLat])],
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx * 0.98,
        yscale = this.height / dy * 0.98,
        scale = d3.min([xscale, yscale]);


      this.projection = this.projection
        .scale(scale)
    },
    resetValues() {
      this.regionData.features.forEach(d => {
        d.fill = null;
        d.tooltip = null;
        d.value = null;
      })
    },
    drawMap() {
      this.setupMap();
      this.resetValues();

      if (this.filteredData && this.filteredData.length && this.width) {
        this.filteredData.forEach(d => {
          const idx = this.regionData.features.findIndex(polygon => polygon.properties.location_id === d.location_id);
          if (idx > -1) {
            this.regionData.features[idx]["fill"] = d.fill;
            this.regionData.features[idx]["location_id"] = d.location_id;
            this.regionData.features[idx]["name"] = d.name;
            this.regionData.features[idx]["value"] = d3.format(",.1f")(d[this.variable]);
            this.regionData.features[idx]["tooltip"] = this.variable.includes("_14days_ago") ?
              (d[this.variable] < 0 ? `${d3.format(",.1f")(-1*d[this.variable])} <b>fewer</b> ${this.variableLabel}` : `${this.regionData.features[idx]["value"]} <b>more</b> ${this.variableLabel}`) :
              `<b>${this.regionData.features[idx]["value"]}</b> ${this.variableLabel}`;
            // metros.features[idx]["value"] = d3.format(".1f")(d[this.variable]);
          }
        })

        // regional data
        this.regions
          .selectAll("path")
          .data(this.regionData.features, d => d.location_id)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "region pointer")
                .attr("id", d => d.location_id)
                .style("stroke", "#8aa4be")
                .style("stroke-width", 0.25)
                // draw each region
                .attr("d", this.path)
                .attr("fill", d => d.fill ? d.fill : "none");
            },
            update => update
            .attr("id", d => d.location_id)
            .attr("d", this.path)
            .call(update => update.transition().duration(250)
              .attr("fill", d => d.fill ? d.fill : "none")),
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .style("opacity", 1e-5)
              .remove()
            )
          )

        // state outline
        if (this.adminLevel !== "0") {
          this.outline = usstates.features;
        } else {
          this.outline = [];
        }
        this.states
          .selectAll("path")
          .data(this.outline)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "state")
                .style("fill", "none")
                .style("stroke", "#3e5871")
                .style("stroke-width", "1")
                // draw each region
                .attr("d", this.path)
            },
            update => update.attr("d", this.path),
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .style("opacity", 1e-5)
              .remove()
            )
          );

        // tooltip
        this.regions.selectAll("path.region")
          .on("click", d => this.handleClick(d))
          .on("mouseenter", d => this.debounceMouseon(d))
          .on("mouseleave", this.mouseOff);

        // this.svg
        // .on("mouseleave", this.mouseOff);
        store.state.admin.dataloading = false;
      } else {
        store.state.admin.dataloading = false;
      }
    },
    handleClick(d) {
      this.$router.push({
        path: "epidemiology",
        query: {
          location: d.location_id
        }
      });
    },
    // https://stackoverflow.com/questions/43407947/how-to-throttle-function-call-on-mouse-event-with-d3-js/43448820
    // modified to save the d3. event to vue::this
    debounce(fn, delay) {
      var timer = null;
      return function() {
        var context = this,
          args = arguments,
          evt = d3.event;
        //we get the D3 event here
        clearTimeout(timer);
        timer = setTimeout(function() {
          context.event = evt;
          //and use the reference here
          fn.apply(context, args);
        }, delay);
      };
    },
    mouseOn(d) {
      this.timeTrace = null; // reset to avoid seeing old data
      this.getTimetrace(d.location_id);
      const ttip = this.ttips
        .style("top", this.event.y + "px")
        .style("left", this.event.x + "px")
        .style("opacity", 1);

      this.regions.selectAll("path.region").style("opacity", 0.5);
      this.regions.selectAll("path.state").style("opacity", 0.75);
      this.regions.selectAll(`#${d.location_id}`).style("opacity", 1);

      this.ttips.select(".country-name").text(d.name);
      this.ttips.select(".value").html(d.tooltip);
    },
    mouseOff() {
      this.timeTrace = []; // reset to avoid seeing old data
      d3.selectAll(".tooltip")
        .style("opacity", 0);
      this.regions.selectAll("path.region").style("opacity", 1);
      this.regions.selectAll("path.state").style("opacity", 1);
      // cancel data subscription
      if (this.dataSubscritpion) {
        this.dataSubscription.unsubscribe();
      }
    },
    getTimetrace(location_id) {
      this.dataSubscription = getSparklineTraces(this.$apiurl, [location_id], "confirmed_numIncrease, confirmed_rolling, dead_numIncrease, dead_rolling").subscribe(results => {
        this.timeTrace = results[0].value;
      })
    }

  }
};
</script>

<style lang="scss">
// svg {
//     background: aliceblue;
// }

.region:hover {
    stroke: $base-grey;
    stroke-width: 1.5;
}

.choropleth-tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffff;
    opacity: 0;
    pointer-events: none;
}
</style>
