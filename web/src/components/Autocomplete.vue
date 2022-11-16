<template>
  <div class="autocomplete" style="background:white;">
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
      <li v-if="isLoading" class="loading">
        Loading results...
      </li>
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

<script>
import Vue from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimesCircle,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';
import debounce from 'lodash/debounce';

import { findEpiLocation, lookupEpiLocations } from '@/api/epi-basics.js';
import store from '@/store';

library.add(faTimesCircle, faPlusSquare);

export default Vue.extend({
  name: 'Autocomplete',
  components: {
    FontAwesomeIcon,
  },
  props: {
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
  },
  data() {
    return {
      isOpen: false,
      results: [],
      selectedItems: null,
      search: '',
      isLoading: false,
      isSelectAll: false,
      arrowCounter: 0,
      lookupSubscription: null,
      querySubscription: null,
    };
  },
  watch: {
    selected(val, oldValue) {
      this.updateSelected();
    },
    colorScale(val, oldValue) {
      this.updateSelected();
    },
  },
  created() {
    this.debounceSearch = debounce(this.onChange, 250);
  },
  mounted() {
    this.updateSelected();
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);

    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }

    if (this.lookupSubscription) {
      this.lookupSubscription.unsubscribe();
    }
  },
  methods: {
    updateSelected() {
      this.lookupSubscription = lookupEpiLocations(
        this.$apiurl,

        this.selected,
      ).subscribe((results) => {
        this.selectedItems = results.map((d) => {
          return {
            label: d.label,
            location_id: d.location_id,
            addable: this.toAdd.includes(d.location_id),
            darkColor: this.colorScale(d.location_id),
            lightColor: this.lightColorScale(d.location_id),
          };
        });
      });
    },
    lightColorScale(location) {
      const scale = store.getters['colors/getLightColor'];
      return scale(location);
    },
    colorScale(location) {
      const scale = store.getters['colors/getDarkColor'];
      return scale(location);
    },
    updateChip(item) {
      if (item.addable) {
        this.$emit('selected', this.selected.concat(item.location_id));
      } else {
        this.$emit(
          'selected',
          this.selected.filter((d) => d !== item.location_id),
        );
      }
    },
    onChange() {
      this.isSelectAll = false;
      this.querySubscription = findEpiLocation(
        this.$apiurl,

        this.search,
      ).subscribe((results) => {
        this.results = results;
        this.isOpen = true;
      });
    },
    setResult(result) {
      this.selected.push(result.location_id);
      this.$emit('selected', this.selected);
      this.search = '';
      this.isOpen = false;
    },
    onArrowDown(evt) {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      // Warn the parent that a change was made
      const result = this.results[this.arrowCounter]
        ? this.results[this.arrowCounter]
        : this.search;
      this.selected.push(result.location_id);
      this.$emit('selected', this.selected);
      this.search = '';
      this.isOpen = false;
      this.arrowCounter = -1;
    },
    onBackspace() {
      if (this.search === '') {
        this.search = this.selected.pop();
      }

      if (this.isSelectAll) {
        this.search = '';
        this.$emit('selected', []);
        this.isSelectAll = false;
      }
    },
    onSelectAll() {
      this.isSelectAll = true;
    },
    handleClickOutside(evt) {
      this.isSelectAll = false;
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.chip {
  border: none !important;
}
</style>
