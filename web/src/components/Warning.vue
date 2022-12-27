<template>
  <div
    class="alert bg-highlight text-light px-2 py-1 m-0 rounded-0 d-flex align-items-center"
    :class="{ 'scale-in-center': animate }"
    data-cy="wrapper"
  >
    <div
      class="d-flex justify-content-center align-items-center text-center ml-1"
      data-cy="icon-wrapper"
    >
      <font-awesome-icon
        class="pr-2 fa-2x"
        :icon="['fas', 'exclamation-circle']"
      />
    </div>
    <div
      class="d-flex justify-content-center align-items-center"
      :class="[align_left ? 'text-left' : 'text-center']"
      data-cy="text-wrapper"
    >
      <p class="m-0" v-html="text"></p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'Warning',
  components: {},
  props: {
    text: String,
    align_left: Boolean,
    animate: Boolean,
  },
});
</script>
