<template>
<div class="sparkline-group">
  <svg :width="width" :height="height" class="epi-sparkline" ref="timeline">
    <g :transform="`translate(${margin.left}, ${height - margin.bottom + 3})`" class="resource-timeline-axis axis--x" ref="xAxis"></g>
    <g :transform="`translate(${margin.left}, ${margin.top})`" class="resource-timeline-axis axis--y" ref="yAxis"></g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

import * as d3 from "d3";

export default Vue.extend({
  name: "EpiStacked",
  components: {},
  props: {
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 200
    }
  },
  methods: {
    prepData() {
      const parseDate = d3.timeParse("%Y-%m-%d");

      function movingAverage(date, values, N = 7) {
        const dateRange = d3.timeDay.range(d3.timeWeek.floor(date), d3.timeWeek.ceil(date));
        const lowDate = d3.timeDay.offset(date, -1 * N);
        const highDate = d3.timeDay.offset(date, N);
        const filtered = values.filter(d => d.date <= highDate && d.date >= lowDate);
        return (d3.mean(filtered, d => d.count))
      }

      this.data.forEach(d => {
        d["date"] = parseDate(d.term);
      })

      this.data.forEach(d => {
        d["avg"] = movingAverage(d.date, this.data)
      })

      this.data.sort((a, b) => a.date - b.date);
      console.log(this.data)
    },
    setupPlot() {
      this.svg = d3
        .select(this.$refs.timeline);

      this.chart = this.svg.append("g").attr("class", "sparkline").attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

      this.area = d3
        .area()
        .x(d => this.x(d.date))
        .y0(d => this.y(0))
        .y1(d => this.y(d.avg));
    },
    updatePlot() {
      this.prepData();
      this.setupPlot();
      this.updateScales();
      this.drawPlot();
    },
    updateScales() {
      this.x = this.x
        .range([0, this.width - this.margin.left - this.margin.right])
        .domain(d3.extent(this.data, d => d.date));

      this.y = this.y
        .range([this.height - this.margin.top - this.margin.bottom, 0])
        .domain([0, d3.max(this.data, d => d.avg)]);


      this.xAxis = d3
        .axisBottom(this.x)
        .tickSizeOuter(0)
        .ticks(4)
        // .tickValues(
        //   this.x.domain().filter(function(d, i) {
        //     return !(i % 28);
        //   })
        // )
        .tickFormat(d3.timeFormat("%d %b"));

      this.yAxis = d3
        .axisLeft(this.y)
        .tickSizeOuter(0)
        .tickSize(-(this.width - this.margin.left - this.margin.right))
        .ticks(6);

      d3.select(this.$refs.xAxis).call(this.xAxis);
      d3.select(this.$refs.yAxis).call(this.yAxis);
    },
    drawPlot() {
      const sparkSelector = this.chart.selectAll(".sparkline").data([this.data]);

      const sparkEnter = sparkSelector
        .enter()
        .append("path")
        .attr("class", "sparkline");

      // merge
      sparkSelector
        .merge(sparkEnter)
        .datum(d => d)
        .join("path")
        .style("fill", "purple")
        .attr("d", this.area);
    }
  },
  mounted() {
    this.updatePlot();
  },
  data() {
    return {
      margin: {
        top: 10,
        right: 50,
        bottom: 25,
        left: 50
      },
      // axes
      y: d3.scaleLinear(),
      x: d3.scaleTime(),
      xAxis: null,
      yAxis: null,
      // refs
      chart: null,
      // methods
      area: null,
      data: [{
        "term": "2020-01-21",
        "count": 1
      }, {
        "term": "2020-01-22",
        "count": 1
      }, {
        "term": "2020-01-24",
        "count": 3
      }, {
        "term": "2020-01-25",
        "count": 1
      }, {
        "term": "2020-01-26",
        "count": 1
      }, {
        "term": "2020-01-27",
        "count": 1
      }, {
        "term": "2020-01-29",
        "count": 1
      }, {
        "term": "2020-01-28",
        "count": 3
      }, {
        "term": "2020-01-30",
        "count": 2
      }, {
        "term": "2020-02-02",
        "count": 3
      }, {
        "term": "2020-02-04",
        "count": 3
      }, {
        "term": "2020-02-03",
        "count": 1
      }, {
        "term": "2020-02-05",
        "count": 6
      }, {
        "term": "2020-02-08",
        "count": 1
      }, {
        "term": "2020-02-07",
        "count": 1
      }, {
        "term": "2020-02-13",
        "count": 4
      }, {
        "term": "2020-02-09",
        "count": 2
      }, {
        "term": "2020-02-11",
        "count": 4
      }, {
        "term": "2020-02-12",
        "count": 4
      }, {
        "term": "2020-02-18",
        "count": 6
      }, {
        "term": "2020-02-15",
        "count": 1
      }, {
        "term": "2020-02-17",
        "count": 4
      }, {
        "term": "2020-02-14",
        "count": 1
      }, {
        "term": "2020-02-20",
        "count": 11
      }, {
        "term": "2020-02-19",
        "count": 2
      }, {
        "term": "2020-02-21",
        "count": 3
      }, {
        "term": "2020-02-23",
        "count": 13
      }, {
        "term": "2020-02-24",
        "count": 1
      }, {
        "term": "2020-02-26",
        "count": 5
      }, {
        "term": "2020-02-25",
        "count": 3
      }, {
        "term": "2020-02-29",
        "count": 7
      }, {
        "term": "2020-02-27",
        "count": 7
      }, {
        "term": "2020-03-02",
        "count": 4
      }, {
        "term": "2020-03-01",
        "count": 1
      }, {
        "term": "2020-03-03",
        "count": 8
      }, {
        "term": "2020-03-06",
        "count": 20
      }, {
        "term": "2020-03-05",
        "count": 3
      }, {
        "term": "2020-03-09",
        "count": 1
      }, {
        "term": "2020-03-08",
        "count": 6
      }, {
        "term": "2020-03-04",
        "count": 1
      }, {
        "term": "2020-03-07",
        "count": 3
      }, {
        "term": "2020-03-12",
        "count": 5
      }, {
        "term": "2020-03-10",
        "count": 7
      }, {
        "term": "2020-03-13",
        "count": 11
      }, {
        "term": "2020-03-16",
        "count": 8
      }, {
        "term": "2020-03-17",
        "count": 10
      }, {
        "term": "2020-03-14",
        "count": 3
      }, {
        "term": "2020-03-18",
        "count": 5
      }, {
        "term": "2020-03-20",
        "count": 17
      }, {
        "term": "2020-03-19",
        "count": 1
      }, {
        "term": "2020-03-23",
        "count": 13
      }, {
        "term": "2020-03-21",
        "count": 5
      }, {
        "term": "2020-03-22",
        "count": 1
      }, {
        "term": "2020-03-24",
        "count": 7
      }, {
        "term": "2020-03-27",
        "count": 23
      }, {
        "term": "2020-03-30",
        "count": 39
      }, {
        "term": "2020-03-26",
        "count": 6
      }, {
        "term": "2020-03-29",
        "count": 3
      }, {
        "term": "2020-03-25",
        "count": 1
      }, {
        "term": "2020-03-28",
        "count": 5
      }, {
        "term": "2020-03-31",
        "count": 9
      }, {
        "term": "2020-04-01",
        "count": 9
      }, {
        "term": "2020-04-02",
        "count": 10
      }, {
        "term": "2020-04-04",
        "count": 5
      }, {
        "term": "2020-04-06",
        "count": 26
      }, {
        "term": "2020-04-03",
        "count": 7
      }, {
        "term": "2020-04-05",
        "count": 6
      }, {
        "term": "2020-04-07",
        "count": 21
      }, {
        "term": "2020-04-08",
        "count": 13
      }, {
        "term": "2020-04-14",
        "count": 32
      }, {
        "term": "2020-04-10",
        "count": 14
      }, {
        "term": "2020-04-11",
        "count": 39
      }, {
        "term": "2020-04-09",
        "count": 6
      }, {
        "term": "2020-04-17",
        "count": 45
      }, {
        "term": "2020-04-12",
        "count": 4
      }, {
        "term": "2020-04-15",
        "count": 16
      }, {
        "term": "2020-04-16",
        "count": 4
      }, {
        "term": "2020-04-22",
        "count": 23
      }, {
        "term": "2020-04-18",
        "count": 18
      }, {
        "term": "2020-04-19",
        "count": 6
      }, {
        "term": "2020-04-20",
        "count": 17
      }, {
        "term": "2020-04-21",
        "count": 10
      }, {
        "term": "2020-04-23",
        "count": 22
      }, {
        "term": "2020-04-24",
        "count": 27
      }, {
        "term": "2020-04-25",
        "count": 14
      }, {
        "term": "2020-04-27",
        "count": 18
      }, {
        "term": "2020-04-26",
        "count": 5
      }, {
        "term": "2020-04-29",
        "count": 35
      }, {
        "term": "2020-04-28",
        "count": 11
      }, {
        "term": "2020-04-30",
        "count": 6
      }, {
        "term": "2020-05-01",
        "count": 20
      }, {
        "term": "2020-05-04",
        "count": 1
      }, {
        "term": "2020-05-03",
        "count": 10
      }, {
        "term": "2020-05-02",
        "count": 1
      }]
    }
  }
})
</script>
<style lang="scss">
.resource-timeline-axis {
    font-size: 16px;
}
.resource-timeline-axis.axis--y {
    font-size: 13px;
}

.resource-timeline-axis.axis--y path {
  display: none;
}

.resource-timeline-axis.axis--y line {
  stroke: $grey-60;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}

</style>
