<template>
  <div class="home flex-column align-left">
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']"/>
    </div>

    <!-- EPI CURVE SUMMARIES -->
    <section class="mt-5" id="regional-epi-curves">
      <div class="row d-flex justify-content-center">
        <GlanceSummary
          v-for="(location, idx) in glanceSummaries"
          :key="idx"
          class="d-flex mx-2 mb-3"
          :data="location"
          :idx="location.location_id"
          :deletable="false"
        />
      </div>

      <DataSource />
    </section>

    <Logos />
  </div>
</template>
<script>
// @ is an alias to /src
import GlanceSummary from "@/components/GlanceSummary.vue";
import Logos from "@/components/Logos.vue";
import DataSource from "@/components/DataSource.vue";
import { getGlanceSummary } from "@/api/genomics.js";

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
  name: "Summary",
  components: {
    GlanceSummary,
    Logos,
    DataSource,
    FontAwesomeIcon
  },
  props: {
    location: String
  },
  data() {
    return {
      glanceSummaries: [],
      glanceLocations: null,
      dataSubscription: null
    };
  },
  watch: {
    location: {
      immediate: true,
      handler(newValue, oldValue) {
        this.glanceLocations = newValue ? newValue.split(";") : [];
        this.getData();
      }
    }
  },
  computed: {
    ...mapState("admin", ["loading"])
  },
  methods: {
    getData() {
      this.dataSubscription = getGlanceSummary(
        this.$apiurl, this.$genomicsurl,
        this.glanceLocations
      ).subscribe(d => {
        this.glanceSummaries = this.sortSummaries(d);
      });
    },
    sortSummaries(data) {
      if (this.glanceLocations && this.glanceLocations.length > 0) {
        data.sort(
          (a, b) =>
            this.glanceLocations.indexOf(a.location_id) -
            this.glanceLocations.indexOf(b.location_id)
        );
      }
      return data;
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style lang="scss" scoped></style>
