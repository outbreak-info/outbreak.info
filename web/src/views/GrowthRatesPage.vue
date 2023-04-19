<template>
  <h1>Hello there!</h1>
</template>

<script setup>
import { onMounted } from 'vue'

console.log("test");

// lifecycle hooks
onMounted(() => {
  console.log(`I'm the growth rates page`)
})
</script>

