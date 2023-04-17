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

<script setup>
import { computed } from 'vue';
import { lazyLoad } from '@/js/lazy-load';

const SituationReportComponent = lazyLoad('SituationReportComponent');

const props = defineProps({
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
});

const selectedLocation = computed(() => {
  return props.selected ? props.selected : 'Worldwide';
});
</script>
