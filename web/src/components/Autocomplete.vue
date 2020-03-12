<template>
<div class="autocomplete">
  <div :content="selected" class="autocomplete-input flex-column user-input-wrp">
    <div class="floating-label align-left" :class="[selected.length === 0 ? 'empty' : 'filled']">
      select locations
    </div>
    <div class="flex">
      <button class="chip" v-for="(item, idx) in selectedItems" :key="idx" :class="{ 'to-add': item.addable, 'all-selected': isSelectAll }" @click="updateChip(item)" v-bind:style="{ background: item.lightColor }">
        {{ item.label }}
        <font-awesome-icon class="remove-btn" :icon="['far', 'times-circle']" v-bind:style="{ color: item.darkColor }" v-if="!item.addable"/>
        <!-- <font-awesome-icon class="add-btn" :icon="['far', 'plus-square']" v-bind:style="{ color: item.darkColor }" v-if="item.addable" /> -->
      </button>
      <input type="text" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp" @keydown.enter="onEnter" @keydown.delete="onBackspace" @keydown.ctrl.65="onSelectAll" @keydown.meta.65="onSelectAll" />
    </div>
  </div>

  <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results">
    <li class="loading" v-if="isLoading">
      Loading results...
    </li>
    <li v-else v-for="(result, i) in results" :key="i" @click="setResult(result)" class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
      {{ result }}
    </li>
  </ul>
</div>
</template>

<script lang="ts">
// adapted from https://alligator.io/vuejs/vue-autocomplete-component/
import Vue from "vue";

// --- store / Vuex ---
import store from "@/store";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faTimesCircle, faPlusSquare
} from "@fortawesome/free-regular-svg-icons";

library.add(faTimesCircle, faPlusSquare);

export default Vue.extend({
  name: "Autocomplete",
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
    FontAwesomeIcon
  },
  data() {
    return {
      isOpen: false,
      results: [],
      search: "",
      isLoading: false,
      isSelectAll: false,
      arrowCounter: 0
    };
  },
  computed: {
    selectedItems: function() {
      return (this.selected.map(d => {
        return ({
          label: d,
          addable: this.toAdd.includes(d),
          darkColor: this.colorScale(d),
          lightColor: this.lightColorScale(d)
        })
      }))
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
    lightColorScale: function(location) {
      const scale = store.getters["colors/getLightColor"];
      return scale(location);
    },
    colorScale: function(location) {
      const scale = store.getters["colors/getDarkColor"];
      return scale(location);
    },
    updateChip(item) {
      if(item.addable){
      this.$emit(
        "selected",
        this.selected.concat(item.label)
      );} else {
        this.$emit(
          "selected",
          this.selected.filter(d => d !== item.label)
        );
      }
      // this.selected = this.selected.filter(d => d !== item);
    },
    onChange() {
      this.isSelectAll = false;

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
      this.results = this.items.filter(item => {
        return item.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      // this.$emit('input', result);
      this.selected.push(result);
      this.$emit("selected", this.selected);
      this.search = "";
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
      // Let's warn the parent that a change was made
      const result = this.results[this.arrowCounter] ?
        this.results[this.arrowCounter] :
        this.search;
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
.autocomplete {
    position: relative;
    max-width: 700px;
    margin-bottom: 0.5em;
}

.autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid $grey-40;
    background: $grey-30;
    box-shadow: 1px 1px 2px 2px $grey-alpha15;
    height: 120px;
    overflow: auto;
    width: 100%;
}

.autocomplete-result {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
    background-color: $primary-color;
    color: white;
}

.autocomplete-input {
    border: 1px solid $grey-40;
    border-radius: 0.25em;
    padding: 0.5em;
}

input {
    flex-grow: 2;
    border: none;
    font-size: 1em;
}

input:focus {
    // removing the input focus blue box.
    outline: none;
}

// placeholder
.floating-label {
    margin-bottom: 0.25em;
    text-transform: uppercase;
    flex-grow: 1;
    color: $grey-60;
}

.floating-label.empty {
    font-size: 1em;
    transition: 0.5s ease all;
}

.floating-label.filled {
    font-size: 0.7em;
    transition: 0.5s ease all;
}
</style>
