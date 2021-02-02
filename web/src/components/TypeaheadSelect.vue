<template>
<div class="w-100">
  <div class="dropdown">
    <input class="form-control" type="text" v-model="selected" :placeholder="placeholder" @keydown.enter='enter' @keydown.down='down' @keydown.up='up' @input='debounceSearch' />
    <div class="dropdown-menu" :class="{'show':isOpen}" style="width:100%">
      <a href="#" v-for="(suggestion, idx) in matches" :key="idx" class="dropdown-item" :class="{'active': isActive(idx)}" @click="suggestionClick(idx)">
        {{ suggestion.name }} ({{ suggestion.total_count.toLocaleString() }})</a>
    </div>
  </div>

</div>
</template>


<script>
// cribbed from https://medium.com/@fareez_ahamed/make-your-own-autocomplete-component-quickly-using-vue-js-21a642e8b140

import debounce from "lodash/debounce";

export default {
  name: "TypeaheadSelect",
  props: {
    queryFunction: Function,
    apiUrl: String,
    placeholder: String
  },
  created: function() {
    this.debounceSearch = debounce(this.change, 250);
  },
  data() {
    return {
      isOpen: false,
      current: 0,
      selected: null,
      matches: []
    }
  },
  methods: {
    enter() {
      this.selected = this.matches[this.current];
      this.isOpen = false;
      this.$emit("selected", this.selected);
      this.selected = null; // reset
    },

    // When up pressed while suggestions are open
    up() {
      if (this.current > 0)
        this.current--;
    },

    // When up pressed while suggestions are open
    down() {
      if (this.current < this.matches.length - 1)
        this.current++;
    },

    // For highlighting element
    isActive(index) {
      return index === this.current;
    },

    //When the user changes input
    change() {
      this.querySubscription = this.queryFunction(this.apiUrl, this.selected).subscribe(results => {
        this.matches = results;

        if (this.isOpen == false) {
          this.isOpen = true;
          this.current = 0;
        }
      })

    },
    //When one of the suggestion is clicked
    suggestionClick(index) {
      this.selected = this.matches[index];
      this.$emit("selected", this.selected);
      this.isOpen = false;
      this.selected = null; // reset
    }
  }
}
</script>
