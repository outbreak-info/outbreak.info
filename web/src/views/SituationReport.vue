<template>
  <div class="my-5 mx-4">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="m-0">
        B.1.1.7 Lineage Report
      </h1>
      <div class="d-flex align-items-center">
        Generated using data from
        <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
        </a>
      </div>
    </div>


    <div class="logo-group d-flex align-items-center justify-content-center border-top border-bottom w-100 py-1 my-3">
      <div class="logo mr-4">
        <a href="https://andersen-lab.com/" rel="noreferrer" target="_blank">
          <img src="@/assets/anderson-logo-light.png" class="w-100" alt="Anderson Lab" />
        </a>
      </div>

      <div class="col-sm-2 d-flex justify-content-center align-items-center picBox">
        <a href="https://cvisb.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/cvisb-logo-light.png" class="w-100" alt="CVISB" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://globalhealth.scripps.edu/" rel="noreferrer" target="_blank">
          <img src="@/assets/global-logo-light.png" class="w-100" alt="SDCGH" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://searchcovid.info/" rel="noreferrer" target="_blank">
          <img src="@/assets/search-logo.png" class="w-100" alt="SEARCH Alliance" />
        </a>
      </div>

      <div class="logo mr-4">
        <a href="https://outbreak.info/" rel="noreferrer" target="_blank">
          <img src="@/assets/logo-full-01.svg" class="w-100" alt="outbreak.info" />
        </a>
      </div>
    </div>

    <div>
      <h3>Summary</h3>
    </div>
    <div>
      Sequence
      Expand
      Download
    </div>
    <div>
      Methodology
      Download all GISAID IDs associated with this lineage
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
}
</style>
