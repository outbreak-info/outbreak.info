<template>
<div>
  <form class="d-flex align-items-center">
    <div class="d-flex flex-column align-items-start mr-4" id="coordinate-type">
      <h6 class="text-uppercase text-muted">coordinate system</h6>
      <div class="radio-item">
        <input type="radio" id="aa" value="aminoacid" v-model="selectedCoordinate" class="mr-2">
        <label for="aminoacid">amino acids</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="nuc" value="nuc" v-model="selectedCoordinate" class="mr-2">
        <label for="nuc">nucleotides</label>
      </div>
    </div>
    <div id="gene-name" class="mr-4" v-if="selectedCoordinate === 'aminoacid'">
      <h6 class="text-uppercase text-muted">gene</h6>
      <select v-model="selectedGene" class="select-dropdown">
        <option v-for="gene in genes" :value="gene" :key="gene.name">
          {{gene.name}}
        </option>
      </select>
    </div>

    <div class="d-flex flex-column align-items-start mr-4" id="mutation-type">
      <h6 class="text-uppercase text-muted">mutation type</h6>
      <div class="radio-item">
        <input type="radio" id="substitution" value="substitution" v-model="selectedMutationType" class="mr-2">
        <label for="substitution">substitution</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="deletion" value="deletion" v-model="selectedMutationType" class="mr-2">
        <label for="deletion">deletion</label>
      </div>
    </div>

    <div id="location" class="mr-4">
      <h6 class="text-uppercase text-muted">location</h6>
      <input class="form-control border-theme w-110px" v-model="selectedLocation" :placeholder="selectedMax">
    </div>

    <div id="ref_codon" class="mr-4" v-if="selectedLocation">
      <h6 class="text-uppercase text-muted">ref. {{ selectedCoordinate === "aminoacid" ? "amino acid" : "nucleotide"}}</h6>
      <div>
        {{ selectedRef }}
      </div>
    </div>

    <div id="new_codon" class="mr-4" v-if="selectedMutationType == 'substitution'">
      <h6 class="text-uppercase text-muted">new {{ selectedCoordinate === "aminoacid" ? "amino acid" : "nucleotide"}}</h6>
      <input class="form-control border-theme w-90px" v-model="selectedMutation" :placeholder="mutationPlaceholder">
    </div>

    <button class="btn btn-main p-0 d-flex">
      <span class="px-2 py-2">Add <b v-html="selectedLabel"></b>
        </span>
        <div class="bg-sec py-2 px-2 border-theme">
        <font-awesome-icon :icon="['fas', 'plus']" />
        </div>

    </button>

  </form>
</div>
</template>

<script lang="js">
import Vue from "vue";

import AA_MAP from "@/assets/genomics/sarscov2_aa.json";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons";

library.add(faPlus);

export default Vue.extend({
  name: "CustomReportForm",
  components: {
    FontAwesomeIcon
  },
  computed: {
    selectedMax() {
      if (this.selectedCoordinate == "aminoacid") {
        return (this.selectedGene ? `1 - ${this.selectedGene.length}` : "select gene");
      }
      return (`1 - ${this.nucleotideMax}`);
    },
    mutationPlaceholder() {
      return (this.selectedCoordinate == "aminoacid" ? "new AA" : "A, T, G, C")
    },
    selectedRef() {
      if (this.selectedCoordinate == "aminoacid") {
        const selected = AA_MAP.filter(d => d.gene == this.selectedGene.name && d.codon_num == this.selectedLocation)
        return (selected.length == 1 ? selected[0].aa : "unknown")
      } else {
        return ("unknown")
      }
    },
    formValid() {
      if(this.selectedMutationType == "substitution") {
        return(this.selectedGene && this.selectedLocation && this.selectedMutation)
      } else if(this.selectedMutationType == "deletion") {
        return(this.selectedGene && this.selectedLocation)
      }
      return (false);
    },
    selectedLabel() {
      if (this.formValid) {
        if (this.selectedMutationType == "substitution") {
          return (`${this.selectedRef}${this.selectedLocation}${this.selectedMutation}`)
        } else if (this.selectedMutationType == "deletion") {
          return (`&#916;${this.selectedLocation}`)
        }
      }
      return (null)
    }
  },
  data() {
    return {
      selectedMutations: [],
      selectedCoordinate: "aminoacid",
      selectedGene: null,
      selectedLocation: null,
      selectedMutationType: "substitution",
      selectedMutation: null,
      nucleotideMax: 30000,
      genes: [{
        "order": 1,
        "name": "ORF1a",
        "length": 11501
      }, {
        "order": 1.5,
        "name": "ORF1ab",
        "length": 7096
      }, {
        "order": 2,
        "name": "ORF1b",
        "length": null
      }, {
        "order": 3,
        "name": "S",
        "length": 1273
      }, {
        "order": 4,
        "name": "ORF3a",
        "length": 275
      }, {
        "order": 5,
        "name": "E",
        "length": 75
      }, {
        "order": 6,
        "name": "M",
        "length": 222
      }, {
        "order": 7,
        "name": "ORF6",
        "length": 61
      }, {
        "order": 8,
        "name": "ORF7a",
        "length": 121
      }, {
        "order": 9,
        "name": "ORF7b",
        "length": 43
      }, {
        "order": 10,
        "name": "ORF8",
        "length": 121
      }, {
        "order": 11,
        "name": "N",
        "length": 419
      }, {
        "order": 12,
        "name": "ORF10",
        "length": 38
      }]
    }
  }
})
</script>

<style lang="scss">
.border-theme {
    border: thin #126B93 solid;
}

.w-110px {
  width: 110px;
}

.w-100px {
  width: 100px;
}
.w-90px {
  width: 90px;
}

.w-50px {
  width: 50px;
}

.w-75px {
  width: 75px;
}

</style>
