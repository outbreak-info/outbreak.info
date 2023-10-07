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
          clearable
          :clear-filter-after-select="true"
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
          clearable
          :clear-filter-after-select="true"
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
    <GrSuggestedLineages 
      @suggestion-selected="handleSuggestionSelected"
    />
  </div>
</template>
  
<script setup>
  import { ref, computed, onMounted } from 'vue';
  import _ from 'lodash';
  import { NFormItem, NSelect, NButton } from 'naive-ui'; 
  import { getAllLineageNames, getAllLocationNames } from '@/api/lineage-and-location-names.js';
  import { lazyLoad } from '@/js/lazy-load';

  const GrSuggestedLineages = lazyLoad('GrSuggestedLineages');
    
  const emit = defineEmits(['query-button-clicked']);

  const selectedLineage = ref(null);
  const selectedLocations = ref([]);
  const selectedCountryInfo = ref([]);

  const lineageOptions = ref([]);
  const locationOptions = ref([]);

  const genomicsApiUrl = "https://api.outbreak.info/genomics/";

  const isClearButtonActive = computed(() => setClearButtonStatus(selectedLineage.value, selectedLocations.value));
  const isQueryButtonActive = computed(() => setQueryButtonStatus(selectedLineage.value, selectedLocations.value));

  onMounted(() => {
    getAllLineageNames(genomicsApiUrl).subscribe((results) => {
      lineageOptions.value = generateLineageNamesArray(results);
    }) 
    getAllLocationNames(genomicsApiUrl).subscribe((results) => {
      locationOptions.value = generateLocationNamesArray(results);
    })
  });

  const generateLineageNamesArray = (resultsArray) => {
    const filteredArray = resultsArray.filter(a => !a.includes('*') && a != '');
    const filteredArrayCopy = Array.from(filteredArray);
    const aggregationNamesArray = filteredArrayCopy.map(i => `${i}+`);
    
    filteredArray.push(...aggregationNamesArray);
    filteredArray.sort();

    const lineageNamesArray = filteredArray.map(element => {
      return {
        label: element,
        value: element,
      }
    })
   
    return lineageNamesArray;
  };

  const generateLocationNamesArray = (resultsArray) => {
    const filteredArray = resultsArray.filter(obj => obj.admin_level == 0);

    const countryNamesArray = filteredArray.map(obj => {
      return {
        label: obj.country,
        value: obj.country_id              
      }
    }) 

    countryNamesArray.sort((a, b) => a.label.localeCompare(b.label));

    countryNamesArray.unshift({label: 'Global', value: 'Global'});
    
    return countryNamesArray;
  };

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

  const handleSuggestionSelected = (suggestion) => {
    selectedLineage.value = suggestion;
  }

  const handleLocationUpdate = (ids, countryInfo) => {
    selectedCountryInfo.value = countryInfo;
  }
</script>

<style scoped>
  .gr-form {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
    margin-bottom: 20px;
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
</style>
