<template>
<div class="mx-3 my-5">
  <div id="treatments" class="text-left">
    <h3>Resources related to treatments</h3>
    <Marimekko />
    <div v-for="(treatment, idx) in drugs" :key="idx" class="mb-4">
      <h6 class="m-0">{{treatment.name}}</h6>
      <small class="text-muted m-0">
        {{treatment.label}}
      </small>
    </div>
  </div>

</div>
</template>

<script>
import {
  getQuerySummaries
} from "@/api/resources.js";

import Marimekko from "@/components/Marimekko.vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "Resources",
  components: {
    Marimekko
  },
  mounted() {
    this.resultSubscription = getQuerySummaries(this.drugs, this.$resourceurl).subscribe(results => {
      console.log(results)
      this.results = results;
    });
  },
  beforeDestroy() {
    this.resultSubscription.unsubscribe();
  },
  data() {
    return {
      resultSubscription: null,
      results: null,
      drugs: [{
          name: "hydroxychloroquine",
          label: "Malaria treatment",
          // synonyms from PubChem / Google
          terms: ["hydroxychloroquine", "Plaquenil", "Quineprox", "hydroxy chloroquine", "Oxichloroquine", "Oxychlorochin", "Oxychloroquine", "Oxichlorochinum", "Hidroxicloroquina", "Hydroxychloroquinum", "Idrossiclorochina", "oxichlorochine",
            "Hidroxicloroquina", "Hydroxychloroquinum", "Quensyl", "Hydroxychlorochin", "Idrossiclorochina", "Polirreumin", "Dolquine"
          ]
        },
        {
          name: "azithromycin",
          label: "Anti-bacterial agent typically used to treat pneumonia of bacterial origin",
          // synonyms from PubChem / Google
          terms: ["azithromycin", "Azithramycine", "Azasite", "Zithromax", "Zitromax", "AzaSite", "Zmax"]
        },
        {
          name: "tocilizumab",
          label: "Immunosuppressive drug approved to treat rhuematoid arthritis",
          // synonyms from PubChem / Google
          terms: ["tocilizumab", "Actemra", "R-1569", "RG-1569", "RHPM-1", "RoActemra", "GTPL6881"]
        },
        {
          name: "lopinavir/ritonavir",
          label: "HIV protease inhibitor cocktail",
          // synonyms from PubChem / Google
          terms: ["lopinavir/ritonavir", "lopinavir-ritonavir", "lopinavir and ritonavir", "lopinavir & ritonavir", "Aluvia", "Kaletra", "Lopimune"]
        },
        {
          name: "convalescent plasma",
          label: "Convalescent plasma",
          terms: ["convalescent plasma"]
        }
      ]
    }
  }
}
</script>
