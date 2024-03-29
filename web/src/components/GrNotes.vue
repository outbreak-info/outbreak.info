<template>
  <div id="notes" class="notes">
    <div class="notes-copy">
      <h2>About growth rates</h2>
      <h3>How growth rates are calculated</h3>
      <p>
        Growth rates are calculated by comparing the number of sequences lineage detected in a location to the number of sequences of other lineages, and to the same quantities from the previous week. Simple models are used to correct for local variation in reporting conditions based on population and reported case and death counts, and to estimate the uncertainty in our growth-rates measurements.
      </p>
      <p>
        <a 
          href="/assets/growth-rates/growth_rates.pdf"
          target="_blank"
        >
          Detailed information on growth rate calculations
        </a> 
      </p>
      <h3>Growth rate visualizations</h3>
      <p>
        For each lineage-location pair, we employ a visualization comprised of a <span class="bold">scatterplot</span> and a <span class="bold">line-stripe chart</span> to display growth rate data. Scatterplots help visitors compare growth rates visually, whereas stripes illuminate data trends. 
      </p>
      <GrImage 
        image="grVisWithAnnotations"
        altText="Growth rate chart comprising a scatterplot and a line-stripe chart. Chart elements are annotated."
      />
      <p>
        A diverging <span class="bold">color scale</span> encodes growth rates.
        Dark <span class="bold">blue</span> and dark <span class="bold">red</span> are associated with extreme negative and positive growth rates, respectively. Shades of <span class="bold">yellow</span> correspond to mid-range growth rates. Yellow encodes the middle value of the scale, i.e. 0%. A 0% growth rate means that the lineage is neither growing nor shrinking compared to the background in a location.
      </p> 


      <GrImage 
        image="colorScale"
        altText="Growth rate chart in which the color scale is highlighted"
      />
      <p>
        For each location and lineage, the <span class="bold">scatterplot</span> presents growth rates over time. Its dots are filled according to the color scale. Growth rates measurements are statistical estimates and their precision varies with data conditions. <span class="bold">95% confidence intervals (CIs)</span>, depicted as grey vertical bars in the scatterplot, present information on the uncertainty associated with said measurements. <span class="bold">Horizontal dark grey lines</span> indicate that CI bars have been cut off. 
      </p>
      <GrImage 
          image="scatterplot"
          altText="Growth rate chart in which the color scale and the scatterplot are highlighted. Text labels show one CI bar and one clipped CI bar."
      />
      <p>
        The <span class="bold">line-stripe chart</span> shows both lineage prevalence and growth rates over time. The line conveys prevalence variation. Stripes, colored according to the diverging scale, present growth rates.
      </p>
      <GrImage 
        image="lineStripeChart"
        altText="Growth rate chart in which the color scale and the line-stripe chart are highlighted"
      />
      <p>
        Hovering over charts causes <span class="bold">tooltips</span> to appear. Each tooltip presents information about the associated data point, namely growth rate and 95% CI, prevalence, number of lineage sequences, number of background sequences and ratio over background. The background is the difference between the number of total sequences and the number of lineage sequences divided by the number of lineage sequences.
      </p>
      <h3>Data gaps</h3>
      <p>
        Growth rates are only calculated when a lineage is detected in sequence data from a location consistently over a one-week interval; as a result of limitations in sequencing coverage, gaps may exist in our growth-rates data estimates, especially for low-prevalence lineages. It is appropriate to assume that lineage growth rates vary continuously over time, and tend towards zero during sequencing gaps. 
      </p>
    </div>
  </div>
</template>

<script setup>
  import { lazyLoad } from '@/js/lazy-load';

  const GrImage = lazyLoad('GrImage');
  
</script>
  
<style scoped>
  .notes {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }
  .notes h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .notes h3 {
    font-size: 20px;
    font-weight: 700;
    margin-top: 25px;
    margin-bottom: 15px;
  }
  .notes-copy {
    margin: 0px 50px 0px 50px;
    padding-top: 20px;
    border-top: 1px solid rgba(209, 59, 98, 0.5);
  }
  .bold {
    font-weight: 700;
  }
</style>
  