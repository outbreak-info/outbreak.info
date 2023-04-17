<template>
  <div>
    <VariantForm
      :minimalistic="minimalistic"
      v-model:selectedLineage="selectedLineage"
      v-model:submitLabel="submitLabel"
      v-model:selectedMutations="selectedMutations"
      :submitted="submitCount"
    />

    <div>
      <div class="d-flex align-items-center my-4 w-100">
        <div>
          <button
            type="submit"
            class="btn btn-outline-secondary mx-5"
            @click="clearQuery"
          >
            Clear selection
          </button>
          <button
            :disabled="!formValid"
            type="submit"
            class="btn btn-accent"
            @click="submitQuery"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { lazyLoad } from '@/js/lazy-load';

const VariantForm = lazyLoad('VariantForm');

const props = defineProps({
  minimalistic: {
    type: Boolean,
    default: false,
  },
});

// instead of this.$emit in previous version
const emit = defineEmits(['exit']);

// instead of this.$router
const router = useRouter();
// instead of this.$route
const route = useRoute();

const selectedMutations = ref([]);
const selectedLineage = ref(null);
const submitCount = ref(0);
const submitLabel = ref(null);

const formValid = computed(() => {
  return selectedMutations.value.length > 0 || selectedLineage.value;
});

const clearQuery = () => {
  // forces the form to clear
  submitCount.value += 1;
};

const submitQuery = () => {
  emit('exit', true);
  const routeQuery = route.query;

  submitCount.value += 1;
  if (selectedLineage.value && selectedLineage.value.alias) {
    router.push({
      name: 'MutationReport',
      params: {
        alias: selectedLineage.value.name,
      },
      query: {
        muts: selectedMutations.value.map((d) => d.mutation),
        loc: routeQuery.loc,
        overlay: routeQuery.overlay,
        selected: routeQuery.selected,
      },
    });
  } else {
    const selectedPango = selectedLineage.value
      ? selectedLineage.value.name
      : null;
    router.push({
      name: 'MutationReport',
      query: {
        pango: selectedPango,
        muts: selectedMutations.value.map((d) => d.mutation),
        loc: routeQuery.loc,
        overlay: routeQuery.overlay,
        selected: routeQuery.selected,
      },
    });
  }
};
</script>
