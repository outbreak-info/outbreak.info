<template>
  <div :class="wrapperClass">
    <div class="dropdown">
      <input
        :class="{ 'form-control': isStandalone }"
        :disabled="disabled"
        type="text"
        v-model="selected"
        :placeholder="placeholder"
        @keydown.enter="enter"
        @keydown.down="down"
        @keydown.up="up"
        @input="debounceSearch"
      />
      <div
        class="dropdown-menu overflow-auto"
        :class="{ show: isOpen }"
        style="width:100%"
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

<script>
// cribbed from https://medium.com/@fareez_ahamed/make-your-own-autocomplete-component-quickly-using-vue-js-21a642e8b140

import debounce from 'lodash/debounce';

export default {
  name: 'TypeaheadSelect',
  props: {
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
  },
  data() {
    return {
      isOpen: false,
      current: 0,
      selected: null,
      matches: [],
    };
  },
  watch: {
    selectedValue() {
      this.selected = this.selectedValue
        ? typeof this.selectedValue == 'string'
          ? this.selectedValue
          : this.selectedValue[this.labelVariable]
        : null;
    },
  },
  created() {
    this.debounceSearch = debounce(this.change, 250);
  },
  methods: {
    enter() {
      this.selected = this.matches[this.current];
      this.isOpen = false;
      this.$emit('selected', this.selected);
      if (this.removeOnSelect || !this.selected) {
        this.selected = null; // reset
      } else {
        this.selected = this.selected[this.labelVariable];
      }
    },

    // When up pressed while suggestions are open
    up() {
      if (this.current > 0) this.current--;
    },

    // When up pressed while suggestions are open
    down() {
      if (this.current < this.matches.length - 1) this.current++;
    },

    // For highlighting element
    isActive(index) {
      return index === this.current;
    },

    //When the user changes input
    change() {
      if (this.selected.length > 0) {
        this.querySubscription = this.queryFunction(
          this.apiUrl,
          this.selected,
        ).subscribe((results) => {
          this.matches = results;

          if (this.isOpen === false) {
            this.isOpen = true;
            this.current = 0;
          }
        });
      } else {
        this.matches = [];
        this.isOpen = false;
        this.current = 0;
        this.$emit('selected', null);
      }
    },
    //When one of the suggestion is clicked
    suggestionClick(index) {
      this.selected = this.matches[index];
      this.$emit('selected', this.selected);
      this.isOpen = false;
      if (this.removeOnSelect || !this.selected) {
        this.selected = null; // reset
      } else {
        this.selected = this.selected[this.labelVariable];
      }
    },
  },
};
</script>
