<template>
  <div class="rates">
    <GrowthRatesCharts
      v-if="flatData.length > 0"
      :data="flatData"
    />
  </div>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import _ from 'lodash';
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';

  let apiData = ref([]);
  const flatData = ref([]);

  axios.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${
        import.meta.env.VITE_APP_API_ACCESS
      }`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  const host = "https://api.outbreak.info/";
  const prefix = "growth_rate/";
  const hardLineage = "XBB.1.5.15";
  const hardLocations = "(CAN OR GBR OR NLD OR USA)";
  const url = `${host}${prefix}query?q=lineage:${hardLineage} AND location:${hardLocations}`;

  onMounted(() => {
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      })
  });

  const flattenArray = (nestedArray) => {
    const result = _.flatMap(nestedArray, ({ _id, _score, lineage, location, values }) =>
    _.map(values, value => ({ _id, _score, lineage, location, ...value })));
    return result;
  }
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
  