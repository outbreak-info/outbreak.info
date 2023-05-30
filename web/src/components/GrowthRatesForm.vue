<template>
  <div>
    <div class="selector-container">
      <n-form-item
        label="Lineage" 
        class="lineage"
    >
        <n-select
          v-model:value="selectedLineage"
          filterable
          placeholder="Type to search"
          :options="lineageOptions"
          :loading="lineageLoading"
          clearable
          remote
          :clear-filter-after-select="true"
          @search="handleLineageSearch"
        />
      </n-form-item>
      <n-form-item 
        label="Location(s)"
        class="location"
      >
        <n-select
          v-model:value="selectedLocations"
          @update:value="handleLocationUpdate"
          filterable
          multiple
          placeholder="Type to search"
          :options="locationOptions"
          :loading="locationLoading"
          clearable
          remote
          :clear-filter-after-select="true"
          @search="handleLocationSearch"
        />
      </n-form-item>
    </div>
    <div class="button-container">
      <n-button 
        strong secondary type="primary"
        :disabled="!isClearButtonActive"
        @click="handleClearButtonClick"
      >
        Clear selections
      </n-button>
      <n-button 
        type="primary"
        :disabled="!isQueryButtonActive"
        @click="handleQueryButtonClick"
      >
        Build charts
      </n-button>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, computed } from 'vue';
  import _ from 'lodash';
  import { NFormItem, NSelect, NButton} from 'naive-ui'
  import { findPangolin, findLocation } from '@/api/genomics.js';
    
  const emit = defineEmits(['query-button-clicked']);

  const selectedLineage = ref(null);
  const selectedLocations = ref([]);
  const selectedCountryInfo = ref([]);

  const lineageOptions = ref([]);
  const lineageLoading = ref(false);
  const lineageQuerySubscription = ref(null);  
  const lineageMatches = ref([]);

  const locationOptions = ref([]);
  const locationLoading = ref(false);
  const locationQuerySubscription = ref(null);  
  const locationMatches = ref([]);

  const genomicsApiUrl = "https://api.outbreak.info/genomics/";

  const isClearButtonActive = computed(() => setClearButtonStatus(selectedLineage.value, selectedLocations.value));
  const isQueryButtonActive = computed(() => setQueryButtonStatus(selectedLineage.value, selectedLocations.value));
   
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
    emit('query-button-clicked', {
      lineage: selectedLineage.value,
      locations: selectedLocations.value,
      locationsInfo: selectedCountryInfo.value,
    });
  }

  const handleLocationUpdate = (ids, countryInfo) => {
    selectedCountryInfo.value = countryInfo;
  }
</script>

<style>
  .selector-container {
    display: flex; 
    flex-flow: row wrap;
    margin: 20px 50px 0px 50px;
    gap: 15px;
  }

  .lineage {
    flex: 1 1 auto; 
    text-align: left;
  }

  .location {
    flex: 8 1 auto; 
  }

  .button-container {
    display: flex; 
    flex-flow: row wrap;
    justify-content: center;
    gap: 15px;
  }
</style>
  