<template>
  <div class="row" style="min-height: 75vh">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">outbreak.info license</h1>

        <DataUsage />
        <CiteUs class="mt-5" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const DataUsage = lazyLoad('DataUsage');
const CiteUs = lazyLoad('CiteUs');
</script>
