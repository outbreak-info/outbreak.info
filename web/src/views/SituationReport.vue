<template>
<div>
<SituationReportComponent :alias="alias" :loc="loc" :muts="muts" :pango="pango"
:xmin="xmin" :xmax="xmax" :overlay="overlay" :selected="selected" />
</div>
</template>

<script>
import Vue from "vue";

export default {
  name: "SituationReport",
  components: {
    SituationReportComponent: () => import( /* webpackPrefetch: true */ "@/components/SituationReportComponent.vue")
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
      default: "false"
    },
    selected: {
      type: String,
      default: "Worldwide"
    }
  }
}
</script>
