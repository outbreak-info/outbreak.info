<template>
  <div class="row m-0 bg-grey">
    <div
      class="col-md-6 col-sm-12 d-flex justify-content-center align-items-center"
    >
      <a href="scripps.edu" rel="noreferrer" target="_blank">
        <img
          src="@/assets/scripps-logo.png"
          width="200px"
          alt="Scripps Research"
        />
      </a>
    </div>
    <div
      class="col-md-6 col-sm-12 d-flex justify-content-center align-items-center"
    >
      <a href="http://sulab.org/" rel="noreferrer" target="_blank">
        <img src="@/assets/sulab-logo.png" width="200px" alt="SuLab" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "Logos"
});
</script>
