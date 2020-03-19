<template>
  <small class="text-muted badge bg-grey__lightest" v-if="lastUpdated$"
    ><i class="far fa-clock"></i> Updated {{ lastUpdated$ }} ago
  </small>
</template>

<script lang="ts">
import Vue from "vue";
import { getDateUpdated } from "@/api/biothings.js";

export default Vue.extend({
  name: "DataUpdated",
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {
  },
  methods: {},
  subscriptions () {
    return {
      lastUpdated$: getDateUpdated(this.$apiurl)
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
