<template>
<div class="container text-left my-5">
  <h1 class="m-0">
    How to interpret SARS-CoV-2 Mutation Situation Reports
  </h1>
  <section id="caveat-overview" class="my-4">
    <h3>Caveats &amp; Limitations</h3>
    <p class="mt-3 w-75">
      To describe the prevalence of sets of mutations in our <router-link :to="{name: 'SituationReports'}">Mutation Situation Reports</router-link>, we rely on shared virus sequences from the <a href="https://www.gisaid.org/" target="_blank">GISAID
        Initiative</a>. These sequences are a sample of the total number of cases &mdash; often a biased sample &mdash; and may not represent the true prevalence of the mutations in the population. In general, it is important to note that case numbers for any given lineage/mutation can be significantly affected by overall case numbers and rates of genomic sequencing at any given location. 
    </p>

    <p class="w-75">
      Additionally, sequencing techniques can heavily bias this sampling. For instance, the majority of <router-link :to="{ name:'SituationReport', params: { mutation: 'B.1.1.7'} }">B.1.1.7 genomes</router-link> identified in the United States to date were
      identified by S-gene target failures (SGTF)
      in community-based diagnostic PCR testing - a test that specifically identifies genomes such as B.1.1.7. 
      SGTF indicates a deletion mutation that is one of several mutations able to distinguish the B.1.1.7 from other SARS-CoV-2 strains.
      Estimates of true prevalence in the U.S. are discussed in the <a href="https://blog.helix.com/b117-variant-updated-data/ target='_blank'">Helix Research blog</a>.
    </p>
      
    <p class="w-75">
      Quantitative information presented in all reports rely on the accuracy of data deposited to <a href="https://www.gisaid.org/" target="_blank">GISAID</a> and the subsequent analysis carried out using <a href="https://github.com/andersen-lab/bjorn" target="_blank">Bjorn</a>.
    </p>
  </section>
  <section id="methods" class="d-flex w-75 justify-content-center my-5">
    <router-link :to="{name: 'SituationReportMethodology'}"><button class="btn btn-main">View methods</button></router-link>
  </section>
</div>
</template>
