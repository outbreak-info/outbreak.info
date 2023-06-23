<template>
  <div class="notes">
    <div class="notes-copy">
      <h2>How growth rates are calculated</h2>
      <p>
        Growth rates are calculated by comparing the number of sequences lineage detected in a location to the number of sequences of other lineages, and to the same quantities from the previous week. Simple models are used to correct for local variation in reporting conditions based on population and reported case and death counts, and to estimate the uncertainty in our growth-rates measurements.
      </p>
      <h2>Data gaps</h2>
      <p>
        Growth rates are only calculated when a lineage is detected in sequence data from a location consistently over a one-week interval; as a result of limitations in sequencing coverage, gaps may exist in our growth-rates data estimates, especially for low-prevalence lineages. It is appropriate to assume that lineage growth rates vary continuously over time, and tend towards zero during sequencing gaps. Please refer to this document for more details.
      </p>
      <p>
        Gaps may also result from design choices as we remove outliers to keep the y-scale of the scatterplots constant and make growth rate variations over time more noticeable.
      </p>
    </div>
  </div>
</template>
  
<style scoped>
  .notes {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }
  .notes-copy {
    margin: 10px 50px 0px 50px;
  }
</style>
  