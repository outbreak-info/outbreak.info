<template>
<div class="bargraph-group d-flex flex-column bargraph-group-margin" :id="`bargraph-${id}-${variable}`" :style="{transform:`scale(${transformChart})`}">
  <h4 v-if="title">{{ title }}</h4>
  <div class="position-relative"  >
     <div :style="{transform:`translate(${margin.left}px,${margin.top}px)`}"  id='barchart-wrapper' ref='barchart_wrapper'>
<div class="tooltip  p-2">
    <h6 class="country-name m-0"></h6>
    <p class="date m-0"></p>
    <p class="count m-0"></p>
    <b class="count-avg m-0"></b>
  </div>
     </div>
    <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" class="epi-bargraph" :name="plotTitle" :subtitle="title" ref="svg">
      <defs>
        <marker id="arrow-start" markerWidth="13" markerHeight="10" refX="0" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M7,0 L0,5 L7,10" class="swoopy-arrowhead" />
        </marker>
        <marker id="arrow" markerWidth="13" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>

      <g :transform="`translate(${margin.left}, ${height + margin.top + 2})`" class="epi-axis axis--x axis-font" ref="xAxis" id="xAxis"></g>
      <g :transform="`translate(${margin.left - 5}, ${margin.top})`" class="epi-axis axis--y axis-font" ref="yAxis" id="yAxis"></g>
      <g :transform="`translate(${margin.left},${margin.top})`" id="case-counts" class="bargraph" ref="case_counts"></g>
      <g :transform="`translate(${margin.left},${margin.top})`" id="rolling-average" class="bargraph" ref="rolling_average"></g>
      <g class="annotations" :class="{hidden: noRollingAvg}">
        <line :style="{'stroke': this.colorAverage, 'stroke-width': 2.5}" :x1="margin.left + 5" :x2="margin.left + 20" :y1="margin.top+6" :y2="margin.top+6"></line>
        <text class="annotation--rolling-average" :x="margin.left + 25" :y="margin.top" :style="{'fill': this.colorAverage, 'dominant-baseline': 'hanging', 'font-family': 'DM Sans, Avenir, Helvetica, Arial, sans-serif'}">7 day
          rolling average</text>
      </g>
    </svg>
    <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom" style="left:0; bottom:0" class="epi-bargraph-arrows position-absolute" ref="svg_arrows">
      <g class="switch-button-group" transform="translate(5,0)" ref="switch_btn" v-if="includeAxis && loggable">
        <rect class="switch-button-rect"></rect>
        <path class="swoopy-arrow" id="switch-btn-swoopy-arrow" marker-end="url(#arrow)"></path>
        <text class="switch-button" x="5"></text>
      </g>
    </svg>
  </div>

  
</div>
</template>

<script lang="ts">
import Vue from "vue";

import { scaleBand, scaleLinear, scaleLog, axisBottom, axisLeft, line, extent, timeDay, max, select, selectAll, format, timeFormat, timeParse, transition, easeLinear, event } from "d3";
import cloneDeep from "lodash/cloneDeep";
import * as PIXI from 'pixi.js'
import { SmoothGraphics } from "@pixi/graphics-smooth";

export default Vue.extend({
  name: "Bargraph",
  props: {
    data: Array,
    width: Number,
    height: Number,
    transformChart: Number,
    // variable: String,
    variableObj: Object,
    id: String,
    color: String,
    colorAverage: {
      type: String,
      default: "black"
    },
    title: String,
    log: Boolean,
    percapita: Boolean,
    location: String,
    includeAxis: {
      type: Boolean,
      default: false
    },
    loggable: {
      type: Boolean,
      default: true
    },
    includeTooltips: {
      type: Boolean,
      default: false
    },
    fixedYMax: {
      type: Number,
      default: null
    },
    xVariableLim: {
      type: Array,
      default: null
    },
    date1: {
      type: String
    },
    include2Week: {
      type: Boolean,
      default: false
    },
    animate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      margin: {
        top: 15,
        bottom: 60,
        left: 95,
        right: 25
      },
      // axes
      y: null,
      x: scaleBand().paddingInner(0),
      numYTicks: 6,
      isLogY: false,
      yMin: 0,
      // methods
      line: null,
      // refs
      chart: null,
      average: null,
      noRollinAvg: true,
      pixiApp: null
    };
  },
  computed: {
    plotTitle() {
      return (this.percapita ? `Number of COVID-19 ${this.variableObj.label} per 100,000 residents` : `Number of COVID-19 ${this.variableObj.label}`)
    }
  },
  watch: {
    data: function() {
      this.updatePlot();
      this.drawBarchart()
    },
    variableObj: {
      immediate: true,
      handler(newObj, oldObj) {
        this.variable = newObj.value;
        this.noRollingAvg = !['confirmed_numIncrease', 'dead_numIncrease', 'recovered_numIncrease'].includes(this.variable) || !this.animate;
        this.updatePlot();
       this.drawBarchart()
      }
    },
    // variable: function() {
    //   this.updatePlot()
    // },
    fixedYMax: function() {
      this.updatePlot();
      this.drawBarchart()
    },
    log: {
      immediate: true,
      handler(newVal, oldVal) {
        this.isLogY = newVal;
        this.updatePlot();
        this.drawBarchart()
      }
    },
    percapita: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.updatePlot();
          this.drawBarchart()
        }
      }
    },
    width: function() {
      this.updatePlot();
      this.drawBarchart()
    },
    height: function() {
      this.updatePlot();
      this.drawBarchart()
    }
  },
  methods: {
    setupPlot() {
      this.svg = select(`#bargraph-${this.id}-${this.variable}`)
        .select("svg.epi-bargraph");
         this.chart = this.svg.select("#case-counts");
      this.average = this.svg.select("#rolling-average");
      this.line = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d[this.variable.replace("_numIncrease", "_rolling")]));
    },
    setupBarChart(){
      this.wrapper = this.$refs.barchart_wrapper
      this.pixiApp = new PIXI.Application({
		  backgroundAlpha: 0,
			width: 650,
			height: this.height,
		});
    this.wrapper.appendChild(this.pixiApp.view)
      this.prepData();
      if (
        this.plottedData &&
        this.width &&
        this.height
      ) {
        this.updateScales();
        this.drawBarchart()
      }
    },
    prepData: function() {
      if (this.percapita) {
        this.variable = this.variable.includes("_per_100k") || this.variableObj.percapita === false ? this.variable : this.variable + "_per_100k";
      } else {
        this.variable = this.variable.replace("_per_100k", "");
      }

      if (this.data && this.includeAxis) {
        this.logData = cloneDeep(this.data).filter(d => d[this.variable] >= 1);
        this.logData.forEach(d => {
          d["confirmed_log"] = Math.log10(d.confirmed_numIncrease);
        });
        this.plottedData = this.isLogY ? this.logData : this.data.filter(d => d[this.variable] >= 0);
      } else {
        this.plottedData = this.data.filter(d => d[this.variable] >= 0);
      }
    },
    updatePlot() {
      this.prepData();

      if (
        this.plottedData &&
        this.width &&
        this.height
      ) {
        this.updateScales();
        this.drawPlot();
        this.drawBarchart()
      }
    },
    updateScales() {
      const range = this.xVariableLim ?
        this.xVariableLim :
        extent(this.plottedData, d => d.date);

      this.x = this.x
        .range([0, this.width])
        .domain(timeDay.range(range[0], timeDay.offset(range[1], 1)));

      const yMax = this.fixedYMax ?
        this.fixedYMax :
        max(this.plottedData, d => d[this.variable]);

      if (this.isLogY) {
        this.yMin = 0.5;

        this.y = scaleLog()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);
      } else {
        this.yMin = 0;

        this.y = scaleLinear()
          .range([this.height, 0])
          .domain([this.yMin, yMax]);
      }

      // --- update y-scale switch button --
      const dySwitch = 30;
      const xSwoop = 15;
      const ySwoop = -35;
      const swoopOffset = 5;

      this.switchBtn = select(this.$refs.switch_btn);

      this.switchBtn
        .select(".switch-button-rect")
        .attr("y", this.height + this.margin.top + dySwitch)
        .on("click", () => this.changeScale());

      this.switchBtn.select("path").attr(
        "d",
        `M ${xSwoop} ${this.height +
          this.margin.top +
          this.margin.bottom +
          ySwoop}
            C ${xSwoop} ${this.height +
          this.margin.top +
          this.margin.bottom +
          ySwoop -
          10},
            ${this.margin.left + ySwoop - 10} ${this.height +
          this.margin.top +
          5},
            ${this.margin.left + ySwoop + 5} ${this.height + this.margin.top}`
      );

      this.switchBtn
        .select("text")
        .text(`switch to ${this.isLogY ? "linear" : "log"} scale`)
        .attr("y", this.height + this.margin.top + dySwitch + 20);

      if (this.switchBtn.select("text").node()) {
        this.switchBtn
          .select("rect")
          .attr(
            "width",
            this.switchBtn
            .select("text")
            .node()
            .getBBox().width + 10
          )
          .attr(
            "height",
            this.switchBtn
            .select("text")
            .node()
            .getBBox().height + 5
          );
      }

      if (this.includeAxis) {
        // ~ 6 tick marks, rounded to the nearest week interval (6*7)
        const plotInterval = Math.round(this.x.domain().length/42)*7;
        this.xAxis = axisBottom(this.x)
          .tickSizeOuter(0)
          .tickValues(
            this.x.domain().filter(function(d, i) {
              return !(i % plotInterval);
            })
          )
          .tickFormat(timeFormat("%d %b"));

        select(this.$refs.xAxis).call(this.xAxis);

        this.yAxis = this.isLogY ?
        axisLeft(this.y)
          .tickSizeOuter(0)
          .ticks(this.numYTicks)
          .tickFormat((d, i) => {
            const log = Math.log10(d);
            return Math.abs(Math.round(log) - log) < 1e-6 && log >= 0 ?
              format(",")(d) :
              "";
          }) :
          axisLeft(this.y)
          .tickSizeOuter(0)
          .ticks(this.numYTicks);

        select(this.$refs.yAxis).call(this.yAxis);
      }
    },
    drawPlot() {
      if (this.chart) {
        const endDate = timeParse("%Y-%m-%d")(this.date1);
        // v-line to indicate dates
        if (this.date1) {
          const dateSelector = this.chart
            .selectAll(`.date-annotation_${this.variable}`)
            .data([endDate]);

          dateSelector.join(
            enter =>
            enter
            .append("line")
            .attr("class", d => `.date-annotation_${this.variable} annotation-date1`)
            .style("stroke", "#D13B62")
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", d => 0)
            .attr("y2", d => this.height),

            update =>
            update
            .attr("x1", d => this.x(d))
            .attr("x2", d => this.x(d))
            .attr("y1", d => 0)
            .attr("y2", d => this.height),

            exit =>
            exit.call(exit =>
              exit
              .transition()
              .duration(10)
              .style("opacity", 1e-5)
              .remove()
            )
          );

          if (this.include2Week && this.x(endDate)) {
            const dateSelector = this.chart
              .selectAll(`.date-annotation_${this.variable}`)
              .data([endDate]);
            
            dateSelector.join(
              enter =>
              enter
              .append("rect")
              .attr("class", d => `.date-annotation_${this.variable} annotation-date1`)
              .style("fill", "#D13B62")
              .style("fill-opacity", 0.1)
              .attr("x", d => this.x(timeDay.offset(endDate, -14)))
              .attr("width", d => this.x(d) - this.x(timeDay.offset(d, -14)))
              .attr("y", 0)
              .attr("height", this.height),
             
              update =>
              update
              .attr("x1", d => this.x(d))
              .attr("x2", d => this.x(d))
              .attr("y1", d => 0)
              .attr("y2", d => this.height),

              exit =>
              exit.call(exit =>
                exit
                .transition()
                .duration(10)
                .style("opacity", 1e-5)
                .remove()
              )
            );
          }
        }

        var lineSelector;
        if (["confirmed_numIncrease", "confirmed_numIncrease_per_100k", "dead_numIncrease", "dead_numIncrease_per_100k", "recovered_numIncrease", "recovered_numIncrease_per_100k"].includes(this.variable)) {
          const averageData = this.isLogY ? this.plottedData.filter(d => d[this.variable.replace("_numIncrease", "_rolling")] >= 1) : this.plottedData.filter(d => d[this.variable.replace("_numIncrease", "_rolling")]);
          lineSelector = this.average
            .selectAll(".rolling-average")
            .data([averageData], d => d._id);
        } else {
          lineSelector = this.average
            .selectAll(".rolling-average")
            .data([], d => d._id);
        }

        lineSelector.join(
          enter => {
            enter
              .append("path")
              .attr("class", "rolling-average")
              .style("stroke", this.colorAverage)
              .style("fill", "none")
              .style("stroke-width", "2.5")
              .datum(d => d)
              .join("path")
              .attr("d", this.line)
              .attr("stroke-dasharray", 0)
              .attr("stroke-dashoffset", 0)
          },
          update => {
            update
              .style("stroke", this.colorAverage)
              .attr("d", this.line)
              .attr("stroke-dasharray", 0)
              .attr("stroke-dashoffset", 0)
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .duration(10)
            .style("opacity", 1e-5)
            .remove()
          )
        );
      }
    },
    drawBarchart (){
     // this.pixiApp.renderer.resize(this.width, this.height)
     if(this.pixiApp){
      if(this.pixiApp.stage.children.length > 0){
       this.pixiApp.stage.removeChildren()
      }
      
       let hoverLine = new SmoothGraphics()
           hoverLine.beginFill(0x000000)
           hoverLine.drawRect(0,0,this.x.bandwidth()*2,40)
            hoverLine.endFill()
            hoverLine.alpha = 0
            this.pixiApp.stage.addChild(hoverLine)

             let hoverCircle = new SmoothGraphics()
           hoverCircle.beginFill(0x000000,1)
           hoverCircle.lineStyle(2, 0x000000, 1.0).drawCircle(0,0,this.x.bandwidth()*4)
        hoverCircle.endFill()
        hoverCircle.alpha = 0
        this.pixiApp.stage.addChild(hoverCircle)
      
       
      this.plottedData.filter(t => t[this.variable]).forEach(d =>{

       let barchart = new SmoothGraphics();
              if(d.confirmed_numIncrease > d.confirmed_rolling){
              barchart.hitArea = new PIXI.Rectangle(this.x(d.date), this.y(d[this.variable.replace("_numIncrease", "_rolling")])-100, this.x.bandwidth(), (this.y(this.yMin)- (this.y(d[this.variable.replace("_numIncrease", "_rolling")])-100)))
              } else{
               barchart.hitArea = new PIXI.Rectangle(this.x(d.date), this.y(d[this.variable.replace("_numIncrease", "_rolling")])-100, this.x.bandwidth(), (this.y(this.yMin)- (this.y(d[this.variable.replace("_numIncrease", "_rolling")])-100)))
              }
      barchart.beginFill(0x507ea3, 0.55)
      let bar = barchart.lineStyle(0.9, 0x507ea3, 0, 0.5).drawRect(this.x(d.date), this.y(d[this.variable]),this.x.bandwidth(),(this.y(this.yMin) - this.y(d[this.variable])))
     
      barchart.endFill();
        if (this.includeTooltips) {
       bar.interactive = true
       bar.on('pointerover', (event) => {
               const ttip = selectAll(".tooltip")
        .style("top", this.y(d[this.variable.replace("_numIncrease", "_rolling")]) + "px")
        .style("left", event.data.global.x + "px")
        .style("opacity", 1);

       ttip.select(".country-name").text(d.name);
      ttip.select(".date").text(timeFormat("%d %b %Y")(d.date));
      ttip
        .select(".count")
        .text(`${format(",.1f")(d[this.variable])} ${this.variableObj.ttip}`)
       if (this.noRollingAvg) {
        ttip
          .select(".count-avg")
          .text("");
      } else {
        ttip
          .select(".count-avg")
          .text(`7 day average: ${format(",.1f")(d[this.variable.replace("_numIncrease", "_rolling")])}`);
      }

                hoverLine.alpha = 1
               hoverLine.position.set(this.x(d.date), this.y(d[this.variable.replace("_numIncrease", "_rolling")]))
               hoverLine.height = this.y(this.yMin)- this.y(d[this.variable.replace("_numIncrease", "_rolling")])

               hoverCircle.alpha = 1
               let circ_x = this.x(d.date) + this.x.bandwidth()/2
               hoverCircle.position.set(circ_x, this.y(d[this.variable.replace("_numIncrease", "_rolling")]))
               
              
            })
            bar.on('pointerout', (event) => {
            selectAll(".tooltip")
            .style("opacity", 0);

            hoverLine.alpha = 0
            hoverCircle.alpha = 0
          
        })
        }
      this.pixiApp.stage.addChild(barchart)
      })
     }
    },
  
    changeScale: function() {
      this.isLogY = !this.isLogY;
      this.$router.replace({
        path: "epidemiology",
        name: "Epidemiology",
        params: {
          disableScroll: true
        },
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.variable.replace("_per_100k", ""),
          fixedY: String(!!this.fixedYMax),
          percapita: String(this.percapita)
        }
      });

      this.updatePlot();
      this.drawBarchart()
    }
  },
  mounted() {
    if (!this.includeAxis) {
      this.margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
    }

    this.setupPlot();
   this.setupBarChart()
    this.updatePlot();
    
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.tooltip {
    position: fixed;
    z-index: 1000;
    background: #ffffffcf;
    opacity: 0;
    pointer-events: none;
}
.switch-button-rect {
    cursor: pointer;
    fill: #fff;
    rx: 5;
    ry: 5;
    stroke: #126b93;
    stroke-width: 1;
    shape-rendering: crispedges;
}
.swoopy-arrow, .swoopy-arrowhead {
    stroke: #698bac;
    fill: none;
    stroke-width: .8;
}
.epi-bargraph{
  pointer-events:none;
}
.epi-bargraph-arrows {
    pointer-events: none;
    & rect {
        pointer-events: auto !important;
    }
}
#barchart-wrapper{
  position:absolute;
}
.axis-font{
  font-size: 1rem;
}
.annotation--rolling-average{
  font-size:0.75em;
}
@media only screen and (max-width: 790px) {
  h4{
    font-size: 2.5rem;
  }
  .annotation--rolling-average{
  font-size:1.2rem;
  }
  .axis-font{
    font-size: 1.5rem;
  }
  .bargraph-group-margin{
    margin-left:1%;
  }
}
</style>
