<template>
  <div class="rates">
    <GrowthRatesCharts 
      v-if="growthData.length > 0" 
      :data="growthData.filter((d => d.location == selectedLocation) && (d => d.lineage == selectedLineage))"
      :selectedLocation="selectedLocation"
      :selectedLineage="selectedLineage"
    />
  </div>
</template>
  
<script setup>
  import { csv } from 'd3-fetch';
  import { ref } from 'vue'
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';
  
  let growthData = ref([]);
  
  let selectedLocation = 'United States';
  // let selectedLineage = 'BA.5.1.18';
  let selectedLineage = 'XBB.1.5.15';
  
  csv('../../data/mockData.csv').then(data => {
      data.forEach(d => {
        d.growth_rate = d.growth_rate * 100;
        d.uncertainty = d.uncertainty * 100;
        d.invUncertainty = +d.invUncertainty;
        d.uncertainty95 = d.uncertainty95 * 100;
        d.uncertainty80 = d.uncertainty80 * 100;
        d.uncertainty65 = d.uncertainty65 * 100;
        d.uncertainty50 = d.uncertainty50 * 100;
        d.uncertainty35 = d.uncertainty35 * 100;
        d.uncertainty20 = d.uncertainty20 * 100;
        d.uncertainty5 = d.uncertainty5 * 100;
        d.intervals = [
          d.uncertainty5,
          d.uncertainty20,
          d.uncertainty35,
          d.uncertainty50,
          d.uncertainty65,
          d.uncertainty80,
          d.uncertainty95,
        ];
        d.prevalence = d.Prevalence_7 * 100;
        d.sequences = d.N_7;
        d.totalSequences = d.deltaN_7;
      });
      growthData.value = data;
  });

</script>

<style>
  .rates {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    user-select: none; 
  }
</style>
  