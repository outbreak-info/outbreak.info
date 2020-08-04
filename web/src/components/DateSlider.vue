<template>
<div id="dateSlider" class="d-flex flex-column">
  {{this.formatDate(this.selectedDate, "%d %B %Y")}}
  <div class="d-flex align-items-center">
    <div class="d-flex">
      <i class="btn btn-main-outline fas fa-fast-backward" @click="changeDate(-7)"></i>
      <i class="btn btn-main-outline fas fa-step-backward ml-1" @click="changeDate(-1)" style="font-size: 0.85em; line-height: 1.2em"></i>
    </div>
    <svg :width="width + margin.left + margin.bottom" :height="height + radius + margin.bottom + margin.top" class="mx-2">
      <rect id="slider" x="0" y="0" :width="width + margin.left + margin.right" :height="height" :transform="`translate(0, ${radius})`"></rect>
      <circle fill="#D13B62" :transform="`translate(${margin.left}, ${height/2 + radius})`" id="slider-date" :cx="xDate" :cy="0" :r="radius" ref="drag_circle"></circle>
      <g :transform="`translate(${margin.left}, ${height + margin.top})`" class="slider-axis axis--x" ref="xAxis"></g>
    </svg>
    <div class="d-flex">
      <i class="btn btn-main-outline fas fa-step-forward mr-1" @click="changeDate(1)" style="font-size: 0.85em; line-height: 1.2em"></i>
      <i class="btn btn-main-outline fas fa-fast-forward" @click="changeDate(7)"></i>
    </div>
  </div>

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
  timeDay,
  offset,
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
    changeDate(dayShift) {
      this.selectedDate = timeDay.offset(this.selectedDate, dayShift);
      // update dot position
      select(this.$refs.drag_circle).attr("cx", this.x(this.selectedDate));
      this.$emit('input', this.formatDate(this.selectedDate));
    },
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
