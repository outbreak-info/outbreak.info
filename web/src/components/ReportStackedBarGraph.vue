<template>
<div>
  <svg :width="width" :height="height" class="report-stacked-bar" ref="stacked_bar" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>
  </svg>
  <!-- Histogram of sequencing counts -->
  <SequencingHistogram :data="seqCounts" :width="width" :svgTitle="title" :margin="marginHist" :mutationName="null" className="stacked-seq-histogram" :onlyTotals="true" notDetectedColor="#bab0ab" v-if="seqCounts"
    :title="`Sequences over last ${recentWindow} days`" />

  <DownloadReportData :data="data" figureRef="report-stacked-bar" dataType="Mutation Report Prevalence over Time" />


  <!-- TOOLTIPS -->
  <div ref="tooltip_stacked_bar" class="tooltip-basic box-shadow px-2" id="tooltip-by-lineage">
    <h5 id="lineage" clas="m-0 p-0"></h5>
    <p id="date" class="text-muted p-0 m-0">
    </p>
    <p id="proportion" class="font-size-2 p-0 m-0">
    </p>
  </div>
</div>
</template>


<script lang="js">
import Vue from "vue";

import uniq from "lodash/uniq";

import {
  select,
  selectAll,
  timeDay,
  scaleTime,
  scaleLinear,
  axisLeft,
  axisBottom,
  nest,
  area,
  stack,
  stackOrderAscending,
  stackOrderInsideOut,
  // stackOrderDescending,
  forceCollide,
  forceY,
  forceSimulation,
  event,
  extent,
  format,
  timeFormat,
  scaleOrdinal,
  max
} from "d3";

import SequencingHistogram from "@/components/SequencingHistogram.vue";
import DownloadReportData from "@/components/DownloadReportData.vue";

export default Vue.extend({
  name: "LineagesByLocation",
  components: {
    SequencingHistogram,
    DownloadReportData
  },
  props: {
    data: Array,
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 500
    },
    seqCounts: Array,
    locationID: String,
    locationName: String,
    colorScale: Function,
    recentWindow: String,
    rectWidth: {
      type: Number,
      default: 15
    }
  },
  computed: {
    title() {
      return (this.locationName ? `Lineage prevalence over time in ${this.locationName}` : "Lineage prevalence over time")
    }
  },
  watch: {
    width: function() {
      this.updatePlot();
    },
    data: function() {
      this.updatePlot();
    }
  },
  data() {
    return ({
      // dimensions
      margin: {
        top: 18,
        bottom: 30,
        left: 55,
        right: 40
      },
      marginHist: {
        top: 5,
        bottom: 10,
        left: 55,
        right: 55
      },
      bandWidth: null,
      paddingInner: 0.25,
      legendHeight: null,
      // variables
      fillVar: "key",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      area: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null,
      legend: null
    })
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);
    })

    // set initial dimensions for the plots.
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
  },
  methods: {
    setDims() {},
    setupPlot() {
      this.chart = select(this.$refs.chart);
    },
    updateScales() {
      console.log(this.data)
      console.log(this.data)

      const xDomain = extent(this.data, d => d.date_time);
      this.x = scaleTime()
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(xDomain);

      // range in weeks
      const xRange = timeDay.count(xDomain[0], xDomain[1]) / 7;

      this.bandWidth = ((this.width - this.margin.left - this.margin.right) / xRange) * (1 - this.paddingInner);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, 1]);

      this.lineages = Object.keys(this.data[0]).filter(d => d != "date_time");

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      // stacking
      this.series = stack()
        .keys(this.lineages)
        // .order(stackOrderDescending)
        .order(stackOrderAscending)
        (this.data)

      console.log(this.series)

      if (this.data.length > 1) {
        this.xAxis = axisBottom(this.x).tickSizeOuter(0)
          .ticks(this.numXTicks)

        select(this.$refs.xAxis).call(this.xAxis);
      }
      select(this.$refs.yAxis).call(this.yAxis);
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot();
      }
    },
    drawPlot() {
      const barSelector = this.chart
        .selectAll(".stacked-bar-chart")
        .data(this.series);

      // // calculate label positions so they don't overlap
      // const labelHeight = 18;
      // this.series.forEach(d => {
      //   d["fx"] = 0;
      //   d["targetY"] = this.y(d[0][0]) + (this.y(d[0][1]) - this.y(d[0][0])) / 2;
      // })
      //
      // // Define a custom force
      // const forceClamp = (min, max) => {
      //   let nodes;
      //   const force = () => {
      //     nodes.forEach(n => {
      //       if (n.y > max) n.y = max;
      //       if (n.y < min) n.y = min;
      //     });
      //   };
      //   force.initialize = _ => (nodes = _);
      //   return force;
      // };
      //
      // // Set up the force simulation
      // const force = forceSimulation()
      //   .nodes(this.series)
      //   .force("collide", forceCollide(labelHeight / 2).strength(1))
      //   .force("y", forceY(d => d.targetY).strength(1))
      //   .force(
      //     "clamp",
      //     forceClamp(0, this.height - this.margin.top - this.margin.bottom)
      //   )
      //   .stop();
      //
      // // Execute the simulation
      // for (let i = 0; i < 300; i++) force.tick();


      barSelector.join(
        enter => {
          const barGrp = enter.append("g")
            .attr("class", "stacked-bar-chart")
            .attr("id", d => d.key.replace(/\./g, "-"))
            .style("fill", d => this.colorScale(d.key))

          barGrp
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("id", (d, i) => `rect${i}`)
            .attr("x", d => this.x(d.data.date_time) - this.bandWidth / 2)
            .attr("width", this.bandWidth)
            .attr("y", d => this.y(d[1]))
            .attr("height", d => this.y(d[0]) - this.y(d[1]))
          //
          // const tspan = barGrp.append("text")
          //   .attr("class", "lineage_name")
          //   .attr("x", this.rectWidth)
          //   .attr("dx", 10)
          //   .attr("y", d => d.y)
          //   .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
          //   .style("fill", d => this.colorScale(d.key))
          //   .style("dominant-baseline", "central")
          //
          // tspan.append("tspan")
          //   .attr("class", "lineage")
          //   .text(d => d.key)
          //   .style("font-weight", "700")
          //   .classed("pointer", d => d.key.toLowerCase() != "other")
          //   .classed("hover-underline", d => d.key.toLowerCase() != "other")
          //   .on("click", d => this.route2Lineage(d.key))
          //
          // tspan.append("tspan")
          //   .attr("class", "percent")
          //   .attr("dx", 5)
          //   .text(d => `(${format(".0%")(d[0].data[d.key])})`)
        },
        update => {
          update
            .attr("id", d => d.key.replace(/\./g, "-"))
            .style("fill", d => this.colorScale(d.key))

          update.select("rect")
            .attr("x", d => this.x(d.data.date_time))
            .attr("y", d => this.y(d[1]))
            .attr("height", d => this.y(d[0]) - this.y(d[1]))



          update.select("text")
            .attr("y", d => d.y)
            .style("fill", d => this.colorScale(d.key))


          update.select("text")
            .select(".lineage")
            .text(d => d.key)
            .classed("pointer", d => d.key.toLowerCase() != "other")
            .classed("hover-underline", d => d.key.toLowerCase() != "other")
            .on("click", d => this.route2Lineage(d.key))

          update.select("text")
            .select(".percent")
            .text(d => `(${format(".0%")(d[0].data[d.key])})`)
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      this.chart.selectAll("rect").on("mouseover", (d,i) => this.tooltipOn(d, i));

    },
    tooltipOn(d, i) {
      const key = "B.1.1.7";
      const ttip = select(this.$refs.tooltip_stacked_bar);
      const ttipShift = 20;

      this.chart.selectAll(".stacked-bar-chart")
      .style("opacity", 0.3);

      this.chart.select(`#${key.replace(/\./g, "-")}`)
      .style("opacity", 1);

      this.chart.select(`#${key.replace(/\./g, "-")}`)
      selectAll("rect")
      .style("opacity", 0.6);

console.log(i)
      this.chart.select(`#rect${i}`)
      .style("opacity", 1);

      // update text
      ttip.select("#lineage").text(key);
      ttip.select("#proportion").html(`<b>${d.data[key] < 0.005 ? "< 0.5%" : format(".1%")(d.data[key])}</b>`);
      ttip.select("#date").text(`week ending ${timeFormat("%e %b %Y")(d.data.date_time)}`);

      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");

    },
    tooltipOff() {
      this.chart.selectAll(".stacked-bar-chart")
      .style("opacity", 1);

      this.chart.selectAll("rect")
      .style("opacity", 1);
    },
    route2Lineage(pango) {
      if (pango.toLowerCase() != "other") {
        this.$router.push({
          name: "MutationReport",
          query: {
            loc: this.locationID,
            pango: pango,
            selected: this.locationID
          }
        })
      }
    },
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
    }
  }
})
</script>

<style lang="scss">
.hover-underline:hover {
    text-decoration: underline;
}

.report-stacked-bar {
    .axis--y text {
        font-size: 14pt;
    }
    .axis--x text {
        font-size: 16pt;
    }
    .axis--x path {
        display: none;
    }
}
</style>
