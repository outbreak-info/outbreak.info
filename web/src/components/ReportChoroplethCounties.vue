<template>
  <div class="d-flex flex-column align-items-center w-100" id="map" ref="mapElement">
  <svg :width="width" :height="height" ref="geo-counties" class="geographic-counties mt-3" :subtitle="subtitle" :name="title" :class="{'hidden': noMap}" style="background: aliceblue;">
    <defs>
      <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" :style="`stroke:${strokeColor}; stroke-width:0.75`" />
      </pattern>
    </defs>
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

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-geopackage";

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-geopackage";
import DownloadReportData from "@/components/DownloadReportData.vue";

export default {
 name: "ReportChoroplethCounties",
  props: {
    data: Array,
    mutationName: String,
    abbloc: String,
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
    DownloadReportData,
 },
   data() {
   return{
     center: [37,7749, -122,4194],
     width: 800,
     height: 400,
      // variables
      variable: "proportion",
      thresholdVar: "cum_total_count",
      filteredColor: "#A5A5A5",
      nullColor: "#EFEFEF",
      strokeColor: "#2c3e50",
      // data
      filteredData: null,
      // methods
      //path: geoPath(),
      transition1: 500,
      noMap: true
   }},

 computed: {
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
 
  methods: { 
  setupLeafletMap: function () {
     console.log(this.mutationName);
     var divisionCode = this.abbloc.split("_").at(1);
     var stateCode = divisionCode.split("-").at(1);
     var fullDivision = this.location.split(",").at(0);

     var mymap = L.map(this.$refs['mapElement'], {zoomControl: false}).setView([36.7783, -119.4179], 5);
     
     L.tileLayer(
       "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
       {
         attribution:
           'Map data (c) <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
         maxZoom: 18,
         id:'mapbox/light-v9',
         accessToken:"pk.eyJ1IjoiY2FjZXZlcyIsImEiOiJja3ZpbHVsZnE1bHZwMnVxMWRkMXBzaHRrIn0.egtnoW8uhdFC7Jo3ni3nzw",
       }
     ).addTo(mymap);
     
    function getFill(d){
            //console.log("Here", d);
            return d > .90 ? '#800026' :
            d > .75  ? '#E31A1C' :
            d > .50   ? '#FD8D3C' :
            d > .20   ? '#FEB24C' :
            d > .10   ? '#FED976' :
              '#FFEDA0';};
 
     
    //we compile a list of features we need counts for
    var fval = getFill(0);
    const chorodata = this.data;
    //console.log(mymap); 
    var found = false;
    
    function setStyle(feature){
          //console.log("here", feature);
          if(feature.properties['NAME_1'] === fullDivision){
                //div level
                found = false;
                var currLoc = feature.properties['NAME_2'].replace(/\s/g,"");
                //console.log("Feat Div", currLoc);
                for (var x of Object.entries(chorodata)){
                    //console.log(x.at(1).location_id, currLoc);
                    if (x.at(1).location_id === currLoc){
                        found = true;
                        fval = getFill(x.at(1).proportion);
                        console.log(x.at(1));
                        console.log(currLoc);
                    }
                }
                if (found === false){
                    fval = getFill(0);
                 }                                       
           return{fillColor: fval, color: "black"};
           }            
    };
    
    var stater = L.geoPackageFeatureLayer([], {
    noCache: false,
    geoPackageUrl:"http://kenny.scripps.edu:3030/download_gadm",
    //geoPackageUrl: "/home/chrissy/outbreak.info/web/src/assets/geo/gadm36_USA.gpkg",
    layerName: "gadm36_USA_2",
    style: setStyle,
    onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name, {color:feature.properties.fillColor});
    },
    }).addTo(mymap);  
  
}
 },
 mounted(){this.setupLeafletMap();}
}

</script>
<style scoped>
#map {
 width: 80vw;
 height: 30vh;
}
</style>
