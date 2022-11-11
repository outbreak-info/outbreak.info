<template>
  <div class="row" style="min-height: 75vh;">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">
          outbreak.info license
        </h1>

        <DataUsage />
        <CiteUs class="mt-5" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import DataUsage from '@/components/DataUsage.vue';
import CiteUs from '@/components/CiteUs.vue';

export default Vue.extend({
  name: 'License',
  components: {
    DataUsage,
    CiteUs,
  },
});
</script>
