<template>
<div v-if="this.height && this.data && this.data.length > 0" class="full-page container d-flex flex-column align-items-center full-page mt-4" id="mapContainer">
  <div :style="{ height: height + 'px', width: width + 'px' }" id="case-map">
    <l-map :zoom="zoom" :center="center" :options="mapOptions" style="height: 80%" @update:center="centerUpdate" @update:zoom="zoomUpdate" ref="map" @mouseover="turnZoomOn" @mouseout="turnZoomOff">
      <l-tile-layer :url="url" :attribution="attribution" :opacity="0.3" />
      <l-tile-layer :url="urlLabels" :attribution="attribution" :opacity="0.25" v-if="currentZoom > 3" />
      <div v-for="(circle, i) in data" :key="i">
        <l-circle-marker v-if="currentZoom > 2 && !circle.num_subnational || currentZoom <= 2 && circle.admin_level === 0" :lat-lng="circle.coord" :radius="circle.r" :color="'grey'" :fillColor="circle.fill" :weight="0.5" :fillOpacity="0.8">
          <l-tooltip :options="{ permanent: false, interactive: true }">
            <div>
              {{ circle.name }}
            </div>
            <small>click to view details</small>
          </l-tooltip>
          <l-popup>
            <h3>
              <router-link :to="{
                  name: 'Epidemiology',
                  query: { location: circle.location_id }
                }" class="router-link-black">{{ circle.name }}</router-link>
            </h3>
            <table class="summary-table">
              <tr>
                <th class="px-3 td-date-updated">
                  updated
                </th>
                <th class="px-3 sortable td-total" @click="sortTotal()">
                  total {{variable}}
                </th>
                <th class="px-2 sortable td-new-cases" @click="sortNew()">
                  new {{variable}} today
                </th>
                <th class="px-2 sortable td-pct-increase" @click="sortPct()">
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
      </div>
    </l-map>
    <div class="legend box-shadow">
      <div class="px-2 py-2">
        <div class="case-count d-flex flex-column">
          <svg :width="legendWidth + legendGap" :height="legendHeight + margin.circles + margin.colors" v-show="showLegend">
            <defs>
              <linearGradient id="gradient-legend" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop v-for="(color, i) in legendColors" :key="i" :offset="(i / 10) * 100 + '%'" :style="`stop-color:${color}; stop-opacity:1`" />
              </linearGradient>
            </defs>

            <g id="legend-radius" transform="translate(2,0)">
              <text x="0" y="0" dominant-baseline="hanging" opacity="0.6">
                TOTAL {{variable.toUpperCase()}}
              </text>
              <g v-for="circle in legendCircles" :key="circle.cases">
                <circle class="legend-circle" :fill="circle.fill" stroke="grey" stroke-width="0.5" fill-opacity="0.75" transform="translate(0,15)" :cx="circle.x" :cy="legendHeight / 2" :r="circle.r"></circle>
                <text class="legend-circle-text" dominant-baseline="hanging" text-anchor="middle" font-size="0.85em" :x="circle.x" :y="legendHeight / 2 - circle.r">
                  {{ circle.cases }}
                </text>
              </g>
            </g>
            <g id="spacer">
              <line x1="0" :x2="legendWidth + legendGap" :y1="legendHeight + margin.circles - margin.gap" :y2="legendHeight + margin.circles - margin.gap" stroke="white"></line>
            </g>

            <g id="legend-color">
              <text x="0" :y="legendHeight + margin.circles + margin.gap * 2" dominant-baseline="hanging" opacity="0.6">
                NEW {{variable.toUpperCase()}} TODAY
              </text>
              <g transform="translate(0, 5)">
                <text :x="legendWidth + legendGap" :y="legendHeight + margin.circles + margin.gap * 2 + 26" font-size="0.85em" class="legend-label legend-label--max" text-anchor="end">
                  {{ colorMax.toLocaleString() }}
                </text>
                <text :x="0" :y="legendHeight + margin.circles + margin.gap * 2 + 26" font-size="0.85em" class="legend-label legend-label--min">
                  0
                </text>
                <rect :width="legendWidth + legendGap" height="15" :y="legendHeight + margin.circles + margin.gap * 2 + 30" fill="url(#gradient-legend)" stroke="black" :stroke-width="0.5"></rect>
              </g>
            </g>
          </svg>
          <button @click="showLegend = !showLegend">
            <small>{{ showLegend ? "hide" : "show" }} legend</small>
          </button>
        </div>
      </div>
    </div>
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
  sum,
  timeFormat,
  format,
  range
} from "d3";
import {
  interpolateYlGnBu
} from "d3-scale-chromatic";
import { getCurrentDate } from "@/api/biothings.js";

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
    data: Array,
    variable: String
  },
  data() {
    return {
      width: null,
      height: null,
      formatDate: timeFormat("%d %b %Y"),
      legendWidth: null,
      legendHeight: null,
      legendCircles: null,
      colorMax: null,
      legendColors: null,
      legendGap: 20,
      margin: {
        gap: 2,
        circles: 25,
        colors: 60
      },
      showLegend: true,
      zoom: 1,
      center: latLng(26.5, 3.5),
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.png",
      // "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      urlLabels: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}{r}.png",
      attribution: 'Data from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank">JHU CSSE</a> | Map tiles by <a href="http://stamen.com" target="_blank">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0" target="_blank">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      currentZoom: 1,
      currentCenter: latLng(26.5, 3.5),
      mapOptions: {
        zoomSnap: 0.5,
        maxZoom: 7,
        minZoom: 0,
        worldCopyJump: true,
        scrollWheelZoom: false
        // bounds: [
        //   //south west
        //   [-180, -72],
        //   //north east
        //   [180, 72]
        // ]
      }
    };
  },
  computed: {
  },
  watch: {
    data: function() {
      this.prepData();
    },
    variable: function() {
      this.prepData();
    }
  },
  methods: {
    setWidth() {
      const aspectRatio = 1.3;
      this.width = window.innerWidth*.9;
      const idealHeight = this.width / aspectRatio;
      if (idealHeight < window.innerHeight) {
        this.height = idealHeight;
      } else {
        this.height = window.innerHeight;
        this.width = this.height * aspectRatio;
      }

      if (this.width < 400) {
        this.zoomUpdate(0);
        this.showLegend = false;
        this.height = window.innerHeight;
      } else if (this.width >= 400 && this.width < 700) {
        this.zoom = 1;
      } else if (this.width >= 700 && this.width < 1100) {
        this.zoom = 1.5;
      } else if (this.width >= 1100 && this.width < 1500) {
        this.zoom = 2;
      } else if (this.width >= 1500 && this.width < 2500) {
        this.zoom = 2.5;
      } else {
        this.zoom = 3.5;
      }
      if (this.$refs.map) {
        this.$refs.map.mapObject._onResize();
      }
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    turnZoomOn() {
      this.$refs.map.mapObject.scrollWheelZoom.enable();
      this.$refs.map.mapObject._onResize();
    },
    turnZoomOff() {
      this.$refs.map.mapObject.scrollWheelZoom.disable();
      this.$refs.map.mapObject._onResize();
    },
    prepData() {
      if (this.data) {
        this.data.forEach(d => {
          d["fill"] = d[`${this.variable}_currentCases`] ? this.colorScale(d[`${this.variable}_currentIncrease`]) : "#CCC";
          d["r"] = this.radiusScale(d[`${this.variable}_currentCases`]);
          d["currentDateFormatted"] = this.formatDate(d[`${this.variable}_currentToday`]);
          d["numIncreaseFormatted"] = d[`${this.variable}_currentIncrease`].toLocaleString();
          d["pctIncreaseFormatted"] = this.formatPercent(d[`${this.variable}_currentPctIncrease`]);
          d["totalNumFormatted"] = d[`${this.variable}_currentCases`].toLocaleString();
        });
      }
    },
    colorScale(d) {
      const scale = scaleSequential(interpolateYlGnBu)
        .domain([1,
          max(this.data, d => d[`${this.variable}_currentIncrease`])
        ]).clamp(false);
      const domain = scale.domain();

      let colors = range(domain[0], domain[1], (domain[1] - domain[0]) / 11);
      this.colorMax = domain[1];
      this.legendColors = colors.map(d => scale(d));
      return scale(d);
    },
    radiusScale(d) {
      const scale = scaleSqrt()
        .domain([1, max(this.data, d => d[`${this.variable}_currentCases`])])
        .range([3, 40])
        .nice();
      const domain = scale.domain();

      // const circles = range(domain[0], domain[1], (domain[1] - domain[0]) / 4);
      const circles = [0, 1, 100, 1000, 10000, domain[1]].filter(d => d <= domain[1]);
      this.legendCircles = circles.map((d, i) => {
        return {
          cases: d.toLocaleString(),
          r: scale(d),
          fill: d > 0 ? "white" : "#AAA",
          x: sum(circles.slice(0, i).map(d => scale(d))) +
            sum(circles.slice(1, i).map(d => scale(d))) +
            scale(d) +
            i * this.legendGap
        };
      });
      this.legendHeight = max(this.legendCircles, d => d.r) * 2;
      this.legendWidth =
        sum(this.legendCircles, d => d.r) * 2 + 4 * this.legendGap;
      return scale(d);
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
      window.addEventListener("resize", this.setWidth);
    });
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#case-map {
    & table {
        border-collapse: collapse;
        font-size: 0.85em;
    }

    & tr {
        border-bottom: 1px solid #ececec;
        // border-bottom: 1px solid $grey-40;
    }

    & td {
        padding: 5px 0;
        text-align: center;
    }

    & th {
        font-size: 0.95em;
        font-weight: 400;
        color: $grey-70;
    }

    & .legend {
        background: #ffffff99;
        position: absolute;
        bottom: calc(20% + 0.5em); // leaflet inserts a position=relative div w/ height = 80%
        left: 0.5em;
        z-index: 1000;
    }
}
#case-map {
    position: relative;
}

.leaflet-control-attribution {
    opacity: 1 !important;
}
</style>
