<template>
  <div
    class="country-bar-graph flex-column align-left"
    :id="`region-graphs-${id}`"
    ref="countryBars"
  >
    <h4 class="plot-title">
      Current total COVID-19 {{ variable }} in
      <span @click="handleClick" class="region-name">{{ region }}</span>
    </h4>

    <svg
      :width="
        `${width +
          margin.left +
          margin.right +
          sparkWidth +
          newCasesWidth +
          4 * margin.gap}`
      "
      :height="`${height + margin.top + margin.bottom}`"
      class="region-country-counts"
    >
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        id="case-counts"
      ></g>
    </svg>

    <div class="btn-links">
      <!-- <router-link v-if="isOverflow" :to="{ name: '', params: {} }">view all countries</router-link>> -->

      <button
        class="btn-item click-affordance py-1"
        :style="{ background: lightColor }"
        @click="handleClick"
      >
        view cases over time
      </button>
      <button class="btn-item btn btn-main m-2" @click="closeWindow">
        <font-awesome-icon :icon="['far', 'window-close']" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import * as d3 from "d3";
import { cloneDeep } from "lodash";

import store from "@/store";

import { getCountryData } from "@/api/region-summary.js";

// --- font awesome --
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faWindowClose } from "@fortawesome/free-regular-svg-icons";

library.add(faWindowClose);

const width = 250;
const sparkWidth = 75;
const newCasesWidth = 45;
const innerPadding = 0.25;
const margin = {
  top: 20,
  right: 100,
  bottom: 10,
  left: 60,
  gap: 10
};
const transitionDuration = 3500;

export default Vue.extend({
  name: "CountryBarGraph",
  components: {
    FontAwesomeIcon
  },
  props: {
    region: String,
    variable: String,
    id: Number
  },
  data() {
    return {
      width,
      sparkWidth,
      newCasesWidth,
      margin,
      innerPadding,
      transitionDuration,
      height: 0,
      data: null,
      barHeight: 15,
      isOverflow: false,

      // axes
      x: d3.scaleLinear().range([width, 0]),
      y: d3.scaleBand().paddingInner(innerPadding),
      xSpark: d3.scaleTime().range([0, sparkWidth]),
      xAxis: null,
      yAxis: null,
      // refs
      svg: null,
      chart: null,
      // methods
      line: null
    };
  },
  computed: {
    lightColor: function() {
      const scale = store.getters["colors/getRegionColor"];
      return scale(this.region, 0.85);
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
    },
    variable: function() {
      this.updateData();
    }
  },
  created() {
    this.dataSubscription = getCountryData(
      this.$apiurl,
      this.region,
      this.variable
    ).subscribe(data => {
      this.data = data;
    });
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
    if (this.changeDataSubscription) {
      this.changeDataSubscription.unsubscribe();
    }
  },
  mounted() {
    this.setupPlot();
    this.$nextTick(function() {
      window.addEventListener("click", this.clickClose), { passive: true };

      document.addEventListener(
        "keyup",
        evt => {
          if (evt.keyCode === 27) {
            this.closeWindow();
          }
        },
        { passive: true }
      );
    });
  },
  destroyed() {
    window.removeEventListener("click", this.clickClose);
    document.removeEventListener("keyup", this.closeWindow);
  },
  methods: {
    colorScale: function(idx) {
      const scale = store.getters["colors/getRegionColorPalette"];
      return scale(this.region, this.data.length, idx);
    },
    handleClick: function() {
      this.$emit("regionSelected", {
        region: "all"
      });

      this.$router.push({
        path: "epidemiology",
        query: {
          location: this.data.map(d => d.location_id).join(";")
        }
      });
    },
    routeToLoc: function(location_name) {
      const location = this.data.filter(d => d.name === location_name);
      const location_id = location ? location[0].location_id : null;

      if (location_id) {
        this.$emit("regionSelected", {
          region: "all"
        });

        this.$router.push({
          path: "epidemiology",
          query: {
            location: location_id
          }
        });
      }
    },
    clickClose: function(evt) {
      const classID = evt.target.className.baseVal;
      if (
        !classID ||
        (classID !== "region-country-counts" &&
          classID !== "legend-name" &&
          !classID.includes("stacked-area-chart"))
      ) {
        this.closeWindow();
      }
    },
    closeWindow: function() {
      this.$emit("regionSelected", {
        region: this.region,
        display: false,
        displayMore: false
      });
    },
    updateData() {
      this.changeDataSubscription = getCountryData(
        this.$apiurl,
        this.region,
        this.variable
      ).subscribe(data => {
        this.data = data;
      });
    },
    updatePlot: function() {
      if (this.data) {
        this.getHeight();
        this.updateScales();
        this.prepData();
        this.drawPlot();
      }
    },
    getHeight: function() {
      const idealHeight =
        this.barHeight * this.data.length +
        (this.data.length - 2) * this.innerPadding;
      if (idealHeight > window.innerHeight * 0.8) {
        this.height = window.innerHeight * 0.8;
        const num2Plot = Math.floor(
          (this.height - 2 * this.innerPadding) /
            (this.barHeight + this.innerPadding)
        );
        this.data = this.data.slice(-num2Plot);
        this.isOverflow = true;
      } else {
        this.height = idealHeight;
      }
    },
    setupPlot: function() {
      this.svg = d3
        .select(`#region-graphs-${this.id}`)
        .select("svg.region-country-counts");
      this.chart = this.svg.select("#case-counts");

      this.svg
        .append("g")
        .attr("class", "bar-axis axis--y")
        .attr(
          "transform",
          `translate(${this.margin.left +
            this.width +
            this.margin.right -
            10}, ${this.margin.top})`
        );

      this.line = d3
        .area()
        .x(d => this.xSpark(d.date))
        .y0(d => d.y0)
        .y1(d => d.y);
    },
    prepData: function() {
      this.data.forEach(d => {
        const y = d3
          .scaleLinear()
          .range([this.y.bandwidth() * 0.8, 0])
          .domain([0, d3.max(d.data.map(d => d[this.variable]))]);

        d.data.forEach(datum => {
          datum["y"] = y(datum[this.variable]);
          datum["y0"] = y(0);
        });
      });
    },
    updateScales: function() {
      this.x = this.x.domain([0, d3.max(this.data, d => d[this.variable])]);

      this.y = this.y
        .range([this.height, 0])
        .domain(this.data.map(d => d.name));

      this.xSpark = this.xSpark.domain(
        d3.extent(this.data.flatMap(d => d.data).map(d => d.date))
      );

      this.yAxis = d3.axisRight(this.y);

      this.svg.select(".axis--y").call(this.yAxis);
      this.svg
        .select(".axis--y")
        .selectAll("text")
        .on("click", d => this.routeToLoc(d));
    },
    drawPlot: function() {
      const t1 = d3.transition().duration(1000);

      // --- group ---
      const grpSelector = this.chart
        .selectAll(".country-count-group")
        .data(this.data);

      // exit
      grpSelector.exit().remove();

      // enter
      const grpEnter = grpSelector
        .enter()
        .append("g")
        .attr("class", "country-count-group");

      // merge
      grpSelector
        .merge(grpEnter)
        .attr("id", d => `${d.name}`)
        // .attr("class", d => `${this.region}`)
        .style("fill", (d, i) => this.colorScale(i))
        .style("stroke", (d, i) => this.colorScale(i));

      // --- bars ---
      const barSelector = grpSelector.select(".country-count");
      barSelector.exit().remove();

      const barEnter = grpEnter.append("rect").attr("class", "country-count");

      // merge
      barSelector
        .merge(barEnter)
        // .attr("width", 0)
        .attr("height", this.y.bandwidth())
        .attr("y", d => this.y(d.name))
        .style("fill", (d, i) => this.colorScale(i))
        // .attr("x", d => this.x(0))
        // .transition(t1)
        .attr("width", d => this.x(0) - this.x(d[this.variable]))
        .attr("x", d => this.x(d[this.variable]));

      // --- text ---
      const textSelector = grpSelector.select(".annotation--country-count");

      textSelector.exit().remove();

      const textEnter = grpEnter
        .append("text")
        .attr("class", "annotation--country-count");

      // merge
      textSelector
        .merge(textEnter)
        .attr("x", d => this.x(d[this.variable]))
        .attr("dx", "-0.5em")
        .attr("y", d => this.y(d.name) + this.y.bandwidth() / 2)
        .style("font-size", this.y.bandwidth())
        .text(d => d[this.variable].toLocaleString());

      // --- sparklines ---
      this.chart
        .append("text")
        .attr("class", "subtitle")
        .attr(
          "x",
          this.width + this.margin.gap + this.margin.right + this.sparkWidth / 2
        )
        .attr("y", -5)
        .text("over time");

      const sparkSelector = grpSelector.select(".sparkline");

      const sparkEnter = grpEnter
        .append("path")
        .attr(
          "transform",
          d =>
            `translate(${this.width +
              this.margin.gap +
              this.margin.right}, ${this.y(d.name)})`
        )
        .attr("class", "sparkline");

      // merge
      sparkSelector
        .merge(sparkEnter)
        .datum(d => d.data)
        .join("path")
        .attr("d", this.line);

      // --- number of new cases ---
      this.chart
        .append("text")
        .attr("class", "subtitle")
        .attr(
          "x",
          this.width +
            this.margin.gap * 3 +
            this.margin.right +
            this.sparkWidth +
            this.newCasesWidth / 2
        )
        .attr("y", -5)
        .text("new today");

      const newCasesSelector = grpSelector.select(".new-cases");

      newCasesSelector.exit().remove();

      const newCasesEnter = grpEnter
        .append("text")
        .attr(
          "transform",
          d =>
            `translate(${this.width +
              this.margin.gap * 3 +
              this.margin.right +
              this.sparkWidth}, ${0})`
        )
        .attr("x", 5)
        .attr("y", d => this.y(d.name) + this.y.bandwidth() / 2)
        .attr("class", "new-cases")
        .style("font-size", this.y.bandwidth());

      // merge
      newCasesSelector
        .merge(newCasesEnter)
        .text(d => d[`${this.variable}_numIncrease`].toLocaleString());
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.country-bar-graph .axis--y path,
.country-bar-graph .tick line {
  display: none;
}

.country-bar-graph .axis--y text {
  text-anchor: end;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.region-name {
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.bar-axis {
  font-size: 14px;
}

.annotation--country-count,
.new-cases {
  dominant-baseline: central;
  stroke: none;
  font-weight: 700 !important;
}

.annotation--country-count {
  text-anchor: end;
}

.sparkline {
  // stroke-width: 0.1;
  stroke: none;
  stroke-linecap: round;
}

.subtitle {
  text-anchor: middle;
  font-size: 0.7em;
  opacity: 0.7;
  dominant-baseline: ideographic;
}

rect.country-count {
  shape-rendering: crispedges;
}

.btn-item:first-child {
  margin-right: auto;
  margin-left: auto;
}
.btn-item:last-child {
  margin-left: auto;
}

.btn-links {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.btn-item {
  display: flex;
  margin: 1px;
  padding: 5px;
}
</style>
