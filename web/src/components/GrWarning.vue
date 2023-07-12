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

  const titleString = `No visualizations for ${locationCount.value} ${locationCount.value > 1 ? "locations" : "location"}`;

  const locationNamesString = locationCount.value > 1 ?
    `${props.data.slice(0,-1).join(', ')} and ${props.data.slice(-1)}`
    : props.data.toString();

  const contentString = `${props.lineage} growth rates visualizations for ${locationNamesString} could not be built. Please refer to the growth rates page for further information.`
 
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
