<template>
<div class="mutations-by-lineage d-flex flex-column text-left">
  <h6 class="m-0">{{title}}</h6>
  <div class="d-flex justify-content-between align-items-center" :style="{width: width + 'px'}">
    <small class="text-muted">{{subtitle}}</small>
    <button class="small btn btn-outline-secondary my-1 px-2 py-1" @click="expandOther" v-if="otherDataArr.length">{{ otherExpanded ? "hide" :"expand" }} other</button>
  </div>

  <svg :width="width" :height="height" class="mutations_by_lineage" :name="title">
    <g :transform="`translate(${margin.left}, ${margin.top})`" ref="horizontal_bargraph"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="horizontal-bargraph-y pointer axis--y" ref="yAxis"></g>
    <g :transform="`translate(${margin.left}, ${height - margin.bottom})`" class="horizontal-bargraph-x axis--x" ref="xAxis"></g>
  </svg>

  <div class="d-flex justify-content-between align-items-center" :style="{width: width + 'px'}">
    <button class="small btn btn-outline-secondary my-1 px-2 py-1 flex-shrink-0" @click="expandOther" v-if="otherDataArr.length">{{ otherExpanded ? "hide" :"expand" }} other</button>
    <DownloadReportData :data="data" figureRef="mutations_by_lineage" dataType="Mutation by Lineage" class="mt-3" />
  </div>

  <!-- TOOLTIPS -->
  <div ref="tooltip_by_lineage" class="tooltip-basic box-shadow px-2" id="tooltip-by-lineage">
    <h5 id="lineage"></h5>
    <p id="proportion" class="font-size-2 p-0 m-0">
    </p>
    <p id="counts" class="text-muted p-0 m-0">
    </p>

    <div id="other_data" class="d-flex flex-wrap flex-column justify-content-between">
      <div v-for="(other, oIdx) in otherDataArr" :key="oIdx" class="mb-1">
        <small class="w-100 d-flex justify-content-between">
          <span>
            <b class="text-underline">{{ other.pangolin_lineage}}</b>: <span class="text-muted text-right">({{other.mutation_count}} / {{other.lineage_count}})</span>
          </span>
          <b>{{other.proportion_formatted}}</b>
        </small>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import Vue from "vue";

import {
  select,
  selectAll,
  scaleLinear,
  scaleBand,
  max,
  axisLeft,
  axisBottom,
  format,
  min,
  event
} from "d3";
import cloneDeep from "lodash/cloneDeep";

import DownloadReportData from "@/components/DownloadReportData.vue";

// --- store / Vuex ---
import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "MutationsByLineage",
  components: {
    DownloadReportData
  },
  props: {
    data: Array,
    title: String,
    subtitle: String,
    lineage: String,
    mutationName: String,
    margin: {
      type: Object,
      default: function() {
        return {
          left: 80,
          right: 30,
          top: 10,
          bottom: 25
        };
      }
    },
    width: {
      type: Number,
      default: 450
    },
    fill: {
      type: String,
      default: "#f2b6e2"
    },
    n: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      numXTicks: 4,
      bandwidth: 25,
      height: null,

      // refs
      svg: null,
      // axes
      x: null,
      y: null,
      xAxis: null,
      yAxis: null,
      otherDataArr: [],
      otherExpanded: false
    }
  },
  watch: {
    data: function() {
      this.setupPlot();
      this.updatePlot();
    }
  },
  computed: {
    ...mapState("genomics", ["characteristicThreshold"])
  },
  methods: {
    handleLineageClick(lineage) {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          pango: lineage,
          selected: queryParams.selected,
          loc: queryParams.loc
        }
      })
    },
    expandOther() {
      if (this.otherExpanded) {
        this.preprocessData();
        this.updatePlot();
      } else {
        this.processedData = cloneDeep(this.data).sort((a, b) => {
          return b.proportion - a.proportion;
        })
        this.updatePlot();
      }
      this.otherExpanded = !this.otherExpanded;
    },
    preprocessData() {
      var sortedData = cloneDeep(this.data).sort((a, b) => {
        return b.proportion - a.proportion;
      })

      this.processedData = sortedData.filter(d => d.proportion >= this.characteristicThreshold);
      if (this.processedData.length < sortedData.length) {
        this.otherDataArr = sortedData
          .filter(d => d.proportion < this.characteristicThreshold);

        const otherData = this.otherDataArr
          .reduce((x, y) => {
            return {
              "lineage_count": x.lineage_count + y.lineage_count,
              "mutation_count": x.mutation_count + y.mutation_count
            }
          });
        this.processedData.push({
          pangolin_lineage: "other",
          proportion: otherData.mutation_count / otherData.lineage_count,
          lineage_count: otherData.lineage_count,
          mutation_count: otherData.mutation_count
        })
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.horizontal_bargraph);
      this.preprocessData();
    },
    updatePlot: function() {
      this.updateAxes();
      this.drawBars();
    },
    updateAxes() {
      const paddingInner = 0.25;
      this.height = this.processedData.length * this.bandwidth + (this.processedData.length -1) * this.bandwidth * paddingInner + this.margin.top + this.margin.bottom;

      this.x = scaleLinear()
        .range([0, this.width - this.margin.right - this.margin.left])
        .domain([0, min([max(this.processedData.map(d => d.proportion)) + 0.1, 1])]);

      this.y = scaleBand()
        .paddingInner(paddingInner)
        .range([0, this.height - this.margin.top - this.margin.bottom])
        .domain(this.processedData.map(d => d.pangolin_lineage));

      this.yAxis = axisLeft(this.y)
        .tickSizeOuter(0);

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickFormat(format(".0%"));

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.xAxis).call(this.xAxis);
    },
    tooltipOn(d) {
      const ttip = select(this.$refs.tooltip_by_lineage);
      const ttipShift = 20;

      // update text
      ttip.select("#lineage").text(d.pangolin_lineage);
      ttip.select("#proportion").html(`<b>${d.proportion_formatted}</b> ${this.mutationName}`);
      ttip.select("#counts").text(`(${format(",")(d.mutation_count)} / ${format(",")(d.lineage_count)})`);


      selectAll(".rect-by-lineage")
        .style("opacity", 0.3);

      selectAll(".lineage-annotation")
        .style("opacity", 0.3);

      selectAll(`#${d.pangolin_lineage.replace(/\./g, "_")}`)
        .style("opacity", 1);

      if (d.pangolin_lineage != "other") {
        ttip.select("#other_data").classed("hidden", true);
        ttip.select("#lineage").text(d.pangolin_lineage);
        ttip.select("#proportion").html(`<b>${d.proportion_formatted}</b> ${this.mutationName}`);
        ttip.select("#counts").text(`(${format(",")(d.mutation_count)} / ${format(",")(d.lineage_count)})`);
      } else {
        ttip.select("#other_data").classed("hidden", false);
        ttip.select("#proportion").html("");
        ttip.select("#counts").text("");
      }

      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipYAxisOn(value) {
      const d = this.processedData.filter(d => d.pangolin_lineage == value)
      const ttip = select(this.$refs.tooltip_by_lineage);
      const ttipShift = 20;

      // update text
      selectAll(".rect-by-lineage")
        .style("opacity", 0.3);

      selectAll(".lineage-annotation")
        .style("opacity", 0.3);

      ttip.select("#lineage").text(value);

      if (d.length === 1 && value != "other") {
        ttip.select("#other_data").classed("hidden", true);
        ttip.select("#proportion").html(`<b>${d[0].proportion_formatted}</b> ${this.mutationName}`);
        ttip.select("#counts").text(`(${format(",")(d[0].mutation_count)} / ${format(",")(d[0].lineage_count)})`);

        selectAll(`#${d[0].pangolin_lineage.replace(/\./g, "_")}`)
          .style("opacity", 1);
      } else {
        ttip.select("#other_data").classed("hidden", false);
        ttip.select("#proportion").html("");
        ttip.select("#counts").text("");
      }

      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipOff() {
      select(this.$refs.tooltip_by_lineage)
        .style("display", "none");

      selectAll(".rect-by-lineage")
        .style("opacity", 1);

      selectAll(".lineage-annotation")
        .style("opacity", 1);
    },
    drawBars() {
      const rectSelector =
        this.svg
        .selectAll(".rect-by-lineage")
        .data(this.processedData, d => d.pangolin_lineage);

      rectSelector.join(
        enter => {
          enter.append("rect")
            .attr("id", d => d.pangolin_lineage.replace(/\./g, "_"))
            .attr("class", "rect-by-lineage")
            .attr("x", d => this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
            .style("fill", d => d.pangolin_lineage == this.lineage ? "#df4ab7" : this.fill)
            .attr("width", d => this.x(d.proportion) - this.x(0))
        },
        update => {
          update.attr("x", d => this.x(0))
            .attr("id", d => d.pangolin_lineage.replace(/\./g, "_"))
            .transition().duration(250)
            .attr("width", d => this.x(d.proportion) - this.x(0))
            .attr("y", d => this.y(d.pangolin_lineage))
            .attr("height", d => this.y.bandwidth())
        },
        exit => {
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        }
      );

      const textSelector =
        this.svg
        .selectAll(".lineage-annotation")
        .data(this.processedData, d => d.pangolin_lineage);

      const textThresh = 25;

      textSelector.join(
        enter => {
          enter.append("text")
            .attr("class", d => "lineage-annotation")
            .attr("id", d => d.pangolin_lineage.replace(/\./g, "_"))
            .attr("x", d => this.x(d.proportion))
            .attr("dx", d => this.x(d.proportion) > textThresh ? -5 : 5)
            .attr("y", d => this.y(d.pangolin_lineage) + this.y.bandwidth() / 2)
            .text(d => d.proportion_formatted)
            .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
            .style("text-anchor", d => this.x(d.proportion) > textThresh ? "end" : "start")
            .style("dominant-baseline", "central")
            .style("font-size", "12px")
        },
        update => {
          update
            .attr("id", d => d.pangolin_lineage.replace(/\./g, "_"))
            .style("text-anchor", d => this.x(d.proportion) > textThresh ? "end" : "start")
            .text(d => d.proportion_formatted)
            .transition().duration(250)
            .attr("x", d => this.x(d.proportion))
            .attr("dx", d => this.x(d.proportion) > textThresh ? -5 : 5)
            .attr("y", d => this.y(d.pangolin_lineage) + this.y.bandwidth() / 2);

        },
        exit => {
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        }
      );

      // event listener for tooltips
      this.svg.selectAll(".rect-by-lineage")
        .on("mousemove", d => this.tooltipOn(d))
        .on("mouseleave", () => this.tooltipOff())

      // event listener for click event
      select(this.$refs.yAxis)
        .selectAll("text")
        .on("mousemove", d => this.tooltipYAxisOn(d))
        .on("mouseleave", () => this.tooltipOff())
        .on("click", d => this.handleLineageClick(d));
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
  }
})
</script>

<style lang="scss">
.horizontal-bargraph-x,
.horizontal-bargraph-y {
    font-size: 16px;
}
.small {
    font-size: small;
}
</style>
