<template>
<div>
  <h5 class="m-0">Percent of Sequences per Location</h5>
  <h5 class="m-0">Admin Level {{admin_level}}</h5>
  <small class="text-uppercase m-0">Click on bar to expand subregions</small>
  <svg :width="width" :height="height" class="report-stacked-bar" ref="stacked_bar" :name="title">
    <g :transform="`translate(${margin.left},${margin.top})`" ref="chart">
    </g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.top})`"></g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
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


  <DownloadReportData :data="data" figureRef="report-stacked-bar" dataType="Mutation Report Prevalence over Time" />
</div>
</template>


<script lang="js">
import Vue from "vue";
import uniq from "lodash/uniq";
import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  axisLeft,
  axisBottom,
  axisTop,
  scaleBand,
  area,
  stack,
  stackOrderAscending,
  forceY,
  forceSimulation,
  event,
  extent,
  format,
  InternSet,
  scaleOrdinal,
  max,
  map
} from "d3";

export default Vue.extend({
  name: "StackedBargraph",
  props: {
    data: Array,
    admin_level: Number,
 },
  computed: {
    title() {
      return (`Percent of Sequences per Location at Admin Level ${this.admin_level}`);
    },
    rectWidth() {
        return(1/this.data.length);
    }
  },
  watch: {
    width: function() {
      this.sortByAdmin();
      this.setupPlot();
      this.updatePlot();
    },
    data: function() {
      this.sortByAdmin();
      this.setupPlot(); 
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
        right: 10
      },
      marginHist: {
        top: 5,
        bottom: 10,
        left: 55,
        right: 55
      },
      width: 400,
      height: 400,
      legendHeight: null,
      // variables
      fillVar: "key",
      // axes
      x: scaleLinear(),
      y: scaleBand(),
      xAxis: null,
      yAxis: null,
      // describes a clicked location
      targetLoc: null,
      py: 0.1,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      ttips: null,
      area: null,
      // updated and sorted by admin and/or loc
      updatedData: null,
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
      document.addEventListener("mousemove", evt => {
        if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("rect")){
            this.mouseOff();
        }}, 
      {passive:true} 
      );
      
      document.addEventListener("mouseleave", evt => {
        //console.log(evt.target.className);
        if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("rect")){
            this.mouseOff();
        }
      },
      {passive:true});
    });

    // set initial dimensions for the plots.
    this.sortByAdmin();
    this.setDims();
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceSetDims = this.debounce(this.setDims, 150);
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
  },
  methods: {
    sortByAdmin(){
        // find all the unique locs for the admin level
        var response = this.returnUniqueLocs();
        var uniqueLocs = response.at(0);
        var uniqueNames = response.at(1);
        //console.log(uniqueNames, uniqueLocs);        

        //clear the updated data
        this.updatedData = [];
        
        var i = 0;
        //make skeleton of what will be there
        uniqueLocs.forEach(d => {
            var tempObject = {};
            tempObject["loc_code"] = d;
            tempObject["total_count"] = 0;
            tempObject['name'] = uniqueNames.at(i);
            tempObject["y"] = i
            this.updatedData.push(tempObject);
            i += 1;
        });
        //console.log(this.updatedData); 
        //make an array of dicts counting only these unique locs
        this.data.forEach(d=> {
            //console.log(this.targetLoc, this.admin_level, d.loc_code);
            if ((this.admin_level > 0 && d.loc_code.at(this.admin_level-1) == this.targetLoc) ||
                this.admin_level == 0){
                // find the object we nee to add to
                let obj = this.updatedData.find(o => o.loc_code === d.loc_code.at(this.admin_level));                     
                obj.total_count += d.total_count;
            }
        });
    },
    returnUniqueLocs(){
        //console.log("in Unique locs");
        var uniqueLocs = [];
        var uniqueNames = [];
        this.data.forEach(d=>{
            // we've clicked on a location
            //console.log(this.targetLoc, this.admin_level);
            if(this.targetLoc && this.admin_level > 0){
               if (!uniqueLocs.includes(d.loc_code.at(this.admin_level)) && 
                    d.loc_code.at(this.admin_level-1) === this.targetLoc){
                    uniqueLocs.push(d.loc_code.at(this.admin_level));
                    uniqueNames.push(d.loc_code.at(this.admin_level+3));
               } 
            } else{
                if (!uniqueLocs.includes(d.loc_code.at(this.admin_level))){
                    uniqueLocs.push(d.loc_code.at(this.admin_level));
                    uniqueNames.push(d.loc_code.at(this.admin_level+3));
                }
            }   
        });
        return([uniqueLocs, uniqueNames]);
    },
    setDims() {},
    setupPlot() {
      this.chart = select(this.$refs.chart);
      this.ttips = select(this.$refs.choropleth_tooltip);
    },
    updateScales() {
      // scale the y component
      this.y = this.y
        .range([0, this.height-this.margin.top-this.margin.bottom])
        .padding(0.1)
        .domain(this.updatedData.map(d => d.loc_code));
      // scale the x component
      this.x = this.x
        .domain([0,1])
        .range([0, this.width-this.margin.right-this.margin.left]);
      
      this.yAxis = axisLeft(this.y).tickSizeOuter(0);     
      this.xAxis = axisBottom(this.x).tickFormat(format(".0%"));
     (this.data)
      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.xAxis).call(this.xAxis);
    },
    updatePlot() {
      if (this.updatedData) {
        this.updateScales();
        this.drawPlot();
      }
    },

   prepData(){
    // add in the x value, and normalize the total_count value
     var count =  1;
     var total_counts = 0;
     this.updatedData.forEach(d => {
        total_counts += d.total_count;
      });
      this.updatedData.forEach(d => {
        d.total_count_norm = d.total_count / total_counts;
      });
        
      //put something here to sort bu percentage

   },
   drawPlot() {
      this.prepData();
      const barSelector = this.chart
        .selectAll(".stacked-bar-chart")
        .data(this.updatedData);
      
     // calculate label positions so they don't overlap
      const labelHeight = 18;
      console.log("this data", this.updatedData);
      barSelector.join(
        enter => {
          const barGrp = enter.append("g")
            .attr("class", "stacked-bar-chart")
            .attr("id", d => d.loc_code)
          barGrp.append("rect")
            .attr("x", d => this.x(0))
            .attr("width", d => this.x(d.total_count_norm))
            .attr("y", d => this.y(d.loc_code))
            .attr("height", this.y.bandwidth())
            .style("fill", "#69b3a2")
            .on("click", d => this.destroy(d))
       },
        update => {
          update
            .attr("id", d => d.key.replace(/\./g, "-"))
          update.select("rect")
            .attr("y", d => this.y(d[0][1]))
            .attr("height", d => this.y(d[0][0]) - this.y(d[0][1]))
            .style("fill", d => this.colorScale(d.key))
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

      this.chart.selectAll("rect")
        .on("mouseenter", d => this.debounceMouseon(d))

    },
    mouseOn(d){
      const ttipShift = 15;
      const ttip = select(this.$refs.tooltip_choro)
   
    ttip.select("#no-sequencing").classed("hidden", true);
    ttip.select("#proportion")
      .text(`${d.loc_code}`)
      .classed("hidden", false);
    ttip.select("#confidence-interval")
      .text(`Percent of Sequences  ${format(".0%")(d.total_count_norm)}`)
      .classed("hidden", false);
    ttip.select("#sequencing-count")
      .text(`Count of Sequences ${d.total_count}`)     
      .classed("hidden", false);
        
     // fix location
      ttip
        .style("left", `${this.event.clientX + ttipShift}px`)
        .style("top", `${this.event.clientY + ttipShift}px`)
        .style("display", "block");
    },

    mouseOff() {
      select(this.$refs.tooltip_choro)
        .style("display", "none");
   },
   destroy(d) {
     // bump the admin level if appropriate
     if (this.admin_level < 2 && d.loc_code != '' && d.loc_code != 'unkn'){ 
     this.admin_level += 1;
     // change the targetLoc
     this.targetLoc = d.loc_code;
     this.sortByAdmin();
     this.removeElements();
     this.updatePlot();}
    },   
    removeElements(){
      this.chart.selectAll("g").remove();
      this.chart.selectAll("rect").remove();
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
}
</style>
