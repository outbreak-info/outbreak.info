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
          @click.prevent.self="submitQuery"
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

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import uniq from 'lodash/uniq';

import { findLocation } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

const TypeaheadSelect = lazyLoad('TypeaheadSelect');
// VariantForm,

const props = defineProps({
  curated: Array,
});

// instead of this.$router
const router = useRouter();

const queryLocation = ref(null);
const location = ref(null);
const selectedLineage = ref(null);
const selectedMutations = ref([]);
const pango = ref([]);
const variant = ref([]);
const muts = ref([]);
const submitCount = ref(0);

const formValid = computed(() => {
  return (
    (selectedMutations.value.length > 0 ||
      selectedLineage.value ||
      pango.value.length ||
      variant.value.length ||
      muts.value.length) &&
    location.value
  );
});

const addVariant = () => {
  if (selectedLineage.value && selectedMutations.value.length) {
    variant.value.push({
      label: `${selectedLineage.value} + ${selectedMutations.value
        .map((d) => d.mutation)
        .join(', ')}`,
      qParam: `${selectedLineage.value}|${selectedMutations.value
        .map((d) => d.mutation)
        .join(',')}`,
      mutation_string: `(${
        selectedLineage.value
      }) AND (${selectedMutations.value.map((d) => d.mutation).join(' AND ')})`,
    });
  } else if (selectedLineage.value) {
    pango.value.push({
      label: selectedLineage.value,
      qParam: selectedLineage.value,
      mutation_string: selectedLineage.value,
    });
  } else if (selectedMutations.value.length) {
    muts.value.push({
      label: `${selectedMutations.value.map((d) => d.mutation).join(', ')} ${
        selectedMutations.value.length === 1 ? 'mutation' : 'variant'
      }`,
      qParam: selectedMutations.value.map((d) => d.mutation).join(' AND '),
      mutation_string: selectedMutations.value
        .map((d) => d.mutation)
        .join(' AND '),
    });
  }

  submitCount.value += 1;
};

const submitQuery = () => {
  addVariant();
  // renamed for below variables: since pango, variant, musts are already declared
  const newPango = uniq(pango.value.map((d) => d.qParam));
  const newVariant = uniq(variant.value.map((d) => d.qParam));
  const newMuts = uniq(muts.value.map((d) => d.qParam));

  if (location.value) {
    router.push({
      name: 'LocationReport',
      query: {
        loc: location.value.id,
        pango: newPango,
        variant: newVariant,
        muts: newMuts,
        selected: newPango.concat(newVariant, newMuts).filter((d) => d.length),
      },
    });
  }
};

// param renamed as locationV to avoid duplication error
const updateLocation = (locationV) => {
  if (locationV && locationV.id) {
    location.value = locationV;
  }
};

onMounted(() => {
  queryLocation.value = findLocation;
});
</script>

<style lang="scss" scoped>
.max-width-400 {
  max-width: 400px !important;
}
</style>
