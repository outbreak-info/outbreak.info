<template>
  <small v-if="lastUpdated" class="text-muted badge bg-grey__lightest">
    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
    Updated {{ lastUpdated }} ago
  </small>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';

import { getDateUpdated } from '@/api/biothings.js';

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const lastUpdated = ref(null);
const dataSubscription = ref(null);

const getData = () => {
  dataSubscription.value = getDateUpdated(apiUrl).subscribe(
    (result) => (lastUpdated.value = result),
  );
};

onMounted(() => {
  getData();
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
