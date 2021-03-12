<template>
<div>
  <div class="row d-flex align-items-center">
    <div class="col-sm-12 col-md-9 mt-1 mb-4">
      <div class="d-flex align-items-center mb-1 circle-header">
        <div class="circle mr-3">1</div>
        <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
          Choose variant type
        </div>
      </div>

      <div class="ml-5 d-flex flex-wrap align-items-center">
        <div class="radio-item mr-3" v-for="(opt, oIdx) in typeOptions" :key="oIdx">
          <input type="radio" :id="opt.id" :value="opt" v-model="selectedType" class="mr-2">
          <label :for="opt.id">{{opt.label}}</label>
        </div>

      </div>

      <form id="custom-reports" @submit.prevent="submitQuery" :class="[minimalistic ? 'mt-2 mb-0' : 'my-3']">
        <div class="d-flex align-items-center circle-header">
          <div class="circle mr-3">2</div>
          <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
            Select {{selectedType.id == 'pango' || selectedType.id == 'variant' ? "PANGO lineage" : "mutation(s)"}}
          </div>
        </div>

        <!-- PANGO Lineage -->
        <div id="pango" class="ml-5" :class="[minimalistic ? 'mb-2' : 'mb-4']" v-if="selectedType.id == 'pango' || selectedType.id == 'variant'">
          <small>Based on <a href="https://cov-lineages.org/lineages.html" target="_blank">PANGO lineages</a></small>

          <div class="flew-row d-flex w-350px">
            <TypeaheadSelect :queryFunction="queryPangolin" :selectedValue="selectedLineage" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select PANGO lineage" />
          </div>

        </div>

        <!-- MUTATIONS -->
        <div class="d-flex align-items-center mb-1 circle-header" v-if="selectedType.id == 'variant'">
          <div class="circle mr-3">3</div>
          <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
            Select mutation(s)
          </div>
        </div>

        <div id="mutation-set" class="ml-5" v-if="selectedType.id == 'mut' || selectedType.id == 'variant'">
          <div class="d-flex align-items-center">
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

            <div id="bulk-mutations" class="mr-4 w-350px">
              <h6 class="text-uppercase text-muted" v-if="!minimalistic">List of mutations</h6>
              <textarea class="form-control border-theme" v-model="selectedBulkString" placeholder='"gene:mutation": e.g. "S:N501Y, S:DEL69/70"' @input='debounceBulk'></textarea>
            </div>
            <div class="warning" v-if="badBulkGene && selectedBulkString">
              <p>
                Add the gene before the mutation, like "S:N501Y"
              </p>
              <p>
                Separate mutations with commas
              </p>
            </div>
            <div class="warning" v-if="badBulkSubstitution">
              Specify the mutation like "S:N501Y"
            </div>
            <div class="warning" v-if="badBulkDeletion">
              Specify a deletion like "S:DEL69/70"
            </div>
          </div>
          <template v-if="!minimalistic">
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
                <input class="form-control border-theme w-110px" v-model="selectedPosition" :placeholder="selectedMax">
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

              <button type="button" class="btn btn-main p-0 d-flex align-self-start align-self-center" role="button" @click="addMutation" :disabled="!addValid">
                <span class="px-2 py-2">Add <b v-html="selectedLabel"></b>
                </span>
                <div class="bg-sec py-2 px-2 border-theme">
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </div>
              </button>
            </div>
          </template>
        </div>

      </form>
    </div>

  </div>

  <div class="d-flex align-items-center circle-header" v-if="formValid">
    <div class="circle mr-3">{{selectedType.id == 'variant' ? 4 : 3}}</div>
    <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
      Review selections: <span class="text-highlight">{{title}}</span>
    </div>
    <button role="button" class="btn chip btn-outline-secondary d-flex align-items-center py-1 px-2 ml-3 line-height-1" @click="clearForm()" v-if="formValid">
      clear form
      <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
    </button>
  </div>


  <div class="row flex-column d-flex" v-if="!minimalistic && (selectedType.id == 'mut' || selectedType.id == 'variant')">
    <div class="col-sm-12" v-if="selectedMutations.length">
      <div class="d-flex align-items-start ml-5">
        <div class="d-flex flex-wrap mt-1" @submit.prevent="submitQuery" id="selected-mutations">
          <button role="button" class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1" v-for="(mutation, mIdx) in selectedMutations" :key="mIdx" @click="deleteMutation(mIdx)">
            <span v-html="mutation.mutation"></span>
            <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
          </button>
        </div>

        <div class="w-75">
          <SARSMutationMap :lineageMutations="selectedMutations" :additionalMutations="[]" mutationKey="selected_mutations" v-if="selectedMutations.length" />
        </div>
      </div>
    </div>
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

import debounce from "lodash/debounce";

export default Vue.extend({
  name: "CustomReportForm",
  props: {
    selectedLineage: String,
    selectedMutations: Array,
    minimalistic: {
      type: Boolean,
      default: false
    }
  },
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
        const selected = AA_MAP.filter(d => d.gene == this.selectedGene.name && d.codon_num == this.selectedPosition)
        return (selected.length == 1 ? selected[0].aa : "unknown")
      } else {
        return (null)
      }
    },
    title() {
      if (this.selectedLineage) {
        return this.selectedMutations.length ? `${this.selectedLineage} lineage with ${this.selectedMutations.map(d => d.mutation).join(", ")}` : `${this.selectedLineage} lineage`;
      } else {
        return (this.selectedMutations.length > 1 ? this.selectedMutations.map(d => d.mutation).join(", ") + " Variant" : this.selectedMutations.map(d => d.mutation).join(", ") + " Mutation")
      }
    },
    addValid() {
      if (this.selectedMutationType == "substitution") {
        return (this.selectedGene && this.selectedPosition && this.selectedMutation)
      } else if (this.selectedMutationType == "deletion") {
        return (this.selectedGene && this.selectedPosition)
      }
      return (false);
    },
    formValid() {
      return (this.selectedMutations.length > 0 || this.selectedLineage)
    },
    selectedLabel() {
      if (this.addValid) {
        if (this.selectedMutationType == "substitution") {
          return (`${this.selectedGene.name}:${this.selectedRef}${this.selectedPosition}${this.selectedMutation}`)
        } else if (this.selectedMutationType == "deletion") {
          return (`${this.selectedGene.name}:&#916;${this.selectedPosition}/${Number(this.selectedPosition) + Number(this.selectedDelLength) - 1}`)
        }
      }
      return (null)
    }
  },
  created: function() {
    this.debounceBulk = debounce(this.changeBulk, 500);
  },
  mounted() {
    this.queryPangolin = findPangolin;
  },
  methods: {
    updatePangolin(selected) {
      selected ?
        this.$emit("update:selectedLineage", selected.name) :
        this.$emit("update:selectedLineage", null);
    },
    changeBulk() {
      const bulk = this.selectedBulkString.split(",").map(d => d.trim());
      this.badBulkSubstitution = false;
      this.badBulkDeletion = false;
      this.badBulkGene = false;

      if (this.selectedCoordinate == "aminoacid") {
        this.selectedBulkMutations = bulk.map(d => {
          const splitted = d.split(":");
          if (splitted.length == 2) {
            const aaChange = splitted[1];
            const mutationType = aaChange.includes("DEL") ? "deletion" : "substitution";
            const changeSplitted = aaChange.split(/(\d+)/g).filter(d => d != "");
            if (mutationType == "substitution") {
              if (changeSplitted.length == 3) {
                return ({
                  mutation: d,
                  gene: splitted[0],
                  type: mutationType,
                  ref_aa: changeSplitted[0],
                  codon_num: +changeSplitted[1],
                  alt_aa: changeSplitted[2]
                })
              } else {
                this.badBulkSubstitution = true;
              }
            } else if (mutationType == "deletion") {
              if (changeSplitted.length == 4) {
                return ({
                  mutation: d,
                  gene: splitted[0],
                  type: mutationType,
                  codon_num: +changeSplitted[1],
                  change_length_nt: (Number(changeSplitted[3]) - Number(changeSplitted[1]) + 1) * 3
                })
              } else {
                this.badBulkDeletion = true;
              }
            }
          } else {
            this.badBulkGene = true;
          }
        })

        const newMutations = this.selectedManualMutations.concat(this.selectedBulkMutations.filter(d => d));

        this.$emit("update:selectedMutations", newMutations);
      }

    },
    addMutation() {
      // Add to mutation array
      if (this.selectedCoordinate == "aminoacid") {
        this.selectedManualMutations.push({
          type: this.selectedMutationType,
          gene: this.selectedGene.name,
          codon_num: +this.selectedPosition,
          ref_aa: this.selectedRef,
          alt_aa: this.selectedMutation,
          mutation: this.selectedLabel,
          change_length_nt: +this.selectedDelLength * 3
        });
      }
      const newMutations = this.selectedManualMutations.concat(this.selectedBulkMutations);
      this.$emit("update:selectedMutations", newMutations);
      // Clear the form
      this.selectedMutationType = null;
      this.selectedGene = null;
      this.selectedPosition = null;
      this.selectedMutation = null;
    },
    deleteMutation(idx) {
      const removed = this.selectedMutations.splice(idx, 1);
      const newMutations = this.selectedMutations.filter(d => d.mutation != removed[0].mutation);
      this.$emit("update:selectedMutations", newMutations);
      // Remove from manual mutations
      this.selectedManualMutations = this.selectedManualMutations.filter(d => d.mutation != removed[0].mutation);

      // Remove from bulk mutations
      this.selectedBulkMutations = this.selectedBulkMutations.filter(d => d.mutation != removed[0].mutation);
      this.selectedBulkString = this.selectedBulkMutations.map(d => d.mutation).join(",");
    },
    clearForm() {
      this.badBulkSubstitution = false;
      this.badBulkDeletion = false;
      this.badBulkGene = false;
      this.selectedBulkMutations = [];
      this.selectedManualMutations = [];
      this.selectedBulkString = null;
      this.selectedCoordinate = "aminoacid";
      this.selectedGene = null;
      this.selectedPosition = null;
      this.selectedDelLength = 1;
      this.selectedMutationType = "substitution";
      this.$emit("update:selectedLineage", null);
      this.$emit("update:selectedMutations", []);
    }
  },
  data() {
    return {
      queryPangolin: null,
      selectedBulkMutations: [],
      selectedManualMutations: [],
      selectedBulkString: null,
      badBulkGene: false,
      badBulkSubstitution: false,
      badBulkDeletion: false,
      selectedType: {
        id: "pango",
        label: "PANGO lineage"
      },
      typeOptions: [{
        id: "pango",
        label: "PANGO lineage"
      }, {
        id: "variant",
        label: "PANGO lineage + mutation(s)"
      }, {
        id: "mut",
        label: "Mutation(s)"
      }],
      selectedCoordinate: "aminoacid",
      selectedGene: null,
      selectedPosition: null,
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

.w-350px {
    max-width: 325px;
    width: 100%;
}

.coords {
    background: #dcf4ff;
    border-radius: 0.25rem;
}
.warning {
    color: $warning-color;
    font-weight: 700;
}

$circle-width: 1.35em;
.circle {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    font-size: 1.25em;
    color: white;
    background: $secondary-color;
    width: $circle-width;
    height: $circle-width;
}
</style>
