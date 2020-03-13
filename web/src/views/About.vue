<template>
  <div class="full-page d-flex justify-content-center align-items-center bg-grey text-light">
    <div class="container">
      <h1>About</h1>
      <img src="@/assets/logo-full-white-01.svg" alt="Outbreak.info">
      <p class="align-left focustext">
        During outbreaks of emerging diseases such as COVID-19, efficiently
        collecting, sharing, and integrating data is critical to scientific
        research.
      </p>
      <p class="align-left focustext">
        <b>outbreak.info</b> is a project from the
       <a href="http://sulab.org/" rel="noreferrer" target="_blank">Su lab</a> at
       <a href="scripps.edu" rel="noreferrer" target="_blank"
         >Scripps Research</a
       >
       to aggregate all this information into a single location.
      </p>
      <div class="row m-0">
        <div class="col-md-6 col-sm-12 d-flex justify-content-center align-items-center">
          <a href="scripps.edu" rel="noreferrer" target="_blank">
            <img src="@/assets/scripps-logo.png" width="200px" alt="Scripps Research">
          </a>
        </div>
        <div class="col-md-6 col-sm-12 d-flex justify-content-center align-items-center">
          <a href="http://sulab.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/sulab-logo.png" width="200px" alt="SuLab">
          </a>
        </div>
      </div>

      <div class="jumbotron rounded bg-grey__darker">
        <h4 class="text-light m-2">
          Notice a bug, know of a
          COVID-19 data source, or want to suggest a feature?
          <svg viewBox="0 0 100 3">
            <line x1="0" y1="0" x2="100" stroke="#D13B62" />
          </svg>
          <a class="btn btn-outline-light mt-5"
            href="https://github.com/SuLab/outbreak.info/issues"
            rel="noreferrer"
            target="_blank"
            >Submit an issue on Github</a
          >
        </h4>
      </div>
    </div>
  </div>
</template>
