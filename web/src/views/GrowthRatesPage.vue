<template>
  <div>
    <n-space vertical>
      <n-select
        v-model:value="selectedLineage"
        filterable
        placeholder="Type to select lineages"
        :options="lineageOptions"
        :loading="lineageLoading"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="handleLineageSearch"
      />
      <n-select
        v-model:value="selectedLocations"
        @update:value="handleLocationUpdate"
        filterable
        multiple
        placeholder="Type to select locations"
        :options="locationOptions"
        :loading="locationLoading"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="handleLocationSearch"
      />
      <n-button 
        :disabled="!isClearButtonActive"
        @click="handleClearButtonClick"
      >
        Clear selections
      </n-button>
      <n-button 
        :disabled="!isQueryButtonActive"
        @click="handleQueryButtonClick"
      >
        Build charts
      </n-button>
    </n-space>
    <div class="rates">
      <GrowthRatesCharts
        v-if="flatData.length > 0"
        :data="flatData"
      />
    </div>
  </div>
</template>
  
<script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import _ from 'lodash';
  import { NSpace, NSelect, NButton} from 'naive-ui'
  import { findPangolin, findLocation } from '@/api/genomics.js';
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';
 
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
    
  const selectedLineage = ref(props.pango);
  const selectedLocations = ref(props.locations.map(obj => obj.label));
  const selectedCountryInfo = ref(props.locations);

  const lineageOptions = ref([]);
  const lineageLoading = ref(false);
  const lineageQuerySubscription = ref(null);  
  const lineageMatches = ref([]);

  const locationOptions = ref([]);
  const locationLoading = ref(false);
  const locationQuerySubscription = ref(null);  
  const locationMatches = ref([]);

  const genomicsApiUrl = "https://api.outbreak.info/genomics/";
  const growthRateApiUrl = "https://api.outbreak.info/growth_rate/";

  const isClearButtonActive = computed(() => setClearButtonStatus(selectedLineage.value, selectedLocations.value));
  const isQueryButtonActive = computed(() => setQueryButtonStatus(selectedLineage.value, selectedLocations.value));
   
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
    const url = `${growthRateApiUrl}query?q=lineage:${selectedLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      });
    selectedLineage.value = null;
    selectedLocations.value = [];
  });
   
  const handleLineageSearch = (query) => {
    if (!query.length) {
      lineageOptions.value = [];
      return;
    }
    lineageLoading.value = true;
    window.setTimeout(() => {
      lineageQuerySubscription.value = 
      findPangolin(genomicsApiUrl, query).subscribe((results) => {
        lineageMatches.value = results;
        lineageOptions.value = lineageMatches.value.map(obj => {
          return {
            label: obj.name,
            value: obj.name              
          }
        })       
        lineageLoading.value = false;
      }, 1e3);
    });           
  }

  const handleLocationSearch = (query) => {
    if (!query.length) {
      locationOptions.value = [];
      return;
    }
    locationLoading.value = true;
    window.setTimeout(() => {
      locationQuerySubscription.value = 
      findLocation(genomicsApiUrl, query).subscribe((results) => {
        locationMatches.value = results.filter(obj => obj.admin_level == 0);  
        locationOptions.value = locationMatches.value.map(obj => {
          return {
            label: obj.country,
            value: obj.country_id              
          }
        })     
        locationLoading.value = false;
      }, 1e3);
    });           
  }

  const setClearButtonStatus = (lineage, locations) => {
    if (lineage || locations.length > 0) {
      return true;
    }
    else return false;
  }

  const setQueryButtonStatus = (lineage, locations) => {
    if (lineage && locations.length > 0) {
      return true;
    }
    else return false;
  }

  const handleClearButtonClick = () => {
    selectedLineage.value = null;
    selectedLocations.value = [];
  }

  const handleQueryButtonClick = () => {
    getGrowthRateData(selectedLineage.value, selectedLocations.value);
  }

  const handleLocationUpdate = (ids, countryInfo) => {
    selectedCountryInfo.value = countryInfo;
  }

  const getGrowthRateData = () => {
    const locationString = `(${selectedLocations.value.join(' OR ')})`;
    const url = `${growthRateApiUrl}query?q=lineage:${selectedLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      });
  }
 
  const flattenArray = (nestedArray) => {
    const arrayWithLabels = nestedArray.map(x => {
      return { ...x, label: selectedCountryInfo.value.find(y => x.location === y.value)?.label }
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
  