<template>
  <small class="text-muted badge bg-grey__lightest" v-if="lastUpdated$"
    ><font-awesome-icon  class="mr-1" :icon="['far', 'clock']"/> Updated {{ lastUpdated$ }} ago
  </small>
</template>

<script lang="js">
import Vue from "vue";
import { getDateUpdated } from "@/api/biothings.js";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";

library.add(faClock);

export default Vue.extend({
  name: "DataUpdated",
  props: {},
  data() {
    return {};
  },
  watch: {},
  components: {
      FontAwesomeIcon
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
