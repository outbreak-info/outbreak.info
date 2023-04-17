<template>
  <div>
    <h4 class="">Citing this report</h4>
    <section id="outbreak-citation" class="my-3 border-top pt-3">
      <p class="mt-2" v-html="genomicsCitation" />
    </section>
    <section id="gisaid-citation">
      <b>GISAID’s Role in Pandemic Response</b>
      . Khare, S.,
      <i>et al.</i>
      (2021). China CDC Weekly, 3(49): 1049-1051. doi:
      <a href="http://dx.doi.org/10.46234/ccdcw2021.255" target="_blank">
        10.46234/ccdcw2021.255
      </a>
      PMCID:
      <a
        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8668406/"
        target="_blank"
      >
        8668406
      </a>
    </section>
    <ShareReport :title="title" :url="url" class="mt-3" />
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const ShareReport = lazyLoad('ShareReport');

const props = defineProps({
  title: String,
  mutationAuthors: String,
  genomicsCitation: String,
  url: String,
  today: String,
});
</script>
