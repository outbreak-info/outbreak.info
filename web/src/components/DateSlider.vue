<template>
<div id="dateSlider" class="d-flex flex-column">
  {{this.formattedDate}}
  <div class="d-flex align-items-start">
    <div class="d-flex">
      <div class="btn btn-main-outline px-2 py-1" style="font-size: 0.85em" @click="changeDate(-7)" :class="{disabled: hideBack7}">
        <font-awesome-icon :icon="['fas', 'fast-backward']" />
      </div>
      <div class="btn btn-main-outline ml-1 px-2 py-1 d-flex align-items-center" style="font-size: 0.7em" @click="changeDate(-1)" :class="{disabled: hideBack1}">
        <font-awesome-icon :icon="['fas', 'step-backward']" />
      </div>
    </div>
    <svg :width="width + margin.left + margin.bottom" :height="height + radius + margin.bottom + margin.top" class="mr-3 ml-3">
      <rect id="slider" x="0" y="0" :width="width + margin.left + margin.right" :height="height" :transform="`translate(0, ${radius})`"></rect>
      <circle fill="#D13B62" :transform="`translate(${margin.left}, ${height/2 + radius})`" id="slider-date" :cx="xDate" :cy="0" :r="radius" ref="drag_circle"></circle>
      <g :transform="`translate(${margin.left}, ${height + margin.top})`" class="slider-axis axis--x" ref="xAxis"></g>
    </svg>
    <div class="d-flex">
      <div class="btn btn-main-outline mr-1 px-2 py-1 d-flex align-items-center" :class="{disabled: hideForward1}" @click="changeDate(1)" style="font-size: 0.7em">
        <font-awesome-icon :icon="['fas', 'step-forward']" />
      </div>
      <div class="btn btn-main-outline px-2 py-1" style="font-size: 0.85em" :class="{disabled: hideForward7}" @click="changeDate(7)">
        <font-awesome-icon :icon="['fas', 'fast-forward']" />
      </div>

    </div>

    <div class="btn btn-main-outline px-2 py-1 ml-2" style="font-size: 0.85em" @click="play()">
      <font-awesome-icon :icon="['fas', 'pause']" v-if="isPlaying" />
      <font-awesome-icon :icon="['fas', 'play']" v-else />
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

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faPause,
  faStepForward,
  faFastForward,
  faStepBackward,
  faFastBackward
} from "@fortawesome/free-solid-svg-icons";

library.add(faPlay, faPause, faStepForward, faFastForward, faStepBackward, faFastBackward);

export default Vue.extend({
  name: "DateSlider",
  props: {
    min: Date,
    max: Date,
    date: String,
    adminLevel: String
  },
  components: {
    FontAwesomeIcon
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
      minDate: new Date("2020-01-22 0:0"),
      xDate: null,
      x: null,
      xAxis: null,
      isPlaying: false
    }
  },
  computed: {
    hideBack7() {
      return ((this.selectedDate - this.minDate) / (1000 * 60 * 60 * 24) < 7)
    },
    hideBack1() {
      return ((this.selectedDate - this.minDate) / (1000 * 60 * 60 * 24) < 1)
    },
    hideForward7() {
      return ((this.max - this.selectedDate) / (1000 * 60 * 60 * 24) < 7)
    },
    hideForward1() {
      return ((this.max - this.selectedDate) / (1000 * 60 * 60 * 24) < 1)
    },
    formattedDate() {
      return (this.formatDate(this.selectedDate, "%d %B %Y"));
    }
  },
  watch: {
    date: function() {
      this.updateAxis();
    }
  },
  mounted() {
    this.updateAxis();
    this.setupDrag();
  },
  methods: {
    play() {
      this.isPlaying = !this.isPlaying;

      const dayGap = this.adminLevel === "0" || this.adminLevel === "1" ? 3 : 7; // parameter for how many days between

      if ((this.max - this.selectedDate) / (1000 * 60 * 60 * 24) < dayGap) {
        this.selectedDate = this.minDate;
      }

      if (this.isPlaying) {
        this.$gtag.event("map_play", {
          'event_category': `map_play`,
          'event_label': `playing map starting from [${this.$route.fullPath}])`
        });

        this.start(dayGap);
      }
    },
    start(dayGap) {
      if ((timeDay.offset(this.selectedDate, dayGap) <= this.max) && this.isPlaying) {
        setTimeout(() => {
          this.changeDate(dayGap, false);
          this.start(dayGap);
        }, 500);
      } else {
        this.isPlaying = false;
      }
    },
    changeDate(dayShift, animate = true) {
      this.selectedDate = timeDay.offset(this.selectedDate, dayShift);
      // update dot position
      select(this.$refs.drag_circle).attr("cx", this.x(this.selectedDate));

      const route = this.$route.query;
      this.$router.replace({
        path: "maps",
        name: "Maps",
        params: {
          disableScroll: true
        },
        query: {
          location: route.location,
          admin_level: route.admin_level,
          variable: route.variable,
          date: this.formatDate(this.selectedDate),
          min: route.min,
          max: route.max,
          animate: animate
        }
      });
    },
    parseDate(dateStr, format = "%Y-%m-%d") {
      return (timeParse(format)(dateStr))
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

      const route = this.$route.query;
      this.$router.push({
        path: "maps",
        query: {
          location: route.location,
          admin_level: route.admin_level,
          variable: route.variable,
          date: this.formatDate(this.selectedDate),
          min: route.min,
          max: route.max
        }
      });
    },
    updateAxis() {
      this.x = scaleTime()
        .clamp(true)
        .range([0, this.width])
        .domain([this.min, this.max]);

      this.xAxis = axisBottom(this.x).ticks(2).tickSizeOuter(0);

      select(this.$refs.xAxis).call(this.xAxis);

      this.selectedDate = this.parseDate(this.date);

      // update dot position
      select(this.$refs.drag_circle).attr("cx", this.x(this.selectedDate));

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
