<template>
  <div class="bg-grey" data-cy="footer-logos">
    <div
      class="row m-0 d-flex justify-content-center align-items-center"
      data-cy="footer-logos-wrapper"
    >
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="http://sulab.org/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-sulab"
        >
          <img
            src="@/assets/sulab-logo.png"
            class="w-100"
            alt="SuLab"
            data-cy="sulab-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="http://wulab.io/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-wulab"
        >
          <img
            src="@/assets/wu-logo.png"
            class="w-100"
            alt="WuLab"
            data-cy="wulab-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://andersen-lab.com/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-andersen-lab"
        >
          <img
            src="@/assets/anderson-logo.png"
            class="w-100"
            alt="Anderson Lab"
            data-cy="andersen-lab-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://www.scripps.edu/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-scripps"
        >
          <img
            src="@/assets/scripps-logo.png"
            class="w-100"
            alt="Scripps Research"
            data-cy="scripps-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://cvisb.org/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-cvisb"
        >
          <img
            src="@/assets/cvisb-logo.png"
            class="w-100"
            alt="CVISB"
            data-cy="cvisb-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://globalhealth.scripps.edu/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-global-health"
        >
          <img
            src="@/assets/global-logo.png"
            class="w-100"
            alt="SDCGH"
            data-cy="global-health-image"
          />
        </a>
      </div>
      <div
        class="col-sm-2 d-flex justify-content-center align-items-center picBox"
      >
        <a
          href="https://searchcovid.info/"
          rel="noreferrer"
          target="_blank"
          data-cy="footer-logo-searchcovid"
        >
          <img
            src="@/assets/search-logo.png"
            class="w-100"
            alt="SEARCH Alliance"
            data-cy="searchcovid-image"
          />
        </a>
      </div>

      <div
        class="col-sm-3 d-flex flex-column justify-content-center p-0 z pl-3 border-left"
      >
        <div class="text-light x-small text-left">
          Supported with funding from
        </div>

        <div class="d-flex">
          <!-- <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
          <a href="https://www.niaid.nih.gov/" rel="noreferrer" target="_blank">
            <img src="@/assets/niaid.png" class="w-100" alt="NIAID" />
          </a>
        </div> -->

          <div
            class="col-sm-6 d-flex justify-content-center align-items-center picBox"
          >
            <a
              href="https://www.niaid.nih.gov/"
              rel="noreferrer"
              target="_blank"
              data-cy="footer-logo-niaid"
            >
              <img
                src="@/assets/niaid.png"
                class="w-100"
                alt="NIAID"
                data-cy="niaid-image"
              />
            </a>
          </div>
          <div
            class="col-sm-6 d-flex justify-content-center align-items-center picBox"
          >
            <a
              href="https://ctsa.ncats.nih.gov/cd2h/"
              rel="noreferrer"
              target="_blank"
              data-cy="footer-logo-cd2h"
            >
              <img
                src="@/assets/cd2h.png"
                class="w-100"
                alt="CD2H"
                data-cy="cd2h-image"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- <div class="col-sm-4 d-flex flex-column justify-content-center">
      <div class="pl-3 border-left">
        <small class="text-light xsmall text-left pt-2">Supported with funding from</small>
        <div class="d-flex">
          <div class="col-sm-6 d-flex justify-content-center align-items-center picBox pl-0">
            <a href="https://www.niaid.nih.gov/" rel="noreferrer" target="_blank">
              <img src="@/assets/niaid.png" class="w-100" alt="NIAID" />
            </a>
          </div>
          <div class="col-sm-6 d-flex justify-content-center align-items-center picBox">
            <a href="https://ctsa.ncats.nih.gov/cd2h/" rel="noreferrer" target="_blank">
              <img src="@/assets/cd2h.png" class="w-100" alt="CD2H" />
            </a>
          </div>
        </div>
      </div>
    </div> -->
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'Logos',
});
</script>

<style>
.picBox {
  max-width: 150px;
}

.x-small {
  font-size: smaller;
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
