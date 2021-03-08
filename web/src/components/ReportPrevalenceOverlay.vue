<template>
<div class="d-flex flex-column align-items-center w-100" id="location-report-prevalence">
  <div class="d-flex flex-column">
    <!-- SVGs -->
    <div class="d-flex flex-column align-items-start mt-2">
      <h5 class="">Daily COVID-19 cases in {{ locationName }}</h5>
      <div class="d-flex">
        <svg width="15" height="15" class="mr-2">
          <line x1="0" x2="15" y1="8" y2="8" class="trace-legend"></line>
        </svg>
        <small class="text-muted">7 day rolling average of confirmed cases</small>
      </div>
      <!-- EPI TRACE -->
      <svg :width="width" :height="height" class="epi-curve" ref="epi" name="title">
        <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xEpiAxis"></g>
        <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yEpiAxis"></g>
        <g ref="epiChart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
      </svg>

      <!-- TIME TRACE -->
      <h5 class="p-0 m-0">{{title}}</h5>
      <div class="d-flex">
        <svg width="15" height="15" class="mr-2">
          <line x1="0" x2="15" y1="8" y2="8" class="trace-legend"></line>
        </svg>
        <small class="text-muted">7 day rolling average of percent sequences with mutation(s)</small>
      </div>

      <!-- legend: confidence interval -->
      <div class="d-flex">
        <div class="ci-legend mr-2" :style="{background: '#999'}">

        </div>
        <small class="text-muted">95% confidence interval</small>
      </div>

      <svg :width="width" :height="height" class="prevalence-curve" ref="svg" :name="title">
        <defs>
          <marker id="arrow" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth" stroke="#929292" fill="none">
            <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
          </marker>
        </defs>

        <g :transform="`translate(${margin.left}, ${height - margin.bottom })`" class="prevalence-axis axis--x" ref="xAxis"></g>
        <g :transform="`translate(${margin.left}, ${margin.top})`" class="prevalence-axis axis--y" ref="yAxis"></g>
        <g ref="chart" :transform="`translate(${margin.left}, ${margin.top})`"></g>
        <!-- <g id="no-data" v-if="!data.length">
          <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">No sequences found</text>
        </g>
        <g id="no-data" v-if="data.length < lengthThreshold && data.length">
          <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">Two points may make a line, but it's not very informative.</text>
          <text font-size="24px" fill="#888888" transform="translate(0, 28)" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">{{location}} only has {{data.length}} {{data.length === 1 ? "date" : "dates"}} with
            sequencing data</text>
        </g> -->
        <g id="weird-last values" :hidden="data && data.length < lengthThreshold">
          <text :x="width - margin.left" :y="0" fill="#929292" font-size="14px" dominant-baseline="hanging" text-anchor="end" :style="`font-family: ${fontFamily};`">Latest dates are noisy due to fewer samples</text>
          <path stroke="#BBBBBB" fill="none" :d="`M ${width - margin.left - 75} 20 c 10 10, 20 20, 50 20`" marker-end="url(#arrow)"></path>
        </g>
      </svg>

      <!-- SEQUENCING HISTOGRAM -->
      <svg :width="width" :height="heightCounts" class="prevalence-curve prevalence-curve-counts" ref="svg-counts" :name="title">
        <!-- <svg :width="width" :height="heightCounts" class="prevalence-curve prevalence-curve-counts" ref="svg-counts" :subtitle="countTitle"> -->
        <g ref="counts" :transform="`translate(${margin.left}, ${margin.top})`"></g>
        <g :transform="`translate(${margin.left - xBandwidth/2 - 5}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisLeft" :hidden="!data.length"></g>
        <g :transform="`translate(${width - margin.right + xBandwidth/2 + 5}, ${margin.top})`" class="prevalence-axis total-axis axis--y" ref="yCountsAxisRight" :hidden="!data.length"></g>
      </svg>
      <!-- <div class="d-flex">
        <small class="text-uppercase lt-purple" :style="{'margin-left' : this.margin.left + 'px'}">Total samples sequenced per day</small>
        <small class="text-uppercase purple ml-3"><span v-if="showDetected">* </span>{{mutationName}} detected</small>
      </div> -->

    </div>
  </div>

  <!-- TOOLTIPS -->
  <div ref="tooltip_prevalence" class="tooltip-basic box-shadow" id="tooltip-prevalence">
    <h5 id="date"></h5>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>

    <div id="sequencing-count"></div>
    <div id="sequencing-count-rolling"></div>
  </div>

  <DownloadReportData :data="data" figureRef="prevalence-curve" :isVertical="true" dataType="Mutation Report Prevalence over Time" />

</div>
</template>


<script lang="js">
import Vue from "vue";
import {
  select,
  selectAll,
  scaleLinear,
  scaleTime,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  map,
  forceCollide,
  forceY,
  forceSimulation,
  event,
  max,
  format,
  line,
  area,
  transition,
  timeDay
} from "d3";

import DownloadReportData from "@/components/DownloadReportData.vue";

export default Vue.extend({
  name: "ReportPrevalence",
  props: {
    data: Array,
    epi: Array,
    locationName: String,
    location: String
  },
  components: {
    DownloadReportData
  },
  computed: {
    title() {
      return (this.locationName == "Worldwide" ? `Mutation prevalence over time worldwide` : `Mutation prevalence over time in ${this.locationName}`)
    },
    countTitle() {
      return (`Total samples sequenced by collection date in ${this.location}`)
    }
  },
  data() {
    return {
      width: 400,
      height: 400,
      margin: {
        top: 10,
        bottom: 40,
        left: 85,
        right: 70
      },
      heightCounts: 80,
      lengthThreshold: 1,
      showDetected: null,
      detectedDisplayThresh: 50,
      CIColor: "#df4ab7",
      fontFamily: "'DM Sans', Avenir, Helvetica, Arial, sans-serif;",
      // variables
      xVariable: "dateTime",
      fillVariable: "label",
      xEpiVariable: "date",
      yVariable: "proportion",
      yEpiVariable: "confirmed_rolling",
      totalVariable: "total_count",
      // axes
      x: scaleTime(),
      y: scaleLinear(),
      yEpi: scaleLinear(),
      yCounts: scaleLinear(),
      colorScale: scaleOrdinal(["#4E79A7", // dk blue
        "#f28e2b", // orange
        "#59a14f", // green
        "#e15759", // red
        "#499894", // teal
        "#F1CE63", // yellow
        "#D37295", // dk pink
        "#B07AA1", // dk purple
        "#9D7660", // brown
        "#bcbd22", // puce,
        "#79706E",
        "#aecBe8", // lt blue
        "#FFBE7D", // lt. orange
        "#8CD17D", // lt. green
        "#FF9D9A", // lt. red
        "#86BCB6", // lt. teal
        "#B6992D", // dk yellow
        "#FABFD2", // lt. pink,
        "#D4A6C8", // lt. purple
        "#D7B5A6" // lt. brown
      ]),
      maxCounts: null,
      xBandwidth: 1,
      xAxis: null,
      yAxis: null,
      yEpiAxis: null,
      yCountsAxisLeft: null,
      yCountsAxisRight: null,
      numXTicks: 5,
      numYTicks: 6,
      // methods
      line: null,
      epiLine: null,
      area: null,
      // refs
      chart: null,
      epiChart: null,
      counts: null
    }
  },
  watch: {
    width: function() {
      this.updatePlot();
    },
    data: function() {
      this.updatePlot();
    },
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
    setDims() {
      const mx = 0.7;
      const my = 0.4;
      const hwRatio = 0.525;
      const svgContainer = document.getElementById('report-prevalence');

      let maxWidth = svgContainer ? svgContainer.offsetWidth : 800;
      maxWidth = maxWidth < 500 ? maxWidth * 0.98 : maxWidth * mx;
      const maxHeight = window.innerHeight * my;

      const idealHeight = hwRatio * maxWidth;
      if (idealHeight <= maxHeight) {
        this.height = idealHeight;
        this.width = maxWidth;
      } else {
        this.height = maxHeight;
        this.width = this.height / this.hwRatio;
      }

      if (this.width < 600) {
        this.numXTicks = 6;
        this.numYTicks = 4;
      } else {
        this.numXTicks = 6;
        this.numYTicks = 5;
      }
    },
    setupPlot() {
      this.svg = select(this.$refs.svg);
      this.chart = select(this.$refs.chart);
      this.counts = select(this.$refs.counts);
      this.epiChart = select(this.$refs.epiChart);

      // estimate
      this.line = line()
        .x(d => this.x(d[this.xVariable]))
        .y(d => this.y(d[this.yVariable]));

      // epi trace
      this.epiLine = line()
        .x(d => this.x(d["date"]))
        .y(d => this.yEpi(d[this.yEpiVariable]));

      // confidence interval area method
      this.area = area()
        .x(d => this.x(d[this.xVariable]))
        .y0(d => this.y(d.proportion_ci_lower))
        .y1(d => this.y(d.proportion_ci_upper));
    },
    updateScales() {
      console.log(this.data)
      const epiExtent = extent(this.epi.map(d => d[this.xEpiVariable]));
      const mutExtent = extent(this.data.flatMap(d => d.data).map(d => d[this.xVariable]));
      const xDomain = extent(epiExtent.concat(mutExtent));
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(xDomain);

      const avgMax = max(this.data.flatMap(d => d.data), d => d[this.yVariable]);
      const CIMax = max(this.data.flatMap(d => d.data), d => d.proportion_ci_upper);

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .nice()
        .domain([0, (avgMax + CIMax) * 0.5]);

      this.yEpi = scaleLinear()
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, max(this.epi, d => d[this.yEpiVariable])])
        .nice();

      this.maxCounts = max(this.data, d => d[this.totalVariable]);
      this.yCounts = scaleLinear()
        .range([0, this.heightCounts - this.margin.top - this.margin.top])
        .domain([0, this.maxCounts]);

      const numDays = timeDay.count(...this.x.domain());
      this.xBandwidth = (0.65) * (this.width - this.margin.left - this.margin.right) / numDays;

      this.xAxis = axisBottom(this.x)
        .ticks(this.numXTicks)
        .tickSize(-this.height)
        .tickSizeOuter(0);

      select(this.$refs.xAxis).call(this.xAxis);
      select(this.$refs.xEpiAxis).call(this.xAxis);

      this.yAxis = axisLeft(this.y).tickSizeOuter(0)
        .ticks(this.numYTicks)
        .tickFormat(format(".0%"));

      this.yEpiAxis = axisLeft(this.yEpi).tickSizeOuter(0)
        .ticks(this.numYTicks);

      this.yCountsAxisLeft = axisLeft(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      this.yCountsAxisRight = axisRight(this.yCounts).tickSizeOuter(0)
        .tickValues([0, this.maxCounts]);

      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.yEpiAxis).call(this.yEpiAxis);
      select(this.$refs.yCountsAxisLeft).call(this.yCountsAxisLeft);
      select(this.$refs.yCountsAxisRight).call(this.yCountsAxisRight);

      this.colorScale = this.colorScale.domain(map(this.data, d => d[this.fillVariable]));
    },
    tooltipOn() {
      // const ttipShift = 20;
      //
      // // find closest date
      // const selectedX = this.x.invert(event.offsetX - this.margin.left);
      // const selectedDate = timeDay.round(selectedX);
      // const selected = this.data.filter(d => Math.abs(d.dateTime - selectedDate) < 1e-12);
      //
      // if (selected.length) {
      //   // tooltip on
      //   const ttip = select(this.$refs.tooltip_prevalence);
      //
      //   // edit text
      //   ttip.select("h5").text(selected[0].date)
      //
      //   ttip.select("#proportion").text(format(".0%")(selected[0].proportion))
      //   ttip.select("#confidence-interval").text(`(95% CI: ${format(".0%")(selected[0].proportion_ci_lower)}-${format(".0%")(selected[0].proportion_ci_upper)})`)
      //   ttip.select("#sequencing-count").text(`Number of cases: ${format(",")(selected[0].lineage_count)}/${format(",")(selected[0].total_count)}`)
      //   ttip.select("#sequencing-count-rolling").text(`Rolling average: ${format(",.1f")(selected[0].lineage_count_rolling)}/${format(",.1f")(selected[0].total_count_rolling)}`)
      //
      //   // fix location
      //   ttip
      //     .style("left", `${event.clientX + ttipShift}px`)
      //     .style("top", `${event.clientY + ttipShift}px`)
      //     .style("display", "block");
      //
      //   // histogram off/on
      //   selectAll(".raw-counts")
      //     .style("opacity", 0.3);
      //
      //   selectAll(`#date${selected[0].date}`)
      //     .style("opacity", 1);
      // }
    },
    tooltipOff() {
      select(this.$refs.tooltip_prevalence)
        .style("display", "none");

      selectAll(".raw-counts")
        .style("opacity", 1);
    },
    updatePlot() {
      const t1 = transition().duration(2500);

      if (this.data && this.epi) {
        this.updateScales();

        // let detected = this.data.filter(d => d.lineage_count);
        // this.showDetected = detected.length < this.detectedDisplayThresh;
        // if (!this.showDetected) {
        //   detected = [];
        // }
        // const detectedSelector = this.counts
        //   .selectAll(".detected")
        //   .data(detected);
        //
        // detectedSelector.join(
        //   enter => {
        //     enter.append("text")
        //       .attr("class", "detected")
        //       .attr("id", d => `date${d.date}`)
        //       .attr("x", d => this.x(d[this.xVariable]))
        //       .attr("y", d => this.yCounts(d[this.totalVariable]))
        //       .attr("dy", 3)
        //       .style("dominant-baseline", "hanging")
        //       .style("text-anchor", "middle")
        //       .text("*")
        //       .style("fill", "#980072");
        //   },
        //   update =>
        //   update
        //   .attr("class", "detected")
        //   .attr("id", d => `date${d.date}`)
        //   .attr("x", d => this.x(d[this.xVariable]))
        //   .attr("y", d => this.yCounts(d[this.totalVariable])),
        //   exit =>
        //   exit.call(exit =>
        //     exit
        //     .transition(10)
        //     .style("opacity", 1e-5)
        //     .remove()
        //   )
        // )
        //
        // const countSelector = this.counts
        //   .selectAll(".raw-counts")
        //   .data(this.data);
        // countSelector.join(
        //   enter => {
        //     enter.append("line")
        //       .attr("class", "raw-counts")
        //       .attr("id", d => `date${d.date}`)
        //       .attr("x1", d => this.x(d[this.xVariable]))
        //       .attr("x2", d => this.x(d[this.xVariable]))
        //       .attr("y1", d => this.yCounts(0))
        //       .attr("y2", d => this.yCounts(d[this.totalVariable]))
        //       .style("stroke-width", this.xBandwidth)
        //       .style("stroke", d => d.lineage_count ? "#980072" : "#af88a5");
        //   },
        //   update =>
        //   update
        //   .attr("id", d => `date${d.date}`)
        //   .attr("x1", d => this.x(d[this.xVariable]))
        //   .attr("x2", d => this.x(d[this.xVariable]))
        //   .attr("y1", d => this.yCounts(0))
        //   .attr("y2", d => this.yCounts(d[this.totalVariable]))
        //   .style("stroke", d => d.lineage_count ? "#980072" : "#af88a5")
        //   .style("stroke-width", this.xBandwidth),
        //   exit =>
        //   exit.call(exit =>
        //     exit
        //     .transition(10)
        //     .style("opacity", 1e-5)
        //     .remove()
        //   )
        // )

        // EPI DATA
        const epiSelector = this.epiChart
          .selectAll(".epi-curve")
          .data([this.epi]);

        epiSelector.join(enter => {
            enter.append("path")
              .attr("class", "epi-curve")
              .attr("d", this.epiLine)
              .style("fill", "none")
              .style("stroke", "#333333")
              .style("stroke-width", 1.75);
          },
          update => {
            update
              .transition()
              .duration(750)
              .attr("d", this.epiLine)
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

        // MUTATION TRACES
        // calculate the end point labels
        // Create nodes of the text labels for force direction
        const labelHeight = 18;
        const endLabels = this.data.map(d => {
          return ({
            label: d[this.fillVariable],
            fx: 0,
            targetY: this.y(d.data.slice(-1)[0][this.yVariable])
          })
        })

        // Define a custom force
        const forceClamp = (min, max) => {
          let nodes;
          const force = () => {
            nodes.forEach(n => {
              if (n.y > max) n.y = max;
              if (n.y < min) n.y = min;
            });
          };
          force.initialize = _ => (nodes = _);
          return force;
        };

        // Set up the force simulation
        const force = forceSimulation()
          .nodes(endLabels)
          .force("collide", forceCollide(labelHeight/2).strength(1))
          .force("y", forceY(d => d.targetY).strength(1))
          .force(
            "clamp",
            forceClamp(0, this.height - this.margin.top - this.margin.bottom)
          )
          .stop();

        // Execute the simulation
        for (let i = 0; i < 300; i++) force.tick();
        console.log(endLabels)

        const labelSelector = this.chart.selectAll(".mutation-label")
          .data(endLabels);

        labelSelector.join(
          enter => {
            enter
              .append("text")
              .attr("class", "mutation-label")
              .attr("x", this.width - this.margin.left - this.margin.right)
              .attr("dx", 5)
              .attr("y", d => d.y)
              .style("fill", d => this.colorScale(d.label))
              .text(d => d.label);
          },
          update => {
            update
              .attr("x", this.width - this.margin.left - this.margin.right)
              .attr("y", d => d.y)
              .style("fill", d => this.colorScale(d.label))
              .text(d => d.label)
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )


        const mutSelector = this.chart
          .selectAll(".mutation-trace")
          .data(this.data);


        mutSelector.join(
          enter => {
            const mutGrp = enter.append("g")
              .attr("class", "mutation-trace")
              .attr("id", d => d[this.fillVariable.replace(/\./g, "_")]);

            mutGrp.append("path")
              .attr("class", "confidence-interval")
              .style("fill", d => this.colorScale(d[this.fillVariable]))
              .style("fill-opacity", 0.3)
              .attr("d", d => this.area(d.data));

            mutGrp.append("path")
              .attr("class", "prevalence-line")
              .style("stroke", d => this.colorScale(d[this.fillVariable]))
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .attr("d", d => this.line(d.data))
          },
          update => {
            update
              .attr("id", d => d[this.fillVariable.replace(/\./g, "_")]);

            update.select(".confidence-interval")
              .style("fill", d => this.colorScale(d[this.fillVariable]))
              .style("fill-opacity", 0.3)
              .attr("d", d => this.area(d.data));

            update.select(".prevalence-line")
              .style("stroke", d => this.colorScale(d[this.fillVariable]))
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .attr("d", d => this.line(d.data))
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          )
        )

        // event listener for tooltips
        this.chart.selectAll(".confidence-interval")
          .on("mousemove", () => this.tooltipOn())
          .on("mouseleave", () => this.tooltipOff())
        this.counts.selectAll(".raw-counts")
          .on("mousemove", () => this.tooltipOn())
          .on("mouseleave", () => this.tooltipOff())
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
#location-report-prevalence {
    & .count-axis,
    & .prevalence-axis {
        font-size: 16px;
        text {
            fill: $grey-90;
        }
    }

    & .axis--x line {
        stroke: #555;
        stroke-width: 0.25;
    }
}

.ci-legend {
    width: 15px;
    height: 15px;
    opacity: 0.3;
}

.trace-legend {
    stroke: #777;
    stroke-width: 2.5;
}
</style>
