<template>
  <div class="vis-header">
    <div class="vis-title">
      <h2>{{ title }}</h2>
    </div>
    <div class="vis-date-range">
      <p> {{ `${minDate} - ${maxDate}` }}</p>
    </div>
  </div>  
</template>

<script setup>
  import { computed } from 'vue';
  import { timeFormat, timeParse } from 'd3-time-format';
  
  const props = defineProps({
    title: String,
    dates: Array,
  });

  const formatTime = timeFormat('%b %e, %Y');
  const parseTime = timeParse('%Y-%m-%d');

  const minDate = computed(() => formatTime(parseTime(props.dates[0])));
  const maxDate = computed(() => formatTime(parseTime(props.dates[props.dates.length - 1])));

</script>

<style scoped>
  .vis-header {
    display: flex; 
    margin-left: 50px;
    margin-right: 50px;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(209, 59, 98, 0.5);
  }
  .vis-title h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 0px;
  }
  .vis-date-range p {
    margin-bottom: 0px;
  }
</style>
