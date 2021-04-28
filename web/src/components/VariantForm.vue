<template>
<div>
  <div class="row d-flex align-items-center">
    <div class="col-sm-12 col-md-9 mt-1 mb-4">
      <div class="d-flex align-items-center mb-1 circle-header">
        <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">1</div>
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

      <form id="custom-variants" @submit.prevent="submitQuery" :class="[minimalistic ? 'mt-2 mb-0' : 'my-3']">
        <div class="d-flex align-items-center circle-header" v-if="selectedType">
          <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">2</div>
          <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
            Select {{selectedType.id == 'pango' || selectedType.id == 'variant' ? "PANGO lineage" : "mutation(s)"}}
          </div>
        </div>

        <!-- PANGO Lineage -->
        <div id="pango" class="ml-5" :class="[minimalistic ? 'mb-2' : 'mb-4']" v-if="selectedType && (selectedType.id == 'pango' || selectedType.id == 'variant')">
          <small>Based on <a href="https://cov-lineages.org/lineages.html" target="_blank">PANGO lineages</a></small>

          <div class="flew-row d-flex w-350px">
            <TypeaheadSelect :queryFunction="queryPangolin" :selectedValue="selectedLineage" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="Select PANGO lineage" />
          </div>

        </div>

        <!-- MUTATIONS -->
        <div class="d-flex align-items-center mb-1 circle-header" v-if="selectedType && selectedType.id == 'variant' && selectedLineage">
          <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">3</div>
          <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
            Select mutation(s)
          </div>
        </div>

        <div id="mutation-set" class="ml-5" v-if="selectedType && (selectedType.id == 'mut' || selectedType.id == 'variant' && selectedLineage)">
          <div class="d-flex align-items-center">
            <div id="bulk-mutations" class="mr-4 w-350px">
              <small class="text-muted line-height-1">Comma-separated list of mutations, with the gene before the mutation like "S:E484K, S:DEL69/70"</small>
              <textarea class="form-control border-theme" v-model="selectedBulkString" placeholder='"gene:mutation": e.g. "S:E484K, S:DEL69/70"' @input='debounceBulk'></textarea>
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
        </div>

      </form>
    </div>

  </div>

  <div class="d-flex align-items-center circle-header" v-if="formValid">
    <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">{{selectedType.id == 'variant' ? 4 : 3}}</div>
    <div class="text-sec line-height-1" :class="{'font-size-2': !minimalistic }">
      Add <span class="text-highlight" v-html="title"></span>
    </div>
  </div>


  <div class="row flex-column d-flex" v-if="!minimalistic && selectedType && (selectedType.id == 'mut' || selectedType.id == 'variant')">
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
    submitted: Number,
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
  watch: {
    submitted(newVal, oldVal) {
      this.clearForm();
    },
    selectedType: {
      immediate: false,
      handler(newVal, oldVal) {
        if (this.selectedType.id == "variant") {
          this.$emit("update:submitLabel", 5);
        } else {
          this.$emit("update:submitLabel", 4);
        }
      }
    }
  },
  computed: {
    title() {
      if (this.selectedLineage) {
        return this.selectedMutations.length ? `${this.selectedLineage} lineage with ${this.selectedMutations.map(d => d.mutation).join(", ")}` : `${this.selectedLineage} lineage`;
      } else {
        return (this.selectedMutations.length > 1 ? this.selectedMutations.map(d => d.mutation).join(", ") + " Variant" : this.selectedMutations.map(d => d.mutation).join(", ") + " Mutation")
      }
    },
    formValid() {
      return (this.selectedMutations.length > 0 || this.selectedLineage)
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

        this.selectedBulkMutations = bulk.map(d => {
          const splitted = d.split(":");
          if (splitted.length == 2) {
            const aaChange = splitted[1];
            const mutationType = aaChange.toLowerCase().includes("del") ? "deletion" : "substitution";
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

        const newMutations = this.selectedBulkMutations.filter(d => d);

        this.$emit("update:selectedMutations", newMutations);
    },
    deleteMutation(idx) {
      const removed = this.selectedMutations.splice(idx, 1);
      const newMutations = this.selectedMutations.filter(d => d.mutation != removed[0].mutation);
      this.$emit("update:selectedMutations", newMutations);

      // Remove from bulk mutations
      this.selectedBulkMutations = this.selectedBulkMutations.filter(d => d.mutation != removed[0].mutation);
      this.selectedBulkString = this.selectedBulkMutations.map(d => d.mutation).join(",");
    },
    clearForm() {
      this.badBulkSubstitution = false;
      this.badBulkDeletion = false;
      this.badBulkGene = false;
      this.selectedBulkMutations = [];
      this.selectedBulkString = null;
      this.$emit("update:selectedLineage", null);
      this.$emit("update:selectedMutations", []);
    }
  },
  data() {
    return {
      queryPangolin: null,
      selectedBulkMutations: [],
      selectedBulkString: null,
      badBulkGene: false,
      badBulkSubstitution: false,
      badBulkDeletion: false,
      selectedType: null,
      typeOptions: [{
        id: "pango",
        label: "PANGO lineage"
      }, {
        id: "variant",
        label: "PANGO lineage + mutation(s)"
      }, {
        id: "mut",
        label: "Mutation(s)"
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
$circle-width-sm: 1.1em;
.circle {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    color: white;
    background: $secondary-color;
    font-size: calc(#{$circle-width} * 0.9);
    width: $circle-width;
    height: $circle-width;
}

.circle-sm {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    color: white;

    font-size: calc(#{$circle-width} * 0.9);
    background: $secondary-color;
    width: $circle-width-sm;
    height: $circle-width-sm;
}
</style>
