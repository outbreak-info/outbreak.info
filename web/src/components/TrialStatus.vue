<template>
  <div>
    <div
      ref="map"
      class="d-flex flex-column mb-3"
      :style="{ width: mapWidth + 'px' }"
    >
      <div
        class="status-container d-flex justify-content-between align-items-center py-1 px-2 mt-2"
      >
        <div class="d-flex align-items-center">
          <!-- status -->
          <small class="status">
            {{ status.status }}
          </small>
          <!-- status date -->
          <span v-if="includeDate" class="ml-3">
            <small>
              <font-awesome-icon
                class="mr-1 text-muted"
                :icon="['far', 'clock']"
              />
              as of {{ status.statusDate }}
            </small>
          </span>
        </div>

        <small v-if="status.enrollmentCount" class="text-dark">
          {{ status.enrollmentType }} size:
          {{ status.enrollmentCount.toLocaleString() }}
        </small>
      </div>
      <small v-if="status.whyStopped" class="status-stopped px-2">
        Why stopped: {{ status.whyStopped }}
      </small>
    </div>
    <CountryMap
      v-if="countries.length"
      :countries="countries"
      :width="mapWidth"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import uniq from 'lodash/uniq';

import { lazyLoad } from '@/js/lazy-load';

const CountryMap = lazyLoad('CountryMap');

const props = defineProps({
  status: Object,
  setWidth: Number,
  locations: Array,
  includeDate: {
    type: Boolean,
    default: false,
  },
});

const mapWidth = ref(null);
const map = ref(null);

const countries = computed(() => {
  return uniq(
    props.locations
      .map((d) => d.studyLocationCountry)
      .sort((a, b) => (a < b ? -1 : 1)),
  );
});
onMounted(() => {
  if (props.setWidth) {
    mapWidth.value = props.setWidth;
  } else {
    const targetWidth = map.value.clientWidth * 0.85;
    mapWidth.value = targetWidth > 600 ? 600 : targetWidth;
  }
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
