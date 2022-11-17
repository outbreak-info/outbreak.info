<template>
  <small v-if="lastUpdated$" class="text-muted badge bg-grey__lightest">
    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
    Updated {{ lastUpdated$ }} ago
  </small>
</template>

<script>
import Vue from 'vue';
// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock } from '@fortawesome/free-regular-svg-icons';

import { getDateUpdated } from '@/api/biothings.js';

library.add(faClock);

export default Vue.extend({
  name: 'DataUpdated',
  components: {
    FontAwesomeIcon,
  },
  props: {},
  data() {
    return {};
  },
  watch: {},
  methods: {},
  subscriptions() {
    return {
      lastUpdated$: getDateUpdated(this.$apiurl),
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
