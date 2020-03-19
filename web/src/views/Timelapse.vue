<template>
  <div class="timelapse">
    <h1>Cumulative cases over time</h1>
    <SpatiotemporalPlot :data="cases" />
  </div>
</template>

<script>
// @ is an alias to /src
import SpatiotemporalPlot from "@/components/SpatiotemporalPlot.vue";

import { mapState } from "vuex";

import store from "@/store";

export default {
  name: "Timelapse",
  components: {
    SpatiotemporalPlot
  },
  data() {
    return {};
  },
  watch: {},
  computed: {
    ...mapState("admin", ["loading"]),
    // ...mapState("epidata", ["cases"])
  },
  methods: {},
  mounted() {
    console.log(this);
  }
};
</script>

<style lang="scss" scoped></style>
