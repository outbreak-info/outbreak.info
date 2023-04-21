<template>
  <h1>Hello there!</h1>
</template>

<script setup>
import { csv } from 'd3-fetch';

let growthData;

let country = 'United States';
let lineage = 'BA.5.1.18';

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
      growthData = data.filter((d => d.location == country) && (d => d.lineage == lineage))
    });
    console.log(growthData);
});
</script>

