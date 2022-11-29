<template>
  <div>
    <SituationReportComponent
      :alias="alias"
      :loc="loc"
      :muts="muts"
      :pango="pango"
      :xmin="xmin"
      :xmax="xmax"
      :overlay="overlay"
      :selected="selectedLocation"
    />
  </div>
</template>

<script>
import { lazyLoad } from '@/js/lazy-load';

export default {
  name: 'SituationReport',
  components: {
    SituationReportComponent: lazyLoad('SituationReportComponent'),
  },
  props: {
    alias: String,
    loc: [Array, String],
    muts: [Array, String],
    pango: String,
    xmin: String,
    xmax: String,
    overlay: {
      type: [String, Boolean],
      default: 'false',
    },
    selected: {
      type: String,
      default: 'Worldwide',
    },
  },
  computed: {
    selectedLocation() {
      return this.selected ? this.selected : 'Worldwide';
    },
  },
};
</script>
