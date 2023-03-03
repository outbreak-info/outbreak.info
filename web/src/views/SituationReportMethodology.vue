<template>
  <div class="container text-left my-5">
    <h1 class="m-0">SARS-CoV-2 (hCov-19) Mutation Situation Methodology</h1>
    <section id="methodology" class="">
      <ReportMethodology class="w-75" />
    </section>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const ReportMethodology = lazyLoad('ReportMethodology');
</script>
