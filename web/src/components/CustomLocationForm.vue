<template>
  <div class="mx-4">
    <h3>Select location</h3>
    <div class="d-flex align-items-center mt-3 mb-5">
      <div class="input-group w-50">
        <div class="input-group-prepend">
          <span id="sb" class="input-group-text bg-grey text-muted border-0">
            <font-awesome-icon :icon="['fas', 'search']" />
          </span>
        </div>
        <TypeaheadSelect
          class="form-control mr-4"
          :isStandalone="false"
          :queryFunction="queryLocation"
          @selected="updateLocation"
          :apiUrl="$genomicsurl"
          labelVariable="label"
          placeholder="Select location"
          totalLabel="total sequences"
          :removeOnSelect="false"
          @click.prevent="submitQuery"
        />
      </div>
      <button
        v-if="!formValid"
        :disabled="!location"
        type="submit"
        class="btn btn-accent btn-lg m-0"
        @click="submitQuery"
      >
        Go
      </button>
    </div>

    <!-- <div id="custom-variants" v-if="location">
    <h3>Add optional lineages &amp; mutations to track<span v-if="location"> in {{ location.label }}</span></h3>
    <h6 class="text-muted"><em>Optional:</em> specify lineages and mutations to track in addition to the Variants of Concern and Interest</h6>
    <div class="d-flex flex-column align-items-start mb-3">
      <div class="bg-grey__lightest border-top border-bottom px-2 py-1">
        <b class="text-muted m-0 p-0" v-if="curated">
          Default:
        </b>
        <div v-for="(type, tIdx) in curated" :key="tIdx" class="d-flex my-1 align-items-center">
          <div class="mr-3">
            <small :class="{ 'VOC': type.key == 'Variant of Concern', 'MOC': type.key == 'Mutation of Concern', 'MOI': type.key == 'Mutation of Interest', 'VOI': type.key == 'Variant of Interest'}">{{type.key}}</small>
          </div>

          <button v-for="(variant, vIdx) in type.value" :key="vIdx" class="btn chip bg-white text-muted btn-outline-secondary-no-hover">{{variant}}</button>
        </div>
      </div>
    </div>

    <b class="text-muted m-0 p-0" v-if="curated">
      Custom additions:
    </b>
    <VariantForm :minimalistic="false" :selectedLineage.sync="selectedLineage" :submitLabel.sync="submitLabel" :selectedMutations.sync="selectedMutations" :submitted="submitCount" />

    <b class="text-muted m-0 p-0" v-if="pango.length || variant.length || muts.length">
      Already selected:
    </b>
    <div class="d-flex flex-wrap align-items-center mb-3">
      <button v-for="(lineage, pIdx) in pango" :key="'pango' + pIdx" class="btn chip bg-main text-light pl-3" @click="deleteVariant(pIdx, pango)">
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

    <div class="d-flex align-items-center mt-2 mb-4 w-100">
      <button type="submit" class="btn btn-outline-secondary" @click="clearSelection">Clear selections</button>
      <button :disabled="!formValid" type="submit" class="btn btn-sec ml-3" @click="addVariant">Add another lineage/mutation</button>
      <button :disabled="!formValid" type="submit" class="btn btn-accent ml-3" @click="submitQuery">Go</button>
    </div>

  </div> -->
  </div>
</template>

<script>
import Vue from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import uniq from 'lodash/uniq';

import { findLocation } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

library.add(faSearch, faTimesCircle);

export default {
  name: 'CustomLocationForm',
  components: {
    TypeaheadSelect: lazyLoad('TypeaheadSelect'),
    // VariantForm,
    FontAwesomeIcon,
  },
  props: {
    curated: Array,
  },
  data() {
    return {
      queryLocation: null,
      location: null,
      selectedLineage: null,
      selectedMutations: [],
      pango: [],
      variant: [],
      muts: [],
      variantArr: [],
      submitLabel: null,
      submitCount: 0,
    };
  },
  computed: {
    formValid() {
      return (
        (this.selectedMutations.length > 0 ||
          this.selectedLineage ||
          this.pango.length ||
          this.variant.length ||
          this.muts.length) &&
        this.location
      );
    },
  },
  mounted() {
    this.queryLocation = findLocation;
  },
  methods: {
    clearSelection() {
      this.submitCount += 1;
    },
    addVariant() {
      if (this.selectedLineage && this.selectedMutations.length) {
        this.variant.push({
          label: `${this.selectedLineage} + ${this.selectedMutations
            .map((d) => d.mutation)
            .join(', ')}`,
          qParam: `${this.selectedLineage}|${this.selectedMutations
            .map((d) => d.mutation)
            .join(',')}`,
          mutation_string: `(${
            this.selectedLineage
          }) AND (${this.selectedMutations
            .map((d) => d.mutation)
            .join(' AND ')})`,
        });
      } else if (this.selectedLineage) {
        this.pango.push({
          label: this.selectedLineage,
          qParam: this.selectedLineage,
          mutation_string: this.selectedLineage,
        });
      } else if (this.selectedMutations.length) {
        this.muts.push({
          label: `${this.selectedMutations.map((d) => d.mutation).join(', ')} ${
            this.selectedMutations.length === 1 ? 'mutation' : 'variant'
          }`,
          qParam: this.selectedMutations.map((d) => d.mutation).join(' AND '),
          mutation_string: this.selectedMutations
            .map((d) => d.mutation)
            .join(' AND '),
        });
      }

      this.submitCount += 1;
    },
    deleteVariant(idx, variantArr) {
      variantArr.splice(idx, 1);
    },
    submitQuery() {
      this.addVariant();
      const pango = uniq(this.pango.map((d) => d.qParam));
      const variant = uniq(this.variant.map((d) => d.qParam));
      const muts = uniq(this.muts.map((d) => d.qParam));

      this.$router.push({
        name: 'LocationReport',
        query: {
          loc: this.location.id,
          pango: pango,
          variant: variant,
          muts: muts,
          selected: pango.concat(variant, muts).filter((d) => d.length),
        },
      });
    },
    updateLocation(location) {
      if (location && location.id) {
        this.location = location;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.max-width-400 {
  max-width: 400px !important;
}
</style>
