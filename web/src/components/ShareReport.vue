<template>
<div class="d-flex w-100 justify-content-end text-muted mb-2">
  <font-awesome-icon class="ml-3" :icon="['fas', 'share']" />
  <font-awesome-icon class="ml-3" :icon="['fab', 'twitter']" />
  <font-awesome-icon class="ml-3" :icon="['fas', 'envelope']" />
  <font-awesome-icon class="ml-3" :icon="['fas', 'link']" />
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
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faLink,
  faShare,
  faEnvelope,
  faSync
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter
} from "@fortawesome/free-brands-svg-icons";

library.add(faLink, faShare, faEnvelope, faTwitter);

export default Vue.extend({
  name: "ShareReport",
  props: {
    title: String,
    url: String
  },
  components: {
    FontAwesomeIcon
  }
})
</script>
