<template>
  <div class="container text-left my-5">
    <h1 class="m-0">How to interpret SARS-CoV-2 Variant Reports</h1>
    <section id="caveat-overview" class="my-4 w-75">
      <h3>Caveats &amp; Limitations</h3>
      <p class="mt-3">
        To describe the prevalence of sets of mutations in our
        <router-link :to="{ name: 'SituationReports' }">
          Mutation Situation Reports
        </router-link>
        , we rely on shared virus sequences from the
        <a href="https://www.gisaid.org/" target="_blank">GISAID Initiative</a>
        . While we apply filters to remove some low quality sequences and
        unreasonable metadata as described in our
        <router-link :to="{ name: 'SituationReportMethodology' }">
          methods
        </router-link>
        , we rely on the accuracy of the sequences and sample metadata deposited
        in GISAID.
      </p>

      <p>
        These sequences are a sample of the total number of cases &mdash; often
        a biased sample &mdash; and may not represent the true prevalence of the
        mutations in the population. In general, it is important to note that
        case numbers for any given lineage/mutation can be significantly
        affected by overall case numbers and rates of genomic sequencing at any
        given location.
      </p>

      <h3>Known sources of bias</h3>
      <div class="border-bottom pb-2">
        <h5 class="m-0 mb-1">Uneven rates of sequencing across locations</h5>
        <p>
          Sequencing rates between locations are highly variable, complicating
          comparisons between places. Wherever possible, we have added
          confidence intervals to estimate the uncertainty due to different
          sampling rates.
        </p>
        <!-- <p>
        View how sequencing rates differ by country or division:
      </p>
      <div class="text-highlight">&lt; changable choropleth showing total number of sequences and % of total cases sequencing by global/country/state &gt;</div> -->
      </div>

      <div class="border-bottom py-2">
        <h5 class="m-0 mb-1">Greater sequencing of older samples</h5>
        <p>
          For all sequencing data, there is a lag between when the sample was
          acquired from the patient, when the sample was processed and
          sequenced, and when the data is released to the public. This gap means
          that the most recent data often contains very few samples, severely
          limiting its reliability.
        </p>
        <!-- <p>
        View the lag between sample collection date and sequence submission date:
      </p>
      <div class="text-highlight">&lt; changable plot showing the distribution of sequencing gaps by global/country/state &gt;</div> -->
      </div>

      <div class="border-bottom py-2">
        <h5 class="m-0 mb-1">Selective sampling</h5>
        <p>
          The samples submitted for sequencing are often not a random sample of
          all cases. These samples are often from:
        </p>
        <ul>
          <li>An investigation of a single cluster in an outbreak</li>
          <li>
            Unique cases, such as patients with severe disease or breakthrough
            cases of patients who had been vaccinated
          </li>
          <li>Imported cases from travel</li>
          <li>S-gene target failure during PCR amplification (see below)</li>
        </ul>
        <p>
          Selective sampling skews the estimated prevalence of a lineage in a
          location. For instance, a higher proportion of breakthrough cases
          sequenced will lead to an overestimation of the prevalence of Variants
          of Concern (VOC) or Interest (VOI), which have a greater likelihood of
          showing immune escape in vaccinated people.
        </p>
      </div>

      <div class="border-bottom py-2">
        <h5 class="m-0 mb-1">Sequencing techniques</h5>
        <p class="m-0">
          Sequencing techniques can heavily bias this sampling. For instance,
          the majority of
          <router-link
            :to="{ name: 'MutationReport', meta: { mutation: 'B.1.1.7' } }"
          >
            B.1.1.7 genomes
          </router-link>
          identified in the United States to date were identified by S-gene
          target failures (SGTF) in community-based diagnostic PCR testing. SGTF
          indicates a deletion mutation that is one of several mutations able to
          distinguish the B.1.1.7 from other SARS-CoV-2 strains. Estimates of
          true prevalence in the U.S. are discussed in the
          <a
            href="https://blog.helix.com/b117-variant-updated-data/"
            target="_blank"
          >
            Helix Research blog
          </a>
          .
        </p>
      </div>

      <div class="my-5">
        <h3 id="delta">New lineages &amp; how lineages are assigned</h3>
        <p>
          The mutations associated with new lineages classified by the
          <a target="_blank" href="https://www.pango.network/">
            Pango nomenclature system
          </a>
          are more dynamic than lineages with thousands of associated sequences
          and may change as more samples are sequenced. Read more from the Pango
          team on
          <a href="https://cov-lineages.org/FAQ.html" target="_blank">
            why a lineage assignment might change
          </a>
          and an explanation about the
          <a href="https://www.pango.network/new-ay-lineages/" target="_blank">
            AY lineage series
          </a>
          .
        </p>
      </div>
    </section>
    <section id="methods" class="d-flex w-75 justify-content-center my-5">
      <router-link :to="{ name: 'SituationReportMethodology' }">
        <button class="btn btn-main">View methods</button>
      </router-link>
    </section>

    <section id="definitions">
      <SituationReportDefinitions />
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { lazyLoad } from '@/js/lazy-load';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const SituationReportDefinitions = lazyLoad('SituationReportDefinitions');

onMounted(() => {
  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});
</script>
