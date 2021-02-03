<template>
<div class="container text-left my-5">
  <section id="caveat-overview">
  <h1 class="m-0">
    SARS-CoV-2 Mutation Situation Report Caveats
  </h1>
  <p class="mt-3 w-75">
    To describe the prevalence of sets of mutations in our <router-link :to="{name: 'SituationReports'}">Mutation Situation Reports</router-link>, we rely on shared virus sequences from the <a href="https://www.gisaid.org/" target="_blank">GISAID
      Initiative</a>. These sequences are a sample of the total number of cases &mdash; often a biased sample &mdash; and do not represent the true prevalence of the mutations in the population.
  </p>

  <p class="w-75">
    Additionally, sequencing techniques can bias this sampling. For instance, the majority of <router-link :to="{ name:'SituationReport', params: { mutation: 'B.1.1.7'} }">B.1.1.7 genomes</router-link> identified in the United States to date were identified by S-gene target failures (SGTF)
    in community-based diagnostic PCR testing.
    SGTF indicates a deletion mutation that is one of several mutations able to distinguish the B.1.1.7 from other SARS-CoV-2 strains.
    Estimates of true prevalence in the U.S. are discussed in the <a href="https://blog.helix.com/b117-variant-updated-data/ target='_blank'">Helix Research blog</a>.
  </p>
  </section>
</div>
</template>
