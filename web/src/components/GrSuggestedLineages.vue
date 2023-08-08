<template>
  <div 
    v-if="suggestedLineages.length > 0" 
    class="suggestion-container"
  >
    <span>Suggested lineages</span>
    <n-button 
      type="tertiary"
      v-for="lin in suggestedLineages.sort()" :key="lin"
      @click="handleSuggestionButtonClick(lin)"
    >
      {{ lin }}
    </n-button>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { NButton } from 'naive-ui';
  import { getHighestSignificanceLineages } from '@/api/significance.js';
  import _ from 'lodash';

  const emit = defineEmits(['suggestion-selected']);

  const suggestedLineages = ref([]);
  const selectedSuggestion = ref(null);

  const handpickedLocations = ['CAN', 'GBR', 'JPN', 'KOR', 'CHE', 'USA', 'ZAF']; 
  const lineagesPerHandpickedLocation = 5;
  const numberOfSuggestions = 5;

  onMounted(() => {
    getData();
  });

  const getData = async () => {
    const apiData = await getHighestSignificanceLineages(handpickedLocations, lineagesPerHandpickedLocation);

    // create array with lineage and significance columns only
    const lineageSignificanceArray = apiData.map(element => {
      return {
        lin: element.lin,
        sig: +element.sig,
      }
    });

    // add up lineage significances
    const aggregatedArray = _(lineageSignificanceArray)
      .groupBy('lin')
      .map((objs, key) => ({
        'lin': key,
        'sig': _.sumBy(objs, 'sig'), 
      }))
      .value();

    // select lineages with highest significances
    const topLineageSignificancePairs = aggregatedArray.sort((a, b) => b.sig - a.sig).slice(0, numberOfSuggestions);

    suggestedLineages.value = topLineageSignificancePairs.map(element => { return element.lin; });
  }

  const handleSuggestionButtonClick = (suggestion) => {
    selectedSuggestion.value = suggestion;
    emit('suggestion-selected', selectedSuggestion.value);
  };
</script>

<style scoped>
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
</style>
