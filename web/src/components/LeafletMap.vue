<template>
<div v-if="this.height && this.data">
  <h3 v-if="this.mostRecentDate">Current cases as of {{formatDate(mostRecentDate)}}</h3>
  <div :style="{height: height + 'px', width: width + 'px'}">
    <l-map :zoom="zoom" :center="center" :options="mapOptions" style="height: 80%" @update:center="centerUpdate" @update:zoom="zoomUpdate">
      <l-tile-layer :url="url" :attribution="attribution" :opacity="0.3" />
      <l-tile-layer :url="urlLabels" :attribution="attribution" :opacity="0.25" v-if="currentZoom > 3" />
      <l-circle-marker v-for="(circle, i) in data" :key="i" :lat-lng="circle.coord" :radius="circle.r" :color="'grey'" :fillColor="circle.fill" :weight="0.5" :fillOpacity="0.8">
        <l-tooltip :options="{ permanent: false, interactive: true }">
          <div>
            {{circle.locationName}}
          </div>
          <small>click to view details</small>
        </l-tooltip>
        <l-popup>
          <h3>
            <router-link :to="{
              name: 'Epidemiology',
              query: { location: circle.locationName }
            }" class="router-link-black">{{circle.locationName}}</router-link>
          </h3>
          <table class="summary-table">
            <tr>
              <th class="px-3">
                updated
              </th>
              <th class="px-3 sortable total" @click="sortTotal()">
                total cases
              </th>
              <th class="px-2 sortable new-cases" @click="sortNew()">
                new cases today
              </th>
              <th class="px-2 sortable pct-increase" @click="sortPct()">
                increase from yesterday
              </th>
            </tr>
            <tr>
              <td>
                {{ circle.currentDateFormatted }}
              </td>
              <td>
                {{ circle.totalNumFormatted }}
              </td>
              <td>
                {{ circle.numIncreaseFormatted }}
              </td>
              <td>
                {{ circle.pctIncreaseFormatted }}
              </td>
            </tr>
          </table>
        </l-popup>
      </l-circle-marker>
    </l-map>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  latLng
} from "leaflet";
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LPopup,
  LTooltip
} from "vue2-leaflet";

import {
  scaleSqrt,
  scaleSequential,
  max,
  timeFormat,
  format
} from "d3";
import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

import store from "@/store";
import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "LeafletMap",
  components: {
    LMap,
    LTileLayer,
    LCircleMarker,
    LPopup,
    LTooltip
  },
  props: {
    data: Array
  },
  data() {
    return {
      width: null,
      height: null,
      formatDate: timeFormat("%d %b %Y"),
      zoom: 1,
      center: latLng(26.5, 3.5),
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png",
      // "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      urlLabels: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      currentZoom: 1,
      currentCenter: latLng(26.5, 3.5),
      mapOptions: {
        zoomSnap: 0.5,
        maxZoom: 7,
        minZoom: 0
      }
    };
  },
  computed: {
    ...mapState("epidata", ["mostRecentDate"])
  },
  watch: {
    data: function() {
      this.prepData();
    }
  },
  methods: {
    setWidth() {
      const aspectRatio = 1.3;
      this.width = window.innerWidth;
      const idealHeight = this.width / aspectRatio;
      if (idealHeight < window.innerHeight) {
        this.height = idealHeight;
      } else {
        this.height = window.innerHeight;
        this.width = this.height * aspectRatio;
      }


      if (this.width < 400) {
        this.zoomUpdate(0);
      } else if (this.width >= 400 && this.width < 700) {
        this.currentZoom = 1;
      } else if (this.width >= 700 && this.width < 1100) {
        this.currentZoom = 1.5;
      } else if (this.width >= 1100 && this.width < 1500) {
        this.zoomUpdate(5)
      } else if (this.width >= 1500 && this.width < 2500) {
        this.zoomUpdate(2.5);
      } else {
        this.currentZoom = 3.5;
      }

    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    innerClick() {
      alert("Click!");
    },
    prepData() {
      if (this.data) {
        console.log(this.data)
        this.data.forEach(d => {
          d['fill'] = this.colorScale(d.numIncrease);
          d['r'] = this.radiusScale(d.currentCases);
          d["currentDateFormatted"] = this.formatDate(d.currentDate);
          d["numIncreaseFormatted"] = d.numIncrease.toLocaleString();
          d["pctIncreaseFormatted"] = this.formatPercent(d.pctIncrease);
          d["totalNumFormatted"] = d.currentCases.toLocaleString();
        })
      }
    },
    colorScale(d) {
      const scale = scaleSequential(interpolateYlGnBu).domain([0, max(this.data, d => d.numIncrease)]);
      return scale(d)
    },
    radiusScale(d) {
      const scale = scaleSqrt().domain([1, max(this.data, d => d.currentCases)]).range([3, 50]);
      return scale(d)
    },
    formatPercent(pct) {
      if (!pct) {
        return "none";
      }

      if (pct < 0) {
        return "case count corrected";
      }

      if (pct < 0.005) {
        return "< 1%";
      }

      if (!isFinite(pct)) {
        return "* first reported case *";
      }

      return format(".0%")(pct);
    }
  },
  mounted() {
    this.setWidth();

    this.prepData();

    this.$nextTick(function() {
      window.addEventListener('resize', this.setWidth);
    })
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
table {
    border-collapse: collapse;
    font-size: 0.85em;
}

tr {
    border-bottom: 1px solid #ececec;
    // border-bottom: 1px solid $grey-40;
}

td {
    padding: 5px 0;
    text-align: center;
}

th {
    font-size: 0.95em;
    font-weight: 400;
    color: $grey-70;
}
</style>
