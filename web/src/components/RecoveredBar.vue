<template>
<div class="recovered-bar-plot">
  <svg class="recovered-bars" :width="width+6" :height="height+6">
    <g transform="translate(3,3)">
      <rect :width="width" :height="height" :x="0" :y="0" class="total-cases"></rect>
      <rect :width="recoveredWidth" :height="height" :x="0" :y="0" class="recovered-cases"></rect>
      <rect :width="deadWidth" :height="height" :x="width - deadWidth" :y="0" class="dead-cases"></rect>
      <rect :width="width" :height="height" :x="0" :y="0" class="total-cases-outline"></rect>
    </g>
  </svg>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  scaleLinear
} from "d3";

const width = 50;
const height = 15;

export default Vue.extend({
  name: "RecoveredBar",
  components: {},
  props: {
    data: Object,
    color: String
  },
  watch: {
    data: function() {
      this.updateAxes();
    }
  },
  computed: {
    recoveredWidth: function() {
      if(this.x){
      return(this.x(this.data.recovered));
    }
    return(null)
    },
    deadWidth: function() {
      if(this.x){
      return(this.x(this.data.dead));
    }
    return(null)
    }
  },
  data() {
    return {
      width,
      height,
      x: null
    }
  },
  methods: {
    updateAxes () {
      this.x = scaleLinear()
      .range([0, this.width])
      .domain([0, this.data.confirmed]);
    }
  },
  mounted() {
    this.updateAxes();
  }
})
</script>

<style lang="scss">
.total-cases {
    fill: $grey-40;
}

.total-cases-outline {
  fill: none;
    stroke: $base-grey;
    stroke-width: 0.5;
    shape-rendering: crispedges;
}

.dead-cases {
  fill: #5a5a5a;
}

.recovered-cases {
  fill: $link-color;
}

</style>
