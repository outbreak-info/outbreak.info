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
import { onMounted } from 'vue';
import { lazyLoad } from '@/js/lazy-load';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

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

onMounted(() => {
  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});
</script>

<style lang="scss" scoped></style>
