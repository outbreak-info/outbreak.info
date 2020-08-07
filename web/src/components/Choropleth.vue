<template>
<div class="d-flex flex-wrap justify-content-center align-items-center" ref="map_container" id="map_container">
  <div class="d-flex flex-column align-items-center">
    <h4 ref="date"></h4>
    <svg :width="width" :height="height" ref="svg" class="epi-map-svg" :name="title">
      <g ref="blank_map" class="blank-map-group"></g>
      <g ref="regions" class="region-group"></g>
      <g ref="overlay" class="overlay-map-group"></g>
    </svg>
  </div>
  <div class="tooltip choropleth-tooltip box-shadow p-2" ref="choropleth_tooltip">
    <h6 class="country-name m-0"></h6>
    <p class="value m-0"></p>
    <small class="m-0 text-right d-block mb-2" v-if='variable.includes("_rolling")'>(average over last {{rollLength}} days)</small>

    <template v-if="timeTrace">
      <div class="d-flex m-0 mt-3">
        <div class="d-flex flex-column">
          <small class="">new cases per day</small>
          <Bargraph :data="timeTrace" :date1="date1" :include2Week="isDiff" :variableObj="{ value: 'confirmed_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
        </div>
        <div class="d-flex flex-column ml-3">
          <small class="underline">on {{date}}</small>
          <table>
            <tr>
              <td class="line-height-1 text-right pb-1" style="vertical-align: top;">
                <b>{{timeConfirmed}}</b>
              </td>
              <td class="line-height-1 pl-2" style="width: 125px; vertical-align: top;">
                new cases
              </td>
            </tr>
            <tr>
              <td class="line-height-1 text-right" style="vertical-align: top;">
                <b>{{timeConfirmedPC}}</b>
              </td>
              <td class="line-height-1 pl-2" style="width: 125px; vertical-align: top;">
                new cases per 100,000
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div class="d-flex m-0 mt-3">
        <div class="d-flex flex-column">
          <small class="">new deaths per day</small>
          <Bargraph :data="timeTrace" :date1="date1" :include2Week="isDiff" :variableObj="{ value: 'dead_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
        </div>
        <div class="d-flex flex-column ml-3">
          <small class="underline">on {{date}}</small>
          <table>
            <tr>
              <td class="line-height-1 text-right pb-1" style="vertical-align: top;">
                <b>{{timeDead}}</b>
              </td>
              <td class="line-height-1 pl-2" style="width: 125px; vertical-align: top;">
                new deaths
              </td>
            </tr>
            <tr>
              <td class="line-height-1 text-right" style="vertical-align: top;">
                <b>{{timeDeadPC}}</b>
              </td>
              <td class="line-height-1 pl-2" style="width: 125px; vertical-align: top;">
                new deaths per 100,000
              </td>
            </tr>
          </table>
        </div>
      </div>


    </template>
  </div>
  <div class="d-flex flex-column">
    <HistogramLegend class="ml-2" :data="data" :animate="animate" :transition1="transition1" :minVal="selectedMin" :maxVal="selectedMax" :width="widthLegend" :variable="variable" :variableLabel="variableLabel" :colorScale="colorScale"
      v-if="this.data && this.data.length" />
    <div class="d-flex justify-content-between mt-4" v-if="filteredData">
      <DotPlot :data="filteredData" :variable="variable" :animate="animate" :transition1="transition1" :colorScale="colorScale" :sortAsc="false" :title="variableLabel" :width="widthLegend/2-5" :rightAlign="rightAlignDesc" :varMax="varMax" />
      <DotPlot :data="filteredData" :variable="variable" :animate="animate" :transition1="transition1" :colorScale="colorScale" :sortAsc="true" :title="variableLabel" :width="widthLegend/2-5" :rightAlign="rightAlignAsc" :varMax="varMax" />
    </div>
    <DataUpdated />
  </div>

</div>
</template>

<script>
import {
  cloneDeep
} from "lodash";
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
  selectAll
} from "d3";

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
    outline: Array,
    blankMap: Object,
    variable: String,
    selectedMin: Number,
    selectedMax: Number,
    date1: String,
    maxDate: Date,
    variableLabel: String,
    colorScale: Function,
    adminLevel: String,
    animate: Boolean
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
      // data
      filteredData: null,
      projection: null,
      timeTrace: null,
      timeConfirmed: null,
      timeConfirmedPC: null,
      timeDead: null,
      timeDeadPC: null,
      // refs
      svg: null,
      blank: null,
      overlay: null,
      regions: null,
      event: null,
      // methods
      path: geoPath(),
      transition1: 500
    };
  },
  computed: {
    maxVal() {
      return this.filteredData ? max(this.filteredData, d => d[this.variable]) : null;
    },
    minVal() {
      return this.filteredData ? min(this.filteredData, d => d[this.variable]) : null;
    },
    varMax() {
      return (Math.max(Math.abs(this.minVal), this.maxVal))
    },
    rightAlignAsc() {
      return (this.minVal < -1)
    },
    rightAlignDesc() {
      return (this.maxVal < -1)
    },
    isDiff() {
      return (this.variable.includes("_14days_ago_diff"))
    },
    dateTime() {
      return this.date1 ? timeParse("%Y-%m-%d")(this.date1) : null;
    },
    date() {
      if (this.dateTime) {
        return (timeFormat("%d %B %Y")(this.dateTime));
      } else {
        return (null)
      }
    },
    rollLength() {
      const dateDiff = (this.maxDate - this.dateTime) / (1000 * 3600 * 24);
      return (dateDiff > 2 ? 7 : dateDiff + 4)
    },
    title() {
      return (this.date1 ? `${this.variableLabel} as of ${this.date}` : this.variableLabel)
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
  },
  beforeDestroy() {
    if (this.dataSubscritpion) {
      this.dataSubscription.unsubscribe();
    }
  },
  methods: {
    setDims(redraw = true) {
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
        if (redraw) {
          this.drawMap();
        }

      }
    },
    setupChoro() {
      this.svg = select(this.$refs.svg);
      this.blank = select(this.$refs.blank_map);
      this.overlay = select(this.$refs.overlay);
      this.regions = select(this.$refs.regions);
      this.ttips = select(this.$refs.choropleth_tooltip);
    },
    setupMap() {
      if (this.adminLevel === "0") {
        this.projection = geoEqualEarth()
          .center([30.05125, 11.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
          .scale(1)
          .translate([this.width / 2, this.height / 2]);

      } else {
        this.projection = geoAlbersUsa()
          .scale(1)
          .translate([this.width / 2, this.height / 2]);
      }

      this.path = this.path.projection(this.projection);
      // calc and set scale
      // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
      const bounds = this.path.bounds(this.blankMap),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        xscale = this.width / dx * 0.98,
        yscale = this.height / dy * 0.98,
        scale = min([xscale, yscale]);

      this.projection = this.projection
        .scale(scale)
    },
    drawMap() {
      this.setupMap();

      this.filteredData = cloneDeep(this.data);

      if (this.selectedMin || this.selectedMin === 0) {
        this.filteredData = this.filteredData.filter(d => d[this.variable] >= this.selectedMin);
      }
      if (this.selectedMax || this.selectedMax === 0) {
        this.filteredData = this.filteredData.filter(d => d[this.variable] <= this.selectedMax);
      }

      if (this.filteredData && this.width) {
        // blank map outline
        this.blank
          .selectAll("path")
          .data(this.blankMap.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "blank-outline")
                .style("fill", "none")
                .style("stroke", "#8aa4be")
                .style("stroke-width", 0.25)
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

        // regional data
        this.regions
          .selectAll("path")
          .data(this.filteredData, d => d.location_id)
          .join(
            enter => {
              // update date
              select(this.$refs.date)
                .html(this.date);

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
            update => {
              // update date
              select(this.$refs.date)
                .html(this.date);

              update
                .attr("id", d => d.location_id)
                .attr("d", this.path)
                .call(update => {
                  if (this.animate) {
                    update.transition().duration(this.transition1)
                      .attr("fill", d => d.fill ? d.fill : "none")
                  } else {
                    update
                      .attr("fill", d => d.fill ? d.fill : "none")
                  }
                })
            },
            exit =>
            exit.call(exit =>
              exit
              .transition()
              .style("opacity", 1e-5)
              .remove()
            )
          )

        // state map overlay
        this.overlay
          .selectAll("path")
          .data(this.outline)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "outline")
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
          evt = event;
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
      this.timeConfirmed = this.timeConfirmedPC = this.timeDead = this.timeDeadPC = null; // reset to avoid seeing old data
      if (d.value) {
        this.getTimetrace(d.location_id);

        const ttip = this.ttips
          .style("top", this.event.y + "px")
          .style("left", this.event.x + "px")
          .style("opacity", 1);

        this.regions.selectAll("path.region").style("opacity", 0.5);
        this.regions.selectAll("path.outline").style("opacity", 0.75);
        this.regions.selectAll(`#${d.location_id}`).style("opacity", 1);
        this.ttips.select(".country-name").text(d.name);
        this.ttips.select(".value").html(d.tooltip);
      }
    },
    mouseOff() {
      this.timeTrace = []; // reset to avoid seeing old data
      this.timeConfirmed = this.timeConfirmedPC = this.timeDead = this.timeDeadPC = null;
      selectAll(".tooltip")
        .style("opacity", 0);
      this.regions.selectAll("path.region").style("opacity", 1);
      this.regions.selectAll("path.outline").style("opacity", 1);
      // cancel data subscription
      if (this.dataSubscritpion) {
        this.dataSubscription.unsubscribe();
      }
    },
    getTimetrace(location_id) {
      this.dataSubscription = getSparklineTraces(this.$apiurl, [location_id], "confirmed_numIncrease, confirmed_rolling, dead_numIncrease, dead_rolling, dead_rolling_per_100k, confirmed_rolling_per_100k").subscribe(results => {
        this.timeTrace = results[0].value;
        const currentData = this.timeTrace.filter(d => d.date - this.dateTime === 0);

        if (currentData.length === 1) {
          this.timeConfirmed = format(",.1f")(currentData[0].confirmed_rolling);
          this.timeConfirmedPC = format(",.1f")(currentData[0].confirmed_rolling_per_100k);
          this.timeDead = format(",.1f")(currentData[0].dead_rolling);
          this.timeDeadPC = format(",.1f")(currentData[0].dead_rolling_per_100k);
        }

      })
    }

  }
};
</script>

<style lang="scss">
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
.underline {
    text-decoration: underline;
}
</style>
