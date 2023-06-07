<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <GrowthRatesIntro />
      <GrowthRatesForm 
        @query-button-clicked="handleQueryButtonClick"
      />
      <div class="rates">
        <GrowthRatesCharts
          v-if="flatData.length > 0"
          :data="flatData"
        />
      </div> 
      <GrowthRatesWarning
        v-if="locationsWithoutApiData.length > 0"
        :lineage="chosenLineage"
        :data="locationsWithoutApiData"
      />
      <n-back-top :right="100">
        <div class="back-top">
          Back to top
        </div>
      </n-back-top>
      <GrowthRatesAcknowledgements />
    </n-notification-provider>
  </n-config-provider>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import _ from 'lodash';
  import { NConfigProvider, NNotificationProvider, NBackTop } from 'naive-ui'
  import GrowthRatesForm from '@/components/GrowthRatesForm.vue';
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';
  import GrowthRatesWarning from '@/components/GrowthRatesWarning.vue';
  import GrowthRatesIntro from '@/components/GrowthRatesIntro.vue'
  import GrowthRatesAcknowledgements from '@/components/GrowthRatesAcknowledgements.vue';
 
  const themeOverrides = {
    common: {
      primaryColor: '#D13B62',
      primaryColorHover: '#86203A',
      primaryColorPressed: '#86203A', 
    },
    Collapse: {
      titleFontSize: '16px',
      fontSize: '16px',
      titleTextColor: '#D13B62',
      arrowColor: '#D13B62',
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
  const apiDataWithLabels = ref([]);
  const flatData = ref([]);
  const locationsWithoutApiData = ref([]);

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
    locationsWithoutApiData.value = [];
    const locationString = `(${chosenLocations.value.join(' OR ')})`;
    const url = `${growthRateApiUrl}query?q=lineage:${chosenLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
        locationsWithoutApiData.value = findLocationsWithoutData(apiData.value);
      });
  }
 
  const flattenArray = (nestedArray) => {
    apiDataWithLabels.value = nestedArray.map(x => {
      return { ...x, label: chosenLocationInfo.value.find(y => x.location === y.value)?.label }
    });
    
    const result = _.flatMap(apiDataWithLabels.value, ({ _id, _score, lineage, location, label, values }) =>
      _.map(values, value => ({ _id, _score, lineage, location, label, ...value })));  
    return result;
  }

  const findLocationsWithoutData = () => {
    const locationsWithData = apiDataWithLabels.value.map(obj => {
      return {
        label: obj.label,
        value: obj.location,
      }
    })
    const locationsWithoutData = chosenLocationInfo.value.filter(({ value: id1 }) => !locationsWithData.some(({ value: id2 }) => id2 === id1));
    return locationsWithoutData;
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

  .back-top {
    width: 150px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-family: 'DM Sans', 'Avenir', 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    color: #2c3e50;
  }
</style>
  