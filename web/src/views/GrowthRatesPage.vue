<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <GrowthRatesForm 
      @query-button-clicked="handleQueryButtonClick"
    />
    <div class="rates">
      <GrowthRatesCharts
        v-if="flatData.length > 0"
        :data="flatData"
      />
    </div> 
  </n-config-provider>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import _ from 'lodash';
  import { NConfigProvider } from 'naive-ui'
  import GrowthRatesForm from '@/components/GrowthRatesForm.vue';
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';
 
  const themeOverrides = {
    common: {
      primaryColor: '#D13B62',
      primaryColorHover: '#86203A' 
    },
  };

  const props = defineProps({
    pango: {
      type: String,
      default: 'XBB.1.5.15',
    },
    locations: {
      type: Array,
      default() {
        return [
          {
            label: 'Canada',
            value: 'CAN',
          },
          {
            label: 'United States',
            value: 'USA'
          }
        ];  
      },
    }
  });

  const chosenLineage = ref(props.pango);
  const chosenLocations = ref(props.locations.map(obj => obj.label))
  const chosenLocationInfo = ref(props.locations);
    
  const growthRateApiUrl = "https://api.outbreak.info/growth_rate/";
   
  const apiData = ref([]);
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
  
  onMounted(() => {
    const locationString = `(${props.locations.map(obj => obj.value).join(' OR ')})`
    const url = `${growthRateApiUrl}query?q=lineage:${chosenLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      });
    chosenLineage.value = null;
    chosenLocations.value = [];
  });

  const handleQueryButtonClick = ({ lineage, locations, locationsInfo }) => {
    chosenLineage.value = lineage;
    chosenLocations.value = locations;
    chosenLocationInfo.value = locationsInfo;
    getGrowthRateData();
  }

  const getGrowthRateData = () => {
    const locationString = `(${chosenLocations.value.join(' OR ')})`;
    const url = `${growthRateApiUrl}query?q=lineage:${chosenLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      });
  }
 
  const flattenArray = (nestedArray) => {
    const arrayWithLabels = nestedArray.map(x => {
      return { ...x, label: chosenLocationInfo.value.find(y => x.location === y.value)?.label }
    });
    const result = _.flatMap(arrayWithLabels, ({ _id, _score, lineage, location, label, values }) =>
      _.map(values, value => ({ _id, _score, lineage, location, label, ...value })));  
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
  