<template>
  <form>
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text bg-grey text-sec border-0" id="sb"
          ><i class="fas fa-search"></i
        ></span>
      </div>
      <input
        id="sBar"
        class="form-control border-0"
        placeholder="Search"
        aria-label="search"
        aria-describedby="sb"
        type="text"
        v-model="search"
        @input="onChange"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.enter="onEnter"
        @keydown.delete="onBackspace"
        @keydown.ctrl.65="onSelectAll"
        @keydown.meta.65="onSelectAll"
      />
      <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results bg-dark text-light">
        <li class="loading" v-if="isLoading">
          Loading results...
        </li>
        <li
          v-else
          v-for="(result, i) in results"
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

<script lang="ts">
// adapted from https://alligator.io/vuejs/vue-autocomplete-component/
import Vue from "vue";
import { mapState } from "vuex";

// --- store / Vuex ---
import store from "@/store";

export default Vue.extend({
  name: "SearchBar",
  props: {
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    selected: {
      type: Array,
      required: false,
      default: () => []
    },
    toAdd: {
      type: Array,
      required: false,
      default: () => []
    },
    isAsync: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
  },
  data() {
    return {
      isOpen: false,
      results: [],
      search: "",
      isLoading: false,
      arrowCounter: 0
    };
  },
  computed: {
    ...mapState("epidata", ["allPlaces"]),
    selectedItems: function() {
      return this.selected.map(d => {
        return {
          label: d,
          addable: this.toAdd.includes(d),
          darkColor: this.colorScale(d),
          lightColor: this.lightColorScale(d)
        };
      });
    }
  },
  watch: {
    items: function(val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    onChange() {
      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let's  our flat array
        this.filterResults();
        this.isOpen = true;
      }
    },
    filterResults() {
      // first uncapitalize all the things
      this.results = this.allPlaces.filter(item => {
        return item.label.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.selected.push(result);
      this.search = "";
      this.isOpen = false;
      this.$router.replace(`/epidemiology?location=${this.selected.map(d => d.id).join(";")}`)
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
      // Let's warn the parent that a change was made
      const result = this.results[this.arrowCounter]
        ? this.results[this.arrowCounter]
        : this.search;
      // this.$emit('input', result);
      this.selected.push(result);
      this.$emit("input", this.selected);
      this.search = "";
      this.isOpen = false;
      this.arrowCounter = -1;
    },
    onBackspace() {
      if (this.search === "") {
        this.search = this.selected.pop();
      }

      if (this.isSelectAll) {
        this.search = "";
        this.$emit("selected", []);
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
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

</style>
