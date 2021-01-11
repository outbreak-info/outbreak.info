<template>
<div class="container">
  <div class="row" style="min-height: 75vh;">
    <div class="col-sm-12 my-5">

      <div class="text-left mb-5">
        <h1>Video demos of outbreak.info</h1>
        <div class="row">
          <div class="col-sm-6">
            <h4 class="text-highlight">Explore epidemiology data</h4>
            <video class="w-100 mb-3" controls>
              <source src="@/assets/home/epi_demo.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="col-sm-6">
            <h4 class="text-highlight">Search for COVID-19 and SARS-CoV-2 resources</h4>
            <video class="w-100 mb-3" controls>
              <source src="@/assets/home/resources_demo.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="col-sm-6">
            <h4 class="text-highlight">Filter resources search results</h4>
            <video class="w-100 mb-3" controls>
              <source src="@/assets/home/source_example.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </div>



          <div class="col-sm-6">
            <h4 class="text-highlight">Download search results</h4>
            <video class="w-100 mb-3" controls>
              <source src="@/assets/home/download_example.mp4" type="video/mp4">
              <!-- <source src="@/assets/home/resources_demo.ogv" type="video/ogg"> -->
              Your browser does not support the video tag.
            </video>
          </div>


        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

export default Vue.extend({
  name: "Videos"
});
</script>

<style lang="scss">
.text-highlight {
  color: $warning-color;
}
</style>
