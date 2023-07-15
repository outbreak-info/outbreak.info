<template>
  <div class="image-container">
    <picture>
      <source 
        media="(min-width: 600px)" 
        :srcset="`${retinaLarge} 2x, ${regularLarge} 1x`"
      >
      <source 
        media="(min-width: 350px)" 
        :srcset="`${retinaSmall} 2x, ${regularSmall} 1x`"
      >
      <img 
        :src="regularSmall"
        :srcset="`${retinaSmall} 2x, ${regularSmall} 1x`"
        :alt="altText"
      >
    </picture>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    image: String,
    altText: String,
  });

  const retinaLarge = computed(() => `/assets/growth-rates/${props.image}@2x.png`);
  const regularLarge = computed(() => `/assets/growth-rates/${props.image}.png`);
  const retinaSmall = computed(() => `/assets/growth-rates/${props.image}_small@2x.png`);
  const regularSmall = computed(() => `/assets/growth-rates/${props.image}_small.png`);
</script>

<style>
  .image-container {
    display: flex;
    justify-content: center;
    margin: 0 auto 35px auto;
  }
</style>
