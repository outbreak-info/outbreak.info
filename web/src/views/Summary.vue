<template>
  <div class="home flex-column align-left">
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <!-- EPI CURVE SUMMARIES -->
    <section id="regional-epi-curves" class="mt-5">
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
import { mapState } from 'vuex';

import { getGlanceSummary } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

export default {
  name: 'Summary',
  components: {
    GlanceSummary: lazyLoad('GlanceSummary'),
    Logos: lazyLoad('Logos'),
    DataSource: lazyLoad('DataSource'),
  },
  props: {
    location: String,
  },
  data() {
    return {
      glanceSummaries: [],
      glanceLocations: null,
      dataSubscription: null,
    };
  },
  computed: {
    ...mapState('admin', ['loading']),
  },
  watch: {
    location: {
      immediate: true,
      handler(newValue, oldValue) {
        this.glanceLocations = newValue ? newValue.split(';') : [];
        this.getData();
      },
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.dataSubscription = getGlanceSummary(
        this.$apiurl,
        this.$genomicsurl,
        this.glanceLocations,
      ).subscribe((d) => {
        this.glanceSummaries = this.sortSummaries(d);
      });
    },
    sortSummaries(data) {
      if (this.glanceLocations && this.glanceLocations.length > 0) {
        data.sort(
          (a, b) =>
            this.glanceLocations.indexOf(a.location_id) -
            this.glanceLocations.indexOf(b.location_id),
        );
      }
      return data;
    },
  },
};
</script>

<style lang="scss" scoped></style>
