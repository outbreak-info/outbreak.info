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

<script>
import Vue from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { timeFormat } from 'd3';

import { getPng } from '@/js/get_svg.js';

library.add(faCopy);

export default Vue.extend({
  name: 'DownloadReportData',
  components: {
    FontAwesomeIcon,
  },
  props: {
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
  },
  data() {
    return {
      showSnackbar: false,
      snackbarText: 'copying figure to the clipboard',
      copyThreshold: 9,
      sourceString: 'The GISAID Initiative',
    };
  },
  computed: {
    copyable() {
      return (
        this.numSvgs <= this.copyThreshold && typeof ClipboardItem == 'function'
      );
    },
    todayFormatted() {
      return this.formatDate();
    },
  },
  methods: {
    formatDate(formatString = '%d %b %Y') {
      const dateString = new Date();
      const formatDate = timeFormat(formatString);
      return formatDate(dateString);
    },
    copyPng() {
      this.showSnackbar = true;
      this.snackbarText = 'copying figure to the clipboard';
      this.$gtag.event('copy_vis', {
        event_category: `${this.dataType}_${this.figureRef}_vis`,
        event_label: `copying |${this.figureRef}| {vis} from [${this.$route.fullPath}]`,
      });

      getPng(
        `svg.${this.figureRef}`,
        this.sourceString,
        this.todayFormatted,
        this.isVertical,
        this.darkMode,
        null,
      )
        .then((msg) => {
          this.snackbarText = msg;
          setTimeout(() => {
            this.showSnackbar = false;
          }, 3000);
        })
        .catch((error) => {
          console.log(error);
          this.snackbarText = 'Error copying image';
          setTimeout(() => {
            this.showSnackbar = false;
          }, 3000);
          console.log('Error: in copying that image');
        });
    },
  },
});
</script>
