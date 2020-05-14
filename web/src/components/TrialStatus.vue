<template>
<div>
  <div class="status-container d-flex justify-content-between align-items-center py-1 px-2 my-2">
    <div class="d-flex align-items-center">
      <!-- status -->
      <small class="status">
        {{ status.status }}
      </small>
      <!-- status date -->
      <span class="ml-3" v-if="includeDate">
        <small>
          <i class="far fa-clock text-muted mr-1"></i>
          as of {{ status.statusDate }}
        </small>
      </span>
    </div>
    <small class="text-dark" v-if="status.enrollmentCount">
      {{ status.enrollmentType }} size:
      {{ status.enrollmentCount.toLocaleString() }}
    </small>
  </div>
  <CountryMap :countries="countries" :width="mapWidth" v-if="countries.length"/>
</div>
</template>

<script lang="js">
import Vue from "vue";
import CountryMap from "@/components/CountryMap.vue";
import {
  uniq
} from "lodash";

export default Vue.extend({
  name: "TrialStatus",
  props: {
    status: Object,
    locations: Array,
    includeDate: {
      type: Boolean,
      default: false
    },
    mapWidth: {
      type: Number,
      default: 200
    }
  },
  components: {
    CountryMap
  },
  data() {
    return {
      phaseWidth: 37,
      triangleWidth: 10,
      allPhases: [1, 2, 3, 4],
      spacer: 7,
      height: 17
    };
  },
  watch: {},
  computed: {
    width() {
      return (this.phaseWidth * 5 + this.spacer * 4)
    },
    countries() {
      return (uniq(this.locations.map(d => d.studyLocationCountry).sort((a, b) => a < b ? -1 : 1)));
    }
  },
  methods: {},
});
</script>

<style lang="scss" scoped>
.status-container {
    background: lighten($clinical-trial-color, 32%);
}

.status {
    text-transform: uppercase;
    font-weight: 500;
    color: darken($clinical-trial-color, 15%);
}
</style>
