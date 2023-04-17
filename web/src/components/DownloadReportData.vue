<template>
  <div
    class="d-flex align-items-center justify-content-end flex-grow-1"
    :class="{ 'w-100': fullWidth }"
  >
    <div v-if="copyable" class="btn ml-3 py-0 px-2 btn-main-outline">
      <font-awesome-icon :icon="['far', 'copy']" @click="copyPng" />
    </div>
    <!-- <DownloadData class="ml-3" id="download-btn" v-if="data" :type="reportType" :downloadLabel="downloadLabel" :figureRef="figureRef" :data="data" :sourceString="sourceString" :isVertical="isVertical" :darkMode="darkMode" /> -->

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

const props = defineProps({
  ids: Array,
  data: Array,
  dataType: String,
  reportType: {
    type: String,
    default: 'report',
  },
  numSvgs: {
    type: Number,
    default: 1,
  },
  isVertical: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
  downloadLabel: {
    type: String,
    default: 'vis & data',
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  figureRef: String,
});

// this.$route
const route = useRoute();

const showSnackbar = ref(false);
const snackbarText = ref('copying figure to the clipboard');
const copyThreshold = ref(9);
const sourceString = ref('The GISAID Initiative');

const copyable = computed(() => {
  return (
    props.numSvgs <= copyThreshold.value && typeof ClipboardItem == 'function'
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

  getPng(
    `svg.${props.figureRef}`,
    props.sourceString,
    todayFormatted.value,
    props.isVertical,
    props.darkMode,
    null,
  )
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
