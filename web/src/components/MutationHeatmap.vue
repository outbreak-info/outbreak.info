<template>
  <div class="overflow-auto" :class="{ 'w-75': isOverflow }">
    <svg
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
      ref="svg"
      class="mutation-heatmap"
      name="Mutations by lineage"
      :subtitle="gene"
      :style="{ background: bgColor }"
    >
      <defs>
        <pattern
          id="diagonalHatchDark"
          width="5"
          height="5"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            :style="`stroke:${strokeColor}; stroke-width:0.75`"
          />
        </pattern>
        <pattern
          id="diagonalHatchLight"
          width="7"
          height="7"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <rect x="-2" y="-2" width="10" height="10" fill="#efefef" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="25"
            :style="`stroke:#CCC; stroke-width:4`"
          />
        </pattern>
      </defs>
      <g
        ref="xAxisTop"
        class="axis axis--x"
        :transform="`translate(${this.margin.left}, ${this.margin.top - 5})`"
      ></g>
      <g
        ref="xAxisBottom"
        class="axis axis--x"
        :transform="
          `translate(${this.margin.left}, ${this.margin.top + this.height + 5})`
        "
      ></g>
      <g
        ref="heatmapBase"
        id="heatmap-base"
        :transform="`translate(${this.margin.left}, ${this.margin.top})`"
      ></g>
      <g
        ref="heatmap"
        id="heatmap"
        :transform="`translate(${this.margin.left}, ${this.margin.top})`"
      ></g>
    </svg>

    <!-- TOOLTIPS -->
    <div
      ref="tooltip_heatmap"
      class="tooltip-basic tooltip-dark box-shadow"
      id="tooltip-prevalence"
    >
      <div class="d-flex border-bottom align-items-center">
        <div class="d-flex">
          <h5 id="mutation"></h5>
          <div class="fa-sm font-weight-bold" id="mutationOfInterest"></div>
        </div>
        <span class="mx-2 text-muted">in</span>
        <div class="d-flex">
          <h5 id="lineage"></h5>
          <div class="fa-sm font-weight-bold" id="lineageOfInterest"></div>
        </div>
      </div>
      <div class="d-flex align-items-center pt-2" id="prevalence">
        <div id="value" class="fa-lg"></div>
        <small class="ml-2 text-muted">of all sequences</small>
      </div>
      <div id="count"></div>
      <div id="not-detected" class="text-muted">
        not detected
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

import {
  cloneDeep,
  uniq
} from "lodash";

import {
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  select,
  selectAll,
  scaleBand,
  axisBottom,
  axisTop,
  transition,
  max,
  format,
  nest,
  event
} from "d3";


import chroma from "chroma-js";
import tippy from "tippy.js";
import "tippy.js/themes/light.css";


export default Vue.extend({
  name: "MutationHeatmap",
  props: {
    data: Array,
    gene: String,
    locationID: String,
    dark: {
      type: Boolean,
      default: false
    },
    moc: {
      type: Array,
      default: () => []
    },
    moi: {
      type: Array,
      default: () => []
    },
    voi: {
      type: Array,
      default: () => []
    },
    voc: {
      type: Array,
      default: () => []
    },
    bandWidth: {
      type: Number,
      default: 25
    },
    xVar: {
      type: String,
      default: "mutation_simplified"
    },
    yVar: {
      type: String,
      default: "pangolin_lineage"
    },
    routeTo: {
      type: String,
      default: "MutationReport"
    },
    yDomain: Array,
    onlyTopAxis: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    data() {
      this.updatePlot();
    },
    dark() {
      this.updatePlot();
    }
  },
  computed: {
    bgColor() {
      return this.dark ? "#343a40" : "none";
    },
    textColor() {
      return this.dark ? "#efefef" : "#555555";
    },
    routeToName() {
      return this.routeTo.includes("GenomicsEmbed") ? "GenomicsEmbed" : "MutationReport";
    }
  },
  data() {
    return {
      margin: {
        top: 72,
        right: 325,
        bottom: 72,
        left: 250
      },
      isOverflow: false,
      // UI
      sortVar: "codon_num",
      // constants
      rx: 4,
      strokeColor: "#AAA",
      concernColor: "#fb5759",
      interestColor: "#feb56c",
      concernColorDark: "#e15759",
      interestColorDark: "#f28e2c",
      lineageWarningThreshold: 1000,
      // scales
      x: scaleBand(),
      y: scaleBand(),
      paddingInner: 0.1,
      xAxisTop: null,
      xAxisBottom: null,
      width: null,
      height: null,
      colorScale: interpolateRdPu,
      // references
      svg: null,
      heatmap: null,
      heatmapBase: null,
      // data
      base: null,
      plottedData: null,
      xDomain: null
    }
  },
  mounted() {
    this.setupPlot();
    this.updatePlot();
    this.$nextTick(function() {
      tippy(this.svg.selectAll(".low-count").nodes(), {
        content: "Loading...",
        maxWidth: "200px",
        placement: "bottom",
        animation: "fade",
        theme: "light",
        allowHTML: true,
        interactive: true,
        appendTo: document.body,
        onShow(instance) {
          let info = instance.reference.dataset.tippyInfo;
          instance.setContent(info);
        }
      });
    })

  },
  methods: {
    setupDims() {

    },
    setupPlot() {
      if (this.onlyTopAxis) {
        this.margin.top = 62;
        this.margin.left = 5;
        this.margin.right = 27;
        this.margin.bottom = 5;
      }

      this.svg = select(this.$refs.svg);
      this.heatmap = select(this.$refs.heatmap);
      this.heatmapBase = select(this.$refs.heatmapBase);
    },
    updateScales() {
      this.x = scaleBand()
        .paddingInner(this.paddingInner)
        .domain(this.plottedData.map(d => d[this.xVar]));

      this.xDomain = this.x.domain();

      this.width = this.xDomain.length * this.bandWidth;
      this.isOverflow = this.width > 0.95 * window.innerWidth;
      this.x.range([0, this.width]);


      this.y = scaleBand()
        .paddingInner(this.paddingInner)
        .domain(this.yDomain);

      this.height = this.yDomain.length * this.bandWidth;
      this.y.range([0, this.height]);

      if (!this.onlyTopAxis) {
        this.xAxisBottom = axisBottom(this.x).tickSizeOuter(0);
        select(this.$refs.xAxisBottom).call(this.xAxisBottom);
      }

      this.xAxisTop = axisTop(this.x).tickSizeOuter(0);
      select(this.$refs.xAxisTop).call(this.xAxisTop);

      this.base = this.xDomain.map(x => {
        return this.yDomain.map(y => {
          const obj = {};
          obj[this.xVar] = x;
          obj[this.yVar] = y;
          obj["id"] = `base_${this.cleanSelectors(x)}-${this.cleanSelectors(y)}`;
          return (obj)
        })
      }).flatMap(d => d)
    },
    cleanSelectors(id) {
      return(id.replace(/:/g, "_").replace(/\//g, "_").replace(/\*\s\[/g, "_").replace(/\s\(/g, "_").replace(/\)\]/g, "_").replace(/\s\+\s/g, "--").replace(/:/g, "_").replace(/\*/g, "stop").replace(/\(/g, "").replace(/\)/g, "").replace(/\./g, "-").replace(/\s/g, "_"));
    },
    prepData() {
      this.plottedData = cloneDeep(this.data);
      this.plottedData.sort((a, b) => a.codon_num - b.codon_num)
    },
    updatePlot() {
      if (this.data) {
        this.prepData();
        this.updateScales();
        this.drawPlot();
      }
    },
    tooltipOn(d) {
      const ttipShift = 10;
      const ttip = select(this.$refs.tooltip_heatmap);

      // turn off the rest
      this.svg
        .selectAll("rect")
        .style("fill-opacity", 0.2);

      this.svg.select(`#${d.id}`)
        .style("fill-opacity", 1)
        .style("stroke-width", 1.5)

      // update text
      ttip
        .select("#lineage")
        .text(d.pangolin_lineage)

      ttip
        .select("#lineageOfInterest")
        .html(this.voc.includes(d.pangolin_lineage) ? "<sup>*</sup> VOC" : this.voi.includes(d.pangolin_lineage) ? "<sup>*</sup> VOI" : "")
        .style("color", this.voc.includes(d.pangolin_lineage) ? this.concernColorDark : this.voi.includes(d.pangolin_lineage) ? this.interestColorDark : this.textColor)

      ttip
        .select("#mutation")
        .text(d.mutation_simplified)

      ttip
        .select("#mutationOfInterest")
        .html(this.moc.includes(d.mutation_simplified) ? "<sup>*</sup> MOC" : this.moi.includes(d.mutation_simplified) ? "<sup>*</sup> MOI" : "")
        .style("color", this.moc.includes(d.mutation_simplified) ? this.concernColorDark : this.moi.includes(d.mutation_simplified) ? this.interestColorDark : this.textColor)

      if (d.prevalence) {
        ttip
          .select("#value")
          .text(d.prevalence < 0.0005 ? "< 0.1%" : format(".1%")(d.prevalence));

        ttip
          .select("#count")
          .text(`(${format(",")(d.mutation_count)} / ${format(",")(d.lineage_count)})`)

        ttip
          .select("#prevalence")
          .classed("hidden", false)

        ttip
          .select("#count")
          .classed("hidden", false)

        ttip
          .select("#not-detected")
          .classed("hidden", true);
      } else {
        ttip
          .select("#prevalence")
          .classed("hidden", true)

        ttip
          .select("#count")
          .classed("hidden", true)

        ttip
          .select("#not-detected")
          .classed("hidden", false)
      }
      // fix location
      ttip
        .style("left", `${event.clientX + ttipShift}px`)
        .style("top", `${event.clientY + ttipShift}px`)
        .style("display", "block");
    },
    tooltipOff() {
      this.svg.selectAll("rect")
        .style("stroke-width", 0.5)
        .style("fill-opacity", 1);

      select(this.$refs.tooltip_heatmap)
        .style("display", "none");
    },
    highlightRow(d) {
      this.svg
        .selectAll(".y-axis-right")
        .style("opacity", 0.2);
      this.svg
        .selectAll(".y-axis-left")
        .style("opacity", 0.2);

      this.svg
        .selectAll("rect")
        .style("fill-opacity", 0.2);

      this.svg.selectAll(`.${this.cleanSelectors(d)}`)
        .style("fill-opacity", 1)
        .style("opacity", 1)
    },
    highlightColumn(d) {
      select(this.$refs.xAxisBottom)
        .selectAll("text")
        .style("opacity", 0.2);

      select(this.$refs.xAxisTop)
        .selectAll("text")
        .style("opacity", 0.2);

      this.svg
        .selectAll("rect")
        .style("fill-opacity", 0.2);

      this.svg.selectAll(`.${this.cleanSelectors(d)}`)
        .style("fill-opacity", 1)
        .style("opacity", 1)
    },
    highlightOff(d) {
      select(this.$refs.xAxisBottom)
        .selectAll("text")
        .style("opacity", 1);

      select(this.$refs.xAxisTop)
        .selectAll("text")
        .style("opacity", 1);

      this.svg
        .selectAll(".y-axis-left")
        .style("opacity", 1);

      this.svg
        .selectAll(".y-axis-right")
        .style("opacity", 1);

      this.svg
        .selectAll("rect")
        .style("fill-opacity", 1);
    },
    route2Lineage(pango, is_alias) {
      if (is_alias) {
        if(this.routeToName == "GenomicsEmbed"){
          this.$router.push({
            name: this.routeToName,
            query: {
              alias: pango,
              loc: this.locationID,
              selected: this.locationID
            }
          })
        } else {
          this.$router.push({
            name: this.routeToName,
            params: {
              alias: pango.toLowerCase()
            },
            query: {
              loc: this.locationID,
              selected: this.locationID
            }
          })
        }

      } else {
        this.$router.push({
          name: this.routeToName,
          query: {
            loc: this.locationID,
            pango: pango,
            selected: this.locationID
          }
        })
      }
    },
    route2LineageMutation(d) {
      if (d.is_alias) {
        this.$router.push({
          name: this.routeToName,
          params: {
            alias: d[this.yVar].toLowerCase()
          },
          query: {
            loc: this.locationID,
            muts: d.mutation,
            selected: this.locationID
          }
        })
      } else {
        this.$router.push({
          name: this.routeToName,
          query: {
            loc: this.locationID,
            pango: d[this.yVar],
            muts: d.mutation,
            selected: this.locationID
          }
        })
      }
    },
    route2Mutation(mut) {
      this.$router.push({
        name: this.routeToName,
        query: {
          loc: this.locationID,
          muts: `${this.gene}:${mut}`,
          selected: this.locationID
        }
      })
    },
    drawPlot() {
      // base: no values
      const heatmapBaseSelector = this.heatmapBase
        .selectAll(".heatmap-base")
        .data(this.base);

      heatmapBaseSelector.join(
        enter => {
          enter
            .append("rect")
            .attr("class", "heatmap-base")
            .attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", this.dark ? "url(#diagonalHatchDark)" : "url(#diagonalHatchLight)")
            .style("stroke", "#888")
            .style("stroke-width", 0.5)
            .style("rx", this.rx)
        },
        update => {
          update.attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .transition()
            .duration(250)
            .style("fill-opacity", 0)
            .transition()
            .duration(250)
            .style("fill-opacity", 1)
            .style("fill", this.dark ? "url(#diagonalHatchDark)" : "url(#diagonalHatchLight)")
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      // heatmap
      const heatmapSelector = this.heatmap
        .selectAll(".heatmap")
        .data(this.plottedData, d => d.id);

      heatmapSelector.join(
        enter => {
          enter
            .append("rect")
            .attr("class", d => `heatmap pointer ${this.cleanSelectors(d[this.xVar])} ${this.cleanSelectors(d[this.yVar])}`)
            .attr("id", d => d.id)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
            // .attr("transform", d => d[this.yVar]  == "average" ? "translate(0,10)" : "translate(0,0)")
            .style("stroke", "#888")
            .style("stroke-width", 0.5)
            .style("rx", this.rx)
        },
        update => {
          update.attr("id", d => d.id)
            .attr("class", d => `heatmap pointer ${this.cleanSelectors(d[this.xVar])} ${this.cleanSelectors(d[this.yVar])}`)
            .attr("x", d => this.x(d[this.xVar]))
            .attr("width", this.x.bandwidth())
            .attr("y", d => this.y(d[this.yVar]))
            .attr("height", this.y.bandwidth())
            .style("fill", d => this.colorScale(d.prevalence))
        },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      const yDomainFull = nest()
        .key(d => d[this.yVar])
        .rollup(values => {
          return ({
            is_alias: values[0].is_alias,
            count: values[0].lineage_count
          })
        })
        .entries(this.data)
        .map(d => {
          return ({
            key: d.key,
            value: d.value.count,
            is_alias: d.value.is_alias
          })
        });

      if (!this.onlyTopAxis) {
        const yAxisRightSelector = this.heatmap
          .selectAll(".y-axis-right")
          .data(yDomainFull, d => d.key);

        yAxisRightSelector.join(enter => {
            const grp = enter.append("text")
              .attr("class", d => `y-axis-right ${this.cleanSelectors(d.key)}`)
              .attr("x", this.width)
              .attr("y", d => this.y(d.key) + this.y.bandwidth() / 2)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("fill", this.textColor)
              .style("dominant-baseline", "central")
              .on("mouseover", d => this.highlightRow(d.key))
              .on("mouseout", this.highlightOff);

            grp.append("tspan")
              .attr("class", "y-axis-lineage")
              .classed("hover-underline", "true")
              .classed("pointer", "true")
              .style("fill", d => this.voc.includes(d.key) ? (this.dark ? this.concernColor : this.concernColorDark) : this.voi.includes(d.key) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor)
              .style("font-size", 18)
              .attr("dx", 10)
              .text(d => d.key)
              .on("click", d => this.route2Lineage(d.key, d.is_alias));

            grp.append("tspan")
              .attr("class", "y-axis-count")
              // .attr("x", this.width + this.margin.right)
              // .style("text-anchor", "end")
              .style("font-size", 14)
              .style("fill", this.dark ? "#d2d2d2" : "#999")
              .attr("dx", 7)
              // .attr("dx", -5)
              .text((d, i) => i === 0 ? `(${format(",")(d.value)} seqs)` : `(${format(",")(d.value)})`);

            grp.append("tspan")
              .attr("class", "fa fa-exclamation-circle")
              .attr('font-family', "FontAwesome")
              .attr("dx", 7)
              .attr("data-tippy-info", d =>
                `<span class='text-underline'>Warning</span>: currently, there are only <b>${d.value} sequences</b> reported for <b>${d.key}</b>. The characteristic mutations for ${d.key} may change as more sequences are reported. <a href='https://outbreak.info/situation-reports/methods#characteristic'>(read more)</a>`
              )
              .classed("hidden", d => d.value >= this.lineageWarningThreshold)
              .classed("low-count", d => d.value < this.lineageWarningThreshold)
              .style("font-size", 14)
              .style("fill", "#D13B62")
              .text("\uf06a");

          },
          update => {
            update
              .attr("class", d => `y-axis-right ${this.cleanSelectors(d.key)}`)
              .attr("x", this.width)
              .attr("y", d => this.y(d.key) + this.y.bandwidth() / 2);

            update.select(".y-axis-lineage")
              .text(d => d.key)
              .style("fill", d => this.voc.includes(d.key) ? (this.dark ? this.concernColor : this.concernColorDark) : this.voi.includes(d.key) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor);

            update.select(".y-axis-count")
              .style("fill", this.dark ? "#d2d2d2" : "#999")
              .text((d, i) => i === 0 ? `(${format(",")(d.value)} seqs)` : `(${format(",")(d.value)})`);

            update.select(".fa-exclamation-circle")
              .classed("hidden", d => d.value >= this.lineageWarningThreshold)
              .classed("low-count", d => d.value < this.lineageWarningThreshold);
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          ))

        const yAxisLeftSelector = this.heatmap
          .selectAll(".y-axis-left")
          .data(yDomainFull, d => d.key);

        yAxisLeftSelector.join(enter => {
            const grp = enter.append("text")
              .attr("class", d => `y-axis-left ${this.cleanSelectors(d.key)}`)
              .attr("x", 0)
              .attr("y", d => this.y(d.key) + this.y.bandwidth() / 2)
              .style("font-family", "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
              .style("fill", this.textColor)
              .style("text-anchor", "end")
              .style("dominant-baseline", "central")
              .on("mouseover", d => this.highlightRow(d.key))
              .on("mouseout", this.highlightOff);

            grp.append("tspan")
              .attr("class", "y-axis-lineage")
              .classed("hover-underline", "true")
              .classed("pointer", "true")
              .style("fill", d => this.voc.includes(d.key) ? (this.dark ? this.concernColor : this.concernColorDark) : this.voi.includes(d.key) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor)
              .style("font-size", 18)
              .attr("dx", -10)
              .text(d => d.key)
              .on("click", d => this.route2Lineage(d.key, d.is_alias));
          },
          update => {
            update
              .attr("class", d => `y-axis-left ${this.cleanSelectors(d.key)}`)
              .attr("y", d => this.y(d.key) + this.y.bandwidth() / 2);

            update.select(".y-axis-lineage")
              .text(d => d.key)
              .style("fill", d => this.voc.includes(d.key) ? (this.dark ? this.concernColor : this.concernColorDark) : this.voi.includes(d.key) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor);
          },
          exit =>
          exit.call(exit =>
            exit
            .transition()
            .style("opacity", 1e-5)
            .remove()
          ))
      }

      // turn on tooltips
      this.svg
        .selectAll("rect")
        .on("click", d => this.route2LineageMutation(d))
        .on("mousemove", d => this.tooltipOn(d))
        .on("mouseleave", () => this.tooltipOff());

      // stylize the axis lines
      selectAll(".mutation-heatmap")
        .selectAll(".axis line")
        .style("stroke", this.textColor)

      // rotate and color axes :(
      select(this.$refs.xAxisTop)
        .selectAll("text")
        .attr("y", 0)
        .attr("dx", 6)
        .attr("dy", "-0.75em")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "start")
        .style("fill", d => this.moc.includes(d) ? (this.dark ? this.concernColor : this.concernColorDark) : this.moi.includes(d) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor)
        .attr("class", d => `hover-underline pointer ${this.cleanSelectors(d)}`)
        .on("click", d => this.route2Mutation(d))
        .on("mouseover", d => this.highlightColumn(d))
        .on("mouseout", this.highlightOff);

      select(this.$refs.xAxisBottom)
        .selectAll("text")
        .attr("y", 0)
        .attr("dx", 6)
        .attr("dy", "1.25em")
        .attr("transform", "rotate(35)")
        .style("text-anchor", "start")
        .style("fill", d => this.moc.includes(d) ? (this.dark ? this.concernColor : this.concernColorDark) : this.moi.includes(d) ? (this.dark ? this.interestColor : this.interestColorDark) : this.textColor)
        .attr("class", d => `hover-underline pointer ${this.cleanSelectors(d)}`)
        .on("click", d => this.route2Mutation(d))
        .on("mouseover", d => this.highlightColumn(d))
        .on("mouseout", this.highlightOff);;
    }
  }
})
</script>

<style lang="scss">
.mutation-heatmap .axis--x text,
.mutation-heatmap .axis--y text {
  /* fill: #efefef; */
  /* fill: #555; */
}

.mutation-heatmap .axis--x text {
  font-size: 12px;
}

.mutation-heatmap .axis--y text {
  font-size: 18px;
}

.mutation-heatmap .axis path {
  display: none;
}

.mutation-heatmap .axis--y line {
  display: none;
}

.tooltip-dark {
  background: #ffffffeb !important;
}
</style>
