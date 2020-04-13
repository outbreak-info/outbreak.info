<template>
<div>
  <h1>variable: {{variable}}</h1>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg">
    <g ref="regions" class="region-group"></g>
    <g ref="states" class="state-group"></g>
  </svg>
  <div class="tooltip choropleth-tooltip p-2" ref="choropleth_tooltip">
    <h6 class="country-name m-0"></h6>
    <p class="value m-0"></p>
  </div>
  <HistogramLegend :data="data" :variable="variable" :colorScale="colorScale" />
</div>
</template>

<script>
import geodata from "@/assets/geo/US_metro.json";
import usstates from "@/assets/geo/US_states.json";
import * as d3 from "d3";

import HistogramLegend from "@/components/HistogramLegend.vue"

export default {
  name: "Choropleth",
  components: {
    HistogramLegend
  },
  props: {
    data: Array,
    variable: String,
    colorScale: Function,
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
      // refs
      svg: null,
      states: null,
      regions: null
    };
  },
  computed: {},
  mounted() {
    console.log(geodata)
    console.log(this.data)
    this.setupChoro();
    this.drawMetro();
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

        this.data.forEach(d => {
          const id = d.location_id.replace("METRO_", "");
          const idx = geodata.features.findIndex(polygon => polygon.properties.GEOID === id);
          if (idx > -1) {
            geodata.features[idx]["fill"] = d.fill;
            geodata.features[idx]["location_id"] = d.location_id;
            geodata.features[idx]["name"] = d.name;
            geodata.features[idx]["value"] = d3.format(".1f")(d[this.variable]);
          }
        })

        var path = d3.geoPath();
        var projection = d3.geoAlbersUsa()
          .scale(700)
          .translate([this.width / 2 + 10, this.height / 2]);

        // regional data
        this.regions
          .selectAll("path")
          .data(geodata.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "region")
                .attr("id", d => d.location_id)
                // draw each region
                .attr("d", path
                  .projection(projection)
                )
                .attr("fill", d => d.fill ? d.fill : "none");
            },
            update => update.attr("fill", d => d.fill ? d.fill : "none")
          )

        // state outline
        this.states
          .selectAll("path")
          .data(usstates.features)
          .join(
            enter => {
              enter
                .append("path")
                .attr("class", "state")
                // draw each region
                .attr("d", path
                  .projection(projection)
                )
            }
          );

        // tooltip
        this.regions.selectAll("path.region")
          .on("mouseenter", d => this.mouseOn(d))
          .on("mouseleave", this.mouseOff);

      }
    },
    mouseOn(d) {
      const ttip = this.ttips
        .style("top", d3.event.y + "px")
        .style("left", d3.event.x + "px")
        .style("opacity", 1);

      this.regions.selectAll("path.region").style("opacity", 0.5);
      this.regions.selectAll(`#${d.location_id}`).style("opacity", 1);

      this.ttips.select(".country-name").text(d.name);
      this.ttips.select(".value").text(d.value);
    },
    mouseOff() {
      d3.selectAll(".tooltip")
        .style("opacity", 0);
      this.regions.selectAll("path.region").style("opacity", 1);
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
    stroke-width: 0.5;
}

.region:hover {
    stroke: $base-grey;
    stroke-width: 1.5;
}

.state {
    fill: none;
    stroke: $grey-90;
    stroke-width: 0.5;
}

.choropleth-tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffff;
    opacity: 0;
    pointer-events:none;
}
</style>
