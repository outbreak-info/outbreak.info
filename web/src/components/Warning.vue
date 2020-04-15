<template>
  <div
    class="alert bg-highlight text-light p-2 row m-0 rounded-0"
    :class="{ 'scale-in-center': animate }"
  >
    <div
      class="col-sm-1 d-flex justify-content-center align-items-center text-center"
    >
      <i class="fas fa-exclamation-circle pr-2"></i>
    </div>
    <div
      class="col-sm-11 d-flex justify-content-center align-items-center text-center"
    >
      <p class="m-0" v-html="text">
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "Warning",
  props: {
    text: String,
    animate: Boolean
  }
});
</script>
