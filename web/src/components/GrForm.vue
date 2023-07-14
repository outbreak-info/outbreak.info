<template>
  <div class="gr-form">
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
      <div class="query-buttons">
        <n-button 
          type="primary"
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
    <div class="suggestion-container">
      <span>Suggested lineages</span>
      <n-button 
        type="tertiary"
        v-for="lin in significantLineages.sort()" :key="lin"
        @click="handleSuggestionButtonClick(lin)"
      >
        {{ lin }}
      </n-button>
    </div>
    <div class="anchor-container">
      <n-anchor ref="anchorRef">
        <n-anchor-link title="Read about growth rates" @click="scrollTo('#notes')" />
      </n-anchor>
      <hr class="divider" />
    </div> 
  </div>
</template>
  
<script setup>
  import { ref, computed } from 'vue';
  import _ from 'lodash';
  import { NFormItem, NSelect, NButton, NAnchor, NAnchorLink} from 'naive-ui'
  import { findPangolin, findLocation } from '@/api/genomics.js';
    
  const emit = defineEmits(['query-button-clicked']);

  const anchorRef = ref(null);

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

  const significantLineages = ['XBB.1.5', 'XBB.1.9.1', 'XBB.1.16', 'XBB.1.16.2', 'XBB.2.3', 'EG.1', 'FL.4', 'FU.1'];

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

  const handleSuggestionButtonClick = (suggestion) => {
    selectedLineage.value = suggestion;
  }

  const handleLocationUpdate = (ids, countryInfo) => {
    selectedCountryInfo.value = countryInfo;
  }

  const scrollTo = (href) => {
    anchorRef.value?.scrollTo(href);
  };
</script>

<style scoped>
  .gr-form {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
    margin-bottom: 10px;
  }
  .selector-container {
    display: flex; 
    flex-flow: row wrap;
    align-items: flex-end;
    margin-left: 50px;
    margin-right: 50px;
    margin-bottom: 15px;
    gap: 10px;
  }
  .lineage {
    flex: 1 1 auto; 
    text-align: left;
  }
  .location {
    flex: 8 1 auto; 
  }
  .query-buttons {
    display: flex; 
    gap: 5px;
  }
  .suggestion-container {
    display: flex; 
    flex-flow: row wrap;
    margin-left: 50px;
    margin-right: 50px;
    gap: 5px;
    font-size: 14px;
  }
  .suggestion-container span {
    margin-top: 7px;
    margin-right: 10px;
  }
  .anchor-container {
    margin-top: 15px;
    margin-left: 50px;
    margin-right: 50px;
  }
  .divider {
    border-top: 1px solid rgba(209, 59, 98, 0.2);
    border-bottom: 1px solid rgba(209, 59, 98, 0.5);
    margin-top: 25px;
    margin-bottom: 0px;
  }
</style>
