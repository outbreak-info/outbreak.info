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
        @keydown.ctrl.65="onSelectAll"
        @keydown.meta.65="onSelectAll"
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

<script>
// adapted from https://alligator.io/vuejs/vue-autocomplete-component/
import Vue from 'vue';
import { mapState } from 'vuex';

import { getLocations } from '@/api/epi-basics.js';

export default Vue.extend({
  name: 'SearchBar',
  components: {},
  props: {
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
  },
  data() {
    return {
      isOpen: false,
      results: [],
      search: '',
      selected: null,
      isLoading: false,
      arrowCounter: 0,
    };
  },
  computed: {
    ...mapState('geo', ['allPlaces']),
  },
  watch: {
    items(val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    },
  },
  mounted() {
    getLocations(this.$apiurl).subscribe((_) => null);
    document.addEventListener('click', this.handleClickOutside, {
      passive: true,
    });
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    onChange() {
      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let us  our flat array
        this.filterResults();
        this.isOpen = true;
      }
    },
    filterResults() {
      // first uncapitalize all the things
      this.results = this.allPlaces.filter((item) => {
        return item.label.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.selected = result;
      this.isOpen = false;
      if (this.routeTo) {
        this.search = '';
        this.$router.push({
          path: this.routeTo,
          query: {
            location: this.selected.id,
          },
        });
      } else {
        this.search = this.selected.label;
        this.$emit('location', this.selected.id);
      }
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
      // // Let's warn the parent that a change was made
      // this.$emit('input', result);
      this.selected = this.results[this.arrowCounter]
        ? this.results[this.arrowCounter]
        : this.search;
      this.$emit('input', this.selected);
      this.search = '';
      this.isOpen = false;
      this.arrowCounter = -1;
      if (this.routeTo && this.routeTo !== '') {
        this.$router.push({
          path: this.routeTo,
          query: {
            location: this.selected.id,
          },
        });
      } else {
        this.$emit('location', this.selected.id);
      }
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
<style lang="scss" scoped></style>
