<template>
  <div
    class="alert bg-highlight text-light px-2 py-1 m-0 rounded-0 d-flex align-items-center"
    :class="{ 'scale-in-center': animate }"
  >
    <div
      class="d-flex justify-content-center align-items-center text-center ml-1"
    >
      <font-awesome-icon
        class="pr-2 fa-2x"
        :icon="['fas', 'exclamation-circle']"
      />
    </div>
    <div
      class="d-flex justify-content-center align-items-center"
      :class="[align_left ? 'text-left' : 'text-center']"
    >
      <p class="m-0" v-html="text"></p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  text: String,
  align_left: Boolean,
  animate: Boolean,
});
</script>
