<template>
  <div>
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup>
  const props = defineProps({
    data: Array,
  });

  const title = `${props.data[0].lineage} grow rates in the ${props.data[0].location}`;

  console.log("data received by child component", props.data);
</script>