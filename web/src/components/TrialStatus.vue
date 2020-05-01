<template>
  <div>
    <div class="status-container d-flex justify-content-between py-1 px-2 my-2">
      <small class="status">
        {{status.status}}
      </small>
      <small class="text-dark">
        {{status.enrollmentType}} size: {{status.enrollmentCount.toLocaleString()}}
      </small>
    </div>
    <CountryMap :countries="['Jordan']"/>
  </div>
</template>

<script lang="js">
import Vue from "vue";
import CountryMap from "@/components/CountryMap.vue";

export default Vue.extend({
  name: "TrialStatus",
  props: {
    status: Object
  },
  components: {
    CountryMap
  },
  data() {
    return {
      phaseWidth: 37,
      triangleWidth: 10,
      allPhases: [1, 2, 3, 4],
      spacer: 7,
      height: 17
    };
  },
  watch: {},
  computed: {
    width() {
      return (this.phaseWidth * 5 + this.spacer * 4)
    }
  },
  methods: {},
});
</script>

<style lang="scss" scoped>
.status-container {
    background: lighten($clinical-trial-color, 32%);
}

.status {
  text-transform: uppercase;
  font-weight: 500;
  color: darken($clinical-trial-color, 15%);
}

</style>
