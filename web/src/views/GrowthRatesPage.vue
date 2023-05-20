<template>
  <div>
    <n-space vertical>
      <n-select 
        v-model:value="selectedLineage"
        size="large"
        filterable
        placeholder="Select lineage"
        :options="lineageOptions" 
      />
      <n-select 
        v-model:value="selectedLocations"
        size="large"
        filterable
        multiple
        placeholder="Select location(s)"
        :options="locationOptions" 
      />
      <n-button 
        :disabled="!isClearButtonActive"
        @click="handleClearButtonClick"
      >
        Clear selection
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
  import GrowthRatesCharts from '@/components/GrowthRatesCharts.vue';
  import { NSpace, NSelect, NButton} from 'naive-ui'

  const props = defineProps({
    pango: {
      type: String,
      default: 'XBB.1.5.15',
    },
    locations: {
      type: Array,
      default() {
        return ['CAN', 'GBR', 'USA'];
      },
    }
  });

  const host = "https://api.outbreak.info/";
  const prefix = "growth_rate/";

  const apiData = ref([]);
  const flatData = ref([]);

  const selectedLineage = ref(props.pango);
  const selectedLocations = ref(props.locations);

  const isClearButtonActive = computed(() => setClearButtonStatus(selectedLineage.value, selectedLocations.value));
  const isQueryButtonActive = computed(() => setQueryButtonStatus(selectedLineage.value, selectedLocations.value));
  
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

  const getGrowthRateData = () => {
    const locationString = `(${selectedLocations.value.join(' OR ')})`;
    const url = `${host}${prefix}query?q=lineage:${selectedLineage.value} AND location:${locationString}`;
    axios
      .get(url)
      .then((response) => {
        apiData.value = response.data.hits;
        flatData.value = flattenArray(apiData.value);
      });
  }

  const lineageOptions = [
    {
      label: "CH.1.1",
      value: "CH.1.1",
    },
    {
      label: "XBB.1.5.15",
      value: "XBB.1.5.15"
    },
    {
      label: "XBB.1.5.16",
      value: "XBB.1.5.16"
    },
  ];

  const locationOptions = [
    {
      label: "CAN",
      value: "CAN",
    },
    {
      label: "GBR",
      value: "GBR"
    },
    {
      label: "NLD",
      value: "NLD"
    },
    {
      label: "USA",
      value: "USA"
    },
  ];

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
    getGrowthRateData();
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
  