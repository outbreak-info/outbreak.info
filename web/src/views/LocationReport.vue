<template>
  <div>
    <LocationReportComponent
      :loc="loc"
      :muts="muts"
      :pango="pango"
      :alias="alias"
      :variant="variant"
      :xmin="xmin"
      :xmax="xmax"
      :dark="dark"
      :selected="selected"
    />
  </div>
</template>

<script>
import { lazyLoad } from '@/js/lazy-load';

export default {
  name: 'LocationReport',
  components: {
    LocationReportComponent: lazyLoad('LocationReportComponent'),
  },
  props: {
    loc: String,
    muts: [Array, String],
    pango: [Array, String],
    alias: [Array, String],
    variant: [Array, String],
    xmin: String,
    xmax: String,
    dark: {
      type: [String, Boolean],
      default: true,
    },
    selected: {
      type: [Array, String],
      default: () => [],
    },
  },
};
</script>

<style lang="scss" scoped></style>
