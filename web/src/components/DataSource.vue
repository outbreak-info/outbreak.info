<template>
  <div class="source my-3 d-flex align-items-center">
    <small>
      Source:
      <span v-for="(source, idx) in filteredSources" :key="idx">
        <a :href="source.url" target="_blank" rel="noreferrer">
          {{ source.name }}
          <span v-if="source.scope">({{ source.scope }})</span>
        </a>
        <span v-if="idx < filteredSources.length - 1">;</span>
      </span>
      , updated daily.
      <router-link :to="{ name: 'Sources' }" class="mx-2">
        Read more
      </router-link>
    </small>

    <!-- date updated -->
    <DataUpdated />
    <div class="btn ml-3 py-0 px-2 btn-main-outline">
      <font-awesome-icon
        v-if="copyable"
        :icon="['far', 'copy']"
        @click="copyPng"
      />
    </div>
    <DownloadData
      v-if="data"
      id="download-btn"
      class="ml-3"
      :type="dataType"
      :figureRef="figureRef"
      :data="data"
      :sourceString="sourceString"
    />

    <p :class="{ snackbar: true, show: showSnackbar }">
      {{ snackbarText }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { event } from 'vue-gtag';
import { timeFormat } from 'd3-time-format';

import { getPng } from '@/js/get_svg.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

const DownloadData = lazyLoad('DownloadData');
const DataUpdated = lazyLoad('DataUpdated');

const props = defineProps({
  ids: Array,
  data: Array,
  dataType: String,
  numSvgs: {
    type: Number,
    default: 1,
  },
  figureRef: String,
});

// instead of this.$route
const route = useRoute();

const showSnackbar = ref(false);
const snackbarText = ref('copying figure to the clipboard');
const copyThreshold = ref(9);

const store = adminStore();

const filteredSources = computed(() => {
  if (props.ids && props.ids.length) {
    return store.$state.sources.filter((d) => props.ids.includes(d.id));
  } else {
    return store.$state.sources;
  }
});

const copyable = computed(() => {
  return (
    props.numSvgs <= copyThreshold.value && typeof ClipboardItem == 'function'
  );
});

const sourceString = computed(() => {
  return (
    filteredSources.value
      .map((d) => (d.scope ? `${d.name} (${d.scope})` : `${d.name}`))
      .join('; ') + ', updated daily'
  );
});

const todayFormatted = computed(() => {
  return formatDate();
});

const formatDate = (formatString = '%d %b %Y') => {
  const dateString = new Date();
  const formatDate = timeFormat(formatString);
  return formatDate(dateString);
};

const copyPng = () => {
  showSnackbar.value = true;
  snackbarText.value = 'copying figure to the clipboard';
  event('copy_vis', {
    event_category: `${props.dataType}_${props.figureRef}_vis`,
    event_label: `copying |${props.figureRef}| {vis} from [${route.fullPath}]`,
  });

  getPng(`svg.${props.figureRef}`, sourceString.value, todayFormatted.value)
    .then((msg) => {
      snackbarText.value = msg;
      setTimeout(() => {
        showSnackbar.value = false;
      }, 3000);
    })
    .catch((error) => {
      console.log(error);
      snackbarText.value = 'Error copying image';
      setTimeout(() => {
        showSnackbar.value = false;
      }, 3000);
      console.log('Error: in copying that image');
    });
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped></style>
