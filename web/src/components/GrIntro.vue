<template>
  <div class="introduction">
    <div class="intro-copy">
      <p>
        The relative <span class="bold"> growth rate </span> of a lineage shows if said lineage is growing or shrinking compared to the background in a location, averaged over seven days. A positive relative growth rate indicates that a lineage may have a competitive advantage, and could eventually become a variant of interest.
      </p>
      <n-collapse arrow-placement="right">
        <n-collapse-item title="Read more" name="1">
          <div>
            <h2>Growth rate visualizations</h2>
            <p>
              For each lineage-location pair, we employ a visualization comprised of a <span class="bold">scatterplot</span> and a <span class="bold">line-stripe chart</span> to display growth rate data. 
            </p>
            <p>
              A diverging <span class="bold">color scale</span> encodes growth rates. Shades of <span class="bold">yellow</span> correspond to mid-range growth rates, whereas dark <span class="bold">blue</span> and dark <span class="bold">red</span> are associated with low and high extremes, respectively. The middle value of the scale is 0%.
            </p> 
            <p>
              For each location and lineage, the <span class="bold">scatterplot</span> presents growth rates over time. Its dots are filled according to the color scale.
            </p>
            <p>
              Growth rates measurements are statistical estimates and their precision varies with data conditions. <span class="bold">95% confidence intervals (CIs)</span>, depicted as grey vertical bars in the scatterplot, present information on the uncertainty associated with said measurements. <span class="bold">Horizontal dark grey lines</span> indicate that the CI bar has been cut off. 
            </p>
            <p>
              The <span class="bold">line-stripe chart</span> shows both lineage prevalence and growth rates over time. The line conveys prevalence variation. Stripes, colored according to the diverging scale, present growth rates.
            </p>
            <p>
              Scatterplots help visitors compare growth rates visually, whereas stripes illuminate data trends. 
            </p>
            <h2>How growth rates are calculated</h2>
            <h2>Data gaps</h2>
          </div>
        </n-collapse-item>
      </n-collapse>
      <n-divider />
    </div>
  </div>
</template>

<script setup>
  import { NCollapse, NCollapseItem, NDivider } from 'naive-ui'
</script>

<style scoped>
  .introduction {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }
  .intro-copy {
    margin: 30px 50px 0px 50px;
  }
  .bold {
    font-weight: 700;
  }
  h1 {
    margin-bottom: 20px;
  }
</style>
