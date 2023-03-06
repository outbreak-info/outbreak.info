<template>
  <div>
    <div class="row d-flex align-items-center">
      <div class="col-sm-12 col-md-9 mt-1 mb-4">
        <div class="d-flex align-items-center mb-1 circle-header">
          <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">
            1
          </div>
          <div
            class="text-sec line-height-1"
            :class="{ 'font-size-2': !minimalistic }"
          >
            Choose variant type
          </div>
        </div>

        <div class="ml-5 d-flex flex-wrap align-items-center">
          <div
            v-for="(opt, oIdx) in typeOptions"
            :key="oIdx"
            class="radio-item mr-3"
          >
            <input
              :id="opt.id"
              v-model="selectedType"
              type="radio"
              :value="opt"
              class="mr-2"
            />
            <label :for="opt.id">{{ opt.label }}</label>
          </div>
        </div>

        <form
          id="custom-variants"
          :class="[minimalistic ? 'mt-2 mb-0' : 'my-3']"
          @submit.prevent="submitQuery"
        >
          <div
            v-if="selectedType"
            class="d-flex align-items-center circle-header"
          >
            <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">
              2
            </div>
            <div
              class="text-sec line-height-1"
              :class="{ 'font-size-2': !minimalistic }"
            >
              Select
              {{
                selectedType.id === 'pango' || selectedType.id === 'variant'
                  ? 'PANGO lineage'
                  : 'mutation(s)'
              }}
            </div>
          </div>

          <!-- PANGO Lineage -->
          <div
            v-if="
              selectedType &&
              (selectedType.id === 'pango' || selectedType.id === 'variant')
            "
            id="pango"
            class="ml-5"
            :class="[minimalistic ? 'mb-2' : 'mb-4']"
          >
            <small>
              Based on
              <a
                href="https://cov-lineages.org/lineage_list.html"
                target="_blank"
              >
                PANGO lineages
              </a>
            </small>

            <div class="flew-row d-flex w-350px">
              <TypeaheadSelect
                :queryFunction="queryPangolin"
                :selectedValue="selectedLineage"
                :apiUrl="$genomicsurl"
                :removeOnSelect="false"
                placeholder="Select PANGO lineage"
                @selected="updatePangolin"
              />
            </div>
          </div>

          <!-- MUTATIONS -->
          <div
            v-if="
              selectedType && selectedType.id === 'variant' && selectedLineage
            "
            class="d-flex align-items-center mb-1 circle-header"
          >
            <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">
              3
            </div>
            <div
              class="text-sec line-height-1"
              :class="{ 'font-size-2': !minimalistic }"
            >
              Select mutation(s)
            </div>
          </div>

          <div
            v-if="
              selectedType &&
              (selectedType.id === 'mut' ||
                (selectedType.id === 'variant' && selectedLineage))
            "
            id="mutation-set"
            class="ml-5"
          >
            <div class="d-flex align-items-center">
              <div id="bulk-mutations" class="mr-4 w-350px">
                <small class="text-muted line-height-1">
                  Comma-separated list of mutations, with the gene before the
                  mutation like "S:E484K, S:DEL69/70"
                </small>
                <textarea
                  v-model="selectedBulkString"
                  class="form-control border-theme"
                  placeholder='"gene:mutation": e.g. "S:E484K, S:DEL69/70"'
                  @input="debounceBulk"
                />
              </div>
              <div v-if="badBulkGene && selectedBulkString" class="warning">
                <p>Add the gene before the mutation, like "S:N501Y"</p>
                <p>Separate mutations with commas</p>
              </div>
              <div v-if="badBulkSubstitution" class="warning">
                Specify the mutation like "S:N501Y"
              </div>
              <div v-if="badBulkDeletion" class="warning">
                Specify a deletion like "S:DEL69/70"
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="formValid && selectedType"
      class="d-flex align-items-center circle-header"
    >
      <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">
        {{ selectedType.id === 'variant' ? 4 : 3 }}
      </div>
      <div
        class="text-sec line-height-1"
        :class="{ 'font-size-2': !minimalistic }"
      >
        Add
        <span class="text-highlight" v-html="title" />
      </div>
    </div>

    <div
      v-if="
        !minimalistic &&
        selectedType &&
        (selectedType.id === 'mut' || selectedType.id === 'variant')
      "
      class="row flex-column d-flex"
    >
      <div v-if="selectedMutations.length" class="col-sm-12">
        <div class="d-flex align-items-start ml-5">
          <div
            id="selected-mutations"
            class="d-flex flex-wrap mt-1"
            @submit.prevent="submitQuery"
          >
            <button
              v-for="(mutation, mIdx) in selectedMutations"
              :key="mIdx"
              role="button"
              class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1"
              @click="deleteMutation(mIdx)"
            >
              <span v-html="mutation.mutation" />
              <font-awesome-icon
                class="ml-1"
                :icon="['far', 'times-circle']"
                :style="{ 'font-size': '0.85em', opacity: '0.6' }"
              />
            </button>
          </div>

          <div class="w-75">
            <SARSMutationMap
              v-if="selectedMutations.length"
              :lineageMutations="selectedMutations"
              :additionalMutations="[]"
              mutationKey="selected_mutations"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import debounce from 'lodash/debounce';

import { findPangolin } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const SARSMutationMap = lazyLoad('SARSMutationMap');

const props = defineProps({
  selectedLineage: Object,
  selectedMutations: Array,
  submitted: Number,
  minimalistic: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'update:submitLabel',
  'update:selectedLineage',
  'update:selectedMutations',
]);

const queryPangolin = ref(null);
const selectedBulkMutations = ref([]);

const selectedBulkString = ref(null);
const badBulkGene = ref(false);
const badBulkSubstitution = ref(false);
const badBulkDeletion = ref(false);
const selectedType = ref(null);
const typeOptions = ref([
  {
    id: 'pango',
    label: 'PANGO lineage',
  },
  {
    id: 'variant',
    label: 'PANGO lineage + mutation(s)',
  },
  {
    id: 'mut',
    label: 'Mutation(s)',
  },
]);

const title = computed(() => {
  if (props.selectedLineage) {
    return props.selectedMutations.length
      ? `${props.selectedLineage.name} lineage with ${props.selectedMutations
          .map((d) => d.mutation)
          .join(', ')}`
      : `${props.selectedLineage.name} lineage`;
  } else {
    return props.selectedMutations.length > 1
      ? props.selectedMutations.map((d) => d.mutation).join(', ') + ' Variant'
      : props.selectedMutations.map((d) => d.mutation).join(', ') + ' Mutation';
  }
});

const formValid = computed(() => {
  return props.selectedMutations.length > 0 || props.selectedLineage;
});

const updatePangolin = (selected) => {
  selected
    ? emit('update:selectedLineage', selected)
    : emit('update:selectedLineage', null);
};

const changeBulk = () => {
  const bulk = selectedBulkString.value.split(',').map((d) => d.trim());
  badBulkSubstitution.value = false;
  badBulkDeletion.value = false;
  badBulkGene.value = false;

  selectedBulkMutations.value = bulk.map((d) => {
    const splitted = d.split(':');
    if (splitted.length === 2) {
      const aaChange = splitted[1];
      const mutationType = aaChange.toLowerCase().includes('del')
        ? 'deletion'
        : 'substitution';
      const changeSplitted = aaChange.split(/(\d+)/g).filter((d) => d !== '');
      if (mutationType === 'substitution') {
        if (changeSplitted.length === 3) {
          return {
            mutation: d,
            gene: splitted[0],
            type: mutationType,
            ref_aa: changeSplitted[0],
            codon_num: +changeSplitted[1],
            alt_aa: changeSplitted[2],
          };
        } else {
          badBulkSubstitution.value = true;
        }
      } else if (mutationType === 'deletion') {
        if (changeSplitted.length === 4) {
          return {
            mutation: d,
            gene: splitted[0],
            type: mutationType,
            codon_num: +changeSplitted[1],
            change_length_nt:
              (Number(changeSplitted[3]) - Number(changeSplitted[1]) + 1) * 3,
          };
        } else if (changeSplitted.length === 2) {
          return {
            mutation: d,
            gene: splitted[0],
            type: mutationType,
            codon_num: +changeSplitted[1],
            change_length_nt: 3,
          };
        } else {
          badBulkDeletion.value = true;
        }
      }
    } else {
      badBulkGene.value = true;
    }
  });

  const newMutations = selectedBulkMutations.value.filter((d) => d);

  emit('update:selectedMutations', newMutations);
};

const deleteMutation = (idx) => {
  const removed = props.selectedMutations.splice(idx, 1);
  const newMutations = props.selectedMutations.filter(
    (d) => d.mutation !== removed[0].mutation,
  );
  emit('update:selectedMutations', newMutations);

  // Remove from bulk mutations
  selectedBulkMutations.value = selectedBulkMutations.value.filter(
    (d) => d.mutation !== removed[0].mutation,
  );
  selectedBulkString.value = selectedBulkMutations.value
    .map((d) => d.mutation)
    .join(',');
};

const clearForm = () => {
  badBulkSubstitution.value = false;
  badBulkDeletion.value = false;
  badBulkGene.value = false;
  selectedBulkMutations.value = [];
  selectedBulkString.value = null;
  selectedType.value = null;
  emit('update:selectedLineage', null);
  emit('update:selectedMutations', []);
};

watch(
  () => props.submitted,
  (newVal, oldVal) => {
    clearForm();
  },
);

watch(
  selectedType,
  (newVal, oldVal) => {
    if (selectedType.value && selectedType.value.id === 'variant') {
      emit('update:submitLabel', 5);
    } else {
      emit('update:submitLabel', 4);
    }
  },
  { immediate: true },
);

const debounceBulk = debounce(changeBulk, 500);

onMounted(() => {
  queryPangolin.value = findPangolin;
});
</script>

<style lang="scss">
.border-theme {
  border: thin #126b93 solid;
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
