<template>
  <p>{{ loc }}</p>
</template>

<script setup>
  const props = defineProps({
    loc: String,
    data: Array,
    xAccessor: Function,
    yAccessor: Function,
    xScale: Function,
    yScale: Function,
    colorScale: Function,
    margin: Object,
    width: Number,
    innerWidth: Number,
    innerHeight: Number,
  });

  console.log("scatter loc", props.loc);
  console.log("scatter data", props.data);
  console.log("scatter xScale", props.xScale.domain());
  console.log("scatter yScale", props.yScale.domain());
  console.log("scatter colorScale", props.colorScale.domain());
  console.log("scatter margin", props.margin);
  console.log("scatter width", props.width);
  console.log("scatter innerWidth", props.innerWidth);
  console.log("scatter innerHeight", props.innerHeight);
</script>


