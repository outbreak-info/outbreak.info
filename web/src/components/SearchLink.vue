<template>
  <span>
    <span v-for="(item, idx) in data" class="text-dark" :key="idx">
      <router-link
        :to="{
          name: 'Resources',
          query: { q: searchStr(item), filter: filterField },
        }"
        :data-tippy-info="tooltipText(item)"
        class="search-link"
      >
        {{ item }}
      </router-link>
      <span v-if="idx < data.length - 1">,&nbsp;</span>
    </span>
  </span>
</template>

<script>
import tippy from 'tippy.js';
import 'tippy.js/themes/light.css';

export default {
  name: 'SearchLink',
  props: {
    data: Array,
    searchField: String,
    filterField: String,
    tooltipLabel: String,
  },
  mounted() {
    tippy('.search-link', {
      content: 'Loading...',
      maxWidth: '300px',
      placement: 'bottom',
      animation: 'fade',
      theme: 'light',
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      },
    });
  },
  methods: {
    searchStr(item) {
      return this.searchField ? `${this.searchField}:"${item}"` : item;
    },
    tooltipText(item) {
      return this.tooltipLabel
        ? `Search for ${item} ${this.tooltipLabel}`
        : `Search for ${item}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.bright a {
  color: saturate($clinical-trial-color, 20%) !important;
  text-decoration: underline;
  &:hover {
    color: darken($clinical-trial-color, 20%) !important;
  }
}
</style>
