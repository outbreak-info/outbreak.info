<template>
<div>
  <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" ref="svg">
  </svg>
</div>
</template>

<script>
import geodata from "@/assets/geo/US_metro.json";
import usstates from "@/assets/geo/US_states.json";
import * as d3 from "d3";

export default {
  name: "Choropleth",
  props: {
    data: Array,
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
      }
    };
  },
  computed: {},
  mounted() {
    console.log(geodata)
    console.log(this.data)
    this.drawMetro();
  },
  methods: {
    drawMetro() {
      if(this.data){
      this.svg = d3.select(this.$refs.svg);

      this.data.forEach(d => {
        const id = d.location_id.replace("METRO_", "");
        const idx = geodata.features.findIndex(polygon => polygon.properties.GEOID === id);
        if(idx > -1){
          geodata.features[idx]["fill"] = d.fill;

        }
      })


      var path = d3.geoPath();
      var projection =d3.geoAlbersUsa()
      .scale(700)
      .translate([this.width / 2+10, this.height / 2]);
       //
       // d3.geoMercator()
       //  .scale(300)
       //  .center([-115.583333, 39.833333])
       //  .translate([this.width / 2, this.height / 2]);

      this.svg.append("g")
        .selectAll("path")
        .data(geodata.features)
        .enter()
        .append("path")
        .attr("class", "region")
        // draw each region
        .attr("d", path
          .projection(projection)
        )
        .attr("fill", d => d.fill ? d.fill : "none")

      this.svg.append("g")
        .selectAll("path")
        .data(usstates.features)
        .enter()
        .append("path")
        .attr("class", "state")
        // draw each region
        .attr("d", path
          .projection(projection)
        )
    }}

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
.state {
  fill: none;
  stroke: $grey-90;
  stroke-width: 0.5;
}
</style>
