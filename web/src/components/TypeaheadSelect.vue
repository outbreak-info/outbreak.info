<template>
  <div :class="wrapperClass">
    <div class="dropdown">
      <input
        v-model="selected"
        :class="{ 'form-control': isStandalone }"
        :disabled="disabled"
        type="text"
        :placeholder="placeholder"
        @keydown.enter="enter"
        @keydown.down="down"
        @keydown.up="up"
        @input="debounceSearch"
      />
      <div
        class="dropdown-menu overflow-auto"
        :class="{ show: isOpen }"
        style="width: 100%"
      >
        <a
          v-for="(suggestion, idx) in matches"
          :key="idx"
          class="dropdown-item"
          :class="{ active: isActive(idx) }"
          @click="suggestionClick(idx)"
        >
          {{ suggestion[labelVariable] }}
          <span v-if="suggestion.total_count">
            ({{ suggestion.total_count.toLocaleString() }}
            <span v-if="totalLabel">{{ totalLabel }}</span>
            )
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
// cribbed from https://medium.com/@fareez_ahamed/make-your-own-autocomplete-component-quickly-using-vue-js-21a642e8b140
import debounce from 'lodash/debounce';

const props = defineProps({
  queryFunction: Function,
  apiUrl: String,
  placeholder: String,
  totalLabel: String,
  selectedValue: [String, Object],
  labelVariable: {
    type: String,
    default: 'name',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  removeOnSelect: {
    type: Boolean,
    default: true,
  },
  isStandalone: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['selected']);

const isOpen = ref(false);
const current = ref(0);
const selected = ref(null);
const matches = ref([]);
const querySubscription = ref(null);

watch(
  () => props.selectedValue,
  () => {
    selected.value = props.selectedValue
      ? typeof props.selectedValue == 'string'
        ? props.selectedValue
        : props.selectedValue[props.labelVariable]
      : null;
  },
  { deep: true },
);

const enter = () => {
  selected.value = matches.value[current.value];
  isOpen.value = false;
  emit('selected', selected.value);
  if (props.removeOnSelect || !selected.value) {
    selected.value = null; // reset
  } else {
    selected.value = selected.value[props.labelVariable];
  }
};

// When up pressed while suggestions are open
const up = () => {
  if (current.value > 0) current.value--;
};

// When up pressed while suggestions are open
const down = () => {
  if (current.value < matches.value.length - 1) current.value++;
};

// For highlighting element
const isActive = (index) => {
  return index === current.value;
};

//When the user changes input
const change = () => {
  if (selected.value.length > 0) {
    querySubscription.value = props
      .queryFunction(props.apiUrl, selected.value)
      .subscribe((results) => {
        if (results.length > 10) {
          matches.value = results.slice(0, 10);
        } else {
          matches.value = results;
        }
        if (isOpen.value === false) {
          isOpen.value = true;
          current.value = 0;
        }
      });
  } else {
    matches.value = [];
    isOpen.value = false;
    current.value = 0;
    emit('selected', null);
  }
};

//When one of the suggestion is clicked
const suggestionClick = (index) => {
  selected.value = matches.value[index];
  emit('selected', selected.value);
  isOpen.value = false;
  if (props.removeOnSelect || !selected.value) {
    selected.value = null; // reset
  } else {
    selected.value = selected.value[props.labelVariable];
  }
};

const debounceSearch = debounce(change, 250);
</script>
