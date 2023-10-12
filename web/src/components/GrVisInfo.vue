<template>
  <div class="vis-info">
    <div class="location-info">
      <h4>{{  loc  }}</h4>
      <p>{{ `${dataPoints} data points` }}</p>
    </div>
    <div class="download-button">
      <n-button 
        type="primary"
        @click="handleDownloadButtonClick"
      >
        Download data
      </n-button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { NButton } from 'naive-ui';

  const props = defineProps({
    loc: String,
    data: Array,
  });

  const dataPoints = computed(() => props.data.length);

  const handleDownloadButtonClick = () => {
    const tsvString = [
      [
        'date',
        'location',
        'lineage',
        'growth_rate',
        'growth_rate_ci95',
        'lineage_sequences',
        'total_sequences',
        'prevalence'
      ],
      ...props.data.map(element => [
        element.date,
        element.label,
        element.lineageLabel,
        element.G_7_linear,
        element.confidenceInterval95,
        element.N_7,
        element.deltaN_7,
        element.Prevalence_7_percentage
      ])
    ]
    .map(element => element.join('\t')) 
    .join("\n");

    const filename = `${props.loc.replace(/\s+/g, '_').toLowerCase()}.tsv`;

    const element = document.createElement('a');

    element.setAttribute('href', 'data:application/tsv;charset=utf-8,' + encodeURIComponent(tsvString));
    element.setAttribute('download', filename);
    element.style.display = 'none';
	  document.body.appendChild(element);
    element.click();
	  document.body.removeChild(element);  
  }
</script>

<style scoped>
  .vis-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .location-info h4 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .location-info p {
    font-size: 14px;
    font-weight: 400;
  }
</style>
