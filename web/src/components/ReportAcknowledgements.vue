<template>
  <div class="text-left my-4">
    <small>
      <div>
        We are grateful to the data contributors who shared the data used in
        this Web Application via the GISAID Initiative: the Authors, the
        Originating Laboratories responsible for obtaining the specimens, and
        the Submitting Laboratories that generated the genetic sequences and
        metadata. All data in GISAID are subject to GISAID’s
        <a
          href="https://www.gisaid.org/registration/terms-of-use/"
          target="_blank"
        >
          Terms and Conditions
        </a>
        .
      </div>
      <div class="my-2">
        Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy:
        GISAID’s innovative contribution to global health.
        <em>Global Challenges</em>
        , 1:33-46. DOI:
        <a href="http://dx.doi.org/10.1002/gch2.1018" target="_blank">
          10.1002/gch2.1018
        </a>
        PMCID:
        <a
          href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/"
          target="_blank"
        >
          31565258
        </a>
      </div>
      <div v-if="funding" class="my-4">
        This work was supported by the
        <span v-for="(grant, idx) in funding" :key="idx">
          <span v-if="grant.funder.name">{{ grant.funder.name }}</span>
          (
          <span v-if="grant.url">
            <a :href="grant.url" target="_blank">{{ grant.identifier }}</a>
          </span>
          <span v-else>{{ grant.identifier }}</span>
          )
          <span v-if="idx < funding.length - 2">,</span>
          <span v-if="idx === funding.length - 2">{{ ', and ' }}</span>
        </span>
        .
      </div>
    </small>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { adminStore } from '@/stores/adminStore';

const store = adminStore();
const { funding } = storeToRefs(store);
</script>
