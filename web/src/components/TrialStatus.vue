<template>
<div>
  <div class="d-flex flex-column mb-3" ref="map" :style="{width: mapWidth + 'px'}">
    <div class="status-container d-flex justify-content-between align-items-center py-1 px-2 mt-2">
      <div class="d-flex align-items-center">
        <!-- status -->
        <small class="status">
          {{ status.status }}
        </small>
        <!-- status date -->
        <span class="ml-3" v-if="includeDate">
          <small>
            <font-awesome-icon class="mr-1 text-muted" :icon="['far', 'clock']" />
            as of {{ status.statusDate }}
          </small>
        </span>
      </div>

      <small class="text-dark" v-if="status.enrollmentCount">
        {{ status.enrollmentType }} size:
        {{ status.enrollmentCount.toLocaleString() }}
      </small>
    </div>
    <small v-if="status.whyStopped" class="status-stopped  px-2">
      Why stopped: {{status.whyStopped}}
    </small>
  </div>
  <CountryMap :countries="countries" :width="mapWidth" v-if="countries.length" />
</div>
</template>

<script lang="js">
import Vue from "vue";
import CountryMap from "@/components/CountryMap.vue";
import uniq from "lodash/uniq";

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
  name: "TrialStatus",
  props: {
    status: Object,
    setWidth: Number,
    locations: Array,
    includeDate: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CountryMap,
    FontAwesomeIcon
  },
  data() {
    return {
      mapWidth: null
    };
  },
  watch: {},
  mounted() {
    if (this.setWidth) {
      this.mapWidth = this.setWidth
    } else {
      const targetWidth = this.$refs.map.clientWidth * 0.85;
      this.mapWidth = targetWidth > 600 ? 600 : targetWidth;
    }
  },
  computed: {
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
    font-weight: 700;
    color: darken($clinical-trial-color, 15%);
}

.status-stopped {
    color: white;
    background: $clinical-trial-color;
}
</style>
