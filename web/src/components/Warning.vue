<template>
  <div
    class="alert bg-highlight text-light p-2 row m-0 rounded-0"
    :class="{ 'scale-in-center': animate }"
  >
    <div
      class="col-sm-1 d-flex justify-content-center align-items-center text-center"
    >
      <font-awesome-icon class="pr-2 fa-2x" :icon="['fas', 'exclamation-circle']"/>
    </div>
    <div
      class="col-sm-11 d-flex justify-content-center align-items-center text-center"
    >
      <p class="m-0" v-html="text"></p>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faExclamationCircle);

export default Vue.extend({
  name: "Warning",
  props: {
    text: String,
    animate: Boolean
  },
  components: {
    FontAwesomeIcon
  }
});
</script>
