<template>
  <div class="mx-3 my-5">
    <div id="treatments" class="text-left">
      <h3>Resources related to treatments</h3>
      <Marimekko :data="types" v-if="types" />
      <div v-for="(treatment, idx) in results" :key="idx" class="mb-4">
        <router-link
          :to="{ name: 'Resources', query: { q: treatment.key.query } }"
        >
          <h6 class="m-0">{{ treatment.key.name }}</h6>
        </router-link>
        <small class="text-muted m-0">
          {{ treatment.key.label }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { getQuerySummaries, getCTSummary } from '@/api/resources.js';

import Marimekko from '@/components/Marimekko.vue';

import tippy from 'tippy.js';
import 'tippy.js/themes/light.css';

export default {
  name: 'Topics',
  components: {
    Marimekko,
  },
  mounted() {
    this.resultSubscription = getQuerySummaries(
      this.drugs,
      this.$resourceurl,
    ).subscribe((results) => {
      this.results = results;
    });

    // getCTSummary(this.$resourceurl).subscribe(results => {
    //   console.log(results)
    //
    //   results.forEach(d => {
    //     d["status"] = d.studyStatus ? d.studyStatus.status: null;
    //     d["interv"] = d.armGroup ? d.armGroup.map(arm => {
    //       return arm.intervention ? arm.intervention.map(intervention => intervention.name).join("+") : null;
    //     }).join(" vs ") : null;
    //   })
    //
    //   const x = d3.nest()
    //   .key(d => d.interv)
    //   .entries(results);
    //   console.log(x)
    // });
  },
  beforeDestroy() {
    this.resultSubscription.unsubscribe();
  },
  computed: {
    types: () => {
      return this.results ? this.results.flatMap((d) => d.types) : null;
    },
  },
  data() {
    return {
      resultSubscription: null,
      results: null,
      drugs: [
        {
          name: 'hydroxychloroquine',
          label: 'Malaria treatment',
          // synonyms from PubChem / Google
          terms: [
            'hydroxychloroquine',
            'Plaquenil',
            'Quineprox',
            'hydroxy chloroquine',
            'Oxichloroquine',
            'Oxychlorochin',
            'Oxychloroquine',
            'Oxichlorochinum',
            'Hidroxicloroquina',
            'Hydroxychloroquinum',
            'Idrossiclorochina',
            'oxichlorochine',
            'Hidroxicloroquina',
            'Hydroxychloroquinum',
            'Quensyl',
            'Hydroxychlorochin',
            'Idrossiclorochina',
            'Polirreumin',
            'Dolquine',
          ],
        },
        {
          name: 'azithromycin',
          label:
            'Anti-bacterial agent typically used to treat pneumonia of bacterial origin',
          // synonyms from PubChem / Google
          terms: [
            'azithromycin',
            'Azithramycine',
            'Azasite',
            'Zithromax',
            'Zitromax',
            'AzaSite',
            'Zmax',
          ],
        },
        {
          name: 'tocilizumab',
          label:
            'Immunosuppressive drug approved to treat rhuematoid arthritis',
          // synonyms from PubChem / Google
          terms: [
            'tocilizumab',
            'Actemra',
            'R-1569',
            'RG-1569',
            'RHPM-1',
            'RoActemra',
            'GTPL6881',
          ],
        },
        {
          name: 'lopinavir/ritonavir',
          label: 'HIV protease inhibitor cocktail',
          // synonyms from PubChem / Google
          terms: [
            'lopinavir/ritonavir',
            'lopinavir-ritonavir',
            'lopinavir and ritonavir',
            'lopinavir & ritonavir',
            'Aluvia',
            'Kaletra',
            'Lopimune',
          ],
        },
        {
          name: 'convalescent plasma',
          label: 'Convalescent plasma',
          terms: ['convalescent plasma'],
        },
      ],
    };
  },
};
</script>
