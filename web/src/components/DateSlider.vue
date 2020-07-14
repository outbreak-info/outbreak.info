<template>
<div id="dateSlider" class="d-flex flex-column">
  {{this.formatDate(this.selectedDate, "%d %B %Y")}}
  <svg :width="width + margin.left + margin.bottom" :height="height + radius + margin.bottom + margin.top">
    <rect id="slider" x="0" y="0" :width="width + margin.left + margin.right" :height="height" :transform="`translate(0, ${radius})`"></rect>
    <circle fill="#D13B62" :transform="`translate(${margin.left}, ${height/2 + radius})`" id="slider-date" :cx="xDate" :cy="0" :r="radius" ref="drag_circle"></circle>
    <g :transform="`translate(${margin.left}, ${height + margin.top})`" class="slider-axis axis--x" ref="xAxis"></g>
  </svg>

</div>
</template>

<script lang="js">
import Vue from "vue";


import {
  timeParse,
  timeFormat,
  scaleTime,
  select,
  axisBottom,
  drag,
  event
} from "d3";

export default Vue.extend({
  name: "DateSlider",
  props: {
    min: Date,
    max: Date,
    value: String
  },
  data() {
    return {
      width: 150,
      margin: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20
      },
      height: 6,
      radius: 7,
      selectedDate: null,
      xDate: null,
      x: null,
      xAxis: null
    }
  },
  mounted() {
    this.updateAxis();
    this.setupDrag();
  },
  methods: {
    formatDate(dateNum, format = "%Y-%m-%d") {
      return (timeFormat(format)(dateNum))
    },
    setupDrag() {
      select("#slider-date")
        .call(drag()
          // .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended))
    },
    dragCallback() {
      return drag()
        // .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended);
    },
    dragged(d) {
      // update position of circle
      const newX = event.x < 0 ? 0 : (event.x > this.width ? this.width : event.x);
      select(this.$refs.drag_circle).attr("cx", newX);
      // update date displayed
      this.selectedDate = this.x.invert(event.x);
    },
    dragended(d) {
      this.selectedDate = this.x.invert(event.x);
      this.$emit('input', this.formatDate(this.selectedDate));
    },
    updateAxis() {
      this.x = scaleTime()
        .clamp(true)
        .range([0, this.width])
        .domain([this.min, this.max]);

      this.xAxis = axisBottom(this.x).ticks(2).tickSizeOuter(0);

      select(this.$refs.xAxis).call(this.xAxis);

      this.selectedDate = timeParse("%Y-%m-%d")(this.value);
      this.xDate = this.x(this.selectedDate);
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#slider {
    fill: #bababa;
    rx: 3;
    ry: 3;
}

#slider-date {
    cursor: ew-resize;
}

.slider-axis path {
    display: none;
}
</style>
