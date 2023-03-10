<template>
  <div class="autocomplete" style="background: white">
    <div
      :content="selected"
      class="autocomplete-input flex-column user-input-wrp"
    >
      <div
        class="floating-label align-left"
        :class="[selected.length === 0 ? 'empty' : 'filled']"
      >
        select locations
      </div>
      <div class="d-flex flex-wrap">
        <button
          v-for="(item, idx) in selectedItems"
          :key="idx"
          class="chip"
          :class="{ 'to-add': item.addable, 'all-selected': isSelectAll }"
          :style="{ background: item.lightColor }"
          @click="updateChip(item)"
        >
          {{ item.label }}
          <font-awesome-icon
            v-if="!item.addable"
            class="remove-btn"
            :icon="['far', 'times-circle']"
            :style="{ color: item.darkColor }"
          />
        </button>
        <input
          v-model="search"
          type="text"
          placeholder="Type here"
          @input="onChange"
          @keydown.down="onArrowDown"
          @keydown.up="onArrowUp"
          @keydown.enter="onEnter"
          @keydown.delete="onBackspace"
          @keydown.ctrl.65="onSelectAll"
          @keydown.meta.65="onSelectAll"
        />
      </div>
    </div>

    <ul v-show="isOpen" id="autocomplete-results" class="autocomplete-results">
      <li v-if="isLoading" class="loading">Loading results...</li>
      <li
        v-for="(result, i) in results"
        v-else
        :key="i"
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
        @click="setResult(result)"
      >
        {{ result.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import debounce from 'lodash/debounce';

import { findEpiLocation, lookupEpiLocations } from '@/api/epi-basics.js';
import { colorsStore } from '@/stores/colorsStore';

const props = defineProps({
  selected: {
    type: Array,
    required: false,
    default: () => [],
  },
  toAdd: {
    type: Array,
    required: false,
    default: () => [],
  },
  isAsync: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['selected']);

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const store = colorsStore();

const isOpen = ref(false);
const results = ref([]);
const selectedItems = ref(null);
const search = ref('');
const isLoading = ref(false);
const isSelectAll = ref(false);
const arrowCounter = ref(0);
const lookupSubscription = ref(null);
const querySubscription = ref(null);

const lightColorScale = (location) => {
  const scale = store.getLightColor;
  return scale(location);
};

const colorScale = (location) => {
  const scale = store.getDarkColor;
  return scale(location);
};

const updateSelected = () => {
  lookupSubscription.value = lookupEpiLocations(
    apiUrl,
    props.selected,
  ).subscribe((results) => {
    selectedItems.value = results.map((d) => {
      return {
        label: d.label,
        location_id: d.location_id,
        addable: props.toAdd.includes(d.location_id),
        darkColor: colorScale(d.location_id),
        lightColor: lightColorScale(d.location_id),
      };
    });
  });
};

const updateChip = (item) => {
  if (item.addable) {
    emit('selected', props.selected.concat(item.location_id));
  } else {
    emit(
      'selected',
      props.selected.filter((d) => d !== item.location_id),
    );
  }
};

const onChange = () => {
  isSelectAll.value = false;
  querySubscription.value = findEpiLocation(apiUrl, search.value).subscribe(
    (response) => {
      results.value = response;
      isOpen.value = true;
    },
  );
};

const setResult = (result) => {
  props.selected.push(result.location_id);
  emit('selected', props.selected);
  search.value = '';
  isOpen.value = false;
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
  // Warn the parent that a change was made
  const result = results.value[arrowCounter.value]
    ? results.value[arrowCounter.value]
    : search.value;
  props.selected.push(result.location_id);
  emit('selected', props.selected);
  search.value = '';
  isOpen.value = false;
  arrowCounter.value = -1;
};

const onBackspace = () => {
  if (search.value === '') {
    search.value = props.selected.pop();
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
  //TODO: should confirm $el in composition API
  // if (!this.$el.contains(evt.target)) {
  //   this.isOpen = false;
  //   this.arrowCounter = -1;
  // }
};

watch(
  () => props.selected,
  (val, oldValue) => {
    updateSelected();
  },
  { deep: true },
);

//TODO: should check this again
// colorScale(val, oldValue) {
//   this.updateSelected();
// },

const debounceSearch = debounce(onChange, 250);

onMounted(() => {
  updateSelected();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);

  if (querySubscription.value) {
    querySubscription.value.unsubscribe();
  }

  if (lookupSubscription.value) {
    lookupSubscription.value.unsubscribe();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.chip {
  border: none !important;
}
</style>
