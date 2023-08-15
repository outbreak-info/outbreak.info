<template>
  <div class="download-button">
    <n-button 
      type="primary"
      @click="handleDownloadButtonClick"
    >
      Download data
    </n-button>
  </div>
</template>

<script setup>
  import { NButton } from 'naive-ui';

  const props = defineProps({
    loc: String,
    data: Array,
  });

  const handleDownloadButtonClick = () => {
    const csvString = [
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
      ...props.data.map(item => [
        item.date,
        item.label,
        item.lineage,
        item.G_7_linear,
        item.confidenceInterval95,
        item.N_7,
        item.deltaN_7,
        item.Prevalence_7_percentage
      ])
    ]
    .map(element => element.join('\t')) 
    .join("\n");

    const filename = `${props.loc.replace(/\s+/g, '_').toLowerCase()}.tsv`;

    const element = document.createElement('a');

    element.setAttribute('href', 'data:application/tsv;charset=utf-8,' + encodeURIComponent(csvString));
    element.setAttribute('download', filename);
    element.style.display = 'none';
	  document.body.appendChild(element);
    element.click();
	  document.body.removeChild(element);  
  }
</script>
