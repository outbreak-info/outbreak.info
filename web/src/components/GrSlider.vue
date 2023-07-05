<template>
  <div class="slider-container">
    <n-form-item
      label="min gr-uncertainty ratio"
      label-placement="left"
    >
      <n-slider 
        v-model:value="sliderSelectedValue" 
        @update:value="handleSnrUpdate"
        :marks="sliderMarks"
        :min="0"
        :max="15"
        :step="0.5" 
      />
   </n-form-item>
</div>
</template>

<script setup>
  import { ref } from 'vue';
  import { NFormItem, NSlider} from 'naive-ui';

  const emit = defineEmits(['slider-value-updated']);

  const sliderSelectedValue = ref(0);

  const sliderMarks = {
    0: '0',
    2.5: '2.5',
    5: '5',
    7.5: '7.5',
    10: '10',
    12.5: '12.5',
    15: '15',
  }

  const handleSnrUpdate = () => {
    emit('slider-value-updated', sliderSelectedValue.value);
  }
</script>

<style>
  .slider-container {
    max-width: 345px;
    margin-left: 50px;
    margin-right: 30px;
    margin-bottom: 20px;
    font-size: 13px;
  }
</style>
