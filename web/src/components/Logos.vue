<template>
<div>
  <div class="row m-0 bg-grey d-flex justify-content-center align-items-center">
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href="http://sulab.org/" rel="noreferrer" target="_blank">
        <img src="@/assets/sulab-logo.png" class="w-100" alt="SuLab" />
      </a>
    </div>
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href="http://wulab.io/" rel="noreferrer" target="_blank">
        <img src="@/assets/wu-logo.png" class="w-100" alt="WuLab" />
      </a>
    </div>
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">
        <img src="@/assets/anderson-logo.png" class="w-100" alt="Anderson Lab" />
      </a>
    </div>
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href="https://www.scripps.edu/" rel="noreferrer" target="_blank">
        <img src="@/assets/scripps-logo.png" class="w-100" alt="Scripps Research" />
      </a>
    </div>
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href="https://cvisb.org/" rel="noreferrer" target="_blank">
        <img src="@/assets/cvisb-logo.png" class="w-100" alt="CVISB" />
      </a>
    </div>
    <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
      <a href=" https://globalhealth.scripps.edu/" rel="noreferrer" target="_blank">
        <img src="@/assets/global-logo.png" class="w-100" alt="SDCGH" />
      </a>
    </div>

    <div class="h-100 border-left pl-3 d-flex flex-column justify-content-center align-items-center">
      <small class="text-light xsmall">Supported with funding from</small>
      <div class="d-flex">
        <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
          <a href="https://www.niaid.nih.gov/" rel="noreferrer" target="_blank">
            <img src="@/assets/niaid.png" class="w-100" alt="NIAID" />
          </a>
        </div>
        <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
          <a href="https://ctsa.ncats.nih.gov/cd2h/" rel="noreferrer" target="_blank">
            <img src="@/assets/cd2h.png" class="w-100" alt="CD2H" />
          </a>
        </div>
      </div>
    </div>
  </div>



  <div class="row m-0 bg-main__darker d-flex justify-content-center align-items-center py-1" id="terms">
    <div class="d-flex text-light xsmall">
      <ul class="m-0">
        <li class="d-inline m-3">
          <router-link class="text-light" :to="{name: 'Citation'}">How to Cite</router-link>
        </li>
        <li class="d-inline m-3">
          <router-link class="text-light" to="/privacy">Privacy Policy</router-link>
        </li>
        <li class="d-inline m-3">
          <router-link class="text-light" to="/terms">Terms</router-link>
        </li>
        <li class="d-inline m-3">
          All content copyright
          <a href="http://sulab.org/" target="_blank" rel="noreferrer" class="mx-1 white-underline">
            SuLab</a>
          &copy; <span v-text="year"></span>
        </li>
        <li class="d-inline m-3">
          All rights reserved
        </li>
      </ul>

    </div>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "Logos",
  data() {
    return {
      year: ""
    };
  },
  mounted() {
    var self = this;
    var currentTime = new Date();
    self.year = currentTime.getFullYear();
  }
});
</script>

<style>
.picBox {
  max-width: 150px;
}

.xsmall {
  font-size: x-small;
}

#terms {
  /* background-color: #3a4c5f !important; */
  background-color: #415365 !important;
}

.white-underline {
  text-decoration: underline;
  color: white !important;
}
</style>
