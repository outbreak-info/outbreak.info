<template>
<form class="mx-4" @submit.prevent="submitQuery">
  <template v-if="includeLocation">
    <h3>Select location</h3>
    <div class="d-flex align-items-center my-3">
      <div class="input-group w-50">
        <div class="input-group-prepend">
          <span class="input-group-text bg-grey text-muted border-0" id="sb">
            <font-awesome-icon :icon="['fas', 'search']" />
          </span>
        </div>
        <TypeaheadSelect class="form-control mr-4" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Select location" totalLabel="total sequences"
          :removeOnSelect="false" @click.prevent="submitQuery" />
      </div>
    </div>

    <div class="d-flex flex-column justify-content-center align-items-center w-100 mt-5">
      <button :disabled="!location" type="submit" class="btn btn-accent" :class="{'btn-lg': !minimalistic }" @submit.once="submitQuery">Create {{ location ? location.label : null }} report</button>
    </div>
  </template>

  <div class="my-5" v-if="includeMutations">
    <template v-if="includeLocation">
    <h3>Add lineages &amp; mutations to track<span v-if="location"> in {{ location.label }}</span></h3>
    <h6 class="text-muted">Optional: specify lineages and mutations to track in addition to the Variants of Concern and Interest we're tracking</h6>
    <b class="text-muted m-0 p-0" v-if="curated">
      Default:
    </b>
    <div v-for="(type, tIdx) in curated" :key="tIdx" class="d-flex mb-3 align-items-center">
      <div class="mr-3">
        <small :class="{ 'VOC': type.key == 'Variant of Concern', 'MOC': type.key == 'Mutation of Concern', 'MOI': type.key == 'Mutation of Interest', 'VOI': type.key == 'Variant of Interest'}">{{type.key}}</small>
      </div>

      <button v-for="(variant, vIdx) in type.value" :key="vIdx" class="btn chip bg-white text-muted btn-outline-secondary-no-hover">{{variant}}</button>
    </div>
  </template>

    <b class="text-muted m-0 p-0">
      Custom additions:
    </b>
    <div class="d-flex flex-wrap align-items-center mb-3">
      <button v-for="(lineage, lIdx) in pango" :key="'pango'+lIdx" class="btn chip bg-main text-light pl-3" @click="deleteVariant(lIdx, pango)">
        {{ lineage.label }}
        <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
      </button>
      <button v-for="(variant, vIdx) in variant" :key="'variant' + vIdx" class="btn chip bg-main text-light pl-3" @click="deleteVariant(vIdx, variant)">
        {{ variant.label }}
        <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
      </button>
      <button v-for="(mutation, mIdx) in muts" :key="'mutation' + mIdx" class="btn chip bg-main text-light pl-3" @click="deleteVariant(mIdx, muts)">
        {{ mutation.label }}
        <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
      </button>
    </div>

    <div>
      <VariantForm :minimalistic="minimalistic" :selectedLineage.sync="selectedLineage" :selectedMutations.sync="selectedMutations" :submitted="formCount" :submitLabel.sync="submitLabel" />
        <div class="d-flex align-items-center my-4 w-100">
          <div class="d-flex align-items-center circle-header" v-if="formValid">
            <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">{{ submitLabel }}</div>
          </div>
          <button :disabled="!formValid" type="submit" class="btn btn-accent" :class="{'btn-lg': !minimalistic }" @click="addVariant">Add {{ title }}</button>
        </div>

    </div>

  </div>
</form>
</template>

<script>
import Vue from "vue";

import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import VariantForm from "@/components/VariantForm.vue";

import debounce from "lodash/debounce";

import {
  findLocation
} from "@/api/genomics.js";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSearch,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faSearch, faTimesCircle);

export default {
  name: "CustomLocationForm",
  components: {
    TypeaheadSelect,
    VariantForm,
    FontAwesomeIcon
  },
  props: {
    minimalistic: {
      type: Boolean,
      default: false
    },
    includeLocation: {
      type: Boolean,
      default: true
    },
    includeMutations: {
      type: Boolean,
      default: true
    },
    curated: Array,
    variant: {
      type: Array,
      default: () => []
    },
    muts: {
      type: Array,
      default: () => []
    },
    pango: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    title() {
      if (this.selectedLineage) {
        return this.selectedMutations.length ? `${this.selectedLineage} + ${this.selectedMutations.map(d => d.mutation).join(", ")}` : `${this.selectedLineage} lineage`;
      } else {
        return (this.selectedMutations.length > 1 ? this.selectedMutations.map(d => d.mutation).join(", ") + " Variant" : this.selectedMutations.map(d => d.mutation).join(", ") + " Mutation")
      }
    },
    formValid() {
      return (this.selectedMutations.length > 0 || this.selectedLineage)
    }
  },
  methods: {
    addVariant() {
      if (this.selectedLineage && this.selectedMutations.length) {
        this.variant.push({
          label: `${this.selectedLineage} + ${this.selectedMutations.map(d => d.mutation).join(", ")}`,
          route: `${this.selectedLineage}|${this.selectedMutations.map(d => d.mutation).join(",")}`
        })
      } else if (this.selectedLineage) {
        this.pango.push({
          label: `${this.selectedLineage} lineage`,
          route: this.selectedLineage
        })
      } else if (this.selectedMutations.length) {
        this.muts.push({
          label: `${this.selectedMutations.map(d => d.mutation).join(", ")} ${this.selectedMutations.length === 1 ? "mutation" : "variant"}`,
          route: this.selectedMutations.map(d => d.mutation).join(",")
        })
      }

      this.formCount += 1;
      this.selectedLineage = null;
      this.selectedMutations = [];
    },
    deleteVariant(idx, variantArr) {
      variantArr.splice(idx, 1);
    },
    submitQuery() {
      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.location.id,
          pango: this.pango.map(d => d.route),
          variant: this.variant.map(d => d.route),
          muts: this.muts.map(d => d.route)
        }
      })
    },
    updateLocation(location) {
      if (location && location.id) {
        this.location = location;
      }
    }
  },
  data() {
    return {
      queryLocation: null,
      location: null,
      selectedLineage: null,
      selectedMutations: [],
      formCount: 0,
      submitLabel: null
    }
  },
  mounted() {
    this.queryLocation = findLocation;
  }
}
</script>

<style lang="scss" scoped>
.max-width-400 {
    max-width: 400px !important;
}
</style>
