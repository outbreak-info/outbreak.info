<template>
<div class="d-flex flex-wrap align-items-center">
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg" class="epi-map-svg" :name="title">
    <g ref="regions" class="region-group"></g>
    <g ref="states" class="state-group"></g>
  </svg>
  <div class="tooltip choropleth-tooltip box-shadow p-2" ref="choropleth_tooltip">
    <h6 class="country-name m-0"></h6>
    <p class="value m-0 mb-3"></p>
    <template v-if="timeTrace">
      <small class="m-0">new cases per day</small>
      <Bargraph :data="timeTrace" :variableObj="{ value: 'confirmed_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
      <small class="m-0">new deaths per day</small>
      <Bargraph :data="timeTrace" :variableObj="{ value: 'dead_numIncrease' }" :width="100" :height="40" id="time-trace" :color="'#9f9f9f'" colorAverage="#2c3e50" />
</template>
  </div>
  <div class="d-flex flex-column">
    <HistogramLegend class="ml-2" :data="data" :variable="variable" :variableLabel="variableLabel" :colorScale="colorScale" />
    <DataUpdated />
  </div>

</div>
</template>

<script>
import countries from "@/assets/geo/countries.json";
import counties from "@/assets/geo/US_counties.json";
import metros from "@/assets/geo/US_metro.json";
import usstates from "@/assets/geo/US_states.json";
import * as d3 from "d3";

import HistogramLegend from "@/components/HistogramLegend.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import Bargraph from "@/components/Bargraph.vue";
import {
  getSparklineTraces
} from "@/api/epi-traces.js";

import store from "@/store";

export default {
  name: "Choropleth",
  components: {
    HistogramLegend,
    DataUpdated,
    Bargraph
  },
  props: {
    data: Array,
    variable: String,
    variableLabel: String,
    colorScale: Function,
    adminLevel: String,
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 350
    }
  },
  watch: {
    data: function() {
      this.drawMetro();
    }
  },
  data() {
    return {
      margin: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 25
      },
      // data
      regionData: null,
      projection: null,
      timeTrace: null,
      // refs
      svg: null,
      states: null,
      regions: null,
      event: null
    };
  },
  computed: {
    title() {
      return (this.variableLabel)
    }
  },
  created: function() {
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
  },
  mounted() {
    this.setupChoro();
    this.drawMetro();
  },
  beforeDestroy() {
    if (this.dataSubscritpion) {
      this.dataSubscription.unsubscribe();
    }
  },
  methods: {
    setupChoro() {
      this.svg = d3.select(this.$refs.svg);
      this.states = d3.select(this.$refs.states);
      this.regions = d3.select(this.$refs.regions);
      this.ttips = d3.select(this.$refs.choropleth_tooltip);
    },
    drawMetro() {
      if (this.data) {
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

        this.data.forEach(d => {
          const id = d.location_id.split("_").slice(-1)[0].replace("US-", "");
          const idx = this.regionData.features.findIndex(polygon => polygon.properties.GEOID === id);
          if (idx > -1) {
            this.regionData.features[idx]["fill"] = d.fill;
            this.regionData.features[idx]["location_id"] = d.location_id;
            this.regionData.features[idx]["name"] = d.name;
            this.regionData.features[idx]["value"] = d3.format(",.1f")(d[this.variable]);
            this.regionData.features[idx]["tooltip"] = this.variable.includes("_change") ?
              (d[this.variable] < 0 ? `${-1* this.regionData.features[idx]["value"]} <b>fewer</b> ${this.variableLabel}` : `${this.regionData.features[idx]["value"]} <b>more</b> ${this.variableLabel}`) :
              `${this.regionData.features[idx]["value"]} ${this.variableLabel}`;
            // metros.features[idx]["value"] = d3.format(".1f")(d[this.variable]);
          }
        })

        var path = d3.geoPath();
        if (this.adminLevel === "0") {
          this.projection = d3.geoEqualEarth()
            .scale(125)
            .translate([this.width / 2 + 10, this.height / 2]);

        } else {
          this.projection = d3.geoAlbersUsa()
            .scale(700)
            .translate([this.width / 2 + 10, this.height / 2]);
        }

        // regional data
        this.regions
          .selectAll("path")
          .data(this.regionData.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "region pointer")
                .attr("id", d => d.location_id)
                // draw each region
                .attr("d", path
                  .projection(this.projection)
                )
                .attr("fill", d => d.fill ? d.fill : "none");
            },
            update => update
            .attr("d", path
              .projection(this.projection)
            ).attr("fill", d => d.fill ? d.fill : "none"),
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
                // draw each region
                .attr("d", path
                  .projection(this.projection)
                )
            },
            update => update.attr("d", path
              .projection(this.projection)),
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

        this.svg.on("mouseleave", this.mouseOff);

        store.state.admin.loading = false;

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

.region {
    stroke: $grey-60;
    stroke-width: 0.25;
}

.region:hover {
    stroke: $base-grey;
    stroke-width: 1.5;
}

.state {
    fill: none;
    stroke: $grey-90;
    stroke-width: 1;
}

.choropleth-tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffff;
    opacity: 0;
    pointer-events: none;
}
</style>
