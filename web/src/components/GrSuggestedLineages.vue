<template>
  <div>
    <div 
      v-if="suggestedLineages.length > 0" 
      class="suggestion-container"
    >
      <span>High-growth lineages in the world</span>
      <n-button 
        type="tertiary"
        v-for="lin in suggestedLineages" :key="lin"
        @click="handleSuggestionButtonClick(lin)"
      >
        {{ lin }}
      </n-button>
    </div>
    <div v-else class="spinner-container">
      <font-awesome-icon
        class="fa-pulse fa-2x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { NButton } from 'naive-ui';
  import { getHighestSignificanceLineagesByLocation } from '@/api/significance.js';

  const emit = defineEmits(['suggestion-selected','initial-suggestion-selected']);

  const location = 'Global';
  const numberOfLineages = 5;

  const suggestedLineages = ref([]);
  const selectedSuggestion = ref(null);

  onMounted(() => {
    getLineages();
  });

  const getLineages = () => {
    getHighestSignificanceLineagesByLocation(location, numberOfLineages)
      .then((response) => {
        const apiData = response.data.hits;
        suggestedLineages.value = apiData.map((element) => {
          return element.lin.includes('+') ? (element.lin.replace('+', '*')) :
           element.lin;
        });
        const initialLineageSelection = suggestedLineages.value[0];
        emit('initial-suggestion-selected', initialLineageSelection);
      })
      .catch((e) => {
        console.log(`%c Error in getting ${location} significance data!`, 'color: red');
        console.log(e);
      });
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
  .spinner-container {
    display: flex;
    justify-content: center;
  }
</style>
