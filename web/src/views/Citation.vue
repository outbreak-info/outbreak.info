<template>
  <div style="min-height: 75vh">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">How to cite outbreak.info</h1>
        <DataUsage />
        <CiteUs class="mt-3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const CiteUs = lazyLoad('CiteUs');
const DataUsage = lazyLoad('DataUsage');
</script>
