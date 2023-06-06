<template>
  <div></div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useNotification } from "naive-ui";

  const props = defineProps({
    lineage: String,
    data: Array,
  });

  const notification = useNotification();

  const locationCount = ref(props.data.length);

  const titleString = `No data for ${locationCount.value} ${locationCount.value > 1 ? "locations" : "location"}`;

  const locationNamesArray = ref((props.data.map(obj => obj.label)).sort());

  const locationNamesString = locationCount.value > 1 ?
    `${locationNamesArray.value.slice(0,-1).join(', ')} and ${locationNamesArray.value.slice(-1)}`
    : locationNamesArray.value.toString();
    
  const contentString = `${props.lineage} growth rates not available for ${locationNamesString}. Sequence counts by variant, case and death counts and population are used to compute growth rates. These data sources are not always available.`;
 
  onMounted(() => {
    showMessage();
  });

  const showMessage = () => {
    notification.create({
      title: titleString,
      content: contentString,
    })
  }
</script>
