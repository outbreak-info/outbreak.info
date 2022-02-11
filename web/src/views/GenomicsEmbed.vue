<template>
<div class="home flex-column align-left">
  <LocationReportComponent />


  <Logos />
</div>
</template>

<script>
// @ is an alias to /src
import Logos from "@/components/Logos.vue";

export default {
  name: "GenomicsEmbed",
  components: {
    LocationReportComponent: () => import( /* webpackPrefetch: true */ "@/components/LocationReportComponent.vue"),
    Logos
  },
  props: {
    loc: String
  },
  data() {
    return {};
  },
  watch: {},
  computed: {
  },
  methods: {},
  mounted() {}
};
</script>

<style lang="scss" scoped></style>
