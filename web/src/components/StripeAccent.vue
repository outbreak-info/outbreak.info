<template>
  <svg :width="width" :height="height" class="mr-1">
    <rect
      :width="width"
      :height="height"
      x="0"
      y="0"
      :class="[className, 'light']"
    />
    <polygon
      :points="`0,0 ${width},0 ${width},${height * (2 / 3) - 2.5} 0,${
        height * (2 / 3) + 2.5
      }`"
      :class="className"
    />
    <polygon
      :points="`0,0 ${width},0 ${width},${height / 3 - 2.5} 0,${
        height / 3 + 2.5
      }`"
      :class="[className, 'dark']"
    />
  </svg>
</template>

<script setup>
const props = defineProps({
  width: {
    type: Number,
    default: 6,
  },
  height: {
    type: Number,
    default: 25,
  },
  className: String,
});
</script>

<style lang="scss">
svg {
  min-width: 6px;
}
</style>
