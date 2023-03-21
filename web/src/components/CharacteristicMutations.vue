<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-1 mr-4">
      <div class="d-flex flex-column">
        <h4 class="mb-0">
          {{ definitionLabel }}
        </h4>
        <small class="text-muted">
          Mutations in at least {{ charMutThreshold }} of
          {{ mutationName }} sequences
          <router-link
            v-if="reportType !== 'mutation'"
            :to="{
              name: 'SituationReportMethodology',
              hash: '#characteristic',
            }"
            target="_blank"
          >
            (read more)
          </router-link>
        </small>
      </div>

      <div v-if="lineageName" class="d-flex flex-column align-items-end">
        <router-link
          v-if="sublineages.length > 1"
          class="mt-n1"
          :to="{
            name: 'SituationReportComparison',
            query: { pango: lineageName },
          }"
        >
          Compare {{ lineageName }} sublineages
        </router-link>
        <router-link
          class="mt-n1"
          :to="{
            name: 'SituationReportComparison',
            query: { pango: lineageName },
          }"
        >
          Compare to other lineages
        </router-link>
        <router-link
          class="mt-n1"
          :to="{
            name: 'SituationReportComparison',
            query: { pango: lineageName, gene: 'S', threshold: 0.2 },
          }"
        >
          View S-gene mutations
        </router-link>
      </div>
    </div>

    <!-- OMICRON INSERTION WARNING -->
    <Warning
      v-if="
        lineageName === 'omicron' ||
        lineageName === 'Omicron' ||
        lineageName === 'B.1.1.529'
      "
      text="<p>Most Omicron sequences also contain a <b>3 amino acid insertion (EPE) at position 214 in the Spike</b> protein.</p> outbreak.info currently only reports substitution and deletion changes, due to the computational challenges with identifying insertions in 5+ million sequences every day. We’re working towards incorporating insertions into our data processing pipeline, and we encourage you to refer back to the sequence data available on GISAID for more information about these insertions."
      class="fa-sm mt-2 mb-4"
      :align_left="true"
    />

    <SARSMutationMap
      v-if="mutations || additionalMutations"
      :mutationKey="mutationName"
      :lineageMutations="mutations"
      :additionalMutations="additionalMutations"
      class="mb-3"
      :copyable="true"
    />

    <div class="d-flex flex-wrap ml-2 mr-3">
      <button
        class="btn btn-main-outline btn-mut router-link px-1 collapsed"
        data-toggle="collapse"
        href="#mutation-table"
        aria-expanded="true"
        aria-controls="mutation-table"
      >
        <small>
          <span class="if-collapsed">View</span>
          <span class="if-not-collapsed">Hide</span>
          mutation table
        </small>
      </button>

      <!-- link to structures on aquaria -->
      <template v-if="aquariaLink">
        <a
          v-for="(link, lIdx) in aquariaLink"
          :key="lIdx"
          :href="link.value.link"
          target="_blank"
          class="px-1 flex-shrink-0"
        >
          <button class="btn btn-main-outline btn-mut router-link">
            <small>
              View
              <b>{{ aquariaLink.length > 1 ? link.key + '-gene' : '' }}</b>
              {{ link.value.count === 1 ? 'mutation' : 'mutations' }} on 3D
              structures
            </small>
            <img
              src="@/assets/resources/aquaria.svg"
              style="width: 25px"
              class="ml-2"
              alt="aquaria-svg"
            />
          </button>
        </a>
      </template>

      <DownloadReportData
        :data="mutations"
        figureRef="mutation-map"
        dataType="Mutation Map"
        :fullWidth="false"
      />
    </div>

    <div id="mutation-table" class="collapse ml-2">
      <div class="row">
        <div v-if="lineageName" class="col">
          <MutationTable
            :mutations="mutations"
            :tableTitle="`Characteristic mutations of ${lineageName}`"
          />
        </div>
        <div
          v-if="additionalMutations && additionalMutations.length > 0"
          class="col"
        >
          <MutationTable
            :mutations="additionalMutations"
            tableTitle="Additional Mutations"
          />
        </div>
      </div>
    </div>
    <!-- <div class="ml-2" id="mutation-table"> -->
    <!--   <div class="row"> -->
    <!--     <div class="col" v-if="lineageName"> -->
    <!--       <MutationTable :data="mutations" :moc="moc" :moi="moi" :colorScale="colorScale" :tableTitle="`Characteristic mutations of ${lineageName}`"  v-if="colorScale" /> -->
    <!--     </div> -->
    <!--     <div class="col" v-if="additionalMutations.length > 0"> -->
    <!--       <MutationTable :data="additionalMutations" :colorScale="colorScale" tableTitle="Additional Mutations" v-if="colorScale" /> -->
    <!--     </div> -->
    <!--   </div> -->
    <!-- </div> -->
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { format } from 'd3-format';
import { scaleOrdinal } from 'd3-scale';

import { getBadMutations } from '@/api/genomics.js';
import NT_MAP from '@/assets/genomics/sarscov2_NC045512_genes_nt.json';
import { lazyLoad } from '@/js/lazy-load';
import { genomicsStore } from '@/stores/genomicsStore';

const SARSMutationMap = lazyLoad('SARSMutationMap');
const MutationTable = lazyLoad('MutationTable');
const Warning = lazyLoad('Warning');
const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  mutations: Array,
  definitionLabel: String,
  mutationName: String,
  lineageName: String,
  sublineages: [Array, String],
  reportType: String,
  aquariaLink: Array,
  additionalMutations: Array,
});

const store = genomicsStore();

const colorScale = ref(null);
const moi = ref(null);
const moc = ref(null);
const colorDomain = ref([
  '#bab0ab', // lt grey -- UTRs
  '#1f77b4', // dk blue
  '#aec7e8', // lt blue
  '#f28e2c', // orange
  '#e15759', // red
  '#9edae5', // teal
  '#59a14f', // green
  '#edc949', // yellow
  '#9467bd', // purple
  '#ff9da7', // pink
  '#8c564b', // brown
  '#555555', // grey
  '#bcbd22', // puce
  '#bab0ab',
]);

const charMutThreshold = computed(() => {
  return format('.0%')(store.$state.characteristicThreshold);
});

onMounted(() => {
  const ofInterest = getBadMutations();
  moc.value = ofInterest.moc;
  moi.value = ofInterest.moi;
  // convert object of nucleotides into an array
  const ntMapArr = Object.entries(NT_MAP).map((d) => {
    return {
      gene: d[0],
      start: d[1].start,
      end: d[1].end,
    };
  });

  let geneNames = ntMapArr.sort((a, b) => a.start - b.start).map((d) => d.gene);

  colorScale.value = scaleOrdinal(colorDomain.value).domain(geneNames);
});
</script>

<style lang="scss">
[data-toggle='collapse'] {
  &.collapsed .if-not-collapsed {
    display: none;
  }
  &:not(.collapsed) .if-collapsed {
    display: none;
  }
}

.btn-mut {
  flex-basis: 210px;
  line-height: 1 !important;
}
</style>
