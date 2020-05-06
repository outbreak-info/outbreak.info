<template>
  <div>
    <div
      class="row m-0 bg-grey d-flex justify-content-center align-items-center"
    >
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="http://sulab.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/sulab-logo.png" class="w-100" alt="SuLab" />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="http://wulab.io/" rel="noreferrer" target="_blank">
          <img src="@/assets/wu-logo.png" class="w-100" alt="WuLab" />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">
          <img
            src="@/assets/anderson-logo.png"
            class="w-100"
            alt="Anderson Lab"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="https://www.scripps.edu/" rel="noreferrer" target="_blank">
          <img
            src="@/assets/scripps-logo.png"
            class="w-100"
            alt="Scripps Research"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="https://cvisb.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/cvisb-logo.png" class="w-100" alt="CVISB" />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href=" https://globalhealth.scripps.edu/"
          rel="noreferrer"
          target="_blank"
        >
          <img src="@/assets/global-logo.png" class="w-100" alt="SDCGH" />
        </a>
      </div>
    </div>
    <div
      class="row m-0 bg-main__darker d-flex justify-content-center align-items-center"
    >
      <div
        class="col-sm-12 d-flex justify-content-center align-items-center p-2"
      >
        <small class="text-light">Supported with funding from</small>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a href="https://www.niaid.nih.gov/" rel="noreferrer" target="_blank">
          <img src="@/assets/niaid.png" class="w-100" alt="NIAID" />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://ctsa.ncats.nih.gov/cd2h/"
          rel="noreferrer"
          target="_blank"
        >
          <img src="@/assets/cd2h.png" class="w-100" alt="CD2H" />
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "Logos"
});
</script>

<style>
.picBox {
  max-width: 150px;
}
</style>
