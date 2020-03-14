<template>
  <small class="text-muted badge bg-grey__lightest" v-if="lastUpdated"
    >Last updated {{ lastUpdated }} ago
  </small>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  name: "DataUpdated",
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {
    ...mapState("epidata", ["dateUpdated"]),
    lastUpdated() {
      let lastUpdated = null;
      if (this.dateUpdated) {
        const updatedDiff = (new Date() - this.dateUpdated) / (60 * 60 * 1000);

        if (updatedDiff < 1) {
          lastUpdated = `${Math.round(updatedDiff * 60)}m`;
        } else {
          lastUpdated = `${Math.round(updatedDiff)}h`;
        }
      }
      return lastUpdated;
    }
  },
  methods: {}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
