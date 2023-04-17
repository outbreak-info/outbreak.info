<template>
  <form autocomplete="off">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text bg-grey text-muted border-0" id="sb">
          <font-awesome-icon :icon="['fas', 'search']" />
        </span>
      </div>
      <input
        id="sBar"
        v-model="search"
        class="form-control"
        :class="[darkMode ? 'border-0' : 'border']"
        :placeholder="placeholder"
        aria-label="search"
        aria-describedby="sb"
        type="text"
        @input="onChange"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @keydown.delete="onBackspace"
        @keydown.ctrl.a="onSelectAll"
        @keydown.meta.a="onSelectAll"
      />
      <ul
        v-show="isOpen"
        id="autocomplete-results"
        class="autocomplete-results bg-dark text-light"
      >
        <li v-if="isLoading" class="loading">Loading results...</li>
        <li
          v-for="(result, i) in results"
          v-else
          :key="i"
          @click="setResult(result)"
          class="autocomplete-result"
          :class="{ 'is-active': i === arrowCounter }"
        >
          {{ result.label }}
        </li>
      </ul>
    </div>
  </form>
</template>

<script setup>
// adapted from https://alligator.io/vuejs/vue-autocomplete-component/
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getLocations } from '@/api/epi-basics.js';
import { geoStore } from '@/stores/geoStore';

const props = defineProps({
  items: {
    type: Array,
    required: false,
    default: () => [],
  },
  isAsync: {
    type: Boolean,
    required: false,
    default: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Search',
  },
  routeTo: {
    type: String,
    required: false,
    default: null,
  },
  darkMode: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits(['location', 'input', 'selected']);

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const store = geoStore();

// instead of this.$router
const router = useRouter();

const isOpen = ref(false);
const results = ref([]);
const search = ref('');
const selected = ref(null);
const isLoading = ref(false);
const arrowCounter = ref(0);
const isSelectAll = ref(false);

watch(
  () => props.items,
  (val, oldValue) => {
    if (val.length !== oldValue.length) {
      results.value = val;
      isLoading.value = false;
    }
  },
  { deep: true },
);

const filterResults = () => {
  // first uncapitalize all the things
  results.value = store.$state.allPlaces.filter((item) => {
    return item.label.toLowerCase().indexOf(search.value.toLowerCase()) > -1;
  });
};

const onChange = () => {
  // Is the data given by an outside ajax request?
  if (props.isAsync) {
    isLoading.value = true;
  } else {
    // Let us  our flat array
    filterResults();
    isOpen.value = true;
  }
};

const setResult = (result) => {
  selected.value = result;
  isOpen.value = false;
  if (props.routeTo) {
    search.value = '';
    router.push({
      path: props.routeTo,
      query: {
        location: selected.value.id,
      },
    });
  } else {
    search.value = selected.value.label;
    emit('location', selected.value.id);
  }
};

const onArrowDown = (evt) => {
  if (arrowCounter.value < results.value.length) {
    arrowCounter.value = arrowCounter.value + 1;
  }
};

const onArrowUp = () => {
  if (arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1;
  }
};

const onEnter = () => {
  // // Let's warn the parent that a change was made
  // this.$emit('input', result);
  selected.value = results.value[arrowCounter.value]
    ? results.value[arrowCounter.value]
    : search.value;
  emit('input', selected.value);
  search.value = '';
  isOpen.value = false;
  arrowCounter.value = -1;
  if (props.routeTo && props.routeTo !== '') {
    router.push({
      path: props.routeTo,
      query: {
        location: selected.value.id,
      },
    });
  } else {
    emit('location', selected.value.id);
  }
};

const onBackspace = () => {
  if (search.value === '') {
    search.value = selected.value.pop();
  }

  if (isSelectAll.value) {
    search.value = '';
    emit('selected', []);
    isSelectAll.value = false;
  }
};

const onSelectAll = () => {
  isSelectAll.value = true;
};

const handleClickOutside = (evt) => {
  isSelectAll.value = false;
  //TODO: no longer $el in composition api
  // if (!$el.contains(evt.target)) {
  //   isOpen.value = false;
  //   arrowCounter.value = -1;
  // }
};

onMounted(() => {
  getLocations(apiUrl).subscribe((_) => null);
  document.addEventListener('click', handleClickOutside, {
    passive: true,
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
