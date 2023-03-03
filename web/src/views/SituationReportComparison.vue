<template>
  <div>
    <LineageComparisonComponent
      :pango="pango"
      :nthresh="nthresh"
      :dark="dark"
      :gene="gene"
    />
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const LineageComparisonComponent = lazyLoad('LineageComparisonComponent');

const props = defineProps({
  pango: [Array, String],
  threshold: {
    type: [Number, String],
    default: 75,
  },
  nthresh: {
    type: [Number, String],
    default: 1,
  },
  dark: {
    type: [String, Boolean],
    default: false,
  },
  gene: {
    type: [Array, String],
    default: () => ['ORF1a', 'ORF1b', 'S'],
  },
});
</script>

<style lang="scss" scoped></style>
