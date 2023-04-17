<template>
  <span>
    <span v-for="(item, idx) in data" :key="idx" class="text-dark">
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

<script setup>
import { onMounted } from 'vue';
import tippy from 'tippy.js';

import 'tippy.js/themes/light.css';

const props = defineProps({
  data: Array,
  searchField: String,
  filterField: String,
  tooltipLabel: String,
});

onMounted(() => {
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
});

const searchStr = (item) => {
  return props.searchField ? `${props.searchField}:"${item}"` : item;
};

const tooltipText = (item) => {
  return props.tooltipLabel
    ? `Search for ${item} ${props.tooltipLabel}`
    : `Search for ${item}`;
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
