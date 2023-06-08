<template>
  <div class="introduction">
    <div class="intro-copy">
      <h1>Growth rates</h1>
      <p>
        The <span class="bold">relative growth rate of a lineage</span> shows if said lineage is growing or shrinking compared to the background in a location, averaged over seven days. A high growth rate is a good heuristic for importance as fast-growing lineages are more likely to become variants of concern. Furthermore, growth rates allow for direct comparison across divergent data sets.
      </p>
      <p>
        For each lineage-location pair, we employ three charts to visualize growth rate data: a <span class="bold">scatterplot</span>, a <span class="bold">line chart</span> and a <span class="bold">stripe chart</span>. 
      </p>
      <n-collapse arrow-placement="right">
        <n-collapse-item title="Read more" name="1">
          <div>
            <p>
              The <span class="bold">scatterplot</span> shows growth rate variation over time, whereas
                the <span class="bold">line chart</span> depicts lineage prevalence over time. <span class="bold">Stripes</span> colored according to growth rate values are the background of the line chart. The line-stripe combination provides a different vantage point into the lineage dynamics.
            </p>
            <p>
              <span class="bold">95% confidence intervals</span>, depicted as grey vertical bars in the scatterplot, convey information on the uncertainty associated with growth rates measurements.
            </p>
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
    margin: 20px 50px 0px 50px;
  }
  .bold {
    font-weight: 700;
  }
</style>
