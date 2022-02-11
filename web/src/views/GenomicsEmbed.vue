<template>
  <div class="home flex-column align-left">
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']"/>
    </div>


    <Logos />
  </div>
</template>
<script>
// @ is an alias to /src
import Logos from "@/components/Logos.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner);

import { mapState } from "vuex";

export default {
  name: "GenomicsEmbed",
  components: {
    Logos,
    FontAwesomeIcon
  },
  props: {
    location: String
  },
  data() {
    return {
    };
  },
  watch: {
  },
  computed: {
    ...mapState("admin", ["loading"])
  },
  methods: {
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped></style>
