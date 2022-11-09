<template>
  <div>
    <LineageComparisonComponent
      :pango="pango"
      :nthresh="nthresh"
      :dark="dark"
      :sub="sub"
      :gene="gene"
    />
  </div>
</template>

<script>
export default {
  name: 'SituationReportComparison',
  components: {
    LineageComparisonComponent: () =>
      import(
        /* webpackPrefetch: true */ '@/components/LineageComparisonComponent.vue'
      ),
  },
  props: {
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
    sub: {
      type: [String, Boolean],
      default: false,
    },
    gene: {
      type: [Array, String],
      default: () => ['ORF1a', 'ORF1b', 'S'],
    },
  },
};
</script>

<style lang="scss" scoped></style>
