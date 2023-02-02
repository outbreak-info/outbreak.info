<template>
  <small v-if="lastUpdated$" class="text-muted badge bg-grey__lightest">
    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
    Updated {{ lastUpdated$ }} ago
  </small>
</template>

<script>
import { getDateUpdated } from '@/api/biothings.js';

export default {
  name: 'DataUpdated',
  components: {},
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
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
