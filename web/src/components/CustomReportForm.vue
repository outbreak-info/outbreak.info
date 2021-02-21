<template>
<div>
  <div class="text-muted mb-2">
    Choose a <router-link :to="{ hash: '#pango' }">lineage</router-link> and/or a <router-link :to="{ hash: '#mutation-set' }">set of mutations</router-link>
  </div>
  <div id="pango" class="my-3">
    <h4 class="mb-0">Custom lineage</h4>
    <small>Based on <a href="https://cov-lineages.org/lineages.html" target="_blank">PANGO lineages</a></small>
    <form id="custom-pangolin" @submit.prevent="submitQuery">
      <div class="flew-row d-flex w-400px">
        <TypeaheadSelect class="mr-4" :queryFunction="queryPangolin" :selectedValue="selectedLineage" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select PANGO lineage" />
      </div>
      <div id="mutation-set" class="my-3">
        <h4>Set of mutations</h4>
        <div class="d-flex align-items-start">
          <!-- <div class="d-flex flex-column align-items-start mr-4 coords p-2" id="coordinate-type"> -->
          <!--   <h6 class="text-uppercase text-muted">coordinate system</h6> -->
          <!--   <div class="radio-item"> -->
          <!--     <input type="radio" id="aa" value="aminoacid" v-model="selectedCoordinate" class="mr-2"> -->
          <!--     <label for="aminoacid">amino acids</label> -->
          <!--   </div> -->
          <!--   <div class="radio-item"> -->
          <!--     <input type="radio" id="nuc" value="nuc" v-model="selectedCoordinate" class="mr-2"> -->
          <!--     <label for="nuc">nucleotides</label> -->
          <!--   </div> -->
          <!-- </div> -->

          <div id="bulk-mutations" class="mr-4 w-400px">
            <h6 class="text-uppercase text-muted">List of mutations</h6>
            <textarea class="form-control border-theme" v-model="selectedBulkString" placeholder='"gene:mutation": e.g. "S:N501Y, S:DEL69/70"'></textarea>
          </div>
        </div>

        <div class="flex-row d-flex">
          <div class="mr-4 align-self-center">
            <b>or</b>
          </div>
        </div>

        <div class="flex-row d-flex">

          <div id="gene-name" class="p-2" v-if="selectedCoordinate === 'aminoacid'">
            <h6 class="text-uppercase text-muted">gene</h6>
            <select v-model="selectedGene" class="select-dropdown">
              <option v-for="gene in genes" :value="gene" :key="gene.name">
                {{gene.name}}
              </option>
            </select>
          </div>

          <div class="d-flex flex-column align-items-start p-2" id="mutation-type">
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
            <h6 class="text-uppercase text-muted" v-if="selectedMutationType == 'substitution'">location</h6>
            <h6 class="text-uppercase text-muted" v-else>start location</h6>
            <input class="form-control border-theme w-110px" v-model="selectedLocation" :placeholder="selectedMax">
            <small>relative to <a :href="refSeq.url" target="_blank" rel="noreferrer">{{refSeq.name}}</a></small>
          </div>

          <div id="del-length" class="mr-4" v-if="selectedMutationType == 'deletion'">
            <h6 class="text-uppercase text-muted">deletion length</h6>
            <input class="form-control border-theme" :style="{width: '135px'}" v-model="selectedDelLength" :placeholder="`in ${selectedCoordinate}s`">
          </div>

          <div id="ref_codon" class="mr-4" v-if="selectedRef">
            <h6 class="text-uppercase text-muted">ref. {{ selectedCoordinate === "aminoacid" ? "amino acid" : "nucleotide"}}</h6>
            <div>
              {{ selectedRef }}
            </div>
          </div>

          <div id="new_codon" class="mr-4" v-if="selectedMutationType == 'substitution'">
            <h6 class="text-uppercase text-muted">new {{ selectedCoordinate === "aminoacid" ? "amino acid" : "nucleotide"}}</h6>
            <input class="form-control border-theme w-90px" v-model="selectedMutation" :placeholder="mutationPlaceholder">
          </div>

          <button type="button" class="btn btn-main p-0 d-flex align-self-start align-self-center" role="button" @click="addMutation">
            <span class="px-2 py-2">Add <b v-html="selectedLabel"></b>
            </span>
            <div class="bg-sec py-2 px-2 border-theme">
              <font-awesome-icon :icon="['fas', 'plus']" />
            </div>
          </button>
        </div>

      </div>

      <div class="flex-row d-flex">
        <div id="selected-mutations" class="my-3" v-if="selectedMutations.length">
          <h5>Selected mutations</h5>
          <div class="d-flex flex-wrap">
            <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(mutation, mIdx) in selectedMutations" :key="mIdx" @click="deleteMutation(mIdx)">
              <span v-html="mutation.mutation"></span>
              <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
            </button>
          </div>
        </div>
      </div>
      <SARSMutationMap :lineageMutations="selectedMutations" :additionalMutations="[]" mutationKey="selected_mutations" />
      <div class="d-flex justify-content-center w-100">
        <button :disabled="!selectedLineage && selectedMutations.length == 0 && !selectedBulkString" type="submit" class="btn btn-accent">Create report</button>
      </div>

    </form>
  </div>


</div>
</template>

<script lang="js">
import Vue from "vue";

import AA_MAP from "@/assets/genomics/sarscov2_aa.json";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";

import {
  findPangolin
} from "@/api/genomics.js";

// --- store / Vuex ---
import {
  mapState
} from "vuex";

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
import {
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";

library.add(faPlus, faTimesCircle);

export default Vue.extend({
  name: "CustomReportForm",
  components: {
    FontAwesomeIcon,
    TypeaheadSelect,
    SARSMutationMap
  },
  computed: {
    ...mapState("genomics", ["refSeq"]),
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
      if (this.selectedCoordinate == "aminoacid" && this.selectedGene) {
        const selected = AA_MAP.filter(d => d.gene == this.selectedGene.name && d.codon_num == this.selectedLocation)
        return (selected.length == 1 ? selected[0].aa : "unknown")
      } else {
        return (null)
      }
    },
    formValid() {
      if (this.selectedMutationType == "substitution") {
        return (this.selectedGene && this.selectedLocation && this.selectedMutation)
      } else if (this.selectedMutationType == "deletion") {
        return (this.selectedGene && this.selectedLocation)
      }
      return (false);
    },
    selectedLabel() {
      if (this.formValid) {
        if (this.selectedMutationType == "substitution") {
          return (`${this.selectedGene.name}:${this.selectedRef}${this.selectedLocation}${this.selectedMutation}`)
        } else if (this.selectedMutationType == "deletion") {
          return (`${this.selectedGene.name}:&#916;${this.selectedLocation}/${Number(this.selectedLocation) + Number(this.selectedDelLength) - 1}`)
        }
      }
      return (null)
    }
  },
  mounted() {
    this.queryPangolin = findPangolin;
  },
  methods: {
    updatePangolin(selected) {
      this.selectedLineage = selected.name;
    },
    submitQuery() {
      this.$emit("exit", true);
      var mutations = this.selectedBulkString ? this.selectedBulkString.split(",").map(d => d.trim()) : this.selectedMutations.map(d => d.mutation.includes("&#916") ? d.mutation.replace("&#916;", "DEL") : d.mutation);
      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.selectedLineage,
          muts: mutations
        }
      });
      this.selectedBulkString = null;
      this.selectedMutations = [];
      this.selectedLineage = null;
    },
    addMutation() {
      // Add to mutation array
      let mutationStr;
      if (this.selectedCoordinate == "aminoacid") {
        this.selectedMutations.push({
          type: this.selectedMutationType,
          gene: this.selectedGene.name,
          codon_num: +this.selectedLocation,
          ref_aa: this.selectedRef,
          alt_aa: this.selectedMutation,
          mutation: this.selectedLabel,
          change_length_nt: +this.selectedDelLength*3
        });
      }
      // Clear the form
      this.selectedMutationType = null;
      this.selectedGene = null;
      this.selectedLocation = null;
      this.selectedMutation = null;
    },
    deleteMutation(idx) {
      this.selectedMutations.splice(idx, 1);
    }
  },
  data() {
    return {
      queryPangolin: null,
      selectedMutations: [],
      selectedLineage: null,
      selectedBulkString: null,
      selectedBulkMutations: [],
      selectedCoordinate: "aminoacid",
      selectedGene: null,
      selectedLocation: null,
      selectedDelLength: 1,
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
.w-200px {
    width: 200px;
}

.w-400px {
    width: 400px;
}

.coords {
    background: #dcf4ff;
    border-radius: 0.25rem;
}
</style>
